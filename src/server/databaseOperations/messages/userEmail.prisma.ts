import { PrismaClient } from '@prisma/client'

type NewMessageUserEmailInput = {
  userId: number
  type: 'new_message' | 'new_offer'
  messageId: number
}

type OtherUserEmailInput = {
  userId: number
  type: 'new_rendering' | 'offer_accepted'
}

type UserEmailInput = NewMessageUserEmailInput | OtherUserEmailInput

const isNewMessageUserEmailInput = (input: UserEmailInput): input is NewMessageUserEmailInput => {
  return input.type === 'new_message' || input.type === 'new_offer'
}

export const userEmailCrud = (prisma: PrismaClient) => {
  const createUserEmail = (input: UserEmailInput) => {
    return prisma.userEmail.create({
      data: {
        userId: input.userId,
        type: input.type,
        ...(isNewMessageUserEmailInput(input) ? { messageId: input.messageId } : {})
      }
    })
  }

  return {
    createUserEmail
  }
}
