import { describe, expect, it, vi } from 'vitest'
import { Effect as T } from 'effect'
import { getContactListEffect } from './getContactList'
import { Logger } from '@/server/logger'
import {
  messageOperations,
  MessageOperations,
  userOperations,
  UserOperations
} from '../../../databaseOperations/prisma.provider'
import { afterEach } from 'node:test'

describe('test getContactList test', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('Should return a list of contact', async () => {
    const loggerErrorMock = vi.fn()
    const userOperationsMock = {
      getUserByIds: vi.fn()
    }
    const messageOperationsMock = {
      getContactList: vi.fn(),
      hasUnreadMessages: vi.fn()
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
    userOperationsMock.getUserByIds.mockResolvedValueOnce([
      {
        id: 2,
        firstname: 'branda',
        lastname: 'doe',
        image: ''
      },
      {
        id: 3,
        firstname: 'brandon',
        lastname: 'doe',
        image: ''
      },
      {
        id: 22,
        firstname: 'brandy',
        lastname: 'doe',
        image: ''
      }
    ])
    messageOperationsMock.hasUnreadMessages.mockResolvedValueOnce(false)
    messageOperationsMock.hasUnreadMessages.mockResolvedValueOnce(false)
    messageOperationsMock.hasUnreadMessages.mockResolvedValueOnce(false)

    const list = await getContactListEffect(21).pipe(
      T.provideService(Logger, { error: loggerErrorMock }),
      T.provideService(UserOperations, userOperationsMock as unknown as typeof userOperations),
      T.provideService(
        MessageOperations,
        messageOperationsMock as unknown as typeof messageOperations
      ),
      T.runPromise
    )

    expect(list.length).toBe(3)
    expect(list[0]?.id).toBe(2)
    expect(list[1]?.id).toBe(3)
    expect(list[2]?.id).toBe(22)
    expect(messageOperationsMock.getContactList).toHaveBeenCalledWith(21)
    expect(userOperationsMock.getUserByIds).toHaveBeenCalledTimes(1)
  })

  it('Should return a list of contact with one user not found', async () => {
    const loggerErrorMock = vi.fn()
    const userOperationsMock = {
      getUserByIds: vi.fn()
    }
    const messageOperationsMock = {
      getContactList: vi.fn(),
      hasUnreadMessages: vi.fn()
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
    userOperationsMock.getUserByIds.mockResolvedValueOnce([
      {
        id: 2,
        firstname: 'branda',
        lastname: 'doe',
        image: ''
      },
      {
        id: 22,
        firstname: 'brandy',
        lastname: 'doe',
        image: ''
      }
    ])
    messageOperationsMock.hasUnreadMessages.mockResolvedValueOnce(false)
    messageOperationsMock.hasUnreadMessages.mockResolvedValueOnce(false)

    const list = await getContactListEffect(21).pipe(
      T.provideService(Logger, { error: loggerErrorMock }),
      T.provideService(UserOperations, userOperationsMock as unknown as typeof userOperations),
      T.provideService(
        MessageOperations,
        messageOperationsMock as unknown as typeof messageOperations
      ),
      T.runPromise
    )

    expect(list[0]?.id).toBe(2)
    expect(list[1]?.id).toBe(22)
    expect(messageOperationsMock.getContactList).toHaveBeenCalledWith(21)
    expect(userOperationsMock.getUserByIds).toHaveBeenCalledTimes(1)
  })
})
