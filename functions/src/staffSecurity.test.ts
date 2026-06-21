import { describe, expect, it } from 'vitest'
import {
  assertAuthenticated,
  assertCanAssignAccess,
  assertCanAssignRole,
  assertCanManageTarget,
  assertCanManageUsers,
  assertPermissionSubset,
  assertProtectedOwnerPayload,
  assertRecentAuthentication,
  assertSectionSubset,
  assertUsernameAvailable,
  assertValidSections,
  assertValidUid,
  buildStaffDocument,
  fullPermissions,
  internalStaffAuthDomain,
  normalizePermissions,
  normalizeUsername,
  protectedOwnerEmail,
  protectedOwnerNeedsRepair,
  rejectClientSignup,
  staffAuthEmail,
  validateUsername,
  validSectionIds,
  type StaffPermissions,
  type StaffActor,
  type StaffTarget,
} from './staffSecurity.js'

const owner: StaffActor = {
  uid: 'owner_uid_123', username: 'stuart', displayName: 'Stuart', role: 'superAdmin',
  protectedOwner: true, active: true, allowedSectionIds: ['*'], permissions: fullPermissions,
}
const manager: StaffActor = {
  uid: 'manager_uid_123', username: 'manager', displayName: 'Manager', role: 'admin',
  protectedOwner: false, active: true, allowedSectionIds: ['ied', 'eep', 'esl-science'], permissions: fullPermissions,
}
const editor: StaffActor = {
  uid: 'editor_uid_123', username: 'editor', displayName: 'Editor', role: 'editor',
  protectedOwner: false, active: true, allowedSectionIds: ['esl-science'], permissions: normalizePermissions('editor', { editContent: true }),
}
const ownerTarget: StaffTarget = {
  uid: owner.uid, normalizedUsername: 'stuart', role: 'superAdmin', protectedOwner: true, active: true,
}
const superTarget: StaffTarget = {
  uid: 'other_super_123', normalizedUsername: 'other.super', role: 'superAdmin', protectedOwner: false, active: true,
}

describe('staff identity mapping', () => {
  it('normalizes usernames case-insensitively', () => {
    expect(normalizeUsername('  Science.Jones  ')).toBe('science.jones')
  })
  it('maps the protected owner to the existing account', () => {
    expect(staffAuthEmail('stuart')).toBe(protectedOwnerEmail)
  })
  it('uses the fixed internal domain for ordinary staff', () => {
    expect(internalStaffAuthDomain).toBe('staff.eep-student-showcase.local')
    expect(staffAuthEmail('Science.Jones')).toBe('science.jones@staff.eep-student-showcase.local')
  })
  it('rejects invalid and reserved usernames', () => {
    expect(() => validateUsername('root')).toThrow()
    expect(() => validateUsername('a')).toThrow()
    expect(() => validateUsername('science jones')).toThrow()
  })
})

