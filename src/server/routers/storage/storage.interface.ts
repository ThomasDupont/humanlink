export type AddAFileToTheBucketArgs = {
  localFilepath: string
  filename: string
  mimetype: string
}

export type FileInfo = {
  mimetype: string | null
  size: number | null
  updatedAt: Date | null
}

export type GenericStorageProvider = {
  addAFileToTheBucket: (bucket: string) => (args: AddAFileToTheBucketArgs) => Promise<string>
  removeAFileInTheBucket: (bucket: string) => (path: string) => Promise<void>
  getPresignedUrlForObject: (
    bucket: string
  ) => (path: string, expiresIn?: number) => Promise<string>
  getFileInfo: (bucket: string) => (path: string) => Promise<FileInfo>
}
