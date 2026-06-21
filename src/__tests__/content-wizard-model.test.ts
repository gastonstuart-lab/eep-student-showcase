import { describe, expect, it } from 'vitest'
import type { EffectiveAdmin } from '../auth'
import { hubConfigById } from '../hubs'
import type { ContentItem } from '../types'
import { emptyStaffPermissions, fullStaffPermissions } from '../utils/authorization'
import {
  applyTypeDefaults,
  buildWizardPayload,
  canEditContentItem,
  contentTypeOptions,
  contentWizardSteps,
  defaultDraftFor,
  draftFromContentItem,
  getCreatableHubConfigs,
  publishingChoiceForDraft,
  recoveryKey,
} from '../components/studio/contentWizard/contentWizardModel'
import { isPastDate, isValidUrl, validateWizardStep } from '../components/studio/contentWizard/contentWizardValidation'

function staff(patch: Partial<EffectiveAdmin>): EffectiveAdmin {
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
    allowedSectionIds: [],
    permissions: emptyStaffPermissions,
    source: 'adminUsers',
    ...patch,
  }
}

function contentItem(patch: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'item-1',
    title: 'Original',
    summary: 'Summary',
    body: 'Body',
    type: 'announcement',
    department: 'ESL',
    sectionId: 'esl-science',
    sectionName: 'Science',
    status: 'draft',
    featured: false,
    mediaUrl: '',
    linkUrl: '',
    eventDate: '',
    imageUrl: '',
    displayStyle: 'standard',
    contentWidth: 'medium',
    imagePlacement: 'top',
    textAlignment: 'left',
    accentStyle: 'neutral',
    ctaStyle: 'link',
    createdBy: 'teacher@example.com',
    ...patch,
  }
}

describe('content creator wizard model', () => {
  it('defines the internal steps and approved visible content types', () => {
    expect(contentWizardSteps).toEqual(['type', 'essentials', 'media', 'publishing', 'review', 'success'])
    expect(contentTypeOptions.map((option) => option.title)).toEqual(['Announcement', 'Event', 'Student Achievement', 'Gallery', 'Page / Resource', 'News / Article'])
    expect(contentTypeOptions.map((option) => option.type).sort()).toEqual(['announcement', 'event', 'link', 'resource', 'studentWork', 'video'])
  })

  it('applies type-specific defaults without changing entered text', () => {
    const draft = defaultDraftFor(hubConfigById['esl-science'], 'teacher@example.com')
    const next = applyTypeDefaults({ ...draft, title: 'Keep me' }, 'video')

    expect(next.title).toBe('Keep me')
    expect(next.type).toBe('video')
    expect(next.displayStyle).toBe('media')
    expect(next.actionLabel).toBe('Watch Video')
  })

  it('validates required fields and URLs', () => {
    const draft = defaultDraftFor(hubConfigById['esl-science'], 'teacher@example.com')

    expect(validateWizardStep('essentials', draft, { publishingChoice: 'draft', canPublish: false, destinationCount: 1 })).toMatchObject({
      title: 'Add a title.',
      summary: 'Add a short summary.',
      body: 'Add a short description.',
    })
    expect(isValidUrl('https://example.com/resource')).toBe(true)
    expect(isValidUrl('javascript:alert(1)')).toBe(false)
  })

  it('enforces publish and schedule permissions', () => {
    const draft = {
      ...defaultDraftFor(hubConfigById['esl-science'], 'teacher@example.com'),
      title: 'Ready',
      summary: 'Ready summary',
      body: 'Ready body',
      publishDate: '2020-01-01',
    }

    expect(validateWizardStep('publishing', draft, { publishingChoice: 'published', canPublish: false, destinationCount: 1 }).status).toMatch(/cannot publish/)
    expect(validateWizardStep('publishing', draft, { publishingChoice: 'scheduled', canPublish: true, destinationCount: 1, now: new Date('2026-06-20T00:00:00') }).publishDate).toMatch(/future/)
    expect(isPastDate('2026-06-21', new Date('2026-06-20T00:00:00'))).toBe(false)
  })

  it('returns only creatable destinations and keeps current context as the draft default', () => {
    const editor = staff({
      allowedSectionIds: ['esl-science', 'esl-language-arts'],
      permissions: { ...emptyStaffPermissions, createContent: true },
    })

    expect(getCreatableHubConfigs(editor).map((config) => config.sectionId)).toEqual(['esl-science', 'esl-language-arts'])
    expect(defaultDraftFor(hubConfigById['esl-science'], 'teacher@example.com').sectionId).toBe('esl-science')
  })

  it('blocks unauthorized edit targets and preserves edit metadata', () => {
    const editor = staff({
      allowedSectionIds: ['esl-language-arts'],
      permissions: { ...emptyStaffPermissions, editContent: true },
    })
    const item = contentItem({ createdBy: 'original@example.com', status: 'published', publishDate: '2026-07-01' })
    const draft = draftFromContentItem(item, 'teacher@example.com')

    expect(canEditContentItem(editor, item)).toBe(false)
    expect(draft.createdBy).toBe('original@example.com')
    expect(publishingChoiceForDraft(draft)).toBe('published')
  })

  it('builds a sanitized save payload for destination and status', () => {
    const draft = {
      ...defaultDraftFor(hubConfigById['esl-science'], 'teacher@example.com'),
      title: ' Published update ',
      summary: 'Summary',
      body: 'Body',
      actionUrl: 'https://example.com',
    }
    const payload = buildWizardPayload(draft, hubConfigById['esl-language-arts'], 'published', 4)

    expect(payload.sectionId).toBe('esl-language-arts')
    expect(payload.status).toBe('published')
    expect(payload.sortOrder).toBe(5)
    expect(payload.actionUrl).toBe('https://example.com')
  })

  it('keys recovery by user, section, and edit target', () => {
    expect(recoveryKey('uid-1', 'esl-science')).toBe('ied-content-wizard:uid-1:esl-science:new')
    expect(recoveryKey('uid-1', 'esl-science', 'item-1')).toBe('ied-content-wizard:uid-1:esl-science:item-1')
  })

  it('allows super administrators to create in every hub', () => {
    const owner = staff({
      role: 'superAdmin',
      allowedSectionIds: ['*'],
      permissions: fullStaffPermissions,
    })

    expect(getCreatableHubConfigs(owner).length).toBeGreaterThan(4)
  })
})
