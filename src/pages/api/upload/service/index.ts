import type { NextApiRequest, NextApiResponse } from 'next'
import { Formidable } from 'formidable'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import appConfig from '@/config'
import { uploadsFile } from '@/server/routers/trpcProcedures/upsert.trpc'
import { serviceOperations } from '@/server/databaseOperations/prisma.provider'

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'user_not_loggin' })
  }

  const userId = session.user.id
  const form = new Formidable({
    hashAlgorithm: 'sha256'
  })

  try {
    const [fields, files] = await form.parse(req)

    if (!files.files) {
      return res.status(400).json({ error: 'No files received.' })
    }

    if (!fields['serviceId'] || !fields['serviceId'][0]) {
      return res.status(400).json({ error: 'No offerId received.' })
    }

    const service = await serviceOperations.getServiceById(parseInt(fields['serviceId'][0] ?? '0'))

    if (!service) {
      return res.status(404).json({ error: 'Service not found.' })
    }

    if (service.userId !== userId) {
      return res.status(403).json({ error: 'user_not_authorized' })
    }

    if (files.files.length > appConfig.userInteraction.maxUploadFiles) {
      return res.status(400).json({ error: 'max_file_upload' })
    }

    const computeTotalFile = files.files.reduce((acc, file) => acc + file.size, 0)

    if (computeTotalFile > appConfig.userInteraction.maxUploadFileSize) {
      return res.status(400).json({ error: 'max_file_size' })
    }

    const uploadResult = await uploadsFile(files.files, 'ascend-service-banner', userId).run()

    return res.json({
      files: uploadResult.map(file => ({
        originalFilename: file.originalFilename,
        hash: file.hash
      }))
    })
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message })
  }
}
