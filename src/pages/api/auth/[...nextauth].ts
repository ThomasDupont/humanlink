/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from '@/server/env'
import NextAuth, { NextAuthOptions } from 'next-auth'
import LinkedinProvider, { LinkedInProfile } from 'next-auth/providers/linkedin'
import GitHubProvider from 'next-auth/providers/github'
// import GoogleProvider from 'next-auth/providers/google'
import { User } from '@prisma/client'
import { userOperations } from '@/server/databaseOperations/prisma.provider'
import { logger } from '@/server/logger'

export const authOptions: NextAuthOptions = {
  secret: env.AUTH_SECRET,
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
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET
    })
    /*
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    })
      */
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      const dbUser: Omit<User, 'id' | 'createdAt' | 'userBalanceId'> = {
        firstname: profile.given_name,
        lastname: profile.family_name,
        image: user.image,
        email: user.email,
        oauthProvider: account.provider,
        isCertified: false,
        description: '',
        jobTitle: '',
        certifiedDate: null,
        roles: ['USER'],
        country: 'USA'
      }

      try {
        const userExists = await userOperations.verifyIfUserExistsByEmail(dbUser.email)

        if (!userExists) {
          const createdUser = await userOperations.createUser(dbUser)

          account.id = createdUser.id
        } else {
          account.id = userExists.id
        }
      } catch (e: unknown) {
        logger.error({
          error: 'database_error',
          message: (e as Error).message,
          errorDetail: e
        })

        return false
      }

      return true
    },
    jwt({ token, account, profile }: any) {
      if (account) {
        token.provider = account.provider
        token.firstname = profile.given_name
        token.lastname = profile.family_name
        token.id = account.id
        token.locale = profile.locale
      }
      return token
    },
    async session({ session, token }: any) {
      return {
        user: { email: session.user.email, id: token.id },
        expires: session.expires
      }
    }
  }
}

export default NextAuth(authOptions)
