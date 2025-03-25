import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import { copyFile } from 'fs/promises'
import { Formidable } from 'formidable'
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { storageProviderFactory } from '@/server/routers/storage/storage.provider'

export const config = {
  api: {
    bodyParser: false
  }
}

async function hashFile(algorithm: string, path: string | URL) {
  const hash = createHash(algorithm);

  const stream = createReadStream(path);

  for await (const chunk of stream) {
      hash.update(chunk as Buffer);
  }

  return hash.digest('hex');
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({message : 'user_not_loggin'})
  }

  const userId = session.user.id
  const form = new Formidable({
    hashAlgorithm: 'sha256'
  })

  const [_, files] = await form.parse(req)

  if (!files.files) {
    return res.status(400).json({ error: 'No files received.', status: 400 })
  }

  const { addAFileToTheBucket } = storageProviderFactory.tigris()

  try {
    const hashs = []
    for (const file of files.files) {
      const hash = await hashFile('sha256', file.filepath)
      hashs.push(hash)
      await addAFileToTheBucket('')({
        filename: `${userId}/''`,
        localFilepath: file.filepath
      })
    }
    
    return res.json({ Message: 'Success', status: 201, hashs })
  } catch (error) {
    console.log('Error occured ', error)
    return res.json({ Message: 'Failed', status: 500 })
  }
}
