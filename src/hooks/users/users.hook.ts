import { useCallback } from 'react'
import { HookInterface } from './hook.interface'
import { trpc } from '@/utils/trpc'

export const useUser = (): HookInterface => {
  const trpcUtils = trpc.useUtils()
  const getUserById = useCallback((id: number) => {
    return trpcUtils.get.userById.fetch(id).then(user => {
      return (
        user && {
          ...user,
          createdAt: new Date(user.createdAt),
          certifiedDate: user.certifiedDate ? new Date(user.certifiedDate) : null
        }
      )
    })
  }, [])

  return { getUserById }
}
