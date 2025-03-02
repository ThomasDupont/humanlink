import { trpc } from '@/utils/trpc'
import { Message } from '@prisma/client'
import { useEffect, useState } from 'react'

export const parseMessage = (
  c: Omit<Message, 'createdAt' | 'readAt'> & { createdAt: string; readAt: string | null }
): Message => ({
  ...c,
  readAt: c.readAt ? new Date(c.readAt) : null,
  createdAt: new Date(c.createdAt)
})

export const useConversation = (receiverId: number) => {
  const { data: conversations } = trpc.protectedGet.conversation.useQuery(
    { receiverId },
    {
      refetchInterval: 1000 * 60
    }
  )

  const [queue, setToQueue] = useState<Message[]>(
    conversations ? conversations.map(m => parseMessage(m)) : []
  )

  useEffect(() => {
    setToQueue(conversations ? conversations.map(m => parseMessage(m)) : [])
  }, [conversations])

  const addSentMessageToQueue = (message: Message) => {
    const exists = queue.find(m => m.id === message.id)

    if (!exists) {
      setToQueue(current => [message, ...current])
    }
  }

  return { queue, addSentMessageToQueue }
}
