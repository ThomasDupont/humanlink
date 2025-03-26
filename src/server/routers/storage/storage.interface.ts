export type AddAFileToTheBucketArgs = {
  localFilepath: string
  filename: string
}

export type GenericStorageProvider = {
  addAFileToTheBucket: (bucket: string) => (args: AddAFileToTheBucketArgs) => Promise<string>
  removeAFileInTheBucket: (bucket: string) => (path: string) => Promise<void>
}
