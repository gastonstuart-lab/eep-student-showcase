import { HttpsError } from 'firebase-functions/v2/https'

export type AdminRole = 'superAdmin' | 'admin' | 'editor'

export interface StaffPermissions {
  manageUsers: boolean
  manageProjects: boolean
  manageHubSettings: boolean
  createContent: boolean
  editContent: boolean
  publishContent: boolean
  deleteContent: boolean
  viewAuditLog: boolean
}

export interface StaffPayload {
  username: string
  displayName: string
  contactEmail?: string
  temporaryPassword?: string
  role: AdminRole
  active: boolean
  mustChangePassword: boolean
  allowedSectionIds: string[]
  permissions: Partial<StaffPermissions>
}

export interface StaffActor {
  uid: string
  username: string
  displayName: string
  role: AdminRole
  protectedOwner: boolean
  active: boolean
  allowedSectionIds: string[]
  permissions: StaffPermissions
}

export interface StaffTarget {
  uid: string
  normalizedUsername: string
  role: AdminRole
  protectedOwner: boolean
  active: boolean
}

export const protectedOwnerEmail = 'gastonstuart@googlemail.com'
export const protectedOwnerUsername = 'stuart'
export const internalStaffAuthDomain = 'staff.eep-student-showcase.local'

const reservedUsernames = new Set(['admin', 'administrator', 'root', 'system', 'support', 'firebase'])

export const validSectionIds = [
  'ied',
  'eep',
  'esl',
  'esl-science',
  'esl-language-arts',
  'esl-performance-arts',
  'esl-social-studies',
] as const

export const validSectionIdSet = new Set<string>(validSectionIds)

export const permissionKeys = [
  'manageUsers',
  'manageProjects',
  'manageHubSettings',
  'createContent',
  'editContent',
  'publishContent',
  'deleteContent',
  'viewAuditLog',
] as const satisfies readonly (keyof StaffPermissions)[]

export const fullPermissions: StaffPermissions = {
  manageUsers: true,
  manageProjects: true,
  manageHubSettings: true,
  createContent: true,
  editContent: true,
  publishContent: true,
  deleteContent: true,
  viewAuditLog: true,
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase()
}

export function validateUsername(username: string) {
  const normalizedUsername = normalizeUsername(username)

  if (!/^[a-z0-9._-]{3,32}$/.test(normalizedUsername)) {
    throw new HttpsError('invalid-argument', 'Use 3-32 lowercase letters, numbers, dots, hyphens, or underscores.')
  }

  if (reservedUsernames.has(normalizedUsername)) {
    throw new HttpsError('invalid-argument', 'This username is reserved for system operations.')
  }

  return normalizedUsername
}

export function staffAuthEmail(username: string) {
  const normalizedUsername = normalizeUsername(username)
  return normalizedUsername === protectedOwnerUsername
    ? protectedOwnerEmail
    : `${normalizedUsername}@${internalStaffAuthDomain}`
}

export function normalizePermissions(role: AdminRole, permissions: Partial<StaffPermissions>) {
  if (role === 'superAdmin') {
    return { ...fullPermissions }
  }

  return permissionKeys.reduce<StaffPermissions>(
    (normalized, key) => ({
      ...normalized,
      [key]: Boolean(permissions[key]),
    }),
    {
      manageUsers: false,
      manageProjects: false,
      manageHubSettings: false,
      createContent: false,
      editContent: false,
      publishContent: false,
      deleteContent: false,
      viewAuditLog: false,
    },
  )
}

export function assertPassword(password: unknown) {
  if (typeof password !== 'string' || password.length < 12) {
    throw new HttpsError('invalid-argument', 'Staff passwords must be at least 12 characters.')
  }
}

export function assertValidUid(uid: unknown) {
  if (typeof uid !== 'string' || !/^[A-Za-z0-9_-]{6,128}$/.test(uid)) {
    throw new HttpsError('invalid-argument', 'Choose a valid staff account.')
  }

  return uid
}

export function assertAuthenticated(auth: unknown): asserts auth is { uid: string; token: Record<string, unknown> } {
  if (!auth || typeof auth !== 'object' || !('uid' in auth) || typeof (auth as { uid?: unknown }).uid !== 'string') {
    throw new HttpsError('unauthenticated', 'Sign in with a staff account first.')
  }
}

export function assertCanManageUsers(caller: StaffActor) {
  if (!caller.active || (caller.role !== 'superAdmin' && !caller.permissions.manageUsers)) {
    throw new HttpsError('permission-denied', 'This staff account cannot manage users.')
  }
}

export function assertCanAssignRole(caller: StaffActor, role: AdminRole) {
  if (role === 'superAdmin' && !caller.protectedOwner) {
    throw new HttpsError('permission-denied', 'Only the protected owner can create or change super administrators.')
  }
}

export function assertValidSections(sectionIds: string[]) {
  if (!sectionIds.length) {
    throw new HttpsError('invalid-argument', 'Choose at least one valid section.')
  }

  const seen = new Set<string>()
  for (const sectionId of sectionIds) {
    if (sectionId === '*') {
      continue
    }
    if (!validSectionIdSet.has(sectionId)) {
      throw new HttpsError('invalid-argument', 'Choose valid IED Hub sections.')
    }
    if (seen.has(sectionId)) {
      throw new HttpsError('invalid-argument', 'Section access cannot include duplicates.')
    }
    seen.add(sectionId)
  }
}

