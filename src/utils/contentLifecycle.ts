import type {
  ContentExpiryAction,
  ContentItem,
  ContentItemInput,
  ContentLifecycleState,
  ContentPlacement,
  ContentTemplate,
} from '../types'

export const contentPlacements: readonly ContentPlacement[] = ['hero', 'announcement', 'featured', 'main', 'sidebar']
export const contentTemplates: readonly ContentTemplate[] = [
  'fullHero',
  'wideBanner',
  'largeFeature',
  'mediumCard',
  'smallTile',
  'imageLeft',
  'imageRight',
  'announcementStrip',
  'eventCard',
  'sidebarNotice',
]
export const contentExpiryActions: readonly ContentExpiryAction[] = ['hide', 'archive']

export const contentPlacementLabels: Record<ContentPlacement, string> = {
  hero: 'Main hero area',
  announcement: 'Announcement strip',
  featured: 'Featured content area',
  main: 'Main content grid',
  sidebar: 'Side panel',
}

export const contentTemplateLabels: Record<ContentTemplate, string> = {
  fullHero: 'Full-width hero',
  wideBanner: 'Wide feature banner',
  largeFeature: 'Large feature card',
  mediumCard: 'Medium card',
  smallTile: 'Small tile',
  imageLeft: 'Image left / text right',
  imageRight: 'Text left / image right',
  announcementStrip: 'Announcement strip',
  eventCard: 'Event card',
  sidebarNotice: 'Side-panel notice',
}

export const contentExpiryActionLabels: Record<ContentExpiryAction, string> = {
  hide: 'Hide after expiry',
  archive: 'Archive after expiry',
}

function parseDate(value?: string) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function contentLifecycleState(
  item: Pick<ContentItem, 'status' | 'publishDate' | 'expiryDate'>,
  now = new Date(),
): ContentLifecycleState {
  if (item.status === 'archived') return 'archived'
  if (item.status === 'hidden') return 'hidden'
  if (item.status === 'draft') return 'draft'

  const publishAt = parseDate(item.publishDate)
  const expiresAt = parseDate(item.expiryDate)

  if (publishAt && publishAt.getTime() > now.getTime()) return 'scheduled'
  if (expiresAt && expiresAt.getTime() <= now.getTime()) return 'expired'

  return 'live'
}

export function isPubliclyVisibleContent(
  item: Pick<ContentItem, 'status' | 'publishDate' | 'expiryDate'>,
  now = new Date(),
) {
  return contentLifecycleState(item, now) === 'live'
}

export function effectiveExpiredStatus(
  item: Pick<ContentItem, 'expiryAction'>,
): 'hidden' | 'archived' {
  return item.expiryAction === 'archive' ? 'archived' : 'hidden'
}

export function localizedContentText(
  item: Pick<ContentItem, 'title' | 'titleZh' | 'summary' | 'summaryZh' | 'body' | 'bodyZh' | 'badgeText' | 'badgeTextZh' | 'actionLabel' | 'actionLabelZh' | 'secondaryActionLabel' | 'secondaryActionLabelZh' | 'imageAlt' | 'imageAltZh'>,
  mode: 'en' | 'zh-Hant',
) {
  const zh = mode === 'zh-Hant'
  return {
    title: zh ? item.titleZh?.trim() || item.title : item.title,
    summary: zh ? item.summaryZh?.trim() || item.summary : item.summary,
    body: zh ? item.bodyZh?.trim() || item.body : item.body,
    badgeText: zh ? item.badgeTextZh?.trim() || item.badgeText : item.badgeText,
    actionLabel: zh ? item.actionLabelZh?.trim() || item.actionLabel : item.actionLabel,
    secondaryActionLabel: zh ? item.secondaryActionLabelZh?.trim() || item.secondaryActionLabel : item.secondaryActionLabel,
    imageAlt: zh ? item.imageAltZh?.trim() || item.imageAlt : item.imageAlt,
  }
}

export function normalizeContentLifecycleFields(input: Partial<ContentItemInput>) {
  const placement = contentPlacements.includes(input.placement as ContentPlacement)
    ? (input.placement as ContentPlacement)
    : 'main'
  const template = contentTemplates.includes(input.template as ContentTemplate)
    ? (input.template as ContentTemplate)
    : placement === 'hero'
      ? 'fullHero'
      : placement === 'announcement'
        ? 'announcementStrip'
        : placement === 'sidebar'
          ? 'sidebarNotice'
          : 'mediumCard'
  const expiryAction = contentExpiryActions.includes(input.expiryAction as ContentExpiryAction)
    ? (input.expiryAction as ContentExpiryAction)
    : 'hide'

  return { placement, template, expiryAction }
}
