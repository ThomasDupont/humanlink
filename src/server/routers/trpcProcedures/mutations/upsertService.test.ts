import { it, describe, afterEach, vi, expect } from 'vitest'
import { Effect as T } from 'effect'
import { upsertServiceEffect } from './upsertService'
import config from '@/config'
import { Logger } from '@/server/logger'
import { ServiceOperations, serviceOperations } from '../../../databaseOperations/prisma.provider'
import { Sync } from '../../../databaseOperations/sync/sync'
import { Price, Service } from '@prisma/client'
import { ServiceWithPrice } from '@/types/Services.type'
import { storageProviderFactory, StorageProviderFactory } from '@/server/storage/storage.provider'

describe('upsert service test', () => {
  const loggerErrorMock = vi.fn()
  const serviceOperationsMock = {
    getServiceById: vi.fn(),
    createService: vi.fn(),
    updateService: vi.fn()
  }

  const removeAFileInTheBucketMock = vi.fn()
  const tigrisMock = {
    removeAFileInTheBucket: () => removeAFileInTheBucketMock
  }
  const storageProviderFactoryMock = {
    tigris: () => tigrisMock
  }

  const syncMock = {
    sync: vi.fn(),
    deleteRecord: vi.fn()
  }
  afterEach(() => {
    vi.resetAllMocks()
  })
  it('Should return a ServiceWithPrice (creation)', async () => {
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

    serviceOperationsMock.getServiceById.mockResolvedValueOnce(null)
    serviceOperationsMock.createService.mockResolvedValueOnce(serviceWithPrice)
    syncMock.sync.mockResolvedValueOnce(serviceWithPrice)

    const upsertService = upsertServiceEffect({
      userId: 1,
      service: service,
      serviceId: undefined,
      prices: [price],
      files: []
    })

    await upsertService
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(
          ServiceOperations,
          serviceOperationsMock as unknown as typeof serviceOperations
        ),
        T.provideService(Sync, syncMock),
        T.provideService(
          StorageProviderFactory,
          storageProviderFactoryMock as unknown as typeof storageProviderFactory
        ),
        T.runPromise
      )
      .then(service => {
        expect(service.id).toEqual(1)
        expect(service.prices[0]?.id).toEqual(2)
      })
  })
  it('Should return a ServiceWithPrice (update)', async () => {
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

    serviceOperationsMock.getServiceById.mockResolvedValueOnce(null)
    serviceOperationsMock.updateService.mockResolvedValueOnce(serviceWithPrice)
    syncMock.sync.mockResolvedValueOnce(serviceWithPrice)

    const upsertService = upsertServiceEffect({
      userId: 1,
      service: service,
      serviceId: 1,
      prices: [price],
      files: []
    })

    await upsertService
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(
          ServiceOperations,
          serviceOperationsMock as unknown as typeof serviceOperations
        ),
        T.provideService(Sync, syncMock),
        T.provideService(
          StorageProviderFactory,
          storageProviderFactoryMock as unknown as typeof storageProviderFactory
        ),
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

    serviceOperationsMock.getServiceById.mockResolvedValueOnce(null)
    serviceOperationsMock.updateService.mockResolvedValueOnce(serviceWithPrice)
    const error = new Error('error')
    syncMock.sync.mockRejectedValue(error)

    const upsertService = upsertServiceEffect({
      userId: 1,
      service: service,
      serviceId: 1,
      prices: [price],
      files: []
    })

    const time = Date.now()

    await upsertService
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(
          ServiceOperations,
          serviceOperationsMock as unknown as typeof serviceOperations
        ),
        T.provideService(Sync, syncMock),
        T.provideService(
          StorageProviderFactory,
          storageProviderFactoryMock as unknown as typeof storageProviderFactory
        ),
        T.runPromise
      )
      .then(() => true)
      .catch(err => {
        expect(Date.now() - time).toBeGreaterThan(100)
        expect(err).toBeInstanceOf(Error)
        expect(loggerErrorMock).toBeCalledTimes(1)
        expect(loggerErrorMock).toBeCalledWith({
          cause: 'sync_error',
          message: `service 1 sync error`,
          detailedError: error
        })

        return false
      })
      .then(exit => {
        expect(exit).toBe(false)
      })
  })
})
