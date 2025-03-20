import { OfferWithMileStonesAndMilestonePriceWithoutIdsAndCreatedAt } from '@/types/Offers.type'
import { PrismaClient } from '@prisma/client'

export const offersCrud = (prisma: PrismaClient) => {
  const createAnOffer = (input: OfferWithMileStonesAndMilestonePriceWithoutIdsAndCreatedAt) => {
    const { milestones, ...offer } = input
    return prisma.offer.create({
      data: {
        ...offer,
        milestone: {
          create: milestones.map(milestone => ({
            ...milestone,
            priceMilestone: {
              create: milestone.priceMilestone
            }
          }))
        }
      },
      include: {
        milestone: {
          include: {
            priceMilestone: true
          }
        }
      }
    })
  }

  const getAnOfferByIdAndReceiverId = (id: number, userIdReceiver: number) => {
    return prisma.offer.findUnique({
      where: { id, userIdReceiver },
      include: {
        milestone: {
          include: {
            priceMilestone: true
          }
        }
      }
    })
  }

  return { createAnOffer, getAnOfferByIdAndReceiverId }
}
