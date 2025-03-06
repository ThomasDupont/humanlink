export type UserHookProvider = 'real' | 'fake'
export type SearchHookProvider = 'elastic' | 'transformer'
export type BackendSearchProvider = 'algolia' | 'elastic'
export type SuportedLocale = 'fr' | 'en'

type Config = {
  userHookProvider: UserHookProvider
  searchHookProvider: SearchHookProvider
  backendSearchProvider: BackendSearchProvider
  authorizeHTMLTagForDescription: string[]
  userInteraction: {
    descriptionMaxLen: number
    jobTitleMaxLen: number
    serviceTitleMaxLen: number
    serviceShortDescriptionMaxLen: number
    serviceDescriptionMaxLen: number
    messageMaxLen: number
    fixedPriceMax: number
  }
}

const config: Config = {
  userHookProvider: 'real',
  searchHookProvider: 'elastic',
  backendSearchProvider: 'elastic',
  authorizeHTMLTagForDescription: ['p', 'strong', 'br', 'ul', 'li', 'em', 'u'],
  userInteraction: {
    descriptionMaxLen: 2000,
    jobTitleMaxLen: 100,
    serviceTitleMaxLen: 100,
    serviceShortDescriptionMaxLen: 300,
    serviceDescriptionMaxLen: 2000,
    messageMaxLen: 1000,
    fixedPriceMax: 50_000_00
  }
}

export default config
