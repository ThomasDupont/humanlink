import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export default function WalletItem() {
  const { t } = useTranslation('dashboard')
  return (
    <Box>
      <Typography variant="h2">{t('walletManagement')}</Typography>
    </Box>
  )
}
