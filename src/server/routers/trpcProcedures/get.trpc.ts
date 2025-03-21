import { Effect as T } from 'effect'
import { Logger, effectLogger } from '@/server/logger'
import { TRPCError } from '@trpc/server'
import {
  MessageOperations,
  UserOperations,
  effectMessageOperations,
  effectUserOperations
} from '../databaseOperations/prisma.provider'
import { UserWithServicesWithPrices } from '@/types/User.type'

export const userMeEffect = (email: string) =>
  T.gen(function* () {
    const logger = yield* Logger
    const userOperations = yield* UserOperations

    return T.tryPromise({
      try: () =>
        userOperations.getUserByEmail<UserWithServicesWithPrices>(email, { withServices: true }),
      catch: error => {
        logger.error({
          cause: 'database_error',
          message: `${email} db fetch error`,
          detailedError: error
        })
        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR'
        })
      }
    }).pipe(
      T.filterOrFail(
        user => user !== null,
        () => {
          logger.error({
            cause: 'incoherent_session_and_db_data',
            message: `${email} not found on db`,
            detailedError: {}
          })
          return new TRPCError({
            code: 'NOT_FOUND'
          })
        }
      )
    )
  }).pipe(T.flatten)

export const userMe = (email: string) => ({
  run: () => userMeEffect(email).pipe(effectLogger, effectUserOperations, T.runPromise)
})

export const getContactListEffect = (userId: number) =>
  T.gen(function* () {
    const logger = yield* Logger
    const userOperations = yield* UserOperations
    const messageOperations = yield* MessageOperations

    return T.tryPromise({
      try: () => messageOperations.getContactList(userId),
      catch: error => {
        logger.error({
          cause: 'database_error',
          message: `getContactList ${userId} db fetch error`,
          detailedError: error
        })
        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR'
        })
      }
    }).pipe(
      T.flatMap(list => {
        const contactList = list
          .map(element => {
            const contactId =
              (element.senderId !== userId ? element.senderId : element.receiverId) ?? 0
            return {
              id: contactId,
              lastDateMessage: element._max.createdAt!, // createdAt is NOT NULL
              isUnread: element.readAt === null
            }
          })
          .filter(el => el.id > 0)
          .filter((el, i, arr) => arr.findIndex(e => e.id === el.id) === i)

        return T.all(
          contactList.map(contact => {
            return T.tryPromise({
              try: () => userOperations.getUserById(contact.id),
              catch: error => {
                logger.error({
                  cause: 'database_error',
                  message: `getContactList getUserById ${userId} db fetch error`,
                  detailedError: error
                })

                return new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR'
                })
              }
            }).pipe(
              T.filterOrFail(
                user => user !== null,
                () => {
                  logger.error({
                    cause: 'incoherent_session_and_db_data',
                    message: `etContactList getUserById ${contact.id} not found on db`,
                    detailedError: {}
                  })
                  return new TRPCError({
                    code: 'NOT_FOUND'
                  })
                }
              ),
              T.map(user => ({
                ...contact,
                firstname: user.firstname,
                lastname: user.lastname,
                image: user.image
              }))
            )
          }),
          { mode: 'either' }
        ).pipe(
          T.map(eitherContacts => {
            return eitherContacts.filter(either => either._tag === 'Right').map(el => el.right)
          })
        )
      })
    )
  }).pipe(T.flatten)

export const getContactList = (id: number) => ({
  run: () =>
    getContactListEffect(id).pipe(
      effectLogger,
      effectUserOperations,
      effectMessageOperations,
      T.runPromise
    )
})
