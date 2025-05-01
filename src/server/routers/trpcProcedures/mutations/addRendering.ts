import { Logger } from '@/server/logger'
import { Effect as T } from 'effect'
import {
  OfferOperations,
  TransactionOperations,
  userOperations
} from '../../../databaseOperations/prisma.provider'
import { StorageProviderFactory } from '../../../storage/storage.provider'
import config from '@/config'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'
import { rebuildPathForSecurity } from '@/utils/rebuildPathForSecurity'
import { mailProviderFactory } from '@/server/emailOperations/email.provider'
import { buildNotificationEmail } from '@/server/emailOperations/buildEmail'

const _sendNotification =
  ({
    userOps,
    emailFactory
  }: {
    userOps: typeof userOperations
    emailFactory: typeof mailProviderFactory
  }) =>
  async ({
    senderId,
    receiverId,
    offer
  }: {
    senderId: number
    receiverId: number
    offer: {
      id: number
      title: string
    }
  }) => {
    const sender = await userOps.selectUserById(senderId, { firstname: true })
    const receiver = await userOps.selectUserById(receiverId, { firstname: true, email: true })

    if (!receiver) {
      throw new Error(`Receiver with ID ${receiverId} not found`)
    }

    if (!sender) {
      throw new Error(`Sender with ID ${senderId} not found`)
    }

    const detail = `${sender.firstname} add a rendering to the offer ${offer.title}, you could consult the detail here <a href="${config.frontUrl}/dashboard/detail/offer/${offer.id}">here</a>`
    const html = buildNotificationEmail({
      firstname: receiver.firstname,
      notificationType: 'RENDERING_ADDED',
      detail
    })

    const mail = emailFactory[config.emailProvider]()
    await mail.sendEmail({
      to: {
        email: receiver.email,
        name: receiver.firstname
      },
      subject: 'Offer accepted',
      text: detail,
      html
    })
  }

export type AddRenderingEffectArgs = {
  milestoneId: number
  offerId: number
  bucket: string
  userId: number
  text: string | null
  files: {
    originalFilename: string
    path: string
  }[]
}
export const addRenderingEffect = ({
  userId,
  files,
  bucket,
  offerId,
  milestoneId,
  text
}: AddRenderingEffectArgs) =>
  T.gen(function* () {
    const logger = yield* Logger
    const transactionOperations = yield* TransactionOperations
    const offerOperations = yield* OfferOperations
    const storageFactory = yield* StorageProviderFactory

    const storage = storageFactory[config.storageProvider]()

    return T.all(
      files.map(file =>
        T.tryPromise({
          try: () =>
            storage
              .getFileInfo(bucket)(rebuildPathForSecurity(userId, file.path))
              .then(info => ({
                ...info,
                ...file
              })),
          catch: error => {
            logger.error({
              cause: 'storage_provider_error',
              message: `add ${file.path} error`,
              detailedError: error
            })

            return new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `${file.path}_not_found_in_storage_provider`
            })
          }
        })
      )
    ).pipe(
      T.flatMap(fileinfo =>
        T.tryPromise({
          try: () => offerOperations.getAnOfferByCreatorId(offerId, userId),
          catch: error => {
            logger.error({
              cause: 'database_error',
              message: `get offer ${offerId} db error`,
              detailedError: error
            })

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              return new TRPCError({
                code: 'NOT_FOUND',
                message: 'offer_not_found_for_user'
              })
            }
            return new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'offer_not_found_for_user'
            })
          }
        }).pipe(
          T.flatMap(offer => {
            if (
              offer !== null &&
              offer.milestone.find(m => m.id === milestoneId) !== undefined &&
              offer.userId !== null &&
              offer.userIdReceiver !== null &&
              offer.isAccepted
            ) {
              const { milestone, userId, userIdReceiver, ...rest } = offer
              return T.succeed({
                userIdReceiver,
                userId,
                milestone,
                ...rest
              })
            }

            logger.error({
              cause: 'offer_or_milestone_not_found',
              message: `offer ${offerId} or milestone ${milestoneId} not found on db`,
              detailedError: {}
            })
            return T.fail(
              new TRPCError({
                code: 'NOT_FOUND',
                message: 'offer_or_milestone_not_found_for_user'
              })
            )
          }),
          T.map(offer =>
            fileinfo.map(file => ({
              ...file,
              relatedUsers: [offer.userId, offer.userIdReceiver]
            }))
          )
        )
      ),
      T.flatMap(fileInfo =>
        T.tryPromise({
          try: () =>
            transactionOperations.addMilestoneRenderingTransaction({
              files: fileInfo.map(info => ({
                hash: info.path,
                size: info.size ?? 0,
                mimetype: info.mimetype ?? 'octet/stream',
                originalFilename: info.originalFilename,
                relatedUsers: info.relatedUsers
              })),
              milestoneId,
              text
            }),
          catch: error => {
            logger.error({
              cause: 'database_error',
              message: `transactionOperations addMilestoneRendering ${milestoneId} db accept error`,
              detailedError: error
            })

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              return new TRPCError({
                code: 'NOT_FOUND',
                message: `milestone_not_found_for_user`
              })
            }
            return new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'milestone_not_found_for_user'
            })
          }
        })
      )
    )
  }).pipe(T.flatten)
