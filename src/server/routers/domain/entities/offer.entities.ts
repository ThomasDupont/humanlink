import { Schema } from 'effect'
import { milestoneId, offerId, userId } from './ids'

export const validOfferForRendering = Schema.Struct({
  id: offerId,
  userId,
  userIdReceiver: userId,
  isAccepted: Schema.Literal(true),
  milestone: Schema.Array(
    Schema.Struct({
      id: milestoneId
    })
  )
}).pipe(Schema.brand('ValidOfferForRendering'))

export type ValidOfferForRendering = Schema.Schema.Type<typeof validOfferForRendering>

export const acceptedAndTerminatedOffer = Schema.Struct({
  id: offerId,
  userId,
  userIdReceiver: userId,
  isAccepted: Schema.Literal(true),
  isTerminated: Schema.Literal(true),
  milestone: Schema.Array(
    Schema.Struct({
      id: milestoneId,
      priceMilestone: Schema.Struct({
        number: Schema.Number
      })
    })
  )
}).pipe(Schema.brand('AcceptedAndTerminatedOffer'))

export type AcceptedAndTerminatedOffer = Schema.Schema.Type<typeof acceptedAndTerminatedOffer>