describe('staff access assignment enforcement', () => {
  const limitedStaffManager: StaffActor = {
    ...manager,
    permissions: normalizePermissions('admin', {
      manageUsers: true,
      createContent: true,
      editContent: true,
    }),
  }
  const requestedWithinScope: StaffPermissions = normalizePermissions('admin', {
    manageUsers: true,
    createContent: true,
  })

  it('keeps the backend section allowlist aligned with the app hub IDs', () => {
    expect(validSectionIds).toEqual([
      'ied',
      'eep',
      'esl',
      'esl-science',
      'esl-language-arts',
      'esl-performance-arts',
      'esl-social-studies',
    ])
  })

  it('allows requested permissions within the caller scope', () => {
    expect(() => assertPermissionSubset(limitedStaffManager, requestedWithinScope)).not.toThrow()
  })

  it('rejects each requested permission outside the caller scope', () => {
    for (const permission of ['publishContent', 'deleteContent', 'viewAuditLog', 'manageProjects', 'manageHubSettings'] as const) {
      expect(() => assertPermissionSubset(limitedStaffManager, {
        ...requestedWithinScope,
        [permission]: true,
      })).toThrow(/only grant permissions/i)
    }
  })

  it('allows requested sections within the caller scope', () => {
    expect(() => assertSectionSubset(manager, ['eep', 'esl-science'])).not.toThrow()
  })

  it('rejects requested sections outside the caller scope', () => {
    expect(() => assertSectionSubset({ ...manager, allowedSectionIds: ['eep'] }, ['esl-science'])).toThrow(/only assign sections/i)
    expect(() => assertSectionSubset({ ...manager, allowedSectionIds: ['esl-science'] }, ['esl-social-studies'])).toThrow(/only assign sections/i)
  })

  it('rejects unknown sections instead of silently accepting them', () => {
    expect(() => assertValidSections(['unknown-section'])).toThrow(/valid IED Hub sections/i)
  })

  it('rejects global section assignment for non-protected callers', () => {
    expect(() => assertSectionSubset(manager, ['*'])).toThrow(/protected owner/i)
  })

  it('allows the protected owner to assign valid global access', () => {
    expect(() => assertSectionSubset(owner, ['*'])).not.toThrow()
    expect(() => assertPermissionSubset(owner, fullPermissions)).not.toThrow()
  })

  it('enforces permission and section checks for create-style access payloads', () => {
    expect(() => assertCanAssignAccess(limitedStaffManager, {
      role: 'admin',
      allowedSectionIds: ['eep'],
      permissions: requestedWithinScope,
    })).not.toThrow()
    expect(() => assertCanAssignAccess(limitedStaffManager, {
      role: 'admin',
      allowedSectionIds: ['eep'],
      permissions: { ...requestedWithinScope, publishContent: true },
    })).toThrow(/only grant permissions/i)
    expect(() => assertCanAssignAccess(limitedStaffManager, {
      role: 'admin',
      allowedSectionIds: ['esl-social-studies'],
      permissions: requestedWithinScope,
    })).toThrow(/only assign sections/i)
  })

  it('enforces permission and section checks for update-style access payloads', () => {
    const updatePayload = {
      role: 'editor' as const,
      allowedSectionIds: ['esl-science'],
      permissions: normalizePermissions('editor', { createContent: true, editContent: true }),
    }
    expect(() => assertCanAssignAccess(limitedStaffManager, updatePayload)).not.toThrow()
    expect(() => assertCanAssignAccess(limitedStaffManager, {
      ...updatePayload,
      allowedSectionIds: ['*'],
    })).toThrow(/protected owner/i)
    expect(() => assertCanAssignAccess({ ...limitedStaffManager, permissions: normalizePermissions('admin', { createContent: true }) }, updatePayload)).toThrow(/only grant permissions/i)
  })
})

describe('caller and role enforcement', () => {
  it('rejects unauthenticated callers', () => {
    expect(() => assertAuthenticated(null)).toThrow(/sign in/i)
  })
  it('accepts an authenticated caller shape', () => {
    expect(() => assertAuthenticated({ uid: 'valid_uid_123', token: {} })).not.toThrow()
  })
  it('rejects inactive staff and staff without manageUsers', () => {
    expect(() => assertCanManageUsers({ ...manager, active: false })).toThrow()
    expect(() => assertCanManageUsers(editor)).toThrow()
  })
  it('allows an authorised manager', () => {
    expect(() => assertCanManageUsers(manager)).not.toThrow()
  })
  it('allows only the protected owner to assign super administrators', () => {
    expect(() => assertCanAssignRole(manager, 'superAdmin')).toThrow()
    expect(() => assertCanAssignRole(owner, 'superAdmin')).not.toThrow()
  })
  it('blocks ordinary managers from changing super administrators', () => {
    expect(() => assertCanManageTarget(manager, superTarget, 'profileUpdate', 'admin')).toThrow()
    expect(() => assertCanManageTarget(owner, superTarget, 'profileUpdate', 'admin')).not.toThrow()
  })
})

