import { createCallerFactory, publicProcedure, router } from '../trpc'
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
          message: z.string().min(1).max(200)
        })
      )
      .mutation(options =>
        messageOperations.sendMessage({
          senderId: options.ctx.session.user.id,
          receiverId: options.input.receiverId,
          message: options.input.message
        })
      )
  })
})

export const createCaller = createCallerFactory(appRouter)

export type AppRouter = typeof appRouter
