import { SearchHookProvider } from '@/config'
import { useElasticSearch } from './elasticsearch.hook'
import { useTransformer } from './transformer.hook'

export const getSearchClientHook = (hookType: SearchHookProvider) => {
  switch (hookType) {
    case 'elastic':
      return useElasticSearch
    case 'transformer':
      return useTransformer
  }
}
