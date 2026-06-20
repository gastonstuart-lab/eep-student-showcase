import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { EffectiveAdmin } from '../auth'
import { hubConfigById } from '../hubs'
import { ContentWizard } from '../components/studio/contentWizard/ContentWizard'
import { emptyStaffPermissions } from '../utils/authorization'

const createContentItem = vi.fn<(payload: unknown) => Promise<{ id: string }>>(async () => ({ id: 'saved-1' }))
const updateContentItem = vi.fn<(id: string, payload: unknown) => Promise<void>>(async () => undefined)

vi.mock('../data', () => ({
  createContentItem: (payload: unknown) => createContentItem(payload),
  updateContentItem: (id: string, payload: unknown) => updateContentItem(id, payload),
}))

vi.mock('../components/public/ContentCard', () => ({
  ContentCard: ({ item }: { item: { title: string; summary: string } }) => (
    <article aria-label="Preview card">
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
    </article>
  ),
}))

const editor: EffectiveAdmin = {
  id: 'staff-1',
  email: 'teacher@example.com',
  username: 'teacher',
  normalizedUsername: 'teacher',
  authEmail: 'teacher@example.com',
  contactEmail: 'teacher@example.com',
  displayName: 'Teacher',
  role: 'editor',
  active: true,
  protectedOwner: false,
  mustChangePassword: false,
  allowedSectionIds: ['esl-science'],
  permissions: { ...emptyStaffPermissions, createContent: true, editContent: true, publishContent: false },
  source: 'adminUsers',
}

vi.mock('../auth', () => ({
  useAuth: () => ({
    adminUser: editor,
    user: { uid: 'teacher-uid', email: 'teacher@example.com' },
  }),
}))

function renderWizard() {
  return render(
    <MemoryRouter initialEntries={['/admin/hubs/esl-science?view=create']}>
      <ContentWizard
        config={hubConfigById['esl-science']}
        contentCount={0}
        contentItems={[]}
        userEmail="teacher@example.com"
      />
    </MemoryRouter>,
  )
}

describe('content creator wizard behavior', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('prevents moving past essentials until required fields are complete', async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(screen.getByRole('heading', { name: 'Essentials' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Add a title')
    expect(createContentItem).not.toHaveBeenCalled()
  })

  it('preserves entered data across back and next navigation', async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.click(screen.getByLabelText(/video/i))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.type(screen.getByLabelText(/video title/i), 'Class performance clip')
    await user.type(screen.getByLabelText(/short introduction/i), 'Students share a rehearsal highlight.')
    await user.type(screen.getByLabelText(/description/i), 'A short classroom performance video.')
    await user.click(screen.getByRole('button', { name: /back/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(screen.getByLabelText(/video title/i)).toHaveValue('Class performance clip')
    expect(screen.getByRole('heading', { name: 'Essentials' })).toHaveFocus()
  })

  it('saves a draft and shows the success state', async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.type(screen.getByLabelText(/announcement title/i), 'Science update')
    await user.type(screen.getByLabelText(/short summary/i), 'New lab resources are ready.')
    await user.type(screen.getByLabelText(/announcement details/i), 'Teachers can now share the updated resources.')
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByRole('button', { name: /save draft/i }))

    await waitFor(() => expect(createContentItem).toHaveBeenCalledTimes(1))
    expect(screen.getByRole('status')).toHaveTextContent('Science update')
  })
})
