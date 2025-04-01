import { effectLogger } from '@/server/logger'
import { Effect as T } from 'effect'
import {
  effectFilesOperations,
  effectMessageOperations,
  effectOfferOperations,
  effectServiceOperations,
  effectUserOperations
} from '../databaseOperations/prisma.provider'
import { userMeEffect } from './queries/userMe'
import { getContactListEffect } from './queries/getContactList'
import { listOffersEffect } from './queries/listOffers'
import { getOfferDetailEffect } from './queries/getOfferDetail'
import { getProtectedFilesEffect } from './queries/getProtectedFiles'
import { effectStorageProviderFactory } from '../storage/storage.provider'

export const userMe = (id: number) => ({
  run: () => userMeEffect(id).pipe(effectLogger, effectUserOperations, T.runPromise)
})

export const getContactList = (id: number) => ({
  run: () =>
    getContactListEffect(id).pipe(
      effectLogger,
      effectUserOperations,
      effectMessageOperations,
      T.runPromise
    )
})

export const listOffer = (user: number) => ({
  run: () =>
    listOffersEffect(user).pipe(
      effectLogger,
      effectOfferOperations,
      effectServiceOperations,
      T.runPromise
    )
})

export const getOfferDetail = (userId: number, offerId: number) => ({
  run: () =>
    getOfferDetailEffect(userId, offerId).pipe(
      effectLogger,
      effectOfferOperations,
      effectServiceOperations,
      T.runPromise
    )
})

export const getProtectedFiles = (userId: number, files: string[], bucket: string) => ({
  run: () =>
    getProtectedFilesEffect(userId, files, bucket).pipe(
      effectLogger,
      effectStorageProviderFactory,
      effectFilesOperations,
      T.runPromise
    )
})
