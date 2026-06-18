import { describe, expect, it } from 'vitest'
import {
  contentAppearanceDefaults,
  normalizeContentAppearance,
  validateContentAppearance,
} from './contentValidation.js'

describe('contentValidation', () => {
  it('defaults legacy content safely', () => {
    expect(normalizeContentAppearance({})).toEqual(contentAppearanceDefaults)
  })

  it('accepts valid appearance values and rejects invalid badge text', () => {
    expect(
      validateContentAppearance({
        displayStyle: 'media',
        contentWidth: 'wide',
        layoutColumns: 'two',
        imagePlacement: 'right',
        textAlignment: 'center',
        accentStyle: 'esl',
        badgeText: 'Event',
        ctaStyle: 'secondary',
        cardShape: 'soft',
        contentDensity: 'compact',
        imageRatio: 'banner',
        badgeStyle: 'outline',
        backgroundStyle: 'gradient',
      }),
    ).toEqual([])

    expect(validateContentAppearance({ badgeText: 'x'.repeat(25) })).toContain('Badge text must be 24 characters or fewer.')
  })
})
