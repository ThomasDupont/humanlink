import { it, describe, afterEach, vi, expect } from 'vitest'
import { Effect as T } from 'effect'
import { upsertServiceEffect } from './upsert.trpc'
import config from '@/config'
import { Logger } from '@/server/logger'
import { ServiceOperations, serviceOperations } from '../databaseOperations/prisma.provider'
import { Sync } from '../databaseOperations/sync/sync'
import { Price, Service } from '@prisma/client'
import { ServiceWithPrice } from '@/types/Services.type'

describe('upsert trpc test (Service)', () => {
  describe('upsertService', () => {
    const loggerErrorMock = vi.fn()
    const serviceOperationsMock = {
      createService: vi.fn(),
      updateService: vi.fn()
    }

    const syncMock = {
      sync: vi.fn(),
      deleteRecord: vi.fn()
    }
    afterEach(() => {
      loggerErrorMock.mockReset()
      serviceOperationsMock.createService.mockReset()
      serviceOperationsMock.updateService.mockReset()
      syncMock.sync.mockReset()
      syncMock.deleteRecord.mockReset()
    })
    it('Should return a ServiceWithPrice (creation)', () => {
      const service: Omit<Service, 'id' | 'createdAt' | 'userId'> = {
        title: 'testTitle',
        description: 'testDescription',
        descriptionShort: 'testDescriptionShort',
        category: 'CopywritingAndTranslation',
        langs: ['FR'],
        type: config.serviceTypeFromCategory['CopywritingAndTranslation'],
        // ---- MVP default
        images: ['https://picsum.photos/1000/625'],
        localisation: '',
        renewable: false
      }

      const price: Omit<Price, 'serviceId'> = {
        id: 0,
        number: 1000,
        // ---- MVP default
        type: 'fix',
        currency: 'EUR'
      }

      const serviceWithPrice: ServiceWithPrice = {
        ...service,
        id: 1,
        userId: 1,
        createdAt: new Date(),
        prices: [
          {
            ...price,
            serviceId: 1,
            id: 2
          }
        ]
      }

      serviceOperationsMock.createService.mockResolvedValueOnce(serviceWithPrice)
      syncMock.sync.mockResolvedValueOnce(serviceWithPrice)

      const upsertService = upsertServiceEffect({
        userId: 1,
        service: service,
        serviceId: undefined,
        prices: [price]
      })

      upsertService
        .pipe(
          T.provideService(Logger, { error: loggerErrorMock }),
          T.provideService(
            ServiceOperations,
            serviceOperationsMock as unknown as typeof serviceOperations
          ),
          T.provideService(Sync, syncMock),
          T.runPromise
        )
        .then(service => {
          expect(service.id).toEqual(1)
          expect(service.prices[0]?.id).toEqual(2)
        })
    })
    it('Should return a ServiceWithPrice (update)', () => {
      const service: Omit<Service, 'id' | 'createdAt' | 'userId'> = {
        title: 'testTitle',
        description: 'testDescription',
        descriptionShort: 'testDescriptionShort',
        category: 'CopywritingAndTranslation',
        langs: ['FR'],
        type: config.serviceTypeFromCategory['CopywritingAndTranslation'],
        // ---- MVP default
        images: ['https://picsum.photos/1000/625'],
        localisation: '',
        renewable: false
      }

      const price: Omit<Price, 'serviceId'> = {
        id: 2,
        number: 1000,
        // ---- MVP default
        type: 'fix',
        currency: 'EUR'
      }

      const serviceWithPrice: ServiceWithPrice = {
        ...service,
        id: 1,
        userId: 1,
        createdAt: new Date(),
        prices: [
          {
            ...price,
            serviceId: 1
          }
        ]
      }

      serviceOperationsMock.updateService.mockResolvedValueOnce(serviceWithPrice)
      syncMock.sync.mockResolvedValueOnce(serviceWithPrice)

      const upsertService = upsertServiceEffect({
        userId: 1,
        service: service,
        serviceId: 1,
        prices: [price]
      })

      upsertService
        .pipe(
          T.provideService(Logger, { error: loggerErrorMock }),
          T.provideService(
            ServiceOperations,
            serviceOperationsMock as unknown as typeof serviceOperations
          ),
          T.provideService(Sync, syncMock),
          T.runPromise
        )
        .then(service => {
          expect(service.id).toEqual(1)
          expect(service.prices[0]?.id).toEqual(2)
        })
    })
    it('Should have an error (sync_error)', async () => {
      const service: Omit<Service, 'id' | 'createdAt' | 'userId'> = {
        title: 'testTitle',
        description: 'testDescription',
        descriptionShort: 'testDescriptionShort',
        category: 'CopywritingAndTranslation',
        langs: ['FR'],
        type: config.serviceTypeFromCategory['CopywritingAndTranslation'],
        // ---- MVP default
        images: ['https://picsum.photos/1000/625'],
        localisation: '',
        renewable: false
      }

      const price: Omit<Price, 'serviceId'> = {
        id: 2,
        number: 1000,
        // ---- MVP default
        type: 'fix',
        currency: 'EUR'
      }

      const serviceWithPrice: ServiceWithPrice = {
        ...service,
        id: 1,
        userId: 1,
        createdAt: new Date(),
        prices: [
          {
            ...price,
            serviceId: 1
          }
        ]
      }

      serviceOperationsMock.updateService.mockResolvedValueOnce(serviceWithPrice)
      syncMock.sync.mockRejectedValue(new Error('error'))

      const upsertService = upsertServiceEffect({
        userId: 1,
        service: service,
        serviceId: 1,
        prices: [price]
      })

      const time = Date.now()

      await upsertService.pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(
          ServiceOperations,
          serviceOperationsMock as unknown as typeof serviceOperations
        ),
        T.provideService(Sync, syncMock),
        T.mapError(e => {
          expect(Date.now() - time).toBeGreaterThan(100)
          expect(e).toBeInstanceOf(Error)
          expect(loggerErrorMock).toBeCalledTimes(2)
          expect(loggerErrorMock).toBeCalledWith({
            cause: 'sync_error',
            message: `service 1 sync error`,
            detailedError: 'error'
          })
        }),
        T.runPromiseExit
      )
    })
  })
})
