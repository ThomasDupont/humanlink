import fs from 'fs'
import path from 'path'

const NotificationType = {
  OFFER_ACCEPTED: `You're offer has been accepted`,
  NEW_MESSAGE: 'You have a new message',
  RENDERING_ADDED: 'A new rendering has been added'
} as const

export type NotificationEmail = {
  firstname: string
  notificationType: keyof typeof NotificationType
  detail: string
}

export const buildNotificationEmail = ({
  firstname,
  notificationType,
  detail
}: NotificationEmail) => {
  const template = fs.readFileSync(
    path.join(process.cwd(), 'src/server/emailOperations/template/notification.template.html'),
    'utf-8'
  )

  return template
    .replace(/{{firstname}}/g, firstname)
    .replace(/{{notificationType}}/g, NotificationType[notificationType])
    .replace(/{{detail}}/g, detail)
}
