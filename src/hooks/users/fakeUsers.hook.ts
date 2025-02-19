import { User } from "@/types/User.type"
import { HookInterface } from "./hook.interface"
import fakeUsers from './fixtures.json'
import { useCallback } from "react"

type FakeProfile = {
    picture: {
        thumbnail: string
    },
    name: {
        first: string
        last: string
    },
    location: {
        country: string
    }
}
type FakeProfiles = { results: FakeProfile[] }

export const useUser = (): HookInterface => {
    const parseUser = (profile: FakeProfile): User => ({
        thumbnail: profile.picture.thumbnail,
        firstname: profile.name.first,
        lastname: profile.name.last,
        country: profile.location.country
    })

    const getUserById = useCallback(async (id: string): Promise<User | null> => {
        return parseUser((fakeUsers as FakeProfiles).results[parseInt(id, 10)]) ?? null
    }, [])

    return { getUserById }
}