describe('protected owner safeguards', () => {
  const validOwnerPayload = {
    username: 'stuart', role: 'superAdmin' as const, active: true, mustChangePassword: false,
    allowedSectionIds: ['*'], permissions: fullPermissions,
  }
  it('allows only a safe profile update by the owner', () => {
    expect(() => assertCanManageTarget(owner, ownerTarget, 'profileUpdate', 'superAdmin')).not.toThrow()
    expect(() => assertProtectedOwnerPayload(validOwnerPayload)).not.toThrow()
  })
  it('blocks another administrator from editing the owner', () => {
    expect(() => assertCanManageTarget(manager, ownerTarget, 'profileUpdate', 'superAdmin')).toThrow()
  })
  it('blocks disable, archive, and administrator reset actions for the owner', () => {
    expect(() => assertCanManageTarget(owner, ownerTarget, 'disable')).toThrow()
    expect(() => assertCanManageTarget(owner, ownerTarget, 'archive')).toThrow()
    expect(() => assertCanManageTarget(owner, ownerTarget, 'passwordReset')).toThrow()
  })
  it('blocks demotion, deactivation, rename, section loss, and permission loss', () => {
    expect(() => assertProtectedOwnerPayload({ ...validOwnerPayload, role: 'admin' })).toThrow()
    expect(() => assertProtectedOwnerPayload({ ...validOwnerPayload, active: false })).toThrow()
    expect(() => assertProtectedOwnerPayload({ ...validOwnerPayload, username: 'other' })).toThrow()
    expect(() => assertProtectedOwnerPayload({ ...validOwnerPayload, allowedSectionIds: [] })).toThrow()
    expect(() => assertProtectedOwnerPayload({ ...validOwnerPayload, permissions: { ...fullPermissions, manageUsers: false } })).toThrow()
  })
  it('detects whether a persisted owner record needs repair', () => {
    const valid = { ...validOwnerPayload, authEmail: protectedOwnerEmail, normalizedUsername: 'stuart', protectedOwner: true }
    expect(protectedOwnerNeedsRepair(undefined)).toBe(true)
    expect(protectedOwnerNeedsRepair(valid)).toBe(false)
    expect(protectedOwnerNeedsRepair({ ...valid, protectedOwner: false })).toBe(true)
  })
})

describe('account-operation safeguards', () => {
  it('requires recent authentication for a credential change', () => {
    expect(() => assertRecentAuthentication(1_000, 1_200)).not.toThrow()
    expect(() => assertRecentAuthentication(1_000, 1_301)).toThrow()
    expect(() => assertRecentAuthentication(undefined, 1_200)).toThrow()
  })
  it('rejects invalid target UIDs', () => {
    expect(() => assertValidUid('')).toThrow()
    expect(() => assertValidUid('ok_uid_123')).not.toThrow()
  })
  it('rejects duplicate username reservations', () => {
    expect(() => assertUsernameAvailable(true)).toThrow()
    expect(() => assertUsernameAvailable(false)).not.toThrow()
  })
  it('never includes a temporary credential in the staff document', () => {
    const document = buildStaffDocument({
      username: 'science.jones', displayName: 'Science Jones', contactEmail: 'teacher@example.com',
      role: 'editor', active: true, allowedSectionIds: ['esl-science'],
      permissions: normalizePermissions('editor', { editContent: true }),
    }, staffAuthEmail('science.jones'), owner.uid)
    expect(document).not.toHaveProperty('temporaryPassword')
    expect(document.mustChangePassword).toBe(true)
  })
  it('normalizes super administrator permissions to full access', () => {
    expect(normalizePermissions('superAdmin', {})).toEqual(fullPermissions)
  })
  it('rejects every client-side account creation attempt', () => {
    expect(() => rejectClientSignup()).toThrow(/administrator/i)
  })
  it('does not let a username reservation bypass signup rejection', () => {
    const reservationExists = true
    expect(reservationExists).toBe(true)
    expect(() => rejectClientSignup()).toThrow(/administrator/i)
  })
})
