import type { Timestamp } from 'firebase/firestore'

export type ProjectStatus = 'pending' | 'approved' | 'rejected' | 'hidden'
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'hidden' | 'archived'
export type ContentLifecycleState = 'draft' | 'scheduled' | 'live' | 'expired' | 'hidden' | 'archived'
export type ContentType = 'announcement' | 'event' | 'video' | 'resource' | 'studentWork' | 'link'
export type ContentPlacement = 'hero' | 'announcement' | 'featured' | 'main' | 'sidebar'
export type ContentTemplate =
  | 'fullHero'
  | 'wideBanner'
  | 'largeFeature'
  | 'mediumCard'
  | 'smallTile'
  | 'imageLeft'
  | 'imageRight'
  | 'announcementStrip'
  | 'eventCard'
  | 'sidebarNotice'
export type ContentExpiryAction = 'hide' | 'archive'
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
export type Department = 'IED' | 'EEP' | 'ESL'
export type AdminRole = 'superAdmin' | 'admin' | 'editor'

export interface StaffPermissions {
  manageUsers: boolean
  manageProjects: boolean
  manageHubSettings: boolean
  createContent: boolean
  editContent: boolean
  publishContent: boolean
  deleteContent: boolean
  viewAuditLog: boolean
}

export type ProjectCategory =
  | 'Local Businesses'
  | 'School Clubs'
  | 'Travel & Food Guides'
  | 'Student Help'
  | 'Campaigns'
  | 'Creative Projects'

export interface Project {
  id: string
  title: string
  groupName: string
  className: string
  members: string
  category: ProjectCategory
  description: string
  audience: string
  impact: string
  googleSitesUrl: string
  imageUrl: string
  status: ProjectStatus
  featured: boolean
  studentPick: boolean
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>

export interface ContentItem {
  id: string
  title: string
  titleZh?: string
  summary: string
  summaryZh?: string
  body: string
  bodyZh?: string
  type: ContentType
  department: Department
  sectionId: string
  sectionName: string
  status: ContentStatus
  featured: boolean
  placement: ContentPlacement
  template: ContentTemplate
  expiryAction: ContentExpiryAction
  mediaUrl: string
  linkUrl: string
  eventDate: string
  imageUrl: string
  displayStyle: ContentDisplayStyle
  contentWidth: ContentWidth
  imagePlacement: ContentImagePlacement
  textAlignment: ContentTextAlignment
  accentStyle: ContentAccentStyle
  badgeText?: string
  badgeTextZh?: string
  ctaStyle: ContentCtaStyle
  layoutColumns?: ContentLayoutColumns
  cardShape?: ContentCardShape
  contentDensity?: ContentDensity
  imageRatio?: ContentImageRatio
  badgeStyle?: ContentBadgeStyle
  backgroundStyle?: ContentBackgroundStyle
  publishDate?: string
  expiryDate?: string
  actionLabel?: string
  actionLabelZh?: string
  actionUrl?: string
  actionStyle?: ContentCtaStyle
  actionNewTab?: boolean
  secondaryActionLabel?: string
  secondaryActionLabelZh?: string
  secondaryActionUrl?: string
  secondaryActionStyle?: ContentCtaStyle
  secondaryActionNewTab?: boolean
  imageAlt?: string
  imageAltZh?: string
  thumbnailUrl?: string
  hideImage?: boolean
  pinned?: boolean
  createdBy: string
  sortOrder?: number
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type ContentItemInput = Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>

export interface HubPage {
  id: string
  sectionId: string
  title: string
  subtitle: string
  intro: string
  description: string
  heroImageUrl: string
  accent: string
  parentSectionId: string
  childSectionIds: string[]
  primaryButtonText: string
  primaryButtonUrl: string
  secondaryButtonText: string
  secondaryButtonUrl: string
  featured: boolean
  updatedAt?: Timestamp
}

export type HubPageInput = Omit<HubPage, 'id' | 'updatedAt'>

export interface AdminUser {
  id: string
  email: string
  username: string
  normalizedUsername: string
  authEmail: string
  contactEmail: string
  displayName: string
  role: AdminRole
  active: boolean
  protectedOwner: boolean
  mustChangePassword: boolean
  allowedSectionIds: string[]
  permissions: StaffPermissions
  createdBy: string
  updatedBy: string
  lastPasswordResetAt?: Timestamp
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type AdminUserInput = Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>

export interface AuditLogEntry {
  id: string
  action: string
  actorUid: string
  actorUsername: string
  actorDisplayName: string
  targetType: string
  targetId: string
  targetLabel: string
  summary: Record<string, unknown>
  createdAt?: Timestamp
}

export const categories: ProjectCategory[] = [
  'Local Businesses',
  'School Clubs',
  'Travel & Food Guides',
  'Student Help',
  'Campaigns',
  'Creative Projects',
]

export const contentTypes: ContentType[] = [
  'announcement',
  'event',
  'video',
  'resource',
  'studentWork',
  'link',
]
