import { describe, expect, it } from 'vitest'
import DOMPurify from 'dompurify'
import { cleanHtmlTag } from './cleanHtmlTag'

describe('cleanHtmlTag test', () => {
  it('Should remove <script> tag', () => {
    const xss = `<p>blabla</p><script>alert('spawned')</script>`

    expect(cleanHtmlTag(DOMPurify())(xss)).equals(`<p>blabla</p>`)
  })

  it('Should remove <pre> tag', () => {
    const xss = `<p>blabla</p><pre>alert('spawned')</pre>`

    expect(cleanHtmlTag(DOMPurify())(xss)).equals(`<p>blabla</p>alert('spawned')`)
  })
})
