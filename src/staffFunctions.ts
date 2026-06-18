import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'
import type { AdminRole, StaffPermissions } from './types'

interface StaffAccessPayload {
  username: string
  displayName: string
  contactEmail: string
  temporaryPassword?: string
  role: AdminRole
  active: boolean
  mustChangePassword: boolean
  allowedSectionIds: string[]
  permissions: StaffPermissions
}

function requireFunctions() {
  if (!functions) {
    throw new Error('Firebase Functions are not configured. Run the Functions emulator locally or deploy the staff access functions before changing staff accounts.')
  }

  return functions
}

export const createStaffUser = (payload: StaffAccessPayload & { temporaryPassword: string }) =>
  httpsCallable(requireFunctions(), 'createStaffUser')(payload)

export const updateStaffAccess = (uid: string, payload: StaffAccessPayload) =>
  httpsCallable(requireFunctions(), 'updateStaffAccess')({ uid, ...payload })

export const resetStaffPassword = (uid: string, temporaryPassword: string) =>
  httpsCallable(requireFunctions(), 'resetStaffPassword')({ uid, temporaryPassword })

export const enableStaffUser = (uid: string) => httpsCallable(requireFunctions(), 'enableStaffUser')({ uid })

export const disableStaffUser = (uid: string) => httpsCallable(requireFunctions(), 'disableStaffUser')({ uid })

export const archiveStaffUser = (uid: string) => httpsCallable(requireFunctions(), 'archiveStaffUser')({ uid })

export const ensureProtectedOwnerRecord = () => httpsCallable(requireFunctions(), 'ensureProtectedOwnerRecord')()

export const changeOwnPassword = (newPassword: string) => httpsCallable(requireFunctions(), 'changeOwnPassword')({ newPassword })
