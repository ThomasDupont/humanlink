import { Effect as T } from 'effect'
import { OfferWithMileStonesAndMilestonePriceWithoutIdsAndCreatedAt } from '@/types/Offers.type'
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { OfferOperations } from '../../../databaseOperations/prisma.provider'
import { Logger } from '@/server/logger'
import { SendMessageProvider } from '../effectAsService'

export type CreateOffer = OfferWithMileStonesAndMilestonePriceWithoutIdsAndCreatedAt & {
  userId: number
  userIdReceiver: number
}
export const createOfferWithMessageEffect = (offer: CreateOffer) =>
  T.gen(function* () {
    const logger = yield* Logger
    const offerOperations = yield* OfferOperations
    const sendMessage = yield* SendMessageProvider

    return T.tryPromise({
      try: () => offerOperations.createAnOffer(offer),
      catch: error => {
        logger.error({
          cause: 'database_error',
          message: `offer for service ${offer.serviceId} db create error`,
          detailedError: error
        })

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          return new TRPCError({
            code: 'NOT_FOUND'
          })
        }
        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR'
        })
      }
    }).pipe(
      T.flatMap(createdOffer =>
        sendMessage({
          senderId: offer.userId,
          receiverId: offer.userIdReceiver,
          offerId: createdOffer.id,
          message: ''
        }).pipe(T.map(() => createdOffer))
      )
    )
  }).pipe(T.flatten)
