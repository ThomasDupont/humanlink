import { SearchHookProvider } from '@/config'
import { useElasticSearch } from './elasticsearch.hook'
import { useTransformer } from './transformer.hook'
import { PatternMatching } from '@/types/utility.type'
import { HookInterface } from './hook.interface'

const factory: PatternMatching<{
  [K in SearchHookProvider]: () => HookInterface
}> = {
  elastic: useElasticSearch,
  transformer: useTransformer
}

export default factory
