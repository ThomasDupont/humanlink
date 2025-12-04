import { ArrayElement, isNotNull } from '@/types/utility.type'
import { ConcernedOffer, FilesFromAPI, trpc } from '@/utils/trpc'
import { useState } from 'react'

export type Rendering = {
  milestoneId: number
  files: FilesFromAPI
  text: string | null
}
export const useRendering = (offer: ConcernedOffer | null) => {
  const [renderings, setRenderings] = useState<Rendering[]>([])

  const offerMilestoneIdAndFiles =
    offer?.milestone.map(
      m =>
        ({
          id: m.id,
          files: m.renderingFiles,
          text: m.renderingText
        }) as const
    ) ?? []

  const query = trpc.useUtils()

  const getRenderingForOneMilestone = (
    milestone: ArrayElement<typeof offerMilestoneIdAndFiles>
  ) => {
    return query.protectedGet.getProtectedFiles
      .fetch({
        files: milestone.files
      })
      .then(renderingFiles => ({
        milestoneId: milestone.id,
        text: milestone.text,
        files: renderingFiles
      }))
  }

  const fetchRendering = async () => {
    const result = await Promise.allSettled(
      offerMilestoneIdAndFiles.map(getRenderingForOneMilestone)
    )

    const rendering = result
      .map(settled => {
        if (settled.status === 'fulfilled') {
          return settled.value
        }

        console.error(settled.reason)

        return null
      })
      .filter(isNotNull)

    setRenderings(rendering)
  }

  return { fetchRendering, renderings }
}
