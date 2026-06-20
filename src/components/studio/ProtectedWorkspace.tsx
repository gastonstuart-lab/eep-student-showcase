import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import type { EffectiveAdmin } from '../../auth'
import { useAuth } from '../../auth'
import { hubConfigs } from '../../hubs'
import { buildWorkspaceContextOptions, buildWorkspaceNav, getAccessibleHubConfigs, type WorkspaceNavItem } from './workspaceModel'

const roleLabels: Record<EffectiveAdmin['role'], string> = {
  superAdmin: 'Super Administrator',
  admin: 'Administrator',
  editor: 'Editor',
}

function firstContentSection(admin: EffectiveAdmin | null, configs = hubConfigs) {
  return getAccessibleHubConfigs(admin, configs).find((config) => config.sectionId !== 'ied') ?? getAccessibleHubConfigs(admin, configs)[0]
}

function currentContextLabel(pathname: string, admin: EffectiveAdmin | null) {
  const matchedHub = hubConfigs.find((config) => pathname.includes(`/admin/hubs/${config.sectionId}`))

  if (matchedHub) {
    return `${matchedHub.sectionName} Hub · ${admin ? roleLabels[admin.role] : 'Staff'}`
  }

  if (pathname.includes('/admin/pending') || pathname.includes('/admin/approved')) {
    return `EEP Hub · ${admin ? roleLabels[admin.role] : 'Staff'}`
  }

  return admin?.role === 'superAdmin'
    ? 'All Hubs · Super Administrator'
    : `${firstContentSection(admin)?.sectionName ?? 'Assigned Hubs'} Hub · ${admin ? roleLabels[admin.role] : 'Staff'}`
}

function currentContextId(pathname: string, admin: EffectiveAdmin | null) {
  const matchedHub = hubConfigs.find((config) => pathname.includes(`/admin/hubs/${config.sectionId}`))
  if (matchedHub) return matchedHub.sectionId
  if (pathname.includes('/admin/pending') || pathname.includes('/admin/approved')) return 'eep'
  return admin?.role === 'superAdmin' ? 'all' : firstContentSection(admin)?.sectionId ?? ''
}

export function RoleBadge({ admin }: { admin: EffectiveAdmin }) {
  return (
    <span className={`workspace-role-badge workspace-role-badge--${admin.role}`}>
      {roleLabels[admin.role]}
      {admin.protectedOwner ? ' · Protected Owner' : ''}
    </span>
  )
}

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warning' }) {
  return <span className={`workspace-status-badge workspace-status-badge--${tone}`}>{children}</span>
}

export function PrimaryActionCard({ title, body, to, label }: { title: string; body: string; to: string; label: string }) {
  return (
    <Link className="workspace-action-card" to={to}>
      <span>{label}</span>
      <strong>{title}</strong>
      <small>{body}</small>
    </Link>
  )
}

export function SummaryCard({ label, value, tone = 'neutral' }: { label: string; value: string | number; tone?: 'neutral' | 'good' | 'warning' }) {
  return (
    <article className={`workspace-summary-card workspace-summary-card--${tone}`}>
      <span>{value}</span>
      <p>{label}</p>
    </article>
  )
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="workspace-empty-state">
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  )
}

export function LoadingState({ title = 'Loading workspace' }: { title?: string }) {
  return <div className="workspace-state" role="status">{title}</div>
}

export function ErrorState({ title, body }: { title: string; body: string }) {
  return <div className="workspace-state workspace-state--error"><strong>{title}</strong><span>{body}</span></div>
}

export function SuccessState({ children }: { children: ReactNode }) {
  return <div className="workspace-state workspace-state--success">{children}</div>
}

export function ConfirmDialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="workspace-dialog-backdrop" role="presentation">
      <div className="workspace-dialog" role="dialog" aria-modal="true" aria-labelledby="workspace-dialog-title">
        <div className="workspace-dialog-header">
          <h2 id="workspace-dialog-title">{title}</h2>
          <button className="workspace-icon-button" type="button" onClick={onClose} aria-label="Close dialog">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ResponsivePanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`workspace-panel ${className}`}>{children}</section>
}

export function StepIndicator({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <ol className="workspace-step-indicator" aria-label="Wizard progress">
      {steps.map((step, index) => (
        <li className={index === currentStep ? 'is-current' : index < currentStep ? 'is-complete' : ''} key={step}>
          <span>{index + 1}</span>{step}
        </li>
      ))}
    </ol>
  )
}

export function WizardShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="workspace-wizard-shell" aria-labelledby="workspace-wizard-title">
      <h2 id="workspace-wizard-title">{title}</h2>
      {children}
    </section>
  )
}

