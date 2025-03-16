import BaseModal from '@/components/BaseModal'
import AcceptOfferModal from '@/components/Modals/AcceptOffer.modal'
import { SuportedLocale } from '@/config'
import { useManagePrice } from '@/hooks/managePrice.hook'
import { OfferWithMileStonesAndMilestonePrice } from '@/types/Offers.type'
import { localeToDateFnsLocale } from '@/utils/localeToDateFnsLocale'
import { Box, Button, Typography } from '@mui/material'
import { User } from '@prisma/client'
import { format } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

export default function ShowOffer({
  offer,
  user,
  userIdFromAuth,
  locale
}: {
  offer: OfferWithMileStonesAndMilestonePrice
  locale: SuportedLocale
  user: Pick<User, 'firstname' | 'id'>
  userIdFromAuth: number | null
}) {
  const parsedCreatedDate = format(offer.createdAt, 'PPP', {
    locale: localeToDateFnsLocale(locale)
  })
  const { t: chatT } = useTranslation('chat')
  const { t: commonT } = useTranslation('common')
  const [openAcceptModal, setOpenAcceptModal] = useState(false)

  const { formatPriceCurrency } = useManagePrice()

  const price = offer.milestones[0]?.priceMilestone

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'space-evenly'}
      sx={t => ({
        backgroundColor: t.palette.secondary[50],
        borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
        width: 400,
        p: 1
      })}
    >
      <Typography
        variant="h4"
        component={'p'}
        sx={{
          mb: 1
        }}
      >
        Offer from {user.firstname} of {parsedCreatedDate}
      </Typography>
      <Typography
        gutterBottom
        variant={'body1'}
        sx={{
          mb: 1
        }}
      >
        {offer.description}
      </Typography>
      {price && (
        <Typography
          variant="body1"
          sx={{
            mb: 1
          }}
        >
          {formatPriceCurrency(price)}
        </Typography>
      )}
      <Box display={'flex'} flexDirection={'row'} justifyContent={'center'}>
        {userIdFromAuth !== user.id && !offer.isAccepted && (
          <Button onClick={() => setOpenAcceptModal(true)} variant="outlined" color="primary">
            {chatT('acceptOffer')}
          </Button>
        )}
        {offer.isAccepted && <Typography color="primary">{commonT('offerAccepted')}</Typography>}
      </Box>
      <BaseModal open={openAcceptModal} handleClose={() => setOpenAcceptModal(false)}>
        <AcceptOfferModal offer={offer} handleClose={() => setOpenAcceptModal(false)} />
      </BaseModal>
    </Box>
  )
}
