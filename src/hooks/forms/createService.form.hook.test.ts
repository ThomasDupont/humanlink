import { describe, expect, it } from 'vitest'
import { useCreateServiceFormValidation } from './createService.form.hook'
import { Lang } from '@prisma/client'

describe('createServiceForm validation', () => {
  it('Should validate the inputs', () => {
    const { validate } = useCreateServiceFormValidation()

    const errors = validate({
      title: 'testTitle',
      shortDescription: 'testShortDesc',
      category: 'CompanyCreation',
      description: 'testDesc',
      langs: ['EN'],
      price: 1000
    })

    expect(errors.length).toEqual(0)
  })

  it('Should have an error', () => {
    const { validate } = useCreateServiceFormValidation()

    const errors = validate({
      title: '',
      shortDescription: 'testShortDesc',
      category: 'CompanyCreation',
      description: '',
      langs: ['DE'] as unknown as Lang[],
      price: 1000
    })

    expect(errors.length).toEqual(3)
    expect(errors[0]?.tag).toEqual('title')
    expect(errors[1]?.tag).toEqual('description')
    expect(errors[2]?.tag).toEqual('langs')
  })
})
