import config from '@/config'
import DOMPurify from 'dompurify'

export const cleanHtmlTag = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: config.authorizeHTMLTagForDescription })
}
