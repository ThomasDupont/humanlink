import { UserHookProvider } from '@/config'
import { useUser as fakeUseUser } from './fakeUsers.hook'
import { useUser } from './users.hook'

export const getUserHook = (hookType: UserHookProvider) => {
  switch (hookType) {
    case 'real':
      return useUser
    case 'fake':
      return fakeUseUser
  }
}
