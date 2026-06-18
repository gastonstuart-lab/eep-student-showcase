import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const projectId = process.env.GCLOUD_PROJECT || 'eep-student-showcase'
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099'
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080'
const functionsHost = process.env.FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001'

process.env.GCLOUD_PROJECT = projectId
process.env.FIREBASE_AUTH_EMULATOR_HOST = authHost
process.env.FIRESTORE_EMULATOR_HOST = firestoreHost

const ownerEmail = 'gastonstuart@googlemail.com'
const ownerUsername = 'stuart'
const ownerPassword = process.env.LOCAL_OWNER_PASSWORD || 'LocalOwnerPass123!'
const staffUsername = 'science.jones'
const tempPassword = 'TempSciencePass123!'
const newPassword = 'ScienceFinalPass123!'
const staffEmail = `${staffUsername}@staff.eep-student-showcase.local`

initializeApp({ projectId })

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function upsertOwnerAuthUser() {
  const auth = getAuth()

  try {
    return await auth.getUserByEmail(ownerEmail)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/user-not-found') {
      return auth.createUser({
        email: ownerEmail,
        password: ownerPassword,
        displayName: 'Stuart',
        emailVerified: true,
        disabled: false,
      })
    }

    throw error
  }
}

async function signInWithPassword(email, password) {
  const response = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  })

  const body = await response.json()

  if (!response.ok || !body.idToken) {
    throw new Error(`Sign-in failed for ${email}: ${JSON.stringify(body)}`)
  }

  return body.idToken
}

async function callCallable(name, idToken, data = {}) {
  const response = await fetch(`http://${functionsHost}/${projectId}/us-central1/${name}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${idToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ data }),
  })

  const body = await response.json()

  if (!response.ok || body.error) {
    throw new Error(`Callable ${name} failed: ${JSON.stringify(body)}`)
  }

  return body.result
}

async function run() {
  const db = getFirestore()
  const auth = getAuth()

  const owner = await upsertOwnerAuthUser()

  await db.doc(`adminUsers/${owner.uid}`).set({
    username: ownerUsername,
    normalizedUsername: ownerUsername,
    authEmail: ownerEmail,
    email: ownerEmail,
    contactEmail: ownerEmail,
    displayName: 'Stuart',
    role: 'superAdmin',
    active: true,
    protectedOwner: true,
    mustChangePassword: false,
    allowedSectionIds: ['*'],
    permissions: {
      manageUsers: true,
      manageProjects: true,
      manageHubSettings: true,
      createContent: true,
      editContent: true,
      publishContent: true,
      deleteContent: true,
      viewAuditLog: true,
    },
    updatedAt: new Date(),
  }, { merge: true })

  await db.doc(`staffUsernames/${ownerUsername}`).set({
    uid: owner.uid,
    username: ownerUsername,
    protectedOwner: true,
    updatedAt: new Date(),
  }, { merge: true })

  const ownerToken = await signInWithPassword(ownerEmail, ownerPassword)

  await callCallable('ensureProtectedOwnerRecord', ownerToken)

  const createResult = await callCallable('createStaffUser', ownerToken, {
    username: staffUsername,
    displayName: 'Science Jones',
    contactEmail: 'science.jones@example.com',
    temporaryPassword: tempPassword,
    role: 'editor',
    active: true,
    mustChangePassword: true,
    allowedSectionIds: ['esl-science'],
    permissions: {
      manageUsers: false,
      manageProjects: false,
      manageHubSettings: false,
      createContent: true,
      editContent: true,
      publishContent: false,
      deleteContent: false,
      viewAuditLog: false,
    },
  })

  const staffUid = String(createResult.uid || '')
  assert(staffUid.length >= 6, 'createStaffUser did not return a valid uid')

  const staffDoc = await db.doc(`adminUsers/${staffUid}`).get()
  const staffData = staffDoc.data()
  assert(Boolean(staffData), 'Missing adminUsers record for created staff user')
  assert(staffData.mustChangePassword === true, 'Created staff user must have mustChangePassword=true')
  assert(staffData.authEmail === staffEmail, 'Created staff user authEmail did not match fixed internal domain')
  assert(typeof staffData.permissions === 'object', 'Created staff user permissions were not persisted')
  assert(!Object.prototype.hasOwnProperty.call(staffData, 'temporaryPassword'), 'temporaryPassword was stored in Firestore')

  const staffToken = await signInWithPassword(staffEmail, tempPassword)
  const passwordChange = await callCallable('changeOwnPassword', staffToken, { newPassword })
  assert(passwordChange?.signOutRequired === true, 'changeOwnPassword must require sign-out after password change')

  const updatedStaffDoc = await db.doc(`adminUsers/${staffUid}`).get()
  assert(updatedStaffDoc.data()?.mustChangePassword === false, 'mustChangePassword was not cleared after changeOwnPassword')

  await signInWithPassword(staffEmail, newPassword)

  await callCallable('disableStaffUser', ownerToken, { uid: staffUid })

  const disabledStaffDoc = await db.doc(`adminUsers/${staffUid}`).get()
  assert(disabledStaffDoc.data()?.active === false, 'disableStaffUser did not mark staff account inactive')

  const staffAuthUser = await auth.getUser(staffUid)
  assert(staffAuthUser.disabled === true, 'disableStaffUser did not disable the Firebase Auth account')

  console.log('Local staff-flow smoke test passed.')
  console.log(`Created and validated user: ${staffUsername} (${staffUid})`)
}

run().catch((error) => {
  console.error('Local staff-flow smoke test failed:', error)
  process.exitCode = 1
})
