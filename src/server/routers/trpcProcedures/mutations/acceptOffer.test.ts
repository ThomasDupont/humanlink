import { it, describe, afterEach, vi, expect } from 'vitest'
import { Effect as T } from 'effect'
import { acceptOfferEffect, AcceptOfferEffectArgs } from './acceptOffer'
import { Logger } from '@/server/logger'
import {
  offerOperations,
  OfferOperations,
  transactionOperations,
  TransactionOperations,
  userOperations,
  UserOperations
} from '../../../databaseOperations/prisma.provider'
import {
  paymentProviderFactory,
  PaymentProviderFactory
} from '../../../paymentOperations/payment.provider'
import { MailProviderFactory, mailProviderFactory } from '@/server/emailOperations/email.provider'

describe('upsert service test', () => {
  const sendEmailMock = vi.fn()
  const mailProviderFactoryMock = {
    mailjet: () => ({
      sendEmail: sendEmailMock
    })
  }

  const userOperationsMock = {
    selectUserById: vi.fn()
  }

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
    vi.restoreAllMocks()
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

    userOperationsMock.selectUserById.mockResolvedValueOnce({ firstname: 'John' })
    userOperationsMock.selectUserById.mockResolvedValueOnce({ firstname: 'Josh' })
    sendEmailMock.mockResolvedValueOnce({})

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
        T.provideService(
          MailProviderFactory,
          mailProviderFactoryMock as unknown as typeof mailProviderFactory
        ),
        T.provideService(UserOperations, userOperationsMock as unknown as typeof userOperations),
        T.runPromise
      )
      .then(result => {
        expect(result).toBe(true)
        expect(paymentMock.getPaymentById).toHaveBeenCalledWith('test_p')
        expect(offerOperationsMock.getAnOfferByIdAndReceiverId).toHaveBeenCalledWith(1, 2)
        expect(paymentMock.refundFullTransaction).toBeCalledTimes(0)
        expect(transactionOperationsMock.acceptOfferTransaction).toHaveBeenCalledWith({
          amount: 1000,
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
        T.provideService(
          MailProviderFactory,
          mailProviderFactoryMock as unknown as typeof mailProviderFactory
        ),
        T.provideService(UserOperations, userOperationsMock as unknown as typeof userOperations),
        T.runPromise
      )
      .then(() => true)
      .catch(error => {
        expect(error.message).toBe('transaction_is_not_validated')
        expect(loggerErrorMock).toBeCalledWith({
          cause: 'payment_not_paid',
          message: `payment test_p not paid`,
          detailedError: undefined
        })

        return false
      })
      .then(v => {
        expect(v).toBe(false)
      })
  })

  it('Should return NOT_FOUND for not found offer', async () => {
    const payload: AcceptOfferEffectArgs = {
      offerId: 1,
      paymentProvider: 'stripe',
      userId: 2,
      paymentId: 'test_p'
    }

    paymentMock.getPaymentById.mockResolvedValueOnce({ id: 'test', amount: 1000, paid: true })
    paymentMock.refundFullTransaction.mockResolvedValueOnce({})
    offerOperationsMock.getAnOfferByIdAndReceiverId.mockResolvedValueOnce({
      id: 1,
      userId: null
    })

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
        T.provideService(
          MailProviderFactory,
          mailProviderFactoryMock as unknown as typeof mailProviderFactory
        ),
        T.provideService(UserOperations, userOperationsMock as unknown as typeof userOperations),
        T.runPromise
      )
      .then(() => {
        return true
      })
      .catch(error => {
        expect(error.message).toBe('offer_not_found_for_user')
        expect(paymentMock.refundFullTransaction).toBeCalledTimes(1)
        expect(loggerErrorMock).toBeCalledWith({
          cause: 'offer_not_found',
          message: `offer 1 not found`
        })
        return false
      })
      .then(v => {
        expect(v).toBe(false)
      })
  })
})
