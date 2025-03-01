import { NextAuthJsUserError } from '@/types/User.type'
import { trpc } from '@/utils/trpc'
import { User } from '@prisma/client'

export const useAuthSession = (): {
  user: User | null
  error: NextAuthJsUserError | null
} => {
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
