import { PrismaClient } from '@prisma/client'

export const userBalanceCrud = (prisma: PrismaClient) => {
  const getUserBalance = (userId: number) => {
    return prisma.userBalance.findFirst({
      where: { user: { id: userId } }
    })
  }

  const getUserTransactions = (userId: number) => {
    return prisma.transaction.findMany({
      where: {
        OR: [{ sellerId: userId }, { buyerId: userId }]
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  return { getUserBalance, getUserTransactions }
}
