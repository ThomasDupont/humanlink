export type UserHookProvider = 'real' | 'fake'
export type SearchHookProvider = 'elastic' | 'transformer'
export type BackendSearchProvider = 'algolia' | 'elastic'
export type SuportedLocale = 'fr' | 'en'

type Config = {
  userHookProvider: UserHookProvider
  searchHookProvider: SearchHookProvider
  backendSearchProvider: BackendSearchProvider
}

const config: Config = {
  userHookProvider: 'real',
  searchHookProvider: 'elastic',
  backendSearchProvider: 'elastic'
}

export default config
