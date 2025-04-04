import { it, describe, afterEach, vi, expect } from 'vitest'
import { Effect as T } from 'effect'
import { acceptOfferEffect, AcceptOfferEffectArgs } from './acceptOffer'
import { Logger } from '@/server/logger'
import {
  offerOperations,
  OfferOperations,
  transactionOperations,
  TransactionOperations
} from '../../databaseOperations/prisma.provider'
import {
  paymentProviderFactory,
  PaymentProviderFactory
} from '../../paymentOperations/payment.provider'

describe('upsert service test', () => {
  const loggerErrorMock = vi.fn()
  const transactionOperationsMock = {
    acceptOfferTransaction: vi.fn()
  }

  const offerOperationsMock = {
    getAnOfferByIdAndReceiverId: vi.fn()
  }

  const paymentMock = {
    getPaymentById: vi.fn(),
    refundFullTransaction: vi.fn()
  }

  const paymentProviderFactoryMock = {
    stripe: () => paymentMock
  }
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('Should accept the offer', async () => {
    const payload: AcceptOfferEffectArgs = {
      offerId: 1,
      paymentProvider: 'stripe',
      userId: 2,
      paymentId: 'test_p'
    }

    paymentMock.getPaymentById.mockResolvedValueOnce({ id: 'test', amount: 1000, paid: true })
    transactionOperationsMock.acceptOfferTransaction.mockResolvedValue({ id: 2 })
    offerOperationsMock.getAnOfferByIdAndReceiverId.mockResolvedValueOnce({
      id: 1,
      userId: 3
    })

    const acceptOffer = acceptOfferEffect(payload)

    await acceptOffer
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(OfferOperations, offerOperationsMock as unknown as typeof offerOperations),
        T.provideService(
          TransactionOperations,
          transactionOperationsMock as unknown as typeof transactionOperations
        ),
        T.provideService(
          PaymentProviderFactory,
          paymentProviderFactoryMock as unknown as typeof paymentProviderFactory
        ),
        T.runPromise
      )
      .then(result => {
        expect(result).toBe(true)
        expect(paymentMock.getPaymentById).toHaveBeenCalledWith('test_p')
        expect(offerOperationsMock.getAnOfferByIdAndReceiverId).toHaveBeenCalledWith(1, 2)
        expect(paymentMock.refundFullTransaction).toBeCalledTimes(0)
        expect(transactionOperationsMock.acceptOfferTransaction).toHaveBeenCalledWith({
          amount: 1000,
          eventType: 'payment',
          sellerId: 3,
          offerId: 1,
          providerPaymentId: 'test_p',
          userId: 2,
          provider: 'stripe'
        })
      })
  })

  it('Should return FORBIDDEN for unpaid payment', async () => {
    const payload: AcceptOfferEffectArgs = {
      offerId: 1,
      paymentProvider: 'stripe',
      userId: 2,
      paymentId: 'test_p'
    }

    paymentMock.getPaymentById.mockResolvedValueOnce({ id: 'test', amount: 1000, paid: false })
    paymentMock.refundFullTransaction.mockResolvedValueOnce({})

    const acceptOffer = acceptOfferEffect(payload)

    await acceptOffer
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(
          TransactionOperations,
          transactionOperationsMock as unknown as typeof transactionOperations
        ),
        T.provideService(OfferOperations, offerOperationsMock as unknown as typeof offerOperations),
        T.provideService(
          PaymentProviderFactory,
          paymentProviderFactoryMock as unknown as typeof paymentProviderFactory
        ),
        T.mapError(error => {
          expect(error.message).toBe('FORBIDDEN')
          expect(paymentMock.refundFullTransaction).toBeCalledTimes(1)
          expect(loggerErrorMock).toBeCalledWith({
            cause: 'payment_not_paid',
            message: `payment for user 2 of id test_p not paid`,
            detailedError: {}
          })
        }),
        T.runPromiseExit
      )
      .then(exit => {
        expect(exit._tag).toBe('Failure')
      })
  })
})
