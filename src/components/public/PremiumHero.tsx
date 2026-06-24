import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'

export interface PremiumHeroAction {
  label: string
  to: string
  variant?: 'blue' | 'teal' | 'indigo' | 'amber' | 'terracotta' | 'outline'
}

const ctaLabel = (label: string) => (label.includes('→') || label.includes('↓') ? label : `${label} →`)

export function PremiumHero({
  eyebrow,
  title,
  lead,
  body,
  desktopImage,
  mobileImage,
  imageAlt = '',
  actions = [],
  theme = 'ied',
  className = '',
  imagePosition,
  darkOverlay = false,
}: {
  eyebrow: string
  title: string
  lead: string
  body?: string
  desktopImage: string
  mobileImage: string
  imageAlt?: string
  actions?: PremiumHeroAction[]
  theme?: string
  className?: string
  imagePosition?: string
  darkOverlay?: boolean
}) {
  const heroStyle = {
    '--hero-position': imagePosition ?? 'center',
  } as CSSProperties

  return (
    <section
      className={`premium-hero premium-hero-${theme}${darkOverlay ? ' premium-hero--dark' : ''}${className ? ` ${className}` : ''}`}
      style={heroStyle}
    >
      <picture className="premium-hero-media premium-hero__media">
        <source media="(max-width: 760px)" srcSet={mobileImage} />
        <img src={desktopImage} alt={imageAlt} />
      </picture>
      <div className="premium-hero__overlay" aria-hidden="true"></div>
      <div className="premium-hero-copy premium-hero__content">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="premium-lead">{lead}</p>
        {body && <p className="premium-body">{body}</p>}
        {actions.length > 0 && (
          <div className="hero-actions premium-hero-actions">
            {actions.map((action) => {
              const className = `premium-button premium-button-${action.variant ?? 'blue'}`
              const isExternal = /^https?:\/\//.test(action.to)

              return isExternal ? (
                <a className={className} href={action.to} key={`${action.label}-${action.to}`} target="_blank" rel="noreferrer">
                  <span>{ctaLabel(action.label)}</span>
                </a>
              ) : (
                <Link className={className} key={`${action.label}-${action.to}`} to={action.to}>
                  <span>{ctaLabel(action.label)}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
