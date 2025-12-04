import { OfferOperations, TransactionOperations } from '@/server/databaseOperations/prisma.provider'
import { Logger } from '@/server/logger'
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { Effect as T } from 'effect'

export type CloseMilestoneArgs = {
  userId: number
  milestoneId: number
  offerId: number
}

export const closeMilestoneEffect = ({ offerId, userId, milestoneId }: CloseMilestoneArgs) =>
  T.gen(function* () {
    const logger = yield* Logger
    const transactionOperations = yield* TransactionOperations
    const offerOperations = yield* OfferOperations

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
        offer => offer !== null,
        () => {
          logger.error({
            cause: 'offer_not_found',
            message: `offer ${offerId} not found on db`,
            detailedError: {}
          })
          return new TRPCError({
            code: 'NOT_FOUND',
            message: 'offer_not_found'
          })
        }
      ),
      T.map(offer => {
        const milestone = offer.milestone.find(m => m.id === milestoneId) ?? null

        if (milestone === null) {
          logger.error({
            cause: 'milestone_not_found',
            message: `offer ${offerId} do not have ${milestoneId} on db`,
            detailedError: {}
          })
          return T.fail(
            new TRPCError({
              code: 'NOT_FOUND',
              message: 'milestone_not_found'
            })
          )
        }

        const countTerminatedMilestone = offer.milestone.reduce((acc, m) => {
          if (m.terminatedAt) {
            return (acc += 1)
          }

          return acc
        }, 0)

        return T.succeed({
          hasDoneAllMilestone: countTerminatedMilestone + 1 === offer.milestone.length
        })
      }),
      T.flatten,
      T.flatMap(({ hasDoneAllMilestone }) =>
        T.tryPromise({
          try: () =>
            transactionOperations.closeMilestoneAndOfferTransaction({
              milestoneId,
              offerId,
              hasDoneAllMilestone
            }),
          catch: error => {
            logger.error({
              cause: 'database_error',
              message: `closeMilestoneAndOfferTransaction milestone ${milestoneId}, offer ${offerId} db error`,
              detailedError: error
            })

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              return new TRPCError({
                code: 'NOT_FOUND',
                message: `milestone_not_found`
              })
            }
            return new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'update_milestone_error'
            })
          }
        })
      )
    )
  }).pipe(T.flatten)
