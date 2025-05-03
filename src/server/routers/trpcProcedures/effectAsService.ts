import { Context, Effect as T } from 'effect'
import {
  effectMessageOperations,
  effectUserOperations
} from '../../databaseOperations/prisma.provider'
import { effectLogger } from '@/server/logger'
import { effectMailProviderFactory } from '@/server/emailOperations/email.provider'
import { sendMessageEffect, SendMessageInput } from './mutations/sendMessage'

export const sendMessageProvider = (args: SendMessageInput) =>
  sendMessageEffect(args).pipe(
    effectLogger,
    effectMessageOperations,
    effectUserOperations,
    effectMailProviderFactory
  )

export class SendMessageProvider extends Context.Tag('sendMessageProvider')<
  SendMessageProvider,
  typeof sendMessageProvider
>() {}
export const effectSendMessageProvider = T.provideService(SendMessageProvider, sendMessageProvider)
