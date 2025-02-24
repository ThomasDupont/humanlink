import { OauthProvider } from '@prisma/client'
import { useSession, signIn } from 'next-auth/react'

export const useAuthSession = () => {
  const { status } = useSession()

  const overridedSignIn = (options?: { provider?: OauthProvider; callbackUrl: string }) => {
    //if (status === 'unauthenticated') {
    return signIn(options?.provider, options && { callbackUrl: options.callbackUrl })
    //}
  }

  return { overridedSignIn, connectedStatus: status }
}
