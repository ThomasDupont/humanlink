import pino from 'pino'
import { Context, Effect } from 'effect'

export const logger = pino()

export class Logger extends Context.Tag('logger')<
  Logger,
  {
    error: (err: { detailedError: unknown; cause: string; message: string }) => void
  }
>() {}

export const effectLogger = Effect.provideService(Logger, {
  error: logger.error.bind(logger)
})
