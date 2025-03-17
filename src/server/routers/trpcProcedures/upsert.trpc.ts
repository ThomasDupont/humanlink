import { Schedule, Effect as T } from 'effect'
import {
  effectMessageOperations,
  effectOfferOperations,
  effectServiceOperations,
  MessageOperations,
  OfferOperations,
  ServiceOperations
} from '../databaseOperations/prisma.provider'
import { effectLogger, Logger } from '@/server/logger'
import { Price, Prisma, Service } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { effectSync, Sync } from '../databaseOperations/sync/sync'
import { OfferWithMileStonesAndMilestonePriceWithoutIdsAndCreatedAt } from '@/types/Offers.type'
import { effectStripeOperations, StripeOperations } from '../paymentOperations/payment.provider'
import config from '@/config'

const RETRY = 1
const RETRY_DELAY = 100
type UpsertServiceArgs = {
  userId: number
  serviceId?: number
  service: Omit<Service, 'id' | 'userId' | 'createdAt'>
  prices: Omit<Price, 'serviceId'>[]
}
export const upsertServiceEffect = ({ userId, serviceId, service, prices }: UpsertServiceArgs) =>
  T.gen(function* () {
    const logger = yield* Logger
    const serviceOperations = yield* ServiceOperations
    const sync = yield* Sync

    const retryPolicy = Schedule.addDelay(Schedule.recurs(RETRY), () => `${RETRY_DELAY} millis`)

    return T.tryPromise({
      try: () =>
        serviceId
          ? serviceOperations.updateService(
              {
                ...service,
                id: serviceId,
                userId
              },
              prices.map(price => ({
                ...price,
                serviceId
              }))
            )
          : serviceOperations.createService({
              ...service,
              userId,
              prices: prices.map(({ id: _, ...raw }) => raw)
            }),
      catch: error => {
        logger.error({
          cause: 'database_error',
          message: `service ${serviceId} db upsert error`,
          detailedError: error
        })

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          return new TRPCError({
            code: 'NOT_FOUND'
          })
        }
        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR'
        })
      }
    }).pipe(
      T.filterOrFail(
        service => service !== null,
        () => {
          logger.error({
            cause: 'upsert_service_failed',
            message: `service ${serviceId} not found on db`,
            detailedError: {}
          })
          return new TRPCError({
            code: 'NOT_FOUND'
          })
        }
      ),
      T.flatMap(service =>
        T.retry(
          T.tryPromise({
            try: () => sync.sync(service),
            catch: error => {
              logger.error({
                cause: 'sync_error',
                message: `service ${serviceId} sync error`,
                detailedError: error
              })
              return new TRPCError({
                code: 'INTERNAL_SERVER_ERROR'
              })
            }
          }),
          retryPolicy
        )
      )
    )
  }).pipe(T.flatten)

export const upsertService = (args: UpsertServiceArgs) => ({
  run: () =>
    upsertServiceEffect(args).pipe(effectLogger, effectServiceOperations, effectSync, T.runPromise)
})

type CreateOffer = OfferWithMileStonesAndMilestonePriceWithoutIdsAndCreatedAt & {
  userId: number
  userIdReceiver: number
}
export const createOfferWithMessageEffect = (offer: CreateOffer) =>
  T.gen(function* () {
    const logger = yield* Logger
    const offerOperations = yield* OfferOperations
    const messageOperations = yield* MessageOperations

    return T.tryPromise({
      try: () => offerOperations.createAnOffer(offer),
      catch: error => {
        logger.error({
          cause: 'database_error',
          message: `offer for service ${offer.serviceId} db create error`,
          detailedError: error
        })

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          return new TRPCError({
            code: 'NOT_FOUND'
          })
        }
        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR'
        })
      }
    }).pipe(
      T.flatMap(createdOffer =>
        T.tryPromise({
          try: () =>
            messageOperations
              .sendMessageWithOffer({
                senderId: offer.userId,
                receiverId: offer.userIdReceiver,
                offerId: createdOffer.id
              })
              .then(() => createdOffer),
          catch: error => {
            logger.error({
              cause: 'database_error',
              message: `message with offer ${createdOffer.id} db create error`,
              detailedError: error
            })

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              return new TRPCError({
                code: 'NOT_FOUND'
              })
            }
            return new TRPCError({
              code: 'INTERNAL_SERVER_ERROR'
            })
          }
        })
      )
    )
  }).pipe(T.flatten)

export const createOfferWithMessage = (offer: CreateOffer) => ({
  run: () =>
    createOfferWithMessageEffect(offer).pipe(
      effectLogger,
      effectOfferOperations,
      effectMessageOperations,
      T.runPromise
    )
})

export const createStripePaymentIntentForOfferEffect = (offerId: number, receiverId: number) => {
  return T.gen(function* () {
    const logger = yield* Logger
    const stripeOperations = yield* StripeOperations
    const offerOperations = yield* OfferOperations

    return T.tryPromise({
      try: () => offerOperations.getAnOfferByIdAndReceiverId(offerId, receiverId),
      catch: error => {
        logger.error({
          cause: 'database_error',
          message: `offer ${offerId} db get error`,
          detailedError: error
        })

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          return new TRPCError({
            code: 'NOT_FOUND'
          })
        }
        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR'
        })
      }
    }).pipe(
      T.filterOrFail(
        offer => offer !== null,
        () => {
          logger.error({
            cause: 'offer_not_found',
            message: `offer ${offerId} not found on db`,
            detailedError: {}
          })
          return new TRPCError({
            code: 'NOT_FOUND'
          })
        }
      ),
      T.flatMap(offer => {
        const computedAmount = offer.milestone.reduce(
          (acc, milestone) => acc + milestone.priceMilestone.number,
          0
        )
        const currency = offer.milestone[0]?.priceMilestone.currency ?? config.defaultCurrency

        const idempotencyKey = `${offerId}-${receiverId}-${computedAmount}-${currency}`

        return T.tryPromise({
          try: () =>
            stripeOperations.createPaymentIntent({
              amount: computedAmount,
              currency,
              idempotencyKey
            }),
          catch: error => {
            logger.error({
              cause: 'database_error',
              message: `stripe payment intent for offer ${offerId} db create error`,
              detailedError: error
            })

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              return new TRPCError({
                code: 'NOT_FOUND'
              })
            }
            return new TRPCError({
              code: 'INTERNAL_SERVER_ERROR'
            })
          }
        })
      })
    )
  }).pipe(T.flatten)
}

type Input =
  | {
      type: 'offer'
      offerId: number
      voucherCode?: string | undefined
    }
  | {
      type: 'milestone'
      milestoneId: number
      voucherCode?: string | undefined
    }
export const createStripePaymentIntent = (input: Input) => {
  switch (input.type) {
    case 'offer':
      return {
        run: (userId: number) =>
          createStripePaymentIntentForOfferEffect(input.offerId, userId).pipe(
            effectLogger,
            effectOfferOperations,
            effectStripeOperations,
            T.runPromise
          )
      }
    case 'milestone':
      return {
        run: () => {
          throw new Error('Not implemented')
        }
      }
  }
}
