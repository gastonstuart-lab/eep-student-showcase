import { useId, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import type { EffectiveAdmin } from '../../auth'
import { useAuth } from '../../auth'
import { hubConfigs } from '../../hubs'
import { useFocusTrap } from './focusTrap'
import { buildWorkspaceContextOptions, buildWorkspaceNav, firstContentSection, resolveWorkspaceContext, type WorkspaceNavItem } from './workspaceModel'
import { parseWorkspaceContentView, workspaceContentViewLabels } from './workspaceRouting'

const roleLabels: Record<EffectiveAdmin['role'], string> = {
  superAdmin: 'Super Administrator',
  admin: 'Administrator',
  editor: 'Editor',
}

function activeContextIdForPath(pathname: string, admin: EffectiveAdmin | null) {
  const hubMatch = pathname.match(/^\/admin\/hubs\/([^/]+)/)
  const submissionMatch = pathname.match(/^\/admin\/submissions\/([^/]+)/)
  const matchedHub = hubMatch ? hubConfigs.find((config) => config.sectionId === decodeURIComponent(hubMatch[1])) : null
  if (matchedHub) return matchedHub.sectionId
  const matchedSubmissionHub = submissionMatch ? hubConfigs.find((config) => config.sectionId === decodeURIComponent(submissionMatch[1])) : null
  if (matchedSubmissionHub) return matchedSubmissionHub.sectionId
  if (pathname.includes('/admin/pending') || pathname.includes('/admin/approved')) return 'eep'
  return admin?.role === 'superAdmin' ? 'all' : firstContentSection(admin)?.sectionId ?? ''
}

function currentContextLabel(pathname: string, admin: EffectiveAdmin | null) {
  const activeContext = resolveWorkspaceContext(admin, activeContextIdForPath(pathname, admin))
  if (activeContext?.section) return `${activeContext.section.sectionName} Hub`
  return admin?.role === 'superAdmin' ? 'All Hubs' : 'Assigned Hubs'
}

function currentContextId(pathname: string, admin: EffectiveAdmin | null) {
  return activeContextIdForPath(pathname, admin)
}

function currentWorkspaceHeading(pathname: string, search: string) {
  if (pathname === '/admin') return 'Overview'
  if (pathname === '/admin/hubs') return 'Manage Hubs'
  if (pathname === '/admin/pending') return 'Submissions'
  if (pathname === '/admin/approved') return 'Approved Projects'
  if (pathname.startsWith('/admin/submissions/')) return 'Submissions'
  if (pathname === '/admin/users') return 'Staff Access'
  if (pathname === '/admin/audit') return 'Audit & Activity'
  if (pathname.startsWith('/admin/hubs/')) {
    return workspaceContentViewLabels[parseWorkspaceContentView(new URLSearchParams(search).get('view'))]
  }
  return 'Workspace'
}

export function RoleBadge({ admin }: { admin: EffectiveAdmin }) {
  return (
    <span className={`workspace-role-badge workspace-role-badge--${admin.role}`}>
      {roleLabels[admin.role]}
      {admin.protectedOwner ? ' - Protected Owner' : ''}
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

export function ConfirmDialog({
  title,
  children,
  onClose,
  description,
  cancelLabel = 'Cancel',
}: {
  title: string
  children: ReactNode
  onClose: () => void
  description?: string
  cancelLabel?: string
}) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const returnFocusRef = useRef<HTMLElement | null>(typeof document === 'undefined' ? null : document.activeElement as HTMLElement | null)

  useFocusTrap({
    active: true,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
    returnFocusRef,
    onEscape: onClose,
  })

  return (
    <div className="workspace-dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="workspace-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="workspace-dialog-header">
          <h2 id={titleId}>{title}</h2>
          <button ref={closeButtonRef} className="workspace-icon-button" type="button" onClick={onClose} aria-label="Close dialog">x</button>
        </div>
        {description && <p className="workspace-dialog-description" id={descriptionId}>{description}</p>}
        {children}
        <div className="workspace-dialog-actions">
          <button className="secondary-button" type="button" onClick={onClose}>{cancelLabel}</button>
        </div>
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
        <li className={index === currentStep ? 'is-current' : index < currentStep ? 'is-complete' : ''} key={step} aria-current={index === currentStep ? 'step' : undefined}>
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
            {option.label} - {option.detail}
          </option>
        ))}
      </select>
    </label>
  )
}

