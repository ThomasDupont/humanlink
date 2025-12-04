import { Context, Effect as T } from 'effect'
import { effectLogger, Logger } from '@/server/logger'
import {
  effectPaymentProviderFactory,
  PaymentProviderFactory
} from '@/server/paymentOperations/payment.provider'
import config from '@/config'
import { effectUserOperations, UserOperations } from '@/server/databaseOperations/prisma.provider'
import { CustomError } from '../error'
import { TRPCError } from '@trpc/server'

const createAccountIfNotExistsInPaymentProviderEffect = (userId: number) =>
  T.gen(function* () {
    const logger = yield* Logger
    const paymentProviderFactory = yield* PaymentProviderFactory
    const userOperations = yield* UserOperations

    const paymentProvider = paymentProviderFactory[config.paymentProvider]()

    const createAccount = T.tryPromise({
      try: () => userOperations.getUserById(userId),
      catch: detailedError =>
        new CustomError({
          cause: 'database_error',
          code: 'INTERNAL_SERVER_ERROR',
          message: 'user not found',
          clientMessage: 'user_not_found',
          detailedError
        })
    }).pipe(
      T.filterOrFail(
        user => user !== null,
        () =>
          new CustomError({
            cause: 'user_not_found',
            message: `createAccountInPaymentProvider ${userId} not found on db`,
            detailedError: {},
            code: 'NOT_FOUND',
            clientMessage: 'user_not_found'
          })
      ),
      T.flatMap(user =>
        T.tryPromise({
          try: () => paymentProvider.createAccount(user.email),
          catch: detailedError =>
            new CustomError({
              cause: 'payment_provider_error',
              code: 'INTERNAL_SERVER_ERROR',
              message: 'error on create account',
              clientMessage: 'create_account_error',
              detailedError
            })
        })
      ),
      T.flatMap(id =>
        T.tryPromise({
          try: () => userOperations.setPaymentProviderAccount(userId, config.paymentProvider, id),
          catch: detailedError =>
            new CustomError({
              cause: 'database_error',
              code: 'INTERNAL_SERVER_ERROR',
              message: 'error on create account on db',
              clientMessage: 'create_account_error',
              detailedError
            })
        })
      )
    )

    return T.tryPromise({
      try: () => userOperations.getPaymentProviderAccount(userId),
      catch: detailedError =>
        new CustomError({
          cause: 'database_error',
          code: 'INTERNAL_SERVER_ERROR',
          message: 'user not found',
          clientMessage: 'user_not_found',
          detailedError
        })
    }).pipe(
      T.flatMap(account =>
        T.if(account === null, {
          onTrue: () => createAccount,
          onFalse: () => T.succeed(false)
        })
      ),
      T.match({
        onFailure: error => {
          logger.error({
            cause: error.cause,
            message: error.message,
            detailedError: error.detailedError
          })

          throw new TRPCError({
            code: error.code,
            message: error.clientMessage
          })
        },
        onSuccess: () => true
      })
    )
  }).pipe(T.flatten)

const createAccountIfNotExistsInPaymentProvider = (userId: number) =>
  createAccountIfNotExistsInPaymentProviderEffect(userId).pipe(
    effectLogger,
    effectPaymentProviderFactory,
    effectUserOperations
  )

export class CreateAccountIfNotExistsInPaymentProvider extends Context.Tag(
  'createAccountIfNotExistsInPaymentProvider'
)<CreateAccountIfNotExistsInPaymentProvider, typeof createAccountIfNotExistsInPaymentProvider>() {}
export const effectCreateAccountIfNotExistsInPaymentProvider = T.provideService(
  CreateAccountIfNotExistsInPaymentProvider,
  createAccountIfNotExistsInPaymentProvider
)
