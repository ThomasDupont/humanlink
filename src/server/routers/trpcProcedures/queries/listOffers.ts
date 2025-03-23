import { Effect as T } from 'effect'
import { Logger } from '@/server/logger'
import { TRPCError } from '@trpc/server'
import { OfferOperations, ServiceOperations } from '../../databaseOperations/prisma.provider'

export const listOffersEffect = (userId: number) =>
  T.gen(function* () {
    const logger = yield* Logger
    const serviceOperation = yield* ServiceOperations
    const offerOperations = yield* OfferOperations

    return T.tryPromise({
      try: () => offerOperations.listConcernOffers(userId),
      catch: error => {
        logger.error({
          cause: 'database_error',
          message: `getContactList ${userId} db fetch error`,
          detailedError: error
        })
        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'list_offers_error'
        })
      }
    }).pipe(
      T.flatMap(list => {
        return T.all(
          list.map(offer => {
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
          }),
          { mode: 'either' }
        ).pipe(
          T.map(eitherContacts => {
            return eitherContacts.filter(either => either._tag === 'Right').map(el => el.right)
          })
        )
      })
    )
  }).pipe(T.flatten)
