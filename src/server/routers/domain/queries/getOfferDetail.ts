import { Effect as T } from 'effect'
import { Logger } from '@/server/logger'
import { TRPCError } from '@trpc/server'
import { OfferOperations, ServiceOperations } from '../../../databaseOperations/prisma.provider'

export const getOfferDetailEffect = (userId: number, offerId: number) =>
  T.gen(function* () {
    const logger = yield* Logger
    const serviceOperation = yield* ServiceOperations
    const offerOperations = yield* OfferOperations

    return T.tryPromise({
      try: () => offerOperations.getOfferDetailById(offerId),
      catch: error => {
        logger.error({
          cause: 'database_error',
          message: `getOfferDetailById ${offerId} db fetch error`,
          detailedError: error
        })
        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'list_offers_error'
        })
      }
    }).pipe(
      T.filterOrFail(
        offer => offer !== null,
        () => {
          logger.error({
            cause: 'offer_not_found',
            message: `getOfferDetailById ${offerId} not found on db`,
            detailedError: {}
          })
          return new TRPCError({
            code: 'NOT_FOUND',
            message: 'offer_not_found'
          })
        }
      ),
      T.filterOrFail(
        offer => offer.userId === userId || offer.userIdReceiver === userId,
        () => {
          logger.error({
            cause: 'offer_not_allowed',
            message: `getOfferDetailById ${offerId} not alloawed for user ${userId}`,
            detailedError: {}
          })
          return new TRPCError({
            code: 'FORBIDDEN',
            message: 'offer_not_allowed'
          })
        }
      ),
      T.flatMap(offer => {
        return T.tryPromise({
          try: () => serviceOperation.getServiceById(offer.serviceId ?? 0),
          catch: error => {
            logger.error({
              cause: 'database_error',
              message: `listConcernOffers getServiceById ${offer.serviceId} db fetch error`,
              detailedError: error
            })

            return new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'get_service_for_offer_error'
            })
          }
        }).pipe(
          T.filterOrFail(
            service => service !== null,
            () => {
              logger.error({
                cause: 'service_not_found_for_existing_offer',
                message: `listConcernOffers getServiceById ${offer.serviceId} not found on db`,
                detailedError: {}
              })
              return new TRPCError({
                code: 'NOT_FOUND',
                message: 'service_not_found_for_existing_offer'
              })
            }
          ),
          T.map(service => ({
            ...offer,
            service
          }))
        )
      })
    )
  }).pipe(T.flatten)
