import BaseModal from '@/components/BaseModal'
import LoginModal from '@/components/Modals/Login.modal'
import { useAuthSession } from '@/hooks/nextAuth.hook'
import { StyledBadge, StyledGrid } from '@/materials/styledElement'
import { ServiceFromDB } from '@/types/Services.type'
import { trpc } from '@/utils/trpc'
import { Payment, Schedule, TipsAndUpdates, Verified } from '@mui/icons-material'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import {
  Avatar,
  Box,
  Button,
  CardMedia,
  Container,
  Divider,
  Grid2 as Grid,
  List,
  ListItem,
  ListItemIcon,
  Stack,
  Typography
} from '@mui/material'
import { GetStaticPaths, GetStaticProps } from 'next'
import { ReactElement, useState } from 'react'
import z from 'zod'
import { useTranslation } from 'next-i18next'
import { notFound } from 'next/navigation'
import { logger } from '../../server/logger'
import { Spinner } from '../../components/Spinner'
import { useManagePrice } from '../../hooks/managePrice.hook'
import { useRouter } from 'next/router'

const Base = ({ children }: { children: ReactElement }) => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          pt: 20
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
        params: { slug: ['10', '12'] },
        locale
      }))
    : [{ params: { slug: ['10', '12'] }, locale: 'en' }]

  return {
    paths,
    fallback: 'blocking'
  }
}

const slugSchema = z.array(z.string().regex(/^\d+$/)).length(2)

type Props = {
  userId: number
  serviceId: number
}

export const getStaticProps: GetStaticProps<Props> = async ({ locale, params }) => {
  const slug = params?.slug || []

  const validation = slugSchema.safeParse(slug)

  if (!validation.success) {
    return { notFound: true }
  }

  const [userId, serviceId] = validation.data.map(Number)

  return {
    props: {
      userId: userId ?? 0,
      serviceId: serviceId ?? 0,
      ...(await serverSideTranslations(locale ?? 'en', ['service', 'common']))
    }
  }
}

export default function Service({ userId, serviceId }: Props) {
  const { t } = useTranslation('service')
  const { managePrice } = useManagePrice()
  const router = useRouter()

  const { data: user, status, error } = trpc.get.userById.useQuery(userId) // @todo use a slug
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false)

  const { user: me } = useAuthSession()

  if (!user) {
    return (
      <Base>
        <Spinner />
      </Base>
    )
  }

  if (status === 'error') {
    logger.error({
      error: 'trpcError',
      message: error.message,
      errorDetail: error
    })
    return (
      <Base>
        <Typography variant="body1">{error.message}</Typography>
      </Base>
    )
  }

  const service: ServiceFromDB | undefined = user.services.find(
    (service: ServiceFromDB) => service.id === serviceId // @todo use a slug ??
  )

  if (!service) {
    console.error(`Service ${serviceId} not found`)
    return notFound()
  }

  const priceInService = service.prices[0]

  if (!priceInService) {
    console.error(`Service ${serviceId} has no price`)
    return notFound()
  }

  const price = managePrice(priceInService)

  const openChatOrLoginModal = () => {
    if (!me) {
      setOpenLoginModal(true)
    } else {
      router.push(`/${router.locale ?? 'en'}/chat?userId=${user.id}&serviceId=${service.id}`)
    }
  }

  return (
    <Container maxWidth="lg">
      <Grid
        container
        spacing={{ xs: 4, md: 12 }}
        sx={{
          pt: 20
        }}
      >
        <Grid
          size={{ xs: 12, md: 8 }}
          sx={{
            mb: 10
          }}
        >
          <Typography gutterBottom variant="h3" component="h1">
            {service.title}
          </Typography>
          <Typography gutterBottom variant="body1">
            {service.descriptionShort}
          </Typography>
          <Divider
            sx={{
              m: 4
            }}
          />
          <Stack direction="row" spacing={2}>
            <Box>
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
              >
                <Avatar alt={`${user.firstname} ${user.lastname}`} src={user.image ?? undefined} />
              </StyledBadge>
            </Box>
            <Box>
              <Stack direction="row" spacing={2}>
                <Typography variant="body1">{`${user.firstname} ${user.lastname}`}</Typography>
                <Verified
                  sx={{
                    color: 'primary.dark'
                  }}
                />
              </Stack>
              <Typography variant="body2">{user.jobTitle}</Typography>
            </Box>
          </Stack>
          <Stack
            direction="row"
            justifyContent={'space-between'}
            sx={{
              mt: 4
            }}
          >
            <Typography variant="body2">
              {t('langs')} : {service.langs.join(' | ')}
            </Typography>
            <Typography variant="body2">#{service.category}</Typography>
          </Stack>
          <CardMedia
            component="img"
            image={`https://picsum.photos/1000/625?random=${service.id}`}
            alt="service"
            sx={t => ({
              mt: 4,
              borderRadius: `calc(${t.shape.borderRadius}px + 8px)`
            })}
          />
          <Typography
            variant="body1"
            sx={{
              mt: 4
            }}
          >
            {service.description}
          </Typography>
          <Divider
            sx={{
              m: 4
            }}
          />
          <Typography gutterBottom variant="h4" component="p">
            {t('aboutOf')} {user.firstname} {user.lastname}
          </Typography>
          <Typography gutterBottom variant="body1">
            {user.description}
          </Typography>
        </Grid>
        <StyledGrid
          size={{ xs: 12, md: 4 }}
          sx={t => ({
            mb: 10,
            position: 'sticky',
            top: 160,
            maxHeight: '500px',
            '&:hover': {
              boxShadow: t.shadows[1]
            }
          })}
        >
          <Typography variant="h4" component="p">
            {price}
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <TipsAndUpdates />
              </ListItemIcon>
              <Typography variant="body2" component="p">
                {t('priceAndCommissionsTradable')}
              </Typography>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Schedule />
              </ListItemIcon>
              <Typography variant="body2" component="p">
                {t('answerInLessThan')} 12 {t('hours')}
              </Typography>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Payment />
              </ListItemIcon>
              <Typography variant="body2" component="p">
                {t('paiementAfterValidation')}
              </Typography>
            </ListItem>
          </List>
          <Button onClick={() => openChatOrLoginModal()} variant="contained">
            {t('takeContact')}
          </Button>
          <BaseModal open={openLoginModal} handleClose={() => setOpenLoginModal(false)}>
            <LoginModal
              callbackUrl={`/${router.locale ?? 'en'}/chat?userId=${user.id}&serviceId=${service.id}`}
            />
          </BaseModal>
        </StyledGrid>
      </Grid>
    </Container>
  )
}
