import { UserWithServicesWithPrices } from '@/types/User.type'
import { PrismaClient, User } from '@prisma/client'

export const userCrud = (prisma: PrismaClient) => {
  const createUser = (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    return prisma.user.create({
      data: user
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
        }
      }
    })
  }

  const getUserByEmail = <U extends User>(
    email: string,
    { withServices }: { withServices: boolean }
  ) => {
    return prisma.user.findUnique({
      where: { email },
      ...(withServices && {
        include: {
          services: {
            include: {
              prices: true
            }
          }
        }
      })
    }) as Promise<U | null>
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
        }
      }
    })
  }

  return {
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    getUserByIds,
    getUserByEmail
  }
}
