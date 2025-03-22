import { PrismaClient, Transaction, UserBalanceEventsLog } from '@prisma/client'

export const userBalanceCrud = (prisma: PrismaClient) => {
  const getUserBalance = (userId: number) => {
    return prisma.userBalance.findFirst({
      where: { user: { id: userId } }
    })
  }

  const updateUserBalance = (id: number, amount: number) => {
    return prisma.userBalance.updateMany({
      where: { id },
      data: {
        balance:
          amount < 0
            ? {
                decrement: amount
              }
            : {
                increment: amount
              }
      }
    })
  }

  const createUserBalanceEventsLog = (data: Omit<UserBalanceEventsLog, 'createdAt' | 'id'>) => {
    return prisma.userBalanceEventsLog.create({
      data
    })
  }

  const createTransaction = (data: Omit<Transaction, 'createdAt' | 'id'>) => {
    return prisma.transaction.create({
      data
    })
  }

  return { getUserBalance, updateUserBalance, createTransaction, createUserBalanceEventsLog }
}
