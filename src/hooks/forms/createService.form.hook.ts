import config from '@/config'
import { Category, Lang } from '@prisma/client'
import { Effect } from 'effect'
import { FormError } from '../../utils/effects/Errors'
import { Schema } from 'effect'
import { validateStringEffect, validateNumberEffect } from '@/utils/effects/validate.effect'

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

export enum Tag {
  Title = 'title',
  ShortDescription = 'shortDescription',
  Description = 'description',
  Category = 'category',
  Langs = 'langs',
  Price = 'price'
}

const validateCategoryEffect = (input: unknown) =>
  Schema.decodeUnknown(category)(input).pipe(
    Effect.map(value => ({
      tag: Tag.Category,
      value
    })),
    Effect.mapError(FormError.of(Tag.Category))
  )

const validateLangsEffect = (input: unknown) =>
  Schema.decodeUnknown(langs)(input).pipe(
    Effect.flatMap(value =>
      Effect.if(value.length > 0, {
        onFalse: () => Effect.fail(FormError.of(Tag.Langs)(new Error(`langs must be setted`))),
        onTrue: () => Effect.succeed({ tag: Tag.Langs, value })
      })
    ),
    Effect.mapError(FormError.of(Tag.Langs))
  )

export const useCreateServiceFormValidation = () => {
  const validate = (input: Partial<CreateServiceFormSchema>) => {
    return Effect.all(
      [
        validateStringEffect(
          title,
          { max: config.userInteraction.serviceTitleMaxLen },
          Tag.Title
        )(input.title),
        validateStringEffect(
          description,
          { max: config.userInteraction.serviceDescriptionMaxLen },
          Tag.Description
        )(input.description),
        validateStringEffect(
          shortDescription,
          { max: config.userInteraction.serviceShortDescriptionMaxLen },
          Tag.ShortDescription
        )(input.shortDescription),
        validateCategoryEffect(input.category),
        validateLangsEffect(input.langs),
        validateNumberEffect(
          price,
          { max: config.userInteraction.fixedPriceMax, min: 1 },
          Tag.Price
        )(input.price)
      ],
      { mode: 'either' }
    )
      .pipe(Effect.runSync)
      .filter(r => r._tag === 'Left')
      .map(r => ({
        ...r.left
      }))
  }

  return { validate }
}
