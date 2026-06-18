import type { Timestamp } from 'firebase/firestore'

export type ProjectStatus = 'pending' | 'approved' | 'rejected' | 'hidden'
export type ContentStatus = 'draft' | 'published' | 'hidden'
export type ContentType = 'announcement' | 'event' | 'video' | 'resource' | 'studentWork' | 'link'
export type Department = 'IED' | 'EEP' | 'ESL'
export type AdminRole = 'superAdmin' | 'editor'

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
  summary: string
  body: string
  type: ContentType
  department: Department
  sectionId: string
  sectionName: string
  status: ContentStatus
  featured: boolean
  mediaUrl: string
  linkUrl: string
  eventDate: string
  imageUrl: string
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
  displayName: string
  role: AdminRole
  active: boolean
  allowedSectionIds: string[]
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type AdminUserInput = Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>

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
