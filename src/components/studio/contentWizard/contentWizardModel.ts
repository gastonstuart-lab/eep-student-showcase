import type { EffectiveAdmin } from '../../../auth'
import { hubConfigs, type HubConfig } from '../../../hubs'
import type { ContentItem, ContentItemInput, ContentStatus, ContentType } from '../../../types'
import { canCreateContentForAdmin, canEditContentForAdmin, canPublishContentForAdmin } from '../../../utils/authorization'
import { contentAppearanceDefaults } from '../../../utils/contentAppearance'
import { normalizeContentLifecycleFields } from '../../../utils/contentLifecycle'

export const contentWizardSteps = ['type', 'essentials', 'media', 'publishing', 'review', 'success'] as const
export type ContentWizardStep = typeof contentWizardSteps[number]

export const contentWizardStepLabels: Record<ContentWizardStep, string> = {
  type: 'Content Type',
  essentials: 'Essentials',
  media: 'Media',
  publishing: 'Placement & Publishing',
  review: 'Review',
  success: 'Success',
}

export const contentTypeOptions: Array<{
  type: ContentType
  title: string
  help: string
}> = [
  { type: 'announcement', title: 'Announcement', help: 'Share reminders or programme updates.' },
  { type: 'event', title: 'Event', help: 'Promote activities and deadlines.' },
  { type: 'studentWork', title: 'Student Achievement', help: 'Celebrate projects or learning wins.' },
  { type: 'video', title: 'Gallery', help: 'Feature video or visual collections.' },
  { type: 'resource', title: 'Page / Resource', help: 'Share guides, worksheets, or pages.' },
  { type: 'link', title: 'News / Article', help: 'Link to a longer story or article.' },
]

export const contentTypeLabels = Object.fromEntries(contentTypeOptions.map((option) => [option.type, option.title])) as Record<ContentType, string>

export type PublishingChoice = 'draft' | 'published' | 'scheduled'

export interface WizardSaveResult {
  id: string
  title: string
  sectionName: string
  status: ContentStatus
  publishDate?: string
}

export function defaultDraftFor(config: HubConfig, userEmail: string): ContentItemInput {
  return {
    title: '',
    titleZh: '',
    summary: '',
    summaryZh: '',
    body: '',
    bodyZh: '',
    type: 'announcement',
    department: config.department,
    sectionId: config.sectionId,
    sectionName: config.sectionName,
    status: 'draft',
    featured: false,
    placement: 'main',
    template: 'mediumCard',
    expiryAction: 'hide',
    mediaUrl: '',
    linkUrl: '',
    eventDate: '',
    imageUrl: '',
    ...contentAppearanceDefaults,
    badgeText: '',
    badgeTextZh: '',
    createdBy: userEmail,
    sortOrder: undefined,
    publishDate: '',
    expiryDate: '',
    actionLabel: '',
    actionLabelZh: '',
    actionUrl: '',
    actionStyle: 'primary',
    actionNewTab: true,
    secondaryActionLabel: '',
    secondaryActionLabelZh: '',
    secondaryActionUrl: '',
    secondaryActionStyle: 'secondary',
    secondaryActionNewTab: true,
    imageAlt: '',
    imageAltZh: '',
    thumbnailUrl: '',
    hideImage: false,
    pinned: false,
  }
}

export function draftFromContentItem(item: ContentItem, userEmail: string): ContentItemInput {
  return {
    ...item,
    titleZh: item.titleZh ?? '',
    summaryZh: item.summaryZh ?? '',
    bodyZh: item.bodyZh ?? '',
    badgeTextZh: item.badgeTextZh ?? '',
    actionLabelZh: item.actionLabelZh ?? '',
    secondaryActionLabelZh: item.secondaryActionLabelZh ?? '',
    imageAltZh: item.imageAltZh ?? '',
    ...normalizeContentLifecycleFields(item),
    layoutColumns: item.layoutColumns ?? contentAppearanceDefaults.layoutColumns,
    cardShape: item.cardShape ?? contentAppearanceDefaults.cardShape,
    contentDensity: item.contentDensity ?? contentAppearanceDefaults.contentDensity,
    imageRatio: item.imageRatio ?? contentAppearanceDefaults.imageRatio,
    badgeStyle: item.badgeStyle ?? contentAppearanceDefaults.badgeStyle,
    backgroundStyle: item.backgroundStyle ?? contentAppearanceDefaults.backgroundStyle,
    badgeText: item.badgeText ?? '',
    createdBy: item.createdBy || userEmail,
    publishDate: item.publishDate ?? '',
    expiryDate: item.expiryDate ?? '',
    actionLabel: item.actionLabel ?? '',
    actionUrl: item.actionUrl ?? '',
    actionStyle: item.actionStyle ?? item.ctaStyle,
    actionNewTab: item.actionNewTab ?? true,
    secondaryActionLabel: item.secondaryActionLabel ?? '',
    secondaryActionUrl: item.secondaryActionUrl ?? '',
    secondaryActionStyle: item.secondaryActionStyle ?? 'secondary',
    secondaryActionNewTab: item.secondaryActionNewTab ?? true,
    imageAlt: item.imageAlt ?? '',
    thumbnailUrl: item.thumbnailUrl ?? '',
    hideImage: item.hideImage ?? false,
    pinned: item.pinned ?? false,
  }
}

