import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { EffectiveAdmin } from '../../../auth'
import { useAuth } from '../../../auth'
import { watchAdminUsers } from '../../../data'
import { isFirebaseConfigured } from '../../../firebase'
import { hubConfigs } from '../../../hubs'
import {
  archiveStaffUser,
  createStaffUser,
  disableStaffUser,
  enableStaffUser,
  ensureProtectedOwnerRecord,
  getStaffBackendHealth,
  resetStaffPassword,
  updateStaffAccess,
} from '../../../staffFunctions'
import type { AdminRole, AdminUser, StaffPermissions } from '../../../types'
import { canManageUsersForAdmin, staffPermissionKeys, staffPermissionLabels } from '../../../utils/authorization'
import { normalizeStaffUsername, protectedOwnerUsername } from '../../../utils/staffAuth'
import { ConfirmDialog, EmptyState, StepIndicator } from '../ProtectedWorkspace'
import {
  accessRecoveryKey,
  accessSummary,
  accessWizardStepLabels,
  accessWizardSteps,
  applyPermissionPreset,
  applyRole,
  assignableHubConfigs,
  assignableRoles,
  buildStaffAccessPayload,
  draftFromAdminUser,
  emptyAccessDraft,
  hubLabels,
  permissionLabels,
  permissionPresets,
  protectedOwnerDraft,
  serializeRecoverableDraft,
  toggleHub,
  togglePermission,
  type AccessDraft,
  type AccessWizardStep,
} from './accessWizardModel'
import { hasAccessErrors, validateAccessWizardStep, type AccessWizardErrors } from './accessWizardValidation'

type ConfirmAction = 'enable' | 'disable' | 'archive' | 'save' | null

function staffAccessErrorMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error || '')
  if (raw.toLowerCase().includes('backend') || raw.toLowerCase().includes('functions') || raw.toLowerCase().includes('internal')) {
    return 'Staff accounts could not be loaded. Try again or check the local emulator connection.'
  }
  return 'Staff accounts could not be loaded. Try again or check your connection.'
}

