import { messageFromApiToLocal } from '@/utils/retreatDateFromAPI';
import { trpc } from '@/utils/trpc'

export const useConversation = (receiverId: number) => {
  const { data: conversations, refetch } = trpc.protectedGet.conversation.useQuery(
    { receiverId },
    {
      refetchInterval: 1000 * 60
    }
  )

  return { queue: conversations ? conversations.map(m => messageFromApiToLocal(m)) : [], refetch }
}
