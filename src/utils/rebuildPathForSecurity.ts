export const rebuildPathForSecurity = (userId: number, path: string): string => {
  const [_, filepath] = path.split('/')

  if (!filepath) {
    throw new Error(`path ${path} is wrong`)
  }

  return `${userId}/${filepath}`
}
