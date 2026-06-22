import { type CSSProperties } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import type { ContentItem, ContentType } from '../../types'
import { localizedContentText } from '../../utils/contentLifecycle'

const contentTypeLabels: Record<'en' | 'zh-Hant', Record<ContentType, string>> = {
  en: {
    announcement: 'Announcement',
    event: 'Event',
    video: 'Video / Performance',
    resource: 'Resource',
    studentWork: 'Student Work',
    link: 'Webpage / Link',
  },
  'zh-Hant': {
    announcement: '公告',
    event: '活動',
    video: '影片／表演',
    resource: '學習資源',
    studentWork: '學生作品',
    link: '網頁／連結',
  },
}

function parseContentDate(value: string) {
  const normalized = value.includes('T') ? value : `${value}T00:00:00`
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatContentDate(item: ContentItem, locale: string) {
  if (item.eventDate) {
    const date = parseContentDate(item.eventDate)
    return date
      ? new Intl.DateTimeFormat(locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          ...(item.eventDate.includes('T') ? { hour: 'numeric', minute: '2-digit' } : {}),
        }).format(date)
      : item.eventDate
  }

  const stamp = item.updatedAt ?? item.createdAt
  if (!stamp || typeof stamp.toDate !== 'function') return ''

  const date = stamp.toDate()
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function getThemeClass(accentStyle: ContentItem['accentStyle']) {
  if (accentStyle === 'ied') return 'theme-ied'
  if (accentStyle === 'eep') return 'theme-eep'
  if (accentStyle === 'esl') return 'theme-esl'
  if (accentStyle === 'warm') return 'theme-warm'
  if (accentStyle === 'performance') return 'theme-performance'
  if (accentStyle === 'science') return 'theme-science'
  if (accentStyle === 'social') return 'theme-social'
  if (accentStyle === 'dark') return 'theme-dark'
  return 'theme-neutral'
}

function bilingualValue(en: string | undefined, zh: string | undefined) {
  const english = en?.trim() ?? ''
  const traditionalChinese = zh?.trim() ?? ''
  if (!traditionalChinese) return english
  if (!english) return traditionalChinese
  return `${english} / ${traditionalChinese}`
}

export function ContentCard({ item, compact = false }: { item: ContentItem; compact?: boolean }) {
  const { mode, t } = useLanguage()
  const contentMode = mode === 'zh-Hant' ? 'zh-Hant' : 'en'
  const localized = localizedContentText(item, contentMode)
  const locale = mode === 'zh-Hant' ? 'zh-TW' : 'en'
  const title = mode === 'bilingual' ? bilingualValue(item.title, item.titleZh) : localized.title
  const summary = mode === 'bilingual' ? bilingualValue(item.summary, item.summaryZh) : localized.summary
  const body = mode === 'bilingual' ? bilingualValue(item.body, item.bodyZh) : localized.body
  const badgeText = mode === 'bilingual'
    ? bilingualValue(item.badgeText, item.badgeTextZh).slice(0, 48)
    : localized.badgeText?.trim().slice(0, 24)
  const primaryUrl = item.actionUrl || item.linkUrl || item.mediaUrl
  const primaryLabel = mode === 'bilingual'
    ? bilingualValue(item.actionLabel || t('openContentLink'), item.actionLabelZh)
    : localized.actionLabel || t('openContentLink')
  const primaryStyle = item.actionStyle ?? item.ctaStyle
  const secondaryUrl = item.secondaryActionUrl ?? ''
  const secondaryLabel = mode === 'bilingual'
    ? bilingualValue(item.secondaryActionLabel || 'Learn more', item.secondaryActionLabelZh || '了解更多')
    : localized.secondaryActionLabel || (mode === 'zh-Hant' ? '了解更多' : 'Learn more')
  const secondaryStyle = item.secondaryActionStyle ?? 'secondary'
  const showPrimaryCta = primaryStyle !== 'hidden' && Boolean(primaryUrl)
  const showSecondaryCta = secondaryStyle !== 'hidden' && Boolean(secondaryUrl)
  const showCta = showPrimaryCta || showSecondaryCta
  const displayStyle = compact || item.displayStyle === 'compact' ? 'compact' : item.displayStyle
  const effectiveImagePlacement = item.hideImage ? 'hidden' : item.imagePlacement
  const showImage = Boolean(item.imageUrl) && effectiveImagePlacement !== 'hidden'
  const showBody = displayStyle !== 'compact' && displayStyle !== 'banner' && displayStyle !== 'quickLink'
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
  const imageAlt = mode === 'bilingual'
    ? bilingualValue(item.imageAlt || `${item.title} visual`, item.imageAltZh)
    : localized.imageAlt || `${localized.title} visual`
  const formattedDate = formatContentDate(item, locale)
  const typeLabel = mode === 'bilingual'
    ? `${contentTypeLabels.en[item.type]} / ${contentTypeLabels['zh-Hant'][item.type]}`
    : contentTypeLabels[contentMode][item.type]

  return (
    <article
      className={`content-card ${getThemeClass(item.accentStyle)} style-${displayStyle} width-${item.contentWidth} align-${item.textAlignment} image-${effectiveImagePlacement} shape-${item.cardShape ?? 'standard'} density-${item.contentDensity ?? 'comfortable'} ratio-${item.imageRatio ?? 'landscape'} badge-${item.badgeStyle ?? 'subtle'} background-${item.backgroundStyle ?? 'plain'} template-${item.template ?? 'mediumCard'} placement-${item.placement ?? 'main'}${showImage ? ' has-image' : ''}${showCta ? ' has-link' : ''}${badgeText ? ' has-badge' : ''}`}
    >
      {(effectiveImagePlacement === 'background' || item.backgroundStyle === 'image' || item.backgroundStyle === 'darkOverlay') && showImage && (
        <div className="content-card-background" aria-hidden="true" style={imageStyle} />
      )}

      {showImage && effectiveImagePlacement !== 'background' && effectiveImagePlacement !== 'right' && (
        <img className="content-card-image" src={item.imageUrl} alt={imageAlt} loading="lazy" />
      )}

      <div className="content-card-body">
        <div className="content-card-badges">
          <span className="badge">{typeLabel}</span>
          {badgeText && <span className="content-card-badge">{badgeText}</span>}
        </div>
        <h3>{title}</h3>
        {formattedDate && <p className="meta">{formattedDate}</p>}
        <p className="content-card-summary">{summary}</p>
        {showBody && body && <p className="muted">{body}</p>}
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
