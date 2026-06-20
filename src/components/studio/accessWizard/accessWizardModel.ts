import type { EffectiveAdmin } from '../../../auth'
import { hubConfigs, type HubConfig } from '../../../hubs'
import type { AdminRole, AdminUser, AdminUserInput, StaffPermissions } from '../../../types'
import {
  emptyStaffPermissions,
  fullStaffPermissions,
  normalizeStaffPermissions,
  staffPermissionKeys,
  staffPermissionLabels,
} from '../../../utils/authorization'
import { normalizeStaffUsername, protectedOwnerUsername, staffUsernameToAuthEmail } from '../../../utils/staffAuth'

export const accessWizardSteps = ['details', 'role', 'hubs', 'review', 'success'] as const
export type AccessWizardStep = typeof accessWizardSteps[number]

export const accessWizardStepLabels: Record<AccessWizardStep, string> = {
  details: 'Staff Details',
  role: 'Role & Responsibilities',
  hubs: 'Hub Access',
  review: 'Review Access',
  success: 'Account Ready',
}

export type PermissionPresetId = 'contributor' | 'publisher' | 'hubAdmin' | 'eepProjects' | 'staffAdmin' | 'custom'

export const permissionPresets: Array<{
  id: PermissionPresetId
  title: string
  help: string
  permissions: StaffPermissions
  requiresSuperAdmin?: boolean
}> = [
  {
    id: 'contributor',
    title: 'Content Contributor',
    help: 'Can create and edit learning items, then save drafts for review.',
    permissions: { ...emptyStaffPermissions, createContent: true, editContent: true },
  },
  {
    id: 'publisher',
    title: 'Content Publisher',
    help: 'Can create, edit, publish, and schedule content.',
    permissions: { ...emptyStaffPermissions, createContent: true, editContent: true, publishContent: true },
  },
  {
    id: 'hubAdmin',
    title: 'Hub Administrator',
    help: 'Can manage hub content and settings for assigned areas.',
    permissions: {
      ...emptyStaffPermissions,
      createContent: true,
      editContent: true,
      publishContent: true,
      deleteContent: true,
      manageHubSettings: true,
    },
  },
  {
    id: 'eepProjects',
    title: 'EEP Project Manager',
    help: 'Can manage EEP project submissions and support content tasks.',
    permissions: {
      ...emptyStaffPermissions,
      manageProjects: true,
      createContent: true,
      editContent: true,
    },
  },
  {
    id: 'staffAdmin',
    title: 'Staff Administrator',
    help: 'Can manage staff access and view activity history.',
    permissions: { ...fullStaffPermissions, viewAuditLog: true },
    requiresSuperAdmin: true,
  },
  {
    id: 'custom',
    title: 'Custom',
    help: 'Choose individual responsibilities carefully.',
    permissions: { ...emptyStaffPermissions },
  },
]

export interface AccessDraft extends AdminUserInput {
  permissionPreset: PermissionPresetId
}

export const roleCards: Array<{ role: AdminRole; title: string; help: string; warning?: string }> = [
  {
    role: 'editor',
    title: 'Editor',
    help: 'Works only in assigned hubs and can receive content permissions.',
  },
  {
    role: 'admin',
    title: 'Administrator',
    help: 'Can manage assigned areas and selected platform responsibilities.',
  },
  {
    role: 'superAdmin',
    title: 'Super Administrator',
    help: 'Full platform access, all hubs, all permissions, staff management, and audit access.',
    warning: 'Use only for trusted platform owners.',
  },
]

export function emptyAccessDraft(userEmail: string): AccessDraft {
  return {
    email: '',
    username: '',
    normalizedUsername: '',
    authEmail: '',
    contactEmail: '',
    displayName: '',
    role: 'editor',
    active: true,
    protectedOwner: false,
    mustChangePassword: true,
    allowedSectionIds: [],
    permissions: { ...emptyStaffPermissions, createContent: true, editContent: true },
    permissionPreset: 'contributor',
    createdBy: userEmail,
    updatedBy: userEmail,
  }
}

