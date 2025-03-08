import { syncElastic } from './sync.elastic'
import { elastic } from '../../searchService/elasticClient'
import { Context, Effect } from 'effect'
import { ServiceWithPrice } from '@/types/Services.type'

const SYNC_PROVIDER = 'elastic'

const initSyncElastic = syncElastic(elastic)

export const sync = async (service: ServiceWithPrice): Promise<ServiceWithPrice> => {
  if (SYNC_PROVIDER === 'elastic') {
    await initSyncElastic.sync(service)
  }

  return service
}
export const deleteRecord = async (id: number): Promise<void> => {
  if (SYNC_PROVIDER === 'elastic') {
    await initSyncElastic.deleteRecord(id)
  }
}

export class Sync extends Context.Tag('sync')<
  Sync,
  {
    sync: typeof sync
    deleteRecord: typeof deleteRecord
  }
>() {}

export const effectSync = Effect.provideService(Sync, {
  sync,
  deleteRecord
})
