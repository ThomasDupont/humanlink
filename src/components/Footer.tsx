import { Instagram, LinkedIn } from '@mui/icons-material'
import { Box, Container, IconButton, Typography } from '@mui/material'

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
              Société
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              Mentions légales
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              Politique de confidentialité
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              Carrière
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              Contact
            </Typography>
          </Box>
          <Box sx={linkBoxStyle}>
            <Typography gutterBottom variant="h4" component={'p'}>
              Services
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              dashboard freelance
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              dashboard client
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              messagerie
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              Profil
            </Typography>
          </Box>
          <Box sx={linkBoxStyle}>
            <Typography gutterBottom variant="h4" component={'p'}>
              A propos
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              Qui sommes-nous ?
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              Nos engagements
            </Typography>
            <Typography sx={linkTypoStyle} variant="body1">
              Notre vision
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
