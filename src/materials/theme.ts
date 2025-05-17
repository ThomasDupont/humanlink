import { createTheme } from '@mui/material/styles'
import type { PaletteMode } from '@mui/material'
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

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
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
        50: mode === 'light' ? '#f6f6f6' : '#4f4f4f',
        100: mode === 'light' ? '#e7e7e7' : '#5d5d5d',
        600: mode === 'light' ? '#5d5d5d' : '#e7e7e7',
        700: mode === 'light' ? '#4f4f4f' : '#f6f6f6',
        main: mode === 'light' ? '#0F0F0F' : '#ffffff'
      },
      background: {
        default: mode === 'light' ? '#f6f6f6' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e'
      }
    },
    typography: {
      fontFamily: roboto.style.fontFamily,
      h1: {
        fontFamily: robotoCondensed.style.fontFamily,
        fontWeight: 400,
        fontSize: 72
      },
      h2: {
        fontFamily: robotoCondensed.style.fontFamily,
        fontWeight: 400,
        fontSize: 36
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

export default getTheme
