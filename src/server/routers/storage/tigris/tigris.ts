import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { AddAFileToTheBucketArgs } from '../storage.interface'
import { readFile } from 'node:fs/promises'

export const crudFileTigris = (s3Fun: () => S3Client) => {
  const s3 = s3Fun()
  const addAFileToTheBucket =
    (bucket: string) =>
    async ({ filepath, filename }: AddAFileToTheBucketArgs): Promise<string> => {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: await readFile(filepath)
      })

      await s3.send(command)
      return ''
    }

  const removeAFileInTheBucket = (_: string): Promise<void> => {
    return Promise.resolve()
  }

  return { addAFileToTheBucket, removeAFileInTheBucket }
}
