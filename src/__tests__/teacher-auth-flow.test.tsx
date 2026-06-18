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

const signInWithEmailAndPassword = vi.fn(async (_email: string, _password: string) => undefined)
const signOut = vi.fn(async () => {
  currentUser = null
})
const sendEmailVerification = vi.fn(async (_user: MockUser) => undefined)
const sendPasswordResetEmail = vi.fn(async (_email: string) => undefined)
const reload = vi.fn(async (user: MockUser) => {
  if (user.email === bootstrapSuperAdminEmail) {
    user.emailVerified = true
  }
})

vi.mock('../firebase', () => ({
  auth: {
    get currentUser() {
      return currentUser
    },
  },
  db: {},
  isFirebaseConfigured: true,
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback: (user: MockUser | null) => void) => {
    callback(currentUser)
    return vi.fn()
  }),
  reload: (user: MockUser) => reload(user),
  sendEmailVerification: (user: MockUser) => sendEmailVerification(user),
  sendPasswordResetEmail: (_auth: unknown, email: string) => sendPasswordResetEmail(email),
  signInWithEmailAndPassword: (_auth: unknown, email: string, password: string) =>
    signInWithEmailAndPassword(email, password),
  signOut: () => signOut(),
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
    displayName: 'Teacher',
    role: 'editor',
    active: true,
    allowedSectionIds: ['esl-science'],
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

  it('invokes Firebase email/password login without exposing signup', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'teacher@example.com')
    await user.type(screen.getByLabelText(/password/i), 'correct-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith('teacher@example.com', 'correct-password')
    expect(screen.queryByRole('button', { name: /sign up|register/i })).not.toBeInTheDocument()
  })

  it('shows the verification-required screen for an unverified bootstrap owner', async () => {
    currentUser = makeUser({ email: bootstrapSuperAdminEmail, emailVerified: false })

    renderLogin()

    expect(await screen.findByText(/verify your email/i)).toBeInTheDocument()
    expect(screen.getByText(bootstrapSuperAdminEmail)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send verification email/i })).toBeEnabled()
  })

  it('recognises the verified bootstrap owner as a super administrator', async () => {
    currentUser = makeUser({ email: bootstrapSuperAdminEmail, emailVerified: true })

    renderProbe()

    expect(await screen.findByText('admin:true')).toBeInTheDocument()
    expect(screen.getByText('super:true')).toBeInTheDocument()
    expect(screen.getByText('role:superAdmin')).toBeInTheDocument()
  })

  it('does not grant administrator access to an unverified ordinary account', async () => {
    currentUser = makeUser({ emailVerified: false })
    adminRecords['teacher-uid'] = makeAdmin()

    renderProbe()

    expect(await screen.findByText('signed-in:true')).toBeInTheDocument()
    expect(screen.getByText('admin:false')).toBeInTheDocument()
    expect(screen.getByText('role:none')).toBeInTheDocument()
  })

  it('sends verification email and applies resend cooldown', async () => {
    const user = userEvent.setup()
    currentUser = makeUser({ email: bootstrapSuperAdminEmail, emailVerified: false })

    renderLogin()
    await user.click(await screen.findByRole('button', { name: /send verification email/i }))

    expect(sendEmailVerification).toHaveBeenCalledWith(currentUser)
    expect(screen.getByRole('button', { name: /resend in 60s/i })).toBeDisabled()
    expect(screen.getByText(/verification email sent/i)).toBeInTheDocument()
  })

  it('reloads the user and recognises verification on check-again', async () => {
    const user = userEvent.setup()
    currentUser = makeUser({ email: bootstrapSuperAdminEmail, emailVerified: false })

    renderLogin()
    await user.click(await screen.findByRole('button', { name: /check again/i }))

    expect(reload).toHaveBeenCalledWith(currentUser)
    expect(currentUser?.getIdToken).toHaveBeenCalledWith(true)
    expect(window.location.pathname).toBe('/admin')
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

  it('invokes password reset with neutral confirmation wording', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'teacher@example.com')
    await user.click(screen.getByRole('button', { name: /forgot password/i }))

    expect(sendPasswordResetEmail).toHaveBeenCalledWith('teacher@example.com')
    expect(await screen.findByText(/if this teacher email exists/i)).toBeInTheDocument()
  })

  it('maps useful authentication errors without raw Firebase codes', () => {
    expect(mapAuthError({ code: 'auth/invalid-credential' })).toMatch(/email or password/i)
    expect(mapAuthError({ code: 'auth/too-many-requests' })).toMatch(/too many attempts/i)
    expect(mapAuthError({ code: 'auth/user-disabled' })).toMatch(/disabled/i)
    expect(mapAuthError(new Error('Firebase Auth is not configured.'))).toMatch(/not connected/i)
  })
})
