import { Box, Snackbar, Alert, Typography, Button } from '@mui/material'
import { Offer } from '@prisma/client'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { Spinner } from '../Spinner'
import { trpc } from '@/utils/trpc'

export default function AcceptOfferModal({
  offer,
  handleClose
}: {
  offer: Offer
  handleClose: () => void
}) {
  const [showSpinner, setShowSpinner] = useState(false)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [acceptError, setAcceptError] = useState(false)
  const { t: commonT } = useTranslation('common')
  const { t: chatT } = useTranslation('chat')
  const { mutateAsync } = trpc.protectedMutation.offer.accept.useMutation()

  const handleAccept = () => {
    setShowSpinner(true)

    mutateAsync(offer.id)
      .then(() => {
        setOpenSnackBar(true)
        setTimeout(() => handleClose(), 1000)
      })
      .catch(err => {
        setAcceptError(true)
        console.error(err)
        setOpenSnackBar(true)
      })
      .finally(() => setShowSpinner(false))
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
          severity={acceptError ? 'error' : 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {acceptError ? chatT('acceptOfferError') : commonT('saved')}
        </Alert>
      </Snackbar>
      <Typography variant="h4" component="p">
        {chatT('acceptOffer')}
      </Typography>
      <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} gap={2}>
        <Button onClick={() => handleAccept()} variant="outlined" color="primary">
          {commonT('yes')}
        </Button>
        <Button onClick={() => handleClose()} variant="outlined" color="error">
          {commonT('no')}
        </Button>
      </Box>
    </Box>
  )
}
