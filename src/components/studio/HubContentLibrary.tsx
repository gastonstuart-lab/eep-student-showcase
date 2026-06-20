import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { createContentItem, deleteContentItem, saveHubPage, updateContentItem } from '../../data'
import type { HubConfig } from '../../hubs'
import { ContentCard } from '../public/ContentCard'
import { ContentLayout } from '../public/ContentLayout'
import {
  contentAccentStyleLabels,
  contentAppearanceDefaults,
  contentBackgroundStyleLabels,
  contentBadgeStyleLabels,
  contentCardShapeLabels,
  contentDensityLabels,
  contentDisplayStyleLabels,
  contentImagePlacementLabels,
  contentImageRatioLabels,
  contentItemPreviewFromInput,
  contentLayoutColumnLabels,
  contentTextAlignmentLabels,
  contentWidthLabels,
  sanitizeContentItemInput,
  validateContentAppearance,
} from '../../utils/contentAppearance'
import {
  canCreateContentForAdmin,
  canDeleteContentForAdmin,
  canEditContentForAdmin,
  canPublishContentForAdmin,
} from '../../utils/authorization'
import { contentTypes, type ContentItem, type ContentItemInput, type ContentStatus, type ContentType, type HubPage, type HubPageInput } from '../../types'
import { parseWorkspaceContentView, workspaceContentViewLabels, workspaceContentViewStatus } from './workspaceRouting'

const contentTypeLabels: Record<ContentType, string> = {
  announcement: 'Announcement',
  event: 'Event',
  video: 'Video',
  resource: 'Resource',
  studentWork: 'Student Work',
  link: 'Quick Link',
}

const statusLabels: Record<ContentStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
  hidden: 'Hidden',
}

const templateDefaults: Array<{
  id: string
  title: string
  icon: string
  help: string
  patch: Partial<ContentItemInput>
}> = [
  { id: 'announcement', title: 'Announcement', icon: '!', help: 'High visibility for important notices.', patch: { type: 'announcement', displayStyle: 'banner', contentWidth: 'full', accentStyle: 'ied', badgeText: 'Notice', backgroundStyle: 'tint' } },
  { id: 'general', title: 'General Update', icon: 'U', help: 'A balanced card for regular hub updates.', patch: { type: 'announcement', displayStyle: 'standard', contentWidth: 'medium', badgeText: 'Update' } },
  { id: 'studentWork', title: 'Student Work', icon: 'S', help: 'Showcase learning with a friendly image-led card.', patch: { type: 'studentWork', displayStyle: 'featured', contentWidth: 'wide', accentStyle: 'eep', badgeText: 'Student work' } },
  { id: 'event', title: 'Event', icon: 'E', help: 'Date-forward information for performances and activities.', patch: { type: 'event', displayStyle: 'eventCard', contentWidth: 'medium', badgeText: 'Event' } },
  { id: 'resource', title: 'Resource', icon: 'R', help: 'Useful class materials and downloads.', patch: { type: 'resource', displayStyle: 'quickLink', contentWidth: 'small', layoutColumns: 'three', actionLabel: 'Download Resource' } },
  { id: 'video', title: 'Video', icon: 'V', help: 'Best for performances, explainers, and media links.', patch: { type: 'video', displayStyle: 'media', contentWidth: 'wide', imagePlacement: 'top', actionLabel: 'Watch Video' } },
  { id: 'deadline', title: 'Deadline', icon: 'D', help: 'Short, clear reminders that do not take over the page.', patch: { type: 'announcement', displayStyle: 'compact', contentWidth: 'small', badgeText: 'Deadline', contentDensity: 'compact' } },
  { id: 'celebration', title: 'Celebration', icon: '*', help: 'Warm spotlight for wins and milestones.', patch: { type: 'studentWork', displayStyle: 'quote', contentWidth: 'medium', accentStyle: 'warm', badgeText: 'Celebration' } },
  { id: 'photoStory', title: 'Photo Story', icon: 'P', help: 'A visual story with space for a short narrative.', patch: { type: 'studentWork', displayStyle: 'photoStory', imageRatio: 'square', contentWidth: 'wide', imagePlacement: 'fullBleed' } },
  { id: 'quickLink', title: 'Quick Link', icon: 'Q', help: 'Small and efficient for websites or resources.', patch: { type: 'link', displayStyle: 'quickLink', contentWidth: 'small', layoutColumns: 'three', actionLabel: 'Visit Website' } },
  { id: 'featured', title: 'Featured Story', icon: 'F', help: 'A stronger card for major stories.', patch: { type: 'studentWork', displayStyle: 'featured', contentWidth: 'wide', contentDensity: 'spacious', badgeText: 'Featured' } },
]

