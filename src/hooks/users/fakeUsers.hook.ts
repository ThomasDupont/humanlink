/* eslint-disable @typescript-eslint/no-unused-vars */
import { HookInterface } from './hook.interface'
import fakeUsers from './fixtures.json'
import { useCallback } from 'react'
import { Country, User } from '@prisma/client'
import { UserDTO } from '@/server/dto/user.dto'

type FakeProfile = (typeof fakeUsers.results)[0]

const getRandomProfile = () => {
  const index = Math.floor(Math.random() * fakeUsers.results.length)

  return fakeUsers.results[index]
}

export const useUser = (): HookInterface => {
  const parseUser = (profile: FakeProfile): UserDTO => ({
    image: profile.picture.thumbnail,
    firstname: profile.name.first,
    lastname: profile.name.last,
    country: profile.location.country as Country,
    description: '',
    jobTitle: '',
    id: 0,
    isCertified: true
  })

  const getUserByIds = (ids: number[]): Promise<UserDTO[]> => Promise.resolve([])

  return { getUserByIds }
}
