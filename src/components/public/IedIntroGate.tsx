import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import './IedIntroGate.css'

const supportingImages = [
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

const heroImage = '/images/ied-premium/heroes/ied-home-hero.webp'
const heroIndex = 6

export function IedIntroGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<'idle' | 'entering' | 'done'>('idle')
  const gridRef = useRef<HTMLDivElement>(null)
  const timersRef = useRef<number[]>([])

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
    timersRef.current.push(window.setTimeout(() => {
      setPhase('done')
      document.body.style.overflow = ''
    }, 1150))
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (phase !== 'idle' || !gridRef.current) return

    const nx = event.clientX / window.innerWidth - 0.5
    const ny = event.clientY / window.innerHeight - 0.5
    gridRef.current.style.transform = `translate(calc(-50% + ${nx * -2.5}vw), calc(-50% + ${ny * -2.5}vh)) rotate(${-2.2 + nx * 0.8}deg) scale(1.035)`

    gridRef.current.querySelectorAll<HTMLElement>('.ied-intro__tile').forEach((tile, index) => {
      const depth = ((index % 3) + 1) * 1.1
      tile.style.setProperty('--tx', `${nx * depth}px`)
      tile.style.setProperty('--ty', `${ny * depth}px`)
    })
  }

  let sourceIndex = 0

  return (
    <div className="ied-intro-root">
      <div className={`ied-intro-app${phase !== 'idle' ? ' is-visible' : ''}`}>{children}</div>

      {phase !== 'done' && (
        <section
          className={`ied-intro${phase === 'entering' ? ' is-entering' : ''}`}
          aria-label="International Education Department introduction"
          onPointerMove={handlePointerMove}
        >
          <div className="ied-intro__grid-wrap" ref={gridRef}>
            <div className="ied-intro__grid">
              {Array.from({ length: 12 }, (_, index) => {
                const isHero = index === heroIndex
                const src = isHero ? heroImage : supportingImages[sourceIndex++]
                const style = {
                  '--outx': `${(index % 4 - 1.5) * 24}vw`,
                  '--outy': `${(Math.floor(index / 4) - 1) * 28}vh`,
                } as CSSProperties

                return (
                  <div
                    className={`ied-intro__tile${isHero ? ' ied-intro__tile--hero' : ''}`}
                    key={`${src}-${index}`}
                    style={style}
                  >
                    <img src={src} alt="" loading="eager" />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="ied-intro__veil" aria-hidden="true" />

          <div className="ied-intro__logo">
            <img src="/school-logo.svg" alt="The Affiliated High School of Tunghai University" />
          </div>

          <div className="ied-intro__brand">
            <div className="ied-intro__card">
              <h1>International<br />Education Department</h1>
              <p lang="zh-Hant">國際教育處</p>
              <button type="button" onClick={enterHub}>Enter</button>
            </div>
          </div>

          <p className="ied-intro__note">Move your mouse or finger · select Enter to open the IED Hub</p>
        </section>
      )}
    </div>
  )
}
