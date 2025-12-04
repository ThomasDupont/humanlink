import { Logger } from '@/server/logger'
import { Effect as T } from 'effect'
import {
  BalanceOperations,
  TransactionOperations
} from '../../../databaseOperations/prisma.provider'
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { OfferRepository } from '../repositories/offer.repository'
import { transactionOfTerminateOfferPolicy } from '../policies/moneyTransfer.policy'

export const acceptOfferRenderingsAndCreateMoneyTransferEffect = ({
  offerId,
  userId
}: {
  offerId: number
  userId: number
}) =>
  T.gen(function* () {
    const logger = yield* Logger
    const offerRepository = yield* OfferRepository
    const balanceOperations = yield* BalanceOperations
    const transactionOperations = yield* TransactionOperations

    return yield* offerRepository.getAcceptedAndTerminatedOffer({ offerId, userId }).pipe(
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
      T.flatMap(({ offer, balance }) =>
        transactionOfTerminateOfferPolicy({
          _tag: 'base',
          offer,
          balanceId: balance.id
        }).compute()
      ),
      T.flatMap(args =>
        T.tryPromise({
          try: () =>
            transactionOperations.acceptOfferRenderingsAndCreateMoneyTransferTransaction(args),
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
  })
