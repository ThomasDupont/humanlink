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
          main: '#2f45ff',
          light: '#85a8ff',
          dark: '#0000ff'
      },
      secondary: {
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
