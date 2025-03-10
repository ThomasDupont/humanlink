import { trpc } from '@/utils/trpc'
import { Message } from '@prisma/client'

const parseMessage = (
  c: Omit<Message, 'createdAt' | 'readAt'> & { createdAt: string; readAt: string | null }
): Message => ({
  ...c,
  readAt: c.readAt ? new Date(c.readAt) : null,
  createdAt: new Date(c.createdAt)
})

export const useConversation = (receiverId: number) => {
  const { data: conversations, refetch } = trpc.protectedGet.conversation.useQuery(
    { receiverId },
    {
      refetchInterval: 1000 * 60
    }
  )

  return { queue: conversations ? conversations.map(m => parseMessage(m)) : [], refetch }
}
