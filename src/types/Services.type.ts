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

export type ServiceWithPrice = Service & {
  prices: Price[]
}

export type ServiceWithPriceWithoutCreatedDateAndId = Omit<Service, 'id' | 'createdAt'> & {
  prices: Omit<Price, 'id' | 'serviceId'>[]
}
