import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { userCrud } from './users/users.prisma'
import { servicesCrud } from './services/services.prisma'
import { logger } from '@/server/logger'
import { Context, Effect } from 'effect'
import { messageCrud } from './messages/messages.prisma'
import { offersCrud } from './offers/offers.prisma'
import { userBalanceCrud } from './payment/payment.prisma'
import { transaction } from './transactionBuilder'

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query'
    },
    {
      emit: 'event',
      level: 'error'
    },
    {
      emit: 'stdout',
      level: 'info'
    },
    {
      emit: 'stdout',
      level: 'warn'
    }
  ]
})

// event log
prisma.$on('query', e => {
  logger.info({
    prismaQuery: e.query,
    params: e.params,
    duration: `${e.duration} ms`
  })
})

prisma.$on('error', e => {
  logger.error({
    error: 'prismaError',
    message: e.message
  })
})

const extendedPrisma = prisma.$extends(withAccelerate())

export const userOperations = userCrud(extendedPrisma as unknown as PrismaClient)
export const serviceOperations = servicesCrud(extendedPrisma as unknown as PrismaClient)
export const messageOperations = messageCrud(extendedPrisma as unknown as PrismaClient)
export const offerOperations = offersCrud(extendedPrisma as unknown as PrismaClient)
export const balanceOperations = userBalanceCrud(extendedPrisma as unknown as PrismaClient)
export const transactionOperations = transaction(extendedPrisma as unknown as PrismaClient)

export class UserOperations extends Context.Tag('userOperations')<
  UserOperations,
  typeof userOperations
>() {}
export const effectUserOperations = Effect.provideService(UserOperations, userOperations)

export class MessageOperations extends Context.Tag('messageOperations')<
  MessageOperations,
  typeof messageOperations
>() {}
export const effectMessageOperations = Effect.provideService(MessageOperations, messageOperations)

export class ServiceOperations extends Context.Tag('serviceOperations')<
  ServiceOperations,
  typeof serviceOperations
>() {}
export const effectServiceOperations = Effect.provideService(ServiceOperations, serviceOperations)

export class OfferOperations extends Context.Tag('offerOperations')<
  OfferOperations,
  typeof offerOperations
>() {}
export const effectOfferOperations = Effect.provideService(OfferOperations, offerOperations)

export class BalanceOperations extends Context.Tag('balanceOperations')<
  BalanceOperations,
  typeof balanceOperations
>() {}
export const effectBalanceOperations = Effect.provideService(BalanceOperations, balanceOperations)

export class TransactionOperations extends Context.Tag('transactionOperations')<
  TransactionOperations,
  typeof transactionOperations
>() {}
export const effectTransactionOperations = Effect.provideService(
  TransactionOperations,
  transactionOperations
)
