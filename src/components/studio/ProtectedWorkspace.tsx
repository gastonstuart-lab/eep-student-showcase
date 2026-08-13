import { useId, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import type { EffectiveAdmin } from '../../auth'
import { useAuth } from '../../auth'
import { hubConfigs } from '../../hubs'
import { useLanguage } from '../../i18n/LanguageContext'
import type { TranslationKey } from '../../i18n/translations'
import { useFocusTrap } from './focusTrap'
import { buildWorkspaceContextOptions, buildWorkspaceNav, firstContentSection, resolveWorkspaceContext, type WorkspaceNavItem } from './workspaceModel'
import { parseWorkspaceContentView, workspaceContentViewLabels } from './workspaceRouting'

const roleTranslationKeys: Record<EffectiveAdmin['role'], TranslationKey> = {
  superAdmin: 'roleSuperAdministrator',
  admin: 'roleAdministrator',
  editor: 'roleEditor',
}

const navTranslationKeys: Record<string, TranslationKey> = {
  Overview: 'workspaceOverview',
  'Create Content': 'workspaceCreateContent',
  'Content Library': 'workspaceContentLibrary',
  Submissions: 'workspaceSubmissions',
  'Staff Access': 'workspaceStaffAccess',
  'Manage Hubs': 'workspaceManageHubs',
  'Audit & Activity': 'workspaceAuditActivity',
}

const headingTranslationKeys: Record<string, TranslationKey> = {
  Overview: 'workspaceOverview',
  'Create Content': 'workspaceCreateContent',
  'Content Library': 'workspaceContentLibrary',
  Submissions: 'workspaceSubmissions',
  'Approved Projects': 'submissionsApproved',
  'Staff Access': 'workspaceStaffAccess',
  'Manage Hubs': 'workspaceManageHubs',
  'Audit & Activity': 'workspaceAuditActivity',
  Workspace: 'workspaceWorkspace',
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

function translateContextLabel(label: string, t: (key: TranslationKey, values?: Record<string, string | number>) => string) {
  if (label === 'All Hubs') return t('workspaceAllHubs')
  if (label === 'Assigned Hubs') return t('workspaceAssignedHubs')
  return label
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
  const { t } = useLanguage()
  return (
    <span className={`workspace-role-badge workspace-role-badge--${admin.role}`}>
      {t(roleTranslationKeys[admin.role])}
      {admin.protectedOwner ? ` - ${t('roleProtectedOwner')}` : ''}
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
  const { t } = useLanguage()
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
          <button ref={closeButtonRef} className="workspace-icon-button" type="button" onClick={onClose} aria-label={t('workspaceCloseDialog')}>x</button>
        </div>
        {description && <p className="workspace-dialog-description" id={descriptionId}>{description}</p>}
        {children}
        <div className="workspace-dialog-actions">
          <button className="secondary-button" type="button" onClick={onClose}>{cancelLabel === 'Cancel' ? t('workspaceCancel') : cancelLabel}</button>
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
  const { t } = useLanguage()
  const options = useMemo(() => buildWorkspaceContextOptions(admin), [admin])
  const location = useLocation()
  const navigate = useNavigate()
  const value = currentContextId(location.pathname, admin)

  return (
    <label className="workspace-context-switcher">
      <span>{t('workspaceWorkingContext')}</span>
      <select
        aria-label={t('workspaceWorkingContext')}
        value={options.some((option) => option.id === value) ? value : options[0]?.id ?? ''}
        onChange={(event) => {
          const option = options.find((item) => item.id === event.target.value)
          if (option) navigate(option.route)
        }}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.id === 'all' ? t('workspaceAllHubs') : option.label} - {option.detail === 'Workspace' ? t('workspaceWorkspace') : option.detail === 'Subject Hub' ? t('workspaceSubjectHub') : option.detail}
          </option>
        ))}
      </select>
    </label>
  )
}