export function getCreatableHubConfigs(admin: EffectiveAdmin | null, configs = hubConfigs) {
  return configs.filter((config) => canCreateContentForAdmin(admin, config.sectionId))
}

export function getEditableHubConfigs(admin: EffectiveAdmin | null, configs = hubConfigs) {
  return configs.filter((config) => canEditContentForAdmin(admin, config.sectionId))
}

export function canEditContentItem(admin: EffectiveAdmin | null, item: ContentItem | undefined) {
  return Boolean(item && canEditContentForAdmin(admin, item.sectionId))
}

export function canPublishForDraft(admin: EffectiveAdmin | null, draft: ContentItemInput) {
  return canPublishContentForAdmin(admin, draft.sectionId)
}

export function recoveryKey(userId: string, sectionId: string, editingId?: string | null) {
  return `ied-content-wizard:${userId || 'anonymous'}:${sectionId}:${editingId ?? 'new'}`
}

export function publishingChoiceForDraft(draft: ContentItemInput): PublishingChoice {
  if (draft.status === 'published') return 'published'
  if (draft.status === 'scheduled') return 'scheduled'
  return 'draft'
}

export function applyTypeDefaults(draft: ContentItemInput, type: ContentType): ContentItemInput {
  const defaults: Partial<ContentItemInput> =
    type === 'event'
      ? { placement: 'featured', template: 'eventCard', displayStyle: 'eventCard', contentWidth: 'medium', badgeText: 'Event', actionLabel: draft.actionLabel || 'View Details' }
      : type === 'video'
        ? { placement: 'featured', template: 'largeFeature', displayStyle: 'media', contentWidth: 'wide', badgeText: 'Video', actionLabel: draft.actionLabel || 'Watch Video' }
        : type === 'resource'
          ? { placement: 'main', template: 'smallTile', displayStyle: 'quickLink', contentWidth: 'small', badgeText: 'Resource', actionLabel: draft.actionLabel || 'Open Resource' }
          : type === 'studentWork'
            ? { placement: 'featured', template: 'largeFeature', displayStyle: 'featured', contentWidth: 'wide', badgeText: 'Student work', actionLabel: draft.actionLabel || 'View Work' }
            : type === 'link'
              ? { placement: 'main', template: 'mediumCard', displayStyle: 'quickLink', contentWidth: 'medium', badgeText: 'Link', actionLabel: draft.actionLabel || 'Visit Website' }
              : { placement: 'announcement', template: 'announcementStrip', displayStyle: 'banner', contentWidth: 'full', badgeText: 'Update', actionLabel: draft.actionLabel || 'Learn More' }

  return { ...draft, ...defaults, type }
}

export function buildWizardPayload(draft: ContentItemInput, destination: HubConfig, status: PublishingChoice, contentCount: number): ContentItemInput {
  const publishDate = status === 'scheduled' ? draft.publishDate : status === 'published' ? draft.publishDate : ''
  const primaryUrl = draft.actionUrl || draft.linkUrl || draft.mediaUrl

  return {
    ...draft,
    ...normalizeContentLifecycleFields(draft),
    department: destination.department,
    sectionId: destination.sectionId,
    sectionName: destination.sectionName,
    status,
    publishDate,
    sortOrder: draft.sortOrder ?? contentCount + 1,
    ctaStyle: draft.actionStyle ?? draft.ctaStyle,
    linkUrl: draft.type === 'link' || draft.type === 'resource' ? (draft.linkUrl || draft.actionUrl || '') : draft.linkUrl,
    actionUrl: primaryUrl,
  }
}
