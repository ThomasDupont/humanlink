import { TRPCError } from '@trpc/server'

export class CustomError extends Error {
  cause: string
  message: string
  code: TRPCError['code']
  detailedError?: unknown
  clientMessage?: string
  constructor({
    cause,
    message,
    code,
    detailedError,
    clientMessage
  }: {
    cause: string
    message: string
    code: TRPCError['code']
    detailedError?: unknown
    clientMessage?: string
  }) {
    super(message)
    this.cause = cause
    this.message = message
    this.code = code
    this.detailedError = detailedError
    this.clientMessage = clientMessage
  }
}