export function StaffAccessPage() {
  const { adminUser, user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [backendReady, setBackendReady] = useState(isFirebaseConfigured)
  const [busyAction, setBusyAction] = useState('')
  const [confirmAction, setConfirmAction] = useState<{ action: ConfirmAction; user: AdminUser } | null>(null)
  const [resetUser, setResetUser] = useState<AdminUser | null>(null)
  const view = searchParams.get('view')
  const editingId = searchParams.get('user') ?? ''
  const isWizardRoute = view === 'create' || view === 'edit'
  const editingUser = editingId ? adminUsers.find((item) => item.id === editingId) : undefined

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined
    return watchAdminUsers(
      (nextUsers) => {
        setAdminUsers(nextUsers)
        setLoading(false)
      },
      (watchError) => {
        setError(staffAccessErrorMessage(watchError))
        setLoading(false)
      },
    )
  }, [])

  useEffect(() => {
    if (!isFirebaseConfigured) return
    let cancelled = false
    const check = async () => {
      try {
        await getStaffBackendHealth()
        if (!cancelled) setBackendReady(true)
      } catch {
        if (!cancelled) {
          setBackendReady(false)
          setMessage('Staff actions are temporarily unavailable. Try again or check the local emulator connection.')
        }
      }
    }
    void check()
    return () => {
      cancelled = true
    }
  }, [])

  const openCreate = () => {
    setMessage('')
    setSearchParams({ view: 'create' })
  }

  const openEdit = (item: AdminUser) => {
    setMessage('')
    setSearchParams({ view: 'edit', user: item.id })
  }

  const closeWizard = () => {
    setSearchParams({}, { replace: true })
  }

  const runProtectedOwnerRepair = async () => {
    try {
      setBusyAction('repair-owner')
      await ensureProtectedOwnerRecord()
      setMessage(`Protected owner record for ${protectedOwnerUsername} is ready.`)
    } catch (repairError) {
      setMessage(repairError instanceof Error ? repairError.message : 'Could not repair the protected owner record.')
    } finally {
      setBusyAction('')
    }
  }

  const runListAction = async () => {
    if (!confirmAction || !confirmAction.user || busyAction) return
    const item = confirmAction.user
    try {
      setBusyAction(`${confirmAction.action}-${item.id}`)
      if (confirmAction.action === 'enable') {
        await enableStaffUser(item.id)
        setMessage(`Enabled ${item.username}.`)
      }
      if (confirmAction.action === 'disable') {
        await disableStaffUser(item.id)
        setMessage(`Disabled ${item.username}.`)
      }
      if (confirmAction.action === 'archive') {
        await archiveStaffUser(item.id)
        setMessage(`Archived ${item.username}. Historical audit records remain available.`)
      }
    } catch (actionError) {
      setMessage(actionError instanceof Error ? actionError.message : 'Could not update staff access.')
    } finally {
      setBusyAction('')
      setConfirmAction(null)
    }
  }

  if (!canManageUsersForAdmin(adminUser)) {
    return (
      <section className="admin-page staff-access-page">
        <EmptyState title="Staff access is unavailable" body="This account does not have permission to manage staff access." />
      </section>
    )
  }

  return (
    <section className="admin-page staff-access-page">
      <div className="staff-access-pagebar">
        <div>
          <h1>{isWizardRoute ? 'Guided staff setup' : 'Staff Access'}</h1>
          <p>Create accounts, assign hub access, and keep staff responsibilities clear.</p>
        </div>
        {!isWizardRoute && <button className="primary-button blue" type="button" onClick={openCreate}>Add Staff Member</button>}
      </div>
      {adminUser?.source === 'bootstrap' && (
        <details className="staff-diagnostics">
          <summary>Admin diagnostics</summary>
          <p>The protected owner path is active for <strong>{protectedOwnerUsername}</strong>.</p>
          <button className="small-button" type="button" disabled={busyAction === 'repair-owner'} onClick={() => void runProtectedOwnerRepair()}>
            Repair owner record
          </button>
        </details>
      )}
      {message && <p className="form-message" aria-live="polite">{message}</p>}
      {error && <p className="form-message">{error}</p>}

      {isWizardRoute ? (
        loading && view === 'edit' ? (
          <p className="module-note quiet">Loading staff account...</p>
        ) : view === 'edit' && !editingUser ? (
          <EmptyState title="Staff account not found" body="Return to staff access and choose a current account." action={<button className="secondary-button" type="button" onClick={closeWizard}>Back to Staff Access</button>} />
        ) : (
          <AccessWizard
            admin={adminUser}
            backendReady={backendReady}
            editingUser={view === 'edit' ? editingUser : undefined}
            userEmail={user?.email ?? adminUser?.email ?? ''}
            onDone={closeWizard}
            onMessage={setMessage}
          />
        )
      ) : (
        <StaffAccessList
          admin={adminUser}
          adminUsers={adminUsers}
          backendReady={backendReady}
          error={error}
          loading={loading}
          onEdit={openEdit}
          onReset={setResetUser}
          onConfirmAction={(action, item) => setConfirmAction({ action, user: item })}
        />
      )}

      {resetUser && (
        <PasswordResetDialog
          item={resetUser}
          onClose={() => setResetUser(null)}
          onMessage={setMessage}
        />
      )}
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.action === 'archive' ? 'Archive staff account?' : `${confirmAction.action === 'disable' ? 'Disable' : 'Enable'} staff account?`}
          description={actionDescription(confirmAction.action, confirmAction.user)}
          onClose={() => setConfirmAction(null)}
        >
          <div className="workspace-dialog-actions">
            <button className={confirmAction.action === 'archive' ? 'danger-button' : 'primary-button blue'} disabled={Boolean(busyAction)} type="button" onClick={() => void runListAction()}>
              {confirmAction.action === 'archive' ? 'Archive account' : confirmAction.action === 'disable' ? 'Disable account' : 'Enable account'}
            </button>
          </div>
        </ConfirmDialog>
      )}
    </section>
  )
}

