import { Logger } from '@/server/logger'
import { Effect as T } from 'effect'
import { StorageProviderFactory } from '../../storage/storage.provider'
import config from '@/config'
import { FilesOperations } from '../../databaseOperations/prisma.provider'
import { TRPCError } from '@trpc/server'

export const getProtectedFilesEffect = (userId: number, files: string[], bucket: string) =>
  T.gen(function* () {
    const logger = yield* Logger
    const storageFactory = yield* StorageProviderFactory
    const filesOperations = yield* FilesOperations

    const storage = storageFactory[config.storageProvider]()

    return T.tryPromise({
      try: () => filesOperations.getFilesByHashAndRelatedUser(userId, files),
      catch: error => {
        logger.error({
          cause: 'database_error',
          message: `getProtectedFiles getFilesByHashAndRelatedUser ${userId} db fetch error`,
          detailedError: error
        })

        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'database_error'
        })
      }
    }).pipe(
      T.flatMap(files =>
        T.all(
          files.map(file =>
            T.tryPromise({
              try: () =>
                storage
                  .getPresignedUrlForObject(bucket)(file.hash, 3600 * 24 * 7)
                  .then(signedUrl => ({
                    signedUrl,
                    ...file
                  })),
              catch: error => {
                logger.error({
                  cause: 'storage_provider_error',
                  message: `getProtectedFiles getPresignedUrlForObject ${file.hash} error`,
                  detailedError: error
                })

                return new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR',
                  message: 'storage_provider_error'
                })
              }
            })
          )
        )
      )
    )
  }).pipe(T.flatten)
