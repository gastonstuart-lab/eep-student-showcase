import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'
import './IedEntryPage.css'

type IntroPhase = 'idle' | 'preparing' | 'expanding' | 'complete'

const introTiles = [
  { src: '/images/ied-premium/workspace/luce-chapel-hero.webp', label: 'Luce Chapel campus identity' },
  { src: '/images/ied-premium/heroes/eep-hero.webp', label: 'EEP learning' },
  { src: '/images/ied-premium/heroes/esl-hero.webp', label: 'ESL learning' },
  { src: '/images/ied-premium/heroes/science-hero.webp', label: 'Science learning' },
  { src: '/images/ied-premium/heroes/language-arts-hero.webp', label: 'Language Arts learning' },
  { src: '/images/ied-premium/cards/eep-card.webp', label: 'EEP resources' },
  { src: '/images/ied-premium/heroes/ied-home-hero.webp', label: 'IED Hub entrance', selected: true },
  { src: '/images/ied-premium/heroes/performance-arts-hero.webp', label: 'Performance Arts learning' },
  { src: '/images/ied-premium/heroes/social-studies-hero.webp', label: 'Social Studies learning' },
  { src: '/images/ied-premium/heroes/showcase-hero.webp', label: 'Student showcase' },
  { src: '/images/ied-premium/cards/esl-card.webp', label: 'ESL resources' },
  { src: '/images/ied-premium/heroes/ied-about-hero.webp', label: 'International Education Department' },
]

const phaseDurations = {
  preparing: 220,
  expanding: 860,
  reduced: 160,
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reduced
}

export function IedEntryPage({ onComplete }: { onComplete?: () => void }) {
  const navigate = useNavigate()
  const { mode, t } = useLanguage()
  const reducedMotion = usePrefersReducedMotion()
  const [phase, setPhase] = useState<IntroPhase>('idle')
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set())
  const gridRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const entering = phase !== 'idle'

  const titleLines = useMemo(() => {
    if (mode === 'zh-Hant') return { primary: '國際教育處', secondary: 'International Education Department' }
    return { primary: 'International Education Department', secondary: '國際教育處' }
  }, [mode])

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer))
      timers.current = []
      document.body.classList.remove('ied-intro-scroll-lock')
    }
  }, [])

  const finish = () => {
    setPhase('complete')
    document.body.classList.remove('ied-intro-scroll-lock')
    onComplete?.()
    if (!onComplete) navigate('/ied')
  }

  const enter = () => {
    if (entering) return
    document.body.classList.add('ied-intro-scroll-lock')
    setPhase('preparing')

    if (reducedMotion) {
      timers.current.push(window.setTimeout(finish, phaseDurations.reduced))
      return
    }

    timers.current.push(window.setTimeout(() => setPhase('expanding'), phaseDurations.preparing))
    timers.current.push(window.setTimeout(finish, phaseDurations.preparing + phaseDurations.expanding))
  }

  const move = (event: ReactPointerEvent<HTMLElement>) => {
    if (entering || reducedMotion || !gridRef.current) return
    const nx = event.clientX / Math.max(window.innerWidth, 1) - 0.5
    const ny = event.clientY / Math.max(window.innerHeight, 1) - 0.5
    gridRef.current.style.setProperty('--intro-shift-x', `${Math.round(nx * -10)}px`)
    gridRef.current.style.setProperty('--intro-shift-y', `${Math.round(ny * -10)}px`)
  }

  return (
    <main className={`ied-intro ied-intro--${phase}`} onPointerMove={move}>
      <div className="ied-intro__grid-wrap" ref={gridRef}>
        <div className="ied-intro__grid" aria-hidden="true">
          {introTiles.map((tile, index) => {
            const style = {
              '--tile-col': String(index % 4),
              '--tile-row': String(Math.floor(index / 4)),
            } as CSSProperties
            const failed = failedImages.has(tile.src)

            return (
              <div className={`ied-intro__tile${tile.selected ? ' ied-intro__tile--selected' : ''}${failed ? ' ied-intro__tile--fallback' : ''}`} key={tile.src} style={style}>
                {failed ? (
                  <span>{tile.label}</span>
                ) : (
                  <img
                    src={tile.src}
                    alt=""
                    decoding="async"
                    loading="eager"
                    onError={() => setFailedImages((current) => new Set(current).add(tile.src))}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="ied-intro__shade" aria-hidden="true" />

      <div className="ied-intro__logo">
        <img src="/school-logo.svg" alt={t('introLogoAlt')} />
      </div>

      <section className="ied-intro__panel" aria-labelledby="ied-intro-title">
        <p className="ied-intro__eyebrow">THUHS</p>
        <h1 id="ied-intro-title">{titleLines.primary}</h1>
        <p className="ied-intro__zh" lang="zh-Hant">{titleLines.secondary}</p>
        <button className="ied-intro__enter" type="button" disabled={entering} onClick={enter}>
          {t('introEnter')}
        </button>
      </section>

      <p className="ied-intro__hint">{t('introHint')}</p>
    </main>
  )
}
