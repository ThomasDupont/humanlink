import { PrismaClient } from '@prisma/client'

export const milestoneCrud = (prisma: PrismaClient) => {
  const addRenderingToAMilestone = (
    id: number,
    {
      text,
      files
    }: {
      text: string
      files: string[]
    }
  ) => {
    return prisma.milestone.update({
      where: { id },
      data: {
        renderingText: text,
        renderingFiles: files
      }
    })
  }

  return { addRenderingToAMilestone }
}
