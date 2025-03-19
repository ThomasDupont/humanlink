import config from '@/config'
import factory from '@/elements/payment/Payment.factory'
import { PaymentResult } from '@/elements/payment/Payment.interface'
import { OfferWithMileStonesAndMilestonePrice } from '@/types/Offers.type'
import { trpc } from '@/utils/trpc'
import { Alert, Box, Snackbar, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { Spinner } from '../Spinner'

export default function PayOfferModal({
  offer,
  handleClose
}: {
  offer: OfferWithMileStonesAndMilestonePrice
  handleClose: () => void
}) {
  const { mutateAsync } = trpc.protectedMutation.offer.accept.useMutation()
  const [acceptOfferError, setAcceptOfferError] = useState<string>()
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)
  const { t } = useTranslation('common')

  const closeWithResult = (result: PaymentResult) => {
    setShowSpinner(true)
    mutateAsync({
      offerId: offer.id,
      paymentProvider: result.provider,
      paymentId: result.providerPaymentId
    })
      .then(() => {
        setTimeout(() => handleClose(), 1000)
      })
      .catch(error => {
        setAcceptOfferError(error.message)
      })
      .finally(() => {
        setOpenSnackBar(true)
        setShowSpinner(false)
      })
  }

  const PaymentProvider = factory[config.paymentProvider]({ offer, closeWithResult })

  return showSpinner ? (
    <Spinner />
  ) : (
    <Box
      sx={{
        m: 1
      }}
    >
      <Snackbar open={openSnackBar} autoHideDuration={3000} onClose={() => setOpenSnackBar(false)}>
        <Alert
          onClose={() => setOpenSnackBar(false)}
          severity={acceptOfferError ? 'error' : 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {acceptOfferError ? t(acceptOfferError) : t('saved')}
        </Alert>
      </Snackbar>
      <Typography gutterBottom variant="h4" component="p">
        {t('payment')}
      </Typography>
      {PaymentProvider}
    </Box>
  )
}
