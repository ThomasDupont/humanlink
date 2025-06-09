import { PaymentProvider, Prisma } from '@prisma/client'
import { Exit, Effect as T } from 'effect'
import { TRPCError } from '@trpc/server'
import { OfferOperations, TransactionOperations } from '@/server/databaseOperations/prisma.provider'
import { PaymentProviderFactory } from '@/server/paymentOperations/payment.provider'
import { Logger } from '@/server/logger'
import { CustomError } from '../error'
import { SendNotificationAcceptOfferProvider } from '../utils/sendEmail'

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
    const sendEmail = yield* SendNotificationAcceptOfferProvider

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

    const getPayment = T.tryPromise({
      try: () => paymentProvider.getPaymentById(args.paymentId),
      catch: error =>
        new CustomError({
          code: 'INTERNAL_SERVER_ERROR',
          cause: 'payment_provider_error',
          message: `payment ${args.paymentId} get error`,
          clientMessage: 'payment_provider_error',
          detailedError: error
        })
    }).pipe(
      T.filterOrFail(
        payment => payment.paid,
        () =>
          new CustomError({
            code: 'INTERNAL_SERVER_ERROR',
            cause: 'payment_not_paid',
            message: `payment ${args.paymentId} not paid`,
            clientMessage: 'transaction_is_not_validated'
          })
      ),
      T.map(payment => ({
        providerPaymentId: args.paymentId,
        userId: args.userId,
        fromId: args.offerId,
        provider: args.paymentProvider,
        amount: payment.amount
      }))
    )

    return T.acquireRelease(getPayment, (_, exit) =>
      Exit.isFailure(exit) ? refundPayment : T.void
    ).pipe(
      T.flatMap(obj =>
        T.tryPromise({
          try: () => offerOperations.getAnOfferByIdAndReceiverId(args.offerId, args.userId),
          catch: error =>
            new CustomError({
              code:
                error instanceof Prisma.PrismaClientKnownRequestError
                  ? 'NOT_FOUND'
                  : 'INTERNAL_SERVER_ERROR',
              cause: 'database_error',
              message: `get offer ${args.offerId} db error`,
              clientMessage: 'offer_not_found_for_user',
              detailedError: error
            })
        }).pipe(
          T.flatMap(offer => {
            if (offer !== null && offer.userId !== null) {
              const { userId, ...rest } = offer
              return T.succeed({
                userId,
                ...rest
              })
            }

            return T.fail(
              new CustomError({
                code: 'NOT_FOUND',
                cause: 'offer_not_found',
                message: `offer ${args.offerId} not found`,
                clientMessage: 'offer_not_found_for_user'
              })
            )
          }),
          T.flatMap(offer =>
            T.tryPromise({
              try: () =>
                transactionOperations
                  .acceptOfferTransaction({
                    providerPaymentId: args.paymentId,
                    sellerId: offer!.userId!,
                    userId: args.userId,
                    offerId: offer!.id,
                    provider: args.paymentProvider,
                    amount: obj.amount
                  })
                  .then(() => offer),
              catch: error =>
                new CustomError({
                  code:
                    error instanceof Prisma.PrismaClientKnownRequestError
                      ? 'NOT_FOUND'
                      : 'INTERNAL_SERVER_ERROR',
                  cause: 'database_error',
                  message: `offer ${args.offerId} db accept error`,
                  clientMessage: 'offer_not_found_for_user',
                  detailedError: error
                })
            })
          ),
          T.flatMap(offer =>
            sendEmail({
              senderId: args.userId,
              receiverId: offer.userId
            })
          )
        )
      ),
      T.match({
        onFailure: error => {
          logger.error({
            cause: error.cause,
            message: error.message,
            detailedError: error.detailedError
          })

          throw new TRPCError({
            code: error.code,
            message: error.clientMessage
          })
        },
        onSuccess: () => true
      })
    )
  }).pipe(T.flatten, T.scoped)
