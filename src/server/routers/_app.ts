import { createCallerFactory, publicProcedure, router } from '../trpc'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { z } from 'zod'
import {
  messageOperations,
  offerOperations,
  serviceOperations,
  userOperations
} from './databaseOperations/prisma.provider'
import config from '@/config'
import searchFactory from './searchService/search.factory'
import { protectedprocedure } from './middlewares'
import {
  getContactList,
  getOfferDetail,
  getProtectedFiles,
  listOffer
} from './trpcProcedures/get.trpc'
import { userMe } from './trpcProcedures/get.trpc'
import { cleanHtmlTag } from '@/utils/cleanHtmlTag'
import { Category, Lang, PaymentProvider } from '@prisma/client'
import {
  acceptOffer,
  addRendering,
  createOfferWithMessage,
  createStripePaymentIntent,
  upsertService
} from './trpcProcedures/upsert.trpc'
import { deleteAMilestoneFile, deleteAService } from './trpcProcedures/delete.trpc'
import {
  singleUserToDisplayUserForOther,
  userWithServiceToDisplayUserForOther
} from '../dto/user.dto'
import { TRPCError } from '@trpc/server'

export const appRouter = router({
  get: router({
    serviceList: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional().default(3) }))
      .query(options =>
        searchFactory[config.backendSearchProvider]({ query: options.input.query })
      ),
    userById: publicProcedure.input(z.number()).query(options =>
      userOperations.getUserById(options.input).then(u => {
        if (!u) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'user_not_found'
          })
        }
        return userWithServiceToDisplayUserForOther(u)
      })
    ),
    userByIds: publicProcedure
      .input(z.array(z.number()))
      .query(options =>
        userOperations.getUserByIds(options.input).then(u => u.map(singleUserToDisplayUserForOther))
      ),
    serviceById: publicProcedure
      .input(z.number())
      .query(options => serviceOperations.getServiceById(options.input))
  }),
  protectedGet: router({
    me: protectedprocedure.query(({ ctx }) => userMe(ctx.session.user.id).run()),
    conversation: protectedprocedure
      .input(
        z.object({
          receiverId: z.number()
        })
      )
      .query(({ input, ctx }) =>
        messageOperations.getConversation({
          receiverId: input.receiverId,
          senderId: ctx.session.user.id
        })
      ),
    getContacts: protectedprocedure.query(({ ctx }) => getContactList(ctx.session.user.id).run()),
    userServices: protectedprocedure.query(({ ctx }) =>
      serviceOperations.getuserServices(ctx.session.user.id)
    ),
    listOffers: protectedprocedure.query(({ ctx }) => listOffer(ctx.session.user.id).run()),
    offerDetail: protectedprocedure
      .input(z.number())
      .query(({ input, ctx }) => getOfferDetail(ctx.session.user.id, input).run()),
    getProtectedFiles: protectedprocedure
      .input(
        z.object({
          files: z.array(z.string())
        })
      )
      .query(({ input, ctx }) =>
        getProtectedFiles(ctx.session.user.id, input.files, 'ascend-rendering-offer').run()
      )
  }),
  protectedMutation: router({
    sendMessage: protectedprocedure
      .input(
        z.object({
          receiverId: z.number(),
          message: z.string().min(1).max(config.userInteraction.messageMaxLen),
          offerId: z.number().optional()
        })
      )
      .mutation(({ input, ctx }) =>
        input.offerId
          ? messageOperations.sendMessageWithOffer({
              senderId: ctx.session.user.id,
              receiverId: input.receiverId,
              offerId: input.offerId
            })
          : messageOperations.sendMessage({
              senderId: ctx.session.user.id,
              receiverId: input.receiverId,
              message: input.message
            })
      ),

    user: router({
      profile: protectedprocedure
        .input(
          z.object({
            description: z
              .string()
              .min(0)
              .max(config.userInteraction.descriptionMaxLen)
              .transform(cleanHtmlTag(DOMPurify(new JSDOM('<!DOCTYPE html>').window))),
            jobTitle: z.string().min(0).max(config.userInteraction.jobTitleMaxLen)
          })
        )
        .mutation(({ input, ctx }) =>
          userOperations.updateUser({
            id: ctx.session.user.id,
            description: input.description,
            jobTitle: input.jobTitle
          })
        )
    }),
    service: router({
      upsert: protectedprocedure
        .input(
          z.object({
            id: z.number().optional(),
            title: z.string().min(1).max(config.userInteraction.serviceTitleMaxLen),
            shortDescription: z
              .string()
              .min(1)
              .max(config.userInteraction.serviceShortDescriptionMaxLen),
            description: z.string().min(1).max(config.userInteraction.descriptionMaxLen),
            category: z.nativeEnum(Category),
            langs: z.array(z.nativeEnum(Lang)),
            prices: z.array(
              z.object({
                number: z.number().min(100).max(config.userInteraction.fixedPriceMax),
                id: z.number().optional()
              })
            )
          })
        )
        .mutation(({ input, ctx }) => {
          return upsertService({
            userId: ctx.session.user.id,
            serviceId: input.id,
            service: {
              title: input.title,
              description: input.description,
              descriptionShort: input.shortDescription,
              category: input.category,
              langs: input.langs,
              type: config.serviceTypeFromCategory[input.category],
              // ---- MVP default
              images: ['https://picsum.photos/1000/625'],
              localisation: '',
              renewable: false
            },
            prices: input.prices.map(price => ({
              id: price.id ?? 0,
              number: price.number,
              // ---- MVP default
              type: 'fix',
              currency: 'EUR'
            }))
          }).run()
        }),
      delete: protectedprocedure
        .input(z.number())
        .mutation(({ input, ctx }) => deleteAService(input, ctx.session.user.id).run())
    }),
    payment: router({
      stripe: router({
        createPaymentIntent: protectedprocedure
          .input(
            z.discriminatedUnion('type', [
              z.object({
                type: z.literal('offer'),
                offerId: z.number(),
                idempotencyKey: z.string(),
                voucherCode: z.string().optional()
              }),
              z.object({
                type: z.literal('milestone'),
                milestoneId: z.number(),
                idempotencyKey: z.string(),
                voucherCode: z.string().optional()
              })
            ])
          )
          .mutation(({ input, ctx }) => createStripePaymentIntent(input).run(ctx.session.user.id))
      })
    }),
    offer: router({
      create: protectedprocedure
        .input(
          z.object({
            serviceId: z.number(),
            description: z.string().min(1).max(config.userInteraction.serviceDescriptionMaxLen),
            price: z.number().min(100).max(config.userInteraction.fixedPriceMax),
            receiverId: z.number(),
            deadline: z.coerce
              .date()
              .refine(date => date > new Date(), { message: 'date_in_the_past' })
          })
        )
        .mutation(({ input, ctx }) =>
          createOfferWithMessage({
            description: input.description,
            deadline: input.deadline,
            serviceId: input.serviceId,
            userId: ctx.session.user.id,
            isAccepted: false,
            isPaid: false,
            isTerminated: false,
            terminatedAt: null,
            acceptedAt: null,
            paidDate: null,
            comment: null,
            userIdReceiver: input.receiverId,
            // default: 1
            milestones: [
              {
                description: input.description,
                deadline: input.deadline,
                terminatedAt: null,
                renderingFiles: [],
                renderingText: null,
                validatedAt: null,
                priceMilestone: {
                  number: input.price,
                  type: 'fix',
                  currency: 'EUR',
                  itemCount: 1,
                  baseForPercent: null
                }
              }
            ]
          }).run()
        ),
      accept: protectedprocedure
        .input(
          z.object({
            offerId: z.number(),
            paymentId: z.string(),
            paymentProvider: z.nativeEnum(PaymentProvider)
          })
        )
        .mutation(({ input, ctx }) =>
          acceptOffer({
            offerId: input.offerId,
            paymentId: input.paymentId,
            paymentProvider: input.paymentProvider,
            userId: ctx.session.user.id
          }).run()
        ),
      addRendering: protectedprocedure
        .input(
          z.object({
            milestoneId: z.number(),
            offerId: z.number(),
            files: z
              .array(
                z.object({
                  originalFilename: z.string(),
                  path: z.string()
                })
              )
              .max(config.userInteraction.maxUploadFileSize),
            text: z.string().max(config.userInteraction.serviceDescriptionMaxLen).nullable()
          })
        )
        .mutation(({ input, ctx }) =>
          addRendering({
            userId: ctx.session.user.id,
            bucket: 'ascend-rendering-offer',
            ...input
          }).run()
        ),
      deleteAMilestoneFile: protectedprocedure.input(z.object({
        offerId: z.number(),
        milestoneId: z.number(),
        hash: z.string()
      })).mutation(({input, ctx}) => 
        deleteAMilestoneFile({
          userId: ctx.session.user.id,
          bucket:  'ascend-rendering-offer',
          ...input
        }).run()
      ),
      closeOffer: protectedprocedure
        .input(
          z.object({
            offerId: z.number()
          })
        )
        .mutation(({ input, ctx }) =>
          offerOperations.closeOffer(input.offerId, ctx.session.user.id)
        )
    })
  })
})

export const createCaller = createCallerFactory(appRouter)

export type AppRouter = typeof appRouter
