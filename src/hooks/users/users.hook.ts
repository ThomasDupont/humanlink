import { HookInterface } from "./hook.interface"

export const useUser = (): HookInterface => {
    const getUserById = () => Promise.resolve(null)

    return { getUserById }
}
