import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from '../App'
import { AuthProvider, bootstrapSuperAdminEmail, mapAuthError, useAuth } from '../auth'
import { LanguageProvider } from '../i18n/LanguageContext'
import type { AdminUser } from '../types'

type MockUser = {
  uid: string
  email: string
  displayName: string | null
  emailVerified: boolean
  getIdToken: ReturnType<typeof vi.fn>
}

let currentUser: MockUser | null = null
let adminRecords: Record<string, AdminUser | null> = {}

const signInWithEmailAndPassword = vi.fn(async (email: string, password: string) => {
  void email
  void password
})
const signOut = vi.fn(async () => {
  currentUser = null
})
const reload = vi.fn(async (user: MockUser) => {
  void user
})

vi.mock('../firebase', () => ({
  auth: {
    get currentUser() {
      return currentUser
    },
  },
  db: {},
  functions: null,
  isFirebaseConfigured: true,
}))

vi.mock('firebase/auth', () => ({
  EmailAuthProvider: {
    credential: vi.fn((email: string, password: string) => ({ email, password })),
  },
  onAuthStateChanged: vi.fn((_auth, callback: (user: MockUser | null) => void) => {
    callback(currentUser)
    return vi.fn()
  }),
  reauthenticateWithCredential: vi.fn(),
  reload: (user: MockUser) => reload(user),
  signInWithEmailAndPassword: (_auth: unknown, email: string, password: string) =>
    signInWithEmailAndPassword(email, password),
  signOut: () => signOut(),
  updatePassword: vi.fn(),
}))

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(),
}))

vi.mock('../data', () => ({
  createContentItem: vi.fn(),
  createProject: vi.fn(),
  deleteAdminUser: vi.fn(),
  deleteContentItem: vi.fn(),
  deleteProject: vi.fn(),
  saveAdminUser: vi.fn(),
  saveHubPage: vi.fn(),
  seedProjects: vi.fn(),
  updateAdminUser: vi.fn(),
  updateContentItem: vi.fn(),
  updateProject: vi.fn(),
  watchAdminUsers: vi.fn(),
  watchAllPublishedContentItems: vi.fn((_onChange: (items: unknown[]) => void) => {
    _onChange([])
    return vi.fn()
  }),
  watchAdminUser: vi.fn((uid: string, onChange: (adminUser: AdminUser | null) => void) => {
    onChange(adminRecords[uid] ?? null)
    return vi.fn()
  }),
  watchContentItems: vi.fn((_sectionId: string, onChange: (items: unknown[]) => void) => {
    onChange([])
    return vi.fn()
  }),
  watchHubPage: vi.fn((_sectionId: string, onChange: (page: unknown | null) => void) => {
    onChange(null)
    return vi.fn()
  }),
  watchHubPages: vi.fn((onChange: (pages: unknown[]) => void) => {
    onChange([])
    return vi.fn()
  }),
  watchProjects: vi.fn((onChange: (projects: unknown[]) => void) => {
    onChange([])
    return vi.fn()
  }),
}))

function makeUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    uid: 'teacher-uid',
    email: 'teacher@example.com',
    displayName: 'Teacher',
    emailVerified: true,
    getIdToken: vi.fn(async () => 'token'),
    ...overrides,
  }
}

function makeAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: 'teacher-uid',
    email: 'teacher@example.com',
    username: 'teacher',
    normalizedUsername: 'teacher',
    authEmail: 'teacher@staff.eep-student-showcase.local',
    contactEmail: 'teacher@example.com',
    displayName: 'Teacher',
    role: 'editor',
    active: true,
    protectedOwner: false,
    mustChangePassword: false,
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
    createdBy: '',
    updatedBy: '',
    ...overrides,
  }
}

function renderLogin() {
  return render(
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>,
  )
}

function AuthProbe({ sectionId = 'esl-science' }: { sectionId?: string }) {
  const { adminUser, canManageSection, isAdmin, isSuperAdmin, user } = useAuth()

  return (
    <div>
      <span>signed-in:{String(Boolean(user))}</span>
      <span>admin:{String(isAdmin)}</span>
      <span>super:{String(isSuperAdmin)}</span>
      <span>section:{String(canManageSection(sectionId))}</span>
      <span>role:{adminUser?.role ?? 'none'}</span>
    </div>
  )
}

function renderProbe(sectionId?: string) {
  return render(
    <AuthProvider>
      <AuthProbe sectionId={sectionId} />
    </AuthProvider>,
  )
}

describe('teacher authentication flow', () => {
  beforeEach(() => {
    currentUser = null
    adminRecords = {}
    window.history.pushState({}, '', '/login')
    vi.clearAllMocks()
  })

  it('invokes Firebase email/password login with an internal username identifier and no signup UI', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/username/i), 'Science.Jones')
    await user.type(screen.getByLabelText(/password/i), 'correct-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      'science.jones@eep-student-showcase.firebaseapp.com',
      'correct-password',
    )
    expect(screen.queryByRole('button', { name: /sign up|register/i })).not.toBeInTheDocument()
    expect(screen.getByText(/contact an ied hub administrator/i)).toBeInTheDocument()
  })

  it('recognises the bootstrap owner as a protected super administrator without email-verification onboarding', async () => {
    currentUser = makeUser({ email: bootstrapSuperAdminEmail, emailVerified: false })

    renderProbe()

    expect(await screen.findByText('admin:true')).toBeInTheDocument()
    expect(screen.getByText('super:true')).toBeInTheDocument()
    expect(screen.getByText('role:superAdmin')).toBeInTheDocument()
  })

  it('grants staff access from an active staff record without relying on email verification', async () => {
    currentUser = makeUser({ emailVerified: false })
    adminRecords['teacher-uid'] = makeAdmin()

    renderProbe()

    expect(await screen.findByText('signed-in:true')).toBeInTheDocument()
    expect(screen.getByText('admin:true')).toBeInTheDocument()
    expect(screen.getByText('role:editor')).toBeInTheDocument()
  })

  it('keeps a verified user without an active role out of administrator access', async () => {
    currentUser = makeUser()

    renderProbe()

    expect(await screen.findByText('signed-in:true')).toBeInTheDocument()
    expect(screen.getByText('admin:false')).toBeInTheDocument()
    expect(screen.getByText('section:false')).toBeInTheDocument()
  })

  it('keeps editor permissions scoped to assigned sections', async () => {
    currentUser = makeUser()
    adminRecords['teacher-uid'] = makeAdmin()

    renderProbe('esl-social-studies')

    expect(await screen.findByText('admin:true')).toBeInTheDocument()
    expect(screen.getByText('super:false')).toBeInTheDocument()
    expect(screen.getByText('section:false')).toBeInTheDocument()
  })

  it('does not expose public email password reset from the login screen', () => {
    renderLogin()

    expect(screen.queryByRole('button', { name: /forgot password/i })).not.toBeInTheDocument()
    expect(screen.getByText(/contact an ied hub administrator/i)).toBeInTheDocument()
  })

  it('maps useful authentication errors without raw Firebase codes', () => {
    expect(mapAuthError({ code: 'auth/invalid-credential' })).toMatch(/username or password/i)
    expect(mapAuthError({ code: 'auth/too-many-requests' })).toMatch(/too many attempts/i)
    expect(mapAuthError({ code: 'auth/user-disabled' })).toMatch(/disabled/i)
    expect(mapAuthError(new Error('Firebase Auth is not configured.'))).toMatch(/not connected/i)
  })
})
