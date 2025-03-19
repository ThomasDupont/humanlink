import { PatternMatching } from '@/types/utility.type'
import { GenericStorageProvider } from './storage.interface'
import { crudFileTigris } from './tigris/tigris'
import { Context, Effect } from 'effect'
import { S3Fun } from './tigris/tigrisClient'

export const storageProviderFactory: PatternMatching<{
  [K in 'tigris']: () => GenericStorageProvider
}> = {
  tigris: () => crudFileTigris(S3Fun)
}

export class StorageProviderFactory extends Context.Tag('storageProviderFactory')<
  StorageProviderFactory,
  typeof storageProviderFactory
>() {}
export const effectStorageProviderFactory = Effect.provideService(
  StorageProviderFactory,
  storageProviderFactory
)
