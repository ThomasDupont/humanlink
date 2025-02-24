/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from '@/server/env'
import NextAuth from 'next-auth'
import LinkedinProvider, { LinkedInProfile } from 'next-auth/providers/linkedin'
import GoogleProvider from 'next-auth/providers/google'
import { NextAuthJsUser } from '@/types/User.type'

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    LinkedinProvider({
      clientId: env.LINKEDIN_ID,
      clientSecret: env.LINKEDIN_SECRET,
      client: { token_endpoint_auth_method: 'client_secret_post' },
      issuer: 'https://www.linkedin.com',
      profile: (profile: LinkedInProfile) => ({
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture
      }),
      wellKnown: 'https://www.linkedin.com/oauth/.well-known/openid-configuration',
      authorization: {
        params: {
          scope: 'openid profile email'
        }
      }
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    async jwt(args: any) {
      if (args.account) {
        args.token.provider = args.account.provider
        args.token.firstname = args.profile.given_name
        args.token.lastname = args.profile.family_name
        args.token.locale = args.profile.locale
      }
      return args.token
    },
    session({ session, token }: any) {
      const user: NextAuthJsUser = {
        ...session.user,
        provider: token.provider,
        firstname: token.firstname,
        lastname: token.lastname,
        locale: token.locale
      }

      // db creation
      return {
        user: user,
        expires: session.expires
      }
    }
  }
}

export default NextAuth(authOptions)
