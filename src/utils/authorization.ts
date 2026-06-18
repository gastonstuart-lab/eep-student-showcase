import type { AdminRole } from '../types'

export interface PermissionAdmin {
  role: AdminRole
  active: boolean
  allowedSectionIds: string[]
}

export function canManageSectionForAdmin(admin: PermissionAdmin | null | undefined, sectionId: string) {
  if (!admin?.active) {
    return false
  }

  return admin.role === 'superAdmin' || admin.allowedSectionIds.includes(sectionId)
}

export function canManageProjectsForAdmin(admin: PermissionAdmin | null | undefined) {
  return canManageSectionForAdmin(admin, 'eep')
}
