import { Currency } from '@prisma/client'
import Stripe from 'stripe'

export const stripeProvider = (stripe: Stripe) => {
  const createPaymentIntent = async ({
    amount,
    currency,
    idempotencyKey
  }: {
    amount: number
    currency: Currency
    idempotencyKey: string
  }) =>
    stripe.paymentIntents.create(
      {
        amount,
        currency,
        automatic_payment_methods: {
          enabled: true
        }
      },
      {
        idempotencyKey
      }
    )

  return { createPaymentIntent }
}
