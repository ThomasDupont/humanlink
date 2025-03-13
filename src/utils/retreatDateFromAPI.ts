import { OfferWithMileStonesAndMilestonePrice } from '@/types/Offers.type'
import { CreateOfferReturnType, GetConversationReturnType } from './trpc'
import { MessageWithMaybeOffer } from '@/types/Message.type'

export const offerFromApiToLocal = (
  offer: CreateOfferReturnType
): OfferWithMileStonesAndMilestonePrice => {
  const treatedOffer: OfferWithMileStonesAndMilestonePrice = {
    ...offer,
    createdAt: new Date(offer.createdAt),
    deadline: new Date(offer.deadline),
    paidDate: offer.paidDate ? new Date(offer.paidDate) : null,
    terminatedAt: offer.terminatedAt ? new Date(offer.terminatedAt) : null,
    milestones: offer.milestone.map(milestone => ({
      ...milestone,
      createdAt: new Date(milestone.createdAt),
      deadline: new Date(milestone.deadline),
      terminatedAt: milestone.terminatedAt ? new Date(milestone.terminatedAt) : null,
      validatedAt: milestone.validatedAt ? new Date(milestone.validatedAt) : null,
      priceMilestone: {
        ...milestone.priceMilestone,
        createdAt: new Date(milestone.priceMilestone.createdAt)
      }
    }))
  }

  return treatedOffer
}

export const messageFromApiToLocal = ({  offer, ...message }: GetConversationReturnType): MessageWithMaybeOffer => {
  const treatedMessage: MessageWithMaybeOffer = {
    ...message,
    createdAt: new Date(message.createdAt),
    readAt: message.readAt ? new Date(message.readAt) : null,
    ...(offer && {
      offer: {
        ...offer,
        createdAt: new Date(offer.createdAt),
        deadline: new Date(offer.deadline),
        paidDate: offer.paidDate ? new Date(offer.paidDate) : null,
        terminatedAt: offer.terminatedAt ? new Date(offer.terminatedAt) : null,
        milestones: offer.milestone.map(milestone => ({
          ...milestone,
          createdAt: new Date(milestone.createdAt),
          deadline: new Date(milestone.deadline),
          validatedAt: milestone.validatedAt ? new Date(milestone.validatedAt) : null,
          terminatedAt: milestone.terminatedAt ? new Date(milestone.terminatedAt): null,
          priceMilestone: {
            ...milestone.priceMilestone,
            createdAt: new Date(milestone.priceMilestone.createdAt)
          }
        }))
      }
    })
  }

  return treatedMessage
}
