import { ZodType } from 'zod'

export const useCheckUrl = <T>(codec: ZodType<T>) => {
  const validateUrlParam = (pathname: string) => {
    return codec.safeParse(pathname.split('/'))
  }

  return { validateUrlParam }
}