function WorkspaceNav({ admin, onNavigate }: { admin: EffectiveAdmin; onNavigate?: () => void }) {
  const { t } = useLanguage()
  const location = useLocation()
  const activeContextId = currentContextId(location.pathname, admin)
  const navItems = useMemo(() => buildWorkspaceNav(admin, activeContextId), [activeContextId, admin])
  const groups: Array<{ id: WorkspaceNavItem['group']; label: string }> = [
    { id: 'primary', label: t('workspacePrimary') },
    { id: 'admin', label: t('workspaceAdministration') },
  ]
  const isActive = (item: WorkspaceNavItem) => {
    if (item.activeMatch === 'exact') return location.pathname === item.to
    if (item.activeMatch === 'content-create') return location.pathname.startsWith('/admin/hubs/') && parseWorkspaceContentView(new URLSearchParams(location.search).get('view')) === 'create'
    if (item.activeMatch === 'content-library') return location.pathname.startsWith('/admin/hubs/') && parseWorkspaceContentView(new URLSearchParams(location.search).get('view')) !== 'create'
    if (item.activeMatch === 'submissions') return location.pathname === '/admin/pending' || location.pathname === '/admin/approved' || location.pathname.startsWith('/admin/submissions/')
    return location.pathname === item.to
  }

  return (
    <nav className="workspace-nav" aria-label={t('workspaceTeacherNav')}>
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
                {navTranslationKeys[item.label] ? t(navTranslationKeys[item.label]) : item.label}
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
  const { t } = useLanguage()
  const location = useLocation()
  const contextLabel = translateContextLabel(currentContextLabel(location.pathname, admin), t)

  return (
    <header className="workspace-topbar">
      <Link className="workspace-topbar-logo" to="/ied" aria-label={t('workspacePublicHomeAria')}>
        <img src="/school-logo.svg" alt="" />
      </Link>
      <div>
        <p>{contextLabel}</p>
      </div>
      <div className="workspace-account">
        <span>{admin.displayName || admin.username}</span>
        <button className="workspace-text-button" type="button" onClick={() => void logout()}>{t('signOut')}</button>
      </div>
    </header>
  )
}

function WorkspaceHeader({ admin }: { admin: EffectiveAdmin }) {
  const location = useLocation()
  const { t } = useLanguage()
  const heading = currentWorkspaceHeading(location.pathname, location.search)

  return (
    <div className="workspace-header">
      <div>
        <p>{translateContextLabel(currentContextLabel(location.pathname, admin), t)}</p>
        <h2>{headingTranslationKeys[heading] ? t(headingTranslationKeys[heading]) : heading}</h2>
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
  const { t } = useLanguage()
  const location = useLocation()

  return (
    <div className="workspace-sidebar-utility">
      <div>
        <span>{admin.displayName || admin.username}</span>
        <small>{t(roleTranslationKeys[admin.role])}</small>
      </div>
      <Link to={currentPublicHubRoute(location.pathname, admin)}>{t('workspaceViewPublicHub')}</Link>
      <button type="button" onClick={() => void logout()}>{t('signOut')}</button>
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
  const { t } = useLanguage()
  const location = useLocation()
  const activeContextId = currentContextId(location.pathname, admin)
  const navItems = useMemo(() => buildWorkspaceNav(admin, activeContextId), [activeContextId, admin])
  const overview = navItems.find((item) => item.label === 'Overview')
  const create = navItems.find((item) => item.label === 'Create Content')
  const library = navItems.find((item) => item.label === 'Content Library')
  const isCreate = location.pathname.startsWith('/admin/hubs/') && parseWorkspaceContentView(new URLSearchParams(location.search).get('view')) === 'create'
  const isLibrary = location.pathname.startsWith('/admin/hubs/') && parseWorkspaceContentView(new URLSearchParams(location.search).get('view')) !== 'create'

  return (
    <nav className="workspace-bottom-nav" aria-label={t('workspaceShortcuts')}>
      {overview && <NavLink to={overview.to} end>{t('workspaceOverview')}</NavLink>}
      {create && <Link className={isCreate ? 'active' : undefined} aria-current={isCreate ? 'page' : undefined} to={create.to}>{t('workspaceCreateShort')}</Link>}
      {library && <Link className={isLibrary ? 'active' : undefined} aria-current={isLibrary ? 'page' : undefined} to={library.to}>{t('workspaceLibraryShort')}</Link>}
      <button ref={moreButtonRef} type="button" onClick={onOpenMore} aria-controls="workspace-mobile-drawer" aria-expanded={drawerOpen} aria-haspopup="dialog">{t('workspaceMore')}</button>
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
  const { t } = useLanguage()
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
        aria-label={t('workspaceTeacherNavDialog')}
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
          <button ref={closeButtonRef} className="workspace-icon-button" type="button" onClick={onClose} aria-label={t('workspaceCloseNavigation')}>x</button>
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
