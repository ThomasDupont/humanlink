import { describe, expect, it, vi } from 'vitest'
import { Effect as T } from 'effect'
import { addRenderingEffect } from './addRendering'
import { Logger } from '@/server/logger'
import { storageProviderFactory, StorageProviderFactory } from '../../../storage/storage.provider'
import {
  offerOperations,
  OfferOperations,
  transactionOperations,
  TransactionOperations
} from '../../../databaseOperations/prisma.provider'
import {
  sendNotificationNewRenderingProvider,
  SendNotificationNewRenderingProvider
} from '../utils/sendEmail'

describe('Test addRendering', () => {
  const loggerErrorMock = vi.fn()

  const offerOperationsMock = {
    getAnOfferByCreatorId: vi.fn()
  }

  const transactionOperationsMock = {
    addMilestoneRenderingTransaction: vi.fn()
  }

  const getFileInfoMock = vi.fn()

  const sendMessageMock = vi.fn()

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
      isAccepted: true,
      milestone: [
        {
          id: 10
        }
      ]
    })

    transactionOperationsMock.addMilestoneRenderingTransaction.mockResolvedValueOnce({})

    sendMessageMock.mockResolvedValueOnce(true)

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
        T.provideService(
          SendNotificationNewRenderingProvider,
          sendMessageMock as unknown as typeof sendNotificationNewRenderingProvider
        ),
        T.runPromise
      )
      .catch(v => {
        console.error(v)
        return v
      })
      .then(() => {
        expect(getFileInfoMock).toHaveBeenCalledWith('1/test')
        expect(transactionOperationsMock.addMilestoneRenderingTransaction).toHaveBeenCalledWith({
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

  it('Should return an Error when offer is not accepted', () => {
    getFileInfoMock.mockResolvedValueOnce({
      mimetype: 'test',
      size: 100
    })

    offerOperationsMock.getAnOfferByCreatorId.mockResolvedValueOnce({
      userId: 1,
      userIdReceiver: 3,
      isAccepted: false,
      milestone: [
        {
          id: 10
        }
      ]
    })

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
        T.provideService(
          SendNotificationNewRenderingProvider,
          sendMessageMock as unknown as typeof sendNotificationNewRenderingProvider
        ),
        T.runPromise
      )
      .then(() => true)
      .catch(error => {
        expect(error.message).equals('offer_or_milestone_not_found_for_user')
        return false
      })
      .then(v => {
        expect(v).toBe(false)
      })
  })
})
