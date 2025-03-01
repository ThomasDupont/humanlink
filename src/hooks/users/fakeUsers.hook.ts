/* eslint-disable @typescript-eslint/no-unused-vars */
import { HookInterface } from './hook.interface'
import fakeUsers from './fixtures.json'
import { useCallback } from 'react'
import { Country, User } from '@prisma/client'

type FakeProfile = (typeof fakeUsers.results)[0]

const getRandomProfile = () => {
  const index = Math.floor(Math.random() * fakeUsers.results.length)

  return fakeUsers.results[index]
}

export const useUser = (): HookInterface => {
  const parseUser = (profile: FakeProfile): User => ({
    image: profile.picture.thumbnail,
    firstname: profile.name.first,
    lastname: profile.name.last,
    country: profile.location.country as Country,
    email: profile.email,
    oauthProvider: 'google',
    id: 0,
    createdAt: new Date(),
    isFreelance: false,
    description: '',
    jobTitle: '',
    isCertified: true,
    certifiedDate: new Date(),
    roles: ['USER']
  })

  const getUserById = useCallback(async (id: number): Promise<User | null> => {
    const fakeUser = getRandomProfile()
    return fakeUser ? parseUser(fakeUser) : null
  }, [])

  const getUserByIds = (ids: number[]): Promise<User[]> => Promise.resolve([])

  return { getUserById, getUserByIds }
}
