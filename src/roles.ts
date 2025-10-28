import { Role } from '@prisma/client'

type Access = {
  user: boolean // default acces for signed user
  manageConfigPanel: boolean // the config panel (provider administration)
  affectRoles: boolean // affect roles to users
  readUsers: boolean // read users data
  createUsers: boolean // create users (not classic signed user)
  udpateUsers: boolean
  deleteUsers: boolean
  manageServices: boolean // manage services (create, update, delete)
  connectAsUser: boolean // connect as an user (for admin)
  manageDisputes: boolean // manage disputes
  refundTransactions: boolean // refund transactions
}

const RoleScale: Record<Required<keyof Access>, number> = {
  user: 1,
  manageConfigPanel: 5,
  affectRoles: 4,
  readUsers: 3,
  createUsers: 4,
  udpateUsers: 3,
  deleteUsers: 3,
  manageServices: 2,
  connectAsUser: 2,
  manageDisputes: 2,
  refundTransactions: 2
}

/*
Only a user with a higher scale could manage a role on lower scale

For user operations and role management, it's not possible to affect an user if there are a equal or higher scale inside his role
*/

const hasAffectRoleAccess = (userRoles: Role[]) =>
  userRoles.find(role => role.name === 'affectRoles')
const hasCorrectScale = (role: keyof Access, userRoles: Role[]) => {
  const higherRoleScale = userRoles.reduce((max, r) => {
    const rScale = RoleScale[r.name as keyof Access] || 0
    return Math.max(max, rScale)
  }, 0)

  return RoleScale[role] <= higherRoleScale
}

export const canAffectRole = (role: keyof Access, userRoles: Role[]) => {
  if (!hasAffectRoleAccess(userRoles)) {
    return false
  }

  return hasCorrectScale(role, userRoles)
}

export const couldAffectUser = (me: Role[], user: Role[]) => {
  if (me.length === 0 || user.length === 0) {
    return false
  }

  const meScale = me.reduce((max, r) => {
    const rScale = RoleScale[r.name as keyof Access] || 0
    return Math.max(max, rScale)
  }, 0)

  const userScale = user.reduce((max, r) => {
    const rScale = RoleScale[r.name as keyof Access] || 0
    return Math.max(max, rScale)
  }, 0)

  return meScale > userScale
}
