import { OfferWithMileStonesAndMilestonePriceWithoutIdsAndCreatedAt } from '@/types/Offers.type'
import { PrismaClient } from '@prisma/client'

export const offersCrud = (prisma: PrismaClient) => {
  const createAnOffer = (input: OfferWithMileStonesAndMilestonePriceWithoutIdsAndCreatedAt) => {
    const { milestones, ...offer } = input
    return prisma.offer.create({
      data: {
        ...offer,
        Milestone: {
          create: milestones.map(milestone => ({
            ...milestone,
            PriceMilestone: {
              create: milestone.PriceMilestone
            }
          }))
        }
      },
      include: {
        Milestone: {
          include: {
            PriceMilestone: true
          }
        }
      }
    })
  }

  return { createAnOffer }
}
