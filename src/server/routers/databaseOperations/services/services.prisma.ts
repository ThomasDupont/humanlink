import { Price, PrismaClient, Service } from '@prisma/client'
import { DeleteRecord, Sync } from '../sync/sync'

type ServiceWithPrice = Service & {
  prices: Price[]
}
export const servicesCrud = (prisma: PrismaClient, sync: Sync, deleteRecord: DeleteRecord) => {
  const createService = async (service: Omit<ServiceWithPrice, 'id'>) => {
    const { prices, ...rawService } = service
    const insertedService = await prisma.service.create({
      data: {
        ...rawService,
        prices: {
          create: prices
        }
      },
      include: {
        prices: true
      }
    })

    await sync(insertedService)

    return insertedService
  }

  const updateService = async (service: Service, prices?: Price[]) => {
    const [updatedService, ...updatedPrices] = await prisma.$transaction([
      prisma.service.update({
        where: { id: service.id },
        data: service
      }),
      ...(prices?.map(price =>
        prisma.price.update({
          where: { id: price.id },
          data: price
        })
      ) ?? [])
    ])

    const serviceWithPrice: ServiceWithPrice = {
      ...updatedService,
      prices: updatedPrices
    }

    await sync(serviceWithPrice)

    return serviceWithPrice
  }

  const deleteAServiceById = async (id: number) => {
    await prisma.service.delete({
      where: { id }
    })

    await deleteRecord(id)
  }

  const getServiceById = (id: number): Promise<ServiceWithPrice | null> => {
    return prisma.service.findUnique({
      where: { id },
      include: {
        prices: true
      }
    })
  }

  return { createService, updateService, getServiceById, deleteAServiceById }
}
