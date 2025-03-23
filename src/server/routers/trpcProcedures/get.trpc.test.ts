import { describe, expect, it, vi } from 'vitest'
import { Effect as T } from 'effect'
import { getContactListEffect, userMeEffect } from './get.trpc'
import { Logger } from '@/server/logger'
import {
  messageOperations,
  MessageOperations,
  userOperations,
  UserOperations
} from '../databaseOperations/prisma.provider'
import { afterEach } from 'node:test'

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

describe('test getContactList test', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('Should return a list of contact', () => {
    const loggerErrorMock = vi.fn()
    const userOperationsMock = {
      getUserById: vi.fn()
    }
    const messageOperationsMock = {
      getContactList: vi.fn()
    }
    const contactList = [
      {
        senderId: 21,
        receiverId: 2,
        readAt: null,
        _max: {
          createdAt: new Date('10/21/2023')
        }
      },
      {
        senderId: 21,
        receiverId: 3,
        readAt: null,
        _max: {
          createdAt: new Date('10/20/2023')
        }
      },
      {
        senderId: 22,
        receiverId: 21,
        readAt: null,
        _max: {
          createdAt: new Date('10/19/2023')
        }
      },
      {
        senderId: 21,
        receiverId: 22,
        readAt: null,
        _max: {
          createdAt: new Date('10/19/2023')
        }
      }
    ]
    messageOperationsMock.getContactList.mockResolvedValueOnce(contactList)
    userOperationsMock.getUserById.mockResolvedValueOnce({
      id: 2,
      firstname: 'branda',
      lastname: 'doe',
      image: ''
    })

    userOperationsMock.getUserById.mockResolvedValueOnce({
      id: 3,
      firstname: 'brandon',
      lastname: 'doe',
      image: ''
    })

    userOperationsMock.getUserById.mockResolvedValueOnce({
      id: 22,
      firstname: 'brandy',
      lastname: 'doe',
      image: ''
    })

    getContactListEffect(21)
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(UserOperations, userOperationsMock as unknown as typeof userOperations),
        T.provideService(
          MessageOperations,
          messageOperationsMock as unknown as typeof messageOperations
        ),
        T.runPromise
      )
      .then(list => {
        expect(list.length).toBe(3)
        expect(list[0]?.id).toBe(2)
        expect(list[1]?.id).toBe(3)
        expect(list[2]?.id).toBe(22)
        expect(messageOperationsMock.getContactList).toHaveBeenCalledWith(21)
        expect(userOperationsMock.getUserById).toHaveBeenCalledTimes(3)
      })
  })

  it('Should return a list of contact with one user not found', () => {
    const loggerErrorMock = vi.fn()
    const userOperationsMock = {
      getUserById: vi.fn()
    }
    const messageOperationsMock = {
      getContactList: vi.fn()
    }
    const contactList = [
      {
        senderId: 21,
        receiverId: 2,
        readAt: null,
        _max: {
          createdAt: new Date('10/21/2023')
        }
      },
      {
        senderId: 21,
        receiverId: 3,
        readAt: null,
        _max: {
          createdAt: new Date('10/20/2023')
        }
      },
      {
        senderId: 22,
        receiverId: 21,
        readAt: null,
        _max: {
          createdAt: new Date('10/19/2023')
        }
      }
    ]
    messageOperationsMock.getContactList.mockResolvedValueOnce(contactList)
    userOperationsMock.getUserById.mockResolvedValueOnce({
      id: 2,
      firstname: 'branda',
      lastname: 'doe',
      image: ''
    })

    userOperationsMock.getUserById.mockResolvedValueOnce(null)

    userOperationsMock.getUserById.mockResolvedValueOnce({
      id: 22,
      firstname: 'brandy',
      lastname: 'doe',
      image: ''
    })

    getContactListEffect(21)
      .pipe(
        T.provideService(Logger, { error: loggerErrorMock }),
        T.provideService(UserOperations, userOperationsMock as unknown as typeof userOperations),
        T.provideService(
          MessageOperations,
          messageOperationsMock as unknown as typeof messageOperations
        ),
        T.runPromise
      )
      .then(list => {
        expect(list[0]?.id).toBe(2)
        expect(list[1]?.id).toBe(22)
        expect(messageOperationsMock.getContactList).toHaveBeenCalledWith(21)
        expect(userOperationsMock.getUserById).toHaveBeenCalledTimes(3)
      })
  })
})
