import { Schema } from 'effect'

const Currency = Schema.Union(Schema.Literal('EUR'), Schema.Literal('USD'))
type Currency = Schema.Schema.Type<typeof Currency>

export const Payment = Schema.Struct({
  amount: Schema.Number.pipe(Schema.greaterThan(0)),
  currency: Currency,
  idempotencyKey: Schema.String.pipe(Schema.minLength(1))
}).pipe(Schema.brand('Payment'))

export type Payment = Schema.Schema.Type<typeof Payment>
export const buildPayment = Schema.decode(Payment)
