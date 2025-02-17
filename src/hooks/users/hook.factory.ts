import { useUser as fakeUseUser } from './fakeUsers.hook'
import { useUser } from './users.hook'

type HookType = 'real' | 'fake'
export const getUserHook = (type: HookType) => {
    switch (type) {
        case 'real':
            return useUser
        case 'fake':
            return fakeUseUser
    }
}
