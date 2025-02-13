import { createCallerFactory, publicProcedure, router } from '../trpc';
import { z } from 'zod'
import { performSearchWithElastic } from './searchProduct/searchWithElastic';
import { performSearchWithAlgolia } from './searchProduct/searchWithAlgolia';


export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),

  get: router({
    serviceList: publicProcedure
    .input(z.object({query: z.string(), limit: z.number().optional().default(3)}))
    .query(async (options) => {
        const SEARCH_PROVIDER = 'elastic' as 'algolia' | 'elastic'

        switch (SEARCH_PROVIDER) {
            case 'elastic':
                return await performSearchWithElastic({ query: options.input.query })
            case 'algolia':
                return await performSearchWithAlgolia({ query: options.input.query })
        }
    }),
}),
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
