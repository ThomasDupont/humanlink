import {
  MessageOperations,
  userOperations,
  UserOperations
} from '@/server/databaseOperations/prisma.provider'
import { mailProviderFactory, MailProviderFactory } from '@/server/emailOperations/email.provider'
import { Logger } from '@/server/logger'
import { TRPCError } from '@trpc/server'
import { Effect as T } from 'effect'
import { CustomError } from '../error'
import { buildNotificationEmail } from '@/server/emailOperations/buildEmail'

export type SendMessageInput = {
  receiverId: number
  message: string
  offerId?: number
  senderId: number
}

const sendNotification =
  ({
    userOps,
    emailFactory
  }: {
    userOps: typeof userOperations
    emailFactory: typeof mailProviderFactory
  }) =>
  async ({
    senderId,
    receiverId,
    offerId
  }: {
    senderId: number
    receiverId: number
    offerId?: number
  }) => {
    const sender = await userOps.selectUserById(senderId, { firstname: true })
    const receiver = await userOps.selectUserById(receiverId, { firstname: true, email: true })

    if (!receiver) {
      throw new Error(`Receiver with ID ${receiverId} not found`)
    }

    if (!sender) {
      throw new Error(`Sender with ID ${senderId} not found`)
    }

    const detail = offerId
      ? `You have a new message from ${sender.firstname} an offer, respond to this message in the chat part in the platform`
      : `You have a new message from ${sender.firstname}, respond to this message in the chat part in the platform`
    const html = buildNotificationEmail({
      firstname: receiver.firstname,
      notificationType: 'NEW_MESSAGE',
      detail
    })

    const mail = emailFactory.mailjet()
    await mail.sendEmail({
      to: {
        email: receiver.email,
        name: receiver.firstname
      },
      subject: 'New message from',
      text: detail,
      html
    })
  }

export const sendMessageEffect = ({ offerId, senderId, receiverId, message }: SendMessageInput) =>
  T.gen(function* () {
    const logger = yield* Logger
    const messageOperations = yield* MessageOperations
    const emailFactory = yield* MailProviderFactory
    const userOperations = yield* UserOperations

    return T.tryPromise({
      try: () =>
        offerId
          ? messageOperations.sendMessageWithOffer({
              senderId,
              receiverId,
              offerId
            })
          : messageOperations.sendMessage({
              senderId,
              receiverId,
              message
            }),
      catch: error =>
        new CustomError({
          code: 'INTERNAL_SERVER_ERROR',
          cause: 'send_message_error',
          message: `sendMessage to ${receiverId} ${message} error, offer: ${offerId}`,
          detailedError: error
        })
    }).pipe(
      T.map(message => {
        return sendNotification({
          userOps: userOperations,
          emailFactory
        })({
          senderId,
          receiverId,
          offerId
        })
          .catch(error => {
            logger.error({
              cause: 'send_notification_error',
              message: `send notification to ${receiverId} error`,
              detailedError: error
            })
          })
          .then(() => message)
      }),
      T.match({
        onFailure: error => {
          logger.error({
            cause: error.cause,
            message: error.message,
            detailedError: error.detailedError
          })
          throw new TRPCError({
            code: error.code,
            message: error.message
          })
        },
        onSuccess: message => message
      })
    )
  }).pipe(T.flatten)
