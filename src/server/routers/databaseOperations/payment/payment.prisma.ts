import { PaymentEventType, PaymentFrom, PaymentProvider, PrismaClient } from '@prisma/client'

type AddPaymentTransactionArgs = {
  amount: number
  balanceId: number
  userId: number
  eventType: PaymentEventType
  provider: PaymentProvider
  providerPaymentId: string
  from: PaymentFrom
  fromId: number
}
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

  const addPaymentTransaction = (args: AddPaymentTransactionArgs) => {
    return prisma.$transaction([
      prisma.userBalanceEventsLog.create({
        data: {
          amount: args.amount,
          eventType: args.eventType,
          provider: args.provider,
          providerPaymentId: args.providerPaymentId,
          from: args.from,
          fromId: args.fromId,
          userId: args.userId
        }
      }),
      updateUserBalance(args.balanceId, args.amount)
    ])
  }

  return { getUserBalance, updateUserBalance, addPaymentTransaction }
}
