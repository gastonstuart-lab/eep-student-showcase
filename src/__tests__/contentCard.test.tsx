import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import { ContentCard } from '../components/public/ContentCard'
import { contentItemPreviewFromInput } from '../utils/contentAppearance'
import type { ContentItemInput } from '../types'

const baseDraft: ContentItemInput = {
  title: 'Showcase Item',
  summary: 'Public summary copy.',
  body: 'Public body copy for longer details.',
  type: 'announcement',
  department: 'ESL',
  sectionId: 'esl-science',
  sectionName: 'Science',
  status: 'published',
  featured: false,
  mediaUrl: 'https://example.com/watch',
  linkUrl: 'https://example.com/read',
  eventDate: '2026-06-18',
  imageUrl: 'https://example.com/image.jpg',
  displayStyle: 'standard',
  contentWidth: 'normal',
  imagePlacement: 'top',
  textAlignment: 'left',
  accentStyle: 'none',
  badgeText: 'New',
  ctaStyle: 'link',
  createdBy: 'teacher@example.com',
}

function renderCard(overrides: Partial<ContentItemInput> = {}, compact = false) {
  const item = contentItemPreviewFromInput({ ...baseDraft, ...overrides })

  return render(
    <LanguageProvider>
      <ContentCard compact={compact} item={item} />
    </LanguageProvider>,
  )
}

describe('ContentCard', () => {
  it('applies the display-style classes for the public layouts', () => {
    const layouts: Array<ContentItemInput['displayStyle']> = ['standard', 'featured', 'compact', 'banner', 'media']

    layouts.forEach((displayStyle) => {
      const { container, unmount } = renderCard({ displayStyle })
      expect(container.querySelector(`article.style-${displayStyle}`)).toBeTruthy()
      unmount()
    })
  })

  it('renders CTA styles and hides the CTA when requested', () => {
    const { container, rerender } = renderCard({ ctaStyle: 'primary' })
    expect(container.querySelector('.primary-button.content-card-cta')).toBeTruthy()

    rerender(
      <LanguageProvider>
        <ContentCard item={contentItemPreviewFromInput({ ...baseDraft, ctaStyle: 'hidden' })} />
      </LanguageProvider>,
    )
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('falls back safely when an image placement is configured without an image', () => {
    const { container } = renderCard({ imageUrl: '', imagePlacement: 'left' })
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('article.image-left')).toBeTruthy()
  })

  it('keeps the mobile-friendly compact layout intact', () => {
    const { container } = renderCard({ displayStyle: 'compact' }, true)
    expect(container.querySelector('article.style-compact')).toBeTruthy()
  })
})