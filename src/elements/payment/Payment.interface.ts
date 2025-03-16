import { OfferWithMileStonesAndMilestonePrice } from '@/types/Offers.type'

export type PaymentResult = { success: boolean; message: string }
export type Props = {
  offer: OfferWithMileStonesAndMilestonePrice
  closeWithResult: (result: PaymentResult) => void
}
