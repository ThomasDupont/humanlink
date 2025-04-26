import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
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

      const { env } = await import('@/server/env')

      const tigrisBaseUrl = new URL(env.AWS_ENDPOINT_URL_S3)

      return `https://${bucket}.${tigrisBaseUrl.hostname}/${filename}`
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
    async (filepath: string, expiresIn?: number): Promise<string> => {
      return await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: filepath }), {
        expiresIn
      })
    }

  const getFileInfo = (bucket: string) => async (filepath: string) => {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: filepath
    })

    return await s3.send(command).then(resp => ({
      mimetype: resp.ContentType ?? null,
      size: resp.ContentLength ?? null,
      updatedAt: resp.LastModified ?? null
    }))
  }

  return { addAFileToTheBucket, removeAFileInTheBucket, getPresignedUrlForObject, getFileInfo }
}
