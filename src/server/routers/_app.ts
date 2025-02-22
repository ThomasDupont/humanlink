import { createCallerFactory, publicProcedure, router } from '../trpc'
import { z } from 'zod'
import { performSearchWithElastic } from './searchService/searchWithElastic'
import { performSearchWithAlgolia } from './searchService/searchWithAlgolia'
import { elastic } from './searchService/elasticClient'
import { algolia } from './searchService/algoliaClient'
import { serviceOperations, userOperations } from './databaseOperations/prisma.provider'

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),

  get: router({
    serviceList: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional().default(3) }))
      .query(async options => {
        const SEARCH_PROVIDER = 'elastic' as 'algolia' | 'elastic'

        switch (SEARCH_PROVIDER) {
          case 'elastic':
            return await performSearchWithElastic(elastic)({ query: options.input.query })
          case 'algolia':
            return await performSearchWithAlgolia(algolia)({ query: options.input.query })
        }
      }),
    userById: publicProcedure.input(z.number()).query(async options => {
      return await userOperations.getUserById(options.input)
    }),
    serviceById: publicProcedure.input(z.number()).query(async options => {
      return await serviceOperations.getServiceById(options.input)
    })
  })
})

export const createCaller = createCallerFactory(appRouter)

export type AppRouter = typeof appRouter
