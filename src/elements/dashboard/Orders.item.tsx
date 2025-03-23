import { trpc } from '@/utils/trpc'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

export default function OrdersItem() {
  const { t } = useTranslation('dashboard')
  const { data: offers } = trpc.protectedGet.listOffers.useQuery()
  return (
    <Box
      sx={{
        m: 1
      }}
    >
      <Typography textAlign={'center'} variant="h3" component={'h2'}>
        {t('ordersManagement')}
      </Typography>
      <Box>
        {offers?.map(offer => (
          <Box key={offer.id}>
            <Typography>{offer.description}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
