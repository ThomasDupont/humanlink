import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { AddAFileToTheBucketArgs, GenericStorageProvider } from '../storage.interface'
import { readFile } from 'node:fs/promises'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const crudFileTigris = (s3Fun: () => S3Client): GenericStorageProvider => {
  const s3 = s3Fun()
  const addAFileToTheBucket =
    (bucket: string) =>
    async ({ localFilepath, filename, mimetype }: AddAFileToTheBucketArgs): Promise<string> => {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        ContentType: mimetype,
        Body: await readFile(localFilepath)
      })

      await s3.send(command)
      return ''
    }

  const removeAFileInTheBucket =
    (bucket: string) =>
    async (filepath: string): Promise<void> => {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: filepath
      })

      await s3.send(command)
    }

  const getPresignedUrlForObject =
    (bucket: string) =>
    async (filepath: string, expiresIn = 3600): Promise<string> => {
      return await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: filepath }), {
        expiresIn
      })
    }

  return { addAFileToTheBucket, removeAFileInTheBucket, getPresignedUrlForObject }
}
