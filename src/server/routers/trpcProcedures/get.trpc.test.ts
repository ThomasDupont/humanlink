import { describe, expect, it, vi } from 'vitest'
import { Effect as T } from 'effect'
import { userMeEffect } from './get.trpc'
import { Logger } from '@/server/logger'
import { userOperations, UserOperations } from '../databaseOperations/prisma.provider'
import { afterEach } from 'node:test'

describe('test useMe test', () => {
  const loggerErrorMock = vi.fn()
  const userOperationsMock = {
    getUserByEmail: vi.fn()
  }
  afterEach(() => {
    loggerErrorMock.mockReset()
    userOperationsMock.getUserByEmail.mockReset()
  })
  it('Should return a user', () => {
    const user = {
      id: 2,
      email: 'test@test.com'
    }

    userOperationsMock.getUserByEmail.mockResolvedValueOnce(user)
    userMeEffect('test@test.com')
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(UserOperations, userOperationsMock as unknown as typeof userOperations),
        T.runPromise
      )
      .then(user => {
        expect(user.email).toBe('test@test.com')
      })
  })

  it('Should return a TRPC not found error', () => {
    userOperationsMock.getUserByEmail.mockResolvedValueOnce(null)

    userMeEffect('test@test.com')
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(UserOperations, userOperationsMock as unknown as typeof userOperations),
        T.runPromise
      )
      .catch(e => e) // force assertion if value is resolved
      .then(v => {
        expect(v instanceof Error).toBeTruthy()
        expect(v.message).toBe('NOT_FOUND')
      })
  })

  it('Shoud return a TRPC internal error', () => {
    userOperationsMock.getUserByEmail.mockRejectedValueOnce(new Error('databaseError'))

    userMeEffect('test@test.com')
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(UserOperations, userOperationsMock as unknown as typeof userOperations),
        T.runPromise
      )
      .catch(e => e) // force assertion if value is resolved
      .then(v => {
        expect(v instanceof Error).toBeTruthy()
        expect(v.message).toBe('INTERNAL_SERVER_ERROR')
      })
  })
})
