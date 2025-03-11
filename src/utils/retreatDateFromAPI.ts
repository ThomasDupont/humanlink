import { OfferWithMileStonesAndMilestonePrice } from '@/types/Offers.type'
import { CreateOfferReturnType } from './trpc'

export const offerFromApiToLocal = (
  offer: CreateOfferReturnType
): OfferWithMileStonesAndMilestonePrice => {
  const treatedOffer: OfferWithMileStonesAndMilestonePrice = {
    ...offer,
    createdAt: new Date(offer.createdAt),
    deadline: new Date(offer.deadline),
    paidDate: null,
    terminatedAt: null,
    milestones: offer.milestone.map(milestone => ({
      ...milestone,
      createdAt: new Date(milestone.createdAt),
      deadline: new Date(milestone.deadline),
      terminatedAt: null,
      validatedAt: null,
      priceMilestone: {
        ...milestone.priceMilestone,
        createdAt: new Date(milestone.priceMilestone.createdAt)
      }
    }))
  }

  return treatedOffer
}
