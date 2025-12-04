import { Effect as T } from 'effect'
import { Logger } from '@/server/logger'
import { TRPCError } from '@trpc/server'
import { MessageOperations, UserOperations } from '../../../databaseOperations/prisma.provider'
import { singleUserToDisplayUserForOther } from '@/server/dto/user.dto'
import { CustomError } from '../error'
import { isNotNull } from 'effect/Predicate'

export const getContactListEffect = (userId: number) =>
  T.gen(function* () {
    const logger = yield* Logger
    const userOperations = yield* UserOperations
    const messageOperations = yield* MessageOperations

    return T.tryPromise({
      try: () => messageOperations.getContactList(userId),
      catch: error =>
        new CustomError({
          code: 'INTERNAL_SERVER_ERROR',
          cause: 'database_error',
          message: `getContactList ${userId} db fetch error`,
          detailedError: error
        })
    }).pipe(
      T.flatMap(list => {
        const contactList = list
          .map(element => {
            const contactId =
              (element.senderId !== userId ? element.senderId : element.receiverId) ?? 0
            return {
              id: contactId,
              lastDateMessage: element._max.createdAt! // createdAt is NOT NULL
            }
          })
          .filter(el => el.id > 0)
          .filter((el, i, arr) => arr.findIndex(e => e.id === el.id) === i)

        return T.tryPromise({
          try: () =>
            userOperations.getUserByIds(contactList.map(el => el.id)).then(users =>
              users
                .map(user => {
                  const contact = contactList.find(el => el.id === user.id)
                  if (contact) {
                    return {
                      ...contact,
                      ...singleUserToDisplayUserForOther(user)
                    }
                  }
                  return null
                })
                .filter(isNotNull)
            ),
          catch: error =>
            new CustomError({
              code: 'INTERNAL_SERVER_ERROR',
              cause: 'database_error',
              message: `getContactList getUserByIds ${userId} db fetch error`,
              detailedError: error
            })
        })
      }),
      T.flatMap(contacts =>
        T.all(
          contacts
            .sort((a, b) => b.lastDateMessage.getTime() - a.lastDateMessage.getTime())
            .map(contact =>
              T.promise(() =>
                messageOperations
                  .hasUnreadMessages({ userId, contactId: contact.id })
                  .then(hasUnreadMessage => ({
                    ...contact,
                    hasUnreadMessage
                  }))
                  .catch(error => {
                    logger.error({
                      cause: 'database_error',
                      message: `getContactList hasUnreadMessages ${userId} db fetch error`,
                      detailedError: error
                    })
                    return {
                      ...contact,
                      hasUnreadMessage: false
                    }
                  })
              )
            )
        )
      ),
      T.match({
        onFailure: ({ cause, message, detailedError, code }) => {
          logger.error({
            cause,
            message,
            detailedError
          })
          throw new TRPCError({
            code,
            message
          })
        },
        onSuccess: contacts => contacts
      })
    )
  }).pipe(T.flatten)
