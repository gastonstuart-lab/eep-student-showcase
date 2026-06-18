import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { beforeUserCreated } from 'firebase-functions/v2/identity'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import {
  assertAuthenticated,
  assertCanAssignRole,
  assertCanManageTarget,
  assertCanManageUsers,
  assertPassword,
  assertProtectedOwnerPayload,
  assertRecentAuthentication,
  assertUsernameAvailable,
  assertValidUid,
  buildStaffDocument,
  fullPermissions,
  normalizePermissions,
  normalizeUsername,
  protectedOwnerEmail,
  protectedOwnerNeedsRepair,
  protectedOwnerUsername,
  rejectClientSignup,
  staffAuthEmail,
  validateUsername,
  type AdminRole,
  type StaffActor,
  type StaffPayload,
  type StaffPermissions,
  type StaffTarget,
} from './staffSecurity.js'

initializeApp()

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

  const contactEmail = typeof payload.contactEmail === 'string' ? payload.contactEmail.trim().toLowerCase() : ''

  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    throw new HttpsError('invalid-argument', 'Enter a valid contact email or leave it blank.')
  }

  return {
    username,
    displayName: payload.displayName.trim(),
    contactEmail,
    temporaryPassword: payload.temporaryPassword,
    role: payload.role,
    active: Boolean(payload.active),
    mustChangePassword: Boolean(payload.mustChangePassword),
    allowedSectionIds: payload.role === 'superAdmin' ? ['*'] : payload.allowedSectionIds.filter((section) => section !== '*'),
    permissions: normalizePermissions(payload.role, payload.permissions ?? {}),
  }
}

function ownerActor(uid: string): StaffActor {
  return {
    uid,
    username: protectedOwnerUsername,
    displayName: 'Stuart',
    role: 'superAdmin',
    protectedOwner: true,
    active: true,
    permissions: fullPermissions,
  }
}

async function getCaller(uid: string, email?: string): Promise<StaffActor> {
  if (email?.toLowerCase() === protectedOwnerEmail) {
    return ownerActor(uid)
  }

  const snapshot = await getFirestore().doc(`adminUsers/${uid}`).get()
  const data = snapshot.data()

  if (!snapshot.exists || !data?.active) {
    throw new HttpsError('permission-denied', 'Only active staff accounts may use staff administration.')
  }

  const role = data.role as AdminRole

  return {
    uid,
    username: String(data.normalizedUsername ?? data.username ?? uid),
    displayName: String(data.displayName ?? ''),
    role,
    protectedOwner: Boolean(data.protectedOwner),
    active: Boolean(data.active),
    permissions: normalizePermissions(role, data.permissions ?? {}),
  }
}

async function requireManageUsers(request: { auth?: { uid: string; token: Record<string, unknown> } }) {
  assertAuthenticated(request.auth)
  const caller = await getCaller(request.auth.uid, String(request.auth.token.email ?? ''))
  assertCanManageUsers(caller)
  return caller
}

