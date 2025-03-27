import { Logger } from '@/server/logger'
import { Exit, Scope, Effect as T } from 'effect'
import { OfferOperations, TransactionOperations } from '../../databaseOperations/prisma.provider'
import { StorageProviderFactory } from '../../storage/storage.provider'

type Args = {
  userId: number
  closeOffer: boolean
  text: string
  files: {
    originalFileName: string
    path: string
  }[]
}
export const addRenderingEffect = ({ userId }: Args) =>
  T.gen(function* () {
    const logger = yield* Logger
    const transactionOperations = yield* TransactionOperations
    const offerOperations = yield* OfferOperations
    const storageFactory = yield* StorageProviderFactory
  })
