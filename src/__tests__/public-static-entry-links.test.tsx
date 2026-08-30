import { describe, expect, it } from 'vitest'
import { isStaticDocumentTarget } from '../components/public/staticDocumentTarget'

describe('public static entry links', () => {
  it('identifies html entry points that must bypass SPA routing', () => {
    expect(isStaticDocumentTarget('/science-lessons.html')).toBe(true)
    expect(isStaticDocumentTarget('/science-lessons.html?courseware=1')).toBe(true)
    expect(isStaticDocumentTarget('/science-lessons.html#opening')).toBe(true)
    expect(isStaticDocumentTarget('/esl/science')).toBe(false)
    expect(isStaticDocumentTarget('https://example.com/science-lessons.html')).toBe(true)
  })
})
