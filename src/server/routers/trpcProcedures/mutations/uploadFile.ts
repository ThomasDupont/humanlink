import { Logger } from '@/server/logger'
import { Exit, pipe, Scope, Effect as T } from 'effect'
import { StorageProviderFactory } from '../../storage/storage.provider'
import { TRPCError } from '@trpc/server'
import formidable from 'formidable'

export const uploadFilesEffect = (files: formidable.File[], bucket: string, userId: number) =>
  T.gen(function* () {
    const logger = yield* Logger
    const storageProviderFactory = yield* StorageProviderFactory
    const rollbackOps = yield* Scope.make()

    const storage = storageProviderFactory.tigris()

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
      T.tryPromise({
        try: () =>
          addAFileToTheBucketFun({
            localFilepath: file.filepath,
            filename: userId + '/' + file.hash!
          }).then(() => {
            Scope.addFinalizer(rollbackOps, removeFileForRollback(userId + '/' + file.hash!))

            return {
              ...file,
              hash: userId + '/' + file.hash!
            }
          }),
        catch: error => {
          logger.error({
            cause: 'storage_provider_error',
            message: `add ${file.filepath} error`,
            detailedError: error
          })

          return new TRPCError({
            code: 'INTERNAL_SERVER_ERROR'
          })
        }
      })

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
            Scope.close(rollbackOps, Exit.void)
            return T.fail(either.left)
          }
        }
        return T.succeed(result.filter(either => either._tag === 'Right').map(r => r.right))
      })
    )
  }).pipe(T.flatten)
