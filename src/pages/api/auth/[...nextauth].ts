/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from '@/server/env'
import NextAuth, { NextAuthOptions } from 'next-auth'
import LinkedinProvider, { LinkedInProfile } from 'next-auth/providers/linkedin'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { extendedPrisma, userOperations } from '@/server/databaseOperations/prisma.provider'
import { PrismaAdapter } from '@/server/authAdapter.ts/prisma'
import { mailProviderFactory } from '@/server/emailOperations/email.provider'
import { buildMagicLinkEmail } from '@/server/emailOperations/buildEmail'

export const authOptions: NextAuthOptions = {
  secret: env.AUTH_SECRET,
  providers: [
    LinkedinProvider({
      allowDangerousEmailAccountLinking: true,
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
      allowDangerousEmailAccountLinking: true,
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest({ identifier: email, url: link, provider: { server, from } }) {
        console.log('Sending verification email to:', email)
        const provider = mailProviderFactory.mailjet()

        const builtEmail = buildMagicLinkEmail({ link })

        return provider.sendEmail({
          to: {
            email,
            name: ''
          },
          subject: 'Connect to Humanlink',
          text: `Click the link to sign in: ${link}`,
          html: builtEmail
        })
      }
    }),
    GoogleProvider({
      allowDangerousEmailAccountLinking: true,
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    })
  ],
  adapter: PrismaAdapter(extendedPrisma),
  callbacks: {
    async signIn({ user, account, email }) {
      const userExists = await userOperations.verifyIfUserExistsByEmail(user.email ?? '')
      if (userExists) {
        return true //if the email exists in the User collection, email them a magic login link
      } else {
        return '/register'
      }
    },
    session: ({ session, user }) => ({
      user: { email: user.email, id: parseInt(user.id, 10) },
      expires: session.expires
    })
  }
}

export default NextAuth(authOptions)
