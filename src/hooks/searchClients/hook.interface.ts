import { ServiceInElastic } from '@/types/Services.type'

export type HookInterface = () => {
  query: (text: string) => void
  ready: boolean
  result: ServiceInElastic[] | undefined
}
