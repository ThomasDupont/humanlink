import '@/styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { trpc } from '@/utils/trpc'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import getTheme from '../materials/theme'
import { useThemeState } from '@/state/theme.state'
import { useMemo } from 'react'
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
import Layout from '../Layout'
import '../styles/globals.css'

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const { themeSnapshot } = useThemeState()
  const theme = useMemo(
    () => getTheme(themeSnapshot.darkMode ? 'dark' : 'light'),
    [themeSnapshot.darkMode]
  )
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </SessionProvider>
  )
}

export default trpc.withTRPC(appWithTranslation(App))
