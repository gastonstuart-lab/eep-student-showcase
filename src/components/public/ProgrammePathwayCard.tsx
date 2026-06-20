import { Link } from 'react-router-dom'

export function ProgrammePathwayCard({
  to,
  title,
  description,
  cta,
  desktopImage,
  mobileImage,
  imageAlt,
  theme,
  kicker,
}: {
  to: string
  title: string
  description: string
  cta: string
  desktopImage: string
  mobileImage?: string
  imageAlt: string
  theme: 'eep' | 'esl'
  kicker: string
}) {
  return (
    <Link className={`premium-pathway-card premium-pathway-${theme}`} to={to}>
      <picture className="premium-pathway-image">
        {mobileImage && <source media="(max-width: 760px)" srcSet={mobileImage} />}
        <img src={desktopImage} alt={imageAlt} />
      </picture>
      <div className="premium-pathway-body">
        <span className="programme-kicker">{kicker}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <span className="premium-card-cta">{cta}</span>
    </Link>
  )
}
