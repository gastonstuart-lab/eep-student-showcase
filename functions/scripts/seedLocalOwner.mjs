import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const protectedOwnerEmail = 'gastonstuart@googlemail.com'
const protectedOwnerUsername = 'stuart'
const defaultPassword = 'LocalOwnerPass123!'

const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099'
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080'

process.env.FIREBASE_AUTH_EMULATOR_HOST = authHost
process.env.FIRESTORE_EMULATOR_HOST = firestoreHost

if (!process.env.GCLOUD_PROJECT) {
  process.env.GCLOUD_PROJECT = 'eep-student-showcase'
}

initializeApp({ projectId: process.env.GCLOUD_PROJECT })

async function ensureOwnerAuthUser() {
  const auth = getAuth()

  try {
    return { user: await auth.getUserByEmail(protectedOwnerEmail), created: false }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/user-not-found') {
      const password = process.env.LOCAL_OWNER_PASSWORD || defaultPassword
      const user = await auth.createUser({
        email: protectedOwnerEmail,
        password,
        displayName: 'Stuart',
        emailVerified: true,
        disabled: false,
      })
      return { user, created: true }
    }

    throw error
  }
}

async function seed() {
  const db = getFirestore()
  const { user, created } = await ensureOwnerAuthUser()

  await db.doc(`adminUsers/${user.uid}`).set({
    username: protectedOwnerUsername,
    normalizedUsername: protectedOwnerUsername,
    authEmail: protectedOwnerEmail,
    email: protectedOwnerEmail,
    contactEmail: protectedOwnerEmail,
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
    updatedAt: FieldValue.serverTimestamp(),
    ...(created
      ? {
          createdAt: FieldValue.serverTimestamp(),
          createdBy: user.uid,
        }
      : {}),
    updatedBy: user.uid,
  }, { merge: true })

  await db.doc(`staffUsernames/${protectedOwnerUsername}`).set({
    uid: user.uid,
    username: protectedOwnerUsername,
    protectedOwner: true,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true })

  await getAuth().setCustomUserClaims(user.uid, {
    staff: true,
    role: 'superAdmin',
    protectedOwner: true,
  })

  const note = created
    ? 'Created local owner auth user.'
    : 'Reused existing local owner auth user.'

  console.log(note)
  console.log(`Owner UID: ${user.uid}`)
  console.log(`Username login: ${protectedOwnerUsername}`)
  console.log(`Email login: ${protectedOwnerEmail}`)
  console.log('Local owner Firestore record is ready.')

  if (created && !process.env.LOCAL_OWNER_PASSWORD) {
    console.log('Temporary local owner password used: LocalOwnerPass123!')
  }
}

seed().catch((error) => {
  console.error('Failed to seed local owner:', error)
  process.exitCode = 1
})
