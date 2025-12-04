import config from '@/config'
import {
  validateDateEffect,
  validateNumberEffect,
  validateStringEffect
} from '@/utils/effects/validate.effect'
import { Effect, Schema } from 'effect'

export enum Tag {
  ServiceId = 'serviceId',
  Description = 'description',
  Deadline = 'deadline',
  Price = 'price'
}

const stringError = {
  message: () => 'value is not a string'
}

const numberError = {
  message: () => 'value is not a number'
}

const dateError = {
  message: () => 'value is not a date'
}

const description = Schema.String.annotations(stringError)
const price = Schema.Number.annotations(numberError)
const deadline = Schema.Date.annotations(dateError)

export type CreateOffer = {
  serviceId?: number
  description: string
  price: number
  deadline?: Date
}
export const useCreateOfferFormValidation = () => {
  const validate = (input: CreateOffer) => {
    return Effect.all(
      [
        validateStringEffect(
          description,
          {
            max: config.userInteraction.descriptionMaxLen
          },
          Tag.Description
        )(input.description),
        validateNumberEffect(
          price,
          { max: config.userInteraction.fixedPriceMax, min: 1 },
          Tag.Price
        )(input.price),
        validateDateEffect(
          deadline,
          {
            allowPast: false
          },
          Tag.Deadline
        )(input.deadline?.toDateString())
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
