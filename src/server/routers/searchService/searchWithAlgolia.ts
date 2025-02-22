import { Algoliasearch } from 'algoliasearch'
import { AlgoliaProvider } from './search.interface'
import { ServiceInElastic } from '@/types/Services.type'

const indexName = 'test'

type CorrectSearchResult = {
  hits: (Omit<ServiceInElastic, 'id'> & {
    _id: number
    objectID: string
  })[][]
}
export const performSearchWithAlgolia: AlgoliaProvider =
  (algolia: Algoliasearch) =>
  async ({ query }) => {
    const result = await algolia.search<ServiceInElastic[]>({
      requests: [
        {
          indexName,
          query
        }
      ]
    })

    const hits = result.results
      .map(r =>
        (r as unknown as CorrectSearchResult).hits.flat().map(hit => {
          const service: ServiceInElastic = {
            id: hit._id,
            ...hit
          }

          return service
        })
      )
      .flat()

    return hits
  }
