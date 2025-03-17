import { Currency } from '@prisma/client'
import Stripe from 'stripe'
import { GenericPaymentProvider } from '../payment.interface'

export const stripeProvider = (stripe: Stripe): GenericPaymentProvider => {
  const createPayment = async ({
    amount,
    currency,
    idempotencyKey
  }: {
    amount: number
    currency: Currency
    idempotencyKey: string
  }) =>
    stripe.paymentIntents
      .create(
        {
          amount,
          currency: currency.toLowerCase(),
          automatic_payment_methods: {
            enabled: true
          }
        },
        {
          idempotencyKey
        }
      )
      .then(paymentIntent => ({
        id: paymentIntent.id,
        secret: paymentIntent.client_secret ?? '',
        amount,
        currency
      }))

  const getPaymentById = (id: string) =>
    stripe.paymentIntents.retrieve(id).then(paymentIntent => ({
      id: paymentIntent.id,
      secret: paymentIntent.client_secret ?? '',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase() as Currency
    }))

  return { createPayment, getPaymentById }
}
