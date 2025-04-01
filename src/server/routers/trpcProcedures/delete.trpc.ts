import { Effect as T } from 'effect'
import { effectOfferOperations, effectServiceOperations, effectTransactionOperations } from '../databaseOperations/prisma.provider'
import { effectLogger } from '@/server/logger'
import { effectSync } from '../databaseOperations/sync/sync'
import { deleteAServiceEffect } from './delete/deleteAService'
import { deleteAMilestoneFileEffect, DeleteAMilestoneFileEffectArgs } from './delete/deleteAMilestoneFile'
import { effectStorageProviderFactory } from '../storage/storage.provider'

export const deleteAService = (id: number, userId: number) => ({
  run: () =>
    deleteAServiceEffect(id, userId).pipe(
      effectLogger,
      effectServiceOperations,
      effectSync,
      T.runPromise
    )
})

export const deleteAMilestoneFile = (args: DeleteAMilestoneFileEffectArgs) => ({
  run: () => deleteAMilestoneFileEffect(args).pipe(
    effectLogger,
    effectTransactionOperations,
    effectOfferOperations,
    effectStorageProviderFactory,
    T.runPromise
  )
})
