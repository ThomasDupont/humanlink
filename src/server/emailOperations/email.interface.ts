export type EmailInput = {
  to: {
    email: string
    name: string
  }
  subject: string
  text: string
  html: string
}
export type GenericMailProvider = {
  sendEmail: (args: EmailInput) => Promise<void>
}
