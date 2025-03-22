import { PaymentProvider, Prisma } from '@prisma/client'
import { Exit, Scope, Effect as T } from 'effect'
import { TRPCError } from '@trpc/server'
import { OfferOperations, TransactionOperations } from '../../databaseOperations/prisma.provider'
import { PaymentProviderFactory } from '../../paymentOperations/payment.provider'
import { Logger } from '@/server/logger'

export type AcceptOfferEffectArgs = {
  offerId: number
  paymentProvider: PaymentProvider
  userId: number
  paymentId: string
}
export const acceptOfferEffect = (args: AcceptOfferEffectArgs) =>
  T.gen(function* () {
    const logger = yield* Logger
    const transactionOperations = yield* TransactionOperations
    const paymentProviderFactory = yield* PaymentProviderFactory
    const offerOperations = yield* OfferOperations
    const rollbackOps = yield* Scope.make()

    const paymentProvider = paymentProviderFactory[args.paymentProvider]()

    const refundPayment = T.tryPromise({
      try: () => paymentProvider.refundFullTransaction(args.paymentId),
      catch: error => {
        logger.error({
          cause: 'payment_provider_error',
          message: `refund payment ${args.paymentId} error`,
          detailedError: error
        })

        //@todo poka-yoke : send notif to ADMIN
      }
    }).pipe(T.either)

    return T.tryPromise({
      try: () => paymentProvider.getPaymentById(args.paymentId),
      catch: error => {
        logger.error({
          cause: 'payment_provider_error',
          message: `payment ${args.paymentId} get error`,
          detailedError: error
        })

        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR'
        })
      }
    }).pipe(
      T.filterOrFail(
        payment => payment.paid,
        () => {
          logger.error({
            cause: 'payment_not_paid',
            message: `payment for user ${args.userId} of id ${args.paymentId} not paid`,
            detailedError: {}
          })
          return new TRPCError({
            code: 'FORBIDDEN',
            message: 'transaction_is_not_validated'
          })
        }
      ),
      T.map(payment => {
        Scope.addFinalizer(rollbackOps, refundPayment)
        return {
          providerPaymentId: args.paymentId,
          userId: args.userId,
          fromId: args.offerId,
          provider: args.paymentProvider,
          amount: payment.amount
        }
      }),
      T.flatMap(obj =>
        T.tryPromise({
          try: () => offerOperations.getAnOfferByIdAndReceiverId(args.offerId, args.userId),
          catch: error => {
            logger.error({
              cause: 'database_error',
              message: `get offer ${args.offerId} db error`,
              detailedError: error
            })

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              return new TRPCError({
                code: 'NOT_FOUND',
                message: 'offer_not_found_for_user'
              })
            }
            return new TRPCError({
              code: 'INTERNAL_SERVER_ERROR'
            })
          }
        }).pipe(
          T.filterOrFail(
            offer => offer !== null && offer.userId !== null,
            () => {
              logger.error({
                cause: 'offer_not_found',
                message: `offer ${args.offerId} not found on db`,
                detailedError: {}
              })
              return new TRPCError({
                code: 'NOT_FOUND',
                message: 'offer_not_found_for_user'
              })
            }
          ),
          T.flatMap(offer =>
            T.tryPromise({
              try: () =>
                transactionOperations.acceptOfferTransaction({
                  providerPaymentId: args.paymentId,
                  sellerId: offer!.userId!,
                  userId: args.userId,
                  offerId: offer!.id,
                  provider: args.paymentProvider,
                  amount: obj.amount,
                  eventType: 'payment'
                }),
              catch: error => {
                logger.error({
                  cause: 'database_error',
                  message: `offer ${args.offerId} db accept error`,
                  detailedError: error
                })

                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                  return new TRPCError({
                    code: 'NOT_FOUND',
                    message: `offer_not_found_for_user`
                  })
                }
                return new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR'
                })
              }
            })
          ),
          T.mapError(error => {
            Scope.close(rollbackOps, Exit.void)
            return error
          }),
          T.map(() => true)
        )
      )
    )
  }).pipe(T.flatten)
