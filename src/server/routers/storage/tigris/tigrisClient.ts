import { S3Client } from '@aws-sdk/client-s3'

export const S3Fun = () =>
  new S3Client({
    region: 'auto',
    endpoint: 'https://fly.storage.tigris.dev',
    forcePathStyle: false
  })
