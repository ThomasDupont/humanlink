import { Instagram, LinkedIn } from '@mui/icons-material'
import { Box, Container, IconButton, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'

const linkBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  justifyContent: 'flex-start',
  minWidth: '200px'
}

const linkTypoStyle = {
  '&:hover': {
    textDecoration: 'underline',
    cursor: 'pointer'
  }
}

export const Footer = () => {
  const { t } = useTranslation('common')

  return (
    <Container
      component={'footer'}
      maxWidth={false}
      sx={() => ({
        backgroundColor: 'white'
      })}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
          pt: 4,
          pb: 4
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center'
          }}
        >
          <IconButton>
            <LinkedIn fontSize="large" />
          </IconButton>
          <IconButton>
            <Instagram fontSize="large" />
          </IconButton>
        </Box>
        <Box
          sx={t => ({
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 10,
            justifyContent: 'center',
            alignContent: 'center',
            color: t.palette.secondary[600]
          })}
        >
          <Box sx={linkBoxStyle}>
            <Typography gutterBottom variant="h4" component={'p'}>
              {t('company')}
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              {t('legals')}
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              {t('privacy')}
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              {t('job')}
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              {t('contact')}
            </Typography>
          </Box>
          <Box sx={linkBoxStyle}>
            <Typography gutterBottom variant="h4" component={'p'}>
              {t('services')}
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              {t('freelanceDashboard')}
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              {t('customerDashboard')}
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              {t('chat')}
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              {t('profile')}
            </Typography>
          </Box>
          <Box sx={linkBoxStyle}>
            <Typography gutterBottom variant="h4" component={'p'}>
              {t('about')}
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              {t('whoWeAre')}
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              {t('ourEngagment')}
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              {t('ourVision')}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" sx={{ mt: 1 }}>
            Copyright © 2024
          </Typography>
        </Box>
      </Container>
    </Container>
  )
}
