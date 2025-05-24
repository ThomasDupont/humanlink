import { Logger } from '@/server/logger'
import { Effect as T } from 'effect'
import { OfferOperations, TransactionOperations } from '../../../databaseOperations/prisma.provider'
import { StorageProviderFactory } from '../../../storage/storage.provider'
import config from '@/config'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'
import { rebuildPathForSecurity } from '@/utils/rebuildPathForSecurity'
import { CustomError } from '../error'
import { SendNotificationNewRenderingProvider } from '../utils/sendEmail'

export type AddRenderingEffectArgs = {
  milestoneId: number
  offerId: number
  bucket: string
  userId: number
  text: string | null
  files: {
    originalFilename: string
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
    const sendNotification = yield* SendNotificationNewRenderingProvider

    const storage = storageFactory[config.storageProvider]()

    return T.all(
      files.map(file =>
        T.tryPromise({
          try: () =>
            storage
              .getFileInfo(bucket)(rebuildPathForSecurity(userId, file.path))
              .then(info => ({
                ...info,
                ...file
              })),
          catch: error =>
            new CustomError({
              code: 'INTERNAL_SERVER_ERROR',
              cause: 'storage_provider_error',
              message: `add ${file.path} error`,
              clientMessage: `${file.path}_not_found_in_storage_provider`,
              detailedError: error
            })
        })
      )
    ).pipe(
      T.flatMap(filesInfo =>
        T.tryPromise({
          try: () => offerOperations.getAnOfferByCreatorId(offerId, userId),
          catch: error =>
            new CustomError({
              code:
                error instanceof Prisma.PrismaClientKnownRequestError
                  ? 'NOT_FOUND'
                  : 'INTERNAL_SERVER_ERROR',
              cause: 'database_error',
              message: `get offer ${offerId} db error`,
              detailedError: error,
              clientMessage:
                error instanceof Prisma.PrismaClientKnownRequestError
                  ? 'offer_not_found_for_user'
                  : 'offer_not_found_for_user'
            })
        }).pipe(
          T.flatMap(offer => {
            if (
              offer !== null &&
              offer.milestone.find(m => m.id === milestoneId) !== undefined &&
              offer.userId !== null &&
              offer.userIdReceiver !== null &&
              offer.isAccepted
            ) {
              const { milestone, userId, userIdReceiver, ...rest } = offer
              return T.succeed({
                userIdReceiver,
                userId,
                milestone,
                ...rest
              })
            }

            return T.fail(
              new CustomError({
                code: 'NOT_FOUND',
                cause: 'offer_or_milestone_not_found',
                message: `offer ${offerId} or milestone ${milestoneId} not found on db`,
                detailedError: {},
                clientMessage: 'offer_or_milestone_not_found_for_user'
              })
            )
          }),
          T.map(offer => ({
            filesInfo: filesInfo.map(file => ({
              ...file,
              relatedUsers: [offer.userId, offer.userIdReceiver]
            })),
            receiverId: offer.userIdReceiver
          }))
        )
      ),
      T.flatMap(({ filesInfo, receiverId }) =>
        T.tryPromise({
          try: () =>
            transactionOperations
              .addMilestoneRenderingTransaction({
                files: filesInfo.map(info => ({
                  hash: info.path,
                  size: info.size ?? 0,
                  mimetype: info.mimetype ?? 'octet/stream',
                  originalFilename: info.originalFilename,
                  relatedUsers: info.relatedUsers
                })),
                milestoneId,
                text
              })
              .then(() => receiverId),
          catch: error =>
            new CustomError({
              code:
                error instanceof Prisma.PrismaClientKnownRequestError
                  ? 'NOT_FOUND'
                  : 'INTERNAL_SERVER_ERROR',
              cause: 'database_error',
              message: `transactionOperations addMilestoneRendering ${milestoneId} db accept error`,
              detailedError: error,
              clientMessage:
                error instanceof Prisma.PrismaClientKnownRequestError
                  ? 'milestone_not_found_for_user'
                  : 'milestone_not_found_for_user'
            })
        })
      ),
      T.match({
        onFailure: error => {
          logger.error({
            cause: error.cause,
            message: error.message,
            detailedError: error.detailedError
          })
          throw new TRPCError({
            code: error.code,
            message: error.clientMessage ?? error.message
          })
        },
        onSuccess: receiverId =>
          sendNotification({
            senderId: userId,
            receiverId,
            offerId
          })
      })
    )
  }).pipe(T.flatten)
