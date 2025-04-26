import { Currency } from '@prisma/client'

type PaymentData = {
  id: string
  secret: string
  amount: number
  currency: Currency
  paid: boolean
}

export type GenericPaymentProvider = {
  createPayment: (args: {
    amount: number
    currency: Currency
    idempotencyKey: string
  }) => Promise<PaymentData>
  getPaymentById: (id: string) => Promise<PaymentData>
  refundFullTransaction: (id: string) => Promise<boolean>
  createAccount: (email: string) => Promise<string>
}
