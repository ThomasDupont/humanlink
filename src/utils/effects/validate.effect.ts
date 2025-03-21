import { FormError } from './Errors'
import { Effect, Schema } from 'effect'

type Options = { min?: number; max?: number }
export const validateStringEffect =
  <Tag extends string, T extends typeof Schema.String>(
    codec: T,
    { min = 0, max = 1 }: Options,
    tag: Tag
  ) =>
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
          onTrue: () => Effect.succeed({ tag, value })
        })
      ),
      Effect.mapError(FormError.of(tag))
    )

export const validateNumberEffect =
  <Tag extends string, T extends typeof Schema.Number>(
    codec: T,
    { min = 0, max = 1 }: Options,
    tag: Tag
  ) =>
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
          onTrue: () => Effect.succeed({ tag, value })
        })
      ),
      Effect.mapError(FormError.of(tag))
    )

export const validateDateEffect =
  <Tag extends string, T extends typeof Schema.Date>(
    codec: T,
    { allowPast }: { allowPast: boolean },
    tag: Tag
  ) =>
  (input: unknown) =>
    Schema.decodeUnknown(codec)(input).pipe(
      Effect.flatMap(value =>
        Effect.if(allowPast || value > new Date(), {
          onFalse: () => Effect.fail(FormError.of(tag)(new Error(`${tag} is in the past`))),
          onTrue: () => Effect.succeed({ tag, value })
        })
      ),
      Effect.mapError(FormError.of(tag))
    )
