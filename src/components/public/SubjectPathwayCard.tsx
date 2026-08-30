import { Link } from 'react-router-dom'
import { isStaticDocumentTarget } from './staticDocumentTarget'

const ctaLabel = (label: string) => (label.includes('→') ? label : `${label} →`)

export function SubjectPathwayCard({
  to,
  title,
  description,
  image,
  imageAlt,
  cta,
  theme,
}: {
  to: string
  title: string
  description: string
  image: string
  imageAlt: string
  cta: string
  theme: 'science' | 'language' | 'performance' | 'social'
}) {
  return (
    <Link className={`premium-subject-card premium-subject-${theme}`} reloadDocument={isStaticDocumentTarget(to)} to={to}>
      <img className="premium-subject-image" src={image} alt={imageAlt} loading="lazy" />
      <div className="premium-subject-body">
        <span className="programme-kicker">Subject Hub</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <span className="premium-card-cta">{ctaLabel(cta)}</span>
    </Link>
  )
}
