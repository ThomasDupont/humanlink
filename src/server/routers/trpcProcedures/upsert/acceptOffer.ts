import { PaymentProvider, Prisma } from '@prisma/client'
import { Effect as T } from 'effect'
import { TRPCError } from '@trpc/server'
import {
  OfferOperations,
  BalanceOperations,
  effectOfferOperations,
  effectBalanceOperations
} from '../../databaseOperations/prisma.provider'
import {
  effectPaymentProviderFactory,
  PaymentProviderFactory
} from '../../paymentOperations/payment.provider'
import { effectLogger, Logger } from '@/server/logger'

type AcceptOfferEffectArgs = {
  offerId: number
  paymentProvider: PaymentProvider
  userId: number
  paymentId: string
}
export const acceptOfferEffect = (args: AcceptOfferEffectArgs) =>
  T.gen(function* () {
    const logger = yield* Logger
    const offerOperations = yield* OfferOperations
    const balanceOperations = yield* BalanceOperations
    const paymentProviderFactory = yield* PaymentProviderFactory

    const paymentProvider = paymentProviderFactory[args.paymentProvider]()

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
      T.flatMap(payment => {
        const baseObj = {
          providerPaymentId: args.paymentId,
          userId: args.userId,
          fromId: args.offerId,
          paymentId: payment.id,
          provider: args.paymentProvider,
          amount: payment.amount
        }
        return T.tryPromise({
          try: () => balanceOperations.getUserBalance(args.userId),
          catch: error => {
            logger.error({
              cause: 'database_error',
              message: `balance for user ${args.userId} db get error`,
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
            balance => balance !== null,
            () => {
              logger.error({
                cause: 'balance_not_found',
                message: `balance for user ${args.userId} not found on db`,
                detailedError: {}
              })
              return new TRPCError({
                code: 'NOT_FOUND'
              })
            }
          ),
          T.map(balance => ({ ...baseObj, balanceId: balance.id }))
        )
      }),
      T.flatMap(obj =>
        T.tryPromise({
          try: () =>
            balanceOperations.addPaymentTransaction({
              ...obj,
              eventType: 'payment',
              from: 'offer'
            }),
          catch: error => {
            logger.error({
              cause: 'database_error',
              message: `payment transaction for user ${args.userId} db add error`,
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
      ),
      T.flatMap(() =>
        T.tryPromise({
          try: () => offerOperations.acceptOffer(args.offerId, args.userId),
          catch: error => {
            logger.error({
              cause: 'database_error',
              message: `offer ${args.offerId} db accept error`,
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
      )
    )
  }).pipe(T.flatten)

export const acceptOffer = (args: AcceptOfferEffectArgs) => ({
  run: () =>
    acceptOfferEffect(args).pipe(
      effectLogger,
      effectPaymentProviderFactory,
      effectOfferOperations,
      effectBalanceOperations,
      T.runPromise
    )
})
