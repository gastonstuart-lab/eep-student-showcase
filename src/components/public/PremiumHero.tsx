import { Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import './LandingIntro.css'

export interface PremiumHeroAction {
  label: string
  to: string
  variant?: 'blue' | 'teal' | 'indigo' | 'amber' | 'terracotta' | 'outline'
}

const ctaLabel = (label: string) => (label.includes('→') || label.includes('↓') ? label : `${label} →`)

const landingImages = [
  '/images/ied-premium/workspace/luce-chapel-hero.webp',
  '/images/ied-premium/heroes/eep-hero.webp',
  '/images/ied-premium/heroes/esl-hero.webp',
  '/images/ied-premium/heroes/science-hero.webp',
  '/images/ied-premium/heroes/language-arts-hero.webp',
  '/images/ied-premium/heroes/performance-arts-hero.webp',
  '/images/ied-premium/heroes/social-studies-hero.webp',
  '/images/ied-premium/heroes/showcase-hero.webp',
  '/images/ied-premium/cards/ied-about-card.webp',
  '/images/ied-premium/mobile/eep-mobile.webp',
  '/images/ied-premium/mobile/esl-mobile.webp',
]

function LandingIntro({ heroImage }: { heroImage: string }) {
  const [phase, setPhase] = useState<'idle' | 'entering' | 'done'>('idle')
  const [visible, setVisible] = useState(true)
  const gridWrapRef = useRef<HTMLDivElement>(null)
  const timersRef = useRef<number[]>([])
  const heroIndex = 6

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const enterHub = () => {
    if (phase !== 'idle') return
    setPhase('entering')
    timersRef.current.push(window.setTimeout(() => setPhase('done'), 1080))
    timersRef.current.push(window.setTimeout(() => {
      document.body.style.overflow = ''
      setVisible(false)
    }, 1380))
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (phase !== 'idle' || !gridWrapRef.current) return
    const nx = event.clientX / window.innerWidth - 0.5
    const ny = event.clientY / window.innerHeight - 0.5
    gridWrapRef.current.style.transform = `translate(calc(-50% + ${nx * -2.7}vw), calc(-50% + ${ny * -2.7}vh)) rotate(${-2.2 + nx * 0.8}deg) scale(1.035)`
    const tiles = gridWrapRef.current.querySelectorAll<HTMLElement>('.landing-intro__tile')
    tiles.forEach((tile, index) => {
      const depth = ((index % 3) + 1) * 1.1
      tile.style.setProperty('--tx', `${nx * depth}px`)
      tile.style.setProperty('--ty', `${ny * depth}px`)
    })
  }

  if (!visible || typeof document === 'undefined') return null

  let sourceIndex = 0
  const phaseClass = phase === 'entering' ? ' is-entering' : phase === 'done' ? ' is-done' : ''

  return createPortal(
    <section
      className={`landing-intro${phaseClass}`}
      aria-label="International Education Department introduction"
      onPointerMove={handlePointerMove}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') enterHub()
      }}
    >
      <div className="landing-intro__grid-wrap" ref={gridWrapRef}>
        <div className="landing-intro__grid">
          {Array.from({ length: 12 }, (_, index) => {
            const isHero = index === heroIndex
            const src = isHero ? heroImage : landingImages[sourceIndex++]
            const style = {
              '--outx': `${(index % 4 - 1.5) * 24}vw`,
              '--outy': `${(Math.floor(index / 4) - 1) * 28}vh`,
            } as CSSProperties

            return (
              <div
                className={`landing-intro__tile${isHero ? ' landing-intro__tile--hero' : ''}`}
                key={`${src}-${index}`}
                style={style}
              >
                <img src={src} alt="" loading="eager" />
              </div>
            )
          })}
        </div>
      </div>
      <div className="landing-intro__veil" aria-hidden="true" />
      <div className="landing-intro__logo">
        <img src="/school-logo.svg" alt="The Affiliated High School of Tunghai University" />
      </div>
      <div className="landing-intro__brand">
        <div className="landing-intro__card">
          <h1>International<br />Education Department</h1>
          <p className="landing-intro__zh" lang="zh-Hant">國際教育處</p>
          <button className="landing-intro__enter" type="button" onClick={enterHub}>Enter</button>
        </div>
      </div>
      <p className="landing-intro__note">Move your mouse or finger · select Enter to open the IED Hub</p>
    </section>,
    document.body,
  )
}

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
  const isIedLandingHero = className.split(' ').includes('home-premium-hero')

  return (
    <>
      {isIedLandingHero && <LandingIntro heroImage={desktopImage} />}
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
                const actionClassName = `premium-button premium-button-${action.variant ?? 'blue'}`
                const isExternal = /^https?:\/\//.test(action.to)

                return isExternal ? (
                  <a className={actionClassName} href={action.to} key={`${action.label}-${action.to}`} target="_blank" rel="noreferrer">
                    <span>{ctaLabel(action.label)}</span>
                  </a>
                ) : (
                  <Link className={actionClassName} key={`${action.label}-${action.to}`} to={action.to}>
                    <span>{ctaLabel(action.label)}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
