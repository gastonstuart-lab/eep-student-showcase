import type { EffectiveAdmin } from '../../../auth'
import type { StaffPermissions } from '../../../types'
import { staffPermissionKeys } from '../../../utils/authorization'
import { normalizeStaffUsername, validateStaffUsername } from '../../../utils/staffAuth'
import type { AccessDraft, AccessWizardStep } from './accessWizardModel'
import { assignableHubConfigs, canAssignPermission, canAssignRole } from './accessWizardModel'

export type AccessWizardErrors = Partial<Record<string, string>>

export function validateAccessWizardStep(
  step: AccessWizardStep,
  draft: AccessDraft,
  options: {
    admin?: EffectiveAdmin | null
    editing?: boolean
    temporaryPassword?: string
  } = {},
): AccessWizardErrors {
  const errors: AccessWizardErrors = {}

  if (step === 'details') {
    const username = normalizeStaffUsername(draft.username)
    const usernameError = validateStaffUsername(username)
    if (!draft.displayName.trim()) errors.displayName = 'Display name is required.'
    if (usernameError) errors.username = usernameError
    if (options.editing && draft.username !== draft.normalizedUsername) errors.username = 'Username cannot be changed after account creation.'
    if (draft.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contactEmail)) errors.contactEmail = 'Enter a valid contact email address.'
    if (!options.editing && (options.temporaryPassword ?? '').length < 12) errors.temporaryPassword = 'Temporary password must be at least 12 characters.'
  }

  if (step === 'role') {
    if (!canAssignRole(options.admin, draft.role) && !draft.protectedOwner) errors.role = 'You cannot assign that role.'
    if (!canAssignSelectedPermissions(options.admin, draft.permissions)) errors.permissions = 'This includes responsibilities you cannot assign.'
  }

  if (step === 'hubs') {
    const assignable = assignableHubConfigs(options.admin).map((config) => config.sectionId)
    if (draft.role !== 'superAdmin' && !draft.protectedOwner && draft.allowedSectionIds.length === 0) {
      errors.allowedSectionIds = 'Choose at least one hub for this staff member.'
    }
    if (draft.role !== 'superAdmin' && draft.allowedSectionIds.some((sectionId) => !assignable.includes(sectionId))) {
      errors.allowedSectionIds = 'This includes a hub you cannot assign.'
    }
  }

  if (step === 'review') {
    return {
      ...validateAccessWizardStep('details', draft, options),
      ...validateAccessWizardStep('role', draft, options),
      ...validateAccessWizardStep('hubs', draft, options),
    }
  }

  return errors
}

export function hasAccessErrors(errors: AccessWizardErrors) {
  return Object.values(errors).some(Boolean)
}

export function canAssignSelectedPermissions(admin: EffectiveAdmin | null | undefined, permissions: StaffPermissions) {
  return staffPermissionKeys.every((permission) => !permissions[permission] || canAssignPermission(admin, permission))
}
