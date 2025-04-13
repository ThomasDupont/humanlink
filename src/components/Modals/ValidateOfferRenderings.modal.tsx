import { ConcernedOffer, trpc } from '@/utils/trpc'
import { Box, Typography, Button, Alert, Snackbar } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { Spinner } from '../Spinner'
import { t } from 'i18next'

export default function ValidateOfferRenderingsModal({
  offer,
  handleClose
}: {
  offer: ConcernedOffer
  handleClose: (type: 'yes' | 'no') => void
}) {
  const { t: commonT } = useTranslation('common')

  const [validateError, setValidateError] = useState<string>()
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)

  const { mutateAsync } =
    trpc.protectedMutation.offer.acceptOfferRenderingsAndCreateMoneyTransfert.useMutation()

  const handleValidateRenderingOfOffer = () => {
    setShowSpinner(true)
    mutateAsync({
      offerId: offer.id
    })
      .then(() => {
        setTimeout(() => handleClose('yes'), 1000)
      })
      .catch(error => {
        setValidateError(error.message)
      })
      .finally(() => {
        setOpenSnackBar(true)
        setShowSpinner(false)
      })
  }

  return showSpinner ? (
    <Spinner />
  ) : (
    <Box
      height={200}
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'space-around'}
      gap={2}
      sx={{
        m: 1
      }}
    >
      <Snackbar open={openSnackBar} autoHideDuration={3000} onClose={() => setOpenSnackBar(false)}>
        <Alert
          onClose={() => setOpenSnackBar(false)}
          severity={validateError ? 'error' : 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {validateError ? t(validateError) : t('saved')}
        </Alert>
      </Snackbar>
      <Typography variant="h4" component="p">
        {commonT('validateOfferRenderings')}
      </Typography>
      <Typography variant="body1">
        Would you accept the renderings for this offer ? This validate the amount payment on our
        side and will credit the wallet of the freelance.
      </Typography>
      <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} gap={2}>
        <Button onClick={() => handleValidateRenderingOfOffer()} variant="outlined" color="primary">
          {commonT('yes')}
        </Button>
        <Button onClick={() => handleClose('no')} variant="outlined" color="error">
          {commonT('no')}
        </Button>
      </Box>
    </Box>
  )
}
