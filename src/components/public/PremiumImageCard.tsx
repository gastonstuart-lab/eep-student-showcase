import { Link } from 'react-router-dom'
import { isStaticDocumentTarget } from './staticDocumentTarget'

const ctaLabel = (label: string) => (label.includes('→') ? label : `${label} →`)

export function PremiumImageCard({
  title,
  kicker,
  body,
  image,
  imageAlt,
  actionLabel,
  actionTo,
  secondaryLabel,
  secondaryTo,
  theme = 'blue',
}: {
  title: string
  kicker: string
  body: string
  image: string
  imageAlt: string
  actionLabel: string
  actionTo?: string
  secondaryLabel?: string
  secondaryTo?: string
  theme?: 'blue' | 'teal' | 'indigo' | 'amber' | 'terracotta'
}) {
  return (
    <article className={`premium-image-card premium-image-card-${theme}`}>
      <img className="premium-image-card-media" src={image} alt={imageAlt} loading="lazy" />
      <div className="premium-image-card-body">
        <span className="programme-kicker">{kicker}</span>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <div className="premium-image-card-actions">
        {actionTo ? (
          <Link className="premium-card-cta" reloadDocument={isStaticDocumentTarget(actionTo)} to={actionTo}>
            {ctaLabel(actionLabel)}
          </Link>
        ) : (
          <span className="premium-card-cta is-static">{ctaLabel(actionLabel)}</span>
        )}
        {secondaryLabel && secondaryTo && (
          <Link className="premium-card-cta premium-card-cta-secondary" reloadDocument={isStaticDocumentTarget(secondaryTo)} to={secondaryTo}>
            {ctaLabel(secondaryLabel)}
          </Link>
        )}
      </div>
    </article>
  )
}
