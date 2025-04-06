import { Logger } from '@/server/logger'
import { Effect as T } from 'effect'
import { OfferOperations, TransactionOperations } from '../../../databaseOperations/prisma.provider'
import { StorageProviderFactory } from '../../../storage/storage.provider'
import config from '@/config'
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { rebuildPathForSecurity } from '@/utils/rebuildPathForSecurity'

export type DeleteAMilestoneFileEffectArgs = {
  userId: number
  offerId: number
  milestoneId: number
  hash: string
  bucket: string
}
export const deleteAMilestoneFileEffect = ({
  userId,
  offerId,
  milestoneId,
  hash,
  bucket
}: DeleteAMilestoneFileEffectArgs) =>
  T.gen(function* () {
    const logger = yield* Logger
    const transactionOperations = yield* TransactionOperations
    const offerOperations = yield* OfferOperations
    const storageFactory = yield* StorageProviderFactory

    const storage = storageFactory[config.storageProvider]()

    return T.tryPromise({
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
        offer => offer !== null && offer.milestone.find(m => m.id === milestoneId) !== undefined,
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
      T.flatMap(() =>
        T.tryPromise({
          try: () => transactionOperations.deleteAMilestoneFileTransaction(milestoneId, hash),
          catch: error => {
            logger.error({
              cause: 'database_error',
              message: `deleteAMilestoneFile deleteAMilestoneFile ${milestoneId} db accept error`,
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
      ),
      T.flatMap(() =>
        T.tryPromise({
          try: () => storage.getFileInfo(bucket)(rebuildPathForSecurity(userId, hash)),
          catch: error => {
            logger.error({
              cause: 'storage_provider_error',
              message: `del ${hash} error`,
              detailedError: error
            })

            return new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `${hash}_not_found_in_storage_provider`
            })
          }
        })
      )
    )
  }).pipe(T.flatten)
