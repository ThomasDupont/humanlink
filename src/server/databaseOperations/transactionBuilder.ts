import { PaymentProvider, PrismaClient } from '@prisma/client'

type AddPaymentTransactionArgs = {
  sellerId: number
  amount: number
  userId: number
  provider: PaymentProvider
  providerPaymentId: string
  offerId: number
}

type AcceptOfferRenderingsAndCreateMoneyTransfertTransactionArgs = {
  sellerId: number
  balanceId: number
  fees: number
  amount: number
  userId: number
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

type CloseMilestoneAndOfferArgs = {
  hasDoneAllMilestone: boolean
  milestoneId: number
  offerId: number
}

export const transaction = (prisma: PrismaClient) => {
  const acceptOfferTransaction = (args: AddPaymentTransactionArgs) => {
    return prisma.$transaction([
      prisma.userBalanceEventsLog.create({
        data: {
          amount: args.amount,
          eventType: 'payment',
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

  const addMilestoneRenderingTransaction = (args: AddMilestoneRendering) => {
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

  const deleteAMilestoneFileTransaction = (milestoneId: number, hash: string) => {
    return prisma.$transaction(async tx => {
      const milestone = await tx.milestone.findUnique({
        where: { id: milestoneId }
      })

      const newFiles = milestone?.renderingFiles.filter(file => file !== hash)

      await tx.milestone.update({
        where: { id: milestoneId },
        data: {
          renderingFiles: newFiles ?? []
        }
      })

      await tx.file.delete({
        where: { hash }
      })
    })
  }

  const acceptOfferRenderingsAndCreateMoneyTransfertTransaction = (
    args: AcceptOfferRenderingsAndCreateMoneyTransfertTransactionArgs
  ) => {
    const updatedAt = new Date()
    return prisma.$transaction([
      prisma.userBalance.update({
        where: { id: args.balanceId },
        data: {
          balance: {
            increment: args.amount
          },
          updatedAt: updatedAt
        }
      }),
      prisma.transaction.create({
        data: {
          createdAt: updatedAt,
          amount: args.amount,
          buyerId: args.userId,
          offerId: args.offerId,
          sellerId: args.sellerId,
          type: 'transfertToSellerBalance',
          milestoneId: null,
          comment: ''
        }
      }),
      prisma.transaction.create({
        data: {
          createdAt: updatedAt,
          amount: args.fees,
          buyerId: args.userId,
          offerId: args.offerId,
          sellerId: args.sellerId,
          type: 'fees',
          milestoneId: null,
          comment: `Main amount ${args.amount}`
        }
      }),
      prisma.offer.update({
        where: { id: args.offerId, userIdReceiver: args.userId },
        data: {
          isPaid: true,
          paidDate: updatedAt
        }
      })
    ])
  }

  const closeMilestoneAndOfferTransaction = (args: CloseMilestoneAndOfferArgs) => {
    return prisma.$transaction(async tx => {
      const terminatedAt = new Date()
      await tx.milestone.update({
        where: { id: args.milestoneId },
        data: {
          terminatedAt
        }
      })

      if (args.hasDoneAllMilestone) {
        await tx.offer.update({
          where: { id: args.offerId },
          data: {
            terminatedAt,
            isTerminated: true
          }
        })
      }
    })
  }

  return {
    acceptOfferTransaction,
    addMilestoneRenderingTransaction,
    deleteAMilestoneFileTransaction,
    acceptOfferRenderingsAndCreateMoneyTransfertTransaction,
    closeMilestoneAndOfferTransaction
  }
}
