import type { EffectiveAdmin } from '../../../auth'
import { hubConfigs, type HubConfig } from '../../../hubs'
import type { ContentItem, ContentItemInput, ContentStatus, ContentType } from '../../../types'
import { canCreateContentForAdmin, canEditContentForAdmin, canPublishContentForAdmin } from '../../../utils/authorization'
import { contentAppearanceDefaults } from '../../../utils/contentAppearance'

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
  icon: string
  title: string
  help: string
}> = [
  { type: 'announcement', icon: 'A', title: 'Announcement', help: 'Share reminders, notices, or programme updates.' },
  { type: 'event', icon: 'E', title: 'Event', help: 'Promote an upcoming activity, deadline, or school event.' },
  { type: 'studentWork', icon: 'S', title: 'Student Achievement', help: 'Celebrate a project, publication, performance, or learning win.' },
  { type: 'video', icon: 'G', title: 'Gallery', help: 'Feature a media-led story, video, or visual collection.' },
  { type: 'resource', icon: 'P', title: 'Page / Resource', help: 'Share a guide, worksheet, page, or learning resource.' },
  { type: 'link', icon: 'N', title: 'News / Article', help: 'Link visitors to a longer story or trusted article.' },
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
    summary: '',
    body: '',
    type: 'announcement',
    department: config.department,
    sectionId: config.sectionId,
    sectionName: config.sectionName,
    status: 'draft',
    featured: false,
    mediaUrl: '',
    linkUrl: '',
    eventDate: '',
    imageUrl: '',
    ...contentAppearanceDefaults,
    badgeText: '',
    createdBy: userEmail,
    sortOrder: undefined,
    publishDate: '',
    expiryDate: '',
    actionLabel: '',
    actionUrl: '',
    actionStyle: 'primary',
    actionNewTab: true,
    secondaryActionLabel: '',
    secondaryActionUrl: '',
    secondaryActionStyle: 'secondary',
    secondaryActionNewTab: true,
    imageAlt: '',
    thumbnailUrl: '',
    hideImage: false,
    pinned: false,
  }
}

export function draftFromContentItem(item: ContentItem, userEmail: string): ContentItemInput {
  return {
    ...item,
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
      ? { displayStyle: 'eventCard', badgeText: 'Event', actionLabel: draft.actionLabel || 'View Details' }
      : type === 'video'
        ? { displayStyle: 'media', badgeText: 'Video', actionLabel: draft.actionLabel || 'Watch Video' }
        : type === 'resource'
          ? { displayStyle: 'quickLink', badgeText: 'Resource', actionLabel: draft.actionLabel || 'Open Resource' }
          : type === 'studentWork'
            ? { displayStyle: 'featured', badgeText: 'Student work', actionLabel: draft.actionLabel || 'View Work' }
            : type === 'link'
              ? { displayStyle: 'quickLink', badgeText: 'Link', actionLabel: draft.actionLabel || 'Visit Website' }
              : { displayStyle: 'banner', badgeText: 'Update', actionLabel: draft.actionLabel || 'Learn More' }

  return { ...draft, ...defaults, type }
}

export function buildWizardPayload(draft: ContentItemInput, destination: HubConfig, status: PublishingChoice, contentCount: number): ContentItemInput {
  const publishDate = status === 'scheduled' ? draft.publishDate : ''
  const eventDate = draft.type === 'event' ? draft.eventDate : draft.eventDate
  const primaryUrl = draft.actionUrl || draft.linkUrl || draft.mediaUrl

  return {
    ...draft,
    department: destination.department,
    sectionId: destination.sectionId,
    sectionName: destination.sectionName,
    status,
    publishDate,
    eventDate,
    sortOrder: draft.sortOrder ?? contentCount + 1,
    ctaStyle: draft.actionStyle ?? draft.ctaStyle,
    linkUrl: draft.type === 'link' || draft.type === 'resource' ? (draft.linkUrl || draft.actionUrl || '') : draft.linkUrl,
    mediaUrl: draft.type === 'video' ? draft.mediaUrl : draft.mediaUrl,
    actionUrl: primaryUrl,
  }
}
