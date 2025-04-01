import { Spinner } from '@/components/Spinner'
import { SupportedLocale } from '@/config'
import { AddARendering } from '@/elements/offer/AddARendering'
import { DisplayRendering } from '@/elements/offer/DisplayRendering'
import { useOfferHook } from '@/hooks/offer/offer.hook'
import { useRendering } from '@/hooks/offer/rendering.hook'
import { useUserState } from '@/state/user.state'
import { trpc } from '@/utils/trpc'
import {
  Container,
  Box,
  Typography,
  Chip,
  Avatar,
  Divider,
  Grid2 as Grid,
  Button
} from '@mui/material'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement, useEffect, useState } from 'react'
import { z } from 'zod'

const Base = ({ children }: { children: ReactElement }) => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          pt: 15,
          pb: 15
        }}
      >
        {children}
      </Box>
    </Container>
  )
}

export const getStaticPaths: GetStaticPaths = ({ locales }) => {
  const paths = locales
    ? locales.map(locale => ({
        params: { slug: '10' },
        locale
      }))
    : [{ params: { slug: '10' }, locale: 'en' }]

  return {
    paths,
    fallback: 'blocking'
  }
}

type Props = {
  offerId: number
}

export const getStaticProps: GetStaticProps<Props> = async ({ locale, params }) => {
  const slug = params?.slug

  const validation = z.coerce.number().safeParse(slug)

  if (!validation.success) {
    return { notFound: true }
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'dashboard', 'service'])),
      offerId: validation.data
    }
  }
}

export default function OfferDetail({
  offerId,
  locale
}: {
  offerId: number
  locale: SupportedLocale
}) {
  const {
    data: offer,
    error,
    isFetching,
    refetch
  } = trpc.protectedGet.offerDetail.useQuery(offerId)
  const [renderingBox, setRenderingBox] = useState(false)

  const { parseOffer } = useOfferHook(locale, new Date())
  const {
    userSnapshot: { userId }
  } = useUserState()

  const { fetchRendering, renderings } = useRendering(offer ?? null)

  useEffect(() => {
    if (offer) fetchRendering()
  }, [offer])

  const handleValidateRenderingOfOffer = () => {}
  const handleDeclareDispute = () => {}

  if (error) {
    return (
      <Base>
        <Typography variant="body1" color="error">
          {error.message}
        </Typography>
      </Base>
    )
  }

  if (isFetching || !offer) {
    return (
      <Base>
        <Spinner />
      </Base>
    )
  }

  const parsedOffer = parseOffer(offer, userId!)
  return (
    <Base>
      <Box>
        <Typography textAlign={'center'} variant="h1">
          Offer detail
        </Typography>

        <Box
          sx={t => ({
            borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
            boxShadow: t.shadows[1],
            backgroundColor: 'white',
            p: 2
          })}
        >
          <Box
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'flex-start'}
            gap={4}
            alignItems={'center'}
            sx={{
              mb: 2
            }}
          >
            <Avatar
              src={offer.user?.image ?? undefined}
              sx={{
                width: 60,
                height: 60
              }}
            />
            <Box>
              <Typography variant="h3" component={'p'}>
                {`Proposed by ${offer.user?.firstname} ${offer.user?.lastname}`}
              </Typography>
              <Typography variant="body2" component={'p'}>
                {offer.user?.jobTitle}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Box
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-around'}
            gap={4}
            sx={{
              width: '100%',
              mt: 2,
              mb: 4
            }}
          >
            <Box display={'flex'} flexDirection={'row'} gap={1}>
              <Chip
                label={parsedOffer.status}
                color={parsedOffer.status === 'active' ? 'success' : 'error'}
              />
            </Box>
            <Box display={'flex'} flexDirection={'row'} gap={1} alignItems={'center'}>
              <Typography variant="body1">
                {parsedOffer.offerFrom === 'me'
                  ? `${offer.userReceiver?.firstname} ${offer.userReceiver?.lastname} accepted this offer the ${parsedOffer.acceptedAt}`
                  : `I have accepted this offer the ${parsedOffer.acceptedAt}`}
              </Typography>
            </Box>
            <Box display={'flex'} flexDirection={'row'} gap={1} alignItems={'center'}>
              <Typography variant="body1" color={parsedOffer.isExpired ? 'error' : 'success'}>
                {parsedOffer.isExpired
                  ? `deadline expired`
                  : `Must be completed in ${parsedOffer.deadline}`}
              </Typography>
            </Box>
          </Box>
          <Grid container rowSpacing={4}>
            <Grid size={2}>
              <Typography variant="h3" component={'p'}>
                description
              </Typography>
            </Grid>
            <Grid size={10}>
              <Typography variant="body1" component={'p'}>
                {offer.description}
              </Typography>
            </Grid>
            <Grid size={2}>
              <Typography variant="h3" component={'p'}>
                related service
              </Typography>
            </Grid>
            <Grid size={10}>
              <Typography gutterBottom variant="body1" component={'p'}>
                {offer.service?.title}
              </Typography>
              <Typography variant="body1" component={'p'}>
                #{offer.service?.category}
              </Typography>
            </Grid>
            <Grid size={12}>
              <Divider />
            </Grid>
            <Grid size={12}>
              <Typography variant="body1" component={'p'}>
                Price : {parsedOffer.computedPrice / 100} {parsedOffer.currency}
              </Typography>
            </Grid>
            {/*offer.milestone.map((milestone, index) => (
              <>
                <Grid key={index} size={2}>
                  <Typography variant="h3" component={'p'}>
                    milestone {index + 1}
                  </Typography>
                  <Typography variant="body1" component={'p'}>
                    {milestone.priceMilestone.number / 100} {milestone.priceMilestone.currency}
                  </Typography>
                </Grid>
                <Grid key={index} size={10}>
                  <Typography variant="body1" component={'p'}>
                    {milestone.description}
                  </Typography>
                </Grid>
              </>
            ))*/}
            {parsedOffer.couldAddRendering && parsedOffer.offerFrom === 'me' && (
              <Grid size={12}>
                <Box display={'flex'} flexDirection={'row'} gap={1} justifyContent={'center'}>
                  <Button onClick={() => setRenderingBox(true)} variant="contained" color="primary">
                    Add a rendering
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
        <DisplayRendering
          offer={offer}
          locale={locale}
          renderings={renderings}
          handleChange={() => {
            refetch()
          }}
        />
        {renderingBox && (
          <AddARendering
            renderings={renderings}
            offer={offer}
            handleClose={() => {
              refetch()
              setRenderingBox(false)
            }}
          />
        )}

        <Box
          sx={t => ({
            borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
            boxShadow: t.shadows[1],
            backgroundColor: 'white',
            mt: 2,
            p: 2
          })}
        >
          <Box display={'flex'} flexDirection={'row'} gap={1} justifyContent={'space-around'}>
            {parsedOffer.offerFrom === 'other' && renderings.length && offer.isTerminated && (
              <Button
                onClick={() => handleValidateRenderingOfOffer()}
                variant="contained"
                color="primary"
              >
                Validate offer renderings
              </Button>
            )}
            <Button onClick={() => handleDeclareDispute()} variant="contained" color="error">
              Declare dispute
            </Button>
          </Box>
        </Box>
      </Box>
    </Base>
  )
}
