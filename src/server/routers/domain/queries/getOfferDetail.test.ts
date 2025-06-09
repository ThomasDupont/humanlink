import { afterEach, describe, expect, it, vi } from 'vitest'
import { Effect as T } from 'effect'
import { getOfferDetailEffect } from './getOfferDetail'
import { Logger } from '@/server/logger'
import {
  OfferOperations,
  ServiceOperations,
  offerOperations,
  serviceOperations
} from '../../../databaseOperations/prisma.provider'

describe('test getOfferDetail test', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })
  it('Should return a valid offer', () => {
    const loggerErrorMock = vi.fn()

    const offerOperationsMock = {
      getOfferDetailById: vi.fn()
    }

    const serviceOperationMock = {
      getServiceById: vi.fn()
    }

    const offerDetail = {
      id: 1,
      userId: 1,
      userIdReceiver: 2,
      serviceId: 1,
      milestone: [
        {
          id: 1,
          priceMilestone: 100
        }
      ]
    }

    const service = {
      id: 1,
      name: 'service1'
    }

    offerOperationsMock.getOfferDetailById.mockResolvedValueOnce(offerDetail)
    serviceOperationMock.getServiceById.mockResolvedValueOnce(service)

    getOfferDetailEffect(1, 1)
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(OfferOperations, offerOperationsMock as unknown as typeof offerOperations),
        T.provideService(
          ServiceOperations,
          serviceOperationMock as unknown as typeof serviceOperations
        ),
        T.runPromise
      )
      .then(offer => {
        expect(offer).toEqual({
          id: 1,
          userId: 1,
          userIdReceiver: 2,
          serviceId: 1,
          milestone: [
            {
              id: 1,
              priceMilestone: 100
            }
          ],
          service: {
            id: 1,
            name: 'service1'
          }
        })
      })
  })
  it('Should throw a forbidden error', () => {
    const loggerErrorMock = vi.fn()

    const offerOperationsMock = {
      getOfferDetailById: vi.fn()
    }

    const serviceOperationMock = {
      getServiceById: vi.fn()
    }

    const offerDetail = {
      id: 1,
      userId: 1,
      userIdReceiver: 2,
      serviceId: 1,
      milestone: [
        {
          id: 1,
          priceMilestone: 100
        }
      ]
    }

    const service = {
      id: 1,
      name: 'service1'
    }

    offerOperationsMock.getOfferDetailById.mockResolvedValueOnce(offerDetail)
    serviceOperationMock.getServiceById.mockResolvedValueOnce(service)

    getOfferDetailEffect(3, 1)
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(OfferOperations, offerOperationsMock as unknown as typeof offerOperations),
        T.provideService(
          ServiceOperations,
          serviceOperationMock as unknown as typeof serviceOperations
        ),
        T.runPromise
      )
      .catch(e => e) // force assertion if value is resolved
      .then(result => {
        expect(result instanceof Error).toBeTruthy()
        expect(result.message).toBe('offer_not_allowed')
      })
  })
})
