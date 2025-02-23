import { User } from '@prisma/client'

export type HookInterface = {
  getUserById: (id: number) => Promise<User | null>
  getUserByIds: (ids: number[]) => Promise<User[]>
}
