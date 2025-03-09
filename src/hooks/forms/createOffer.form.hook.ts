import config from '@/config'
import { FormError } from '@/utils/effects/Errors'
import {
  validateDateEffect,
  validateNumberEffect,
  validateStringEffect
} from '@/utils/effects/validate.effect'
import { Effect, Exit, Schema } from 'effect'

export enum ErrorsTag {
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
  const validate = (input: CreateOffer): FormError[] => {
    const errors: FormError[] = []

    ;[
      validateStringEffect(
        description,
        {
          max: config.userInteraction.descriptionMaxLen
        },
        ErrorsTag.Description
      )(input.description)
    ].map(eff =>
      eff.pipe(
        Effect.runSyncExit,
        Exit.mapError(e => errors.push(e))
      )
    )

    validateNumberEffect(
      price,
      { max: config.userInteraction.fixedPriceMax },
      ErrorsTag.Price
    )(input.price).pipe(
      Effect.runSyncExit,
      Exit.mapError(e => errors.push(e))
    )

    validateDateEffect(
      deadline,
      {
        allowPast: false
      },
      ErrorsTag.Deadline
    )(input.deadline?.toDateString()).pipe(
      Effect.runSyncExit,
      Exit.mapError(e => errors.push(e))
    )

    return errors
  }

  return { validate }
}
