/* eslint-disable @typescript-eslint/no-explicit-any */
import { elastic } from '@/server/routers/searchService/elasticClient'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { removeHtmlTags } from '@/utils/cleanHtmlTag'
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { AxiosError } from 'axios'

const prisma = new PrismaClient().$extends(withAccelerate())

async function main() {
  const take = 100
  let skip = 0
  let count = take

  await elastic.delete('/services').catch(() => {})
  await elastic.put('/services')

  while (count === take) {
    const services = await prisma.service.findMany({
      take,
      skip,
      include: {
        prices: true
      }
    })

    let bulkString = ''

    services.forEach(({ id, ...service }) => {
      bulkString += JSON.stringify({ index: { _index: 'services', _id: id } }) + '\n'
      bulkString +=
        JSON.stringify({
          ...service,
          fulltext: removeHtmlTags(DOMPurify(new JSDOM('<!DOCTYPE html>').window))(
            `${service.title} ${service.descriptionShort} ${service.description}`
          )
        }) + '\n'
    })

    await elastic
      .post('/_bulk', bulkString, {
        headers: { 'Content-Type': 'application/x-ndjson' }
      })
      .catch((e: AxiosError) => console.error(e.response?.data))

    count = services.length
    skip += services.length
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
  })
