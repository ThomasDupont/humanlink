import Mailjet from 'node-mailjet'
import { EmailInput, GenericMailProvider } from '../email.interface'

const CONTACT_EMAIL = 'contact@thomas-dupont.io'
export const mailjetProvider = (client: () => Mailjet): GenericMailProvider => {
  const mailjet = client()
  const sendEmail = async (args: EmailInput) => {
    mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: CONTACT_EMAIL,
            Name: `Thomas d'Humanlink`
          },
          To: [
            {
              Email: args.to.email,
              Name: args.to.name
            }
          ],
          Subject: args.subject,
          TextPart: args.text,
          HTMLPart: args.html
        }
      ]
    })
  }

  return {
    sendEmail
  }
}
