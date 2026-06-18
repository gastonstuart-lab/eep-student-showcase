import type {
  ContentAccentStyle,
  ContentBackgroundStyle,
  ContentBadgeStyle,
  ContentCardShape,
  ContentCtaStyle,
  ContentDensity,
  ContentDisplayStyle,
  ContentImagePlacement,
  ContentImageRatio,
  ContentItem,
  ContentItemInput,
  ContentLayoutColumns,
  ContentTextAlignment,
  ContentWidth,
} from '../types'

export const contentDisplayStyles = ['standard', 'featured', 'compact', 'banner', 'media', 'photoStory', 'quickLink', 'eventCard', 'quote', 'minimal'] as const satisfies readonly ContentDisplayStyle[]
export const contentWidthOptions = ['small', 'medium', 'wide', 'full'] as const satisfies readonly ContentWidth[]
export const contentLayoutColumnOptions = ['auto', 'one', 'two', 'three'] as const satisfies readonly ContentLayoutColumns[]
export const contentImagePlacements = ['top', 'left', 'right', 'background', 'fullBleed', 'hidden'] as const satisfies readonly ContentImagePlacement[]
export const contentTextAlignments = ['left', 'center'] as const satisfies readonly ContentTextAlignment[]
export const contentAccentStyles = ['neutral', 'ied', 'eep', 'esl', 'warm', 'performance', 'science', 'social', 'dark'] as const satisfies readonly ContentAccentStyle[]
export const contentCtaStyles = ['link', 'primary', 'secondary', 'hidden'] as const satisfies readonly ContentCtaStyle[]
export const contentCardShapes = ['soft', 'standard', 'square', 'minimal'] as const satisfies readonly ContentCardShape[]
export const contentDensities = ['compact', 'comfortable', 'spacious'] as const satisfies readonly ContentDensity[]
export const contentImageRatios = ['landscape', 'square', 'portrait', 'banner'] as const satisfies readonly ContentImageRatio[]
export const contentBadgeStyles = ['subtle', 'solid', 'outline', 'none'] as const satisfies readonly ContentBadgeStyle[]
export const contentBackgroundStyles = ['plain', 'tint', 'gradient', 'image', 'darkOverlay'] as const satisfies readonly ContentBackgroundStyle[]

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

export const contentDisplayStyleLabels: Record<ContentDisplayStyle, string> = {
  standard: 'Standard',
  featured: 'Featured',
  compact: 'Compact',
  banner: 'Announcement',
  media: 'Media Spotlight',
  photoStory: 'Photo Story',
  quickLink: 'Quick Link',
  eventCard: 'Event Card',
  quote: 'Quote / Highlight',
  minimal: 'Minimal',
}

export const contentWidthLabels: Record<ContentWidth, string> = {
  small: 'Small',
  medium: 'Medium',
  wide: 'Wide',
  full: 'Full row',
}

export const contentLayoutColumnLabels: Record<ContentLayoutColumns, string> = {
  auto: 'Auto layout',
  one: 'One card per row',
  two: 'Two cards per row',
  three: 'Three cards per row',
}

export const contentImagePlacementLabels: Record<ContentImagePlacement, string> = {
  top: 'Top',
  left: 'Left',
  right: 'Right',
  background: 'Background',
  fullBleed: 'Full bleed',
  hidden: 'Hidden',
}

export const contentTextAlignmentLabels: Record<ContentTextAlignment, string> = {
  left: 'Left',
  center: 'Centre',
}

export const contentAccentStyleLabels: Record<ContentAccentStyle, string> = {
  neutral: 'Neutral',
  ied: 'IED Blue',
  eep: 'EEP blue',
  esl: 'ESL green',
  warm: 'Warm Gold',
  performance: 'Performance Purple',
  science: 'Science Teal',
  social: 'Social Studies Earth',
  dark: 'Dark Feature',
}

export const contentCtaStyleLabels: Record<ContentCtaStyle, string> = {
  link: 'Text link',
  primary: 'Primary button',
  secondary: 'Secondary button',
  hidden: 'Hidden',
}

export const contentCardShapeLabels: Record<ContentCardShape, string> = {
  soft: 'Soft rounded',
  standard: 'Standard rounded',
  square: 'Square',
  minimal: 'Minimal border',
}

export const contentDensityLabels: Record<ContentDensity, string> = {
  compact: 'Compact',
  comfortable: 'Comfortable',
  spacious: 'Spacious',
}

export const contentImageRatioLabels: Record<ContentImageRatio, string> = {
  landscape: 'Landscape',
  square: 'Square',
  portrait: 'Portrait',
  banner: 'Banner',
}

export const contentBadgeStyleLabels: Record<ContentBadgeStyle, string> = {
  subtle: 'Subtle',
  solid: 'Solid',
  outline: 'Outline',
  none: 'None',
}

export const contentBackgroundStyleLabels: Record<ContentBackgroundStyle, string> = {
  plain: 'Plain',
  tint: 'Soft tint',
  gradient: 'Gradient',
  image: 'Image background',
  darkOverlay: 'Dark overlay',
}

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
    publishDate: contentItem.publishDate?.trim(),
    expiryDate: contentItem.expiryDate?.trim(),
    imageAlt: contentItem.imageAlt?.trim(),
    thumbnailUrl: contentItem.thumbnailUrl?.trim(),
    actionLabel: contentItem.actionLabel?.trim(),
    actionUrl: contentItem.actionUrl?.trim(),
    secondaryActionLabel: contentItem.secondaryActionLabel?.trim(),
    secondaryActionUrl: contentItem.secondaryActionUrl?.trim(),
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
