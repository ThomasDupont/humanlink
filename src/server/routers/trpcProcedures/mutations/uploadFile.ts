import { Logger } from '@/server/logger'
import { Exit, pipe, Effect as T } from 'effect'
import { StorageProviderFactory } from '../../../storage/storage.provider'
import { TRPCError } from '@trpc/server'
import formidable from 'formidable'
import config from '@/config'

export const uploadFilesEffect = (files: formidable.File[], bucket: string, userId: number) =>
  T.gen(function* () {
    const logger = yield* Logger
    const storageProviderFactory = yield* StorageProviderFactory

    const storage = storageProviderFactory[config.storageProvider]()

    const addAFileToTheBucketFun = storage.addAFileToTheBucket(bucket)
    const removeAFileInTheBucketFun = storage.removeAFileInTheBucket(bucket)

    const removeFileForRollback = (path: string) =>
      T.tryPromise({
        try: () => removeAFileInTheBucketFun(path),
        catch: error => {
          logger.error({
            cause: 'storage_provider_error',
            message: `remove ${path} error`,
            detailedError: error
          })
        }
      }).pipe(T.either)

    const uploadAFile = (file: formidable.File) =>
      T.acquireRelease(
        T.tryPromise({
          try: () => {
            const ext = file.originalFilename?.split('.').pop()
            const filename = userId + '/' + file.hash! + (ext ? `.${ext}` : '')
            return addAFileToTheBucketFun({
              localFilepath: file.filepath,
              filename,
              mimetype: file.mimetype ?? 'application/octet-stream'
            }).then(() => ({
              ...file,
              hash: filename
            }))
          },
          catch: error => {
            logger.error({
              cause: 'storage_provider_error',
              message: `add ${file.filepath} error`,
              detailedError: error
            })

            return new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'storage_provider_error'
            })
          }
        }),
        (_, exit) =>
          Exit.isFailure(exit) ? removeFileForRollback(userId + '/' + file.hash!) : T.void
      )

    const checkHash = (): T.Effect<formidable.File[], TRPCError> => {
      if (!files.find(f => f.hash == null)) {
        return T.succeed(files)
      }

      logger.error({
        cause: 'file_with_no_hash',
        message: 'file with no hash',
        detailedError: {}
      })

      return T.fail(
        new TRPCError({
          code: 'BAD_REQUEST'
        })
      )
    }

    return pipe(
      checkHash(),
      T.flatMap(files =>
        T.all(
          files.map(file => uploadAFile(file)),
          { mode: 'either' }
        )
      ),
      T.flatMap(result => {
        for (const either of result) {
          if (either._tag === 'Left') {
            return T.fail(either.left)
          }
        }
        return T.succeed(result.filter(either => either._tag === 'Right').map(r => r.right))
      })
    )
  }).pipe(T.flatten, T.scoped)
