import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../auth'
import { createContentItem, updateContentItem } from '../../../data'
import { hubConfigById, type HubConfig } from '../../../hubs'
import type { ContentItem, ContentItemInput, ContentType } from '../../../types'
import { canCreateContentForAdmin } from '../../../utils/authorization'
import { contentItemPreviewFromInput, sanitizeContentItemInput, validateContentAppearance } from '../../../utils/contentAppearance'
import { contentPlacementLabels, contentTemplateLabels } from '../../../utils/contentLifecycle'
import { ContentCard } from '../../public/ContentCard'
import { ConfirmDialog, EmptyState } from '../ProtectedWorkspace'
import { workspaceHubViewUrl } from '../workspaceRouting'
import { ContentDesignControls } from './ContentDesignControls'
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

const stages = ['Choose type', 'Write content', 'Media', 'Design & publish', 'Review'] as const

function stageIndex(step: ContentWizardStep) {
  const map: Record<ContentWizardStep, number> = {
    type: 0,
    essentials: 1,
    media: 2,
    publishing: 3,
    review: 4,
    success: 4,
  }
  return map[step]
}

function fieldId(name: string) {
  return `content-wizard-${name}`
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

function WizardField({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className={error ? 'wizard-field has-error' : 'wizard-field'} htmlFor={fieldId(id)}>
      <span>{label}</span>
      {hint && <small>{hint}</small>}
      {children}
      {error && <em>{error}</em>}
    </label>
  )
}

function ErrorSummary({ errors }: { errors: WizardErrors }) {
  const entries = Object.entries(errors)
  if (!entries.length) return null
  return (
    <div className="wizard-error-summary" role="alert">
      <strong>Please check these fields:</strong>
      <ul>{entries.map(([key, value]) => <li key={key}>{value}</li>)}</ul>
    </div>
  )
}

function ReviewGroup({ title, children, onEdit }: { title: string; children: ReactNode; onEdit: () => void }) {
  return (
    <section>
      <div><h3>{title}</h3><button className="small-button" type="button" onClick={onEdit}>Edit</button></div>
      {children}
    </section>
  )
}

export function ContentWizard({ config, contentCount, contentItems, editingId, userEmail }: ContentWizardProps) {
  const { adminUser } = useAuth()
  const navigate = useNavigate()
  const editingItem = editingId ? contentItems.find((item) => item.id === editingId) : undefined
  const isEditing = Boolean(editingId)
  const destinations = useMemo(() => getCreatableHubConfigs(adminUser), [adminUser])
  const initialDraft = useMemo(() => editingItem ? draftFromContentItem(editingItem, userEmail) : defaultDraftFor(config, userEmail), [config, editingItem, userEmail])
  const [step, setStep] = useState<ContentWizardStep>('type')
  const [draft, setDraft] = useState<ContentItemInput>(initialDraft)
  const [publishingChoice, setPublishingChoice] = useState<PublishingChoice>(() => publishingChoiceForDraft(initialDraft))
  const [errors, setErrors] = useState<WizardErrors>({})
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<WizardSaveResult | null>(null)
  const [confirmPublish, setConfirmPublish] = useState(false)
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const selectedDestination = hubConfigById[draft.sectionId] ?? config
  const canPublish = canPublishForDraft(adminUser, draft)
  const canCreate = canCreateContentForAdmin(adminUser, config.sectionId)
  const canEdit = isEditing ? canEditContentItem(adminUser, editingItem) : true
  const previewItem = contentItemPreviewFromInput({
    ...draft,
    title: draft.title || 'A clear title for your update',
    summary: draft.summary || 'A concise summary will help visitors understand this item quickly.',
    body: draft.body || 'The full description appears here.',
  })

  useEffect(() => {
    setDraft(initialDraft)
    setPublishingChoice(publishingChoiceForDraft(initialDraft))
    setStep('type')
    setErrors({})
    setSaveResult(null)
  }, [initialDraft])

  useEffect(() => { headingRef.current?.focus() }, [step])

  if (isEditing && !editingItem) {
    return <EmptyState title="Content item not found." body="This item may have been archived or removed." action={<Link className="secondary-button" to={workspaceHubViewUrl(config.sectionId, 'library')}>Back to library</Link>} />
  }

  if ((!isEditing && !canCreate) || (isEditing && !canEdit)) {
    return <EmptyState title="You cannot edit content in this hub." body="Ask a workspace administrator to review your permissions." action={<Link className="secondary-button" to={workspaceHubViewUrl(config.sectionId, 'library')}>Back to library</Link>} />
  }

  const updateDraft = (patch: Partial<ContentItemInput>) => setDraft((current) => ({ ...current, ...patch }))
  const goTo = (next: ContentWizardStep) => { setErrors({}); setStep(next) }
  const currentIndex = contentWizardSteps.indexOf(step)

  const next = () => {
    const nextErrors = validateWizardStep(step, draft, { publishingChoice, canPublish, destinationCount: destinations.length })
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return
    goTo(contentWizardSteps[Math.min(contentWizardSteps.length - 2, currentIndex + 1)])
  }

  const back = () => goTo(contentWizardSteps[Math.max(0, currentIndex - 1)])

  const save = async () => {
    if (saving) return
    const allErrors = {
      ...validateWizardStep('essentials', draft, { publishingChoice, canPublish, destinationCount: destinations.length }),
      ...validateWizardStep('media', draft, { publishingChoice, canPublish, destinationCount: destinations.length }),
      ...validateWizardStep('publishing', draft, { publishingChoice, canPublish, destinationCount: destinations.length }),
    }
    const appearanceErrors = validateContentAppearance(draft)
    if (appearanceErrors.length) allErrors.displayStyle = appearanceErrors[0]
    setErrors(allErrors)
    if (hasErrors(allErrors)) return

    setSaving(true)
    try {
      const payload = sanitizeContentItemInput(buildWizardPayload(draft, selectedDestination, publishingChoice, contentCount))
      let savedId = editingId ?? ''
      if (editingId) await updateContentItem(editingId, payload)
      else savedId = (await createContentItem(payload)).id
      setSaveResult({ id: savedId, title: payload.title, sectionName: payload.sectionName, status: payload.status, publishDate: payload.publishDate })
      setStep('success')
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Could not save this content item.' })
    } finally {
      setSaving(false)
      setConfirmPublish(false)
    }
  }

  const finish = () => publishingChoice === 'published' ? setConfirmPublish(true) : void save()
  const finalActionLabel = isEditing ? 'Save Changes' : publishingChoice === 'published' ? 'Publish Now' : publishingChoice === 'scheduled' ? 'Schedule Content' : 'Save Draft'

  return (
    <section className="content-wizard-page" aria-labelledby="content-wizard-heading">
      <div className="content-wizard-topline">
        <div>
          <p className="eyebrow">{selectedDestination.sectionName}</p>
          <h1 ref={headingRef} id="content-wizard-heading" tabIndex={-1}>{isEditing ? 'Edit Content' : 'Create Content'}</h1>
          <p>{contentWizardStepLabels[step]}</p>
        </div>
        <div className="content-wizard-topline-actions">
          <Link className="secondary-button" to={workspaceHubViewUrl(config.sectionId, 'library')}>Content Library</Link>
          <Link className="small-button" to={selectedDestination.route}>Public Hub</Link>
        </div>
      </div>

      <ol className="content-stage-indicator" aria-label="Content creation progress">
        {stages.map((stage, index) => <li className={index === stageIndex(step) ? 'is-current' : index < stageIndex(step) ? 'is-complete' : ''} key={stage}><span>{index + 1}</span>{stage}</li>)}
      </ol>

      <ErrorSummary errors={errors} />

      <div className={step === 'type' ? 'content-wizard-layout content-wizard-layout--type' : 'content-wizard-layout'}>
        <main className="content-wizard-card">
          {step === 'type' && (
            <fieldset className="wizard-type-grid">
              <legend>Choose content type</legend>
              {contentTypeOptions.map((option) => (
                <label className={draft.type === option.type ? 'wizard-type-card is-selected' : 'wizard-type-card'} key={option.type}>
                  <input checked={draft.type === option.type} name="content-type" onChange={() => updateDraft(applyTypeDefaults(draft, option.type))} type="radio" />
                  <span className={`content-type-icon content-type-icon--${option.type}`} aria-hidden="true" />
                  <strong>{option.title}</strong><small>{option.help}</small>
                </label>
              ))}
            </fieldset>
          )}

          {step === 'essentials' && (
            <div className="wizard-bilingual-editor">
              <section className="wizard-language-panel">
                <h2>English</h2>
                <WizardField id="title" label={fieldLabel(draft.type, 'title')} hint="Required" error={errors.title}><input id={fieldId('title')} value={draft.title} maxLength={120} onChange={(e) => updateDraft({ title: e.target.value })} /></WizardField>
                <WizardField id="summary" label={fieldLabel(draft.type, 'summary')} hint="Required" error={errors.summary}><textarea id={fieldId('summary')} value={draft.summary} maxLength={220} onChange={(e) => updateDraft({ summary: e.target.value })} /></WizardField>
                {draft.type !== 'link' && <WizardField id="body" label={fieldLabel(draft.type, 'body')} error={errors.body}><textarea id={fieldId('body')} value={draft.body} onChange={(e) => updateDraft({ body: e.target.value })} /></WizardField>}
                <WizardField id="actionLabel" label="Button label"><input id={fieldId('actionLabel')} value={draft.actionLabel ?? ''} onChange={(e) => updateDraft({ actionLabel: e.target.value })} placeholder="Learn More" /></WizardField>
              </section>

              <section className="wizard-language-panel wizard-language-panel--zh">
                <h2>Traditional Chinese / 繁體中文</h2>
                <WizardField id="titleZh" label="標題"><input id={fieldId('titleZh')} value={draft.titleZh ?? ''} maxLength={120} onChange={(e) => updateDraft({ titleZh: e.target.value })} /></WizardField>
                <WizardField id="summaryZh" label="簡短摘要"><textarea id={fieldId('summaryZh')} value={draft.summaryZh ?? ''} maxLength={220} onChange={(e) => updateDraft({ summaryZh: e.target.value })} /></WizardField>
                {draft.type !== 'link' && <WizardField id="bodyZh" label="詳細內容"><textarea id={fieldId('bodyZh')} value={draft.bodyZh ?? ''} onChange={(e) => updateDraft({ bodyZh: e.target.value })} /></WizardField>}
                <WizardField id="actionLabelZh" label="按鈕文字"><input id={fieldId('actionLabelZh')} value={draft.actionLabelZh ?? ''} onChange={(e) => updateDraft({ actionLabelZh: e.target.value })} placeholder="了解更多" /></WizardField>
                <p className="wizard-translation-note">Leave a Traditional Chinese field blank to fall back to English until the translation is ready.</p>
              </section>
            </div>
          )}

          {step === 'media' && (
            <div className="wizard-form-grid">
              <WizardField id="imageUrl" label="Image URL" hint="Optional public https link" error={errors.imageUrl}><input id={fieldId('imageUrl')} value={draft.imageUrl} onChange={(e) => updateDraft({ imageUrl: e.target.value })} type="url" /></WizardField>
              {draft.imageUrl && <><WizardField id="imageAlt" label="Image description — English"><input id={fieldId('imageAlt')} value={draft.imageAlt ?? ''} onChange={(e) => updateDraft({ imageAlt: e.target.value })} /></WizardField><WizardField id="imageAltZh" label="圖片說明 — 繁體中文"><input id={fieldId('imageAltZh')} value={draft.imageAltZh ?? ''} onChange={(e) => updateDraft({ imageAltZh: e.target.value })} /></WizardField></>}
              {draft.type === 'video' && <WizardField id="mediaUrl" label="Video URL" error={errors.mediaUrl}><input id={fieldId('mediaUrl')} value={draft.mediaUrl} onChange={(e) => updateDraft({ mediaUrl: e.target.value, actionUrl: e.target.value })} type="url" /></WizardField>}
              {(draft.type === 'link' || draft.type === 'resource') && <WizardField id="linkUrl" label="Destination URL" error={errors.linkUrl}><input id={fieldId('linkUrl')} value={draft.linkUrl || draft.actionUrl || ''} onChange={(e) => updateDraft({ linkUrl: e.target.value, actionUrl: e.target.value })} type="url" /></WizardField>}
              {draft.type !== 'link' && draft.type !== 'resource' && draft.type !== 'video' && <WizardField id="actionUrl" label="Optional button URL" error={errors.actionUrl}><input id={fieldId('actionUrl')} value={draft.actionUrl ?? ''} onChange={(e) => updateDraft({ actionUrl: e.target.value, linkUrl: e.target.value })} type="url" /></WizardField>}
            </div>
          )}

          {step === 'publishing' && (
            <div className="wizard-form-grid">
              {destinations.length > 1 && <WizardField id="sectionId" label="Destination hub" error={errors.sectionId}><select id={fieldId('sectionId')} value={draft.sectionId} onChange={(e) => { const hub = hubConfigById[e.target.value]; if (hub) updateDraft({ sectionId: hub.sectionId, sectionName: hub.sectionName, department: hub.department }) }}>{destinations.map((hub) => <option key={hub.sectionId} value={hub.sectionId}>{hub.sectionName}</option>)}</select></WizardField>}
              <ContentDesignControls draft={draft} onChange={updateDraft} />
              {draft.type === 'event' && <WizardField id="eventDate" label="Event date and time" error={errors.eventDate}><input id={fieldId('eventDate')} value={draft.eventDate ?? ''} onChange={(e) => updateDraft({ eventDate: e.target.value })} type="datetime-local" /></WizardField>}
              <fieldset className="wizard-publish-options"><legend>Publishing choice</legend>
                <label><input checked={publishingChoice === 'draft'} name="publishing-choice" onChange={() => setPublishingChoice('draft')} type="radio" /><span><strong>Save as Draft</strong><small>Keep it private.</small></span></label>
                {canPublish && <label><input checked={publishingChoice === 'published'} name="publishing-choice" onChange={() => setPublishingChoice('published')} type="radio" /><span><strong>Publish Now</strong><small>Make it live immediately.</small></span></label>}
                {canPublish && <label><input checked={publishingChoice === 'scheduled'} name="publishing-choice" onChange={() => setPublishingChoice('scheduled')} type="radio" /><span><strong>Schedule</strong><small>Choose the exact local date and time.</small></span></label>}
              </fieldset>
              {publishingChoice === 'scheduled' && <WizardField id="publishDate" label="Publish date and time" error={errors.publishDate}><input id={fieldId('publishDate')} value={draft.publishDate ?? ''} onChange={(e) => updateDraft({ publishDate: e.target.value })} type="datetime-local" /></WizardField>}
              <WizardField id="expiryDate" label="End date and time" hint="Optional. Hide or archive automatically after this time." error={errors.expiryDate}><input id={fieldId('expiryDate')} value={draft.expiryDate ?? ''} onChange={(e) => updateDraft({ expiryDate: e.target.value })} type="datetime-local" /></WizardField>
            </div>
          )}

          {step === 'review' && (
            <div className="wizard-review">
              <ReviewGroup title="English content" onEdit={() => goTo('essentials')}><strong>{draft.title}</strong><p>{draft.summary}</p></ReviewGroup>
              <ReviewGroup title="Traditional Chinese / 繁體中文" onEdit={() => goTo('essentials')}><strong>{draft.titleZh || 'Uses English fallback'}</strong><p>{draft.summaryZh || 'Uses English fallback'}</p></ReviewGroup>
              <ReviewGroup title="Design and placement" onEdit={() => goTo('publishing')}><p>{contentPlacementLabels[draft.placement ?? 'main']}</p><p>{contentTemplateLabels[draft.template ?? 'mediumCard']}</p></ReviewGroup>
              <ReviewGroup title="Publishing" onEdit={() => goTo('publishing')}><p>{publishingChoice === 'draft' ? 'Draft' : publishingChoice === 'published' ? 'Publish now' : `Scheduled for ${draft.publishDate}`}</p><p>{draft.expiryDate ? `Ends ${draft.expiryDate} — ${draft.expiryAction ?? 'hide'}` : 'No end date'}</p></ReviewGroup>
            </div>
          )}

          {step === 'success' && saveResult && <div className="wizard-success" role="status"><span>Saved</span><h2>{saveResult.title}</h2><p>{saveResult.sectionName} — {saveResult.status}</p><div className="wizard-success-actions"><Link className="primary-button blue" to={workspaceHubViewUrl(config.sectionId, 'library')}>View Content Library</Link><Link className="secondary-button" to={selectedDestination.route}>View Public Hub</Link><button className="secondary-button" type="button" onClick={() => { setDraft(defaultDraftFor(config, userEmail)); setStep('type'); setSaveResult(null) }}>Create Another</button></div></div>}
        </main>

        {step !== 'success' && step !== 'type' && <aside className={`content-wizard-preview content-wizard-preview--${draft.placement ?? 'main'} content-wizard-preview--${draft.template ?? 'mediumCard'}`} aria-label="Public hub preview"><p className="eyebrow">Live preview</p><small>{contentPlacementLabels[draft.placement ?? 'main']} · {contentTemplateLabels[draft.template ?? 'mediumCard']}</small><ContentCard item={previewItem} /></aside>}
      </div>

      {step !== 'success' && <div className="content-wizard-actions"><button className="secondary-button" type="button" onClick={step === 'type' ? () => navigate(workspaceHubViewUrl(config.sectionId, 'library')) : back}>{step === 'type' ? 'Cancel' : 'Back'}</button>{step !== 'review' ? <button className="primary-button blue" type="button" onClick={next}>Continue</button> : <button className="primary-button blue" disabled={saving} type="button" onClick={finish}>{saving ? 'Saving…' : finalActionLabel}</button>}</div>}

      {confirmPublish && <ConfirmDialog title="Publish this content now?" description="This will make the item visible on the selected public hub." onClose={() => setConfirmPublish(false)}><div className="workspace-dialog-actions"><button className="primary-button blue" disabled={saving} type="button" onClick={() => void save()}>{saving ? 'Publishing…' : 'Publish Now'}</button></div></ConfirmDialog>}
    </section>
  )
}
