import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import { copyFile } from 'fs/promises'
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
  const form = new Formidable()

  const [fields, files] = await form.parse(req)
  console.log(files.files)

  if (!files.files) {
    return res.status(400).json({ error: 'No files received.', status: 400 })
  }

  const file = files.files[0]!

  const filename = file.originalFilename
  console.log(filename)
  try {
    await copyFile(file.filepath, path.join(process.cwd(), 'public/' + filename))
    return res.json({ Message: 'Success', status: 201 })
  } catch (error) {
    console.log('Error occured ', error)
    return res.json({ Message: 'Failed', status: 500 })
  }
}
