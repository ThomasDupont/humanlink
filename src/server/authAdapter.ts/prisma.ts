/**
 * Custom Adapter
 *
 * @from @auth/prisma-adapter
 *
 */
import { Prisma, User, type PrismaClient } from '@prisma/client'
import type { Adapter, AdapterAccount, AdapterUser } from '@auth/core/adapters'

function convertUserToAdapterUser(user: User | null): AdapterUser | null {
  if (!user) return null
  console.log('Converting user to AdapterUser:', user)
  return {
    ...user,
    id: user.id.toString() // Ensure ID is a string
  }
}

export function PrismaAdapter(
  prisma: PrismaClient | ReturnType<PrismaClient['$extends']>
): Adapter {
  const p = prisma as PrismaClient
  return {
    createUser: ({ id: _, ...data }) => {
      console.log('Creating user with data:', data)
      return p.user
        .create({
          data: {
            firstname: data.name ?? '',
            lastname: '',
            image: data.image,
            email: data.email,
            emailVerified: data.emailVerified ?? null,
            isCertified: false,
            description: '',
            jobTitle: '',
            certifiedDate: null,
            roles: ['USER'],
            country: 'USA',
            userBalance: {
              create: {}
            }
          },
          include: {
            userBalance: true
          }
        })
        .then(user => ({
          ...user,
          id: user.id.toString() // Ensure ID is a string
        }))
    },
    getUser: id => {
      console.log('Fetching user with ID:', id)
      return p.user.findUnique({ where: { id: parseInt(id, 10) } }).then(convertUserToAdapterUser)
    },
    getUserByEmail: email => {
      console.log('Fetching user with email:', email)
      return p.user.findUnique({ where: { email } }).then(convertUserToAdapterUser)
    },
    async getUserByAccount(provider_providerAccountId) {
      console.log('Fetching user by account:', provider_providerAccountId)
      const account = await p.account.findUnique({
        where: { provider_providerAccountId },
        include: { user: true }
      })
      return convertUserToAdapterUser(account?.user ?? null)
    },
    updateUser: ({ id, ...data }) => {
      console.log('Updating user with ID:', id, 'and data:', data)
      return p.user
        .update({
          where: { id: parseInt(id, 10) },
          data
        })
        .then(user => ({
          ...user,
          id: user.id.toString() // Ensure ID is a string
        }))
    },
    deleteUser: async id => {
      console.log('Deleting user with ID:', id)
      await p.user.delete({ where: { id: parseInt(id, 10) } })
    },
    linkAccount: async ({ id: _, ...data }) => {
      console.log('Linking account with data:', data)
      await p.account.create({
        data: {
          ...data,
          userId: parseInt(data.userId, 10) // Ensure userId is a number
        }
      })
    },
    unlinkAccount: async provider_providerAccountId => {
      console.log('Unlinking account with provider_providerAccountId:', provider_providerAccountId)
      await p.account.delete({
        where: { provider_providerAccountId }
      })
    },
    async getSessionAndUser(sessionToken) {
      console.log('Fetching session and user with sessionToken:', sessionToken)
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true }
      })
      if (!userAndSession) return null
      const { user, ...session } = userAndSession

      return {
        user: {
          ...user,
          id: user.id.toString() // Ensure ID is a string
        },
        session: {
          ...session,
          userId: session.userId.toString() // Ensure userId is a string
        }
      }
    },
    createSession: data => {
      console.log('Creating session with data:', data)
      return p.session
        .create({
          data: {
            ...data,
            userId: parseInt(data.userId, 10) // Ensure userId is a number
          }
        })
        .then(session => ({
          ...session,
          userId: session.userId.toString() // Ensure userId is a string
        }))
    },
    updateSession: data => {
      console.log('Updating session with data:', data)
      return p.session
        .update({
          where: { sessionToken: data.sessionToken },
          data: {
            expires: data.expires,
            ...(data.userId && { userId: parseInt(data.userId, 10) })
          }
        })
        .then(session => ({
          ...session,
          userId: session.userId.toString() // Ensure userId is a string
        }))
    },
    deleteSession: async sessionToken => {
      console.log('Deleting session with sessionToken:', sessionToken)
      await p.session.delete({ where: { sessionToken } })
    },
    async createVerificationToken(data) {
      console.log('Creating verification token with data:', data)
      const verificationToken = await p.verificationToken.create({ data })
      if ('id' in verificationToken && verificationToken.id) delete verificationToken.id
      return verificationToken
    },
    async useVerificationToken(identifier_token) {
      console.log('Using verification token with identifier_token:', identifier_token)
      try {
        const verificationToken = await p.verificationToken.delete({
          where: { identifier_token }
        })
        if ('id' in verificationToken && verificationToken.id) delete verificationToken.id
        return verificationToken
      } catch (error: unknown) {
        // If token already used/deleted, just return null
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025')
          return null
        throw error
      }
    },
    async getAccount(providerAccountId, provider) {
      console.log(
        'Fetching account with providerAccountId:',
        providerAccountId,
        'and provider:',
        provider
      )
      return p.account.findFirst({
        where: { providerAccountId, provider }
      }) as Promise<AdapterAccount | null>
    },
    async createAuthenticator(data) {
      console.log('Creating authenticator with data:', data)
      return p.authenticator
        .create({
          data: {
            ...data,
            userId: parseInt(data.userId, 10) // Ensure userId is a number
          }
        })
        .then(authenticator => ({
          ...authenticator,
          userId: authenticator.userId.toString() // Ensure userId is a string
        }))
    },
    async getAuthenticator(credentialID) {
      console.log('Fetching authenticator with credentialID:', credentialID)
      return p.authenticator
        .findUnique({
          where: { credentialID }
        })
        .then(
          authenticator =>
            authenticator && {
              ...authenticator,
              userId: authenticator.userId.toString() // Ensure userId is a string
            }
        )
    },
    async listAuthenticatorsByUserId(userId) {
      console.log('Listing authenticators for userId:', userId)
      return p.authenticator
        .findMany({
          where: { userId: parseInt(userId, 10) }
        })
        .then(authenticators =>
          authenticators.map(authenticator => ({
            ...authenticator,
            userId: authenticator.userId.toString() // Ensure userId is a string
          }))
        )
    },
    async updateAuthenticatorCounter(credentialID, counter) {
      console.log(
        'Updating authenticator counter for credentialID:',
        credentialID,
        'to counter:',
        counter
      )
      return p.authenticator
        .update({
          where: { credentialID },
          data: { counter }
        })
        .then(authenticator => ({
          ...authenticator,
          userId: authenticator.userId.toString() // Ensure userId is a string
        }))
    }
  }
}