export function draftFromAdminUser(item: AdminUser, userEmail: string): AccessDraft {
  return {
    email: item.email,
    username: item.username,
    normalizedUsername: item.normalizedUsername,
    authEmail: item.authEmail,
    contactEmail: item.contactEmail,
    displayName: item.displayName,
    role: item.role,
    active: item.active,
    protectedOwner: item.protectedOwner,
    mustChangePassword: item.mustChangePassword,
    allowedSectionIds: item.allowedSectionIds,
    permissions: normalizeStaffPermissions(item.role, item.permissions),
    permissionPreset: inferPreset(item.permissions),
    createdBy: item.createdBy,
    updatedBy: userEmail,
  }
}

export function isSuperAdmin(admin: EffectiveAdmin | null | undefined) {
  return Boolean(admin?.active && admin.role === 'superAdmin')
}

export function canAssignRole(admin: EffectiveAdmin | null | undefined, role: AdminRole) {
  if (!admin?.active) return false
  if (role === 'superAdmin') return isSuperAdmin(admin)
  return admin.role === 'superAdmin' || Boolean(admin.permissions?.manageUsers)
}

export function assignableRoles(admin: EffectiveAdmin | null | undefined) {
  return roleCards.filter((card) => canAssignRole(admin, card.role))
}

export function assignableHubConfigs(admin: EffectiveAdmin | null | undefined, configs: HubConfig[] = hubConfigs) {
  if (!admin?.active) return []
  if (isSuperAdmin(admin) || admin.allowedSectionIds.includes('*')) return configs
  return configs.filter((config) => admin.allowedSectionIds.includes(config.sectionId))
}

export function applyPermissionPreset(draft: AccessDraft, presetId: PermissionPresetId, admin?: EffectiveAdmin | null): AccessDraft {
  const preset = permissionPresets.find((item) => item.id === presetId) ?? permissionPresets[0]
  const permissions = preset.id === 'custom'
    ? draft.permissions
    : constrainPermissionsForAdmin(preset.permissions, admin)

  return {
    ...draft,
    permissionPreset: preset.id,
    permissions: draft.role === 'superAdmin' ? { ...fullStaffPermissions } : permissions,
  }
}

export function togglePermission(draft: AccessDraft, permission: keyof StaffPermissions, admin?: EffectiveAdmin | null): AccessDraft {
  if (draft.role === 'superAdmin' || !canAssignPermission(admin, permission)) return draft
  return {
    ...draft,
    permissionPreset: 'custom',
    permissions: {
      ...draft.permissions,
      [permission]: !draft.permissions[permission],
    },
  }
}

export function applyRole(draft: AccessDraft, role: AdminRole, admin?: EffectiveAdmin | null): AccessDraft {
  if (!canAssignRole(admin, role) && !draft.protectedOwner) return draft
  if (draft.protectedOwner) return protectedOwnerDraft(draft)
  if (role === 'superAdmin') {
    return {
      ...draft,
      role,
      allowedSectionIds: ['*'],
      permissions: { ...fullStaffPermissions },
      permissionPreset: 'custom',
    }
  }

  const next = { ...draft, role, allowedSectionIds: draft.allowedSectionIds.filter((item) => item !== '*') }
  return applyPermissionPreset(next, role === 'admin' ? 'hubAdmin' : 'contributor', admin)
}

export function toggleHub(draft: AccessDraft, sectionId: string, admin?: EffectiveAdmin | null): AccessDraft {
  if (draft.role === 'superAdmin' || draft.protectedOwner) return protectedOwnerDraft(draft)
  if (!assignableHubConfigs(admin).some((config) => config.sectionId === sectionId)) return draft
  return {
    ...draft,
    allowedSectionIds: draft.allowedSectionIds.includes(sectionId)
      ? draft.allowedSectionIds.filter((item) => item !== sectionId)
      : [...draft.allowedSectionIds, sectionId],
  }
}

export function canAssignPermission(admin: EffectiveAdmin | null | undefined, permission: keyof StaffPermissions) {
  if (isSuperAdmin(admin)) return true
  return Boolean(admin?.active && admin.permissions?.manageUsers && admin.permissions?.[permission])
}

export function constrainPermissionsForAdmin(permissions: StaffPermissions, admin?: EffectiveAdmin | null): StaffPermissions {
  if (isSuperAdmin(admin)) return { ...permissions }
  return staffPermissionKeys.reduce<StaffPermissions>((next, permission) => ({
    ...next,
    [permission]: Boolean(permissions[permission] && admin?.permissions?.[permission]),
  }), { ...emptyStaffPermissions })
}

