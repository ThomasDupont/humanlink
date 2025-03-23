import { ServiceWithPrice } from '@/types/Services.type'
import { UserWithServicesWithPrices } from '@/types/User.type'
import { User } from '@prisma/client'

export const singleUserToDisplayUserForOther = (user: User): UserDTO => {
  return {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    image: user.image,
    isCertified: user.isCertified,
    country: user.country,
    description: user.description,
    jobTitle: user.jobTitle
  }
}

export type UserDTO = Pick<
  User,
  'firstname' | 'lastname' | 'image' | 'isCertified' | 'country' | 'description' | 'jobTitle' | 'id'
>

export type UserDTOWithServicesWithPrices = UserDTO & {
  services: ServiceWithPrice[]
}

export const userWithServiceToDisplayUserForOther = (
  user: UserWithServicesWithPrices
): UserDTOWithServicesWithPrices => {
  return {
    ...singleUserToDisplayUserForOther(user),
    services: user.services
  }
}
