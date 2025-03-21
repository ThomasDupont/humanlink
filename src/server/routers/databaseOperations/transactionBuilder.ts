import { PaymentEventType, PaymentProvider, PrismaClient } from "@prisma/client"

type AddPaymentTransactionArgs = {
  amount: number
  balanceId: number
  userId: number
  eventType: PaymentEventType
  provider: PaymentProvider
  providerPaymentId: string
  offerId: number
}

export const transaction = (prisma: PrismaClient) => {
    const acceptOfferTransaction = (args: AddPaymentTransactionArgs) => {
        return prisma.$transaction([
            prisma.userBalanceEventsLog.create({
              data: {
                amount: args.amount,
                eventType: args.eventType,
                provider: args.provider,
                providerPaymentId: args.providerPaymentId,
                from: 'offer',
                fromId: args.offerId,
                userId: args.userId
              }
            }),
            prisma.userBalance.updateMany({
                where: { id: args.balanceId },
                data: {
                  balance:
                  args.amount < 0
                      ? {
                          decrement: args.amount
                        }
                      : {
                          increment: args.amount
                        }
                }
              }),
            prisma.offer.update({
                where: { id: args.offerId, userIdReceiver: args.userId },
                data: {
                    isAccepted: true,
                    acceptedAt: new Date()
                }
            })
          ])
    }

    return { acceptOfferTransaction }
}
