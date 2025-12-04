import { Schema } from 'effect'

export const offerId = Schema.Number.pipe(Schema.brand('OfferId'))
export const userId = Schema.Number.pipe(Schema.brand('UserId'))
export const milestoneId = Schema.Number.pipe(Schema.brand('MilestoneId'))
export const balanceId = Schema.Number.pipe(Schema.brand('BalanceId'))
export const discountId = Schema.Number.pipe(Schema.brand('DiscountId'))

export type Offerid = typeof offerId
export type UserId = typeof userId
export type BalanceId = typeof balanceId
