import { PaymentProvider, Prisma } from '@prisma/client'
import { Exit, Effect as T } from 'effect'
import { TRPCError } from '@trpc/server'
import {
  OfferOperations,
  TransactionOperations,
  UserOperations,
  userOperations
} from '@/server/databaseOperations/prisma.provider'
import { PaymentProviderFactory } from '@/server/paymentOperations/payment.provider'
import { Logger } from '@/server/logger'
import { MailProviderFactory, mailProviderFactory } from '@/server/emailOperations/email.provider'
import { buildNotificationEmail } from '@/server/emailOperations/buildEmail'
import { CustomError } from '../error'

const sendNotification =
  ({
    userOps,
    emailFactory
  }: {
    userOps: typeof userOperations
    emailFactory: typeof mailProviderFactory
  }) =>
  async ({ senderId, receiverId }: { senderId: number; receiverId: number }) => {
    const sender = await userOps.selectUserById(senderId, { firstname: true })
    const receiver = await userOps.selectUserById(receiverId, { firstname: true, email: true })

    if (!receiver) {
      throw new Error(`Receiver with ID ${receiverId} not found`)
    }

    if (!sender) {
      throw new Error(`Sender with ID ${senderId} not found`)
    }

    const detail = `${sender.firstname} accepted your offer`
    const html = buildNotificationEmail({
      firstname: receiver.firstname,
      notificationType: 'OFFER_ACCEPTED',
      detail
    })

    const mail = emailFactory.mailjet()
    await mail.sendEmail({
      to: {
        email: receiver.email,
        name: receiver.firstname
      },
      subject: 'Offer accepted',
      text: detail,
      html
    })
  }

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
    const userOperations = yield* UserOperations
    const emailFactory = yield* MailProviderFactory

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
        onSuccess: offer => {
          sendNotification({
            userOps: userOperations,
            emailFactory
          })({
            senderId: args.userId,
            receiverId: offer.userId ?? 0
          }).catch(error => {
            logger.error({
              cause: 'send_notification_error',
              message: `send notification to ${offer.userId} error`,
              detailedError: error
            })
          })

          return true
        }
      })
    )
  }).pipe(T.flatten, T.scoped)
