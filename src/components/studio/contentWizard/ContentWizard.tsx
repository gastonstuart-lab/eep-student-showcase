import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../auth'
import { createContentItem, updateContentItem } from '../../../data'
import { hubConfigById, type HubConfig } from '../../../hubs'
import type { ContentItem, ContentItemInput, ContentType } from '../../../types'
import { canCreateContentForAdmin } from '../../../utils/authorization'
import { contentItemPreviewFromInput, sanitizeContentItemInput, validateContentAppearance } from '../../../utils/contentAppearance'
import { ContentCard } from '../../public/ContentCard'
import { ConfirmDialog, EmptyState } from '../ProtectedWorkspace'
import { workspaceHubViewUrl } from '../workspaceRouting'
import {
  applyTypeDefaults,
  buildWizardPayload,
  canEditContentItem,
  canPublishForDraft,
  contentTypeLabels,
  contentTypeOptions,
  contentWizardStepLabels,
  contentWizardSteps,
  defaultDraftFor,
  draftFromContentItem,
  getCreatableHubConfigs,
  publishingChoiceForDraft,
  recoveryKey,
  type ContentWizardStep,
  type PublishingChoice,
  type WizardSaveResult,
} from './contentWizardModel'
import { hasErrors, validateWizardStep, type WizardErrors } from './contentWizardValidation'

interface ContentWizardProps {
  config: HubConfig
  contentCount: number
  contentItems: ContentItem[]
  editingId?: string | null
  userEmail: string
}

function stepNumber(step: ContentWizardStep) {
  return contentWizardSteps.indexOf(step)
}

function fieldId(name: string) {
  return `content-wizard-${name}`
}

const visibleStages = ['Choose type', 'Create content', 'Review and publish'] as const

function visibleStageIndex(step: ContentWizardStep) {
  if (step === 'type') return 0
  if (step === 'review' || step === 'success') return 2
  return 1
}

function fieldLabel(type: ContentType, field: 'title' | 'summary' | 'body') {
  const labels: Record<ContentType, Record<'title' | 'summary' | 'body', string>> = {
    announcement: { title: 'Announcement title', summary: 'Short summary', body: 'Announcement details' },
    event: { title: 'Event title', summary: 'Event summary', body: 'Event details' },
    resource: { title: 'Resource title', summary: 'Short explanation', body: 'Resource notes' },
    video: { title: 'Video title', summary: 'Short introduction', body: 'Description' },
    studentWork: { title: 'Student work title', summary: 'Achievement summary', body: 'Story or reflection' },
    link: { title: 'Link title', summary: 'Short explanation', body: 'Optional context' },
  }

  return labels[type][field]
}

