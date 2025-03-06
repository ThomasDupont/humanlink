import config from '@/config'
import { Category, Lang } from '@prisma/client'
import { Effect, Exit } from 'effect'
import { FormError } from './Errors'
import { Schema } from 'effect'

const stringError = {
  message: () => 'value is not a string'
}
const numberError = {
  message: () => 'value is not a number'
}

const categoryError = {
  message: () => 'value is not a valid category'
}

const langError = {
  message: () => 'value is not a valid lang'
}
const title = Schema.String.annotations(stringError)
const shortDescription = Schema.String.annotations(stringError)
const description = Schema.String.annotations(stringError)
const category = Schema.Enums(Category).annotations(categoryError)
const langs = Schema.Array(Schema.Enums(Lang)).annotations(langError)
const price = Schema.Number.annotations(numberError)

export const createServiceFormSchema = Schema.Struct({
  title,
  shortDescription,
  description,
  category,
  langs,
  price
})

export type CreateServiceFormSchema = typeof createServiceFormSchema.Type

export enum ErrorsTag {
  Title = 'title',
  ShortDescription = 'shortDescription',
  Description = 'description',
  Category = 'category',
  Langs = 'langs',
  Price = 'price'
}

const validateStringEffect =
  <T extends typeof Schema.String>(codec: T, maxLen: number, tag: string) =>
  (input: unknown) =>
    Schema.decodeUnknown(codec)(input).pipe(
      Effect.flatMap(value =>
        Effect.if(value.length !== 0, {
          onFalse: () => Effect.fail(FormError.of(tag)(new Error(`${tag} must be setted`))),
          onTrue: () => Effect.succeed(value)
        })
      ),
      Effect.flatMap(value =>
        Effect.if(value.length < maxLen, {
          onFalse: () =>
            Effect.fail(FormError.of(tag)(new Error(`${tag} length exceed ${maxLen}`))),
          onTrue: () => Effect.succeed(value)
        })
      ),
      Effect.mapError(FormError.of(tag))
    )

const validateNumberEffect =
  <T extends typeof Schema.Number>(codec: T, max: number, tag: string) =>
  (input: unknown) =>
    Schema.decodeUnknown(codec)(input).pipe(
      Effect.flatMap(value =>
        Effect.if(value < max, {
          onFalse: () => Effect.fail(FormError.of(tag)(new Error(`${tag} length exceed ${max}`))),
          onTrue: () => Effect.succeed(value)
        })
      ),
      Effect.mapError(FormError.of(tag))
    )

const validateCategoryEffect = (input: unknown) =>
  Schema.decodeUnknown(category)(input).pipe(Effect.mapError(FormError.of(ErrorsTag.Category)))
const validateLangsEffect = (input: unknown) =>
  Schema.decodeUnknown(langs)(input).pipe(Effect.mapError(FormError.of(ErrorsTag.Langs)))

export const useCreateServiceFormValidation = () => {
  const validate = (input: Partial<CreateServiceFormSchema>) => {
    const errors: FormError[] = []

    validateStringEffect(
      title,
      config.userInteraction.serviceTitleMaxLen,
      ErrorsTag.Title
    )(input.title).pipe(
      Effect.runSyncExit,
      Exit.mapError(e => errors.push(e))
    )

    validateStringEffect(
      description,
      config.userInteraction.serviceDescriptionMaxLen,
      ErrorsTag.Description
    )(input.description).pipe(
      Effect.runSyncExit,
      Exit.mapError(e => errors.push(e))
    )

    validateStringEffect(
      shortDescription,
      config.userInteraction.serviceShortDescriptionMaxLen,
      ErrorsTag.ShortDescription
    )(input.shortDescription).pipe(
      Effect.runSyncExit,
      Exit.mapError(e => errors.push(e))
    )

    validateCategoryEffect(input.category).pipe(
      Effect.runSyncExit,
      Exit.mapError(e => errors.push(e))
    )

    validateLangsEffect(input.langs).pipe(
      Effect.runSyncExit,
      Exit.mapError(e => errors.push(e))
    )

    validateNumberEffect(
      price,
      config.userInteraction.fixedPriceMax,
      ErrorsTag.Price
    )(input.price).pipe(
      Effect.runSyncExit,
      Exit.mapError(e => errors.push(e))
    )

    return errors
  }

  return { validate }
}
