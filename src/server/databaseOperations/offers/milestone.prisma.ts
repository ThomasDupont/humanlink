import { PrismaClient } from '@prisma/client'

export const milestoneCrud = (prisma: PrismaClient) => {
  const addRenderingToAMilestone = (
    id: number,
    {
      text,
      files
    }: {
      text: string | null
      files: string[]
    }
  ) => {
    return prisma.milestone.update({
      where: { id },
      data: {
        renderingText: text,
        renderingFiles: { push: files }
      }
    })
  }

  const closeMilestone = (id: number) => {
    return prisma.milestone.update({
      where: { id },
      data: {
        terminatedAt: new Date()
      }
    })
  }

  return { addRenderingToAMilestone, closeMilestone }
}
