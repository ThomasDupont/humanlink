import "@/styles/globals.css";
import { trpc } from "@/utils/trpc";
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import type { AppProps } from "next/app";
import Layout from "./Layout";

function App({ Component, pageProps }: AppProps) {
  return <ThemeProvider theme={theme}>
    <Layout>
      <Component {...pageProps} />
    </Layout>
  </ThemeProvider>;
}

export default trpc.withTRPC(App);
