import { Price, PrismaClient, Service } from '@prisma/client'
import { ServiceWithPrice, ServiceWithPriceWithoutCreatedDateAndId } from '@/types/Services.type'

export const servicesCrud = (prisma: PrismaClient) => {
  const createService = async (service: ServiceWithPriceWithoutCreatedDateAndId) => {
    const { prices, ...rawService } = service
    return await prisma.service.create({
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
  }

  const updateService = async (service: Omit<Service, 'createdAt'>, prices?: Price[]) => {
    const [updatedService, ...updatedPrices] = await prisma.$transaction([
      prisma.service.update({
        where: { id: service.id, userId: service.userId },
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

    return serviceWithPrice
  }

  const deleteAServiceById = async (id: number) => {
    await prisma.service.delete({
      where: { id }
    })
  }

  const getServiceById = (id: number): Promise<ServiceWithPrice | null> => {
    return prisma.service.findUnique({
      where: { id },
      include: {
        prices: true
      }
    })
  }

  const getuserServices = (userId: number): Promise<ServiceWithPrice[]> => {
    return prisma.service.findMany({
      where: { userId },
      include: {
        prices: true
      }
    })
  }

  return { createService, updateService, getServiceById, deleteAServiceById, getuserServices }
}
