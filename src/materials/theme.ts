import { createTheme } from '@mui/material/styles';
import { Roboto, Roboto_Condensed } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

// for title
const robotoCondensed = Roboto_Condensed({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-condensed',
})

const theme = createTheme({
  palette: {
    primary: {
      50: '#eff6ff',
      light: '#dbeafe',
      main: '#77b5fe',
      dark: '#397ff8'
    },
    secondary: {
      50: '#f6f6f6',
      100: '#e7e7e7',
      main: '#0F0F0F'
    }
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    h1: {
      fontFamily: robotoCondensed.style.fontFamily,
      fontWeight: 400,
      fontSize: 72
    }
  },
});

export default theme;
