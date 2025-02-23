import { createTheme } from '@mui/material/styles'
import { Roboto, Roboto_Condensed } from 'next/font/google'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto'
})

// for title
const robotoCondensed = Roboto_Condensed({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-condensed'
})

const theme = createTheme({
  palette: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bedaff',
      300: '#92c4fe',
      400: '#5ea3fc',
      main: '#397ff8',
      600: '#235fed',
      700: '#1b4ada',
      800: '#1c3db1',
      900: '#1d388b'
    },
    secondary: {
      50: '#f6f6f6',
      100: '#e7e7e7',
      600: '#5d5d5d',
      700: '#4f4f4f',
      main: '#0F0F0F'
    }
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    h1: {
      fontFamily: robotoCondensed.style.fontFamily,
      fontWeight: 400,
      fontSize: 72
    },
    h3: {
      fontFamily: robotoCondensed.style.fontFamily,
      fontWeight: 400,
      fontSize: 28
    },
    h4: {
      fontFamily: robotoCondensed.style.fontFamily,
      fontWeight: 400,
      fontSize: 20
    }
  }
})

export default theme
