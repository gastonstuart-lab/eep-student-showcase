import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const projectId = process.env.GCLOUD_PROJECT || 'eep-student-showcase'
process.env.GCLOUD_PROJECT = projectId
process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099'
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080'

initializeApp({ projectId })

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const username = 'science.jones'
const authEmail = `${username}@staff.eep-student-showcase.local`
const authUser = await getAuth().getUserByEmail(authEmail)
const staffSnapshot = await getFirestore().doc(`adminUsers/${authUser.uid}`).get()
const staff = staffSnapshot.data()

assert(staffSnapshot.exists, 'Staff smoke did not create an adminUsers record.')
assert(staff?.normalizedUsername === username, 'Staff username mapping is incorrect.')
assert(staff?.authEmail === authEmail, 'Staff internal authentication email is incorrect.')
assert(staff?.active === false, 'Staff smoke did not finish with the account disabled.')
assert(staff?.mustChangePassword === false, 'First-login password change was not persisted.')
assert(authUser.disabled === true, 'Staff Auth account was not disabled.')
assert(!Object.prototype.hasOwnProperty.call(staff || {}, 'temporaryPassword'), 'A temporary credential was stored in Firestore.')

const audit = await getFirestore().collection('auditLogs').where('targetId', '==', authUser.uid).get()
const actions = audit.docs.map((snapshot) => snapshot.data().action)
for (const expected of ['staff.created', 'staff.passwordChanged', 'staff.disabled']) {
  assert(actions.includes(expected), `Missing expected audit action: ${expected}`)
}

console.log('Local staff smoke verification passed.')
console.log(`Verified lifecycle and audit records for ${username} (${authUser.uid}).`)
