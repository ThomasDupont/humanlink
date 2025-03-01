/* eslint-disable @typescript-eslint/no-explicit-any */
export type PatternMatching<Kind extends Record<string, (...args: any[]) => any>> = {
  [K in keyof Kind]: (...arg: Parameters<Kind[K]>) => ReturnType<Kind[K]>
}
