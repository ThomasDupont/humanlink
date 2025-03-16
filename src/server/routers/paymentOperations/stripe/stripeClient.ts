import { env } from '@/server/env'
import Stripe from 'stripe'

const stripe = new Stripe(env.STRIPE_API_KEY)

export default stripe
