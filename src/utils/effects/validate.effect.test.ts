import { describe, expect, it } from 'vitest'
import { validateDateEffect } from './validate.effect'
import { Effect, Schema } from 'effect'

describe('Test validate effect', () => {
  describe('Test Date validator', () => {
    it('Date in past with allow past', () => {
      const validator = validateDateEffect(Schema.Date, { allowPast: true }, 'date')

      const date = new Date('10/10/2020')
      const validate = validator(date.toDateString()).pipe(Effect.runSync)

      expect(validate).toEqual(date)
    })

    it('Date in future with allow past', () => {
      const validator = validateDateEffect(Schema.Date, { allowPast: true }, 'date')

      const date = '10/10/2999'
      const validate = validator(date).pipe(Effect.runSync)

      expect(validate).toEqual(new Date(date))
    })

    it('Date with disallow past (error)', () => {
      const validator = validateDateEffect(Schema.Date, { allowPast: false }, 'date')

      const date = '10/10/2020'
      const validate = validator(date).pipe(
        Effect.catchAll(e => {
          expect(e.message).toEqual('date is in the past')
          return Effect.succeed(false)
        }),
        Effect.runSync
      )

      expect(validate).toBeFalsy()
    })
  })
})
