import { PatternMatching } from "@/types/utility.type";
import { GenericStorageProvider } from "./storage.interface";
import { crudFileTigris } from "./tigris";
import { Context, Effect } from "effect";

export const storageProviderFactory: PatternMatching<{
  [K in 'tigris']: () => GenericStorageProvider
}> = {
  tigris: () => crudFileTigris()
}

export class StorageProviderFactory extends Context.Tag('storageProviderFactory')<
StorageProviderFactory,
  typeof storageProviderFactory
>() {}
export const effectStorageProviderFactory = Effect.provideService(StorageProviderFactory, storageProviderFactory)