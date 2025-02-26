import { Box, Container, Typography } from '@mui/material'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'chat']))
    }
  }
}

export default function Concept() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          pt: 20
        }}
      >
        <Box id="headline">
          <Typography
            align="center"
            variant="h1"
            sx={{
              mb: 10
            }}
          >
            {"L'avenir du freelancing"}
          </Typography>
          <Typography
            variant="h4"
            component={'h2'}
            sx={{
              mb: 4
            }}
          >
            <Typography variant="h4" component={'span'} color="primary">
              Gig economy
            </Typography>
            {' : vente de prestation et non de CDD renouvelable.'}
          </Typography>
          <Typography
            variant="h4"
            component={'h2'}
            sx={{
              mb: 4
            }}
          >
            <Typography variant="h4" component={'span'} color="primary">
              Des commissions cohérentes
            </Typography>
            {' : 20% chez les autres, 8% chez nous, les freelances voudront passer par nous.'}
          </Typography>
          <Typography
            variant="h4"
            component={'h2'}
            sx={{
              mb: 4
            }}
          >
            <Typography variant="h4" component={'span'} color="primary">
              La confiance au centre du processus
            </Typography>
            {
              ' : Les profils pourront être certifié et le paiement interviendra après la livraison.'
            }
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}
