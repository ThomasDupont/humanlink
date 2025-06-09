import { Context, Effect as T } from 'effect'
import { effectMessageOperations } from '../../databaseOperations/prisma.provider'
import { effectLogger } from '@/server/logger'
import { sendMessageEffect, SendMessageInput } from './mutations/sendMessage'
import { effectSendNotificationNewMessageProvider } from './utils/sendEmail'

export const sendMessageProvider = (args: SendMessageInput) =>
  sendMessageEffect(args).pipe(
    effectLogger,
    effectMessageOperations,
    effectSendNotificationNewMessageProvider
  )

export class SendMessageProvider extends Context.Tag('sendMessageProvider')<
  SendMessageProvider,
  typeof sendMessageProvider
>() {}
export const effectSendMessageProvider = T.provideService(SendMessageProvider, sendMessageProvider)