export function protectedOwnerDraft(draft: AccessDraft): AccessDraft {
  return {
    ...draft,
    username: protectedOwnerUsername,
    normalizedUsername: protectedOwnerUsername,
    authEmail: staffUsernameToAuthEmail(protectedOwnerUsername),
    role: 'superAdmin',
    active: true,
    protectedOwner: true,
    mustChangePassword: draft.mustChangePassword,
    allowedSectionIds: ['*'],
    permissions: { ...fullStaffPermissions },
    permissionPreset: 'custom',
  }
}

export function buildStaffAccessPayload(draft: AccessDraft, admin?: EffectiveAdmin | null): AdminUserInput {
  const normalizedUsername = normalizeStaffUsername(draft.username)
  const safeDraft = draft.protectedOwner ? protectedOwnerDraft(draft) : draft
  const role = canAssignRole(admin, safeDraft.role) || safeDraft.protectedOwner ? safeDraft.role : 'editor'
  const permissions = role === 'superAdmin'
    ? { ...fullStaffPermissions }
    : constrainPermissionsForAdmin(safeDraft.permissions, admin)

  return {
    email: safeDraft.contactEmail || safeDraft.email || staffUsernameToAuthEmail(normalizedUsername),
    username: normalizedUsername,
    normalizedUsername,
    authEmail: staffUsernameToAuthEmail(normalizedUsername),
    contactEmail: safeDraft.contactEmail,
    displayName: safeDraft.displayName.trim(),
    role,
    active: safeDraft.protectedOwner ? true : safeDraft.active,
    protectedOwner: safeDraft.protectedOwner,
    mustChangePassword: safeDraft.mustChangePassword,
    allowedSectionIds: role === 'superAdmin' ? ['*'] : safeDraft.allowedSectionIds.filter((sectionId) => assignableHubConfigs(admin).some((config) => config.sectionId === sectionId)),
    permissions,
    createdBy: safeDraft.createdBy,
    updatedBy: safeDraft.updatedBy,
  }
}

export function accessRecoveryKey(adminId: string, mode: 'create' | 'edit', targetId = 'new') {
  return `ied-access-wizard:${adminId}:${mode}:${targetId}`
}

export function serializeRecoverableDraft(draft: AccessDraft) {
  const { email, username, normalizedUsername, authEmail, contactEmail, displayName, role, active, protectedOwner, mustChangePassword, allowedSectionIds, permissions, permissionPreset, createdBy, updatedBy } = draft
  return { email, username, normalizedUsername, authEmail, contactEmail, displayName, role, active, protectedOwner, mustChangePassword, allowedSectionIds, permissions, permissionPreset, createdBy, updatedBy }
}

export function hubLabels(sectionIds: string[]) {
  if (sectionIds.includes('*')) return ['All hubs']
  return sectionIds.map((sectionId) => hubConfigs.find((config) => config.sectionId === sectionId)?.sectionName ?? sectionId)
}

export function permissionLabels(permissions: StaffPermissions) {
  return staffPermissionKeys.filter((permission) => permissions[permission]).map((permission) => staffPermissionLabels[permission])
}

export function accessSummary(draft: AccessDraft) {
  const name = draft.displayName.trim() || draft.username.trim() || 'This staff member'
  if (draft.protectedOwner) {
    return `${name} is the protected owner with full platform access. This account cannot be disabled, archived, or demoted here.`
  }
  if (draft.role === 'superAdmin') {
    return `${name} will have full platform access across all hubs, staff management, project management, publishing, settings, and activity history.`
  }

  const hubs = hubLabels(draft.allowedSectionIds)
  const permissions = permissionLabels(draft.permissions)
  const publish = draft.permissions.publishContent ? 'can publish and schedule content' : 'can save drafts but cannot publish them'
  const staff = draft.permissions.manageUsers ? 'can manage staff access' : 'cannot manage staff access'
  const hubText = hubs.length ? hubs.join(', ') : 'no hubs yet'
  const permissionText = permissions.length ? permissions.join(', ') : 'no responsibilities yet'
  return `${name} can work in ${hubText}. Responsibilities: ${permissionText}. They ${publish} and ${staff}.`
}

function inferPreset(permissions: StaffPermissions): PermissionPresetId {
  const candidates = permissionPresets.filter((preset) => preset.id !== 'custom')
  return candidates.find((preset) => staffPermissionKeys.every((permission) => preset.permissions[permission] === permissions[permission]))?.id ?? 'custom'
}
