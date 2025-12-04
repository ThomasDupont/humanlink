import { describe, it, afterEach, vi, expect } from 'vitest'
import { Effect as T } from 'effect'
import { Prisma } from '@prisma/client'
import { CreateOffer, createOfferWithMessageEffect } from './createOfferWithMessage'
import { Logger } from '@/server/logger'
import { offerOperations, OfferOperations } from '../../../databaseOperations/prisma.provider'
import { sendMessageProvider, SendMessageProvider } from '../effectAsService'

describe('createOfferWithMessageEffect', () => {
  const loggerErrorMock = vi.fn()
  const offerOperationsMock = { createAnOffer: vi.fn() }
  const sendMessageMock = vi.fn()

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create an offer and send a message successfully', async () => {
    const payload = { serviceId: 1, userId: 2, userIdReceiver: 3 }
    const createdOffer = { id: 10 }
    offerOperationsMock.createAnOffer.mockResolvedValueOnce(createdOffer)
    sendMessageMock.mockReturnValueOnce(T.succeed(undefined))

    await createOfferWithMessageEffect(payload as CreateOffer)
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(OfferOperations, offerOperationsMock as unknown as typeof offerOperations),
        T.provideService(
          SendMessageProvider,
          sendMessageMock as unknown as typeof sendMessageProvider
        ),
        T.runPromise
      )
      .then(result => {
        expect(result).toEqual(createdOffer)
        expect(offerOperationsMock.createAnOffer).toHaveBeenCalledWith(payload)
        expect(sendMessageMock).toHaveBeenCalledWith({
          senderId: payload.userId,
          receiverId: payload.userIdReceiver,
          offerId: createdOffer.id,
          message: ''
        })
      })
  })

  it('should return NOT_FOUND error on known Prisma client error', async () => {
    const payload = { serviceId: 5, userId: 7, userIdReceiver: 8 }
    const dbError = new Prisma.PrismaClientKnownRequestError('fail', {
      code: 'P2002',
      clientVersion: '1.0'
    })
    offerOperationsMock.createAnOffer.mockRejectedValueOnce(dbError)

    await createOfferWithMessageEffect(payload as CreateOffer)
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(OfferOperations, offerOperationsMock as unknown as typeof offerOperations),
        T.provideService(
          SendMessageProvider,
          sendMessageMock as unknown as typeof sendMessageProvider
        ),
        T.runPromise
      )
      .then(() => true)
      .catch(error => {
        expect(loggerErrorMock).toHaveBeenCalledWith({
          cause: 'database_error',
          message: `offer for service ${payload.serviceId} db create error`,
          detailedError: dbError
        })
        // TRPCError default message is the error code
        expect(error.message).toBe('NOT_FOUND')
        return false
      })
      .then(v => {
        expect(v).toBe(false)
      })
  })

  it('should return INTERNAL_SERVER_ERROR on generic error', async () => {
    const payload = { serviceId: 9, userId: 4, userIdReceiver: 6 }
    const genericError = new Error('oops')
    offerOperationsMock.createAnOffer.mockRejectedValueOnce(genericError)

    await createOfferWithMessageEffect(payload as CreateOffer)
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(OfferOperations, offerOperationsMock as unknown as typeof offerOperations),
        T.provideService(
          SendMessageProvider,
          sendMessageMock as unknown as typeof sendMessageProvider
        ),
        T.runPromise
      )
      .then(() => true)
      .catch(error => {
        expect(loggerErrorMock).toHaveBeenCalledWith({
          cause: 'database_error',
          message: `offer for service ${payload.serviceId} db create error`,
          detailedError: genericError
        })
        // TRPCError default message is the error code
        expect(error.message).toBe('INTERNAL_SERVER_ERROR')
        return false
      })
      .then(v => {
        expect(v).toBe(false)
      })
  })
})
