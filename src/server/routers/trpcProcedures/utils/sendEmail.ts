import config from '@/config'
import {
  effectUserOperations,
  userOperations,
  UserOperations
} from '@/server/databaseOperations/prisma.provider'
import { buildNotificationEmail } from '@/server/emailOperations/buildEmail'
import {
  effectMailProviderFactory,
  mailProviderFactory,
  MailProviderFactory
} from '@/server/emailOperations/email.provider'
import { effectLogger, Logger } from '@/server/logger'
import { Context, Effect as T } from 'effect'
import { CustomError } from '../error'

const getUserTuple =
  ({ userOps }: { userOps: typeof userOperations }) =>
  async ({ senderId, receiverId }: { senderId: number; receiverId: number }) => {
    const sender = await userOps.selectUserById(senderId, { firstname: true })
    const receiver = await userOps.selectUserById(receiverId, { firstname: true, email: true })

    if (!receiver) {
      throw new Error(`Receiver with ID ${receiverId} not found`)
    }

    if (!sender) {
      throw new Error(`Sender with ID ${senderId} not found`)
    }

    return { sender, receiver }
  }

const sendEmail =
  ({ emailFactory }: { emailFactory: typeof mailProviderFactory }) =>
  async (email: {
    to: {
      email: string
      name: string
    }
    subject: string
    text: string
    html: string
  }) => {
    const mail = emailFactory[config.emailProvider]()
    await mail.sendEmail(email)
  }

export type SendNotificationNewMessageInput = {
  receiverId: number
  offerId?: number
  senderId: number
}
const sendNotificationNewMessageEffect = ({
  senderId,
  receiverId,
  offerId
}: SendNotificationNewMessageInput) =>
  T.gen(function* () {
    const logger = yield* Logger
    const userOperations = yield* UserOperations
    const mailProviderFactory = yield* MailProviderFactory

    const getUserTupleFun = getUserTuple({ userOps: userOperations })
    const sendEmailFun = sendEmail({ emailFactory: mailProviderFactory })

    return T.tryPromise({
      try: () => getUserTupleFun({ senderId, receiverId }),
      catch: error =>
        new CustomError({
          cause: 'users_not_found',
          message: `getUserTuple ${senderId} or ${receiverId} not found on db`,
          detailedError: error,
          code: 'NOT_FOUND',
          clientMessage: 'users_not_found'
        })
    }).pipe(
      T.flatMap(({ sender, receiver }) => {
        const detail = offerId
          ? `You have a new message from ${sender.firstname} an offer, respond to this message in the chat part in the platform`
          : `You have a new message from ${sender.firstname}, respond to this message in the chat part in the platform`
        const html = buildNotificationEmail({
          firstname: receiver.firstname,
          notificationType: 'NEW_MESSAGE',
          detail
        })

        return T.tryPromise({
          try: () =>
            sendEmailFun({
              to: {
                email: receiver.email,
                name: receiver.firstname
              },
              subject: 'New message from',
              text: detail,
              html
            }),
          catch: error =>
            new CustomError({
              cause: 'send_email_error',
              message: `sendEmail ${senderId} or ${receiverId} 'New message from' error`,
              detailedError: error,
              code: 'INTERNAL_SERVER_ERROR',
              clientMessage: 'send_email_error'
            })
        })
      }),
      T.match({
        onFailure: error => {
          logger.error({
            cause: error.cause,
            message: error.message,
            detailedError: error.detailedError
          })

          return false
        },
        onSuccess: () => true
      })
    )
  }).pipe(T.flatten)

export const sendNotificationNewMessageProvider = (args: SendNotificationNewMessageInput) =>
  sendNotificationNewMessageEffect(args).pipe(
    effectLogger,
    effectUserOperations,
    effectMailProviderFactory
  )

export class SendNotificationNewMessageProvider extends Context.Tag(
  'sendNotificationNewMessageProvider'
)<SendNotificationNewMessageProvider, typeof sendNotificationNewMessageProvider>() {}
export const effectSendNotificationNewMessageProvider = T.provideService(
  SendNotificationNewMessageProvider,
  sendNotificationNewMessageProvider
)

