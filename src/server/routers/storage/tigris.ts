import { AddAFileToTheBucketArgs } from "./storage.interface"

export const crudFileTigris = () => {
    const addAFileToTheBucket = ({
        filepath,
        filename
    }: AddAFileToTheBucketArgs): Promise<string> => {
        return Promise.resolve(filepath + filename)
    }

    const removeAFileInTheBucket = (_: string): Promise<void> => {
        return Promise.resolve()
    }

    return { addAFileToTheBucket, removeAFileInTheBucket }
}