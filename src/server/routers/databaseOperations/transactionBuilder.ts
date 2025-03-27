import { PaymentEventType, PaymentProvider, PrismaClient } from '@prisma/client'
import { filesOperations, milestoneOperations } from './prisma.provider'

type AddPaymentTransactionArgs = {
  sellerId: number
  amount: number
  userId: number
  eventType: PaymentEventType
  provider: PaymentProvider
  providerPaymentId: string
  offerId: number
}

type AddMilestoneRendering = {
  milestoneId: number
  files: {
    originalFilename: string
    mimetype: string
    size: number
    hash: string
  }[]
  text: string
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
      prisma.transaction.create({
        data: {
          amount: args.amount,
          buyerId: args.userId,
          offerId: args.offerId,
          sellerId: args.sellerId,
          type: 'acceptOffer',
          milestoneId: null,
          comment: ''
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

  const addMilestoneRendering = (args: AddMilestoneRendering) => {
    return prisma.$transaction([
      ...args.files.map(file =>
        filesOperations.addAFile({
          ...file
        })
      ),
      milestoneOperations.addRenderingToAMilestone(args.milestoneId, {
        text: args.text,
        files: args.files.map(file => file.hash)
      })
    ])
  }

  return { acceptOfferTransaction, addMilestoneRendering }
}
