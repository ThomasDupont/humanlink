import type { NextApiRequest, NextApiResponse } from 'next'
import { Formidable } from 'formidable'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import appConfig from '@/config'
import { uploadsFile } from '@/server/routers/trpcProcedures/upsert.trpc'

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
    const [_, files] = await form.parse(req)

    if (!files.files) {
      return res.status(400).json({ error: 'No files received.' })
    }

    if (files.files.length > appConfig.userInteraction.maxUploadFiles) {
      return res.status(400).json({ error: 'max_file_upload' })
    }

    const uploadResult = await uploadsFile(files.files, 'ascend-rendering-offer', userId).run()

    return res.json({
      files: uploadResult.map(file => ({
        originalFileName: file.originalFilename,
        hash: file.hash
      }))
    })
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message })
  }
}