export type SendNotificationAcceptOfferInput = {
  receiverId: number
  senderId: number
}
const sendNotificationAcceptOfferEffect = ({
  senderId,
  receiverId
}: SendNotificationAcceptOfferInput) =>
  T.gen(function* () {
    const logger = yield* Logger
    const userOperations = yield* UserOperations
    const mailProviderFactory = yield* MailProviderFactory

    const getUserTupleFun = getUserTuple({ userOps: userOperations })
    const sendEmailFun = sendEmail({ emailFactory: mailProviderFactory })

    return T.tryPromise({
      try: () => getUserTupleFun({ senderId, receiverId }),
      catch: error =>
        new CustomError({
          cause: 'users_not_found',
          message: `getUserTuple ${senderId} or ${receiverId} not found on db`,
          detailedError: error,
          code: 'NOT_FOUND',
          clientMessage: 'users_not_found'
        })
    }).pipe(
      T.flatMap(({ sender, receiver }) => {
        const detail = `${sender.firstname} accepted your offer`
        const html = buildNotificationEmail({
          firstname: receiver.firstname,
          notificationType: 'OFFER_ACCEPTED',
          detail
        })

        return T.tryPromise({
          try: () =>
            sendEmailFun({
              to: {
                email: receiver.email,
                name: receiver.firstname
              },
              subject: 'Offer accepted',
              text: detail,
              html
            }),
          catch: error =>
            new CustomError({
              cause: 'send_email_error',
              message: `sendEmail ${senderId} or ${receiverId} 'Offer accepted' error`,
              detailedError: error,
              code: 'INTERNAL_SERVER_ERROR',
              clientMessage: 'send_email_error'
            })
        })
      }),
      T.match({
        onFailure: error => {
          logger.error({
            cause: error.cause,
            message: error.message,
            detailedError: error.detailedError
          })

          return false
        },
        onSuccess: () => true
      })
    )
  }).pipe(T.flatten)

export const sendNotificationAcceptOfferProvider = (args: SendNotificationAcceptOfferInput) =>
  sendNotificationAcceptOfferEffect(args).pipe(
    effectLogger,
    effectUserOperations,
    effectMailProviderFactory
  )

export class SendNotificationAcceptOfferProvider extends Context.Tag(
  'sendNotificationAcceptOfferProvider'
)<SendNotificationAcceptOfferProvider, typeof sendNotificationAcceptOfferProvider>() {}
export const effectSendNotificationAcceptOfferProvider = T.provideService(
  SendNotificationAcceptOfferProvider,
  sendNotificationAcceptOfferProvider
)

type SendNotificationNewRenderingInput = {
  senderId: number
  receiverId: number
  offerId: number
}

const sendNotificationNewRenderingEffect = ({
  senderId,
  receiverId,
  offerId
}: SendNotificationNewRenderingInput) =>
  T.gen(function* () {
    const logger = yield* Logger
    const userOperations = yield* UserOperations
    const mailProviderFactory = yield* MailProviderFactory

    const getUserTupleFun = getUserTuple({ userOps: userOperations })
    const sendEmailFun = sendEmail({ emailFactory: mailProviderFactory })

    return T.tryPromise({
      try: () => getUserTupleFun({ senderId, receiverId }),
      catch: error =>
        new CustomError({
          cause: 'users_not_found',
          message: `getUserTuple ${senderId} or ${receiverId} not found on db`,
          detailedError: error,
          code: 'NOT_FOUND',
          clientMessage: 'users_not_found'
        })
    }).pipe(
      T.flatMap(({ sender, receiver }) => {
        const detail = `You have a new rendering from ${sender.firstname}, you could consult the detail here  <a href="${config.frontUrl}/dashboard/detail/offer/${offerId}">here</a>`
        const html = buildNotificationEmail({
          firstname: receiver.firstname,
          notificationType: 'RENDERING_ADDED',
          detail
        })

        return T.tryPromise({
          try: () =>
            sendEmailFun({
              to: {
                email: receiver.email,
                name: receiver.firstname
              },
              subject: 'New rendering from',
              text: detail,
              html
            }),
          catch: error =>
            new CustomError({
              cause: 'send_email_error',
              message: `sendEmail ${senderId} or ${receiverId} 'New rendering from' error`,
              detailedError: error,
              code: 'INTERNAL_SERVER_ERROR',
              clientMessage: 'send_email_error'
            })
        })
      }),
      T.match({
        onFailure: error => {
          logger.error({
            cause: error.cause,
            message: error.message,
            detailedError: error.detailedError
          })

          return false
        },
        onSuccess: () => true
      })
    )
  }).pipe(T.flatten)

export const sendNotificationNewRenderingProvider = ({
  senderId,
  receiverId,
  offerId
}: SendNotificationNewRenderingInput) =>
  sendNotificationNewRenderingEffect({
    senderId,
    receiverId,
    offerId
  }).pipe(effectLogger, effectUserOperations, effectMailProviderFactory)

export class SendNotificationNewRenderingProvider extends Context.Tag(
  'sendNotificationNewRenderingProvider'
)<SendNotificationNewRenderingProvider, typeof sendNotificationNewRenderingProvider>() {}
export const effectSendNotificationNewRenderingProvider = T.provideService(
  SendNotificationNewRenderingProvider,
  sendNotificationNewRenderingProvider
)
