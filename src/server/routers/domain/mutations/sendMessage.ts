import { MessageOperations } from '@/server/databaseOperations/prisma.provider'
import { Logger } from '@/server/logger'
import { TRPCError } from '@trpc/server'
import { Effect as T } from 'effect'
import { CustomError } from '../error'
import { SendNotificationNewMessageProvider } from '../utils/sendEmail'

export type SendMessageInput = {
  receiverId: number
  message: string
  offerId?: number
  senderId: number
}

export const sendMessageEffect = ({ offerId, senderId, receiverId, message }: SendMessageInput) =>
  T.gen(function* () {
    const logger = yield* Logger
    const messageOperations = yield* MessageOperations
    const sendNotif = yield* SendNotificationNewMessageProvider

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
      T.flatMap(message =>
        sendNotif({
          senderId,
          receiverId,
          offerId
        }).pipe(T.map(() => message))
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
            message: error.message
          })
        },
        onSuccess: message => message
      })
    )
  }).pipe(T.flatten)
