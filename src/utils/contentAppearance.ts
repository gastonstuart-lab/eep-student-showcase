import type {
  ContentAccentStyle,
  ContentCtaStyle,
  ContentDisplayStyle,
  ContentImagePlacement,
  ContentItem,
  ContentItemInput,
  ContentTextAlignment,
  ContentWidth,
} from '../types'

export const contentDisplayStyles = ['standard', 'featured', 'compact', 'banner', 'media'] as const satisfies readonly ContentDisplayStyle[]
export const contentWidthOptions = ['normal', 'wide', 'full'] as const satisfies readonly ContentWidth[]
export const contentImagePlacements = ['top', 'left', 'right', 'background', 'hidden'] as const satisfies readonly ContentImagePlacement[]
export const contentTextAlignments = ['left', 'center'] as const satisfies readonly ContentTextAlignment[]
export const contentAccentStyles = ['none', 'eep', 'esl', 'warm', 'dark'] as const satisfies readonly ContentAccentStyle[]
export const contentCtaStyles = ['link', 'primary', 'secondary', 'hidden'] as const satisfies readonly ContentCtaStyle[]

export const contentAppearanceDefaults = {
  displayStyle: 'standard',
  contentWidth: 'normal',
  imagePlacement: 'top',
  textAlignment: 'left',
  accentStyle: 'none',
  ctaStyle: 'link',
} as const

export const contentDisplayStyleLabels: Record<ContentDisplayStyle, string> = {
  standard: 'Standard card',
  featured: 'Featured card',
  compact: 'Compact row',
  banner: 'Announcement banner',
  media: 'Media spotlight',
}

export const contentWidthLabels: Record<ContentWidth, string> = {
  normal: 'Normal',
  wide: 'Wide',
  full: 'Full width',
}

export const contentImagePlacementLabels: Record<ContentImagePlacement, string> = {
  top: 'Top',
  left: 'Left',
  right: 'Right',
  background: 'Background',
  hidden: 'Hidden',
}

export const contentTextAlignmentLabels: Record<ContentTextAlignment, string> = {
  left: 'Left',
  center: 'Centre',
}

export const contentAccentStyleLabels: Record<ContentAccentStyle, string> = {
  none: 'None',
  eep: 'EEP blue',
  esl: 'ESL green',
  warm: 'Warm highlight',
  dark: 'Neutral dark',
}

export const contentCtaStyleLabels: Record<ContentCtaStyle, string> = {
  link: 'Text link',
  primary: 'Primary button',
  secondary: 'Secondary button',
  hidden: 'Hidden',
}

const plainTextPattern = /^[^<>\r\n]*$/

function normalizeEnumValue<T extends string>(value: unknown, values: readonly T[], fallback: T): T {
  return typeof value === 'string' && values.includes(value as T) ? (value as T) : fallback
}

export function normalizeBadgeText(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return undefined
  }

  return trimmed.slice(0, 24)
}

export function validateBadgeText(value: unknown) {
  if (value == null || value === '') {
    return ''
  }

  if (typeof value !== 'string') {
    return 'Badge text must be plain text.'
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  if (trimmed.length > 24) {
    return 'Badge text must be 24 characters or fewer.'
  }

  if (!plainTextPattern.test(trimmed)) {
    return 'Badge text must be plain text.'
  }

  return ''
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

  const badgeError = validateBadgeText(input.badgeText)
  if (badgeError) {
    errors.push(badgeError)
  }

  return errors
}

export function sanitizeContentItemInput(contentItem: ContentItemInput): ContentItemInput {
  const appearance = normalizeContentAppearance(contentItem)

  return {
    ...contentItem,
    title: contentItem.title.trim(),
    summary: contentItem.summary.trim(),
    body: contentItem.body.trim(),
    mediaUrl: contentItem.mediaUrl.trim(),
    linkUrl: contentItem.linkUrl.trim(),
    eventDate: contentItem.eventDate.trim(),
    imageUrl: contentItem.imageUrl.trim(),
    createdBy: contentItem.createdBy.trim(),
    sortOrder: contentItem.sortOrder,
    ...appearance,
  }
}

export function contentItemPreviewFromInput(contentItem: ContentItemInput): ContentItem {
  const normalized = sanitizeContentItemInput(contentItem)

  return {
    id: 'preview',
    ...normalized,
    status: normalized.status,
    createdAt: undefined,
    updatedAt: undefined,
  }
}