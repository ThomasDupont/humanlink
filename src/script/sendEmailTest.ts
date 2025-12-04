import { buildNotificationEmail, NotificationEmail } from '@/server/emailOperations/buildEmail'
import { mailProviderFactory } from '@/server/emailOperations/email.provider'

const mail = mailProviderFactory.mailjet()

const sentTestEmail = async () => {
  const args: NotificationEmail = {
    firstname: 'John',
    notificationType: 'NEW_MESSAGE',
    detail: 'This is a test notification.'
  }
  const html = buildNotificationEmail(args)

  await mail.sendEmail({
    to: {
      email: 'dupont.thomas70@gmail.com',
      name: 'Thomas Dupont'
    },
    subject: 'Test Email',
    text: args.detail,
    html
  })
}

void sentTestEmail()
