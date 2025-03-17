import { OfferWithMileStonesAndMilestonePrice } from '@/types/Offers.type'
import { PaymentProvider } from '@prisma/client'

export type PaymentResult = {
  success: boolean
  providerPaymentId: string
  provider: PaymentProvider
}
export type Props = {
  offer: OfferWithMileStonesAndMilestonePrice
  closeWithResult: (result: PaymentResult) => void
}
