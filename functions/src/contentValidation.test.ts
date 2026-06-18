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
        imagePlacement: 'right',
        textAlignment: 'center',
        accentStyle: 'esl',
        badgeText: 'Event',
        ctaStyle: 'secondary',
      }),
    ).toEqual([])

    expect(validateContentAppearance({ badgeText: 'x'.repeat(25) })).toContain('Badge text must be 24 characters or fewer.')
  })
})