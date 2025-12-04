import { Context, Effect } from 'effect'
import { mailjetProvider } from './mailjet/mailjet'
import mailjet from './mailjet/mailjetClient'
import { PatternMatching } from '@/types/utility.type'
import { GenericMailProvider } from './email.interface'

export const mailProviderFactory: PatternMatching<{
  [K in 'mailjet']: () => GenericMailProvider
}> = {
  mailjet: () => mailjetProvider(mailjet)
}

export class MailProviderFactory extends Context.Tag('mailProviderFactory')<
  MailProviderFactory,
  typeof mailProviderFactory
>() {}
export const effectMailProviderFactory = Effect.provideService(
  MailProviderFactory,
  mailProviderFactory
)
