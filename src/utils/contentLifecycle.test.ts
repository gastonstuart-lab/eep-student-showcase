import { describe, expect, it } from 'vitest'
import type { ContentItem } from '../types'
import {
  contentLifecycleState,
  isPubliclyVisibleContent,
  localizedContentText,
  normalizeContentLifecycleFields,
} from './contentLifecycle'

const baseItem = {
  status: 'published',
  publishDate: '',
  expiryDate: '',
} as const

describe('content lifecycle', () => {
  const now = new Date('2026-06-22T12:00:00+08:00')

  it('keeps future content scheduled', () => {
    expect(contentLifecycleState({ ...baseItem, publishDate: '2026-06-23T09:00:00+08:00' }, now)).toBe('scheduled')
  })

  it('shows content during its active window', () => {
    const item = {
      ...baseItem,
      publishDate: '2026-06-22T09:00:00+08:00',
      expiryDate: '2026-06-22T17:00:00+08:00',
    }
    expect(contentLifecycleState(item, now)).toBe('live')
    expect(isPubliclyVisibleContent(item, now)).toBe(true)
  })

  it('hides expired content from public rendering', () => {
    const item = { ...baseItem, expiryDate: '2026-06-22T11:59:00+08:00' }
    expect(contentLifecycleState(item, now)).toBe('expired')
    expect(isPubliclyVisibleContent(item, now)).toBe(false)
  })

  it('never exposes drafts, manually hidden items, or archived items', () => {
    expect(contentLifecycleState({ ...baseItem, status: 'draft' }, now)).toBe('draft')
    expect(contentLifecycleState({ ...baseItem, status: 'hidden' }, now)).toBe('hidden')
    expect(contentLifecycleState({ ...baseItem, status: 'archived' }, now)).toBe('archived')
  })
})

describe('bilingual content', () => {
  const item = {
    title: 'Science fair',
    titleZh: '科學展覽',
    summary: 'Explore student projects.',
    summaryZh: '探索學生專題。',
    body: 'Full English body',
    bodyZh: '',
    badgeText: 'Update',
    badgeTextZh: '最新消息',
    actionLabel: 'Learn more',
    actionLabelZh: '了解更多',
    secondaryActionLabel: 'Details',
    secondaryActionLabelZh: '',
    imageAlt: 'Students presenting',
    imageAltZh: '學生進行發表',
  } as Pick<ContentItem, 'title' | 'titleZh' | 'summary' | 'summaryZh' | 'body' | 'bodyZh' | 'badgeText' | 'badgeTextZh' | 'actionLabel' | 'actionLabelZh' | 'secondaryActionLabel' | 'secondaryActionLabelZh' | 'imageAlt' | 'imageAltZh'>

  it('uses Traditional Chinese fields when available', () => {
    const localized = localizedContentText(item, 'zh-Hant')
    expect(localized.title).toBe('科學展覽')
    expect(localized.summary).toBe('探索學生專題。')
    expect(localized.badgeText).toBe('最新消息')
  })

  it('falls back to English when a Traditional Chinese field is empty', () => {
    const localized = localizedContentText(item, 'zh-Hant')
    expect(localized.body).toBe('Full English body')
    expect(localized.secondaryActionLabel).toBe('Details')
  })
})

describe('legacy content compatibility', () => {
  it('assigns safe defaults to old records', () => {
    expect(normalizeContentLifecycleFields({})).toEqual({
      placement: 'main',
      template: 'mediumCard',
      expiryAction: 'hide',
    })
  })
})
