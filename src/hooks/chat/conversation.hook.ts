import { messageFromApiToLocal } from '@/utils/retreatDateFromAPI'
import { trpc } from '@/utils/trpc'
import { useEffect } from 'react'

export const useConversation = (receiverId: number) => {
  const { data: conversations, refetch } = trpc.protectedGet.conversation.useQuery(
    { receiverId },
    {
      refetchInterval: 1000 * 60
    }
  )

  const { mutate: mutateMessages } = trpc.protectedMutation.setMessageRead.useMutation()

  useEffect(() => {
    const unreadMessages = conversations?.filter(
      m => m.readAt === null && m.receiverId !== receiverId
    )

    console.info('unreadMessages', unreadMessages)
    if (unreadMessages?.length === 0) return

    mutateMessages({
      messageIds: unreadMessages?.map(m => m.id) ?? []
    })
  }, [conversations])

  return { queue: conversations ? conversations.map(m => messageFromApiToLocal(m)) : [], refetch }
}
