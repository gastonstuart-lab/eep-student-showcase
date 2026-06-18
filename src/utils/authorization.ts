import type { AdminRole, StaffPermissions } from '../types'

export interface PermissionAdmin {
  role: AdminRole
  active: boolean
  protectedOwner?: boolean
  allowedSectionIds: string[]
  permissions?: Partial<StaffPermissions>
}

export const staffPermissionKeys = [
  'manageUsers',
  'manageProjects',
  'manageHubSettings',
  'createContent',
  'editContent',
  'publishContent',
  'deleteContent',
  'viewAuditLog',
] as const satisfies readonly (keyof StaffPermissions)[]

export const emptyStaffPermissions: StaffPermissions = {
  manageUsers: false,
  manageProjects: false,
  manageHubSettings: false,
  createContent: false,
  editContent: false,
  publishContent: false,
  deleteContent: false,
  viewAuditLog: false,
}

export const fullStaffPermissions: StaffPermissions = {
  manageUsers: true,
  manageProjects: true,
  manageHubSettings: true,
  createContent: true,
  editContent: true,
  publishContent: true,
  deleteContent: true,
  viewAuditLog: true,
}

export function defaultPermissionsForRole(role: AdminRole): StaffPermissions {
  if (role === 'superAdmin') {
    return { ...fullStaffPermissions }
  }

  if (role === 'admin') {
    return {
      ...fullStaffPermissions,
      viewAuditLog: false,
    }
  }

  return {
    ...emptyStaffPermissions,
    createContent: true,
    editContent: true,
  }
}

export function normalizeStaffPermissions(
  role: AdminRole,
  permissions?: Partial<StaffPermissions> | null,
): StaffPermissions {
  const defaults = defaultPermissionsForRole(role)

  return staffPermissionKeys.reduce<StaffPermissions>(
    (normalized, permission) => ({
      ...normalized,
      [permission]: Boolean(permissions?.[permission] ?? defaults[permission]),
    }),
    { ...emptyStaffPermissions },
  )
}

function isActiveStaff(admin: PermissionAdmin | null | undefined) {
  return Boolean(admin?.active)
}

function isSuperAdmin(admin: PermissionAdmin | null | undefined) {
  return isActiveStaff(admin) && admin?.role === 'superAdmin'
}

function hasPermission(admin: PermissionAdmin | null | undefined, permission: keyof StaffPermissions) {
  if (!isActiveStaff(admin)) {
    return false
  }

  const activeAdmin = admin as PermissionAdmin
  const permissions = normalizeStaffPermissions(activeAdmin.role, activeAdmin.permissions)

  return isSuperAdmin(admin) || Boolean(permissions[permission])
}

export function hasSectionAccess(admin: PermissionAdmin | null | undefined, sectionId: string) {
  if (!admin?.active) {
    return false
  }

  return admin.role === 'superAdmin' || admin.allowedSectionIds.includes('*') || admin.allowedSectionIds.includes(sectionId)
}

export function canManageSectionForAdmin(admin: PermissionAdmin | null | undefined, sectionId: string) {
  return canCreateContentForAdmin(admin, sectionId) || canEditContentForAdmin(admin, sectionId) || canPublishContentForAdmin(admin, sectionId)
}

export function canManageProjectsForAdmin(admin: PermissionAdmin | null | undefined) {
  if (!isActiveStaff(admin)) {
    return false
  }

  return hasSectionAccess(admin, 'eep') && (isSuperAdmin(admin) || admin?.permissions === undefined || hasPermission(admin, 'manageProjects'))
}

export function canManageUsersForAdmin(admin: PermissionAdmin | null | undefined) {
  return hasPermission(admin, 'manageUsers')
}

export function canManageHubSettingsForAdmin(admin: PermissionAdmin | null | undefined, sectionId: string) {
  return hasPermission(admin, 'manageHubSettings') && hasSectionAccess(admin, sectionId)
}

export function canCreateContentForAdmin(admin: PermissionAdmin | null | undefined, sectionId: string) {
  return hasPermission(admin, 'createContent') && hasSectionAccess(admin, sectionId)
}

export function canEditContentForAdmin(admin: PermissionAdmin | null | undefined, sectionId: string) {
  return hasPermission(admin, 'editContent') && hasSectionAccess(admin, sectionId)
}

export function canPublishContentForAdmin(admin: PermissionAdmin | null | undefined, sectionId: string) {
  return hasPermission(admin, 'publishContent') && hasSectionAccess(admin, sectionId)
}

export function canDeleteContentForAdmin(admin: PermissionAdmin | null | undefined, sectionId: string) {
  return hasPermission(admin, 'deleteContent') && hasSectionAccess(admin, sectionId)
}

export function canViewAuditLogForAdmin(admin: PermissionAdmin | null | undefined) {
  return hasPermission(admin, 'viewAuditLog')
}
