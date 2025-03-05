import { NextAuthJsUserError } from '@/types/User.type'
import { trpc } from '@/utils/trpc'
import { User } from '@prisma/client'

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
      user: User
      error: null
    }
export const useAuthSession = (): UserAuthSessionReturn & Base => {
  const query = trpc.protectedGet.me.useQuery()

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

  return {
    user: {
      ...query.data,
      createdAt: new Date(query.data.createdAt),
      certifiedDate: query.data.certifiedDate ? new Date(query.data.certifiedDate) : null
    },
    error: null,
    refetch
  }
}
