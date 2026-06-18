export type ContentDisplayStyle = 'standard' | 'featured' | 'compact' | 'banner' | 'media'
export type ContentWidth = 'normal' | 'wide' | 'full'
export type ContentImagePlacement = 'top' | 'left' | 'right' | 'background' | 'hidden'
export type ContentTextAlignment = 'left' | 'center'
export type ContentAccentStyle = 'none' | 'eep' | 'esl' | 'warm' | 'dark'
export type ContentCtaStyle = 'link' | 'primary' | 'secondary' | 'hidden'

export const contentDisplayStyles = ['standard', 'featured', 'compact', 'banner', 'media'] as const
export const contentWidthOptions = ['normal', 'wide', 'full'] as const
export const contentImagePlacements = ['top', 'left', 'right', 'background', 'hidden'] as const
export const contentTextAlignments = ['left', 'center'] as const
export const contentAccentStyles = ['none', 'eep', 'esl', 'warm', 'dark'] as const
export const contentCtaStyles = ['link', 'primary', 'secondary', 'hidden'] as const

export const contentAppearanceDefaults = {
  displayStyle: 'standard',
  contentWidth: 'normal',
  imagePlacement: 'top',
  textAlignment: 'left',
  accentStyle: 'none',
  ctaStyle: 'link',
} as const

const plainTextPattern = /^[^<>\r\n]*$/

function normalizeEnumValue<T extends string>(value: unknown, values: readonly T[], fallback: T): T {
  return typeof value === 'string' && values.includes(value as T) ? (value as T) : fallback
}

export function normalizeBadgeText(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()

  return trimmed ? trimmed.slice(0, 24) : undefined
}

export function validateContentAppearance(input: {
  displayStyle?: unknown
  contentWidth?: unknown
  imagePlacement?: unknown
  textAlignment?: unknown
  accentStyle?: unknown
  badgeText?: unknown
  ctaStyle?: unknown
}) {
  const errors: string[] = []

  if (!contentDisplayStyles.includes(input.displayStyle as ContentDisplayStyle)) {
    errors.push('Choose a valid display style.')
  }

  if (!contentWidthOptions.includes(input.contentWidth as ContentWidth)) {
    errors.push('Choose a valid content width.')
  }

  if (!contentImagePlacements.includes(input.imagePlacement as ContentImagePlacement)) {
    errors.push('Choose a valid image placement.')
  }

  if (!contentTextAlignments.includes(input.textAlignment as ContentTextAlignment)) {
    errors.push('Choose a valid text alignment.')
  }

  if (!contentAccentStyles.includes(input.accentStyle as ContentAccentStyle)) {
    errors.push('Choose a valid visual emphasis style.')
  }

  if (!contentCtaStyles.includes(input.ctaStyle as ContentCtaStyle)) {
    errors.push('Choose a valid call-to-action style.')
  }

  if (typeof input.badgeText === 'string' && input.badgeText.trim()) {
    const trimmed = input.badgeText.trim()

    if (trimmed.length > 24) {
      errors.push('Badge text must be 24 characters or fewer.')
    }

    if (!plainTextPattern.test(trimmed)) {
      errors.push('Badge text must be plain text.')
    }
  }

  return errors
}

export function normalizeContentAppearance(input: {
  displayStyle?: unknown
  contentWidth?: unknown
  imagePlacement?: unknown
  textAlignment?: unknown
  accentStyle?: unknown
  badgeText?: unknown
  ctaStyle?: unknown
}) {
  return {
    displayStyle: normalizeEnumValue(input.displayStyle, contentDisplayStyles, contentAppearanceDefaults.displayStyle),
    contentWidth: normalizeEnumValue(input.contentWidth, contentWidthOptions, contentAppearanceDefaults.contentWidth),
    imagePlacement: normalizeEnumValue(input.imagePlacement, contentImagePlacements, contentAppearanceDefaults.imagePlacement),
    textAlignment: normalizeEnumValue(input.textAlignment, contentTextAlignments, contentAppearanceDefaults.textAlignment),
    accentStyle: normalizeEnumValue(input.accentStyle, contentAccentStyles, contentAppearanceDefaults.accentStyle),
    badgeText: normalizeBadgeText(input.badgeText),
    ctaStyle: normalizeEnumValue(input.ctaStyle, contentCtaStyles, contentAppearanceDefaults.ctaStyle),
  }
}