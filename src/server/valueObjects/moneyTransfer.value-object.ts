import { Schema } from 'effect'
import { balanceId, userId, offerId } from '../routers/domain/entities/ids'

export const moneyTransfer = Schema.Struct({
  sellerId: userId,
  balanceId,
  fees: Schema.Number.pipe(Schema.greaterThan(0)),
  amount: Schema.Number.pipe(Schema.greaterThan(0)),
  userId,
  offerId
}).pipe(Schema.brand('MoneyTransfer'))

export type moneyTransfer = Schema.Schema.Type<typeof moneyTransfer>
export const buildMoneyTransfer = Schema.decode(moneyTransfer)
