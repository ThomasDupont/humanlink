import { Schedule, Effect as T } from 'effect'
import { effectServiceOperations, ServiceOperation } from '../databaseOperations/prisma.provider'
import { effectLogger, Logger } from '@/server/logger'
import { effectSync, Sync } from '../databaseOperations/sync/sync'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

const RETRY = 1
const RETRY_DELAY = 100

export const deleteAServiceEffect = (id: number, userId: number) =>
  T.gen(function* () {
    const logger = yield* Logger
    const serviceOperations = yield* ServiceOperation
    const sync = yield* Sync

    const retryPolicy = Schedule.addDelay(Schedule.recurs(RETRY), () => `${RETRY_DELAY} millis`)

    return T.tryPromise({
      try: () => serviceOperations.deleteAServiceByIdAndUserId(id, userId),
      catch: error => {
        logger.error({
          cause: 'database_error',
          message: `service ${id} db delete error`,
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
      T.flatMap(() =>
        T.retry(
          T.tryPromise({
            try: () => sync.deleteRecord(id),
            catch: error => {
              logger.error({
                cause: 'delete_record_error',
                message: `service ${id} delete record in search provider error`,
                detailedError: error
              })
              return new TRPCError({
                code: 'INTERNAL_SERVER_ERROR'
              })
            }
          }),
          retryPolicy
        )
      )
    )
  }).pipe(T.flatten)

export const deleteAService = (id: number, userId: number) => ({
  run: () =>
    deleteAServiceEffect(id, userId).pipe(
      effectLogger,
      effectServiceOperations,
      effectSync,
      T.runPromise
    )
})
