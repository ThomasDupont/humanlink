import { buildMoneyTransfer } from '@/server/valueObjects/moneyTransfer.value-object'
import config from '@/config'
import { AcceptedAndTerminatedOffer } from '../entities/offer.entities'
import { SellerDiscount } from '../entities/discount.entities'
import { Match } from 'effect'

type BasePolicy = { _tag: 'base'; offer: AcceptedAndTerminatedOffer; balanceId: number }
export const transactionOfTerminateOfferBasePolicy = ({ offer, balanceId, _tag }: BasePolicy) => ({
  _tag,
  compute: () => {
    const computedAmount = offer.milestone.reduce(
      (acc, milestone) => acc + milestone.priceMilestone.number,
      0
    )

    const fees = computedAmount * config.fees
    return buildMoneyTransfer({
      sellerId: offer.userId,
      offerId: offer.id,
      userId: offer.userIdReceiver,
      balanceId,
      amount: computedAmount - fees,
      fees
    })
  }
})

type WithDiscountPolicy = {
  offer: AcceptedAndTerminatedOffer
  balanceId: number
  discount: SellerDiscount
  _tag: 'withDiscount'
}
export const transactionOfTerminateOfferWithDiscountPolicy = ({
  offer,
  discount,
  balanceId,
  _tag
}: WithDiscountPolicy) => ({
  _tag,
  compute: () => {
    const computedAmount = offer.milestone.reduce(
      (acc, milestone) => acc + milestone.priceMilestone.number,
      0
    )

    const fees =
      computedAmount * config.fees * (discount.isValidForUser ? discount.percentage / 100 : 1)
    return buildMoneyTransfer({
      sellerId: offer.userId,
      offerId: offer.id,
      userId: offer.userIdReceiver,
      balanceId,
      amount: computedAmount - fees,
      fees
    })
  }
})

export const transactionOfTerminateOfferPolicy = Match.type<BasePolicy | WithDiscountPolicy>().pipe(
  Match.tag('withDiscount', transactionOfTerminateOfferWithDiscountPolicy),
  Match.tag('base', transactionOfTerminateOfferBasePolicy),
  Match.exhaustive
)
