import type { EffectiveAdmin } from '../../auth'
import { hubConfigs, type HubConfig } from '../../hubs'
import { canCreateContentForAdmin, canManageProjectsForAdmin, canManageUsersForAdmin, canPublishContentForAdmin, canViewAuditLogForAdmin, hasSectionAccess } from '../../utils/authorization'

export interface WorkspaceNavItem {
  label: string
  to: string
  group: 'core' | 'projects' | 'admin'
}

export interface WorkspaceContextOption {
  id: string
  label: string
  detail: string
  route: string
}

function firstContentSection(admin: EffectiveAdmin | null, configs = hubConfigs) {
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
      { id: 'all', label: 'All Hubs', detail: 'Super Administrator', route: '/admin' },
      ...options,
    ]
  }

  return options
}

export function buildWorkspaceNav(admin: EffectiveAdmin | null, configs: HubConfig[] = hubConfigs): WorkspaceNavItem[] {
  if (!admin?.active) {
    return []
  }

  const accessible = getAccessibleHubConfigs(admin, configs)
  const firstSection = firstContentSection(admin, configs)
  const canCreate = Boolean(firstSection && canCreateContentForAdmin(admin, firstSection.sectionId))
  const canPublish = accessible.some((config) => canPublishContentForAdmin(admin, config.sectionId))
  const items: WorkspaceNavItem[] = [
    { label: admin.role === 'superAdmin' ? 'Platform Overview' : 'Overview', to: '/admin', group: 'core' },
  ]

  if (firstSection) {
    if (canCreate) {
      items.push({ label: 'Create Content', to: `/admin/hubs/${firstSection.sectionId}`, group: 'core' })
    }
    items.push({ label: 'Content Library', to: `/admin/hubs/${firstSection.sectionId}`, group: 'core' })
    items.push({ label: 'Drafts', to: `/admin/hubs/${firstSection.sectionId}`, group: 'core' })
    items.push({ label: 'Scheduled', to: `/admin/hubs/${firstSection.sectionId}`, group: 'core' })
    if (canPublish) {
      items.push({ label: 'Published', to: `/admin/hubs/${firstSection.sectionId}`, group: 'core' })
    }
    items.push({ label: 'Open Public Hub', to: firstSection.route, group: 'core' })
  }

  if (canManageProjectsForAdmin(admin)) {
    items.push(
      { label: 'Pending Submissions', to: '/admin/pending', group: 'projects' },
      { label: 'Approved Projects', to: '/admin/approved', group: 'projects' },
      { label: 'Publishing Queue', to: '/admin/pending', group: 'projects' },
    )
  }

  if (accessible.length > 1 || admin.role === 'superAdmin') {
    items.push({ label: 'All Hubs', to: '/admin/hubs', group: 'admin' })
  }

  if (canManageUsersForAdmin(admin)) {
    items.push({ label: 'Staff Access', to: '/admin/users', group: 'admin' })
  }

  if (canViewAuditLogForAdmin(admin)) {
    items.push({ label: 'Activity / Audit', to: '/admin/audit', group: 'admin' })
  }

  return items
}
