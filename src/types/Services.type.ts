import { Price, Service } from '@prisma/client'

export type ServiceInElastic = Service & {
  createdAt: string
  fulltext: string
  prices: Price[]
}
