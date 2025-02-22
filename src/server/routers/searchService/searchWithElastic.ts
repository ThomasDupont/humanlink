import { ServiceInElastic } from '@/types/Services.type'
import { SearchResponseBody } from './elasticClient'
import { ElasticProvider } from './search.interface'
import { AxiosInstance } from 'axios'

const parseSearch = <D>(body: SearchResponseBody<D>): D[] => {
  const hits = body.hits.hits

  return hits.map(hit => ({
    id: hit._id,
    ...hit._source
  })) as D[]
}

export const performSearchWithElastic: ElasticProvider =
  (elastic: AxiosInstance) =>
  async ({ query }) => {
    const { data } = await elastic.get<SearchResponseBody<ServiceInElastic>>('/services/_search', {
      data: JSON.stringify({
        query: {
          match: {
            fulltext: {
              query
            }
          }
        }
      })
    })

    return parseSearch(data)
  }
