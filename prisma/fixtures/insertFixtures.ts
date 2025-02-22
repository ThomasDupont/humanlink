/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import services from './services'
import users from './users'
import prices from './prices'
import { deleteRecord, sync } from '@/server/routers/databaseOperations/sync/sync'

const prisma = new PrismaClient().$extends(withAccelerate())

async function main() {
  const servicesWithPrice = services.map((service, index) => {
    const { index: i, ...rawPrice } = prices[index]

    return {
      ...service,
      prices: { create: rawPrice }
    }
  })

  for (let i = 0; i < users.length; i++) {
    const user = users[i]

    const prismaUser = await prisma.user
      .delete({
        where: {
          email: user.email
        },
        include: {
          services: true
        }
      })
      .catch(() => {
        console.error(`Can't find item with id ${user.email}`)

        return null
      })

    if (prismaUser) {
      for (const serviceElement of prismaUser.services) {
        await deleteRecord(serviceElement.id)
      }
    }

    const servicesOfUser = servicesWithPrice
      .filter(service => service.index === i)
      .map(({ index, ...raw }) => raw)

    const enrichedUser = {
      ...user,
      services: { create: servicesOfUser }
    }

    const insertedUser = await prisma.user.create({
      data: enrichedUser,
      include: {
        services: {
          include: {
            prices: true
          }
        }
      }
    })

    console.log(`Inserted user whith ID : ${insertedUser.id}`)

    for (const serviceElement of insertedUser.services) {
      await sync(serviceElement)
      console.log(`Sync done with elastic for ${serviceElement.id}`)
    }
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
