import { expect, it } from 'vitest'
import { sellerDiscount } from './discount.entities'
import { Schema } from 'effect'

it('Should create a correct discount for seller', () => {
  const validDiscount = Schema.decodeSync(sellerDiscount)({
    id: 123,
    isActivated: true,
    code: 'test',
    affectedOn: 'seller',
    percentage: 60,
    isValidForUser: false
  })

  expect(validDiscount.percentage).toEqual(60)
})

it('Should return an error for discount with seller and amount (percentage) over 100%', () => {
  const lazy = () =>
    Schema.decodeSync(sellerDiscount)({
      id: 123,
      isActivated: true,
      code: 'test',
      affectedOn: 'seller',
      percentage: 110,
      isValidForUser: false
    })

  expect(lazy).toThrowError()
})

it('Should return an error for discount with negative amount', () => {
  const lazy = () =>
    Schema.decodeSync(sellerDiscount)({
      id: 123,
      isActivated: true,
      code: 'test',
      affectedOn: 'seller',
      percentage: 0,
      isValidForUser: false
    })

  expect(lazy).toThrowError()
})
