import { Prisma } from '@prisma/client'
import { Effect as T } from 'effect'
import { TRPCError } from '@trpc/server'
import { OfferOperations } from '../../databaseOperations/prisma.provider'
import { PaymentProviderFactory } from '../../paymentOperations/payment.provider'
import { Logger } from '@/server/logger'
import config from '@/config'

export const createStripePaymentIntentForOfferEffect = (
  offerId: number,
  receiverId: number,
  idempotencyKey: string
) =>
  T.gen(function* () {
    const logger = yield* Logger
    const paymentProviderFactory = yield* PaymentProviderFactory
    const offerOperations = yield* OfferOperations

    const stripePayment = paymentProviderFactory['stripe']()

    return T.tryPromise({
      try: () => offerOperations.getAnOfferByIdAndReceiverId(offerId, receiverId),
      catch: error => {
        logger.error({
          cause: 'database_error',
          message: `offer ${offerId} db get error`,
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
      T.filterOrFail(
        offer => offer !== null,
        () => {
          logger.error({
            cause: 'offer_not_found',
            message: `offer ${offerId} not found on db`,
            detailedError: {}
          })
          return new TRPCError({
            code: 'NOT_FOUND'
          })
        }
      ),
      T.flatMap(offer => {
        const computedAmount = offer.milestone.reduce(
          (acc, milestone) => acc + milestone.priceMilestone.number,
          0
        )
        const currency = offer.milestone[0]?.priceMilestone.currency ?? config.defaultCurrency

        return T.tryPromise({
          try: () =>
            stripePayment.createPayment({
              amount: computedAmount,
              currency,
              idempotencyKey
            }),
          catch: error => {
            logger.error({
              cause: 'database_error',
              message: `stripe payment intent for offer ${offerId} db create error`,
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
        })
      })
    )
  }).pipe(T.flatten)
