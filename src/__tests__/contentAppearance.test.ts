import { describe, expect, it } from 'vitest'
import {
  contentAppearanceDefaults,
  normalizeContentAppearance,
  sanitizeContentItemInput,
  validateContentAppearance,
} from '../utils/contentAppearance'
import type { ContentItemInput } from '../types'

const baseDraft: ContentItemInput = {
  title: 'Student Spotlight',
  summary: 'A calm, public-facing summary.',
  body: 'A little more detail for the item body.',
  type: 'announcement',
  department: 'ESL',
  sectionId: 'esl-science',
  sectionName: 'Science',
  status: 'draft',
  featured: false,
  mediaUrl: '',
  linkUrl: 'https://example.com',
  eventDate: '',
  imageUrl: '',
  displayStyle: 'standard',
  contentWidth: 'medium',
  imagePlacement: 'top',
  textAlignment: 'left',
  accentStyle: 'neutral',
  badgeText: '',
  ctaStyle: 'link',
  createdBy: 'teacher@example.com',
}

describe('content appearance helpers', () => {
  it('applies safe defaults to legacy content without appearance fields', () => {
    expect(normalizeContentAppearance({})).toEqual(contentAppearanceDefaults)
  })

  it('accepts each allowed enum value', () => {
    expect(
      validateContentAppearance({
        displayStyle: 'featured',
        contentWidth: 'full',
        layoutColumns: 'two',
        imagePlacement: 'background',
        textAlignment: 'center',
        accentStyle: 'warm',
        badgeText: 'New',
        ctaStyle: 'primary',
        cardShape: 'soft',
        contentDensity: 'compact',
        imageRatio: 'banner',
        badgeStyle: 'solid',
        backgroundStyle: 'gradient',
      }),
    ).toEqual([])
  })

  it('normalises invalid enum values back to safe defaults', () => {
    expect(
      normalizeContentAppearance({
        displayStyle: 'unexpected',
        contentWidth: 'huge',
        imagePlacement: 'floating',
        textAlignment: 'justify',
        accentStyle: 'purple',
        ctaStyle: 'ghost',
      }),
    ).toEqual(contentAppearanceDefaults)
  })

  it('enforces badge length and plain text rules', () => {
    expect(validateContentAppearance({ badgeText: 'x'.repeat(25) })).toContain('Badge text must be 24 characters or fewer.')
    expect(validateContentAppearance({ badgeText: 'Bad\nBadge' })).toContain('Badge text must be plain text.')
  })

  it('trims and strips blank optional badge values when sanitising a draft', () => {
    expect(sanitizeContentItemInput({ ...baseDraft, badgeText: '  New  ' }).badgeText).toBe('New')
  })
})
