import { removeHtmlTags } from '@/utils/cleanHtmlTag'
import { Price, Service } from '@prisma/client'
import { AxiosError, AxiosInstance } from 'axios'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

export const syncElastic = (elastic: AxiosInstance) => {
  const sync = async ({ id, ...service }: Service & { prices: Price[] }) => {
    const request = {
      doc: {
        ...service,
        fulltext: removeHtmlTags(DOMPurify(new JSDOM('<!DOCTYPE html>').window))(
          `${service.title} ${service.descriptionShort} ${service.description}`
        )
      },
      doc_as_upsert: true
    }

    await elastic.post(`/services/_update/${id}`, request).catch((e: AxiosError) => {
      console.error(e.response?.data)

      throw e
    })
  }

  const deleteRecord = async (id: number) => {
    await elastic.delete(`/services/_doc/${id}`).catch((e: AxiosError) => {
      if (e.status !== 404) {
        throw e
      }
    })
  }

  return { sync, deleteRecord }
}
