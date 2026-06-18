export const protectedOwnerEmail = 'gastonstuart@googlemail.com'
export const protectedOwnerUsername = 'stuart'
export const defaultStaffAuthDomain = 'staff.eep-student-showcase.local'

const reservedUsernames = new Set(['admin', 'administrator', 'root', 'system', 'support', 'firebase'])

export function normalizeStaffUsername(username: string) {
  return username.trim().toLowerCase()
}

export function validateStaffUsername(username: string) {
  const normalizedUsername = normalizeStaffUsername(username)

  if (!/^[a-z0-9._-]{3,32}$/.test(normalizedUsername)) {
    return 'Use 3-32 lowercase letters, numbers, dots, hyphens, or underscores.'
  }

  if (reservedUsernames.has(normalizedUsername)) {
    return 'This username is reserved for system operations.'
  }

  return ''
}

export function getStaffAuthDomain() {
  return (
    import.meta.env.VITE_STAFF_AUTH_DOMAIN ||
    defaultStaffAuthDomain
  )
    .replace(/^https?:\/\//, '')
    .trim()
    .toLowerCase()
}

export function staffUsernameToAuthEmail(username: string) {
  const normalizedUsername = normalizeStaffUsername(username)

  if (normalizedUsername === protectedOwnerUsername) {
    return protectedOwnerEmail
  }

  return `${normalizedUsername}@${getStaffAuthDomain()}`
}

export function loginIdentifierToAuthEmail(identifier: string) {
  const normalizedIdentifier = normalizeStaffUsername(identifier)

  if (normalizedIdentifier.includes('@')) {
    return normalizedIdentifier
  }

  return staffUsernameToAuthEmail(normalizedIdentifier)
}
