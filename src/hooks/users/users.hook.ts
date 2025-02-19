import { useCallback } from "react"
import { HookInterface } from "./hook.interface"

export const useUser = (): HookInterface => {
    const getUserById = useCallback(() => Promise.resolve(null), [])

    return { getUserById }
}
