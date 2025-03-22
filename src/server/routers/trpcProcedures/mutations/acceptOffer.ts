<<<<<<< HEAD
import { PaymentProvider, Prisma } from '@prisma/client'
import { Exit, Scope, Effect as T } from 'effect'
=======
import {
  PaymentEventType,
  PaymentFrom,
  PaymentProvider,
  Prisma,
  TransactionType
} from '@prisma/client'
import { Effect as T } from 'effect'
>>>>>>> ac5f134 (temp)
import { TRPCError } from '@trpc/server'
import {
  BalanceOperations,
<<<<<<< HEAD
  TransactionOperations,
=======
  DbTransaction
>>>>>>> ac5f134 (temp)
} from '../../databaseOperations/prisma.provider'
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
    const balanceOperations = yield* BalanceOperations
    const dbTransaction = yield* DbTransaction
    const paymentProviderFactory = yield* PaymentProviderFactory
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
      T.map(payment => ({
        providerPaymentId: args.paymentId,
        userId: args.userId,
        fromId: args.offerId,
        provider: args.paymentProvider,
        amount: payment.amount
      })),
      T.flatMap(obj =>
        T.tryPromise({
          try: () =>
            dbTransaction([
              balanceOperations.createUserBalanceEventsLog({
                ...obj,
                eventType: PaymentEventType.payment,
                from: PaymentFrom.offer
              }),
              balanceOperations.createTransaction({
                buyerId: obj.userId,
                sellerId: 0,
                amount: obj.amount,
                offerId: obj.fromId,
                type: TransactionType.acceptOffer,
                milestoneId: null,
                comment: ''
              })
            ]),
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
                code: 'NOT_FOUND',
                message: 'balance_not_found_for_user'
              })
            }
          ),
          T.flatMap(balance =>
            T.tryPromise({
              try: () => transactionOperations.acceptOfferTransaction({
                balanceId: balance.id,
                providerPaymentId: args.paymentId,
                userId: args.userId,
                offerId: args.offerId,
                provider: args.paymentProvider,
                amount: payment.amount,
                eventType: 'payment',
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
