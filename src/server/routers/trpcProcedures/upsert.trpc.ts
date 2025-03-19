import { Effect as T } from 'effect'
import {
  effectBalanceOperations,
  effectMessageOperations,
  effectOfferOperations,
  effectServiceOperations,
} from '../databaseOperations/prisma.provider'
import { effectLogger } from '@/server/logger'
import { effectSync } from '../databaseOperations/sync/sync'
import { createStripePaymentIntentForOfferEffect } from './upsert/createStripePaymentIntentForOffer'
import { effectPaymentProviderFactory } from '../paymentOperations/payment.provider'
import { acceptOfferEffect, AcceptOfferEffectArgs } from './upsert/acceptOffer'
import { CreateOffer, createOfferWithMessageEffect } from './upsert/createOfferWithMessage'
import { UpsertServiceArgs, upsertServiceEffect } from './upsert/upsertService'

export const upsertService = (args: UpsertServiceArgs) => ({
  run: () =>
    upsertServiceEffect(args).pipe(effectLogger, effectServiceOperations, effectSync, T.runPromise)
})

export const createOfferWithMessage = (offer: CreateOffer) => ({
  run: () =>
    createOfferWithMessageEffect(offer).pipe(
      effectLogger,
      effectOfferOperations,
      effectMessageOperations,
      T.runPromise
    )
})

export const acceptOffer = (args: AcceptOfferEffectArgs) => ({
  run: () =>
    acceptOfferEffect(args).pipe(
      effectLogger,
      effectPaymentProviderFactory,
      effectOfferOperations,
      effectBalanceOperations,
      T.runPromise
    )
})


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
            effectPaymentProviderFactory,
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
