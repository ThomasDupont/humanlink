import { File, PrismaClient } from '@prisma/client'

export const filesCrud = (prisma: PrismaClient) => {
  const addAFile = (file: Omit<File, 'id' | 'createdAt' | 'updatedAt'>) => {
    return prisma.file.create({
      data: file
    })
  }

  return { addAFile }
}
