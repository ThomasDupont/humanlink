import { Effect as T, Schema, Context, Layer } from 'effect'
import {
  AcceptedAndTerminatedOffer,
  acceptedAndTerminatedOffer,
  ValidOfferForRendering,
  validOfferForRendering
} from '../entities/offer.entities'
import { effectOfferOperations, OfferOperations } from '@/server/databaseOperations/prisma.provider'
import { ParseError } from 'effect/ParseResult'
import { CustomError } from '../error'

type GetOffer = { offerId: number; userId: number }
const OfferError = {
  _tag: 'OfferError',
  of: (tag: string) => (e: ParseError) =>
    new CustomError({
      code: 'NOT_FOUND',
      cause: tag,
      message: `${tag} ${e.message}`,
      detailedError: {},
      clientMessage: 'offer_or_milestone_not_valid_for_user'
    })
}

const getValidOfferForRendering = ({ offerId, userId }: GetOffer) =>
  T.gen(function* () {
    const offerOperations = yield* OfferOperations

    return yield* T.tryPromise({
      try: () => offerOperations.getAnOfferByCreatorId(offerId, userId),
      catch: () => new Error('not found')
    }).pipe(
      Schema.decodeUnknown(validOfferForRendering),
      T.mapError(OfferError.of('invalid_offer'))
    )
  })

const getAcceptedAndTerminatedOffer = ({ offerId, userId }: GetOffer) =>
  T.gen(function* () {
    const offerOperations = yield* OfferOperations

    return yield* T.tryPromise({
      try: () => offerOperations.getAnAcceptedAndTerminatedOfferByIdAndReceiverId(offerId, userId),
      catch: () => new Error('not found')
    }).pipe(
      Schema.decodeUnknown(acceptedAndTerminatedOffer),
      T.mapError(OfferError.of('invalid_offer'))
    )
  })

export class OfferRepository extends Context.Tag('OfferRepository')<
  OfferRepository,
  {
    readonly getValidOfferForRendering: (
      args: GetOffer
    ) => T.Effect<ValidOfferForRendering, CustomError, never>

    readonly getAcceptedAndTerminatedOffer: (
      args: GetOffer
    ) => T.Effect<AcceptedAndTerminatedOffer, CustomError, never>
  }
>() {}

export const offerRepositoryLive = Layer.succeed(OfferRepository, {
  getValidOfferForRendering: (args: GetOffer) =>
    getValidOfferForRendering(args).pipe(effectOfferOperations),
  getAcceptedAndTerminatedOffer: (args: GetOffer) =>
    getAcceptedAndTerminatedOffer(args).pipe(effectOfferOperations)
})
