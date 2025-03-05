import config from '@/config'
import DOMPurify from 'dompurify'

type DOMPurifyType = typeof DOMPurify
export const cleanHtmlTag =
  ({ sanitize }: DOMPurifyType) =>
  (input: string): string => {
    return sanitize(input, { ALLOWED_TAGS: config.authorizeHTMLTagForDescription })
  }
