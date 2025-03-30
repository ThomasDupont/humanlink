import { describe, expect, it, vi } from 'vitest'
import { Effect as T } from 'effect'
import { addRenderingEffect } from './addRendering'
import { Logger } from '@/server/logger'
import { storageProviderFactory, StorageProviderFactory } from '../../storage/storage.provider'
import {
  offerOperations,
  OfferOperations,
  transactionOperations,
  TransactionOperations
} from '../../databaseOperations/prisma.provider'

describe('Test addRendering', () => {
  const loggerErrorMock = vi.fn()

  const offerOperationsMock = {
    getAnOfferByCreatorId: vi.fn()
  }

  const transactionOperationsMock = {
    addMilestoneRendering: vi.fn()
  }

  const getFileInfoMock = vi.fn()

  const tigrisMock = {
    getFileInfo: () => getFileInfoMock
  }
  const storageProviderFactoryMock = {
    tigris: () => tigrisMock
  }
  it('Should proceed rendering add', () => {
    getFileInfoMock.mockResolvedValueOnce({
      mimetype: 'test',
      size: 100
    })

    offerOperationsMock.getAnOfferByCreatorId.mockResolvedValueOnce({
      userId: 1,
      userIdReceiver: 3,
      milestone: [
        {
          id: 10
        }
      ]
    })

    transactionOperationsMock.addMilestoneRendering.mockResolvedValueOnce({})

    addRenderingEffect({
      userId: 1,
      offerId: 2,
      milestoneId: 10,
      files: [
        {
          path: '1/test',
          originalFilename: 'foo.bar'
        }
      ],
      bucket: 'bar',
      text: null
    })
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(
          StorageProviderFactory,
          storageProviderFactoryMock as unknown as typeof storageProviderFactory
        ),
        T.provideService(
          TransactionOperations,
          transactionOperationsMock as unknown as typeof transactionOperations
        ),
        T.provideService(OfferOperations, offerOperationsMock as unknown as typeof offerOperations),
        T.runPromise
      )
      .then(() => {
        expect(getFileInfoMock).toHaveBeenCalledWith('1/test')
        expect(transactionOperationsMock.addMilestoneRendering).toHaveBeenCalledWith({
          text: null,
          milestoneId: 10,
          files: [
            {
              size: 100,
              hash: '1/test',
              originalFilename: 'foo.bar',
              mimetype: 'test',
              relatedUsers: [1, 3]
            }
          ]
        })
      })
  })
})
