import { Service, Prisma, Price } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { Schedule, Effect as T } from 'effect'
import { ServiceOperations } from '../../../databaseOperations/prisma.provider'
import { Logger } from '@/server/logger'
import { Sync } from '../../../databaseOperations/sync/sync'

const RETRY = 1
const RETRY_DELAY = 100
export type UpsertServiceArgs = {
  userId: number
  serviceId?: number
  service: Omit<Service, 'id' | 'userId' | 'createdAt' | 'images'>
  prices: Omit<Price, 'serviceId'>[]
  files: string[]
}
export const upsertServiceEffect = ({
  userId,
  serviceId,
  service,
  prices,
  files
}: UpsertServiceArgs) =>
  T.gen(function* () {
    const logger = yield* Logger
    const serviceOperations = yield* ServiceOperations
    const sync = yield* Sync

    const retryPolicy = Schedule.addDelay(Schedule.recurs(RETRY), () => `${RETRY_DELAY} millis`)

    return T.tryPromise({
      try: () =>
        serviceId
          ? serviceOperations.updateService(
              {
                ...service,
                id: serviceId,
                userId,
                images: files
              },
              prices.map(price => ({
                ...price,
                serviceId
              }))
            )
          : serviceOperations.createService({
              ...service,
              userId,
              prices: prices.map(({ id: _, ...raw }) => raw),
              images: []
            }),
      catch: error => {
        logger.error({
          cause: 'database_error',
          message: `service ${serviceId} db upsert error`,
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
        service => service !== null,
        () => {
          logger.error({
            cause: 'upsert_service_failed',
            message: `service ${serviceId} not found on db`,
            detailedError: {}
          })
          return new TRPCError({
            code: 'NOT_FOUND'
          })
        }
      ),
      T.flatMap(service =>
        T.retry(
          T.tryPromise({
            try: () => sync.sync(service),
            catch: error => {
              logger.error({
                cause: 'sync_error',
                message: `service ${serviceId} sync error`,
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
