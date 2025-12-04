import { useCallback } from 'react'
import { HookInterface } from './hook.interface'
import { trpc } from '@/utils/trpc'

export const useUser = (): HookInterface => {
  const trpcUtils = trpc.useUtils()

  const getUserByIds = useCallback(
    (ids: number[]) => {
      return trpcUtils.get.userByIds.fetch(ids)
    },
    [trpcUtils.get.userByIds]
  )

  return { getUserByIds }
}
