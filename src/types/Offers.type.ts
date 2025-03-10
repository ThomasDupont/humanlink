import { Milestone, Offer, PriceMilestone } from '@prisma/client'

export type OfferWithMileStonesAndMilestonePriceWithoutIdsAndCreatedAt = Omit<
  Offer,
  'id' | 'createdAt'
> & {
  milestones: (Omit<Milestone, 'id' | 'createdAt' | 'offerId'> & {
    PriceMilestone: Omit<PriceMilestone, 'id' | 'createdAt' | 'milestoneId'>
  })[]
}

export type OfferWithMileStonesAndMilestonePrice = Offer & {
  milestones: (Milestone & {
    priceMilestone: PriceMilestone
  })[]
}
