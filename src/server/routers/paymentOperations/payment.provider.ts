import { Context, Effect } from 'effect'
import { stripeProvider } from './stripe/payment'
import stripe from './stripe/stripeClient'
import { PatternMatching } from '@/types/utility.type'
import { GenericPaymentProvider } from './payment.interface'

export const paymentProviderFactory: PatternMatching<{
  [K in 'stripe']: () => GenericPaymentProvider
}> = {
  stripe: () => stripeProvider(stripe)
}

export class PaymentProviderFactory extends Context.Tag('paymentProviderFactory')<
  PaymentProviderFactory,
  typeof paymentProviderFactory
>() {}
export const effectPaymentProviderFactory = Effect.provideService(PaymentProviderFactory, paymentProviderFactory)
