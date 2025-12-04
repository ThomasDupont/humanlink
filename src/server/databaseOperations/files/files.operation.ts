import { File, PrismaClient } from '@prisma/client'

export const filesCrud = (prisma: PrismaClient) => {
  const addAFile = (file: Omit<File, 'id' | 'createdAt' | 'updatedAt'>) => {
    return prisma.file.upsert({
      where: { hash: file.hash },
      update: {
        relatedUsers: {
          set: file.relatedUsers
        }
      },
      create: file
    })
  }

  const getFilesByHashAndRelatedUser = (userId: number, hashes: string[]) => {
    return prisma.file.findMany({
      where: {
        hash: {
          in: hashes
        },
        relatedUsers: {
          has: userId
        }
      }
    })
  }

  return { addAFile, getFilesByHashAndRelatedUser }
}
