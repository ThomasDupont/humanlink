import config from '@/config'
import DOMPurify from 'dompurify'

type DOMPurifyType = typeof DOMPurify
export const cleanHtmlTag =
  ({ sanitize }: DOMPurifyType) =>
  (input: string): string => {
    return sanitize(input, { ALLOWED_TAGS: config.authorizeHTMLTagForDescription })
  }

export const removeHtmlTags =
  ({ sanitize }: DOMPurifyType) =>
  (input: string): string => {
    return sanitize(input.replaceAll('&gt;', '').replaceAll('&lt;', '').replaceAll('<br>', ' '), {
      ALLOWED_TAGS: []
    })
  }
