import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef, useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { EffectiveAdmin } from '../auth'
import { ConfirmDialog, MobileWorkspaceDrawer } from '../components/studio/ProtectedWorkspace'
import { emptyStaffPermissions } from '../utils/authorization'

function staff(patch: Partial<EffectiveAdmin> = {}): EffectiveAdmin {
  return {
    id: 'staff-1',
    email: 'staff@example.com',
    username: 'staff',
    normalizedUsername: 'staff',
    authEmail: 'staff@example.com',
    contactEmail: 'staff@example.com',
    displayName: 'Staff User',
    role: 'editor',
    active: true,
    protectedOwner: false,
    mustChangePassword: false,
    allowedSectionIds: ['esl-science'],
    permissions: { ...emptyStaffPermissions, createContent: true, editContent: true },
    source: 'adminUsers',
    ...patch,
  }
}

function ConfirmDialogHarness() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Trigger</button>
      {open && (
        <ConfirmDialog title="Archive item" description="This action can be cancelled." onClose={close}>
          <button type="button">Archive</button>
        </ConfirmDialog>
      )}
    </div>
  )
}

function MobileDrawerHarness({ onClose = vi.fn() }: { onClose?: () => void }) {
  const [open, setOpen] = useState(true)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const close = () => {
    onClose()
    setOpen(false)
  }

  return (
    <>
      <button ref={buttonRef} type="button">Menu trigger</button>
      <MemoryRouter initialEntries={['/admin/hubs/esl-science']}>
        <MobileWorkspaceDrawer admin={staff()} open={open} onClose={close} returnFocusRef={buttonRef} />
      </MemoryRouter>
    </>
  )
}

describe('protected workspace accessibility primitives', () => {
  it('closes ConfirmDialog with Escape and restores focus', async () => {
    const user = userEvent.setup()
    render(<ConfirmDialogHarness />)
    const trigger = screen.getByRole('button', { name: 'Trigger' })
    await user.click(trigger)

    await waitFor(() => expect(screen.getByRole('button', { name: /close dialog/i })).toHaveFocus())
    await user.keyboard('{Escape}')

    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('keeps ConfirmDialog focus inside while open', async () => {
    const user = userEvent.setup()
    render(<ConfirmDialogHarness />)
    await user.click(screen.getByRole('button', { name: 'Trigger' }))

    await user.keyboard('{Shift>}{Tab}{/Shift}')
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: /close dialog/i })).toHaveFocus()
  })

  it('closes the mobile drawer with Escape and restores focus', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<MobileDrawerHarness onClose={onClose} />)

    await waitFor(() => expect(screen.getByRole('button', { name: /close navigation/i })).toHaveFocus())
    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalled()
    await waitFor(() => expect(document.activeElement).toHaveTextContent('Menu trigger'))
  })

  it('keeps mobile drawer focus inside while open', async () => {
    const user = userEvent.setup()
    render(<MobileDrawerHarness />)
    const drawer = screen.getByRole('dialog', { name: /teacher workspace navigation/i })

    await user.tab()
    await user.tab()

    expect(drawer.contains(document.activeElement)).toBe(true)
  })

  it('keeps subject drawer navigation on the exact active hub route', () => {
    render(<MobileDrawerHarness />)

    expect(screen.getByRole('link', { name: 'Drafts' })).toHaveAttribute('href', '/admin/hubs/esl-science?view=drafts')
  })
})
