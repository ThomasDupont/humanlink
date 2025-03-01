import { TRPCError } from '@trpc/server'
import { publicProcedure } from '../trpc'

export const protectedprocedure = publicProcedure.use(async function isAuthed({ ctx, next }) {
  if (ctx.session && 'user' in ctx.session) {
    return next({
      ctx: {
        session: ctx.session
      }
    })
  }

  throw new TRPCError({
    code: 'UNAUTHORIZED'
  })
})
