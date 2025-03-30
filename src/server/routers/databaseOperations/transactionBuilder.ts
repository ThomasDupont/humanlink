import { PaymentEventType, PaymentProvider, PrismaClient } from '@prisma/client'

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
    relatedUsers: number[]
  }[]
  text: string | null
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
    return prisma.$transaction(async tx => {
      for (const file of args.files) {
        const existing = await tx.file.findUnique({
          where: { hash: file.hash },
          select: { relatedUsers: true }
        })

        const existingUsers = existing?.relatedUsers ?? []
        const mergedUsers = Array.from(new Set([...existingUsers, ...file.relatedUsers]))

        await tx.file.upsert({
          where: { hash: file.hash },
          update: {
            relatedUsers: {
              set: mergedUsers
            }
          },
          create: file
        })
      }

      await tx.milestone.update({
        where: { id: args.milestoneId },
        data: {
          renderingText: args.text,
          renderingFiles: { push: args.files.map(file => file.hash) }
        }
      })
    })
  }

  return { acceptOfferTransaction, addMilestoneRendering }
}
