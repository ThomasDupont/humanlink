export class FormError extends Error {
  constructor(
    message: string,
    public tag: string
  ) {
    super(message)
  }
  static of = (tag: string) => (e: Error) => new FormError(e.message, tag)
}
