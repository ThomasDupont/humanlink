import { Effect as T } from 'effect'
import {
  effectMessageOperations,
  effectOfferOperations,
  effectServiceOperations,
  effectTransactionOperations
} from '../databaseOperations/prisma.provider'
import { effectLogger } from '@/server/logger'
import { effectSync } from '../databaseOperations/sync/sync'
import { createStripePaymentIntentForOfferEffect } from './mutations/createStripePaymentIntentForOffer'
import { effectPaymentProviderFactory } from '../paymentOperations/payment.provider'
import { acceptOfferEffect, AcceptOfferEffectArgs } from './mutations/acceptOffer'
import { CreateOffer, createOfferWithMessageEffect } from './mutations/createOfferWithMessage'
import { UpsertServiceArgs, upsertServiceEffect } from './mutations/upsertService'
import formidable from 'formidable'
import { uploadFilesEffect } from './mutations/uploadFile'
import { effectStorageProviderFactory } from '../storage/storage.provider'
import { addRenderingEffect, AddRenderingEffectArgs } from './mutations/addRendering'

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
      effectTransactionOperations,
      effectOfferOperations,
      T.runPromise
    )
})

type CreateStripePaymentIntentInput =
  | {
      type: 'offer'
      offerId: number
      idempotencyKey: string
      voucherCode?: string | undefined
    }
  | {
      type: 'milestone'
      milestoneId: number
      idempotencyKey: string
      voucherCode?: string | undefined
    }
export const createStripePaymentIntent = (input: CreateStripePaymentIntentInput) => {
  switch (input.type) {
    case 'offer':
      return {
        run: (userId: number) =>
          createStripePaymentIntentForOfferEffect(input.offerId, userId, input.idempotencyKey).pipe(
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

export const uploadsFile = (files: formidable.File[], bucket: string, userId: number) => ({
  run: () =>
    uploadFilesEffect(files, bucket, userId).pipe(
      effectLogger,
      effectStorageProviderFactory,
      T.runPromise
    )
})

export const addRendering = (args: AddRenderingEffectArgs) => ({
  run: () =>
    addRenderingEffect(args).pipe(
      effectLogger,
      effectOfferOperations,
      effectTransactionOperations,
      effectStorageProviderFactory,
      T.runPromise
    )
})
