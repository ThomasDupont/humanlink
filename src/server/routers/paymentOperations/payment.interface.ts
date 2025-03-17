import { Currency } from '@prisma/client'

type PaymentData = {
  id: string
  secret: string
  amount: number
  currency: Currency
}

export type GenericPaymentProvider = {
  createPayment: (args: {
    amount: number
    currency: Currency
    idempotencyKey: string
  }) => Promise<PaymentData>
  getPaymentById: (id: string) => Promise<PaymentData>
}