function emptyDraftFor(config: HubConfig, userEmail: string): ContentItemInput {
  return {
    title: '',
    summary: '',
    body: '',
    type: 'announcement',
    department: config.department,
    sectionId: config.sectionId,
    sectionName: config.sectionName,
    status: 'draft',
    featured: false,
    mediaUrl: '',
    linkUrl: '',
    eventDate: '',
    imageUrl: '',
    ...contentAppearanceDefaults,
    badgeText: '',
    createdBy: userEmail,
    sortOrder: undefined,
    publishDate: '',
    expiryDate: '',
    actionLabel: '',
    actionUrl: '',
    actionStyle: 'primary',
    actionNewTab: true,
    secondaryActionLabel: '',
    secondaryActionUrl: '',
    secondaryActionStyle: 'secondary',
    secondaryActionNewTab: true,
    imageAlt: '',
    thumbnailUrl: '',
    hideImage: false,
    pinned: false,
  }
}

function draftFromItem(item: ContentItem, userEmail: string): ContentItemInput {
  return {
    ...item,
    layoutColumns: item.layoutColumns ?? contentAppearanceDefaults.layoutColumns,
    cardShape: item.cardShape ?? contentAppearanceDefaults.cardShape,
    contentDensity: item.contentDensity ?? contentAppearanceDefaults.contentDensity,
    imageRatio: item.imageRatio ?? contentAppearanceDefaults.imageRatio,
    badgeStyle: item.badgeStyle ?? contentAppearanceDefaults.badgeStyle,
    backgroundStyle: item.backgroundStyle ?? contentAppearanceDefaults.backgroundStyle,
    badgeText: item.badgeText ?? '',
    createdBy: item.createdBy || userEmail,
    publishDate: item.publishDate ?? '',
    expiryDate: item.expiryDate ?? '',
    actionLabel: item.actionLabel ?? '',
    actionUrl: item.actionUrl ?? '',
    actionStyle: item.actionStyle ?? item.ctaStyle,
    actionNewTab: item.actionNewTab ?? true,
    secondaryActionLabel: item.secondaryActionLabel ?? '',
    secondaryActionUrl: item.secondaryActionUrl ?? '',
    secondaryActionStyle: item.secondaryActionStyle ?? 'secondary',
    secondaryActionNewTab: item.secondaryActionNewTab ?? true,
    imageAlt: item.imageAlt ?? '',
    thumbnailUrl: item.thumbnailUrl ?? '',
    hideImage: item.hideImage ?? false,
    pinned: item.pinned ?? false,
  }
}

function formatStamp(item: ContentItem) {
  const stamp = item.updatedAt ?? item.createdAt
  return stamp?.toDate ? stamp.toDate().toLocaleDateString() : 'Not saved yet'
}

function hasEnteredContent(draft: ContentItemInput) {
  return Boolean(draft.title || draft.summary || draft.body || draft.imageUrl || draft.linkUrl || draft.mediaUrl)
}

function storageKey(sectionId: string, editingId: string | null) {
  return `teacher-content-studio:${sectionId}:${editingId ?? 'new'}`
}