export function assertPermissionSubset(caller: StaffActor, requestedPermissions: StaffPermissions) {
  if (caller.protectedOwner) return

  const exceededPermission = permissionKeys.find((key) => requestedPermissions[key] && !caller.permissions[key])
  if (exceededPermission) {
    throw new HttpsError('permission-denied', 'Staff administrators can only grant permissions they already hold.')
  }
}

export function assertSectionSubset(caller: StaffActor, requestedSectionIds: string[]) {
  assertValidSections(requestedSectionIds)

  if (requestedSectionIds.includes('*')) {
    if (!caller.protectedOwner || requestedSectionIds.length !== 1) {
      throw new HttpsError('permission-denied', 'Only the protected owner can assign global section access.')
    }
    return
  }

  if (caller.protectedOwner || caller.allowedSectionIds.includes('*')) {
    return
  }

  const callerSections = new Set(caller.allowedSectionIds)
  if (requestedSectionIds.some((sectionId) => !callerSections.has(sectionId))) {
    throw new HttpsError('permission-denied', 'Staff administrators can only assign sections they already hold.')
  }
}

export function assertCanAssignAccess(caller: StaffActor, payload: { role: AdminRole; allowedSectionIds: string[]; permissions: StaffPermissions }) {
  assertCanAssignRole(caller, payload.role)
  assertSectionSubset(caller, payload.allowedSectionIds)
  assertPermissionSubset(caller, payload.permissions)
}

export function assertCanManageTarget(
  caller: StaffActor,
  target: StaffTarget,
  action: 'profileUpdate' | 'passwordReset' | 'enable' | 'disable' | 'archive',
  desiredRole?: AdminRole,
) {
  if (target.protectedOwner) {
    if (action !== 'profileUpdate' || !caller.protectedOwner || caller.uid !== target.uid) {
      throw new HttpsError('permission-denied', 'The protected owner account cannot be disabled, archived, reset, or managed by another account.')
    }
  }

  if (target.role === 'superAdmin' && !caller.protectedOwner) {
    throw new HttpsError('permission-denied', 'Only the protected owner can manage super administrators.')
  }

  if (desiredRole) {
    assertCanAssignRole(caller, desiredRole)
  }
}

export function permissionsAreFull(permissions: Partial<StaffPermissions> | undefined) {
  return Boolean(permissions) && permissionKeys.every((key) => permissions?.[key] === true)
}

export function assertProtectedOwnerPayload(payload: {
  username: string
  role: AdminRole
  active: boolean
  mustChangePassword: boolean
  allowedSectionIds: string[]
  permissions: Partial<StaffPermissions>
}) {
  const sectionAccessIsExact = payload.allowedSectionIds.length === 1 && payload.allowedSectionIds[0] === '*'

  if (
    normalizeUsername(payload.username) !== protectedOwnerUsername ||
    payload.role !== 'superAdmin' ||
    payload.active !== true ||
    payload.mustChangePassword !== false ||
    !sectionAccessIsExact ||
    !permissionsAreFull(payload.permissions)
  ) {
    throw new HttpsError('permission-denied', 'Protected-owner role, status, username, section access, and permissions cannot be changed.')
  }
}

export function assertRecentAuthentication(authTime: unknown, nowSeconds = Math.floor(Date.now() / 1000), maxAgeSeconds = 5 * 60) {
  const parsedAuthTime = typeof authTime === 'number' ? authTime : Number(authTime)

  if (!Number.isFinite(parsedAuthTime) || parsedAuthTime > nowSeconds + 60 || nowSeconds - parsedAuthTime > maxAgeSeconds) {
    throw new HttpsError('failed-precondition', 'Sign in again before changing the password.')
  }
}

export function assertUsernameAvailable(exists: boolean) {
  if (exists) {
    throw new HttpsError('already-exists', 'A staff account already uses that username.')
  }
}

export function buildStaffDocument(payload: {
  username: string
  displayName: string
  contactEmail: string
  role: AdminRole
  active: boolean
  allowedSectionIds: string[]
  permissions: StaffPermissions
}, authEmail: string, callerUid: string) {
  return {
    email: payload.contactEmail || authEmail,
    username: payload.username,
    normalizedUsername: payload.username,
    authEmail,
    contactEmail: payload.contactEmail,
    displayName: payload.displayName,
    role: payload.role,
    active: payload.active,
    protectedOwner: false,
    mustChangePassword: true,
    allowedSectionIds: payload.allowedSectionIds,
    permissions: payload.permissions,
    createdBy: callerUid,
    updatedBy: callerUid,
  }
}

export function protectedOwnerNeedsRepair(existing: Record<string, unknown> | undefined) {
  if (!existing) {
    return true
  }

  return (
    existing.username !== protectedOwnerUsername ||
    existing.normalizedUsername !== protectedOwnerUsername ||
    existing.authEmail !== protectedOwnerEmail ||
    existing.role !== 'superAdmin' ||
    existing.active !== true ||
    existing.protectedOwner !== true ||
    existing.mustChangePassword !== false ||
    !Array.isArray(existing.allowedSectionIds) ||
    existing.allowedSectionIds.length !== 1 ||
    existing.allowedSectionIds[0] !== '*' ||
    !permissionsAreFull(existing.permissions as Partial<StaffPermissions> | undefined)
  )
}

export function rejectClientSignup(): never {
  throw new HttpsError('permission-denied', 'Staff accounts must be created by an IED Hub administrator.')
}
