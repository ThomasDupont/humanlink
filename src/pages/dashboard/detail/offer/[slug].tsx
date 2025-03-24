import { Spinner } from '@/components/Spinner'
import config, { SupportedLocale } from '@/config'
import { useOfferHook } from '@/hooks/offer/offer.hook'
import InputFileUpload from '@/materials/InputFileUpload'
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
  Button,
  TextField
} from '@mui/material'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { FormEvent, ReactElement, useState } from 'react'
import { z } from 'zod'

const Base = ({ children }: { children: ReactElement }) => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          pt: 15
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

const AddARendering = () => {
  const { t: commonT } = useTranslation('common')
  const [formValues, setFormValues] = useState<{
    description: string
    files: File[]
  }>({
    description: '',
    files: []
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (formValues.files) {
      for (const file of formValues.files) {
        const content = file.bytes
      }
    }
  }

  const handleDeleteFromFileList = (name: string) => {
    const fileIndex = formValues.files.findIndex(f => f.name === name)
    const newFilesList = formValues.files.filter((_, i) => i !== fileIndex)

    setFormValues(state => ({
      ...state,
      files : newFilesList
    }))
  }

  return <Box
      sx={t => ({
        borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
        boxShadow: t.shadows[1],
        backgroundColor: 'white',
        mt: 2,
        p: 2
      })}
    >
      <form onSubmit={handleSubmit}>
        <TextField
          type="textarea"
          fullWidth
          variant="standard"
          color="primary"
          label={`add a text (with external link)`}
          // error={getErrorByTag(Tag.Description) !== null}
          multiline
          minRows={3}
          onChange={e =>
            setFormValues(state => ({
              ...state,
              description: e.target.value
            }))
          }
          value={formValues.description}
          helperText={`${formValues.description.length} / ${config.userInteraction.serviceDescriptionMaxLen}`}
          slotProps={{
            input: {
              spellCheck: 'false'
            },
            htmlInput: { maxLength: config.userInteraction.serviceDescriptionMaxLen }
          }}
        />
        <Box display={'flex'} flexDirection={'row'} gap={1} justifyContent={'space-around'}>
          {formValues.files.map(file => <Chip key={file.name} label={file.name} onDelete={() => handleDeleteFromFileList(file.name)} />)}
        </Box>
        <Box display={'flex'} flexDirection={'row'} gap={1} justifyContent={'space-around'}>
          <InputFileUpload onChange={(files) => {
            if (files === null) return
            const item = files.item(0)
            if (item === null) return

            setFormValues(state => ({
              ...state,
              files : [item, ...state.files]
            }))
          }} />
          <Button size="medium" type="submit" variant="contained">
            {commonT('save')}
          </Button>
        </Box>
      </form>
    </Box>
}

export default function OfferDetail({
  offerId,
  locale
}: {
  offerId: number
  locale: SupportedLocale
}) {
  const { data: offer, error, isFetching } = trpc.protectedGet.offerDetail.useQuery(offerId)
  const [renderingBox, setRenderingBox] = useState(false)

  const { parseOffer } = useOfferHook(locale, new Date())
  const {
    userSnapshot: { userId }
  } = useUserState()

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

  const handleAddRendering = () => {
    setRenderingBox(true)
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
            {parsedOffer.couldAddRendering && parsedOffer.offerFrom == 'me' && (
              <Grid size={12}>
                <Box display={'flex'} flexDirection={'row'} gap={1} justifyContent={'center'}>
                  <Button onClick={handleAddRendering} variant="contained" color="primary">
                    Add a rendering
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
        {renderingBox && (
          <AddARendering />
        )}
      </Box>
    </Base>
  )
}
