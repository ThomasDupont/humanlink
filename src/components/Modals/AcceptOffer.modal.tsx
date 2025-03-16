import { Box, Typography, Button } from '@mui/material'
import { useTranslation } from 'next-i18next'

export default function AcceptOfferModal({
  handleClose
}: {
  handleClose: (type: 'yes' | 'no') => void
}) {
  const { t: commonT } = useTranslation('common')
  const { t: chatT } = useTranslation('chat')

  const handleAccept = () => {
    handleClose('yes')
  }
  return (
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
      <Typography variant="h4" component="p">
        {chatT('acceptOffer')}
      </Typography>
      <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} gap={2}>
        <Button onClick={() => handleAccept()} variant="outlined" color="primary">
          {commonT('yes')}
        </Button>
        <Button onClick={() => handleClose('no')} variant="outlined" color="error">
          {commonT('no')}
        </Button>
      </Box>
    </Box>
  )
}
