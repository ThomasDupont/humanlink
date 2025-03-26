import type { NextApiRequest, NextApiResponse } from 'next'
import { Formidable } from 'formidable'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'user_not_loggin' })
  }

  const userId = session.user.id
  const form = new Formidable({
    hashAlgorithm: 'sha256'
  })

  const [_, files] = await form.parse(req)

  if (!files.files) {
    return res.status(400).json({ error: 'No files received.', status: 400 })
  }

  try {
    const hashs = []
    for (const file of files.files) {
      console.log(file)
      hashs.push(file.hash)
    }

    return res.json({ Message: 'Success', status: 201, hashs })
  } catch (error) {
    console.log('Error occured ', error)
    return res.json({ Message: 'Failed', status: 500 })
  }
}
