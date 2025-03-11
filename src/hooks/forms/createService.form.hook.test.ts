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

  it('Should have 3 errors', () => {
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

  it('Should have 1 error on Lang', () => {
    const { validate } = useCreateServiceFormValidation()

    const errors = validate({
      title: 'test',
      shortDescription: 'testShortDesc',
      category: 'CompanyCreation',
      description: 'testDescription',
      langs: [],
      price: 1000
    })

    expect(errors.length).toEqual(1)
    expect(errors[0]?.tag).toEqual('langs')
  })

  it('Should have 1 error on exeed length', () => {
    const { validate } = useCreateServiceFormValidation()

    const errors = validate({
      title:
        'proident nisi ipsum veniam tempor duis velit ullamco elit dolor tempor laborum voluptate nisi et duis nulla nulla deserunt aute laboris deserunt occaecat ipsum minim anim excepteur ut esse nostrud',
      shortDescription: 'testShortDesc',
      category: 'CompanyCreation',
      description: 'testDescription',
      langs: ['FR'],
      price: 1000
    })

    expect(errors.length).toEqual(1)
    expect(errors[0]?.tag).toEqual('title')
  })

  it('Should have 1 error on max price exeed', () => {
    const { validate } = useCreateServiceFormValidation()

    const errors = validate({
      title: 'proident nisi ipsum veniam',
      shortDescription: 'testShortDesc',
      category: 'CompanyCreation',
      description: 'testDescription',
      langs: ['FR'],
      price: 10000000
    })

    expect(errors.length).toEqual(1)
    expect(errors[0]?.tag).toEqual('price')
  })
})