function StaffAccessList({
  admin,
  adminUsers,
  backendReady,
  error,
  loading,
  onEdit,
  onReset,
  onConfirmAction,
}: {
  admin: EffectiveAdmin | null
  adminUsers: AdminUser[]
  backendReady: boolean
  error: string
  loading: boolean
  onEdit: (item: AdminUser) => void
  onReset: (item: AdminUser) => void
  onConfirmAction: (action: ConfirmAction, item: AdminUser) => void
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'disabled'>('all')
  const [role, setRole] = useState<'all' | AdminRole>('all')
  const [hub, setHub] = useState('all')
  const sectionLabelById = useMemo(() => Object.fromEntries(hubConfigs.map((config) => [config.sectionId, config.sectionName])) as Record<string, string>, [])

  const filtered = adminUsers.filter((item) => {
    const haystack = `${item.displayName} ${item.username} ${item.contactEmail}`.toLowerCase()
    if (query && !haystack.includes(query.toLowerCase())) return false
    if (status === 'active' && !item.active) return false
    if (status === 'disabled' && item.active) return false
    if (role !== 'all' && item.role !== role) return false
    if (hub !== 'all' && item.role !== 'superAdmin' && !item.allowedSectionIds.includes(hub) && !item.allowedSectionIds.includes('*')) return false
    return true
  })

  return (
    <div className="staff-access-list-view">
      <div className="staff-access-toolbar" aria-label="Staff filters">
        <label>Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, username, or email" /></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="all">All</option><option value="active">Active</option><option value="disabled">Disabled</option></select></label>
        <label>Role<select value={role} onChange={(event) => setRole(event.target.value as typeof role)}><option value="all">All</option><option value="editor">Editor</option><option value="admin">Administrator</option><option value="superAdmin">Super administrator</option></select></label>
        <label>Hub<select value={hub} onChange={(event) => setHub(event.target.value)}><option value="all">All hubs</option>{assignableHubConfigs(admin).map((config) => <option key={config.sectionId} value={config.sectionId}>{config.sectionName}</option>)}</select></label>
      </div>
      <p className="staff-owner-inline">Protected owner safeguards active</p>
      {!backendReady && <p className="staff-access-note">Staff actions are unavailable until the backend connection is restored.</p>}
      {loading && <p className="staff-access-note">Loading staff accounts...</p>}
      <div className="staff-directory" role="table" aria-label="Staff directory">
        {filtered.length > 0 && (
          <div className="staff-directory-head" role="row">
            <span role="columnheader">Staff member</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Role</span>
            <span role="columnheader">Hubs</span>
            <span role="columnheader">Responsibilities</span>
            <span role="columnheader">Actions</span>
          </div>
        )}
        {filtered.length ? filtered.map((item) => (
          <article className="staff-directory-row" role="row" key={item.id}>
            <div className="staff-directory-person" role="cell">
              <h3>{item.displayName || item.username}</h3>
              <p className="staff-account-identity"><span>@{item.username}</span>{item.contactEmail && <span>{item.contactEmail}</span>}</p>
              {item.protectedOwner && <span className="staff-owner-chip">Protected owner</span>}
            </div>
            <div role="cell"><span className={`status-badge ${item.active ? 'status-published' : 'status-hidden'}`}>{item.active ? 'Active' : 'Disabled'}</span></div>
            <div role="cell"><span className="badge">{roleLabel(item.role)}</span></div>
            <div className="staff-access-chip-group" role="cell" aria-label={`Hub access for ${item.username}`}>
              {(item.role === 'superAdmin' ? ['All hubs'] : item.allowedSectionIds.length ? item.allowedSectionIds.map((sectionId) => sectionLabelById[sectionId] ?? sectionId) : ['No hubs']).map((label) => (
                <span className="staff-access-chip" key={label}>{label}</span>
              ))}
            </div>
            <p className="staff-responsibility-summary" role="cell">{accessSummary(draftFromAdminUser(item, item.updatedBy))}</p>
            <div className="staff-directory-actions" role="cell">
              <button className="secondary-button" type="button" onClick={() => onEdit(item)}>Edit</button>
              {!item.protectedOwner && <button className="secondary-button" type="button" disabled={!backendReady} onClick={() => onReset(item)}>Reset Password</button>}
              {!item.protectedOwner && (item.active
                ? <button className="secondary-button" type="button" disabled={!backendReady} onClick={() => onConfirmAction('disable', item)}>Disable</button>
                : <button className="secondary-button" type="button" disabled={!backendReady} onClick={() => onConfirmAction('enable', item)}>Enable</button>)}
              {!item.protectedOwner && <button className="danger-button" type="button" disabled={!backendReady} onClick={() => onConfirmAction('archive', item)}>Archive</button>}
            </div>
          </article>
        )) : (
          !loading && (
            <div className="staff-directory-empty">
              <h2>{error ? 'Staff accounts could not be loaded' : adminUsers.length ? 'No staff match these filters' : 'No staff accounts yet'}</h2>
              <p>{error || (adminUsers.length ? 'Adjust the filters to show more staff accounts.' : backendReady ? 'Add the first staff member to begin managing access.' : 'Check the local emulator connection and try again.')}</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

function AccessWizard({
  admin,
  backendReady,
  editingUser,
  userEmail,
  onDone,
  onMessage,
}: {
  admin: EffectiveAdmin | null
  backendReady: boolean
  editingUser?: AdminUser
  userEmail: string
  onDone: () => void
  onMessage: (message: string) => void
}) {
  const navigate = useNavigate()
  const isEditing = Boolean(editingUser)
  const [step, setStep] = useState<AccessWizardStep>('details')
  const [draft, setDraft] = useState<AccessDraft>(() => editingUser ? draftFromAdminUser(editingUser, userEmail) : emptyAccessDraft(userEmail))
  const [temporaryPassword, setTemporaryPassword] = useState(() => isEditing ? '' : generateTemporaryPassword())
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<AccessWizardErrors>({})
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<{ username: string; temporaryPassword: string; mode: 'created' | 'updated' } | null>(null)
  const [recoveredDraft, setRecoveredDraft] = useState<AccessDraft | null>(null)
  const [confirmSave, setConfirmSave] = useState(false)
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const adminKey = admin?.id ?? admin?.email ?? 'unknown'
  const recoveryKey = accessRecoveryKey(adminKey, isEditing ? 'edit' : 'create', editingUser?.id)

  useEffect(() => {
    queueMicrotask(() => {
      setDraft(editingUser ? draftFromAdminUser(editingUser, userEmail) : emptyAccessDraft(userEmail))
      setTemporaryPassword(editingUser ? '' : generateTemporaryPassword())
      setStep('details')
      setErrors({})
      setSaveResult(null)
    })
  }, [editingUser, userEmail])

  useEffect(() => {
    if (isEditing && editingUser?.protectedOwner) return
    const saved = localStorage.getItem(recoveryKey)
    if (!saved) return
    try {
      queueMicrotask(() => setRecoveredDraft(JSON.parse(saved) as AccessDraft))
    } catch {
      localStorage.removeItem(recoveryKey)
    }
  }, [isEditing, editingUser?.protectedOwner, recoveryKey])

  useEffect(() => {
    if (step === 'success' || saveResult || (isEditing && editingUser?.protectedOwner)) return
    localStorage.setItem(recoveryKey, JSON.stringify(serializeRecoverableDraft(draft)))
  }, [draft, editingUser?.protectedOwner, isEditing, recoveryKey, saveResult, step])

  useEffect(() => {
    queueMicrotask(() => headingRef.current?.focus())
  }, [step])

  const updateDraft = (patch: Partial<AccessDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...patch }
      return next.protectedOwner ? protectedOwnerDraft(next) : next
    })
  }

  const validateCurrent = () => {
    const nextErrors = validateAccessWizardStep(step, draft, { admin, editing: isEditing, temporaryPassword })
    setErrors(nextErrors)
    return !hasAccessErrors(nextErrors)
  }

  const goToStep = (nextStep: AccessWizardStep) => {
    setErrors({})
    setStep(nextStep)
  }

  const next = () => {
    if (!validateCurrent()) return
    const index = Math.min(accessWizardSteps.length - 2, accessWizardSteps.indexOf(step) + 1)
    goToStep(accessWizardSteps[index])
  }

  const back = () => {
    const index = Math.max(0, accessWizardSteps.indexOf(step) - 1)
    goToStep(accessWizardSteps[index])
  }

  const finish = () => {
    const reviewErrors = validateAccessWizardStep('review', draft, { admin, editing: isEditing, temporaryPassword })
    setErrors(reviewErrors)
    if (hasAccessErrors(reviewErrors)) return
    if (draft.role === 'superAdmin' || draft.permissions.manageUsers || (!draft.active && editingUser?.active)) {
      setConfirmSave(true)
      return
    }
    void save()
  }

  const save = async () => {
    if (saving) return
    setSaving(true)
    try {
      const payload = buildStaffAccessPayload(draft, admin)
      if (isEditing && editingUser) {
        await updateStaffAccess(editingUser.id, payload)
        setSaveResult({ username: payload.username, temporaryPassword: '', mode: 'updated' })
        onMessage(`Updated staff access for ${payload.username}.`)
      } else {
        await createStaffUser({ ...payload, temporaryPassword })
        setSaveResult({ username: payload.username, temporaryPassword, mode: 'created' })
        onMessage(`Created staff account for ${payload.username}. Share the temporary password securely.`)
      }
      localStorage.removeItem(recoveryKey)
      setConfirmSave(false)
      setStep('success')
    } catch (saveError) {
      onMessage(saveError instanceof Error ? saveError.message : 'Could not save staff access.')
    } finally {
      setSaving(false)
    }
  }

  const leave = () => {
    setTemporaryPassword('')
    onDone()
  }

  const copy = async (value: string, label: string) => {
    await navigator.clipboard?.writeText(value)
    onMessage(`${label} copied.`)
  }

  const summary = accessSummary(draft)

  return (
    <section className="access-wizard-page" aria-labelledby="access-wizard-heading">
      <div className="content-wizard-topline">
        <div>
          <p className="eyebrow">{isEditing ? 'Editing staff access' : 'New staff access'}</p>
          <h1 ref={headingRef} id="access-wizard-heading" tabIndex={-1}>{accessWizardStepLabels[step]}</h1>
          <p>{isEditing ? 'Review responsibilities before saving account changes.' : 'Create a secure staff account with clear responsibilities.'}</p>
        </div>
        <button className="secondary-button" type="button" onClick={leave}>Back to Staff Access</button>
      </div>
      <StepIndicator steps={accessWizardSteps.map((item) => accessWizardStepLabels[item])} currentStep={accessWizardSteps.indexOf(step)} />
      <div className="wizard-step-status" aria-live="polite">Step {accessWizardSteps.indexOf(step) + 1} of {accessWizardSteps.length}: {accessWizardStepLabels[step]}</div>

      {recoveredDraft && (
        <div className="wizard-recovery">
          <div><strong>Continue saved setup?</strong><span>Safe account setup fields were saved on this device. The temporary password was not saved.</span></div>
          <button className="small-button" type="button" onClick={() => { setDraft(recoveredDraft); setRecoveredDraft(null) }}>Continue Setup</button>
          <button className="text-button" type="button" onClick={() => { localStorage.removeItem(recoveryKey); setRecoveredDraft(null) }}>Start Over</button>
        </div>
      )}

      <div className="access-wizard-layout">
        <main className="content-wizard-card">
          <ErrorSummary errors={errors} />
          {step === 'details' && (
            <div className="wizard-form-grid">
              <WizardField id="staff-display-name" label="Display name" error={errors.displayName} hint="Example: Jordan Lee">
                <input id="staff-display-name" value={draft.displayName} onChange={(event) => updateDraft({ displayName: event.target.value })} />
              </WizardField>
              <WizardField id="staff-username" label="Username" error={errors.username} hint={`Sign-in username: ${normalizeStaffUsername(draft.username) || 'username'}`}>
                <input id="staff-username" value={draft.username} disabled={isEditing || draft.protectedOwner} onChange={(event) => updateDraft({ username: normalizeStaffUsername(event.target.value), normalizedUsername: normalizeStaffUsername(event.target.value) })} />
              </WizardField>
              <WizardField id="staff-contact-email" label="Contact email" error={errors.contactEmail} hint="Optional staff contact address.">
                <input id="staff-contact-email" type="email" value={draft.contactEmail} onChange={(event) => updateDraft({ contactEmail: event.target.value })} />
              </WizardField>
              {!isEditing && (
                <WizardField id="staff-temp-password" label="Temporary password" error={errors.temporaryPassword} hint="Show this once after account creation. Share it securely.">
                  <div className="password-control">
                    <input id="staff-temp-password" autoComplete="new-password" type={showPassword ? 'text' : 'password'} value={temporaryPassword} onChange={(event) => setTemporaryPassword(event.target.value)} />
                    <button className="small-button" type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'}</button>
                    <button className="small-button" type="button" onClick={() => setTemporaryPassword(generateTemporaryPassword())}>Generate</button>
                    <button className="small-button" type="button" onClick={() => void copy(temporaryPassword, 'Temporary password')}>Copy</button>
                  </div>
                </WizardField>
              )}
              {isEditing && <p className="module-note quiet span-2">Existing passwords are never shown. Use Reset Password from the staff list for a deliberate one-time reset.</p>}
            </div>
          )}

          {step === 'role' && (
            <>
              <fieldset className="wizard-type-grid">
                <legend>Choose a role</legend>
                {assignableRoles(admin).map((card) => (
                  <label className={draft.role === card.role ? 'wizard-type-card is-selected' : 'wizard-type-card'} key={card.role}>
                    <input type="radio" name="staff-role" checked={draft.role === card.role} onChange={() => setDraft((current) => applyRole(current, card.role, admin))} />
                    <span>{card.title}</span>
                    <small>{card.help}</small>
                    {card.warning && <em>{card.warning}</em>}
                  </label>
                ))}
              </fieldset>
              {draft.role !== 'superAdmin' && (
                <fieldset className="access-preset-grid">
                  <legend>Responsibility preset</legend>
                  {permissionPresets.filter((preset) => !preset.requiresSuperAdmin || admin?.role === 'superAdmin').map((preset) => (
                    <button className={draft.permissionPreset === preset.id ? 'access-preset is-selected' : 'access-preset'} type="button" key={preset.id} onClick={() => setDraft((current) => applyPermissionPreset(current, preset.id, admin))}>
                      <strong>{preset.title}</strong>
                      <span>{preset.help}</span>
                      <small>{permissionLabels(preset.permissions).join(', ') || 'No responsibilities'}</small>
                    </button>
                  ))}
                </fieldset>
              )}
              <fieldset className="access-permission-grid">
                <legend>Responsibilities</legend>
                {staffPermissionKeys.map((permission) => (
                  <label className="checkbox-row" key={permission}>
                    <input checked={draft.role === 'superAdmin' || draft.permissions[permission]} disabled={draft.role === 'superAdmin'} onChange={() => setDraft((current) => togglePermission(current, permission, admin))} type="checkbox" />
                    <span>{staffPermissionLabels[permission]}</span>
                  </label>
                ))}
              </fieldset>
            </>
          )}

          {step === 'hubs' && (
            <fieldset className="hub-access-grid">
              <legend>Choose hub access</legend>
              {draft.role === 'superAdmin' ? <p className="module-note quiet">Super administrators automatically receive all hub access.</p> : assignableHubConfigs(admin).map((config) => (
                <label className={draft.allowedSectionIds.includes(config.sectionId) ? 'hub-access-card is-selected' : 'hub-access-card'} key={config.sectionId}>
                  <input type="checkbox" checked={draft.allowedSectionIds.includes(config.sectionId)} onChange={() => setDraft((current) => toggleHub(current, config.sectionId, admin))} />
                  <span>{config.sectionName}</span>
                  <small>{config.eyebrow}</small>
                </label>
              ))}
              {errors.allowedSectionIds && <p className="field-error">{errors.allowedSectionIds}</p>}
            </fieldset>
          )}

          {step === 'review' && (
            <div className="wizard-review access-review">
              <ReviewBlock title="Staff Member" onEdit={() => goToStep('details')}>
                <p>{draft.displayName || 'Unnamed staff member'} · @{normalizeStaffUsername(draft.username)}</p>
                <p>{draft.contactEmail || 'No contact email'}</p>
              </ReviewBlock>
              <ReviewBlock title="Role" onEdit={() => goToStep('role')}>
                <p>{roleLabel(draft.role)}</p>
                {(draft.role === 'superAdmin' || draft.permissions.manageUsers) && <p className="danger-note">High-trust access selected.</p>}
              </ReviewBlock>
              <ReviewBlock title="Hub Access" onEdit={() => goToStep('hubs')}>
                <p>{hubLabels(draft.role === 'superAdmin' ? ['*'] : draft.allowedSectionIds).join(', ')}</p>
              </ReviewBlock>
              <ReviewBlock title="Responsibilities" onEdit={() => goToStep('role')}>
                <p>{permissionLabels(draft.role === 'superAdmin' ? fullPermissions() : draft.permissions).join(', ') || 'No responsibilities selected'}</p>
              </ReviewBlock>
              <ReviewBlock title="Plain-English Result" onEdit={() => goToStep('role')}>
                <p>{summary}</p>
              </ReviewBlock>
            </div>
          )}

          {step === 'success' && saveResult && (
            <div className="wizard-success" role="status">
              <span>{saveResult.mode === 'created' ? 'Account Created' : 'Access Updated'}</span>
              <h2>{saveResult.mode === 'created' ? 'Staff account ready' : 'Access changes saved'}</h2>
              <p>@{saveResult.username} · {roleLabel(draft.role)} · {hubLabels(draft.role === 'superAdmin' ? ['*'] : draft.allowedSectionIds).join(', ')}</p>
              {saveResult.temporaryPassword && (
                <div className="credential-panel">
                  <strong>Temporary password</strong>
                  <code>{saveResult.temporaryPassword}</code>
                  <p>Share this securely. It will not be shown again after leaving this screen.</p>
                </div>
              )}
              <div className="wizard-success-actions">
                <button className="secondary-button" type="button" onClick={() => void copy(saveResult.username, 'Username')}>Copy Username</button>
                {saveResult.temporaryPassword && <button className="secondary-button" type="button" onClick={() => void copy(saveResult.temporaryPassword, 'Temporary password')}>Copy Temporary Password</button>}
                <button className="secondary-button" type="button" onClick={() => void copy(loginInstructions(saveResult.username, saveResult.temporaryPassword), 'Login instructions')}>Copy Login Instructions</button>
                <button className="primary-button blue" type="button" onClick={leave}>Return to Staff Access</button>
                {!isEditing && <button className="small-button" type="button" onClick={() => { setTemporaryPassword(generateTemporaryPassword()); setSaveResult(null); setDraft(emptyAccessDraft(userEmail)); setStep('details'); navigate('/admin/users?view=create') }}>Add Another Staff Member</button>}
              </div>
            </div>
          )}
        </main>
        {step !== 'success' && (
          <aside className="access-summary-panel" aria-label="Plain-English access summary">
            <span>Access summary</span>
            <p>{summary}</p>
          </aside>
        )}
      </div>
      {step !== 'success' && (
        <div className="content-wizard-actions">
          <button className="secondary-button" type="button" disabled={step === 'details'} onClick={back}>Back</button>
          {step === 'review'
            ? <button className="primary-button blue" type="button" disabled={!backendReady || saving} onClick={finish}>{isEditing ? 'Save Access Changes' : 'Create Staff Account'}</button>
            : <button className="primary-button blue" type="button" onClick={next}>Continue</button>}
        </div>
      )}
      {confirmSave && (
        <ConfirmDialog title="Confirm high-trust access" description="This change grants sensitive access or changes account availability. Review it once more before saving." onClose={() => setConfirmSave(false)}>
          <p>{summary}</p>
          <div className="workspace-dialog-actions">
            <button className="primary-button blue" disabled={saving} type="button" onClick={() => void save()}>{isEditing ? 'Save Access Changes' : 'Create Staff Account'}</button>
          </div>
        </ConfirmDialog>
      )}
    </section>
  )
}

function PasswordResetDialog({ item, onClose, onMessage }: { item: AdminUser; onClose: () => void; onMessage: (message: string) => void }) {
  const [password, setPassword] = useState(generateTemporaryPassword())
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const save = async () => {
    if (item.protectedOwner) {
      setError(`The protected owner ${protectedOwnerUsername} cannot be reset by staff management.`)
      return
    }
    if (password.length < 12) {
      setError('Temporary password must be at least 12 characters.')
      return
    }
    try {
      setSaving(true)
      await resetStaffPassword(item.id, password)
      setDone(true)
      onMessage(`Password reset prepared for ${item.username}. Share the temporary password securely.`)
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Could not reset the password.')
    } finally {
      setSaving(false)
    }
  }

  const close = () => {
    setPassword('')
    onClose()
  }

  return (
    <ConfirmDialog title={done ? 'Temporary password ready' : `Reset password for ${item.username}`} description="The staff member must change this password on next login. It is never stored locally." onClose={close}>
      {error && <p className="field-error">{error}</p>}
      <div className="password-control">
        <input aria-label="New temporary password" type={show ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} disabled={done} />
        <button className="small-button" type="button" onClick={() => setShow((value) => !value)}>{show ? 'Hide' : 'Show'}</button>
        {!done && <button className="small-button" type="button" onClick={() => setPassword(generateTemporaryPassword())}>Generate</button>}
        <button className="small-button" type="button" onClick={() => void navigator.clipboard?.writeText(password)}>Copy</button>
      </div>
      <div className="workspace-dialog-actions">
        {!done && <button className="primary-button blue" type="button" disabled={saving} onClick={() => void save()}>Reset Password</button>}
      </div>
    </ConfirmDialog>
  )
}

function WizardField({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="wizard-field" htmlFor={id}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
      {error && <em className="field-error">{error}</em>}
    </label>
  )
}

function ErrorSummary({ errors }: { errors: AccessWizardErrors }) {
  const items = Object.entries(errors).filter(([, message]) => Boolean(message))
  if (!items.length) return null
  return (
    <div className="wizard-error-summary" role="alert">
      <strong>Check these details</strong>
      {items.map(([field, message]) => <button type="button" key={field} onClick={() => document.getElementById(`staff-${field}`)?.focus()}>{message}</button>)}
    </div>
  )
}

function ReviewBlock({ title, children, onEdit }: { title: string; children: ReactNode; onEdit: () => void }) {
  return (
    <article>
      <div><h3>{title}</h3><button className="text-button" type="button" onClick={onEdit}>Edit</button></div>
      {children}
    </article>
  )
}

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%+=?'
  const values = new Uint32Array(16)
  crypto.getRandomValues(values)
  return Array.from(values, (value) => chars[value % chars.length]).join('')
}

function roleLabel(role: AdminRole) {
  if (role === 'superAdmin') return 'Super administrator'
  if (role === 'admin') return 'Administrator'
  return 'Editor'
}

function fullPermissions(): StaffPermissions {
  return staffPermissionKeys.reduce<StaffPermissions>((next, permission) => ({ ...next, [permission]: true }), {} as StaffPermissions)
}

function loginInstructions(username: string, password: string) {
  return password
    ? `Sign in to the IED Hub staff workspace with username ${username} and temporary password ${password}. You will be asked to choose a new password on first login.`
    : `Sign in to the IED Hub staff workspace with username ${username}. Your access has been updated.`
}

function actionDescription(action: ConfirmAction, item: AdminUser) {
  if (action === 'archive') return `Archive ${item.username}? The account will be removed from staff access, but historical audit data remains.`
  if (action === 'disable') return `Disable ${item.username}? They will not be able to sign in until re-enabled.`
  return `Enable ${item.username}? Access resumes immediately based on their assigned role, hubs, and responsibilities.`
}