export function HubContentLibrary({
  config,
  contentItems,
  error,
  hubPage,
  loading,
  userEmail,
}: {
  config: HubConfig
  contentItems: ContentItem[]
  error: string
  hubPage: HubPage
  loading: boolean
  userEmail: string
}) {
  const { adminUser, canManageHubSettings } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeView = parseWorkspaceContentView(searchParams.get('view'))
  const viewStatus = workspaceContentViewStatus[activeView]
  const canCreateContent = (sectionId: string) => canCreateContentForAdmin(adminUser, sectionId)
  const canEditContent = (sectionId: string) => canEditContentForAdmin(adminUser, sectionId)
  const canPublishContent = (sectionId: string) => canPublishContentForAdmin(adminUser, sectionId)
  const canDeleteContent = (sectionId: string) => canDeleteContentForAdmin(adminUser, sectionId)
  const canCreateThisSection = canCreateContentForAdmin(adminUser, config.sectionId)
  const [hubDraft, setHubDraft] = useState<HubPageInput>(() => ({
    sectionId: hubPage.sectionId,
    title: hubPage.title,
    subtitle: hubPage.subtitle,
    intro: hubPage.intro,
    description: hubPage.description,
    heroImageUrl: hubPage.heroImageUrl,
    accent: hubPage.accent,
    parentSectionId: hubPage.parentSectionId,
    childSectionIds: hubPage.childSectionIds,
    primaryButtonText: hubPage.primaryButtonText,
    primaryButtonUrl: hubPage.primaryButtonUrl,
    secondaryButtonText: hubPage.secondaryButtonText,
    secondaryButtonUrl: hubPage.secondaryButtonUrl,
    featured: hubPage.featured,
  }))
  const [query, setQuery] = useState('')
  const status: 'all' | ContentStatus = viewStatus ?? 'all'
  const [type, setType] = useState<'all' | ContentType>('all')
  const [style, setStyle] = useState<'all' | ContentItemInput['displayStyle']>('all')
  const [sort, setSort] = useState('updated')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [studioOpen, setStudioOpen] = useState(false)
  const [draft, setDraft] = useState<ContentItemInput>(() => emptyDraftFor(config, userEmail))
  const editingItem = contentItems.find((item) => item.id === editingId)

  useEffect(() => {
    const rawView = searchParams.get('view')
    const parsedView = parseWorkspaceContentView(rawView)
    if (rawView && rawView !== parsedView) {
      setSearchParams({ view: parsedView }, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const next = contentItems.filter((item) => {
      const haystack = [item.title, item.summary, item.badgeText, item.type, item.displayStyle].join(' ').toLowerCase()
      return (!needle || haystack.includes(needle))
        && (status === 'all' || item.status === status)
        && (type === 'all' || item.type === type)
        && (style === 'all' || item.displayStyle === style)
    })

    return [...next].sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title)
      if (sort === 'oldest') return (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0)
      if (sort === 'newest') return (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)
      if (sort === 'publish') return (b.publishDate || b.eventDate || '').localeCompare(a.publishDate || a.eventDate || '')
      return (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0)
    })
  }, [contentItems, query, sort, status, style, type])

  const openNew = useCallback(() => {
    setEditingId(null)
    setDraft(emptyDraftFor(config, userEmail))
    setStudioOpen(true)
    setMessage('')
  }, [config, userEmail])

  useEffect(() => {
    if (activeView !== 'create' || !canCreateThisSection || studioOpen) return
    queueMicrotask(openNew)
  }, [activeView, canCreateThisSection, openNew, studioOpen])

  const openEdit = (item: ContentItem) => {
    setEditingId(item.id)
    setDraft(draftFromItem(item, userEmail))
    setStudioOpen(true)
    setMessage('')
  }

  const duplicateItem = async (item: ContentItem) => {
    await createContentItem({ ...draftFromItem(item, userEmail), title: `${item.title} Copy`, status: 'draft', featured: false, pinned: false, sortOrder: contentItems.length + 1 })
    setMessage(`"${item.title}" duplicated as a draft.`)
  }

  const setItemStatus = async (item: ContentItem, nextStatus: ContentStatus) => {
    await updateContentItem(item.id, { status: nextStatus })
    setMessage(`"${item.title}" is now ${statusLabels[nextStatus].toLowerCase()}.`)
  }

  const archiveItem = async (item: ContentItem) => {
    if (!window.confirm(`Archive "${item.title}"?`)) return
    await deleteContentItem(item.id)
    setMessage(`"${item.title}" archived.`)
  }

  const saveHubSettings = async (event: FormEvent) => {
    event.preventDefault()
    await saveHubPage(config.sectionId, { ...hubDraft, sectionId: config.sectionId, childSectionIds: config.children })
    setMessage('Hub settings saved.')
  }

  const openCreateView = () => {
    setSearchParams({ view: 'create' })
  }

  const closeStudio = () => {
    setStudioOpen(false)
    if (activeView === 'create') {
      setSearchParams({ view: 'library' }, { replace: true })
    }
  }

  const updateStatusFilter = (nextStatus: 'all' | ContentStatus) => {
    if (nextStatus === 'draft') {
      setSearchParams({ view: 'drafts' })
    } else if (nextStatus === 'scheduled') {
      setSearchParams({ view: 'scheduled' })
    } else if (nextStatus === 'published') {
      setSearchParams({ view: 'published' })
    } else {
      setSearchParams({ view: 'library' })
    }
  }

  return (
    <section className="admin-page teacher-content-page">
      <ContentStudioHeader config={config} />
      <div className="studio-breadcrumb">
        <Link to="/admin/hubs">All hubs</Link>
        <span>/</span>
        <strong>{config.sectionName}</strong>
      </div>
      {message && <p className="form-message" aria-live="polite">{message}</p>}
      {loading && <p className="module-note quiet">Loading content items...</p>}
      {error && <p className="form-message">{error}</p>}
      <ContentHelpPanel />
      <div className="library-toolbar">
        <div>
          <h2>{workspaceContentViewLabels[activeView]}</h2>
          <p>{filteredItems.length} of {contentItems.length} items in {config.sectionName}</p>
        </div>
        {canCreateThisSection && <button className="primary-button blue" type="button" onClick={openCreateView}>Create new content</button>}
      </div>
      <div className="library-controls" aria-label="Content filters">
        <label>Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, summary, badge, or type" /></label>
        <label>Status<select value={status} onChange={(event) => updateStatusFilter(event.target.value as 'all' | ContentStatus)}><option value="all">All</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Type<select value={type} onChange={(event) => setType(event.target.value as 'all' | ContentType)}><option value="all">All types</option>{contentTypes.map((value) => <option key={value} value={value}>{contentTypeLabels[value]}</option>)}</select></label>
        <label>Display<select value={style} onChange={(event) => setStyle(event.target.value as 'all' | ContentItemInput['displayStyle'])}><option value="all">All styles</option>{Object.entries(contentDisplayStyleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Sort<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="updated">Most recently updated</option><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="title">Title A-Z</option><option value="publish">Publish date</option></select></label>
      </div>
      <div className="content-library-list">
        {!filteredItems.length && <div className="empty-manager-state"><h3>No content matches this view.</h3><p>Create a draft or adjust the filters to see more items.</p></div>}
        {filteredItems.map((item) => (
          <article className="library-item" key={item.id}>
            <div className="library-thumb">{item.imageUrl && !item.hideImage ? <img src={item.imageUrl} alt="" /> : <span>{contentTypeLabels[item.type].slice(0, 1)}</span>}</div>
            <div>
              <div className="content-item-badges">
                <span className={`status-badge status-${item.status}`}>{statusLabels[item.status]}</span>
                <span className="badge">{contentTypeLabels[item.type]}</span>
                <span className="badge">{contentDisplayStyleLabels[item.displayStyle]}</span>
              </div>
              <h3>{item.title || 'Untitled draft'}</h3>
              <p>{item.summary || 'No summary yet.'}</p>
              <p className="meta">{item.sectionName} / Updated {formatStamp(item)}{item.createdBy ? ` / ${item.createdBy}` : ''}{item.publishDate ? ` / Scheduled ${item.publishDate}` : ''}</p>
            </div>
            <div className="library-actions">
              {canEditContent(config.sectionId) && <button className="secondary-button" type="button" onClick={() => openEdit(item)}>Edit</button>}
              <button className="secondary-button" type="button" onClick={() => openEdit(item)}>Preview</button>
              {canCreateContent(config.sectionId) && <button className="secondary-button" type="button" onClick={() => void duplicateItem(item)}>Duplicate</button>}
              {canPublishContent(config.sectionId) && item.status !== 'published' && <button className="secondary-button" type="button" onClick={() => void setItemStatus(item, 'published')}>Publish</button>}
              {canPublishContent(config.sectionId) && item.status === 'published' && <button className="secondary-button" type="button" onClick={() => void setItemStatus(item, 'hidden')}>Unpublish</button>}
              {canPublishContent(config.sectionId) && <button className="secondary-button" type="button" onClick={() => void setItemStatus(item, 'scheduled')}>Schedule</button>}
              {canEditContent(config.sectionId) && item.status !== 'hidden' && <button className="secondary-button" type="button" onClick={() => void setItemStatus(item, 'hidden')}>Hide</button>}
              {canDeleteContent(config.sectionId) && <button className="danger-button" type="button" onClick={() => void archiveItem(item)}>Archive</button>}
            </div>
          </article>
        ))}
      </div>
      {canManageHubSettings(config.sectionId) && (
        <details className="hub-settings-panel">
          <summary>Hub page settings</summary>
          <form className="form-grid" onSubmit={saveHubSettings}>
            <label>Title<input value={hubDraft.title} onChange={(event) => setHubDraft({ ...hubDraft, title: event.target.value })} /></label>
            <label>Subtitle<input value={hubDraft.subtitle} onChange={(event) => setHubDraft({ ...hubDraft, subtitle: event.target.value })} /></label>
            <label className="span-2">Description<textarea value={hubDraft.description} onChange={(event) => setHubDraft({ ...hubDraft, description: event.target.value })} /></label>
            <button className="secondary-button" type="submit">Save hub settings</button>
          </form>
        </details>
      )}
      {studioOpen && (
        <HubContentStudio
          config={config}
          contentCount={contentItems.length}
          draft={draft}
          editingId={editingId}
          editingItem={editingItem}
          onClose={closeStudio}
          onDraftChange={setDraft}
          onMessage={setMessage}
          userEmail={userEmail}
        />
      )}
    </section>
  )
}

function ContentStudioHeader({ config }: { config: HubConfig }) {
  return (
    <div className="studio-header">
      <div>
        <p className="eyebrow">Teacher Content Studio</p>
        <h1>{config.sectionName}</h1>
        <p>Create polished hub updates, resources, events, media, and student-work stories without layout guesswork.</p>
      </div>
      <Link className="secondary-button" to={config.route}>View public hub</Link>
    </div>
  )
}

function ContentHelpPanel() {
  const [hidden, setHidden] = useState(() => localStorage.getItem('content-studio-help-hidden') === '1')
  if (hidden) return null
  return (
    <div className="studio-help" role="note">
      <p><strong>Create a post in three steps:</strong> add your content, choose how it looks, then save or publish.</p>
      <button className="small-button" type="button" onClick={() => { localStorage.setItem('content-studio-help-hidden', '1'); setHidden(true) }}>Dismiss</button>
    </div>
  )
}

function HubContentStudio({
  config,
  contentCount,
  draft,
  editingId,
  editingItem,
  onClose,
  onDraftChange,
  onMessage,
  userEmail,
}: {
  config: HubConfig
  contentCount: number
  draft: ContentItemInput
  editingId: string | null
  editingItem?: ContentItem
  onClose: () => void
  onDraftChange: (draft: ContentItemInput) => void
  onMessage: (message: string) => void
  userEmail: string
}) {
  const { adminUser } = useAuth()
  const canPublishContent = (sectionId: string) => canPublishContentForAdmin(adminUser, sectionId)
  const [step, setStep] = useState<'content' | 'design' | 'publish'>('content')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState('')
  const [dirty, setDirty] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showContext, setShowContext] = useState(true)
  const [recovered, setRecovered] = useState<ContentItemInput | null>(null)
  const previewItem = contentItemPreviewFromInput({
    ...draft,
    title: draft.title || 'A clear, friendly title',
    summary: draft.summary || 'A short summary will show teachers and families what this item is about.',
    body: draft.body || 'Optional details can add context without making the card too large.',
  })
  const key = storageKey(config.sectionId, editingId)

  useEffect(() => {
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ContentItemInput
        queueMicrotask(() => setRecovered(parsed))
      } catch {
        localStorage.removeItem(key)
      }
    } else {
      queueMicrotask(() => setRecovered(null))
    }
  }, [key])

  useEffect(() => {
    if (!dirty) return
    localStorage.setItem(key, JSON.stringify(draft))
  }, [dirty, draft, key])

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return
      event.preventDefault()
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [dirty])

  const update = (patch: Partial<ContentItemInput>) => {
    onDraftChange({ ...draft, ...patch })
    setDirty(true)
  }

  const close = () => {
    if (dirty && !window.confirm('Close the studio and keep your local recovery draft?')) return
    onClose()
  }

  const save = async (nextStatus?: ContentStatus) => {
    setSaving(true)
    const payload = sanitizeContentItemInput({
      ...draft,
      status: nextStatus ?? draft.status,
      department: config.department,
      sectionId: config.sectionId,
      sectionName: config.sectionName,
      createdBy: draft.createdBy || userEmail,
      sortOrder: draft.sortOrder ?? contentCount + 1,
      ctaStyle: draft.actionStyle ?? draft.ctaStyle,
      linkUrl: draft.linkUrl || draft.actionUrl || '',
    })
    const errors = validateContentAppearance(payload)
    if (errors.length) {
      onMessage(errors[0])
      setSaving(false)
      return
    }
    try {
      if (editingId) {
        await updateContentItem(editingId, payload)
        onMessage('Content updated.')
      } else {
        await createContentItem(payload)
        onMessage(nextStatus === 'published' ? 'Content published.' : 'Draft saved.')
      }
      localStorage.removeItem(key)
      setDirty(false)
      setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      if (!editingId) onClose()
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Could not save content.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="studio-shell" role="dialog" aria-modal="true" aria-labelledby="studio-title">
      <div className="studio-workspace">
        <ContentStudioSteps step={step} onStepChange={setStep} />
        <main className="studio-editor">
          <div className="modal-header">
            <div>
              <p className="eyebrow">{editingId ? 'Editing' : 'Creating'}</p>
              <h2 id="studio-title">{editingItem?.title || draft.title || 'New content item'}</h2>
              {editingItem && <p className="meta">{statusLabels[editingItem.status]} / Updated {formatStamp(editingItem)}</p>}
            </div>
            <button className="small-button" type="button" onClick={close}>Close</button>
          </div>
          {recovered && (
            <div className="recovery-banner" role="alert">
              <p>A recovered local draft is available for this item.</p>
              <button className="small-button" type="button" onClick={() => { onDraftChange(recovered); setRecovered(null); setDirty(true) }}>Restore</button>
              <button className="small-button" type="button" onClick={() => { localStorage.removeItem(key); setRecovered(null) }}>Discard</button>
            </div>
          )}
          {step === 'content' && <ContentFieldsPanel draft={draft} onChange={update} />}
          {step === 'design' && <ContentDesignPanel draft={draft} onChange={update} />}
          {step === 'publish' && <ContentPublishPanel canPublish={canPublishContent(config.sectionId)} draft={draft} onChange={update} />}
        </main>
        <aside className="studio-preview" aria-label="Live preview">
          <ContentLivePreview item={previewItem} mode={previewMode} onModeChange={setPreviewMode} showContext={showContext} onToggleContext={() => setShowContext(!showContext)} />
        </aside>
      </div>
      <ContentActionBar dirty={dirty} saving={saving} savedAt={savedAt} canPublish={canPublishContent(config.sectionId)} onBack={close} onDraft={() => void save('draft')} onPublish={() => void save(draft.publishDate ? 'scheduled' : 'published')} />
    </div>
  )
}

