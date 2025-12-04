import { Effect, Schema } from 'effect'
import { expect, it } from 'vitest'
import { validOfferForRendering } from './offer.entities'

it('Should return a valid offer who could accept a rendering', () => {
  const entity = Schema.decodeUnknownSync(validOfferForRendering)({
    id: 1,
    userId: 12,
    userIdReceiver: 13,
    milestone: [
      {
        id: 20
      }
    ],
    isAccepted: true
  })

  expect(entity.id).toEqual(1)
})

it('Should return a valid offer who could accept a rendering with extra params', () => {
  const entity = Schema.decodeUnknownSync(validOfferForRendering)({
    id: 1,
    userId: 12,
    userIdReceiver: 13,
    milestone: [
      {
        id: 20,
        foo: 'bar'
      }
    ],
    isAccepted: true
  })

  expect(entity.id).toEqual(1)
})

it('Should return an error with an invalid offer (it is notAccepted by receiver)', () => {
  const invalidOffer = {
    id: 1,
    userId: 12,
    userIdReceiver: 13,
    milestone: [
      {
        id: 20
      }
    ],
    isAccepted: false
  }

  const entity = Schema.decodeUnknownEither(validOfferForRendering)(invalidOffer).pipe(
    Effect.catchAll(() => Effect.succeed(false)),
    Effect.runSync
  )

  expect(entity).toBeFalsy()
})
