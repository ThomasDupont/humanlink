import { Category, Currency, ServiceType } from '@prisma/client'

export type UserHookProvider = 'real' | 'fake'
export type SearchHookProvider = 'elastic' | 'transformer'
export type BackendSearchProvider = 'algolia' | 'elastic'
export type SupportedLocale = 'fr' | 'en'
export type paymentProvider = 'stripe'

type Config = {
  userHookProvider: UserHookProvider
  searchHookProvider: SearchHookProvider
  backendSearchProvider: BackendSearchProvider
  authorizeHTMLTagForDescription: string[]
  paymentProvider: 'stripe'
  defaultCurrency: Currency
  storageProvider: 'tigris'
  emailProvider: 'mailjet'
  fees: number
  frontUrl: string
  userInteraction: {
    descriptionMaxLen: number
    jobTitleMaxLen: number
    serviceTitleMaxLen: number
    serviceShortDescriptionMaxLen: number
    serviceDescriptionMaxLen: number
    messageMaxLen: number
    fixedPriceMax: number
    maxUploadFileSize: number
    maxUploadFiles: number
    maxUploadFilesForService: number
    extFilesForService: string[]
    maxUploadFileSizeForService: number
  }
  serviceTypeFromCategory: Record<Category, ServiceType>
}

const config: Config = {
  userHookProvider: 'real',
  searchHookProvider: 'elastic',
  backendSearchProvider: 'elastic',
  authorizeHTMLTagForDescription: ['p', 'strong', 'br', 'ul', 'li', 'em', 'u'],
  paymentProvider: 'stripe',
  defaultCurrency: 'EUR',
  storageProvider: 'tigris',
  emailProvider: 'mailjet',
  fees: 0.08,
  frontUrl: 'https://humanlink.vercel.app',
  userInteraction: {
    descriptionMaxLen: 2000,
    jobTitleMaxLen: 100,
    serviceTitleMaxLen: 120,
    serviceShortDescriptionMaxLen: 300,
    serviceDescriptionMaxLen: 2000,
    messageMaxLen: 1000,
    fixedPriceMax: 50_000_00,
    maxUploadFileSize: 10_000_000,
    maxUploadFiles: 5,
    maxUploadFilesForService: 1,
    maxUploadFileSizeForService: 500_000,
    extFilesForService: ['image/webp']
  },
  serviceTypeFromCategory: {
    ...(Object.fromEntries(Object.keys(Category).map(key => [key, 'digital'])) as Record<
      Category,
      ServiceType
    >),
    DIY: 'physical',
    Gardening: 'physical'
  }
}

export default config