function ContentStudioSteps({ step, onStepChange }: { step: string; onStepChange: (step: 'content' | 'design' | 'publish') => void }) {
  return (
    <nav className="studio-steps" aria-label="Content creation steps">
      {(['content', 'design', 'publish'] as const).map((value, index) => (
        <button className={step === value ? 'is-active' : ''} key={value} type="button" onClick={() => onStepChange(value)} aria-current={step === value ? 'step' : undefined}>
          <span>{index + 1}</span>{value[0].toUpperCase() + value.slice(1)}
        </button>
      ))}
    </nav>
  )
}

function ContentFieldsPanel({ draft, onChange }: { draft: ContentItemInput; onChange: (patch: Partial<ContentItemInput>) => void }) {
  const selectTemplate = (patch: Partial<ContentItemInput>) => {
    if (hasEnteredContent(draft) && !window.confirm('Apply this template without changing the text you already entered?')) return
    onChange({ ...patch, title: draft.title, summary: draft.summary, body: draft.body, imageUrl: draft.imageUrl, linkUrl: draft.linkUrl, mediaUrl: draft.mediaUrl })
  }
  return (
    <div className="studio-panel">
      <section>
        <h3>Start with a template</h3>
        <div className="template-grid">
          {templateDefaults.map((template) => (
            <button className="template-card" key={template.id} type="button" onClick={() => selectTemplate(template.patch)}>
              <span>{template.icon}</span><strong>{template.title}</strong><small>{template.help}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="form-grid">
        <label>Title <small>{draft.title.length}/120 Required</small><input value={draft.title} maxLength={120} onChange={(event) => onChange({ title: event.target.value })} placeholder="Science Fair projects are ready to explore" required /></label>
        <label>Content type<select value={draft.type} onChange={(event) => onChange({ type: event.target.value as ContentType })}>{contentTypes.map((type) => <option value={type} key={type}>{contentTypeLabels[type]}</option>)}</select></label>
        <label className="span-2">Short summary <small>{draft.summary.length}/220 Required</small><textarea value={draft.summary} maxLength={220} onChange={(event) => onChange({ summary: event.target.value })} placeholder="One or two friendly sentences. 繁體中文也可以。" required /></label>
        <label className="span-2">Main body <small>Optional</small><textarea value={draft.body} onChange={(event) => onChange({ body: event.target.value })} placeholder="Add details, bullet-style lines, or a short reflection." /></label>
        <label>Badge <small>Optional</small><input value={draft.badgeText ?? ''} maxLength={24} onChange={(event) => onChange({ badgeText: event.target.value })} placeholder="New, Grade 8, Important" /></label>
        <label>Event date <small>Optional</small><input value={draft.eventDate} onChange={(event) => onChange({ eventDate: event.target.value })} type="date" /></label>
      </section>
      <ContentMediaPanel draft={draft} onChange={onChange} />
      <section className="form-grid">
        <label>Primary button label<input value={draft.actionLabel ?? ''} onChange={(event) => onChange({ actionLabel: event.target.value })} placeholder="Learn More" /></label>
        <label>Primary URL<input value={draft.actionUrl ?? draft.linkUrl} onChange={(event) => onChange({ actionUrl: event.target.value, linkUrl: event.target.value })} type="url" placeholder="https://..." /></label>
        <label>Button style<select value={draft.actionStyle ?? 'primary'} onChange={(event) => onChange({ actionStyle: event.target.value as ContentItemInput['actionStyle'] })}><option value="primary">Primary button</option><option value="secondary">Secondary button</option><option value="link">Text link</option><option value="hidden">Hidden</option></select></label>
        <label className="checkbox-row"><input checked={draft.actionNewTab ?? true} onChange={(event) => onChange({ actionNewTab: event.target.checked })} type="checkbox" /><span>Open in a new tab</span></label>
        <label>Second button label<input value={draft.secondaryActionLabel ?? ''} onChange={(event) => onChange({ secondaryActionLabel: event.target.value })} placeholder="Register" /></label>
        <label>Second URL<input value={draft.secondaryActionUrl ?? ''} onChange={(event) => onChange({ secondaryActionUrl: event.target.value })} type="url" placeholder="https://..." /></label>
      </section>
    </div>
  )
}

function ContentMediaPanel({ draft, onChange }: { draft: ContentItemInput; onChange: (patch: Partial<ContentItemInput>) => void }) {
  const hasImage = Boolean(draft.imageUrl)
  return (
    <section className="media-panel">
      <h3>Media</h3>
      <div className="form-grid">
        <label>Image URL<input value={draft.imageUrl} onChange={(event) => onChange({ imageUrl: event.target.value })} type="url" placeholder="https://..." /></label>
        <label>Video URL<input value={draft.mediaUrl} onChange={(event) => onChange({ mediaUrl: event.target.value })} type="url" placeholder="https://..." /></label>
        <label className="span-2">Alt text <small>{hasImage && !draft.imageAlt ? 'Recommended for accessibility' : 'Optional'}</small><input value={draft.imageAlt ?? ''} onChange={(event) => onChange({ imageAlt: event.target.value })} placeholder="Describe the image for screen-reader users" /></label>
        <label className="checkbox-row"><input checked={draft.hideImage ?? false} disabled={!hasImage} onChange={(event) => onChange({ hideImage: event.target.checked })} type="checkbox" /><span>Hide image without deleting URL</span></label>
      </div>
      <div className="media-preview">{hasImage && !draft.hideImage ? <img src={draft.imageUrl} alt="" onError={(event) => { event.currentTarget.hidden = true }} /> : <p>Add a secure image URL for a preview. Landscape images work best.</p>}</div>
    </section>
  )
}

function ContentDesignPanel({ draft, onChange }: { draft: ContentItemInput; onChange: (patch: Partial<ContentItemInput>) => void }) {
  const styleHelp: Record<string, string> = {
    standard: 'Best for most updates.',
    featured: 'Larger image and stronger emphasis.',
    compact: 'Takes less vertical space.',
    banner: 'High visibility for important notices.',
    media: 'Best with an image or video.',
    quickLink: 'Small and efficient for resources.',
    minimal: 'Simple text-first layout.',
  }
  return (
    <div className="studio-panel">
      <section>
        <h3>Display style</h3>
        <div className="style-picker">
          {Object.entries(contentDisplayStyleLabels).map(([value, label]) => (
            <button className={draft.displayStyle === value ? 'style-card is-selected' : 'style-card'} key={value} type="button" onClick={() => onChange({ displayStyle: value as ContentItemInput['displayStyle'] })}>
              <span className={`style-mini style-mini-${value}`} aria-hidden="true" /><strong>{label}</strong><small>{styleHelp[value] ?? 'A structured preset for this content.'}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="option-grid">
        <OptionButtons title="Width" value={draft.contentWidth} labels={contentWidthLabels} onChange={(value) => onChange({ contentWidth: value as ContentItemInput['contentWidth'] })} />
        <OptionButtons title="Grid placement" value={draft.layoutColumns ?? 'auto'} labels={contentLayoutColumnLabels} onChange={(value) => onChange({ layoutColumns: value as ContentItemInput['layoutColumns'] })} />
        <OptionButtons title="Image placement" value={draft.hideImage ? 'hidden' : draft.imagePlacement} labels={contentImagePlacementLabels} onChange={(value) => onChange({ imagePlacement: value as ContentItemInput['imagePlacement'], hideImage: value === 'hidden' })} />
        <OptionButtons title="Accent" value={draft.accentStyle} labels={contentAccentStyleLabels} onChange={(value) => onChange({ accentStyle: value as ContentItemInput['accentStyle'] })} />
        <OptionButtons title="Shape" value={draft.cardShape ?? 'standard'} labels={contentCardShapeLabels} onChange={(value) => onChange({ cardShape: value as ContentItemInput['cardShape'] })} />
        <OptionButtons title="Density" value={draft.contentDensity ?? 'comfortable'} labels={contentDensityLabels} onChange={(value) => onChange({ contentDensity: value as ContentItemInput['contentDensity'] })} />
        <OptionButtons title="Image ratio" value={draft.imageRatio ?? 'landscape'} labels={contentImageRatioLabels} onChange={(value) => onChange({ imageRatio: value as ContentItemInput['imageRatio'] })} />
        <OptionButtons title="Badge" value={draft.badgeStyle ?? 'subtle'} labels={contentBadgeStyleLabels} onChange={(value) => onChange({ badgeStyle: value as ContentItemInput['badgeStyle'] })} />
        <OptionButtons title="Background" value={draft.backgroundStyle ?? 'plain'} labels={contentBackgroundStyleLabels} onChange={(value) => onChange({ backgroundStyle: value as ContentItemInput['backgroundStyle'] })} />
        <OptionButtons title="Text" value={draft.textAlignment} labels={contentTextAlignmentLabels} onChange={(value) => onChange({ textAlignment: value as ContentItemInput['textAlignment'] })} />
      </section>
      <div className="smart-suggestions" role="status">
        {draft.displayStyle === 'media' && !draft.imageUrl && <p>Media Spotlight looks best with an image or video.</p>}
        {draft.contentWidth === 'full' && <p>Full-row items are powerful; use them for major notices.</p>}
        {draft.title.length > 78 && <p>Your title is quite long for a banner. A shorter headline may scan better.</p>}
        {draft.imageUrl && !draft.imageAlt && <p>Add alt text to improve accessibility.</p>}
        {!draft.actionUrl && !draft.linkUrl && <p>This card has no action link yet.</p>}
      </div>
    </div>
  )
}

function OptionButtons({ title, value, labels, onChange }: { title: string; value: string; labels: Record<string, string>; onChange: (value: string) => void }) {
  return (
    <fieldset>
      <legend>{title}</legend>
      <div className="segmented-options">
        {Object.entries(labels).map(([option, label]) => <button className={value === option ? 'is-selected' : ''} key={option} type="button" onClick={() => onChange(option)}>{label}</button>)}
      </div>
    </fieldset>
  )
}

function ContentPublishPanel({ canPublish, draft, onChange }: { canPublish: boolean; draft: ContentItemInput; onChange: (patch: Partial<ContentItemInput>) => void }) {
  return (
    <div className="studio-panel publish-panel">
      <section className="form-grid">
        <label>Status<select value={draft.status} onChange={(event) => onChange({ status: event.target.value as ContentStatus })}><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="published" disabled={!canPublish}>Published</option><option value="hidden">Hidden</option></select></label>
        <label>Publish date<input value={draft.publishDate ?? ''} onChange={(event) => onChange({ publishDate: event.target.value, status: event.target.value ? 'scheduled' : draft.status })} type="date" /></label>
        <label>Expiry date<input value={draft.expiryDate ?? ''} onChange={(event) => onChange({ expiryDate: event.target.value })} type="date" /></label>
        <label className="checkbox-row"><input checked={draft.pinned ?? false} onChange={(event) => onChange({ pinned: event.target.checked })} type="checkbox" /><span>Pin to top</span></label>
      </section>
      <div className="validation-summary">
        <h3>Final check</h3>
        <p>{draft.title ? 'Title ready.' : 'Add a title before publishing.'}</p>
        <p>{draft.summary ? 'Summary ready.' : 'Add a short summary before publishing.'}</p>
        <p>{draft.imageUrl && !draft.imageAlt ? 'Image alt text is recommended.' : 'Accessibility check looks good.'}</p>
      </div>
    </div>
  )
}

function ContentLivePreview({ item, mode, onModeChange, showContext, onToggleContext }: { item: ContentItem; mode: 'desktop' | 'tablet' | 'mobile'; onModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void; showContext: boolean; onToggleContext: () => void }) {
  return (
    <div>
      <div className="preview-controls">
        {(['desktop', 'tablet', 'mobile'] as const).map((value) => <button className={mode === value ? 'small-button is-active' : 'small-button'} key={value} type="button" onClick={() => onModeChange(value)}>{value}</button>)}
        <button className="small-button" type="button" onClick={onToggleContext}>{showContext ? 'Hide context' : 'Show context'}</button>
      </div>
      <div className={`live-preview-frame preview-${mode}`}>
        {showContext ? <ContentLayout items={[item, { ...item, id: 'sample-peer', title: 'Nearby hub item', summary: 'This sample shows how cards may share space.', displayStyle: 'quickLink', contentWidth: 'small' }]} /> : <ContentCard item={item} />}
      </div>
    </div>
  )
}

function ContentActionBar({ dirty, saving, savedAt, canPublish, onBack, onDraft, onPublish }: { dirty: boolean; saving: boolean; savedAt: string; canPublish: boolean; onBack: () => void; onDraft: () => void; onPublish: () => void }) {
  return (
    <div className="studio-action-bar">
      <button className="secondary-button" type="button" onClick={onBack}>Back</button>
      <span>{dirty ? 'Unsaved changes' : savedAt ? `Last saved ${savedAt}` : 'No changes yet'}</span>
      <button className="secondary-button" disabled={saving} type="button" onClick={onDraft}>{saving ? 'Saving...' : 'Save draft'}</button>
      <button className="primary-button blue" disabled={saving || !canPublish} type="button" onClick={onPublish}>{saving ? 'Saving...' : 'Publish / Update'}</button>
    </div>
  )
}
