import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { UiText, useLanguage } from '../../i18n/LanguageContext'
import './IedIntroPage.css'

const introTiles = [
  { src: '/images/ied-premium/workspace/luce-chapel-hero.webp', label: 'Luce Chapel' },
  { src: '/images/ied-premium/heroes/eep-hero.webp', label: 'EEP' },
  { src: '/images/ied-premium/heroes/esl-hero.webp', label: 'ESL' },
  { src: '/images/ied-premium/heroes/science-hero.webp', label: 'Science' },
  { src: '/images/ied-premium/heroes/language-arts-hero.webp', label: 'Language Arts' },
  { src: '/images/ied-premium/cards/eep-card.webp', label: 'EEP materials' },
  { src: '/images/ied-premium/heroes/ied-home-hero.webp', label: 'THUHS campus building' },
  { src: '/images/ied-premium/heroes/performance-arts-hero.webp', label: 'Performance Arts' },
  { src: '/images/ied-premium/heroes/social-studies-hero.webp', label: 'Social Studies' },
  { src: '/images/ied-premium/heroes/showcase-hero.webp', label: 'Student Showcase' },
  { src: '/images/ied-premium/cards/esl-card.webp', label: 'ESL materials' },
  { src: '/images/ied-premium/heroes/ied-about-hero.webp', label: 'International Education Department' },
] as const

const selectedTileIndex = 6

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (!window.matchMedia) {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(mediaQuery.matches)

    update()
    mediaQuery.addEventListener('change', update)

    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return prefersReducedMotion
}

export function IedIntroPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const selectedTileRef = useRef<HTMLDivElement | null>(null)
  const navigationTimerRef = useRef<number | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [tileBounds, setTileBounds] = useState<CSSProperties>({})
  const prefersReducedMotion = usePrefersReducedMotion()

  const pageStyle = useMemo(
    () => ({
      ...tileBounds,
    }),
    [tileBounds],
  )

  useEffect(() => {
    return () => {
      if (navigationTimerRef.current !== null) {
        window.clearTimeout(navigationTimerRef.current)
      }

      document.documentElement.classList.remove('ied-intro__scroll-lock')
    }
  }, [])

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (prefersReducedMotion || transitioning) {
      return
    }

    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 20
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 20

    event.currentTarget.style.setProperty('--ied-intro-shift-x', `${x.toFixed(2)}px`)
    event.currentTarget.style.setProperty('--ied-intro-shift-y', `${y.toFixed(2)}px`)
  }

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--ied-intro-shift-x', '0px')
    event.currentTarget.style.setProperty('--ied-intro-shift-y', '0px')
  }

  const handleEnter = () => {
    if (transitioning) {
      return
    }

    const selectedTile = selectedTileRef.current

    if (selectedTile && !prefersReducedMotion) {
      const bounds = selectedTile.getBoundingClientRect()
      setTileBounds({
        '--ied-intro-selected-left': `${bounds.left}px`,
        '--ied-intro-selected-top': `${bounds.top}px`,
        '--ied-intro-selected-width': `${bounds.width}px`,
        '--ied-intro-selected-height': `${bounds.height}px`,
      } as CSSProperties)
    }

    document.documentElement.classList.add('ied-intro__scroll-lock')
    setTransitioning(true)

    navigationTimerRef.current = window.setTimeout(
      () => {
        document.documentElement.classList.remove('ied-intro__scroll-lock')
        navigate('/ied')
      },
      prefersReducedMotion ? 180 : 900,
    )
  }

  return (
    <section
      className={`ied-intro${transitioning ? ' ied-intro--entering' : ''}${prefersReducedMotion ? ' ied-intro--reduced-motion' : ''}`}
      aria-labelledby="ied-intro-title"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={pageStyle}
    >
      <div className="ied-intro__grid" aria-hidden="true">
        {introTiles.map((tile, index) => (
          <div
            className={`ied-intro__tile${index === selectedTileIndex ? ' ied-intro__tile--selected' : ''}`}
            key={tile.src}
            ref={index === selectedTileIndex ? selectedTileRef : undefined}
          >
            <img src={tile.src} alt="" draggable={false} />
            <span>{tile.label}</span>
          </div>
        ))}
      </div>

      <div className="ied-intro__selected-expander" aria-hidden="true">
        <img src="/images/ied-premium/heroes/ied-home-hero.webp" alt="" draggable={false} />
      </div>

      <div className="ied-intro__logo-panel">
        <img src="/school-logo.svg" alt={t('introLogoAlt')} />
      </div>

      <div className="ied-intro__panel">
        <p className="ied-intro__eyebrow">THUHS</p>
        <UiText id="introDepartmentTitle" as="h1" className="ied-intro__title" />
        <p className="ied-intro__official-name" lang="zh-Hant">國際教育處</p>
        <p className="ied-intro__hint">{t('introHint')}</p>
        <button className="ied-intro__enter" type="button" disabled={transitioning} onClick={handleEnter}>
          {t('introEnter')}
        </button>
      </div>
    </section>
  )
}