function WorkspaceNav({ admin, onNavigate }: { admin: EffectiveAdmin; onNavigate?: () => void }) {
  const location = useLocation()
  const activeContextId = currentContextId(location.pathname, admin)
  const navItems = useMemo(() => buildWorkspaceNav(admin, activeContextId), [activeContextId, admin])
  const groups: Array<{ id: WorkspaceNavItem['group']; label: string }> = [
    { id: 'primary', label: 'Primary' },
    { id: 'admin', label: 'Administration' },
  ]
  const isActive = (item: WorkspaceNavItem) => {
    if (item.activeMatch === 'exact') return location.pathname === item.to
    if (item.activeMatch === 'content-create') return location.pathname.startsWith('/admin/hubs/') && parseWorkspaceContentView(new URLSearchParams(location.search).get('view')) === 'create'
    if (item.activeMatch === 'content-library') return location.pathname.startsWith('/admin/hubs/') && parseWorkspaceContentView(new URLSearchParams(location.search).get('view')) !== 'create'
    if (item.activeMatch === 'submissions') return location.pathname === '/admin/pending' || location.pathname === '/admin/approved' || location.pathname.startsWith('/admin/submissions/')
    return location.pathname === item.to
  }

  return (
    <nav className="workspace-nav" aria-label="Teacher workspace">
      {groups.map((group) => {
        const items = navItems.filter((item) => item.group === group.id)
        if (!items.length) return null

        return (
          <div className="workspace-nav-group" key={group.id}>
            <span>{group.label}</span>
            {items.map((item) => (
              <Link
                key={`${item.label}:${item.to}`}
                to={item.to}
                onClick={onNavigate}
                className={isActive(item) ? 'active' : undefined}
                aria-current={isActive(item) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )
      })}
    </nav>
  )
}

function WorkspaceTopbar({
  admin,
}: {
  admin: EffectiveAdmin
}) {
  const { logout } = useAuth()
  const location = useLocation()

  return (
    <header className="workspace-topbar">
      <Link className="workspace-topbar-logo" to="/ied" aria-label="Return to IED Hub">
        <img src="/school-logo.svg" alt="" />
      </Link>
      <div>
        <p>{currentContextLabel(location.pathname, admin)}</p>
      </div>
      <div className="workspace-account">
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
        <h2>{currentWorkspaceHeading(location.pathname, location.search)}</h2>
      </div>
      <ContextSwitcher admin={admin} />
    </div>
  )
}

function currentPublicHubRoute(pathname: string, admin: EffectiveAdmin | null) {
  const activeContext = resolveWorkspaceContext(admin, activeContextIdForPath(pathname, admin))
  return activeContext?.section?.route ?? firstContentSection(admin)?.route ?? '/ied'
}

function WorkspaceSidebarUtility({ admin }: { admin: EffectiveAdmin }) {
  const { logout } = useAuth()
  const location = useLocation()

  return (
    <div className="workspace-sidebar-utility">
      <div>
        <span>{admin.displayName || admin.username}</span>
        <small>{roleLabels[admin.role]}</small>
      </div>
      <Link to={currentPublicHubRoute(location.pathname, admin)}>View Public Hub</Link>
      <button type="button" onClick={() => void logout()}>Sign Out</button>
    </div>
  )
}

function WorkspaceMobileBottomNav({
  admin,
  moreButtonRef,
  drawerOpen,
  onOpenMore,
}: {
  admin: EffectiveAdmin
  moreButtonRef: RefObject<HTMLButtonElement | null>
  drawerOpen: boolean
  onOpenMore: () => void
}) {
  const location = useLocation()
  const activeContextId = currentContextId(location.pathname, admin)
  const navItems = useMemo(() => buildWorkspaceNav(admin, activeContextId), [activeContextId, admin])
  const overview = navItems.find((item) => item.label === 'Overview')
  const create = navItems.find((item) => item.label === 'Create Content')
  const library = navItems.find((item) => item.label === 'Content Library')
  const isCreate = location.pathname.startsWith('/admin/hubs/') && parseWorkspaceContentView(new URLSearchParams(location.search).get('view')) === 'create'
  const isLibrary = location.pathname.startsWith('/admin/hubs/') && parseWorkspaceContentView(new URLSearchParams(location.search).get('view')) !== 'create'

  return (
    <nav className="workspace-bottom-nav" aria-label="Primary workspace shortcuts">
      {overview && <NavLink to={overview.to} end>Overview</NavLink>}
      {create && <Link className={isCreate ? 'active' : undefined} aria-current={isCreate ? 'page' : undefined} to={create.to}>Create</Link>}
      {library && <Link className={isLibrary ? 'active' : undefined} aria-current={isLibrary ? 'page' : undefined} to={library.to}>Library</Link>}
      <button ref={moreButtonRef} type="button" onClick={onOpenMore} aria-controls="workspace-mobile-drawer" aria-expanded={drawerOpen} aria-haspopup="dialog">More</button>
    </nav>
  )
}

export function MobileWorkspaceDrawer({
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
  const drawerRef = useRef<HTMLElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useFocusTrap({
    active: open,
    containerRef: drawerRef,
    initialFocusRef: closeButtonRef,
    returnFocusRef,
    onEscape: onClose,
    lockScroll: true,
  })

  if (!open) return null

  return (
    <div className="workspace-drawer-backdrop" role="presentation" onClick={onClose}>
      <aside
        ref={drawerRef}
        className="workspace-mobile-drawer"
        id="workspace-mobile-drawer"
        aria-label="Teacher workspace navigation"
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="workspace-drawer-header">
          <div>
            <strong>IED Studio</strong>
            <span>{admin.displayName || admin.username}</span>
          </div>
          <button ref={closeButtonRef} className="workspace-icon-button" type="button" onClick={onClose} aria-label="Close navigation">x</button>
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
  const moreButtonRef = useRef<HTMLButtonElement | null>(null)
  const location = useLocation()
  const isCreateContentRoute = location.pathname.startsWith('/admin/hubs/') && parseWorkspaceContentView(new URLSearchParams(location.search).get('view')) === 'create'
  const isOverviewRoute = location.pathname === '/admin'
  const isStaffAccessRoute = location.pathname === '/admin/users'

  if (!adminUser) {
    return <>{children}</>
  }

  return (
    <div className="workspace-shell">
      <WorkspaceTopbar admin={adminUser} />
      <div className="workspace-body">
        <aside className="workspace-sidebar" aria-hidden={drawerOpen ? true : undefined}>
          <Link className="workspace-sidebar-brand" to="/admin">
            <span>IED</span>
            <strong>IED Studio</strong>
          </Link>
          <WorkspaceNav admin={adminUser} />
          <WorkspaceSidebarUtility admin={adminUser} />
        </aside>
        <div className="workspace-main" aria-hidden={drawerOpen ? true : undefined}>
          {!isCreateContentRoute && !isOverviewRoute && !isStaffAccessRoute && <WorkspaceHeader admin={adminUser} />}
          {children}
        </div>
      </div>
      <WorkspaceMobileBottomNav admin={adminUser} moreButtonRef={moreButtonRef} drawerOpen={drawerOpen} onOpenMore={() => setDrawerOpen(true)} />
      <MobileWorkspaceDrawer admin={adminUser} open={drawerOpen} onClose={() => setDrawerOpen(false)} returnFocusRef={moreButtonRef} />
    </div>
  )
}
