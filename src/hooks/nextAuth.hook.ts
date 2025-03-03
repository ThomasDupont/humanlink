import { NextAuthJsUserError } from '@/types/User.type'
import { trpc } from '@/utils/trpc'
import { User } from '@prisma/client'

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
export const useAuthSession = (): UserAuthSessionReturn => {
  const query = trpc.protectedGet.me.useQuery()

  if (query.isFetching || !query.data) {
    return {
      user: null,
      error: null
    }
  }

  if (query.isError) {
    return {
      user: null,
      error: {
        cause: query.error.message,
        message: query.error.message
      }
    }
  }

  return {
    user: {
      ...query.data,
      createdAt: new Date(query.data.createdAt),
      certifiedDate: query.data.certifiedDate ? new Date(query.data.certifiedDate) : null
    },
    error: null
  }
}
