import axios from 'axios'
import https from 'https'
import { env } from '../../env'

export const elastic = env.NODE_ENV === 'development' ? axios.create({
  baseURL: env.ELASTIC_URL,
  headers: {
    'Authorization': 'ApiKey ' + env.ELASTIC_KEY,
    "Content-Type": "application/json"
  }
}) : axios.create({
  baseURL: env.ELASTIC_URL,
  headers: {
    "Content-Type": "application/json"
  },
  httpsAgent: new https.Agent({
    ca: env.ELASTIC_SELF_CERTIF
  })
})

export type SearchResponseBody<D> = {
  took: number,
  timed_out: boolean,
  _shards: {
    total: number,
    successful: number,
    skipped: number,
    failed: number
  },
  hits: {
    total: {
      value: number,
      relation: 'eq'
    },
    max_score: number, // float,
    hits: {
      _index: string,
      _id: string
      _score: number // float
      _source: Omit<D, 'id'>
    }[]
  }
}
