import { ServiceInElastic } from '@/types/Services.type'
import { Algoliasearch } from 'algoliasearch'
import { AxiosInstance } from 'axios'

type GenericProvider = ({ query }: { query: string }) => Promise<ServiceInElastic[]>

export type AlgoliaProvider = (provider: Algoliasearch) => GenericProvider
export type ElasticProvider = (provider: AxiosInstance) => GenericProvider
