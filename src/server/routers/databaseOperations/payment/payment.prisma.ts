import { PrismaClient } from '@prisma/client'

export const userBalanceCrud = (prisma: PrismaClient) => {
  const getUserBalance = (userId: number) => {
    return prisma.userBalance.findFirst({
      where: { user: { id: userId } }
    })
  }

  return { getUserBalance }
}
