import { Logger } from '@/server/logger'
import { Effect as T } from 'effect'
import {
  BalanceOperations,
  OfferOperations,
  TransactionOperations
} from '../../../databaseOperations/prisma.provider'
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import config from '@/config'

export const acceptOfferRenderingsAndCreateMoneyTransfertEffect = ({
  offerId,
  userId
}: {
  offerId: number
  userId: number
}) =>
  T.gen(function* () {
    const logger = yield* Logger
    const offerOperations = yield* OfferOperations
    const balanceOperations = yield* BalanceOperations
    const transactionOperations = yield* TransactionOperations

    return T.tryPromise({
      try: () => offerOperations.getAnAcceptedAndTerminatedOfferByIdAndReceiverId(offerId, userId),
      catch: error => {
        logger.error({
          cause: 'database_error',
          message: `get offer ${offerId} db error`,
          detailedError: error
        })

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          return new TRPCError({
            code: 'NOT_FOUND',
            message: 'offer_not_found_for_user_or_not_accepted_or_not_terminated'
          })
        }
        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'offer_not_found_for_user_or_not_accepted_or_not_terminated'
        })
      }
    }).pipe(
      T.flatMap(offer => {
        if (offer !== null && offer.userId !== null) {
          const { userId, ...rest } = offer
          return T.succeed({
            userId,
            ...rest
          })
        }

        logger.error({
          cause: 'offer_not_found',
          message: `offer ${offerId} not found on db`,
          detailedError: {}
        })
        return T.fail(
          new TRPCError({
            code: 'NOT_FOUND',
            message: 'offer_not_found_for_user'
          })
        )
      }),
      T.flatMap(offer =>
        T.tryPromise({
          try: () => balanceOperations.getUserBalance(offer.userId),
          catch: error => {
            logger.error({
              cause: 'database_error',
              message: `get userBalance for ${offer.userId} db error`,
              detailedError: error
            })

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              return new TRPCError({
                code: 'NOT_FOUND',
                message: 'balance_not_found_for_user'
              })
            }
            return new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'balance_not_found_for_user'
            })
          }
        }).pipe(
          T.filterOrFail(
            balance => balance !== null,
            () => {
              logger.error({
                cause: 'balance_not_found',
                message: `balance ${userId} not found on db`,
                detailedError: {}
              })
              return new TRPCError({
                code: 'NOT_FOUND',
                message: 'balance_not_found_for_user'
              })
            }
          ),
          T.map(balance => ({ balance, offer }))
        )
      ),
      T.map(({ offer, balance }) => {
        const computedAmount = offer.milestone.reduce(
          (acc, milestone) => acc + milestone.priceMilestone.number,
          0
        )

        const fees = computedAmount * config.fees

        return {
          sellerId: offer.userId,
          balanceId: balance.id,
          fees,
          amount: computedAmount - fees,
          userId,
          offerId
        }
      }),
      T.flatMap(args =>
        T.tryPromise({
          try: () =>
            transactionOperations.acceptOfferRenderingsAndCreateMoneyTransfertTransaction(args),
          catch: error => {
            logger.error({
              cause: 'database_error',
              message: `accept offer rendering ${offerId} db error`,
              detailedError: error
            })

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              return new TRPCError({
                code: 'NOT_FOUND',
                message: `offer_not_found_for_user`
              })
            }
            return new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `offer_not_found_for_user`
            })
          }
        })
      )
    )
  }).pipe(T.flatten)
