import { Service, Prisma, Price } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { pipe, Schedule, Effect as T } from 'effect'
import { ServiceOperations } from '../../../databaseOperations/prisma.provider'
import { Logger } from '@/server/logger'
import { Sync } from '../../../databaseOperations/sync/sync'
import { StorageProviderFactory } from '@/server/storage/storage.provider'
import config from '@/config'
import { CustomError } from '../error'
import { CreateAccountIfNotExistsInPaymentProvider } from './createAccountInPaymentProvider'

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
    const storageFactory = yield* StorageProviderFactory
    const createAccountInPaymentProvider = yield* CreateAccountIfNotExistsInPaymentProvider
    const sync = yield* Sync

    const storage = storageFactory[config.storageProvider]()
    const retryPolicy = Schedule.addDelay(Schedule.recurs(RETRY), () => `${RETRY_DELAY} millis`)
    const removeFun = storage.removeAFileInTheBucket('ascend-service-banner')

    const getImageHash = (url: string) => new URL(url).pathname.substring(1)
    const eraseActualFiles = (serviceId?: number) =>
      T.tryPromise({
        try: () =>
          serviceId && files.length
            ? serviceOperations
                .getServiceById(serviceId)
                .then(service =>
                  Promise.all(service?.images.map(url => removeFun(getImageHash(url))) ?? [])
                )
                .then(() => true)
            : Promise.resolve(true),
        catch: error =>
          new CustomError({
            cause: 'erase_actual_file',
            message: `impossible to erase actual service file for id ${serviceId}`,
            clientMessage: 'erase_actual_file_error',
            detailedError: error,
            code: 'INTERNAL_SERVER_ERROR'
          })
      })

    return pipe(
      createAccountInPaymentProvider(userId),
      T.flatMap(() => eraseActualFiles(serviceId)),
      T.flatMap(() =>
        T.tryPromise({
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
                  images: files
                }),
          catch: error =>
            new CustomError({
              cause: 'database_error',
              message: `service ${serviceId} db upsert error`,
              detailedError: error,
              clientMessage: 'service_not_found',
              code:
                error instanceof Prisma.PrismaClientKnownRequestError
                  ? 'NOT_FOUND'
                  : 'INTERNAL_SERVER_ERROR'
            })
        })
      ),
      T.filterOrFail(
        service => service !== null,
        () =>
          new CustomError({
            cause: 'upsert_service_failed',
            clientMessage: 'service_not_found',
            message: `service ${serviceId} not found on db`,
            code: 'NOT_FOUND'
          })
      ),
      T.flatMap(service =>
        T.retry(
          T.tryPromise({
            try: () => sync.sync(service),
            catch: error => {
              return new CustomError({
                cause: 'sync_error',
                message: `service ${serviceId} sync error`,
                detailedError: error,
                clientMessage: 'sync_service_error',
                code: 'INTERNAL_SERVER_ERROR'
              })
            }
          }),
          retryPolicy
        )
      ),
      T.match({
        onFailure: ({ cause, message, detailedError, code, clientMessage }) => {
          logger.error({ cause, message, detailedError })

          throw new TRPCError({
            code,
            message: clientMessage
          })
        },
        onSuccess: service => service
      })
    )
  }).pipe(T.flatten)
