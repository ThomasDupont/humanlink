import { SupportedLocale } from '@/config'
import { Container, Box } from '@mui/material'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'

const Base = ({ children }: { children: ReactElement }) => {
  return (
    <Container maxWidth="xl">
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'dashboard', 'service'])),
      locale
    }
  }
}

export default function OfferDetail({ locale }: { locale: SupportedLocale }) {
  console.log(locale)
  return (
    <Base>
      <></>
    </Base>
  )
}
