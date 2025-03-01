import { authOptions } from '@/pages/api/auth/[...nextauth]'
import type * as trpcNext from '@trpc/server/adapters/next'
import { getServerSession, Session } from 'next-auth'

interface CreateContextOptions {
  session: Session | null
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export async function createContextInner(opts: CreateContextOptions) {
  return opts
}

export type Context = Awaited<ReturnType<typeof createContextInner>>

/**
 * Creates context for an incoming request
 * @see https://trpc.io/docs/v11/context
 */
export async function createContext(ctx: trpcNext.CreateNextContextOptions): Promise<Context> {
  const { req, res } = ctx

  const session = await getServerSession(req, res, authOptions)

  return await createContextInner({ session })
}
