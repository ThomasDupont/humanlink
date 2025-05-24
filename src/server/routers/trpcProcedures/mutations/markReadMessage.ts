import { MessageOperations } from '@/server/databaseOperations/prisma.provider'
import { Logger } from '@/server/logger'
import { Effect as T } from 'effect'
import { CustomError } from '../error'
import { TRPCError } from '@trpc/server'

export const markReadMessageEffect = ({
  messageIds,
  userId,
  timestamp = Date.now()
}: {
  messageIds: number[]
  userId: number
  timestamp?: number
}) =>
  T.gen(function* () {
    const logger = yield* Logger
    const messageOperations = yield* MessageOperations

    return T.tryPromise({
      try: () => messageOperations.getUnreadMessageIdsForAReceiver(userId, messageIds),
      catch: error =>
        new CustomError({
          code: 'INTERNAL_SERVER_ERROR',
          cause: 'mark_read_message_error',
          message: `markReadMessage ${messageIds} error`,
          detailedError: error
        })
    }).pipe(
      T.flatMap(unreadMessages =>
        T.tryPromise({
          try: () =>
            Promise.all(
              unreadMessages.map(message =>
                messageOperations.setMessageIsRead({ id: message.id, timestamp })
              )
            ),
          catch: error =>
            new CustomError({
              code: 'INTERNAL_SERVER_ERROR',
              cause: 'mark_read_message_error',
              message: `markReadMessage ${messageIds} error`,
              detailedError: error
            })
        })
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
        onSuccess: () => true
      })
    )
  }).pipe(T.flatten)
