import { Box, Button, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

export default function DeleteAService({
  id,
  handleClose
}: {
  id: number
  handleClose: () => void
}) {
  const { t } = useTranslation('dashboard')
  const { t: commonT } = useTranslation('common')

  console.log(id)
  return (
    <Box
      sx={{
        m: 1
      }}
    >
      <Typography gutterBottom variant="h4" component="p">
        {t('removeService')}
      </Typography>
      <Button onClick={() => handleClose()} variant="contained" color="primary">
        {commonT('yes')}
      </Button>
      <Button onClick={() => handleClose()} variant="contained" color="primary">
        {commonT('no')}
      </Button>
    </Box>
  )
}
