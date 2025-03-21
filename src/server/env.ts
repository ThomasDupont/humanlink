import { z } from 'zod'

const envSchema = z.object({
  ELASTIC_URL: z.string().url(),
  ELASTIC_KEY: z.string(),
  NODE_ENV: z.enum(['development', 'test', 'production', 'preprod']),
  ALGOLIA_KEY: z.string(),
  ALGOLIA_SECRET: z.string(),
  ELASTIC_SELF_CERTIF: z.string(),
  LINKEDIN_ID: z.string(),
  LINKEDIN_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  AUTH_SECRET: z.string(),
  STRIPE_API_KEY: z.string(),
  NEXT_PUBLIC_STRIPE_API_KEY_PUBLIC: z.string()
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  throw new Error(
    '❌ Invalid environment variables: ' + JSON.stringify(_env.error.format(), null, 4)
  )
}
export const env = _env.data
