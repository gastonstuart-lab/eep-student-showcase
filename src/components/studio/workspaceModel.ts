import type { EffectiveAdmin } from '../../auth'
import { hubConfigs, type HubConfig } from '../../hubs'
import type { ContentItem, ContentStatus } from '../../types'
import { canCreateContentForAdmin, canManageProjectsForAdmin, canManageUsersForAdmin, canViewAuditLogForAdmin, hasSectionAccess } from '../../utils/authorization'
import { workspaceHubViewUrl } from './workspaceRouting'

export interface WorkspaceNavItem {
  label: string
  to: string
  group: 'primary' | 'admin'
  activeMatch?: 'exact' | 'content-library' | 'content-create' | 'submissions'
}

export interface WorkspaceContextOption {
  id: string
  label: string
  detail: string
  route: string
}

export function firstContentSection(admin: EffectiveAdmin | null, configs = hubConfigs) {
  return getAccessibleHubConfigs(admin, configs).find((config) => config.sectionId !== 'ied') ?? getAccessibleHubConfigs(admin, configs)[0]
}

export function getAccessibleHubConfigs(admin: EffectiveAdmin | null, configs: HubConfig[] = hubConfigs) {
  if (!admin?.active) {
    return []
  }

  if (admin.role === 'superAdmin') {
    return configs
  }

  return configs.filter((config) => hasSectionAccess(admin, config.sectionId))
}

export function buildWorkspaceContextOptions(admin: EffectiveAdmin | null, configs: HubConfig[] = hubConfigs): WorkspaceContextOption[] {
  const accessible = getAccessibleHubConfigs(admin, configs)
  const options = accessible.map((config) => ({
    id: config.sectionId,
    label: config.sectionName,
    detail: config.kind === 'subject' ? 'Subject Hub' : `${config.department} Hub`,
    route: `/admin/hubs/${config.sectionId}`,
  }))

  if (admin?.role === 'superAdmin') {
    return [
      { id: 'all', label: 'All Hubs', detail: 'Workspace', route: '/admin' },
      ...options,
    ]
  }

  return options
}

export function resolveWorkspaceContext(admin: EffectiveAdmin | null, requestedContextId?: string | null, configs: HubConfig[] = hubConfigs) {
  if (!admin?.active) {
    return null
  }

  const accessible = getAccessibleHubConfigs(admin, configs)

  if (requestedContextId === 'all' && admin.role === 'superAdmin') {
    return { type: 'all' as const, section: null, accessible }
  }

  const requestedSection = requestedContextId
    ? accessible.find((config) => config.sectionId === requestedContextId)
    : null

  if (requestedSection) {
    return { type: 'section' as const, section: requestedSection, accessible }
  }

  const fallback = admin.role === 'superAdmin' ? null : firstContentSection(admin, configs)
  return fallback
    ? { type: 'section' as const, section: fallback, accessible }
    : { type: 'all' as const, section: null, accessible }
}

function firstCreatableSection(admin: EffectiveAdmin | null, configs: HubConfig[]) {
  return configs.find((config) => canCreateContentForAdmin(admin, config.sectionId))
}

function firstSubmissionSection(admin: EffectiveAdmin | null, configs: HubConfig[]) {
  return configs.find((config) => config.sectionId !== 'ied' && hasSectionAccess(admin, config.sectionId)) ?? configs[0]
}

export function buildWorkspaceNav(admin: EffectiveAdmin | null, activeContextId?: string | null, configs: HubConfig[] = hubConfigs): WorkspaceNavItem[] {
  if (!admin?.active) {
    return []
  }

  const context = resolveWorkspaceContext(admin, activeContextId, configs)
  const accessible = context?.accessible ?? []
  const activeSection = context?.section ?? firstCreatableSection(admin, accessible) ?? firstContentSection(admin, configs)
  const isAllContext = context?.type === 'all'
  const creatableSection = isAllContext ? firstCreatableSection(admin, accessible) : activeSection
  const canCreate = Boolean(creatableSection && canCreateContentForAdmin(admin, creatableSection.sectionId))
  const items: WorkspaceNavItem[] = [
    { label: 'Overview', to: '/admin', group: 'primary', activeMatch: 'exact' },
  ]

  if (activeSection) {
    if (canCreate) {
      items.push({ label: 'Create Content', to: workspaceHubViewUrl((creatableSection ?? activeSection).sectionId, 'create'), group: 'primary', activeMatch: 'content-create' })
    }
    items.push({ label: 'Content Library', to: workspaceHubViewUrl(activeSection.sectionId, 'library'), group: 'primary', activeMatch: 'content-library' })
  }

  if (canManageProjectsForAdmin(admin)) {
    const submissionSection = isAllContext ? firstSubmissionSection(admin, accessible) : activeSection
    if (submissionSection) {
      items.push({ label: 'Submissions', to: `/admin/submissions/${submissionSection.sectionId}?status=pending`, group: 'primary', activeMatch: 'submissions' })
    }
  }

  if (canManageUsersForAdmin(admin)) {
    items.push({ label: 'Staff Access', to: '/admin/users', group: 'primary' })
  }

  if (accessible.length > 1 || admin.role === 'superAdmin') {
    items.push({ label: 'Manage Hubs', to: '/admin/hubs', group: 'admin' })
  }

  if (canViewAuditLogForAdmin(admin)) {
    items.push({ label: 'Audit & Activity', to: '/admin/audit', group: 'admin' })
  }

  return items
}

export function canShowSeedSampleDataAction({
  firebaseConfigured,
  emulatorMode,
  developmentFlag,
}: {
  firebaseConfigured: boolean
  emulatorMode: boolean
  developmentFlag: boolean
}) {
  return !firebaseConfigured || emulatorMode || developmentFlag
}

export function buildWorkspaceContentStatusCounts(items: ContentItem[]) {
  return items.reduce<Record<ContentStatus, number>>(
    (counts, item) => ({
      ...counts,
      [item.status]: counts[item.status] + 1,
    }),
    { draft: 0, scheduled: 0, published: 0, hidden: 0 },
  )
}

export function shouldShowProjectSummary(canManageProjects: boolean, contextSectionIds: string[], activeContextId: string | undefined | null) {
  return Boolean(
    canManageProjects &&
      contextSectionIds.some((sectionId) => sectionId === 'eep' || sectionId === 'ied') &&
      (activeContextId === 'all' || contextSectionIds.includes('eep')),
  )
}
