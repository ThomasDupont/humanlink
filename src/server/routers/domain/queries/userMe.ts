import { Logger } from '@/server/logger'
import { Effect as T } from 'effect'
import { UserOperations } from '../../../databaseOperations/prisma.provider'
import { TRPCError } from '@trpc/server'

export const userMeEffect = (id: number) =>
  T.gen(function* () {
    const logger = yield* Logger
    const userOperations = yield* UserOperations

    return T.tryPromise({
      try: () => userOperations.getUserById(id),
      catch: error => {
        logger.error({
          cause: 'database_error',
          message: `${id} db fetch error`,
          detailedError: error
        })
        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR'
        })
      }
    }).pipe(
      T.filterOrFail(
        user => user !== null,
        () => {
          logger.error({
            cause: 'incoherent_session_and_db_data',
            message: `user ${id} not found on db`,
            detailedError: {}
          })
          return new TRPCError({
            code: 'NOT_FOUND'
          })
        }
      )
    )
  }).pipe(T.flatten, T.withSpan('get-user-me'))
