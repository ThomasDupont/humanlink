import { Effect as T } from 'effect'
import { Logger, effectLogger } from '@/server/logger'
import { TRPCError } from '@trpc/server'
import { UserOperations, effectUserOperations } from '../databaseOperations/prisma.provider'
import { UserWithServicesWithPrices } from '@/types/User.type'

export const userMeEffect = (email: string) =>
  T.gen(function* () {
    const logger = yield* Logger
    const userOperations = yield* UserOperations

    return T.tryPromise({
      try: () =>
        userOperations.getUserByEmail<UserWithServicesWithPrices>(email, { withServices: true }),
      catch: error => {
        logger.error({
          cause: 'database_error',
          message: `${email} db fetch error`,
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
            message: `${email} not found on db`,
            detailedError: {}
          })
          return new TRPCError({
            code: 'NOT_FOUND'
          })
        }
      )
    )
  }).pipe(T.flatten)

export const userMe = (email: string) => ({
  run: () => userMeEffect(email).pipe(effectLogger, effectUserOperations, T.runPromise)
})
