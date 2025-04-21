import { describe, expect, it } from 'vitest'
import { convertHtmlToMarkdown } from './convertHtmlToMarkdown'

describe('convertHtmlToMarkdown', () => {
  it('should convert HTML to Markdown', () => {
    const html = '<h1>Hello World</h1><p>This is a test.</p>'
    const expectedMarkdown = `# Hello World

This is a test.`

    const result = convertHtmlToMarkdown(html)

    expect(result).toBe(expectedMarkdown)
  })
})
