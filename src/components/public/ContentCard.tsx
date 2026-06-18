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
  if (accentStyle === 'ied') {
    return 'theme-ied'
  }

  if (accentStyle === 'eep') {
    return 'theme-eep'
  }

  if (accentStyle === 'esl') {
    return 'theme-esl'
  }

  if (accentStyle === 'warm') {
    return 'theme-warm'
  }

  if (accentStyle === 'performance') {
    return 'theme-performance'
  }

  if (accentStyle === 'science') {
    return 'theme-science'
  }

  if (accentStyle === 'social') {
    return 'theme-social'
  }

  if (accentStyle === 'dark') {
    return 'theme-dark'
  }

  return 'theme-neutral'
}

export function ContentCard({ item, compact = false }: { item: ContentItem; compact?: boolean }) {
  const { t } = useLanguage()
  const primaryUrl = item.actionUrl || item.linkUrl || item.mediaUrl
  const primaryLabel = item.actionLabel || t('openContentLink')
  const primaryStyle = item.actionStyle ?? item.ctaStyle
  const secondaryUrl = item.secondaryActionUrl ?? ''
  const secondaryLabel = item.secondaryActionLabel || 'Learn more'
  const secondaryStyle = item.secondaryActionStyle ?? 'secondary'
  const showPrimaryCta = primaryStyle !== 'hidden' && Boolean(primaryUrl)
  const showSecondaryCta = secondaryStyle !== 'hidden' && Boolean(secondaryUrl)
  const showCta = showPrimaryCta || showSecondaryCta
  const displayStyle = compact || item.displayStyle === 'compact' ? 'compact' : item.displayStyle
  const effectiveImagePlacement = item.hideImage ? 'hidden' : item.imagePlacement
  const showImage = Boolean(item.imageUrl) && effectiveImagePlacement !== 'hidden'
  const showBody = displayStyle !== 'compact' && displayStyle !== 'banner' && displayStyle !== 'quickLink'
  const badgeText = item.badgeText?.trim().slice(0, 24)
  const primaryCtaClassName =
    primaryStyle === 'primary'
      ? 'primary-button blue content-card-cta'
      : primaryStyle === 'secondary'
        ? 'secondary-button content-card-cta'
        : 'small-link content-card-cta'
  const secondaryCtaClassName =
    secondaryStyle === 'primary'
      ? 'primary-button blue content-card-cta'
      : secondaryStyle === 'secondary'
        ? 'secondary-button content-card-cta'
        : 'small-link content-card-cta'
  const imageStyle = (effectiveImagePlacement === 'background' || item.backgroundStyle === 'image' || item.backgroundStyle === 'darkOverlay') && showImage
    ? ({ backgroundImage: `url(${item.imageUrl})` } as CSSProperties)
    : undefined
  const imageAlt = item.imageAlt || `${item.title} visual`

  return (
    <article
      className={`content-card ${getThemeClass(item.accentStyle)} style-${displayStyle} width-${item.contentWidth} align-${item.textAlignment} image-${effectiveImagePlacement} shape-${item.cardShape ?? 'standard'} density-${item.contentDensity ?? 'comfortable'} ratio-${item.imageRatio ?? 'landscape'} badge-${item.badgeStyle ?? 'subtle'} background-${item.backgroundStyle ?? 'plain'}${showImage ? ' has-image' : ''}${showCta ? ' has-link' : ''}${badgeText ? ' has-badge' : ''}`}
    >
      {(effectiveImagePlacement === 'background' || item.backgroundStyle === 'image' || item.backgroundStyle === 'darkOverlay') && showImage && (
        <div className="content-card-background" aria-hidden="true" style={imageStyle} />
      )}

      {showImage && effectiveImagePlacement !== 'background' && effectiveImagePlacement !== 'right' && (
        <img className="content-card-image" src={item.imageUrl} alt={imageAlt} loading="lazy" />
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
          <div className="content-card-actions">
            {showPrimaryCta && (
              <a className={primaryCtaClassName} href={primaryUrl} target={item.actionNewTab === false ? undefined : '_blank'} rel={item.actionNewTab === false ? undefined : 'noreferrer'}>
                {primaryLabel}
              </a>
            )}
            {showSecondaryCta && (
              <a className={secondaryCtaClassName} href={secondaryUrl} target={item.secondaryActionNewTab === false ? undefined : '_blank'} rel={item.secondaryActionNewTab === false ? undefined : 'noreferrer'}>
                {secondaryLabel}
              </a>
            )}
          </div>
        )}
      </div>

      {showImage && effectiveImagePlacement === 'right' && (
        <img className="content-card-image" src={item.imageUrl} alt={imageAlt} loading="lazy" />
      )}
    </article>
  )
}
