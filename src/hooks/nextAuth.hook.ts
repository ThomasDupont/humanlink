import { useUserState } from '@/state/user.state'
import { NextAuthJsUserError, UserWithServicesWithPrices } from '@/types/User.type'
import { trpc } from '@/utils/trpc'

type Base = {
  refetch: () => void
}

type UserAuthSessionReturn =
  | {
      user: null
      error: null
    }
  | {
      user: null
      error: NextAuthJsUserError
    }
  | {
      user: UserWithServicesWithPrices
      error: null
    }
export const useAuthSession = (): UserAuthSessionReturn & Base => {
  const query = trpc.protectedGet.me.useQuery()
  const { setUser } = useUserState()

  const refetch = () => {
    query.refetch()
  }

  if (query.isError) {
    return {
      user: null,
      error: {
        cause: query.error.message,
        message: query.error.message
      },
      refetch
    }
  }

  if (query.isFetching || !query.data) {
    return {
      user: null,
      error: null,
      refetch
    }
  }

  setUser(query.data)

  return {
    user: {
      ...query.data,
      createdAt: new Date(query.data.createdAt),
      certifiedDate: query.data.certifiedDate ? new Date(query.data.certifiedDate) : null,
      services: query.data.services.map(service => ({
        ...service,
        createdAt: new Date(service.createdAt)
      }))
    },
    error: null,
    refetch
  }
}
