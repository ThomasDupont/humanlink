import { OauthProvider, Price, Service, User } from '@prisma/client'

export type UserWithServicesWithPrices = User & {
  services: (Service & {
    prices: Price[]
  })[]
}

export type NextAuthJsUser = {
  name: string
  image: string
  email: string
  provider: OauthProvider
  firstname: string
  lastname: string
  locale?: string
}
