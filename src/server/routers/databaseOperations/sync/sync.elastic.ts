import { Price, Service } from '@prisma/client'
import { AxiosError, AxiosInstance } from 'axios'

// const ACTION_TYPE: 'manual' | 'auto' = 'manual'

// const RETRY = 2

export const syncElastic = (elastic: AxiosInstance) => {
  const sync = async ({ id, ...rawService }: Service & { prices: Price[] }) => {
    const request = {
      doc: {
        ...rawService,
        fulltext: `${rawService.title} ${rawService.descriptionShort} ${rawService.description}`
      },
      doc_as_upsert: true
    }

    await elastic.post(`/services/_update/${id}`, request).catch((e: AxiosError) => {
      console.log(e.response?.data)

      throw e
    })
  }

  const deleteRecord = async (id: number) => {
    await elastic.delete(`/services/_doc/${id}`).catch((e: AxiosError) => {
      if (e.status !== 404) {
        throw e
      }
    })
  }

  return { sync, deleteRecord }
}
