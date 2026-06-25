import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { EffectiveAdmin } from '../auth'
import { fullStaffPermissions } from '../utils/authorization'
import { StaffAccessPage } from '../components/studio/accessWizard/AccessWizard'

const createStaffUser = vi.fn<(payload: unknown) => Promise<void>>(async () => undefined)
const updateStaffAccess = vi.fn<(uid: string, payload: unknown) => Promise<void>>(async () => undefined)

const admin: EffectiveAdmin = {
  id: 'owner',
  email: 'owner@example.com',
  username: 'owner',
  normalizedUsername: 'owner',
  authEmail: 'owner@staff.eep-student-showcase.local',
  contactEmail: 'owner@example.com',
  displayName: 'Owner',
  role: 'superAdmin',
  active: true,
  protectedOwner: true,
  mustChangePassword: false,
  allowedSectionIds: ['*'],
  permissions: fullStaffPermissions,
  source: 'adminUsers',
}

vi.mock('../auth', () => ({
  useAuth: () => ({ adminUser: admin, user: { email: 'owner@example.com' } }),
}))

vi.mock('../firebase', () => ({
  isFirebaseConfigured: true,
}))

vi.mock('../data', () => ({
  watchAdminUsers: (onChange: (items: unknown[]) => void) => {
    onChange([])
    return () => undefined
  },
}))

vi.mock('../staffFunctions', () => ({
  getStaffBackendHealth: vi.fn(async () => undefined),
  createStaffUser: (payload: unknown) => createStaffUser(payload),
  updateStaffAccess: (uid: string, payload: unknown) => updateStaffAccess(uid, payload),
  resetStaffPassword: vi.fn(async () => undefined),
  enableStaffUser: vi.fn(async () => undefined),
  disableStaffUser: vi.fn(async () => undefined),
  archiveStaffUser: vi.fn(async () => undefined),
  ensureProtectedOwnerRecord: vi.fn(async () => undefined),
}))

function renderStaffAccess(route = '/admin/users?view=create') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/admin/users" element={<StaffAccessPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('staff access wizard behavior', () => {
  beforeEach(() => {
    createStaffUser.mockClear()
    updateStaffAccess.mockClear()
    localStorage.clear()
  })

  it('opens from the create route and waits until review before creating staff', async () => {
    const user = userEvent.setup()
    renderStaffAccess()

    expect(await screen.findByRole('heading', { name: /staff details/i })).toBeInTheDocument()
    await user.type(screen.getByLabelText(/display name/i), 'Jordan Lee')
    await user.type(screen.getByLabelText(/username/i), 'Jordan Lee')
    await user.clear(screen.getByLabelText(/temporary password/i))
    await user.type(screen.getByLabelText(/temporary password/i), 'TempPass12345!')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(await screen.findByRole('heading', { name: /role & responsibilities/i })).toBeInTheDocument()
    expect(createStaffUser).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(await screen.findByRole('heading', { name: /hub access/i })).toBeInTheDocument()
    await user.click(screen.getByLabelText(/^Science/i))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(await screen.findByRole('heading', { name: /review access/i })).toBeInTheDocument()
    expect(screen.getAllByText(/Jordan Lee can work in Science/i).length).toBeGreaterThan(0)
    expect(createStaffUser).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /create staff account/i }))

    await waitFor(() => expect(createStaffUser).toHaveBeenCalledTimes(1))
    expect(createStaffUser.mock.calls[0]?.[0]).toMatchObject({
      username: 'jordanlee',
      displayName: 'Jordan Lee',
      allowedSectionIds: ['esl-science'],
      temporaryPassword: 'TempPass12345!',
    })
    expect(JSON.stringify(localStorage)).not.toContain('TempPass12345!')
  }, 20000)
})
