import { ServiceInElastic } from '@/types/Services.type'
import { Algoliasearch } from 'algoliasearch'
import { AxiosInstance } from 'axios'

export type SearchProviders = 'algolia' | 'elastic'

export type GenericSearchProvider = ({ query }: { query: string }) => Promise<ServiceInElastic[]>

export type AlgoliaProvider = (provider: () => Algoliasearch) => GenericSearchProvider
export type ElasticProvider = (provider: () => AxiosInstance) => GenericSearchProvider
