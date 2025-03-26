import { afterEach, describe, expect, it, vi } from 'vitest'
import { Effect as T } from 'effect'
import { uploadFilesEffect } from './uploadFile'
import formidable from 'formidable'
import { Logger } from '@/server/logger'
import { StorageProviderFactory, storageProviderFactory } from '../../storage/storage.provider'

describe('upload service test', () => {
  const loggerErrorMock = vi.fn()

  const removeAFileInTheBucketMock = vi.fn()
  const addAFileToTheBucketMock = vi.fn()

  const tigrisMock = {
    removeAFileInTheBucket: () => removeAFileInTheBucketMock,
    addAFileToTheBucket: () => addAFileToTheBucketMock
  }
  const storageProviderFactoryMock = {
    tigris: () => tigrisMock
  }

  afterEach(() => {
    vi.resetAllMocks()
  })
  it('Should return the list of file uploaded', () => {
    const files: formidable.File[] = [
      {
        filepath: 'test/test',
        hash: '123455eade',
        mimetype: 'jpeg',
        originalFilename: 'test.jpeg'
      } as formidable.File
    ]

    addAFileToTheBucketMock.mockResolvedValue(true)

    uploadFilesEffect(files, 'test', 0)
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(
          StorageProviderFactory,
          storageProviderFactoryMock as typeof storageProviderFactory
        ),
        T.runPromise
      )
      .then(files => {
        expect(files[0]?.filepath).equal('test/test')
      })
  })
})
