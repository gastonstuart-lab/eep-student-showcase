/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
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
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(auth))
  const [adminRecordState, setAdminRecordState] = useState<{ uid: string; record: AdminUser | null } | null>(null)
  const [adminError, setAdminError] = useState('')

  useEffect(() => {
    if (!auth) {
      return undefined
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!user) {
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
  }, [user])

  const bootstrapAdmin = useMemo<EffectiveAdmin | null>(() => {
    const email = user?.email?.toLowerCase()

    if (!user || email !== bootstrapSuperAdminEmail || !user.emailVerified) {
      return null
    }

    return {
      id: user.uid,
      email: user.email ?? bootstrapSuperAdminEmail,
      displayName: user.displayName ?? 'Bootstrap administrator',
      role: 'superAdmin',
      active: true,
      allowedSectionIds: ['*'],
      source: 'bootstrap',
    }
  }, [user])

  const observedAdminUid = adminRecordState?.uid ?? ''
  const adminRecord = observedAdminUid === user?.uid ? adminRecordState?.record ?? null : null
  const isAdminRecordLoading = Boolean(
    user &&
      isFirebaseConfigured &&
      !bootstrapAdmin &&
      observedAdminUid !== user.uid &&
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
      displayName: adminRecord.displayName,
      role: adminRecord.role,
      active: adminRecord.active,
      allowedSectionIds: adminRecord.allowedSectionIds,
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
