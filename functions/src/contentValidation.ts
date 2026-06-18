export type ContentDisplayStyle = 'standard' | 'featured' | 'compact' | 'banner' | 'media' | 'photoStory' | 'quickLink' | 'eventCard' | 'quote' | 'minimal'
export type ContentWidth = 'small' | 'medium' | 'wide' | 'full'
export type ContentLayoutColumns = 'auto' | 'one' | 'two' | 'three'
export type ContentImagePlacement = 'top' | 'left' | 'right' | 'background' | 'fullBleed' | 'hidden'
export type ContentTextAlignment = 'left' | 'center'
export type ContentAccentStyle = 'neutral' | 'ied' | 'eep' | 'esl' | 'warm' | 'performance' | 'science' | 'social' | 'dark'
export type ContentCtaStyle = 'link' | 'primary' | 'secondary' | 'hidden'
export type ContentCardShape = 'soft' | 'standard' | 'square' | 'minimal'
export type ContentDensity = 'compact' | 'comfortable' | 'spacious'
export type ContentImageRatio = 'landscape' | 'square' | 'portrait' | 'banner'
export type ContentBadgeStyle = 'subtle' | 'solid' | 'outline' | 'none'
export type ContentBackgroundStyle = 'plain' | 'tint' | 'gradient' | 'image' | 'darkOverlay'

export const contentDisplayStyles = ['standard', 'featured', 'compact', 'banner', 'media', 'photoStory', 'quickLink', 'eventCard', 'quote', 'minimal'] as const
export const contentWidthOptions = ['small', 'medium', 'wide', 'full'] as const
export const contentLayoutColumnOptions = ['auto', 'one', 'two', 'three'] as const
export const contentImagePlacements = ['top', 'left', 'right', 'background', 'fullBleed', 'hidden'] as const
export const contentTextAlignments = ['left', 'center'] as const
export const contentAccentStyles = ['neutral', 'ied', 'eep', 'esl', 'warm', 'performance', 'science', 'social', 'dark'] as const
export const contentCtaStyles = ['link', 'primary', 'secondary', 'hidden'] as const
export const contentCardShapes = ['soft', 'standard', 'square', 'minimal'] as const
export const contentDensities = ['compact', 'comfortable', 'spacious'] as const
export const contentImageRatios = ['landscape', 'square', 'portrait', 'banner'] as const
export const contentBadgeStyles = ['subtle', 'solid', 'outline', 'none'] as const
export const contentBackgroundStyles = ['plain', 'tint', 'gradient', 'image', 'darkOverlay'] as const

export const contentAppearanceDefaults = {
  displayStyle: 'standard',
  contentWidth: 'medium',
  layoutColumns: 'auto',
  imagePlacement: 'top',
  textAlignment: 'left',
  accentStyle: 'neutral',
  ctaStyle: 'link',
  cardShape: 'standard',
  contentDensity: 'comfortable',
  imageRatio: 'landscape',
  badgeStyle: 'subtle',
  backgroundStyle: 'plain',
} as const

const plainTextPattern = /^[^<>\r\n]*$/

function normalizeEnumValue<T extends string>(value: unknown, values: readonly T[], fallback: T): T {
  return typeof value === 'string' && values.includes(value as T) ? (value as T) : fallback
}

function normalizeWidthValue(value: unknown): ContentWidth {
  return value === 'normal' ? 'medium' : normalizeEnumValue(value, contentWidthOptions, contentAppearanceDefaults.contentWidth)
}

function normalizeAccentValue(value: unknown): ContentAccentStyle {
  return value === 'none' ? 'neutral' : normalizeEnumValue(value, contentAccentStyles, contentAppearanceDefaults.accentStyle)
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
  layoutColumns?: unknown
  imagePlacement?: unknown
  textAlignment?: unknown
  accentStyle?: unknown
  badgeText?: unknown
  ctaStyle?: unknown
  cardShape?: unknown
  contentDensity?: unknown
  imageRatio?: unknown
  badgeStyle?: unknown
  backgroundStyle?: unknown
}) {
  const errors: string[] = []

  if (!contentDisplayStyles.includes(input.displayStyle as ContentDisplayStyle)) {
    errors.push('Choose a valid display style.')
  }

  if (!contentWidthOptions.includes(input.contentWidth as ContentWidth)) {
    errors.push('Choose a valid content width.')
  }

  if (!contentLayoutColumnOptions.includes(input.layoutColumns as ContentLayoutColumns)) {
    errors.push('Choose a valid layout column option.')
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

  if (!contentCardShapes.includes(input.cardShape as ContentCardShape)) {
    errors.push('Choose a valid card shape.')
  }

  if (!contentDensities.includes(input.contentDensity as ContentDensity)) {
    errors.push('Choose a valid visual density.')
  }

  if (!contentImageRatios.includes(input.imageRatio as ContentImageRatio)) {
    errors.push('Choose a valid image ratio.')
  }

  if (!contentBadgeStyles.includes(input.badgeStyle as ContentBadgeStyle)) {
    errors.push('Choose a valid badge style.')
  }

  if (!contentBackgroundStyles.includes(input.backgroundStyle as ContentBackgroundStyle)) {
    errors.push('Choose a valid background treatment.')
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
  layoutColumns?: unknown
  imagePlacement?: unknown
  textAlignment?: unknown
  accentStyle?: unknown
  badgeText?: unknown
  ctaStyle?: unknown
  cardShape?: unknown
  contentDensity?: unknown
  imageRatio?: unknown
  badgeStyle?: unknown
  backgroundStyle?: unknown
}) {
  return {
    displayStyle: normalizeEnumValue(input.displayStyle, contentDisplayStyles, contentAppearanceDefaults.displayStyle),
    contentWidth: normalizeWidthValue(input.contentWidth),
    layoutColumns: normalizeEnumValue(input.layoutColumns, contentLayoutColumnOptions, contentAppearanceDefaults.layoutColumns),
    imagePlacement: normalizeEnumValue(input.imagePlacement, contentImagePlacements, contentAppearanceDefaults.imagePlacement),
    textAlignment: normalizeEnumValue(input.textAlignment, contentTextAlignments, contentAppearanceDefaults.textAlignment),
    accentStyle: normalizeAccentValue(input.accentStyle),
    badgeText: normalizeBadgeText(input.badgeText),
    ctaStyle: normalizeEnumValue(input.ctaStyle, contentCtaStyles, contentAppearanceDefaults.ctaStyle),
    cardShape: normalizeEnumValue(input.cardShape, contentCardShapes, contentAppearanceDefaults.cardShape),
    contentDensity: normalizeEnumValue(input.contentDensity, contentDensities, contentAppearanceDefaults.contentDensity),
    imageRatio: normalizeEnumValue(input.imageRatio, contentImageRatios, contentAppearanceDefaults.imageRatio),
    badgeStyle: normalizeEnumValue(input.badgeStyle, contentBadgeStyles, contentAppearanceDefaults.badgeStyle),
    backgroundStyle: normalizeEnumValue(input.backgroundStyle, contentBackgroundStyles, contentAppearanceDefaults.backgroundStyle),
  }
}
