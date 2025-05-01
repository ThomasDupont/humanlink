import { ConcernedOffer, trpc } from '@/utils/trpc'
import { ExpandMore } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  Typography
} from '@mui/material'
import { useTranslation } from 'next-i18next'
import { SupportedLocale } from '@/config'
import { useUserState } from '@/state/user.state'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useOfferHook } from '@/hooks/offer/offer.hook'

const Item = ({ locale, offer }: { locale: SupportedLocale; offer: ConcernedOffer }) => {
  const { userSnapshot: me } = useUserState()
  const router = useRouter()

  const { parseOffer } = useOfferHook(locale, new Date())

  if (me.userId === null) {
    return null
  }

  const parsedOffer = parseOffer(offer, me.userId)

  return (
    <Accordion
      sx={{
        mb: 2
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Box
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'space-around'}
          sx={{
            width: '100%'
          }}
        >
          <Box display={'flex'} flexDirection={'row'} gap={1}>
            <Chip
              label={parsedOffer.status}
              color={parsedOffer.status === 'active' ? 'success' : 'error'}
            />
          </Box>
          <Box display={'flex'} flexDirection={'row'} gap={1} alignItems={'center'}>
            <Avatar
              src={offer.user?.image ?? undefined}
              sx={{
                width: 24,
                height: 24
              }}
            />
            <Chip
              label={
                parsedOffer.offerFrom === 'me'
                  ? `From me`
                  : `From ${offer.user?.firstname} ${offer.user?.lastname}`
              }
            />
          </Box>
          <Box display={'flex'} flexDirection={'row'} gap={1} alignItems={'center'}>
            <Typography variant="body1">
              {parsedOffer.offerFrom === 'me'
                ? `${offer.userReceiver?.firstname} ${offer.userReceiver?.lastname} accepted this offer the ${parsedOffer.acceptedAt}`
                : `I have accepted this offer the ${parsedOffer.acceptedAt}`}
            </Typography>
          </Box>
          {parsedOffer.couldAddRendering && (
            <Box display={'flex'} flexDirection={'row'} gap={1} alignItems={'center'}>
              <Typography variant="body1" color={parsedOffer.isExpired ? 'error' : 'success'}>
                {parsedOffer.isExpired
                  ? `deadline expired`
                  : `Must be completed in ${parsedOffer.deadline}`}
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              minWidth: 48
            }}
          >
            {parsedOffer.couldAddRendering && parsedOffer.offerFrom == 'me' && (
              <Link
                href={`/${router.locale ?? 'en'}/dashboard/detail/offer/${offer.id}`}
                target="_blank"
              >
                <Button variant="contained" color="primary">
                  Add a rendering
                </Button>
              </Link>
            )}
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Typography
          variant="body1"
          sx={{
            mt: 1
          }}
        >{`Related service : ${offer.service.title}`}</Typography>
        <Typography
          variant="body1"
          sx={{
            mt: 1
          }}
        >
          {offer.description}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mt: 1
          }}
        >{`Price: ${parsedOffer.computedPrice / 100} ${parsedOffer.currency}`}</Typography>
        <Box display={'flex'} flexDirection={'row'} gap={1} justifyContent={'center'}>
          <Link
            href={`/${router.locale ?? 'en'}/dashboard/detail/offer/${offer.id}`}
            target="_blank"
          >
            <Button variant="outlined" color="primary">
              Detail
            </Button>
          </Link>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

export default function OrdersItem({ locale }: { locale: SupportedLocale }) {
  const { t } = useTranslation('dashboard')
  const { data: offers } = trpc.protectedGet.listOffers.useQuery()

  return (
    <Box
      sx={{
        m: 1
      }}
    >
      <Typography
        textAlign={'center'}
        variant="h3"
        component={'h2'}
        sx={{
          mb: 2
        }}
      >
        {t('ordersManagement')}
      </Typography>
      <Box>{offers?.map(offer => <Item key={offer.id} locale={locale} offer={offer} />)}</Box>
    </Box>
  )
}
