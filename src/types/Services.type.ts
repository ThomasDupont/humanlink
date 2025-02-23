import { Price, Service } from '@prisma/client'

export type ServiceInElastic = Omit<Service, 'createdAt'> & {
  createdAt: string
  fulltext: string
  prices: Price[]
}

export type ServiceFromDB = Omit<Service, 'createdAt'> & {
  createdAt: string
  prices: Price[]
}
