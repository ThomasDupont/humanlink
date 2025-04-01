import { afterEach, describe, expect, it, vi } from 'vitest'
import { Effect as T } from 'effect'
import { userMeEffect } from './userMe'
import { Logger } from '@/server/logger'
import { UserOperations, userOperations } from '../../databaseOperations/prisma.provider'

describe('test useMe test', () => {
  const loggerErrorMock = vi.fn()
  const userOperationsMock = {
    getUserById: vi.fn()
  }
  afterEach(() => {
    vi.resetAllMocks()
  })
  it('Should return a user', () => {
    const user = {
      id: 2,
      email: 'test@test.com'
    }

    userOperationsMock.getUserById.mockResolvedValueOnce(user)
    userMeEffect(2)
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
    userOperationsMock.getUserById.mockResolvedValueOnce(null)

    userMeEffect(2)
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
    userOperationsMock.getUserById.mockRejectedValueOnce(new Error('databaseError'))

    userMeEffect(2)
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
