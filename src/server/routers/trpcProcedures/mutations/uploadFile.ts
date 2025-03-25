import { Logger } from '@/server/logger'
import { Scope, Effect as T } from 'effect'
import { StorageProviderFactory } from '../../storage/storage.provider'
import { TRPCError } from '@trpc/server';
import formidable from 'formidable';

export const uploadFilesEffect = (files: formidable.File[], bucket: string) => T.gen(function*() {
    const logger = yield* Logger
    const storageProviderFactory = yield* StorageProviderFactory
    const rollbackActions = yield* Scope.make()

    const storage = storageProviderFactory.tigris()

    const removeFileForRollback = (path: string) => T.tryPromise({
        try: () => storage.removeAFileInTheBucket(path),
        catch: error => {
            logger.error({
                cause: 'storage_provider_error',
                message: `remove ${path} error`,
                detailedError: error
            })
        }
    }).pipe(T.either)

    const addAFileToTheBucketFun = storage.addAFileToTheBucket(bucket)

    const uploadAFile = (localFilepath: string, filename: string) => T.tryPromise({
        try: () => addAFileToTheBucketFun({
            localFilepath,
            filename
        }).then(() => {
            Scope.addFinalizer(rollbackActions, removeFileForRollback(filename))
        }),
        catch: error => {
            logger.error({
                cause: 'storage_provider_error',
                message: `add ${localFilepath} error`,
                detailedError: error
            })

            return new TRPCError({
                code: 'INTERNAL_SERVER_ERROR'
            })
        }
    })

    return T.all()

})