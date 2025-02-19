import { extendTheme } from '@mui/joy';

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

const theme = extendTheme({
    colorSchemes: {
        light: {
            palette: {
                identity: {
                    100: '#dbeafe',
                    300: '#77b5fe',
                    500: '#397ff8'
                },
                secondary: {
                    950: '#0F0F0F'
                }
            },
        }
    },
  fontFamily: {
    body: roboto.style.fontFamily
  },
  typography: {
    h1: {
      fontFamily: robotoCondensed.style.fontFamily,
      fontWeight: 400,
      fontSize: 72
    },
  },
});

export default theme;
