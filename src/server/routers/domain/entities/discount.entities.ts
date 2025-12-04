import { Schema } from 'effect'
import { discountId } from './ids'

export const sellerDiscount = Schema.Struct({
  id: discountId,
  isActivated: Schema.Literal(true),
  code: Schema.String,
  affectedOn: Schema.Union(Schema.Literal('seller')),
  percentage: Schema.Number.pipe(Schema.greaterThan(0), Schema.lessThan(100)),
  isValidForUser: Schema.Boolean
}).pipe(Schema.brand('SellerDiscount'))

export type SellerDiscount = Schema.Schema.Type<typeof sellerDiscount>
