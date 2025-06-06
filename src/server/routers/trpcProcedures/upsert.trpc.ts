import { Effect as T } from 'effect'
import {
  effectBalanceOperations,
  effectMessageOperations,
  effectOfferOperations,
  effectServiceOperations,
  effectTransactionOperations
} from '../../databaseOperations/prisma.provider'
import { effectLogger } from '@/server/logger'
import { effectSync } from '../../databaseOperations/sync/sync'
import { createStripePaymentIntentForOfferEffect } from './mutations/createStripePaymentIntentForOffer'
import { effectPaymentProviderFactory } from '../../paymentOperations/payment.provider'
import { acceptOfferEffect, AcceptOfferEffectArgs } from './mutations/acceptOffer'
import { CreateOffer, createOfferWithMessageEffect } from './mutations/createOfferWithMessage'
import { UpsertServiceArgs, upsertServiceEffect } from './mutations/upsertService'
import formidable from 'formidable'
import { uploadFilesEffect } from './mutations/uploadFile'
import { effectStorageProviderFactory } from '../../storage/storage.provider'
import { addRenderingEffect, AddRenderingEffectArgs } from './mutations/addRendering'
import { acceptOfferRenderingsAndCreateMoneyTransfertEffect } from './mutations/acceptOfferRenderingsAndCreateMoneyTransfert'
import { CloseMilestoneArgs, closeMilestoneEffect } from './mutations/closeMilestone'
import { sendMessageEffect, SendMessageInput } from './mutations/sendMessage'
import { effectCreateAccountIfNotExistsInPaymentProvider } from './utils/createAccountInPaymentProvider'
import { effectSendMessageProvider } from './effectAsService'
import {
  effectSendNotificationAcceptOfferProvider,
  effectSendNotificationNewMessageProvider,
  effectSendNotificationNewRenderingProvider
} from './utils/sendEmail'
import { markReadMessageEffect } from './mutations/markReadMessage'

export const upsertService = (args: UpsertServiceArgs) => ({
  run: () =>
    upsertServiceEffect(args).pipe(
      effectLogger,
      effectServiceOperations,
      effectSync,
      effectStorageProviderFactory,
      effectCreateAccountIfNotExistsInPaymentProvider,
      T.runPromise
    )
})

export const createOfferWithMessage = (offer: CreateOffer) => ({
  run: () =>
    createOfferWithMessageEffect(offer).pipe(
      effectLogger,
      effectOfferOperations,
      effectSendMessageProvider,
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
      effectSendNotificationAcceptOfferProvider,
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
      effectSendNotificationNewRenderingProvider,
      T.runPromise
    )
})

export const acceptOfferRenderingsAndCreateMoneyTransfert = (offerId: number, userId: number) => ({
  run: () =>
    acceptOfferRenderingsAndCreateMoneyTransfertEffect({
      offerId,
      userId
    }).pipe(
      effectLogger,
      effectBalanceOperations,
      effectOfferOperations,
      effectTransactionOperations,
      T.runPromise
    )
})

export const closeMilestone = (args: CloseMilestoneArgs) => ({
  run: () =>
    closeMilestoneEffect(args).pipe(
      effectLogger,
      effectOfferOperations,
      effectTransactionOperations,
      T.runPromise
    )
})

export const sendMessage = (args: SendMessageInput) => ({
  run: () =>
    sendMessageEffect(args).pipe(
      effectLogger,
      effectMessageOperations,
      effectSendNotificationNewMessageProvider,
      T.runPromise
    )
})

export const markMessageIsRead = (messageIds: number[], userId: number) => ({
  run: () =>
    markReadMessageEffect({
      messageIds,
      userId
    }).pipe(effectLogger, effectMessageOperations, T.runPromise)
})
