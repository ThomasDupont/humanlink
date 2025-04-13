import { env } from '@/server/env'
import Mailjet from 'node-mailjet'

const mailjet = () =>
  new Mailjet({
    apiKey: env.MAILJET_API_KEY,
    apiSecret: env.MAILJET_API_SECRET
  })

export default mailjet
