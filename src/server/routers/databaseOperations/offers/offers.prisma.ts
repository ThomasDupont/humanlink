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

  const getAnAcceptedAndTerminatedOfferByIdAndReceiverId = (id: number, userIdReceiver: number) => {
    return prisma.offer.findUnique({
      where: { id, userIdReceiver, isAccepted: true, isTerminated: true },
      include: {
        milestone: {
          include: {
            priceMilestone: true
          }
        }
      }
    })
  }

  const listConcernOffers = (userId: number) => {
    return prisma.offer.findMany({
      where: {
        OR: [{ userId }, { userIdReceiver: userId }],
        isAccepted: true
      },
      orderBy: {
        id: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            image: true,
            jobTitle: true
          }
        },
        userReceiver: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            image: true,
            jobTitle: true
          }
        },
        milestone: {
          include: {
            priceMilestone: true
          }
        }
      }
    })
  }

  const getAnOfferByCreatorId = (offerId: number, userId: number) => {
    return prisma.offer.findUnique({
      where: {
        id: offerId,
        userId
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

  const getOfferDetailById = (offerId: number) => {
    return prisma.offer.findUnique({
      where: {
        id: offerId
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            image: true,
            jobTitle: true
          }
        },
        userReceiver: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            image: true,
            jobTitle: true
          }
        },
        milestone: {
          include: {
            priceMilestone: true
          }
        }
      }
    })
  }

  const closeOffer = (offerId: number, userId: number) => {
    return prisma.offer.update({
      where: { id: offerId, userId },
      data: {
        isTerminated: true,
        terminatedAt: new Date()
      }
    })
  }

  const acceptOfferRenderings = (offerId: number, userId: number) => {
    return prisma.offer.update({
      where: { id: offerId, userIdReceiver: userId },
      data: {
        isPaid: true,
        paidDate: new Date()
      }
    })
  }

  return {
    createAnOffer,
    getAnAcceptedAndTerminatedOfferByIdAndReceiverId,
    getAnOfferByIdAndReceiverId,
    listConcernOffers,
    getOfferDetailById,
    getAnOfferByCreatorId,
    closeOffer,
    acceptOfferRenderings
  }
}
