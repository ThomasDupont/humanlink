import { PatternMatching } from '@/types/utility.type'
import { GenericSearchProvider, SearchProviders } from './search.interface'
import { performSearchWithAlgolia } from './searchWithAlgolia'
import { performSearchWithElastic } from './searchWithElastic'
import { algolia } from './algoliaClient'
import { elastic } from './elasticClient'

const factory: PatternMatching<{
  [K in SearchProviders]: GenericSearchProvider
}> = {
  algolia: performSearchWithAlgolia(algolia),
  elastic: performSearchWithElastic(elastic)
}

export default factory
