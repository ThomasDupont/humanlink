import { Service } from "@/types/Services.type"
import { elastic, SearchResponseBody } from "./elasticClient"
import { SearchProvider } from "./search.interface"

const parseSearch = <D>(body: SearchResponseBody<D>): D[] => {
    const hits = body.hits.hits

    return hits.map(hit => ({
        id: hit._id,
        ...hit._source
    })) as D[]
}

export const performSearchWithElastic: SearchProvider = async ({ query }) => {
    const { data } = await elastic.get<SearchResponseBody<Service>>('/services/_search', {
        data: JSON.stringify({
            query: {
                match: {
                title: {
                    query
                }
                }
            }
            })
    })

    return parseSearch(data)
}
