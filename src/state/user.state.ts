import { proxy, useSnapshot } from 'valtio'

type UserState = {
  userId: number | null
}

const userState = proxy<UserState>({
  userId: null
})

const setUser = ({ id }: { id: number }) => {
  userState.userId = id
}

export const useUserState = () => ({
  setUser,
  userSnapshot: useSnapshot(userState)
})
