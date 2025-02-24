import type { NextConfig } from 'next'
import { env } from './src/server/env'
import path from 'path'

const nextConfig: NextConfig = {
  /* config options here */
  publicRuntimeConfig: {
    NODE_ENV: env.NODE_ENV
  },
  reactStrictMode: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr']
  },
  localePath: path.resolve('./public/locales')
}

export default nextConfig