function ErrorSummary({ errors }: { errors: WizardErrors }) {
  const entries = Object.entries(errors)
  if (!entries.length) return null

  return (
    <div className="wizard-error-summary" role="alert" aria-live="assertive">
      <strong>Before continuing, check:</strong>
      <ul>
        {entries.map(([key, message]) => (
          <li key={key}>
            <a href={`#${fieldId(key)}`}>{message}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function WizardField({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className={error ? 'wizard-field has-error' : 'wizard-field'} htmlFor={fieldId(id)}>
      <span>{label}</span>
      {hint && <small>{hint}</small>}
      {children}
      {error && <em id={`${fieldId(id)}-error`}>{error}</em>}
    </label>
  )
}

export function ContentWizard({ config, contentCount, contentItems, editingId, userEmail }: ContentWizardProps) {
  const { adminUser, user } = useAuth()
  const navigate = useNavigate()
  const editingItem = editingId ? contentItems.find((item) => item.id === editingId) : undefined
  const isEditing = Boolean(editingId)
  const canCreateThisSection = canCreateContentForAdmin(adminUser, config.sectionId)
  const canEditThisItem = isEditing ? canEditContentItem(adminUser, editingItem) : true
  const destinations = useMemo(() => getCreatableHubConfigs(adminUser), [adminUser])
  const initialDraft = useMemo(
    () => editingItem ? draftFromContentItem(editingItem, userEmail) : defaultDraftFor(config, userEmail),
    [config, editingItem, userEmail],
  )
  const [step, setStep] = useState<ContentWizardStep>('type')
  const [draft, setDraft] = useState<ContentItemInput>(initialDraft)
  const [publishingChoice, setPublishingChoice] = useState<PublishingChoice>(() => publishingChoiceForDraft(initialDraft))
  const [errors, setErrors] = useState<WizardErrors>({})
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<WizardSaveResult | null>(null)
  const [recoveredDraft, setRecoveredDraft] = useState<ContentItemInput | null>(null)
  const [confirmPublish, setConfirmPublish] = useState(false)
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const recoveryStorageKey = recoveryKey(user?.uid ?? userEmail, config.sectionId, editingId)
  const selectedDestination = hubConfigById[draft.sectionId] ?? config
  const canPublish = canPublishForDraft(adminUser, draft)
  const previewItem = contentItemPreviewFromInput({
    ...draft,
    title: draft.title || 'A clear title for your update',
    summary: draft.summary || 'A concise summary will help visitors understand this item quickly.',
    body: draft.body || 'The full description appears here when the public card style supports it.',
  })

  useEffect(() => {
    queueMicrotask(() => {
      setDraft(initialDraft)
      setPublishingChoice(publishingChoiceForDraft(initialDraft))
      setStep('type')
      setErrors({})
      setDirty(false)
      setSaveResult(null)
    })
  }, [initialDraft])

  useEffect(() => {
    if (isEditing) return
    const saved = localStorage.getItem(recoveryStorageKey)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as ContentItemInput
      queueMicrotask(() => setRecoveredDraft(parsed))
    } catch {
      localStorage.removeItem(recoveryStorageKey)
    }
  }, [isEditing, recoveryStorageKey])

  useEffect(() => {
    if (!dirty || step === 'success' || isEditing) return
    localStorage.setItem(recoveryStorageKey, JSON.stringify(draft))
  }, [dirty, draft, isEditing, recoveryStorageKey, step])

  useEffect(() => {
    headingRef.current?.focus()
  }, [step])

  if (isEditing && !editingItem) {
    return (
      <section className="content-wizard-page">
        <EmptyState
          title="Content item not found."
          body="This item may have been archived or is not available in the current hub."
          action={<Link className="secondary-button" to={workspaceHubViewUrl(config.sectionId, 'library')}>Back to library</Link>}
        />
      </section>
    )
  }

  if ((!isEditing && !canCreateThisSection) || (isEditing && !canEditThisItem)) {
    return (
      <section className="content-wizard-page">
        <EmptyState
          title="You cannot edit content in this hub."
          body="Ask a workspace administrator to review your section permissions."
          action={<Link className="secondary-button" to={workspaceHubViewUrl(config.sectionId, 'library')}>Back to library</Link>}
        />
      </section>
    )
  }

  const updateDraft = (patch: Partial<ContentItemInput>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setDirty(true)
  }

  const goToStep = (nextStep: ContentWizardStep) => {
    setErrors({})
    setStep(nextStep)
  }

  const validateCurrent = () => {
    const nextErrors = validateWizardStep(step, draft, {
      publishingChoice,
      canPublish,
      destinationCount: destinations.length,
    })
    setErrors(nextErrors)
    return !hasErrors(nextErrors)
  }

  const next = () => {
    if (!validateCurrent()) return
    const nextIndex = Math.min(contentWizardSteps.length - 2, stepNumber(step) + 1)
    goToStep(contentWizardSteps[nextIndex])
  }

  const back = () => {
    const previousIndex = Math.max(0, stepNumber(step) - 1)
    goToStep(contentWizardSteps[previousIndex])
  }

  const closeToLibrary = () => {
    navigate(workspaceHubViewUrl(config.sectionId, 'library'))
  }

  const save = async () => {
    if (saving) return

    const reviewErrors = {
      ...validateWizardStep('essentials', draft, { publishingChoice, canPublish, destinationCount: destinations.length }),
      ...validateWizardStep('media', draft, { publishingChoice, canPublish, destinationCount: destinations.length }),
      ...validateWizardStep('publishing', draft, { publishingChoice, canPublish, destinationCount: destinations.length }),
    }
    const appearanceErrors = validateContentAppearance(draft)
    if (appearanceErrors.length) {
      reviewErrors.displayStyle = appearanceErrors[0]
    }

    setErrors(reviewErrors)
    if (hasErrors(reviewErrors)) return

    setSaving(true)
    try {
      const payload = sanitizeContentItemInput(buildWizardPayload(draft, selectedDestination, publishingChoice, contentCount))
      let savedId = editingId ?? ''
      if (editingId) {
        await updateContentItem(editingId, payload)
      } else {
        const ref = await createContentItem(payload)
        savedId = ref.id
      }
      localStorage.removeItem(recoveryStorageKey)
      setDirty(false)
      setSaveResult({
        id: savedId,
        title: payload.title,
        sectionName: payload.sectionName,
        status: payload.status,
        publishDate: payload.publishDate,
      })
      setStep('success')
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Could not save this content item.' })
    } finally {
      setSaving(false)
      setConfirmPublish(false)
    }
  }

  const finalActionLabel = isEditing
    ? 'Save Changes'
    : publishingChoice === 'published'
      ? 'Publish Now'
      : publishingChoice === 'scheduled'
        ? 'Schedule Content'
        : 'Save Draft'

  const finish = () => {
    if (publishingChoice === 'published') {
      setConfirmPublish(true)
      return
    }
    void save()
  }

  const restoreRecovered = () => {
    if (!recoveredDraft) return
    setDraft(recoveredDraft)
    setRecoveredDraft(null)
    setDirty(true)
  }

  const startOver = () => {
    localStorage.removeItem(recoveryStorageKey)
    setRecoveredDraft(null)
    setDraft(defaultDraftFor(config, userEmail))
    setDirty(false)
    setErrors({})
  }

  return (
    <section className="content-wizard-page" aria-labelledby="content-wizard-heading">
      <div className="content-wizard-topline">
        <div>
          <p className="eyebrow">{selectedDestination.sectionName}</p>
          <h1 ref={headingRef} id="content-wizard-heading" tabIndex={-1}>
            {isEditing ? 'Edit Content' : 'Create Content'}
          </h1>
          <p>{step === 'type' ? 'Choose the best format, then add only the fields this content needs.' : contentWizardStepLabels[step]}</p>
        </div>
        <div className="content-wizard-topline-actions">
          <Link className="secondary-button" to={workspaceHubViewUrl(config.sectionId, 'library')}>Content Library</Link>
          <Link className="small-button" to={selectedDestination.route}>Public Hub</Link>
        </div>
      </div>

      <ol className="content-stage-indicator" aria-label="Content creation progress">
        {visibleStages.map((stage, index) => (
          <li className={index === visibleStageIndex(step) ? 'is-current' : index < visibleStageIndex(step) ? 'is-complete' : ''} key={stage} aria-current={index === visibleStageIndex(step) ? 'step' : undefined}>
            <span>{index + 1}</span>{stage}
          </li>
        ))}
      </ol>
      <div className="wizard-step-status" aria-live="polite">Stage {visibleStageIndex(step) + 1} of 3: {visibleStages[visibleStageIndex(step)]}</div>

      {recoveredDraft && (
        <div className="wizard-recovery" role="alert">
          <div>
            <strong>Saved wizard progress found</strong>
            <p>Continue your unsaved local draft for this account and hub, or start over.</p>
          </div>
          <button className="secondary-button" type="button" onClick={restoreRecovered}>Continue saved draft</button>
          <button className="small-button" type="button" onClick={startOver}>Start over</button>
        </div>
      )}

      <ErrorSummary errors={errors} />

      <div className={step === 'type' ? 'content-wizard-layout content-wizard-layout--type' : 'content-wizard-layout'}>
        <main className="content-wizard-card">
          {step === 'type' && (
            <fieldset className="wizard-type-grid">
              <legend>Choose content type</legend>
              {contentTypeOptions.map((option) => (
                <label className={draft.type === option.type ? 'wizard-type-card is-selected' : 'wizard-type-card'} key={option.type}>
                  <input
                    checked={draft.type === option.type}
                    name="content-type"
                    onChange={() => updateDraft(applyTypeDefaults(draft, option.type))}
                    type="radio"
                    value={option.type}
                  />
                  <span aria-hidden="true">{option.icon}</span>
                  <strong>{option.title}</strong>
                  <small>{option.help}</small>
                </label>
              ))}
            </fieldset>
          )}

          {step === 'essentials' && (
            <div className="wizard-form-grid">
              <WizardField id="title" label={fieldLabel(draft.type, 'title')} hint={`${draft.title.length}/120 required`} error={errors.title}>
                <input id={fieldId('title')} value={draft.title} maxLength={120} onChange={(event) => updateDraft({ title: event.target.value })} placeholder="Science fair projects are ready to explore" />
              </WizardField>
              <WizardField id="summary" label={fieldLabel(draft.type, 'summary')} hint={`${draft.summary.length}/220 required`} error={errors.summary}>
                <textarea id={fieldId('summary')} value={draft.summary} maxLength={220} onChange={(event) => updateDraft({ summary: event.target.value })} placeholder="One or two friendly sentences that help visitors decide what to open." />
              </WizardField>
              {draft.type !== 'link' && (
                <WizardField id="body" label={fieldLabel(draft.type, 'body')} hint={draft.type === 'resource' ? 'Optional context for the resource.' : 'Required'} error={errors.body}>
                  <textarea id={fieldId('body')} value={draft.body} onChange={(event) => updateDraft({ body: event.target.value })} placeholder="Add the useful details teachers, students, or families need." />
                </WizardField>
              )}
              <WizardField id="actionLabel" label="Button label" hint="Optional, shown when a URL is available.">
                <input id={fieldId('actionLabel')} value={draft.actionLabel ?? ''} onChange={(event) => updateDraft({ actionLabel: event.target.value })} placeholder="Learn More" />
              </WizardField>
            </div>
          )}

          {step === 'media' && (
            <div className="wizard-form-grid">
              <WizardField id="imageUrl" label="Image URL" hint="Optional. Use a public https image link." error={errors.imageUrl}>
                <input id={fieldId('imageUrl')} value={draft.imageUrl} onChange={(event) => updateDraft({ imageUrl: event.target.value })} placeholder="https://..." type="url" />
              </WizardField>
              {draft.imageUrl && (
                <button className="small-button" type="button" onClick={() => updateDraft({ imageUrl: '', imageAlt: '' })}>Clear image</button>
              )}
              {draft.imageUrl && (
                <WizardField id="imageAlt" label="Image description" hint="Recommended for accessibility.">
                  <input id={fieldId('imageAlt')} value={draft.imageAlt ?? ''} onChange={(event) => updateDraft({ imageAlt: event.target.value })} placeholder="Describe the image for screen-reader users" />
                </WizardField>
              )}
              {draft.type === 'video' && (
                <WizardField id="mediaUrl" label="Video URL" hint="YouTube, Vimeo, Google Drive, or another trusted https link." error={errors.mediaUrl}>
                  <input id={fieldId('mediaUrl')} value={draft.mediaUrl} onChange={(event) => updateDraft({ mediaUrl: event.target.value, actionUrl: event.target.value })} placeholder="https://..." type="url" />
                </WizardField>
              )}
              {(draft.type === 'link' || draft.type === 'resource') && (
                <WizardField id="linkUrl" label={draft.type === 'resource' ? 'Resource URL' : 'Destination URL'} hint="Required for this content type." error={errors.linkUrl}>
                  <input id={fieldId('linkUrl')} value={draft.linkUrl || draft.actionUrl || ''} onChange={(event) => updateDraft({ linkUrl: event.target.value, actionUrl: event.target.value })} placeholder="https://..." type="url" />
                </WizardField>
              )}
              {draft.type !== 'link' && draft.type !== 'resource' && draft.type !== 'video' && (
                <WizardField id="actionUrl" label="Optional button URL" hint="Add if this item should link somewhere." error={errors.actionUrl}>
                  <input id={fieldId('actionUrl')} value={draft.actionUrl ?? ''} onChange={(event) => updateDraft({ actionUrl: event.target.value, linkUrl: event.target.value })} placeholder="https://..." type="url" />
                </WizardField>
              )}
              <div className="wizard-media-preview">
                {draft.imageUrl && !draft.hideImage ? <img src={draft.imageUrl} alt="" onError={(event) => { event.currentTarget.hidden = true }} /> : <p>No image preview yet. The public card will still render cleanly.</p>}
                {draft.mediaUrl && <small>Video link ready. Preview will open safely from the public card.</small>}
              </div>
            </div>
          )}

          {step === 'publishing' && (
            <div className="wizard-form-grid">
              {destinations.length > 1 && (
                <WizardField id="sectionId" label="Destination hub" hint="Only hubs where you can create content are shown." error={errors.sectionId}>
                  <select id={fieldId('sectionId')} value={draft.sectionId} onChange={(event) => {
                    const nextHub = hubConfigById[event.target.value]
                    if (nextHub) updateDraft({ sectionId: nextHub.sectionId, sectionName: nextHub.sectionName, department: nextHub.department })
                  }}>
                    {destinations.map((destination) => <option key={destination.sectionId} value={destination.sectionId}>{destination.sectionName}</option>)}
                  </select>
                </WizardField>
              )}
              {destinations.length === 1 && <p className="wizard-static-choice"><strong>Destination:</strong> {destinations[0].sectionName}</p>}
              {draft.type === 'event' && (
                <WizardField id="eventDate" label="Event date" hint="Optional, shown on the public card." error={errors.eventDate}>
                  <input id={fieldId('eventDate')} value={draft.eventDate} onChange={(event) => updateDraft({ eventDate: event.target.value })} type="date" />
                </WizardField>
              )}
              <fieldset className="wizard-publish-options">
                <legend>Publishing choice</legend>
                <label>
                  <input checked={publishingChoice === 'draft'} name="publishing-choice" onChange={() => setPublishingChoice('draft')} type="radio" />
                  <span><strong>Save as Draft</strong><small>Keep it private until someone publishes it.</small></span>
                </label>
                {canPublish && (
                  <label>
                    <input checked={publishingChoice === 'published'} name="publishing-choice" onChange={() => setPublishingChoice('published')} type="radio" />
                    <span><strong>Publish Now</strong><small>Make it live after confirmation.</small></span>
                  </label>
                )}
                {canPublish && (
                  <label>
                    <input checked={publishingChoice === 'scheduled'} name="publishing-choice" onChange={() => setPublishingChoice('scheduled')} type="radio" />
                    <span><strong>Schedule</strong><small>Use a local date. Display follows stored scheduling behavior.</small></span>
                  </label>
                )}
              </fieldset>
              {publishingChoice === 'scheduled' && (
                <WizardField id="publishDate" label="Schedule date" hint="Choose today or a future date." error={errors.publishDate}>
                  <input id={fieldId('publishDate')} value={draft.publishDate ?? ''} onChange={(event) => updateDraft({ publishDate: event.target.value })} type="date" />
                </WizardField>
              )}
              {!canPublish && <p className="wizard-permission-note">This account can save drafts but cannot publish or schedule content.</p>}
            </div>
          )}

          {step === 'review' && (
            <div className="wizard-review">
              <ReviewGroup title="Content" onEdit={() => goToStep('type')}>
                <p>{contentTypeLabels[draft.type]}</p>
                <strong>{draft.title || 'Untitled content'}</strong>
                <span>{draft.summary}</span>
              </ReviewGroup>
              <ReviewGroup title="Media and links" onEdit={() => goToStep('media')}>
                <p>{draft.imageUrl || 'No image URL'}</p>
                <p>{draft.mediaUrl || draft.linkUrl || draft.actionUrl || 'No link URL'}</p>
              </ReviewGroup>
              <ReviewGroup title="Placement and publishing" onEdit={() => goToStep('publishing')}>
                <p>{selectedDestination.sectionName}</p>
                <p>{publishingChoice === 'draft' ? 'Draft' : publishingChoice === 'published' ? 'Publish now' : `Scheduled for ${draft.publishDate}`}</p>
              </ReviewGroup>
            </div>
          )}

          {step === 'success' && saveResult && (
            <div className="wizard-success" role="status">
              <span>Saved</span>
              <h2>{saveResult.title}</h2>
              <p>{saveResult.sectionName} - {saveResult.status}{saveResult.publishDate ? ` on ${saveResult.publishDate}` : ''}</p>
              <div className="wizard-success-actions">
                <Link className="primary-button blue" to={workspaceHubViewUrl(config.sectionId, 'library')}>View Content Library</Link>
                {saveResult.status === 'published' && <Link className="secondary-button" to={selectedDestination.route}>View Public Hub</Link>}
                <button className="secondary-button" type="button" onClick={startOver}>Create Another</button>
                <button className="small-button" type="button" onClick={() => navigate(`${workspaceHubViewUrl(config.sectionId, 'create')}&edit=${saveResult.id}`)}>Edit Content</button>
              </div>
            </div>
          )}
        </main>

        {step !== 'success' && step !== 'type' && (
          <aside className="content-wizard-preview" aria-label="Public card preview">
            <p className="eyebrow">Preview</p>
            <ContentCard item={previewItem} />
          </aside>
        )}
      </div>

      {step !== 'success' && (
        <div className="content-wizard-actions">
          <button className="secondary-button" type="button" onClick={step === 'type' ? closeToLibrary : back}>
            {step === 'type' ? 'Cancel' : 'Back'}
          </button>
          {step !== 'review' ? (
            <button className="primary-button blue" type="button" onClick={next}>Continue</button>
          ) : (
            <button className="primary-button blue" disabled={saving} type="button" onClick={finish}>{saving ? 'Saving...' : finalActionLabel}</button>
          )}
        </div>
      )}

      {confirmPublish && (
        <ConfirmDialog
          title="Publish this content now?"
          description="This will make the item available according to the public hub display rules."
          onClose={() => setConfirmPublish(false)}
        >
          <div className="workspace-dialog-actions">
            <button className="primary-button blue" disabled={saving} type="button" onClick={() => void save()}>{saving ? 'Publishing...' : 'Publish Now'}</button>
          </div>
        </ConfirmDialog>
      )}
    </section>
  )
}

function ReviewGroup({ title, children, onEdit }: { title: string; children: ReactNode; onEdit: () => void }) {
  return (
    <section>
      <div>
        <h3>{title}</h3>
        <button className="small-button" type="button" onClick={onEdit}>Edit</button>
      </div>
      {children}
    </section>
  )
}
