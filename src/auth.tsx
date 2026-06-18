/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reload,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { watchAdminUser } from './data'
import { auth, functions, isFirebaseConfigured } from './firebase'
import type { AdminRole, AdminUser, StaffPermissions } from './types'
import {
  canManageHubSettingsForAdmin,
  canManageProjectsForAdmin,
  canManageSectionForAdmin,
  canManageUsersForAdmin,
  canViewAuditLogForAdmin,
  fullStaffPermissions,
} from './utils/authorization'
import { loginIdentifierToAuthEmail, protectedOwnerEmail, protectedOwnerUsername } from './utils/staffAuth'

export const bootstrapSuperAdminEmail = protectedOwnerEmail

export interface EffectiveAdmin {
  id: string
  email: string
  username: string
  normalizedUsername: string
  authEmail: string
  contactEmail: string
  displayName: string
  role: AdminRole
  active: boolean
  protectedOwner: boolean
  mustChangePassword: boolean
  allowedSectionIds: string[]
  permissions: StaffPermissions
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
  canManageUsers: boolean
  canManageSection: (sectionId: string) => boolean
  canManageHubSettings: (sectionId: string) => boolean
  canManageProjects: boolean
  canViewAuditLog: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<User | null>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
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
    return 'The username or password was not recognised. Check the details and try again.'
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many attempts were made. Please wait a while before trying again.'
  }

  if (code === 'auth/network-request-failed' || code === 'functions/unavailable' || message.toLowerCase().includes('network')) {
    return 'The network connection is unavailable. Check your connection and try again.'
  }

  if (code === 'auth/user-disabled') {
    return 'This staff account has been disabled. Ask an IED Hub administrator for help.'
  }

  if (code === 'functions/failed-precondition') {
    return 'For security, sign out and sign in again before changing the password.'
  }

  if (code === 'functions/permission-denied') {
    return 'This account is not authorised to complete that staff action.'
  }

  if (message.includes('Firebase Auth is not configured') || message.includes('Firebase Functions are not configured')) {
    return 'Firebase is not connected. Ask the site administrator to check the app configuration.'
  }

  if (code === 'auth/missing-email') {
    return 'Enter a staff username first.'
  }

  return 'Something went wrong. Please try again.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(auth))
  const [adminRecordState, setAdminRecordState] = useState<{ uid: string; record: AdminUser | null } | null>(null)
  const [adminError, setAdminError] = useState('')
  const [authVersion, setAuthVersion] = useState(0)
  const ownerBootstrapUid = useRef('')

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
    if (!user) {
      ownerBootstrapUid.current = ''
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

  useEffect(() => {
    const isProtectedOwner = user?.email?.toLowerCase() === bootstrapSuperAdminEmail

    if (!user || !isProtectedOwner || !functions || ownerBootstrapUid.current === user.uid) {
      return
    }

    ownerBootstrapUid.current = user.uid
    const ensureOwner = httpsCallable(functions, 'ensureProtectedOwnerRecord')

    void ensureOwner()
      .then(() => {
        setAdminRecordState(null)
        setAdminError('')
        setAuthVersion((version) => version + 1)
      })
      .catch(() => {
        ownerBootstrapUid.current = ''
        setAdminError('Protected owner access is active, but the persistent owner record could not be prepared.')
      })
  }, [user])

  const userUid = user?.uid
  const userEmail = user?.email ?? null
  const userDisplayName = user?.displayName ?? null

  const bootstrapAdmin = useMemo<EffectiveAdmin | null>(() => {
    const email = userEmail?.toLowerCase()

    if (!userUid || email !== bootstrapSuperAdminEmail) {
      return null
    }

    return {
      id: userUid,
      email: userEmail ?? bootstrapSuperAdminEmail,
      username: protectedOwnerUsername,
      normalizedUsername: protectedOwnerUsername,
      authEmail: bootstrapSuperAdminEmail,
      contactEmail: bootstrapSuperAdminEmail,
      displayName: userDisplayName ?? 'Stuart',
      role: 'superAdmin',
      active: true,
      protectedOwner: true,
      mustChangePassword: false,
      allowedSectionIds: ['*'],
      permissions: fullStaffPermissions,
      source: 'bootstrap',
    }
  }, [userDisplayName, userEmail, userUid])

  const observedAdminUid = adminRecordState?.uid ?? ''
  const adminRecord = observedAdminUid === userUid ? adminRecordState?.record ?? null : null
  const isAdminRecordLoading = Boolean(
    user &&
    isFirebaseConfigured &&
    !bootstrapAdmin &&
    observedAdminUid !== userUid &&
    !adminError,
  )

  const effectiveAdmin = useMemo<EffectiveAdmin | null>(() => {
    if (bootstrapAdmin) {
      return bootstrapAdmin
    }

    if (!user || !adminRecord?.active) {
      return null
    }

    return {
      id: adminRecord.id,
      email: adminRecord.email,
      username: adminRecord.username,
      normalizedUsername: adminRecord.normalizedUsername,
      authEmail: adminRecord.authEmail,
      contactEmail: adminRecord.contactEmail,
      displayName: adminRecord.displayName,
      role: adminRecord.role,
      active: adminRecord.active,
      protectedOwner: adminRecord.protectedOwner,
      mustChangePassword: adminRecord.mustChangePassword,
      allowedSectionIds: adminRecord.allowedSectionIds,
      permissions: adminRecord.permissions,
      source: 'adminUsers',
    }
  }, [adminRecord, bootstrapAdmin, user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      adminLoading: isAdminRecordLoading,
      adminError,
      adminUser: effectiveAdmin,
      isAdmin: Boolean(effectiveAdmin),
      isSuperAdmin: effectiveAdmin?.role === 'superAdmin',
      canManageUsers: canManageUsersForAdmin(effectiveAdmin),
      canManageSection: (sectionId: string) => canManageSectionForAdmin(effectiveAdmin, sectionId),
      canManageHubSettings: (sectionId: string) => canManageHubSettingsForAdmin(effectiveAdmin, sectionId),
      canManageProjects: canManageProjectsForAdmin(effectiveAdmin),
      canViewAuditLog: canViewAuditLogForAdmin(effectiveAdmin),
      login: async (username: string, password: string) => {
        if (!auth) {
          throw new Error('Firebase Auth is not configured.')
        }
        await signInWithEmailAndPassword(auth, loginIdentifierToAuthEmail(username), password)
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
      changePassword: async (currentPassword: string, newPassword: string) => {
        const currentUser = auth?.currentUser ?? user

        if (!currentUser?.email) {
          throw new Error('No signed-in staff account was found.')
        }

        if (!functions) {
          throw new Error('Firebase Functions are not configured.')
        }

        await reauthenticateWithCredential(currentUser, EmailAuthProvider.credential(currentUser.email, currentPassword))
        await currentUser.getIdToken(true)
        const changeOwnPassword = httpsCallable(functions, 'changeOwnPassword')
        await changeOwnPassword({ newPassword })
        if (auth) {
          await signOut(auth)
        }
        setUser(null)
        setAdminRecordState(null)
        setAuthVersion((version) => version + 1)
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
