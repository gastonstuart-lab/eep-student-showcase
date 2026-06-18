import { type CSSProperties } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import type { ContentItem, ContentType } from '../../types'

const contentTypeLabels: Record<ContentType, string> = {
  announcement: 'Announcement',
  event: 'Event',
  video: 'Video / Performance',
  resource: 'Resource',
  studentWork: 'Student Work',
  link: 'Webpage / Link',
}

function formatContentDate(item: ContentItem) {
  if (item.eventDate) {
    const date = new Date(`${item.eventDate}T00:00:00`)

    return Number.isNaN(date.getTime())
      ? item.eventDate
      : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
  }

  const stamp = item.updatedAt ?? item.createdAt

  if (!stamp || typeof stamp.toDate !== 'function') {
    return ''
  }

  const date = stamp.toDate()

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function getThemeClass(accentStyle: ContentItem['accentStyle']) {
  if (accentStyle === 'eep') {
    return 'theme-eep'
  }

  if (accentStyle === 'esl') {
    return 'theme-esl'
  }

  if (accentStyle === 'warm') {
    return 'theme-warm'
  }

  if (accentStyle === 'dark') {
    return 'theme-dark'
  }

  return 'theme-neutral'
}

export function ContentCard({ item, compact = false }: { item: ContentItem; compact?: boolean }) {
  const { t } = useLanguage()
  const targetUrl = item.ctaStyle === 'hidden' ? '' : item.linkUrl || item.mediaUrl
  const showCta = Boolean(targetUrl)
  const displayStyle = compact || item.displayStyle === 'compact' ? 'compact' : item.displayStyle
  const showImage = Boolean(item.imageUrl) && item.imagePlacement !== 'hidden'
  const showBody = displayStyle !== 'compact' && displayStyle !== 'banner'
  const badgeText = item.badgeText?.trim().slice(0, 24)
  const ctaClassName =
    item.ctaStyle === 'primary'
      ? 'primary-button blue content-card-cta'
      : item.ctaStyle === 'secondary'
        ? 'secondary-button content-card-cta'
        : 'small-link content-card-cta'
  const imageStyle = item.imagePlacement === 'background' && showImage
    ? ({ backgroundImage: `url(${item.imageUrl})` } as CSSProperties)
    : undefined

  return (
    <article
      className={`content-card ${getThemeClass(item.accentStyle)} style-${displayStyle} width-${item.contentWidth} align-${item.textAlignment} image-${item.imagePlacement}${showImage ? ' has-image' : ''}${showCta ? ' has-link' : ''}${badgeText ? ' has-badge' : ''}`}
    >
      {item.imagePlacement === 'background' && showImage && (
        <div className="content-card-background" aria-hidden="true" style={imageStyle} />
      )}

      {showImage && item.imagePlacement !== 'background' && item.imagePlacement !== 'right' && (
        <img className="content-card-image" src={item.imageUrl} alt={`${item.title} visual`} loading="lazy" />
      )}

      <div className="content-card-body">
        <div className="content-card-badges">
          <span className="badge">{contentTypeLabels[item.type]}</span>
          {badgeText && <span className="content-card-badge">{badgeText}</span>}
        </div>
        <h3>{item.title}</h3>
        {formatContentDate(item) && <p className="meta">{formatContentDate(item)}</p>}
        <p className="content-card-summary">{item.summary}</p>
        {showBody && item.body && <p className="muted">{item.body}</p>}
        {showCta && (
          <a className={ctaClassName} href={targetUrl} target="_blank" rel="noreferrer">
            {item.ctaStyle === 'primary' || item.ctaStyle === 'secondary' ? t('openContentLink') : t('openContentLink')}
          </a>
        )}
      </div>

      {showImage && item.imagePlacement === 'right' && (
        <img className="content-card-image" src={item.imageUrl} alt={`${item.title} visual`} loading="lazy" />
      )}
    </article>
  )
}