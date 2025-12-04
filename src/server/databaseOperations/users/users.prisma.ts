import { UserWithServicesWithPrices } from '@/types/User.type'
import { PaymentProvider, PrismaClient, User } from '@prisma/client'

export const userCrud = (prisma: PrismaClient) => {
  const createUser = (user: Omit<User, 'id' | 'createdAt' | 'userBalanceId'>): Promise<User> => {
    return prisma.user.create({
      data: {
        ...user,
        userBalance: {
          create: {}
        }
      },
      include: {
        userBalance: true
      }
    })
  }

  const updateUser = (user: Partial<User> & Pick<User, 'id'>) => {
    return prisma.user.update({
      where: {
        id: user.id
      },
      data: user
    })
  }

  const deleteUser = (id: number) => {
    prisma.user.delete({
      where: { id }
    })
  }

  const getUserById = (id: number): Promise<UserWithServicesWithPrices | null> => {
    return prisma.user.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            prices: true
          }
        },
        userBalance: true
      }
    })
  }

  const selectUserById = (
    id: number,
    select: {
      [key in keyof Partial<User>]: boolean
    }
  ) => {
    return prisma.user.findUnique({
      where: { id },
      select
    })
  }

  const verifyIfUserExistsByEmail = (email: string) => {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true
      }
    })
  }

  const getUserByIds = (ids: number[]): Promise<UserWithServicesWithPrices[]> => {
    return prisma.user.findMany({
      where: {
        id: {
          in: ids
        }
      },
      include: {
        services: {
          include: {
            prices: true
          }
        },
        userBalance: true
      }
    })
  }

  const setPaymentProviderAccount = (
    userId: number,
    provider: PaymentProvider,
    idInProvider: string
  ) => {
    return prisma.connectedAccount.create({
      data: {
        userId,
        idInProvider,
        provider
      }
    })
  }

  const getPaymentProviderAccount = (userId: number) => {
    return prisma.connectedAccount.findFirst({
      where: { userId }
    })
  }

  return {
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    getUserByIds,
    verifyIfUserExistsByEmail,
    selectUserById,
    setPaymentProviderAccount,
    getPaymentProviderAccount
  }
}
