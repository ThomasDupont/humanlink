import { Context, Effect } from 'effect'
import { stripeProvider } from './stripe/payment'
import stripe from './stripe/stripeClient'

export const stripeOperations = stripeProvider(stripe)

export class StripeOperations extends Context.Tag('userOperations')<
  StripeOperations,
  typeof stripeOperations
>() {}
export const effectStripeOperations = Effect.provideService(StripeOperations, stripeOperations)
