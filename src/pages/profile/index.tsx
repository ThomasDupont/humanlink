import { useAuthSession } from '@/hooks/nextAuth.hook'
import { Avatar, Box, Container, Grid2 as Grid, Typography } from '@mui/material'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { SuportedLocale } from '@/config'
import { localeToDateFnsLocale } from '@/utils/localeToDateFnsLocale'

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
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
      locale
    }
  }
}

export default function Profile({ locale }: { locale: SuportedLocale }) {
  const { user } = useAuthSession()
  const { t } = useTranslation('common')

  if (!user) {
    return (
      <Base>
        <Typography
          align="center"
          variant="h1"
          sx={{
            mb: 10
          }}
        >
          {t('errors[401]')}
        </Typography>
      </Base>
    )
  }

  const parsedCreatedDate = format(user.createdAt, 'PPP', { locale: localeToDateFnsLocale(locale) })

  return (
    <Base>
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Typography
          variant="h1"
          sx={{
            mb: 10
          }}
        >
          {t('profilePageTitle')}
        </Typography>
        <Box
          width={'100%'}
          maxWidth={'md'}
          display={'flex'}
          flexDirection={{ xs: 'column', md: 'row' }}
          gap={4}
          alignItems={{ xs: 'center', md: 'flex-start' }}
          justifyContent={'space-between'}
        >
          <Avatar
            src={user.image ?? undefined}
            sx={{
              height: 100,
              width: 100
            }}
          />
          <Grid container rowSpacing={4}>
            <Grid size={6}>
              <Typography variant="h4" component={'p'}>
                {t('firstname')} & {t('lastname')}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body1">
                {user.firstname} {user.lastname}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="h4" component={'p'}>
                {t('email')}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body1">{user.email}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="h4" component={'p'}>
                {t('oauthProvider')}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body1">{user.oauthProvider}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="h4" component={'p'}>
                {t('creationDate')}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body1">{parsedCreatedDate}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="h4" component={'p'}>
                {t('isFreelance')}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body1">{user.isFreelance ? t('yes') : t('no')}</Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Base>
  )
}
