import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import './IedEntryPage.css'

const images = [
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

export function IedEntryPage({ onComplete }: { onComplete: () => void }) {
  const [entering, setEntering] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const enter = () => {
    if (entering) return
    setEntering(true)
    timerRef.current = window.setTimeout(() => {
      document.body.style.overflow = ''
      onComplete()
    }, 1050)
  }

  const move = (event: ReactPointerEvent<HTMLElement>) => {
    if (entering || !gridRef.current) return
    const nx = event.clientX / window.innerWidth - 0.5
    const ny = event.clientY / window.innerHeight - 0.5
    gridRef.current.style.transform = `translate(calc(-50% + ${nx * -2.5}vw),calc(-50% + ${ny * -2.5}vh)) rotate(${-2.2 + nx * 0.8}deg) scale(1.035)`
  }

  let sourceIndex = 0

  return (
    <main className={`ied-entry${entering ? ' is-entering' : ''}`} onPointerMove={move}>
      <div className="ied-entry__grid-wrap" ref={gridRef}>
        <div className="ied-entry__grid">
          {Array.from({ length: 12 }, (_, index) => {
            const isHero = index === heroIndex
            const src = isHero ? heroImage : images[sourceIndex++]
            const style = {
              '--out-x': `${(index % 4 - 1.5) * 24}vw`,
              '--out-y': `${(Math.floor(index / 4) - 1) * 28}vh`,
            } as CSSProperties

            return (
              <div className={`ied-entry__tile${isHero ? ' ied-entry__tile--hero' : ''}`} style={style} key={`${src}-${index}`}>
                <img src={src} alt="" loading="eager" />
              </div>
            )
          })}
        </div>
      </div>

      <div className="ied-entry__veil" aria-hidden="true" />

      <div className="ied-entry__logo">
        <img src="/school-logo.svg" alt="The Affiliated High School of Tunghai University" />
      </div>

      <div className="ied-entry__centre">
        <section className="ied-entry__card" aria-labelledby="ied-entry-title">
          <h1 id="ied-entry-title">International<br />Education Department</h1>
          <p lang="zh-Hant">國際教育處</p>
          <button type="button" onClick={enter} disabled={entering}>Enter</button>
        </section>
      </div>

      <p className="ied-entry__hint">Move your mouse or finger · select Enter to open the IED Hub</p>
    </main>
  )
}
