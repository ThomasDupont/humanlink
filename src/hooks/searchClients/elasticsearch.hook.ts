import { trpc } from '@/utils/trpc'
import { HookInterface } from './hook.interface'
import { useState } from 'react'
import { ServiceInElastic } from '@/types/Services.type'

export const useElasticSearch: HookInterface = () => {
  const [result, setResult] = useState<ServiceInElastic[]>()
  const trpcUtils = trpc.useUtils()

  const query = (text: string) => {
    trpcUtils.get.serviceList
      .fetch({
        query: text
      })
      .then(setResult)
  }
  return {
    query,
    result,
    ready: true
  }
}
