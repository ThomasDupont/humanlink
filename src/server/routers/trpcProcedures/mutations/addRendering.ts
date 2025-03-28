import { Logger } from '@/server/logger'
import { Effect as T } from 'effect'
import { OfferOperations, TransactionOperations } from '../../databaseOperations/prisma.provider'
import { StorageProviderFactory } from '../../storage/storage.provider'
import config from '@/config'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

export type AddRenderingEffectArgs = {
  milestoneId: number
  offerId: number
  bucket: string
  userId: number
  text: string
  files: {
    originalFileName: string
    path: string
  }[]
}
export const addRenderingEffect = ({
  userId,
  files,
  bucket,
  offerId,
  milestoneId,
  text
}: AddRenderingEffectArgs) =>
  T.gen(function* () {
    const logger = yield* Logger
    const transactionOperations = yield* TransactionOperations
    const offerOperations = yield* OfferOperations
    const storageFactory = yield* StorageProviderFactory

    const storage = storageFactory[config.storageProvider]()

    const rebuildPathForSecurity = (path: string): string => {
      const [_, filepath] = path.split('/')

      if (!filepath) {
        throw new Error(`path ${path} is wrong`)
      }

      return `${userId}/filepath`
    }

    return T.all(
      files.map(file =>
        T.tryPromise({
          try: () =>
            storage
              .getFileInfo(bucket)(rebuildPathForSecurity(file.path))
              .then(info => ({
                ...info,
                ...file
              })),
          catch: error => {
            logger.error({
              cause: 'storage_provider_error',
              message: `add ${file.path} error`,
              detailedError: error
            })

            return new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `${file.path}_not_found_in_storage_provider`
            })
          }
        })
      )
    ).pipe(
      T.flatMap(fileinfo =>
        T.tryPromise({
          try: () => offerOperations.getAnOfferByCreatorId(offerId, userId),
          catch: error => {
            logger.error({
              cause: 'database_error',
              message: `get offer ${offerId} db error`,
              detailedError: error
            })

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              return new TRPCError({
                code: 'NOT_FOUND',
                message: 'offer_not_found_for_user'
              })
            }
            return new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'offer_not_found_for_user'
            })
          }
        }).pipe(
          T.filterOrFail(
            offer =>
              offer !== null && offer.milestone.find(m => m.id === milestoneId) !== undefined,
            () => {
              logger.error({
                cause: 'offer_or_milestone_not_found',
                message: `offer ${offerId} or milestone ${milestoneId} not found on db`,
                detailedError: {}
              })
              return new TRPCError({
                code: 'NOT_FOUND',
                message: 'offer_or_milestone_not_found_for_user'
              })
            }
          ),
          T.map(() => fileinfo)
        )
      ),
      T.flatMap(fileInfo =>
        T.tryPromise({
          try: () =>
            transactionOperations.addMilestoneRendering({
              files: fileInfo.map(info => ({
                hash: info.path,
                size: info.size ?? 0,
                mimetype: info.mimetype ?? 'octet/stream',
                originalFilename: info.originalFileName
              })),
              milestoneId,
              text
            }),
          catch: error => {
            logger.error({
              cause: 'database_error',
              message: `transactionOperations addMilestoneRendering ${milestoneId} db accept error`,
              detailedError: error
            })

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              return new TRPCError({
                code: 'NOT_FOUND',
                message: `milestone_not_found_for_user`
              })
            }
            return new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'milestone_not_found_for_user'
            })
          }
        })
      )
    )
  }).pipe(T.flatten)
