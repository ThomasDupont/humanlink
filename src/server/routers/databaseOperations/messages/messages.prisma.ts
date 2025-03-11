import { PrismaClient } from '@prisma/client'

export const messageCrud = (prisma: PrismaClient) => {
  const sendMessage = ({
    senderId,
    receiverId,
    message
  }: {
    senderId: number
    receiverId: number
    message: string
  }) => {
    return prisma.message.create({
      data: {
        senderId,
        receiverId,
        message
      }
    })
  }

  const getConversation = ({
    senderId,
    receiverId,
    skip = 0,
    limit = 20
  }: {
    senderId: number
    receiverId: number
    skip?: number
    limit?: number
  }) => {
    return prisma.message.findMany({
      skip,
      take: limit,
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      },
      orderBy: {
        id: 'desc'
      },
      include: {
        offer: true
      }
    })
  }

  const setMessageIsRead = ({ id, timestamp }: { id: number; timestamp: number }) => {
    return prisma.message.update({
      where: { id },
      data: {
        readAt: new Date(timestamp)
      }
    })
  }

  return {
    sendMessage,
    getConversation,
    setMessageIsRead
  }
}
