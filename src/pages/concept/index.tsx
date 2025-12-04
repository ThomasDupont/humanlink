import { Box, Button, CardMedia, Container, Divider, Typography } from '@mui/material'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useState } from 'react'
import BaseModal from '../../components/BaseModal'
import LoginModal from '../../components/Modals/Login.modal'
import { Trans, useTranslation } from 'next-i18next'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'concept']))
    }
  }
}

export default function Concept() {
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false)
  const { t } = useTranslation('concept')

  return (
    <Container maxWidth="lg">
      <Box
        id="headline"
        sx={{
          pt: 20
        }}
      >
        <Typography
          align="center"
          variant="h1"
          sx={{
            mb: 10
          }}
        >
          {t('title')}
        </Typography>
        <Box display={'flex'} flexDirection={{ xs: 'column', md: 'row' }} gap={{ xs: 4, md: 2 }}>
          <Box display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}>
            <Typography
              variant="body1"
              component={'p'}
              sx={{
                mb: 4
              }}
            >
              <Typography variant="body1" component={'span'} color="primary">
                {t('gigEconomy')}
              </Typography>
              <Trans t={t} i18nKey="headText1" />
            </Typography>
            <Typography
              variant="body1"
              component={'p'}
              sx={{
                mb: 4
              }}
            >
              <Typography variant="body1" component={'span'} color="primary">
                {t('coherentCommissions')}
              </Typography>
              <Trans t={t} i18nKey="headText2" />
            </Typography>
            <Typography variant="body1" component={'p'}>
              <Typography variant="body1" component={'span'} color="primary">
                {t('trustInCenter')}
              </Typography>
              <Trans t={t} i18nKey="headText3" />
            </Typography>
          </Box>
          <Box maxWidth={'lg'} display={'flex'} flexDirection={'row'} justifyContent={'center'}>
            <CardMedia
              component="img"
              image="/illustrations/freelance.svg"
              sx={{
                height: '100%',
                width: 500
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'center'}
        maxWidth={'lg'}
        sx={t => ({
          p: 2,
          mt: 10,
          mb: 5,
          borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
          boxShadow: t.shadows[1],
          backgroundColor: t.palette.background.paper
        })}
      >
        <Typography
          align="center"
          variant="h2"
          sx={{
            mb: 4
          }}
        >
          {t('thePrincipe')}
        </Typography>
        <Typography
          align="center"
          variant="body1"
          sx={{
            mb: 4
          }}
        >
          <Trans t={t} i18nKey="principle1" />
        </Typography>
        <Box
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'center'}
          sx={{
            mb: 4
          }}
        >
          <CardMedia
            component={'img'}
            image={'/illustrations/search.png'}
            sx={{ height: '60%', width: '60%' }}
          />
        </Box>
        <Typography
          align="center"
          variant="body1"
          sx={{
            mb: 4
          }}
        >
          <Trans t={t} i18nKey="principle2" />
        </Typography>
        <Box
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'center'}
          sx={{
            mb: 4
          }}
        >
          <CardMedia
            component={'img'}
            image={'/illustrations/service-example.png'}
            sx={{ height: '60%', width: '60%' }}
          />
        </Box>
        <Typography
          align="center"
          variant="body1"
          sx={{
            mb: 4
          }}
        >
          <Trans t={t} i18nKey="principle3" />
        </Typography>
      </Box>
      <Divider />
      <Box
        maxWidth={'lg'}
        sx={t => ({
          p: 2,
          mt: 5,
          mb: 10,
          borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
          boxShadow: t.shadows[1],
          backgroundColor: t.palette.background.paper
        })}
      >
        <Typography
          align="center"
          variant="h2"
          sx={{
            mb: 4
          }}
        >
          {t('gigEconomy')}
        </Typography>
        <Typography
          align="center"
          variant="body1"
          sx={{
            mb: 4
          }}
        >
          <Trans t={t} i18nKey="gigEconomyText1" />
        </Typography>
        <Typography
          align="center"
          variant="body1"
          sx={{
            mb: 4
          }}
        >
          <Trans t={t} i18nKey="gigEconomyText2" />
        </Typography>
        <Typography
          align="center"
          variant="body1"
          sx={{
            mb: 4
          }}
        >
          <Trans t={t} i18nKey="gigEconomyText3" />
        </Typography>
        <Box maxWidth={'lg'} display={'flex'} flexDirection={'row'} justifyContent={'center'}>
          <Link href="/" target="_blank">
            <Button color="primary" variant="contained">
              {t('gigEconomyButton')}
            </Button>
          </Link>
        </Box>
      </Box>
      <Box
        maxWidth={'lg'}
        sx={t => ({
          p: 2,
          mt: 10,
          mb: 10,
          borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
          boxShadow: t.shadows[1],
          backgroundColor: t.palette.background.paper
        })}
      >
        <Typography
          align="center"
          variant="h2"
          sx={{
            mb: 4
          }}
        >
          {t('coherentCommissions')}
        </Typography>
        <Typography
          align="center"
          variant="body1"
          sx={{
            mb: 4
          }}
        >
          <Trans t={t} i18nKey="coherentCommissionsText1" />
        </Typography>
        <Typography
          align="center"
          variant="body1"
          sx={{
            mb: 4
          }}
        >
          <Trans t={t} i18nKey="coherentCommissionsText2" />
        </Typography>
        <Typography
          align="center"
          variant="body1"
          sx={{
            mb: 4
          }}
        >
          <Trans t={t} i18nKey="coherentCommissionsText3" />
        </Typography>
      </Box>
      <Box
        maxWidth={'lg'}
        sx={t => ({
          p: 2,
          mt: 10,
          mb: 10,
          borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
          boxShadow: t.shadows[1],
          backgroundColor: t.palette.background.paper
        })}
      >
        <Typography
          align="center"
          variant="h2"
          sx={{
            mb: 4
          }}
        >
          {t('trustInCenter')}
        </Typography>
        <Typography
          align="center"
          variant="body1"
          sx={{
            mb: 4
          }}
        >
          <Trans t={t} i18nKey="trustInCenterText1" />
        </Typography>
        <Typography
          align="center"
          variant="body1"
          sx={{
            mb: 4
          }}
        >
          <Trans t={t} i18nKey="trustInCenterText2" />
        </Typography>
        <Typography
          align="center"
          variant="body1"
          sx={{
            mb: 4
          }}
        >
          <Trans t={t} i18nKey="trustInCenterText3" />
        </Typography>
      </Box>
      <Box
        maxWidth={'lg'}
        sx={t => ({
          p: 2,
          mt: 10,
          mb: 10,
          borderRadius: `calc(${t.shape.borderRadius}px + 8px)`,
          boxShadow: t.shadows[1],
          backgroundColor: t.palette.background.paper
        })}
      >
        <Typography
          align="center"
          variant="h2"
          sx={{
            mb: 4
          }}
        >
          {t('visionTitle')}
        </Typography>
        <Typography
          align="center"
          variant="body1"
          sx={{
            mb: 4
          }}
        >
          <Trans t={t} i18nKey="visionText1" />
        </Typography>
        <Typography
          align="center"
          variant="body1"
          sx={{
            mb: 4
          }}
        >
          <Trans t={t} i18nKey="visionText2" />
        </Typography>
        <Typography
          align="center"
          variant="body1"
          sx={{
            mb: 4
          }}
        >
          <Trans t={t} i18nKey="visionText3" />
        </Typography>
        <Box maxWidth={'lg'} display={'flex'} flexDirection={'row'} justifyContent={'center'}>
          <Button onClick={() => setOpenLoginModal(true)} color="primary" variant="contained">
            {t('visionButton')}
          </Button>
        </Box>
      </Box>
      <BaseModal open={openLoginModal} handleClose={() => setOpenLoginModal(false)}>
        <LoginModal />
      </BaseModal>
    </Container>
  )
}
