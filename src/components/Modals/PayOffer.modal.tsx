import config from '@/config'
import factory from '@/elements/payment/Payment.factory'
import { PaymentResult } from '@/elements/payment/Payment.interface'
import { OfferWithMileStonesAndMilestonePrice } from '@/types/Offers.type'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

export default function PayOfferModal({
  offer,
  handleClose
}: {
  offer: OfferWithMileStonesAndMilestonePrice
  handleClose: () => void
}) {
  const closeWithResult = (result: PaymentResult) => {
    console.log(result)
    handleClose()
  }

  const PaymentProvider = factory[config.paymentProvider]({ offer, closeWithResult })

  const { t } = useTranslation('common')
  return (
    <Box
      sx={{
        m: 1
      }}
    >
      <Typography gutterBottom variant="h4" component="p">
        {t('payment')}
      </Typography>
      {PaymentProvider}
    </Box>
  )
}
