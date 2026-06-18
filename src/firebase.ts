import { initializeApp, type FirebaseApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions, type Functions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
)

export const useFirebaseEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true'

const emulatorHost = String(import.meta.env.VITE_FIREBASE_EMULATOR_HOST || '127.0.0.1')
const authEmulatorPort = Number(import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT || 9099)
const firestoreEmulatorPort = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || 8080)
const functionsEmulatorPort = Number(import.meta.env.VITE_FUNCTIONS_EMULATOR_PORT || 5001)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let functions: Functions | null = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY

  if (appCheckSiteKey && typeof window !== 'undefined') {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    })
  }

  auth = getAuth(app)
  db = getFirestore(app)
  functions = getFunctions(app)

  if (useFirebaseEmulators) {
    connectAuthEmulator(auth, `http://${emulatorHost}:${authEmulatorPort}`, { disableWarnings: true })
    connectFirestoreEmulator(db, emulatorHost, firestoreEmulatorPort)
    connectFunctionsEmulator(functions, emulatorHost, functionsEmulatorPort)
  }
}

export { app, auth, db, functions }
