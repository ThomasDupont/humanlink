import { Schedule, Effect as T } from 'effect'
import { effectServiceOperations, ServiceOperation } from '../databaseOperations/prisma.provider'
import { effectLogger, Logger } from '@/server/logger'
import { Price, Service } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { effectSync, Sync } from '../databaseOperations/sync/sync'

const RETRY = 1
const RETRY_DELAY = 100
type UpsertServiceArgs = {
  userId: number
  serviceId?: number
  service: Omit<Service, 'id' | 'userId' | 'createdAt'>
  prices: Omit<Price, 'serviceId'>[]
}
export const upsertServiceEffect = ({ userId, serviceId, service, prices }: UpsertServiceArgs) =>
  T.gen(function* () {
    const logger = yield* Logger
    const serviceOperations = yield* ServiceOperation
    const sync = yield* Sync

    const retryPolicy = Schedule.addDelay(Schedule.recurs(RETRY), () => `${RETRY_DELAY} millis`)

    return T.tryPromise({
      try: () =>
        serviceId
          ? serviceOperations.updateService(
              {
                ...service,
                id: serviceId,
                userId
              },
              prices.map(price => ({
                ...price,
                serviceId
              }))
            )
          : serviceOperations.createService({
              ...service,
              userId,
              prices: prices.map(({ id: _, ...raw }) => raw)
            }),
      catch: error => {
        logger.error({
          cause: 'database_error',
          message: `service ${serviceId} db upsert error`,
          detailedError: error
        })
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

export const upsertService = (args: UpsertServiceArgs) => ({
  run: () =>
    upsertServiceEffect(args).pipe(effectLogger, effectServiceOperations, effectSync, T.runPromise)
})
