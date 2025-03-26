export type AddAFileToTheBucketArgs = {
  localFilepath: string
  filename: string
  mimetype: string
}

export type GenericStorageProvider = {
  addAFileToTheBucket: (bucket: string) => (args: AddAFileToTheBucketArgs) => Promise<string>
  removeAFileInTheBucket: (bucket: string) => (path: string) => Promise<void>
  getPresignedUrlForObject: (
    bucket: string
  ) => (path: string, expiresIn?: number) => Promise<string>
}
