import { FormError } from './Errors'
import { Effect, Schema } from 'effect'

type Options = { min?: number; max?: number }
export const validateStringEffect =
  <T extends typeof Schema.String>(codec: T, { min = 0, max = 1 }: Options, tag: string) =>
  (input: unknown) =>
    Schema.decodeUnknown(codec)(input).pipe(
      Effect.flatMap(value =>
        Effect.if(value.length !== min, {
          onFalse: () => Effect.fail(FormError.of(tag)(new Error(`${tag} must be setted`))),
          onTrue: () => Effect.succeed(value)
        })
      ),
      Effect.flatMap(value =>
        Effect.if(value.length < max, {
          onFalse: () => Effect.fail(FormError.of(tag)(new Error(`${tag} length exceed ${max}`))),
          onTrue: () => Effect.succeed(value)
        })
      ),
      Effect.mapError(FormError.of(tag))
    )

export const validateNumberEffect =
  <T extends typeof Schema.Number>(codec: T, { min = 0, max = 1 }: Options, tag: string) =>
  (input: unknown) =>
    Schema.decodeUnknown(codec)(input).pipe(
      Effect.flatMap(value =>
        Effect.if(value > min, {
          onFalse: () => Effect.fail(FormError.of(tag)(new Error(`${tag} minimum must be ${min}`))),
          onTrue: () => Effect.succeed(value)
        })
      ),
      Effect.flatMap(value =>
        Effect.if(value < max, {
          onFalse: () => Effect.fail(FormError.of(tag)(new Error(`${tag} length exceed ${max}`))),
          onTrue: () => Effect.succeed(value)
        })
      ),
      Effect.mapError(FormError.of(tag))
    )

export const validateDateEffect =
  <T extends typeof Schema.Date>(codec: T, { allowPast }: { allowPast: boolean }, tag: string) =>
  (input: unknown) =>
    Schema.decodeUnknown(codec)(input).pipe(
      Effect.flatMap(value =>
        Effect.if(allowPast || value > new Date(), {
          onFalse: () => Effect.fail(FormError.of(tag)(new Error(`${tag} is in the past`))),
          onTrue: () => Effect.succeed(value)
        })
      ),
      Effect.mapError(FormError.of(tag))
    )
