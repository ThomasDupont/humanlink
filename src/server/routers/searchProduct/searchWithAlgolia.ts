import { algolia } from "./algolia";
import { SearchProvider } from "./search.interface";
import { Service } from "@/types/Services.type";

const indexName = "test";

type CorrectSearchResult = {
    hits: (Service & {
        _id: number
        objectID: string
    })[][]
}
export const performSearchWithAlgolia: SearchProvider = async ({ query }) => {
    const result = await algolia.search<Service[]>({
        requests: [
          {
            indexName,
            query,
          },
        ],
      });
    
      
    const hits = result.results.map(r => 
        (r as unknown as CorrectSearchResult).hits.flat().map(hit => {
            const service: Service = {
                id: hit._id.toString(),
                title: hit.title,
                
            }

            return service
        })
    ).flat()

    console.log(hits)

    return hits
}
