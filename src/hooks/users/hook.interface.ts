import { UserDTO } from '@/server/dto/user.dto'

export type HookInterface = {
  getUserByIds: (ids: number[]) => Promise<UserDTO[]>
}
