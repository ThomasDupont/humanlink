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

  const getAnOfferById = (id: number) => {
    return prisma.offer.findUnique({
      where: { id },
      include: {
        milestone: {
          include: {
            priceMilestone: true
          }
        }
      }
    })
  }

  const acceptOffer = (id: number, userIdReceiver: number) => {
    return prisma.offer.update({
      where: { id, userIdReceiver },
      data: {
        isAccepted: true,
        acceptedAt: new Date()
      }
    })
  }

  return { createAnOffer, getAnOfferById, acceptOffer }
}
