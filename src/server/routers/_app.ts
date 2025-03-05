import { createCallerFactory, publicProcedure, router } from '../trpc'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { z } from 'zod'
import {
  messageOperations,
  serviceOperations,
  userOperations
} from './databaseOperations/prisma.provider'
import config from '@/config'
import searchFactory from './searchService/search.factory'
import { protectedprocedure } from './middlewares'
import { userMe } from './trpcProcedures/get.trpc'
import { cleanHtmlTag } from '@/utils/cleanHtmlTag'

export const appRouter = router({
  get: router({
    serviceList: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional().default(3) }))
      .query(options =>
        searchFactory[config.backendSearchProvider]({ query: options.input.query })
      ),
    userById: publicProcedure
      .input(z.number())
      .query(options => userOperations.getUserById(options.input)),
    userByIds: publicProcedure
      .input(z.array(z.number()))
      .query(options => userOperations.getUserByIds(options.input)),
    serviceById: publicProcedure
      .input(z.number())
      .query(options => serviceOperations.getServiceById(options.input))
  }),
  protectedGet: router({
    me: protectedprocedure.query(({ ctx }) => userMe(ctx.session.user.email).run()),
    conversation: protectedprocedure
      .input(
        z.object({
          receiverId: z.number()
        })
      )
      .query(options =>
        messageOperations.getConversation({
          receiverId: options.input.receiverId,
          senderId: options.ctx.session.user.id
        })
      )
  }),
  protectedMutation: router({
    sendMessage: protectedprocedure
      .input(
        z.object({
          receiverId: z.number(),
          message: z.string().min(1).max(config.userInteraction.messageMaxLen)
        })
      )
      .mutation(options =>
        messageOperations.sendMessage({
          senderId: options.ctx.session.user.id,
          receiverId: options.input.receiverId,
          message: options.input.message
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
            jobTitle: z.string().min(0).max(config.userInteraction.jobTitleMaxLen),
            isFreelance: z.boolean()
          })
        )
        .mutation(options =>
          userOperations.updateUser({
            id: options.ctx.session.user.id,
            description: options.input.description,
            jobTitle: options.input.jobTitle,
            isFreelance: options.input.isFreelance
          })
        )
    })
  })
})

export const createCaller = createCallerFactory(appRouter)

export type AppRouter = typeof appRouter
