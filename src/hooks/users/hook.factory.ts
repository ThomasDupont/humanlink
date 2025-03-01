import { UserHookProvider } from '@/config'
import { useUser as fakeUseUser } from './fakeUsers.hook'
import { useUser } from './users.hook'
import { HookInterface } from './hook.interface'
import { PatternMatching } from '@/types/utility.type'

const factory: PatternMatching<{
  [K in UserHookProvider]: () => HookInterface
}> = {
  real: useUser,
  fake: fakeUseUser
}

export default factory
