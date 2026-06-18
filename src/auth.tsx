/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { watchAdminUser } from './data'
import { auth, isFirebaseConfigured } from './firebase'
import type { AdminRole, AdminUser } from './types'
import { canManageProjectsForAdmin, canManageSectionForAdmin } from './utils/authorization'

export const bootstrapSuperAdminEmail = 'gastonstuart@googlemail.com'

export interface EffectiveAdmin {
  id: string
  email: string
  displayName: string
  role: AdminRole
  active: boolean
  allowedSectionIds: string[]
  source: 'bootstrap' | 'adminUsers'
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  adminLoading: boolean
  adminError: string
  adminUser: EffectiveAdmin | null
  isAdmin: boolean
  isSuperAdmin: boolean
  canManageSection: (sectionId: string) => boolean
  canManageProjects: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<User | null>
  sendVerificationEmail: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function mapAuthError(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code?: unknown }).code)
    : ''
  const message = error instanceof Error ? error.message : ''

  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/user-not-found' ||
    code === 'auth/wrong-password' ||
    code === 'auth/invalid-email'
  ) {
    return 'The email or password was not recognised. Check the details and try again.'
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many attempts were made. Please wait a while before trying again.'
  }

  if (code === 'auth/network-request-failed' || message.toLowerCase().includes('network')) {
    return 'The network connection is unavailable. Check your connection and try again.'
  }

  if (code === 'auth/user-disabled') {
    return 'This teacher account has been disabled. Ask a super administrator for help.'
  }

  if (message.includes('Firebase Auth is not configured')) {
    return 'Firebase is not connected. Ask the site administrator to check the app configuration.'
  }

  if (code === 'auth/missing-email') {
    return 'Enter a teacher email address first.'
  }

  return 'Something went wrong. Please try again.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(auth))
  const [adminRecordState, setAdminRecordState] = useState<{ uid: string; record: AdminUser | null } | null>(null)
  const [adminError, setAdminError] = useState('')
  const [authVersion, setAuthVersion] = useState(0)

  useEffect(() => {
    if (!auth) {
      return undefined
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setAdminRecordState(null)
      setLoading(false)
      setAuthVersion((version) => version + 1)
    })
  }, [])

  useEffect(() => {
    if (!user || !user.emailVerified) {
      return undefined
    }

    const unsubscribe = watchAdminUser(
      user.uid,
      (nextAdminUser) => {
        setAdminRecordState({ uid: user.uid, record: nextAdminUser })
        setAdminError('')
      },
      (error) => {
        setAdminError(error.message)
      },
    )

    return unsubscribe
  }, [authVersion, user])

  const userUid = user?.uid
  const userEmail = user?.email ?? null
  const userDisplayName = user?.displayName ?? null
  const userEmailVerified = Boolean(user?.emailVerified)

  const bootstrapAdmin = useMemo<EffectiveAdmin | null>(() => {
    const email = userEmail?.toLowerCase()

    if (!userUid || email !== bootstrapSuperAdminEmail || !userEmailVerified) {
      return null
    }

    return {
      id: userUid,
      email: userEmail ?? bootstrapSuperAdminEmail,
      displayName: userDisplayName ?? 'Bootstrap administrator',
      role: 'superAdmin',
      active: true,
      allowedSectionIds: ['*'],
      source: 'bootstrap',
    }
  }, [userDisplayName, userEmail, userEmailVerified, userUid])

  const observedAdminUid = adminRecordState?.uid ?? ''
  const adminRecord = observedAdminUid === userUid ? adminRecordState?.record ?? null : null
  const isAdminRecordLoading = Boolean(
    user &&
      userEmailVerified &&
      isFirebaseConfigured &&
      !bootstrapAdmin &&
      observedAdminUid !== userUid &&
      !adminError,
  )

  const effectiveAdmin = useMemo<EffectiveAdmin | null>(() => {
    if (bootstrapAdmin) {
      return bootstrapAdmin
    }

    if (!user || !userEmailVerified || !adminRecord?.active) {
      return null
    }

    return {
      id: adminRecord.id,
      email: adminRecord.email,
      displayName: adminRecord.displayName,
      role: adminRecord.role,
      active: adminRecord.active,
      allowedSectionIds: adminRecord.allowedSectionIds,
      source: 'adminUsers',
    }
  }, [adminRecord, bootstrapAdmin, user, userEmailVerified])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      adminLoading: isAdminRecordLoading,
      adminError,
      adminUser: effectiveAdmin,
      isAdmin: Boolean(effectiveAdmin),
      isSuperAdmin: effectiveAdmin?.role === 'superAdmin',
      canManageSection: (sectionId: string) => canManageSectionForAdmin(effectiveAdmin, sectionId),
      canManageProjects: canManageProjectsForAdmin(effectiveAdmin),
      login: async (email: string, password: string) => {
        if (!auth) {
          throw new Error('Firebase Auth is not configured.')
        }
        await signInWithEmailAndPassword(auth, email, password)
      },
      logout: async () => {
        if (auth) {
          await signOut(auth)
        }
      },
      refreshUser: async () => {
        const currentUser = auth?.currentUser ?? user

        if (!currentUser) {
          setUser(null)
          setAuthVersion((version) => version + 1)
          return null
        }

        await reload(currentUser)
        await currentUser.getIdToken(true)
        const refreshedUser = auth?.currentUser ?? currentUser
        setUser(refreshedUser)
        setAdminRecordState(null)
        setAuthVersion((version) => version + 1)
        return refreshedUser
      },
      sendVerificationEmail: async () => {
        const currentUser = auth?.currentUser ?? user

        if (!currentUser) {
          throw new Error('No signed-in teacher account was found.')
        }

        await sendEmailVerification(currentUser)
      },
      sendPasswordReset: async (email: string) => {
        if (!auth) {
          throw new Error('Firebase Auth is not configured.')
        }

        await sendPasswordResetEmail(auth, email)
      },
    }),
    [adminError, effectiveAdmin, isAdminRecordLoading, loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
