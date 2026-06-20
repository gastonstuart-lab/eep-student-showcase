import type { ContentStatus } from '../../types'

export const workspaceContentViews = ['library', 'create', 'drafts', 'scheduled', 'published'] as const

export type WorkspaceContentView = typeof workspaceContentViews[number]

export const workspaceContentViewLabels: Record<WorkspaceContentView, string> = {
  library: 'Content Library',
  create: 'Create Content',
  drafts: 'Drafts',
  scheduled: 'Scheduled',
  published: 'Published',
}

export const workspaceContentViewStatus: Partial<Record<WorkspaceContentView, ContentStatus>> = {
  drafts: 'draft',
  scheduled: 'scheduled',
  published: 'published',
}

export function parseWorkspaceContentView(value: string | null | undefined): WorkspaceContentView {
  return workspaceContentViews.includes(value as WorkspaceContentView) ? value as WorkspaceContentView : 'library'
}

export function workspaceHubViewUrl(sectionId: string, view: WorkspaceContentView = 'library') {
  return `/admin/hubs/${sectionId}?view=${view}`
}
