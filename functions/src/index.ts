import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { beforeUserCreated } from 'firebase-functions/v2/identity'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

initializeApp()

type AdminRole = 'superAdmin' | 'admin' | 'editor'

interface StaffPermissions {
  manageUsers: boolean
  manageProjects: boolean
  manageHubSettings: boolean
  createContent: boolean
  editContent: boolean
  publishContent: boolean
  deleteContent: boolean
  viewAuditLog: boolean
}

interface StaffPayload {
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

const protectedOwnerEmail = 'gastonstuart@googlemail.com'
const protectedOwnerUsername = 'stuart'
const reservedUsernames = new Set(['admin', 'administrator', 'root', 'system', 'support', 'firebase'])
const permissionKeys = [
  'manageUsers',
  'manageProjects',
  'manageHubSettings',
  'createContent',
  'editContent',
  'publishContent',
  'deleteContent',
  'viewAuditLog',
] as const satisfies readonly (keyof StaffPermissions)[]

const fullPermissions: StaffPermissions = {
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

function staffAuthDomain() {
  return (process.env.STAFF_AUTH_DOMAIN || process.env.GCLOUD_PROJECT || 'staff.eep-student-showcase.local')
    .replace(/^https?:\/\//, '')
    .toLowerCase()
}

export function staffAuthEmail(username: string) {
  return username === protectedOwnerUsername ? protectedOwnerEmail : `${username}@${staffAuthDomain()}`
}

function normalizePermissions(role: AdminRole, permissions: Partial<StaffPermissions>) {
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

function assertPassword(password: unknown) {
  if (typeof password !== 'string' || password.length < 12) {
    throw new HttpsError('invalid-argument', 'Temporary passwords must be at least 12 characters.')
  }
}

function assertStaffPayload(data: unknown, requirePassword: boolean) {
  const payload = data as Partial<StaffPayload>
  const username = validateUsername(String(payload.username ?? ''))

  if (!payload.displayName || typeof payload.displayName !== 'string' || payload.displayName.trim().length > 120) {
    throw new HttpsError('invalid-argument', 'Display name is required.')
  }

  if (payload.role !== 'superAdmin' && payload.role !== 'admin' && payload.role !== 'editor') {
    throw new HttpsError('invalid-argument', 'Choose a valid staff role.')
  }

  if (!Array.isArray(payload.allowedSectionIds) || !payload.allowedSectionIds.every((section) => typeof section === 'string')) {
    throw new HttpsError('invalid-argument', 'Section access must be a list of section IDs.')
  }

  if (requirePassword) {
    assertPassword(payload.temporaryPassword)
  }

  return {
    username,
    displayName: payload.displayName.trim(),
    contactEmail: typeof payload.contactEmail === 'string' ? payload.contactEmail.trim().toLowerCase() : '',
    temporaryPassword: payload.temporaryPassword,
    role: payload.role,
    active: Boolean(payload.active),
    mustChangePassword: Boolean(payload.mustChangePassword),
    allowedSectionIds: payload.role === 'superAdmin' ? ['*'] : payload.allowedSectionIds.filter((section) => section !== '*'),
    permissions: normalizePermissions(payload.role, payload.permissions ?? {}),
  }
}

async function getCaller(uid: string, email?: string) {
  if (email?.toLowerCase() === protectedOwnerEmail) {
    return {
      uid,
      username: protectedOwnerUsername,
      displayName: 'Stuart',
      role: 'superAdmin' as AdminRole,
      protectedOwner: true,
      active: true,
      permissions: fullPermissions,
    }
  }

  const snapshot = await getFirestore().doc(`adminUsers/${uid}`).get()
  const data = snapshot.data()

  if (!snapshot.exists || !data?.active) {
    throw new HttpsError('permission-denied', 'Only active staff accounts may manage staff access.')
  }

  return {
    uid,
    username: String(data.normalizedUsername ?? data.username ?? uid),
    displayName: String(data.displayName ?? ''),
    role: data.role as AdminRole,
    protectedOwner: Boolean(data.protectedOwner),
    active: Boolean(data.active),
    permissions: normalizePermissions(data.role as AdminRole, data.permissions ?? {}),
  }
}

async function requireManageUsers(request: { auth?: { uid: string; token: { email?: string } } }) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in with a staff account first.')
  }

  const caller = await getCaller(request.auth.uid, request.auth.token.email)

  if (caller.role !== 'superAdmin' && !caller.permissions.manageUsers) {
    throw new HttpsError('permission-denied', 'This staff account cannot manage users.')
  }

  return caller
}

function assertCanTouchStaff(caller: Awaited<ReturnType<typeof getCaller>>, target: { protectedOwner?: boolean; role?: AdminRole }) {
  if (target.protectedOwner && !caller.protectedOwner) {
    throw new HttpsError('permission-denied', 'Only the protected owner can change the protected owner account.')
  }

  if (target.role === 'superAdmin' && !caller.protectedOwner) {
    throw new HttpsError('permission-denied', 'Only the protected owner can create or change super administrators.')
  }
}

async function writeAudit(action: string, actor: Awaited<ReturnType<typeof getCaller>>, targetType: string, targetId: string, summary: Record<string, unknown>) {
  await getFirestore().collection('auditLogs').add({
    action,
    actorUid: actor.uid,
    actorUsername: actor.username,
    actorDisplayName: actor.displayName,
    targetType,
    targetId,
    targetLabel: summary.targetLabel ?? '',
    summary,
    createdAt: FieldValue.serverTimestamp(),
  })
}

export const createStaffUser = onCall(async (request) => {
  const caller = await requireManageUsers(request)
  const payload = assertStaffPayload(request.data, true)
  assertCanTouchStaff(caller, { role: payload.role })

  const db = getFirestore()
  const usernameRef = db.doc(`staffUsernames/${payload.username}`)
  const authEmail = staffAuthEmail(payload.username)

  await db.runTransaction(async (transaction) => {
    const usernameSnapshot = await transaction.get(usernameRef)

    if (usernameSnapshot.exists) {
      throw new HttpsError('already-exists', 'A staff account already uses that username.')
    }

    transaction.set(usernameRef, {
      uid: null,
      username: payload.username,
      createdBy: caller.uid,
      reservedAt: FieldValue.serverTimestamp(),
    })
  })

  let createdUid = ''

  try {
    const userRecord = await getAuth().createUser({
      email: authEmail,
      password: payload.temporaryPassword,
      displayName: payload.displayName,
      disabled: !payload.active,
      emailVerified: true,
    })
    createdUid = userRecord.uid
    await getAuth().setCustomUserClaims(createdUid, { staff: true, role: payload.role })

    await db.runTransaction(async (transaction) => {
      transaction.set(db.doc(`adminUsers/${createdUid}`), {
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
        createdAt: FieldValue.serverTimestamp(),
        createdBy: caller.uid,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: caller.uid,
      })
      transaction.set(usernameRef, { uid: createdUid, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
    })

    await writeAudit('staff.created', caller, 'adminUsers', createdUid, {
      targetLabel: payload.username,
      role: payload.role,
      sections: payload.allowedSectionIds,
    })

    return { uid: createdUid, username: payload.username }
  } catch (error) {
    await usernameRef.delete().catch(() => undefined)

    if (createdUid) {
      await getAuth().deleteUser(createdUid).catch(() => undefined)
    }

    throw error
  }
})

export const updateStaffAccess = onCall(async (request) => {
  const caller = await requireManageUsers(request)
  const uid = String((request.data as { uid?: unknown }).uid ?? '')
  const payload = assertStaffPayload(request.data, false)
  const db = getFirestore()
  const targetSnapshot = await db.doc(`adminUsers/${uid}`).get()
  const target = targetSnapshot.data()

  if (!targetSnapshot.exists || !target) {
    throw new HttpsError('not-found', 'Staff account was not found.')
  }

  assertCanTouchStaff(caller, { protectedOwner: Boolean(target.protectedOwner), role: payload.role })

  await db.doc(`adminUsers/${uid}`).set({
    contactEmail: payload.contactEmail,
    displayName: payload.displayName,
    role: payload.role,
    active: payload.active,
    mustChangePassword: payload.mustChangePassword,
    allowedSectionIds: payload.allowedSectionIds,
    permissions: payload.permissions,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: caller.uid,
  }, { merge: true })
  await getAuth().updateUser(uid, { displayName: payload.displayName, disabled: !payload.active })
  await getAuth().setCustomUserClaims(uid, { staff: true, role: payload.role })
  await writeAudit('staff.updated', caller, 'adminUsers', uid, {
    targetLabel: target.normalizedUsername ?? target.username ?? uid,
    role: payload.role,
    sections: payload.allowedSectionIds,
  })

  return { uid }
})

export const resetStaffPassword = onCall(async (request) => {
  const caller = await requireManageUsers(request)
  const uid = String((request.data as { uid?: unknown }).uid ?? '')
  const temporaryPassword = (request.data as { temporaryPassword?: unknown }).temporaryPassword
  assertPassword(temporaryPassword)

  const targetRef = getFirestore().doc(`adminUsers/${uid}`)
  const targetSnapshot = await targetRef.get()
  const target = targetSnapshot.data()

  if (!targetSnapshot.exists || !target) {
    throw new HttpsError('not-found', 'Staff account was not found.')
  }

  assertCanTouchStaff(caller, { protectedOwner: Boolean(target.protectedOwner), role: target.role as AdminRole })
  await getAuth().updateUser(uid, { password: String(temporaryPassword) })
  await getAuth().revokeRefreshTokens(uid)
  await targetRef.set({
    mustChangePassword: true,
    lastPasswordResetAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: caller.uid,
  }, { merge: true })
  await writeAudit('staff.passwordReset', caller, 'adminUsers', uid, { targetLabel: target.normalizedUsername ?? target.username ?? uid })
  return { uid }
})

export const enableStaffUser = onCall(async (request) => {
  const caller = await requireManageUsers(request)
  const uid = String((request.data as { uid?: unknown }).uid ?? '')
  await getAuth().updateUser(uid, { disabled: false })
  await getFirestore().doc(`adminUsers/${uid}`).set({
    active: true,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: caller.uid,
  }, { merge: true })
  await writeAudit('staff.enabled', caller, 'adminUsers', uid, {})
  return { uid }
})

export const disableStaffUser = onCall(async (request) => {
  const caller = await requireManageUsers(request)
  const uid = String((request.data as { uid?: unknown }).uid ?? '')
  const targetSnapshot = await getFirestore().doc(`adminUsers/${uid}`).get()
  const target = targetSnapshot.data()

  assertCanTouchStaff(caller, { protectedOwner: Boolean(target?.protectedOwner), role: target?.role as AdminRole })
  await getAuth().updateUser(uid, { disabled: true })
  await getAuth().revokeRefreshTokens(uid)
  await getFirestore().doc(`adminUsers/${uid}`).set({
    active: false,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: caller.uid,
  }, { merge: true })
  await writeAudit('staff.disabled', caller, 'adminUsers', uid, { targetLabel: target?.normalizedUsername ?? target?.username ?? uid })
  return { uid }
})

export const archiveStaffUser = onCall(async (request) => {
  const caller = await requireManageUsers(request)
  const uid = String((request.data as { uid?: unknown }).uid ?? '')
  const targetRef = getFirestore().doc(`adminUsers/${uid}`)
  const targetSnapshot = await targetRef.get()
  const target = targetSnapshot.data()

  assertCanTouchStaff(caller, { protectedOwner: Boolean(target?.protectedOwner), role: target?.role as AdminRole })
  await getAuth().updateUser(uid, { disabled: true })
  await targetRef.set({
    active: false,
    archived: true,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: caller.uid,
  }, { merge: true })
  await writeAudit('staff.archived', caller, 'adminUsers', uid, { targetLabel: target?.normalizedUsername ?? target?.username ?? uid })
  return { uid }
})

export const completeRequiredPasswordChange = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in first.')
  }

  await getFirestore().doc(`adminUsers/${request.auth.uid}`).set({
    mustChangePassword: false,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: request.auth.uid,
  }, { merge: true })
  return { uid: request.auth.uid }
})

export const blockUnprovisionedStaffSignup = beforeUserCreated(async (event) => {
  const email = event.data?.email?.toLowerCase() ?? ''
  const username = email === protectedOwnerEmail ? protectedOwnerUsername : email.split('@')[0]

  if (!email || email === protectedOwnerEmail) {
    return
  }

  const reservation = await getFirestore().doc(`staffUsernames/${username}`).get()

  if (!reservation.exists) {
    throw new HttpsError('permission-denied', 'Staff accounts must be created by an IED Hub administrator.')
  }
})
