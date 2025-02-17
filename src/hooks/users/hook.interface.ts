import { User } from "@/types/User.type"

export type HookInterface = {
    getUserById: (id: string) => Promise<User | null>
}