function ContextSwitcher({ admin }: { admin: EffectiveAdmin }) {
  const options = useMemo(() => buildWorkspaceContextOptions(admin), [admin])
  const location = useLocation()
  const navigate = useNavigate()
  const value = currentContextId(location.pathname, admin)

  return (
    <label className="workspace-context-switcher">
      <span>Working context</span>
      <select
        aria-label="Working context"
        value={options.some((option) => option.id === value) ? value : options[0]?.id ?? ''}
        onChange={(event) => {
          const option = options.find((item) => item.id === event.target.value)
          if (option) navigate(option.route)
        }}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label} · {option.detail}
          </option>
        ))}
      </select>
    </label>
  )
}

function WorkspaceNav({ admin, onNavigate }: { admin: EffectiveAdmin; onNavigate?: () => void }) {
  const navItems = useMemo(() => buildWorkspaceNav(admin), [admin])
  const groups: Array<{ id: WorkspaceNavItem['group']; label: string }> = [
    { id: 'core', label: 'Core' },
    { id: 'projects', label: 'Projects' },
    { id: 'admin', label: 'Administration' },
  ]

  return (
    <nav className="workspace-nav" aria-label="Teacher workspace">
      {groups.map((group) => {
        const items = navItems.filter((item) => item.group === group.id)
        if (!items.length) return null

        return (
          <div className="workspace-nav-group" key={group.id}>
            <span>{group.label}</span>
            {items.map((item) => (
              <NavLink key={`${item.label}:${item.to}`} to={item.to} onClick={onNavigate}>
                {item.label}
              </NavLink>
            ))}
          </div>
        )
      })}
    </nav>
  )
}

function WorkspaceTopbar({
  admin,
  drawerOpen,
  menuButtonRef,
  onOpenDrawer,
}: {
  admin: EffectiveAdmin
  drawerOpen: boolean
  menuButtonRef: RefObject<HTMLButtonElement | null>
  onOpenDrawer: () => void
}) {
  const { logout } = useAuth()
  const location = useLocation()

  return (
    <header className="workspace-topbar">
      <button ref={menuButtonRef} className="workspace-menu-button" type="button" aria-controls="workspace-mobile-drawer" aria-expanded={drawerOpen} onClick={onOpenDrawer}>
        Menu
      </button>
      <div>
        <p>{currentContextLabel(location.pathname, admin)}</p>
        <h1>Teacher Workspace</h1>
      </div>
      <div className="workspace-account">
        <RoleBadge admin={admin} />
        <span>{admin.displayName || admin.username}</span>
        <button className="workspace-text-button" type="button" onClick={() => void logout()}>Sign out</button>
      </div>
    </header>
  )
}

function WorkspaceHeader({ admin }: { admin: EffectiveAdmin }) {
  const location = useLocation()

  return (
    <div className="workspace-header">
      <div>
        <p>{currentContextLabel(location.pathname, admin)}</p>
        <h2>{location.pathname === '/admin' ? 'Overview' : 'Workspace'}</h2>
      </div>
      <ContextSwitcher admin={admin} />
    </div>
  )
}

function MobileWorkspaceDrawer({
  admin,
  open,
  onClose,
  returnFocusRef,
}: {
  admin: EffectiveAdmin
  open: boolean
  onClose: () => void
  returnFocusRef: RefObject<HTMLButtonElement | null>
}) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return undefined
    closeButtonRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        returnFocusRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, open, returnFocusRef])

  if (!open) return null

  return (
    <div className="workspace-drawer-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="workspace-mobile-drawer"
        id="workspace-mobile-drawer"
        aria-label="Teacher workspace navigation"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="workspace-drawer-header">
          <RoleBadge admin={admin} />
          <button ref={closeButtonRef} className="workspace-icon-button" type="button" onClick={() => {
            onClose()
            returnFocusRef.current?.focus()
          }} aria-label="Close navigation">×</button>
        </div>
        <ContextSwitcher admin={admin} />
        <WorkspaceNav admin={admin} onNavigate={onClose} />
      </aside>
    </div>
  )
}

export function ProtectedAppShell({ children }: { children: ReactNode }) {
  const { adminUser } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)

  if (!adminUser) {
    return <>{children}</>
  }

  return (
    <div className="workspace-shell">
      <WorkspaceTopbar admin={adminUser} drawerOpen={drawerOpen} menuButtonRef={menuButtonRef} onOpenDrawer={() => setDrawerOpen(true)} />
      <div className="workspace-body">
        <aside className="workspace-sidebar">
          <RoleBadge admin={adminUser} />
          <ContextSwitcher admin={adminUser} />
          <WorkspaceNav admin={adminUser} />
        </aside>
        <div className="workspace-main">
          <WorkspaceHeader admin={adminUser} />
          {children}
        </div>
      </div>
      <MobileWorkspaceDrawer admin={adminUser} open={drawerOpen} onClose={() => setDrawerOpen(false)} returnFocusRef={menuButtonRef} />
    </div>
  )
}
