import { createCallerFactory, publicProcedure, router } from '../trpc'
import { z } from 'zod'
import { serviceOperations, userOperations } from './databaseOperations/prisma.provider'
import config from '@/config'
import searchFactory from './searchService/search.factory'
import { TRPCError } from '@trpc/server'
import { protectedprocedure } from './middlewares'
import { logger } from '../logger'

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
    me: protectedprocedure.query(async ({ ctx }) => {
      try {
        const user = await userOperations.getUserByEmailWithoutService(ctx.session.user.email)

        if (!user) {
          logger.error({
            cause: 'incoherent_session_and_db_data',
            message: `${ctx.session.user.email} not found on db`,
            detailedError: {}
          })
          throw new TRPCError({
            code: 'NOT_FOUND'
          })
        }
        return user
      } catch (e: unknown) {
        logger.error({
          cause: 'database_error',
          message: `${ctx.session.user.email} db error ${(e as Error).message}`,
          detailedError: e
        })
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR'
        })
      }
    })
  })
})

export const createCaller = createCallerFactory(appRouter)

export type AppRouter = typeof appRouter
