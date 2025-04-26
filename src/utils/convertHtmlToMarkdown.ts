import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from 'node-html-markdown'

export const convertHtmlToMarkdown = (html: string, options?: NodeHtmlMarkdownOptions): string => {
  const nodeHtmlMarkdown = new NodeHtmlMarkdown(options)
  return nodeHtmlMarkdown.translate(html)
}
