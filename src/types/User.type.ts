import { Price, Service, User } from '@prisma/client'

export type UserWithServicesWithPrices = User & {
  services: (Service & {
    prices: Price[]
  })[]
}

export type NextAuthJsUserError = {
  message: string
  cause: string
}
