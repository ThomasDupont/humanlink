import { afterEach, describe, expect, it, vi } from 'vitest'
import { Effect as T } from 'effect'
import { acceptOfferRenderingsAndCreateMoneyTransferEffect } from './acceptOfferRenderingsAndCreateMoneyTransfert'
import { Logger } from '@/server/logger'
import {
  balanceOperations,
  BalanceOperations,
  TransactionOperations,
  transactionOperations
} from '@/server/databaseOperations/prisma.provider'
import config from '@/config'
import { OfferRepository } from '../repositories/offer.repository'

describe('test acceptOfferRenderingsAndCreateMoneyTransfer', () => {
  const loggerErrorMock = vi.fn()
  const transactionOperationsMock = {
    acceptOfferRenderingsAndCreateMoneyTransferTransaction: vi.fn()
  }

  const balanceOperationsMock = {
    getUserBalance: vi.fn()
  }
  const offerRepositoryMock = {
    getAcceptedAndTerminatedOffer: vi.fn(),
    getValidOfferForRendering: vi.fn()
  }
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('Should do the procedure without error', async () => {
    offerRepositoryMock.getAcceptedAndTerminatedOffer.mockReturnValue(
      T.succeed({
        id: 1,
        userId: 3,
        userIdReceiver: 2,
        milestone: [
          {
            id: 10,
            priceMilestone: {
              number: 1000
            }
          },
          {
            id: 11,
            priceMilestone: {
              number: 200
            }
          }
        ]
      })
    )
    balanceOperationsMock.getUserBalance.mockResolvedValueOnce({ id: 10 })
    transactionOperationsMock.acceptOfferRenderingsAndCreateMoneyTransferTransaction.mockResolvedValueOnce(
      true
    )

    const fees = 1200 * config.fees
    const netAmount = 1200 - fees
    await acceptOfferRenderingsAndCreateMoneyTransferEffect({
      offerId: 1,
      userId: 2
    }).pipe(
      T.provideService(Logger, { error: loggerErrorMock }),
      T.provideService(OfferRepository, offerRepositoryMock),
      T.provideService(
        TransactionOperations,
        transactionOperationsMock as unknown as typeof transactionOperations
      ),
      T.provideService(
        BalanceOperations,
        balanceOperationsMock as unknown as typeof balanceOperations
      ),
      T.runPromise
    )

    expect(
      transactionOperationsMock.acceptOfferRenderingsAndCreateMoneyTransferTransaction
    ).toHaveBeenCalledWith({
      amount: netAmount,
      offerId: 1,
      fees,
      userId: 2,
      sellerId: 3,
      balanceId: 10
    })
  })
})
