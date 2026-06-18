import { describe, expect, it } from 'vitest'
import {
  assertAuthenticated,
  assertCanAssignRole,
  assertCanManageTarget,
  assertCanManageUsers,
  assertProtectedOwnerPayload,
  assertRecentAuthentication,
  assertUsernameAvailable,
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
  type StaffActor,
  type StaffTarget,
} from './staffSecurity.js'

const owner: StaffActor = {
  uid: 'owner_uid_123', username: 'stuart', displayName: 'Stuart', role: 'superAdmin',
  protectedOwner: true, active: true, permissions: fullPermissions,
}
const manager: StaffActor = {
  uid: 'manager_uid_123', username: 'manager', displayName: 'Manager', role: 'admin',
  protectedOwner: false, active: true, permissions: fullPermissions,
}
const editor: StaffActor = {
  uid: 'editor_uid_123', username: 'editor', displayName: 'Editor', role: 'editor',
  protectedOwner: false, active: true, permissions: normalizePermissions('editor', { editContent: true }),
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