async function writeAudit(
  action: string,
  actor: StaffActor,
  targetType: string,
  targetId: string,
  summary: Record<string, unknown>,
) {
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

async function getTarget(uidValue: unknown) {
  const uid = assertValidUid(uidValue)
  const snapshot = await getFirestore().doc(`adminUsers/${uid}`).get()
  const data = snapshot.data()

  if (!snapshot.exists || !data) {
    throw new HttpsError('not-found', 'Staff account was not found.')
  }

  const target: StaffTarget & Record<string, unknown> = {
    ...data,
    uid,
    normalizedUsername: String(data.normalizedUsername ?? data.username ?? ''),
    role: data.role as AdminRole,
    protectedOwner: Boolean(data.protectedOwner),
    active: Boolean(data.active),
  }

  return { uid, target, snapshot }
}

async function ensureProtectedOwnerRecordFor(uid: string, email: string, displayName?: string | null) {
  if (email.toLowerCase() !== protectedOwnerEmail) {
    throw new HttpsError('permission-denied', 'Only the protected owner can bootstrap this account.')
  }

  const db = getFirestore()
  const adminRef = db.doc(`adminUsers/${uid}`)
  const usernameRef = db.doc(`staffUsernames/${protectedOwnerUsername}`)
  let repaired = false

  await db.runTransaction(async (transaction) => {
    const usernameSnapshot = await transaction.get(usernameRef)
    const usernameData = usernameSnapshot.data()
    const reservedUid = usernameData?.uid

    if (usernameSnapshot.exists && reservedUid != null && reservedUid !== uid) {
      throw new HttpsError('already-exists', 'The protected owner username is assigned to another account.')
    }

    const adminSnapshot = await transaction.get(adminRef)
    const existing = adminSnapshot.data()
    repaired = protectedOwnerNeedsRepair(existing) || !usernameSnapshot.exists || reservedUid !== uid

    const safeDisplayName = typeof existing?.displayName === 'string' && existing.displayName.trim()
      ? existing.displayName.trim()
      : displayName?.trim() || 'Stuart'
    const safeContactEmail = typeof existing?.contactEmail === 'string' && existing.contactEmail.trim()
      ? existing.contactEmail.trim().toLowerCase()
      : protectedOwnerEmail

    const ownerRecord: Record<string, unknown> = {
      email: protectedOwnerEmail,
      username: protectedOwnerUsername,
      normalizedUsername: protectedOwnerUsername,
      authEmail: protectedOwnerEmail,
      contactEmail: safeContactEmail,
      displayName: safeDisplayName,
      role: 'superAdmin',
      active: true,
      protectedOwner: true,
      mustChangePassword: false,
      allowedSectionIds: ['*'],
      permissions: fullPermissions,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: uid,
    }

    if (!adminSnapshot.exists) {
      ownerRecord.createdAt = FieldValue.serverTimestamp()
      ownerRecord.createdBy = uid
    }

    transaction.set(adminRef, ownerRecord, { merge: true })
    transaction.set(usernameRef, {
      uid,
      username: protectedOwnerUsername,
      protectedOwner: true,
      updatedAt: FieldValue.serverTimestamp(),
      ...(usernameSnapshot.exists ? {} : { createdAt: FieldValue.serverTimestamp(), createdBy: uid }),
    }, { merge: true })
  })

  await getAuth().setCustomUserClaims(uid, { staff: true, role: 'superAdmin', protectedOwner: true })
  return repaired
}

export const ensureProtectedOwnerRecord = onCall(async (request) => {
  assertAuthenticated(request.auth)
  const email = String(request.auth.token.email ?? '').toLowerCase()
  const caller = ownerActor(request.auth.uid)
  const repaired = await ensureProtectedOwnerRecordFor(request.auth.uid, email, String(request.auth.token.name ?? ''))

  if (repaired) {
    await writeAudit('staff.ownerBootstrapped', caller, 'adminUsers', request.auth.uid, {
      targetLabel: protectedOwnerUsername,
    })
  }

  return { uid: request.auth.uid, repaired }
})

export const createStaffUser = onCall(async (request) => {
  const caller = await requireManageUsers(request)
  const payload = assertStaffPayload(request.data, true)

  if (payload.username === protectedOwnerUsername) {
    throw new HttpsError('already-exists', 'The protected owner username is reserved.')
  }

  assertCanAssignRole(caller, payload.role)

  const db = getFirestore()
  const usernameRef = db.doc(`staffUsernames/${payload.username}`)
  const authEmail = staffAuthEmail(payload.username)

  await db.runTransaction(async (transaction) => {
    const usernameSnapshot = await transaction.get(usernameRef)
    assertUsernameAvailable(usernameSnapshot.exists)

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

    const staffDocument = buildStaffDocument(payload, authEmail, caller.uid)

    await db.runTransaction(async (transaction) => {
      transaction.set(db.doc(`adminUsers/${createdUid}`), {
        ...staffDocument,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
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
  const { uid, target } = await getTarget((request.data as { uid?: unknown }).uid)
  const payload = assertStaffPayload(request.data, false)

  assertCanManageTarget(caller, target, 'profileUpdate', payload.role)

  if (target.protectedOwner) {
    assertProtectedOwnerPayload(payload)

    await getFirestore().doc(`adminUsers/${uid}`).set({
      contactEmail: payload.contactEmail || protectedOwnerEmail,
      displayName: payload.displayName,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: caller.uid,
    }, { merge: true })
    await getAuth().updateUser(uid, { displayName: payload.displayName, disabled: false })
    await getAuth().setCustomUserClaims(uid, { staff: true, role: 'superAdmin', protectedOwner: true })
    await writeAudit('staff.ownerProfileUpdated', caller, 'adminUsers', uid, {
      targetLabel: protectedOwnerUsername,
    })
    return { uid }
  }

  if (payload.username !== target.normalizedUsername) {
    throw new HttpsError('failed-precondition', 'Staff usernames cannot be changed after account creation.')
  }

  await getFirestore().doc(`adminUsers/${uid}`).set({
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
    targetLabel: target.normalizedUsername || uid,
    role: payload.role,
    sections: payload.allowedSectionIds,
  })

  return { uid }
})

export const resetStaffPassword = onCall(async (request) => {
  const caller = await requireManageUsers(request)
  const { uid, target } = await getTarget((request.data as { uid?: unknown }).uid)
  const temporaryPassword = (request.data as { temporaryPassword?: unknown }).temporaryPassword
  assertPassword(temporaryPassword)
  assertCanManageTarget(caller, target, 'passwordReset')

  await getAuth().updateUser(uid, { password: String(temporaryPassword) })
  await getAuth().revokeRefreshTokens(uid)
  await getFirestore().doc(`adminUsers/${uid}`).set({
    mustChangePassword: true,
    lastPasswordResetAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: caller.uid,
  }, { merge: true })
  await writeAudit('staff.passwordReset', caller, 'adminUsers', uid, {
    targetLabel: target.normalizedUsername || uid,
  })
  return { uid }
})

export const enableStaffUser = onCall(async (request) => {
  const caller = await requireManageUsers(request)
  const { uid, target } = await getTarget((request.data as { uid?: unknown }).uid)
  assertCanManageTarget(caller, target, 'enable')

  await getAuth().updateUser(uid, { disabled: false })
  await getFirestore().doc(`adminUsers/${uid}`).set({
    active: true,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: caller.uid,
  }, { merge: true })
  await writeAudit('staff.enabled', caller, 'adminUsers', uid, { targetLabel: target.normalizedUsername || uid })
  return { uid }
})

export const disableStaffUser = onCall(async (request) => {
  const caller = await requireManageUsers(request)
  const { uid, target } = await getTarget((request.data as { uid?: unknown }).uid)
  assertCanManageTarget(caller, target, 'disable')

  await getAuth().updateUser(uid, { disabled: true })
  await getAuth().revokeRefreshTokens(uid)
  await getFirestore().doc(`adminUsers/${uid}`).set({
    active: false,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: caller.uid,
  }, { merge: true })
  await writeAudit('staff.disabled', caller, 'adminUsers', uid, { targetLabel: target.normalizedUsername || uid })
  return { uid }
})

export const archiveStaffUser = onCall(async (request) => {
  const caller = await requireManageUsers(request)
  const { uid, target } = await getTarget((request.data as { uid?: unknown }).uid)
  assertCanManageTarget(caller, target, 'archive')

  await getAuth().updateUser(uid, { disabled: true })
  await getAuth().revokeRefreshTokens(uid)
  await getFirestore().doc(`adminUsers/${uid}`).set({
    active: false,
    archived: true,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: caller.uid,
  }, { merge: true })
  await writeAudit('staff.archived', caller, 'adminUsers', uid, { targetLabel: target.normalizedUsername || uid })
  return { uid }
})

export const changeOwnPassword = onCall(async (request) => {
  assertAuthenticated(request.auth)
  assertRecentAuthentication(request.auth.token.auth_time)
  const newPassword = (request.data as { newPassword?: unknown }).newPassword
  assertPassword(newPassword)

  const email = String(request.auth.token.email ?? '').toLowerCase()
  const caller = await getCaller(request.auth.uid, email)

  if (caller.protectedOwner) {
    const repaired = await ensureProtectedOwnerRecordFor(request.auth.uid, email, String(request.auth.token.name ?? ''))
    if (repaired) {
      await writeAudit('staff.ownerBootstrapped', caller, 'adminUsers', request.auth.uid, {
        targetLabel: protectedOwnerUsername,
      })
    }
  }

  await getAuth().updateUser(request.auth.uid, { password: String(newPassword) })
  await getFirestore().doc(`adminUsers/${request.auth.uid}`).set({
    mustChangePassword: false,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: request.auth.uid,
  }, { merge: true })
  await writeAudit('staff.passwordChanged', caller, 'adminUsers', request.auth.uid, {
    targetLabel: caller.username,
  })
  await getAuth().revokeRefreshTokens(request.auth.uid)

  return { uid: request.auth.uid, signOutRequired: true }
})

export const blockUnprovisionedStaffSignup = beforeUserCreated(() => rejectClientSignup())

export {
  assertAuthenticated,
  assertCanAssignRole,
  assertCanManageTarget,
  assertCanManageUsers,
  assertPassword,
  assertProtectedOwnerPayload,
  assertRecentAuthentication,
  assertUsernameAvailable,
  assertValidUid,
  buildStaffDocument,
  fullPermissions,
  internalStaffAuthDomain,
  normalizePermissions,
  normalizeUsername,
  permissionsAreFull,
  protectedOwnerEmail,
  protectedOwnerNeedsRepair,
  protectedOwnerUsername,
  rejectClientSignup,
  staffAuthEmail,
  validateUsername,
} from './staffSecurity.js'

export type { AdminRole, StaffActor, StaffPayload, StaffPermissions, StaffTarget } from './staffSecurity.js'
