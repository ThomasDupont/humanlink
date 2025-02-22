import { Price, Service } from '@prisma/client'
import { syncElastic } from './sync.elastic'
import { elastic } from '../../searchService/elasticClient'

const SYNC_PROVIDER = 'elastic'

const initSyncElastic = syncElastic(elastic)

export const sync = async (service: Service & { prices: Price[] }): Promise<void> => {
  if (SYNC_PROVIDER === 'elastic') {
    await initSyncElastic.sync(service)
  }
}
export const deleteRecord = async (id: number): Promise<void> => {
  if (SYNC_PROVIDER === 'elastic') {
    await initSyncElastic.deleteRecord(id)
  }
}

export type Sync = typeof sync
export type DeleteRecord = typeof deleteRecord
