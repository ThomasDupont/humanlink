import { Milestone, Offer, PriceMilestone } from '@prisma/client'

export type OfferWithMileStonesAndMilestonePriceWithoutIdsAndCreatedAt = Omit<
  Offer,
  'id' | 'createdAt'
> & {
  milestones: (Omit<Milestone, 'id' | 'createdAt' | 'offerId' | 'priceMilestoneId' | ''> & {
    priceMilestone: Omit<PriceMilestone, 'id' | 'createdAt'>
  })[]
}

export type OfferWithMileStonesAndMilestonePrice = Offer & {
  milestones: (Milestone & {
    priceMilestone: PriceMilestone
  })[]
}
