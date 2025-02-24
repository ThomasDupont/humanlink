import type { NextConfig } from 'next'
import { env } from './src/server/env'

const nextConfig: NextConfig = {
  /* config options here */
  publicRuntimeConfig: {
    NODE_ENV: env.NODE_ENV
  },
  reactStrictMode: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr']
  }
}

export default nextConfig
