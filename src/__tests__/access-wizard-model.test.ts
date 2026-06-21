import { describe, expect, it } from 'vitest'
import type { EffectiveAdmin } from '../auth'
import { emptyStaffPermissions, fullStaffPermissions } from '../utils/authorization'
import {
  accessRecoveryKey,
  accessSummary,
  accessWizardSteps,
  applyPermissionPreset,
  applyRole,
  assignableHubConfigs,
  assignableRoles,
  buildStaffAccessPayload,
  draftFromAdminUser,
  emptyAccessDraft,
  permissionPresets,
  protectedOwnerDraft,
  serializeRecoverableDraft,
  toggleHub,
  togglePermission,
} from '../components/studio/accessWizard/accessWizardModel'
import { hasAccessErrors, validateAccessWizardStep } from '../components/studio/accessWizard/accessWizardValidation'
import type { AdminUser } from '../types'

const superAdmin: EffectiveAdmin = {
  id: 'owner',
  email: 'owner@example.com',
  username: 'owner',
  normalizedUsername: 'owner',
  authEmail: 'owner@staff.eep-student-showcase.local',
  contactEmail: 'owner@example.com',
  displayName: 'Owner',
  role: 'superAdmin',
  active: true,
  protectedOwner: true,
  mustChangePassword: false,
  allowedSectionIds: ['*'],
  permissions: fullStaffPermissions,
  source: 'adminUsers',
}

const staffAdmin: EffectiveAdmin = {
  ...superAdmin,
  id: 'admin',
  username: 'admin',
  role: 'admin',
  protectedOwner: false,
  allowedSectionIds: ['esl', 'esl-science'],
  permissions: {
    ...emptyStaffPermissions,
    manageUsers: true,
    createContent: true,
    editContent: true,
    publishContent: true,
  },
}

describe('access wizard model', () => {
  it('defines the five guided steps in order', () => {
    expect(accessWizardSteps).toEqual(['details', 'role', 'hubs', 'review', 'success'])
  })

  it('limits super administrator role assignment to super admins', () => {
    expect(assignableRoles(superAdmin).map((item) => item.role)).toContain('superAdmin')
    expect(assignableRoles(staffAdmin).map((item) => item.role)).not.toContain('superAdmin')
  })

  it('maps presets to existing permission fields without raw keys in labels', () => {
    const draft = emptyAccessDraft('admin@example.com')
    const publisher = applyPermissionPreset(draft, 'publisher', superAdmin)
    expect(publisher.permissions.createContent).toBe(true)
    expect(publisher.permissions.publishContent).toBe(true)
    expect(publisher.permissions.manageUsers).toBe(false)
    expect(permissionPresets.map((item) => item.title)).toContain('Staff Administrator')
  })

  it('keeps the Staff Administrator preset limited to staff management', () => {
    const draft = emptyAccessDraft('admin@example.com')
    const staffManager = applyPermissionPreset(draft, 'staffAdmin', superAdmin)
    expect(staffManager.permissions.manageUsers).toBe(true)
    expect(staffManager.permissions.publishContent).toBe(false)
    expect(staffManager.permissions.deleteContent).toBe(false)
    expect(staffManager.permissions.manageProjects).toBe(false)
    expect(staffManager.permissions.manageHubSettings).toBe(false)
    expect(staffManager.permissions.viewAuditLog).toBe(false)
  })

  it('constrains custom permissions to the current administrator authority', () => {
    const draft = emptyAccessDraft('admin@example.com')
    const withAuditPermission = togglePermission(draft, 'viewAuditLog', staffAdmin)
    const withPublishPermission = togglePermission(draft, 'publishContent', staffAdmin)
    expect(withAuditPermission.permissions.viewAuditLog).toBe(false)
    expect(withPublishPermission.permissions.publishContent).toBe(true)
  })

  it('limits assignable hubs to the manager scope', () => {
    expect(assignableHubConfigs(staffAdmin).map((config) => config.sectionId)).toEqual(['esl', 'esl-science'])
    const draft = emptyAccessDraft('admin@example.com')
    expect(toggleHub(draft, 'eep', staffAdmin).allowedSectionIds).toEqual([])
    expect(toggleHub(draft, 'esl-science', staffAdmin).allowedSectionIds).toEqual(['esl-science'])
  })

  it('gives super administrators full hub and permission access', () => {
    const draft = applyRole(emptyAccessDraft('admin@example.com'), 'superAdmin', superAdmin)
    const payload = buildStaffAccessPayload({ ...draft, username: 'Leader', displayName: 'Leader' }, superAdmin)
    expect(payload.allowedSectionIds).toEqual(['*'])
    expect(payload.permissions).toEqual(fullStaffPermissions)
  })

  it('preserves protected owner immutable access', () => {
    const draft = protectedOwnerDraft({ ...emptyAccessDraft('owner@example.com'), active: false, role: 'editor' })
    expect(draft.active).toBe(true)
    expect(draft.role).toBe('superAdmin')
    expect(draft.allowedSectionIds).toEqual(['*'])
    expect(draft.permissions).toEqual(fullStaffPermissions)
  })

  it('generates a plain-English access summary', () => {
    const draft = {
      ...emptyAccessDraft('admin@example.com'),
      displayName: 'Jordan',
      allowedSectionIds: ['esl-science'],
      permissions: { ...emptyStaffPermissions, createContent: true, editContent: true },
    }
    expect(accessSummary(draft)).toContain('Jordan can work in Science')
    expect(accessSummary(draft)).toContain('cannot publish')
  })

  it('validates required details, password length, and hub selection', () => {
    const draft = emptyAccessDraft('admin@example.com')
    expect(hasAccessErrors(validateAccessWizardStep('details', draft, { admin: superAdmin, temporaryPassword: 'short' }))).toBe(true)
    expect(validateAccessWizardStep('hubs', draft, { admin: superAdmin }).allowedSectionIds).toBeTruthy()
  })

  it('does not serialize temporary passwords in recovery data', () => {
    const recoverable = serializeRecoverableDraft(emptyAccessDraft('admin@example.com'))
    expect(JSON.stringify(recoverable)).not.toContain('temporaryPassword')
    expect(accessRecoveryKey('owner', 'create')).toBe('ied-access-wizard:owner:create:new')
  })

  it('loads edit mode from an existing account and preserves metadata', () => {
    const item: AdminUser = {
      id: 'staff-1',
      email: 'teacher@example.com',
      username: 'teacher',
      normalizedUsername: 'teacher',
      authEmail: 'teacher@staff.eep-student-showcase.local',
      contactEmail: 'teacher@example.com',
      displayName: 'Teacher',
      role: 'editor',
      active: true,
      protectedOwner: false,
      mustChangePassword: true,
      allowedSectionIds: ['eep'],
      permissions: { ...emptyStaffPermissions, createContent: true },
      createdBy: 'owner',
      updatedBy: 'owner',
    }
    const draft = draftFromAdminUser(item, 'admin@example.com')
    expect(draft.createdBy).toBe('owner')
    expect(draft.updatedBy).toBe('admin@example.com')
    expect(draft.allowedSectionIds).toEqual(['eep'])
  })
})
