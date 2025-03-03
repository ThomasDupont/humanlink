import '@/styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { trpc } from '@/utils/trpc'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../materials/theme'
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
import Layout from '../Layout'
import '../styles/globals.css'

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <ThemeProvider theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </SessionProvider>
  )
}

export default trpc.withTRPC(appWithTranslation(App))
