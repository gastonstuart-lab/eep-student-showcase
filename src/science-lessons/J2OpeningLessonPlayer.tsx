import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { ScienceLesson } from './data'
import type { LessonSlide } from './types/lesson'
import './j2OpeningLessonPlayer.css'

type SavedClass = { id: string; name: string; slideIndex: number; revealIndex: number }
type FocusMode = 'copy' | 'visual' | null

const STORAGE_KEY = 'science-lessons-j2-opening-classes-v1'

const SOURCE_TERMS: Record<string, string[]> = {
  'j2-ch1-title': ['ATOMS AND BONDING'],
  'j2-ch1-1-title': ['Elements and Atoms'],
  'j2-ch1-1-question-building-blocks': ['elements', 'building blocks of matter'],
  'j2-ch1-1-building-blocks-matter': ['Matter', 'Elements', 'building blocks of matter'],
  'j2-ch1-1-elements-compounds-mixtures': ['ELEMENTS', 'COMPOUNDS', 'MIXTURES', 'compound', 'mixture'],
  'j2-ch1-1-particles-elements': ['atom', 'atomos'],
  'j2-ch1-1-question-theory': ['atomic theory', 'develop', 'change'],
  'j2-ch1-1-theory-models': ['scientific theory', 'Models'],
  'j2-ch1-1-dalton': ['DALTON', 'atomic theory'],
  'j2-ch1-1-thomson': ['THOMSON', 'negatively charged', 'electrons'],
  'j2-ch1-1-rutherford': ['RUTHERFORD', 'nucleus', 'protons'],
  'j2-ch1-1-bohr': ['BOHR', 'energy', 'orbits'],
  'j2-ch1-1-electron-cloud': ['CLOUD OF ELECTRONS', 'electron', 'energy level'],
  'j2-ch1-1-modern-model': ['MODERN ATOMIC MODEL', 'Chadwick', 'neutron'],
  'j2-ch1-1-models-summary': ['Atomic Theory and Models'],
}

const visualKindById: Record<string, string> = {
  'j2-ch1-title': 'chapter',
  'j2-ch1-1-title': 'section',
  'j2-ch1-1-question-building-blocks': 'question-matter',
  'j2-ch1-1-building-blocks-matter': 'matter-elements',
  'j2-ch1-1-elements-compounds-mixtures': 'compare',
  'j2-ch1-1-particles-elements': 'atomos',
  'j2-ch1-1-question-theory': 'question-timeline',
  'j2-ch1-1-theory-models': 'theory-models',
  'j2-ch1-1-dalton': 'dalton',
  'j2-ch1-1-thomson': 'thomson',
  'j2-ch1-1-rutherford': 'rutherford',
  'j2-ch1-1-bohr': 'bohr',
  'j2-ch1-1-electron-cloud': 'cloud',
  'j2-ch1-1-modern-model': 'modern',
  'j2-ch1-1-models-summary': 'modern-summary',
}

function loadClasses(): SavedClass[] {
  if (typeof window === 'undefined') return [{ id: 'default', name: 'J2 Class', slideIndex: 0, revealIndex: 0 }]
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as SavedClass[]
    if (Array.isArray(parsed) && parsed.length) return parsed
  } catch { /* local persistence is optional */ }
  return [{ id: 'default', name: 'J2 Class', slideIndex: 0, revealIndex: 0 }]
}

function saveClasses(classes: SavedClass[]) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(classes)) } catch { /* never block teaching */ }
}

function highlightText(text: string, enabled: boolean, slideId: string): ReactNode {
  const phrases = enabled ? (SOURCE_TERMS[slideId] ?? []).sort((a, b) => b.length - a.length) : []
  if (!phrases.length) return text
  const escaped = phrases.map((phrase) => phrase.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&')).join('|')
  const parts = text.split(new RegExp('(' + escaped + ')', 'gi'))
  return parts.map((part, index) => {
    const active = phrases.some((phrase) => phrase.toLowerCase() === part.toLowerCase())
    return active ? <mark key={part + '-' + index}>{part}</mark> : part
  })
}

function Particle({ className = '' }: { className?: string }) {
  return <span className={'j2-particle ' + className} aria-hidden="true" />
}

function MiniAtom({ label, variant = 'blue' }: { label: string; variant?: string }) {
  return (
    <div className={'j2-mini-atom j2-mini-atom--' + variant} aria-hidden="true">
      <span>{label}</span>
      <i />
      <i />
    </div>
  )
}

function AtomModel({ kind, motion }: { kind: 'rutherford' | 'bohr' | 'cloud' | 'modern'; motion: boolean }) {
  return (
    <div className={'j2-atom-model j2-atom-model--' + kind + (motion ? ' is-motion' : '')}>
      {kind !== 'cloud' && <div className="j2-orbit j2-orbit--a" />}
      {kind === 'bohr' && <div className="j2-orbit j2-orbit--b" />}
      {kind === 'cloud' && <div className="j2-electron-cloud" />}
      <div className="j2-nucleus">
        <span className="j2-proton">p+</span>
        {(kind === 'modern') && <span className="j2-neutron">n</span>}
        {(kind === 'modern') && <span className="j2-proton j2-proton--2">p+</span>}
        {(kind === 'modern') && <span className="j2-neutron j2-neutron--2">n</span>}
      </div>
      <Particle className="j2-electron j2-electron--1" />
      <Particle className="j2-electron j2-electron--2" />
      {(kind === 'bohr' || kind === 'cloud' || kind === 'modern') && <Particle className="j2-electron j2-electron--3" />}
      {kind === 'modern' && <div className="j2-modern-labels"><span>nucleus</span><span>electron cloud</span></div>}
    </div>
  )
}

function HistoryRail({ active = '' }: { active?: string }) {
  const people = [
    ['Democritus', 'tiny pieces'],
    ['Dalton', 'atomic theory'],
    ['Thomson', 'electrons'],
    ['Rutherford', 'nucleus'],
    ['Bohr', 'energy levels'],
    ['Chadwick', 'neutrons'],
  ]
  return (
    <div className="j2-history-rail">
      {people.map(([name, detail], index) => (
        <div className={'j2-history-step' + (active.toLowerCase() === name.toLowerCase() ? ' is-active' : '')} key={name}>
          <b>{index + 1}</b><strong>{name}</strong><span>{detail}</span>
        </div>
      ))}
    </div>
  )
}

function J2SourceVisual({ slide, motion }: { slide: LessonSlide; motion: boolean }) {
  const kind = visualKindById[slide.id] ?? 'modern'
  const motionClass = motion ? ' is-motion' : ''

  if (kind === 'chapter') return (
    <div className={'j2-source-visual j2-source-visual--chapter' + motionClass}>
      <div className="j2-hero-atom" aria-hidden="true">
        <div className="j2-hero-orbit j2-hero-orbit--a"><Particle /></div>
        <div className="j2-hero-orbit j2-hero-orbit--b"><Particle /></div>
        <div className="j2-hero-orbit j2-hero-orbit--c"><Particle /></div>
        <div className="j2-hero-nucleus"><span>p+</span><span>n</span><span>p+</span><span>n</span></div>
      </div>
      <div className="j2-hero-formulas" aria-hidden="true"><span>H₂O</span><span>CO₂</span><span>NaCl</span><span>O₂</span></div>
      <div className="j2-source-chapter-caption">REACTIONS INVOLVE THE CHEMICAL CHANGE OF ATOMS AND MOLECULES.</div>
    </div>
  )

  if (kind === 'section') return (
    <div className={'j2-source-visual j2-source-visual--section' + motionClass}>
      <div className="j2-element-grid" aria-label="Example element tiles">
        <div><b>1</b><strong>H</strong><span>Hydrogen</span></div>
        <div><b>6</b><strong>C</strong><span>Carbon</span></div>
        <div><b>8</b><strong>O</strong><span>Oxygen</span></div>
        <div><b>11</b><strong>Na</strong><span>Sodium</span></div>
      </div>
      <div className="j2-section-atom"><AtomModel kind="modern" motion={motion} /></div>
      <div className="j2-section-concepts" aria-label="Source concepts">
        <span>Atoms</span><span>Molecules</span><span>Matter</span><span>Elements</span><span>Compounds</span>
      </div>
    </div>
  )

  if (kind === 'question-matter') return (
    <div className={'j2-source-visual j2-source-visual--question-matter' + motionClass}>
      <div className="j2-matter-zoom">
        <div className="j2-matter-object"><span>MATTER</span></div>
        <b>→</b>
        <div className="j2-particle-cluster"><Particle /><Particle /><Particle /><Particle /><Particle /></div>
        <b>→</b>
        <div className="j2-question-atom"><MiniAtom label="?" variant="lime" /></div>
      </div>
      <div className="j2-question-stamp">BUILDING BLOCKS?</div>
    </div>
  )

  if (kind === 'matter-elements') return (
    <div className={'j2-source-visual j2-source-visual--matter-elements' + motionClass}>
      <div className="j2-matter-map">
        <div className="j2-matter-map__matter"><strong>MATTER</strong><span>mass + takes up space</span></div>
        <div className="j2-map-arrow">↓</div>
        <div className="j2-matter-map__elements"><strong>ELEMENTS</strong><span>simplest pure substances</span></div>
        <div className="j2-element-atoms"><MiniAtom label="H" /><MiniAtom label="C" variant="lime" /><MiniAtom label="O" variant="violet" /></div>
      </div>
    </div>
  )

  if (kind === 'compare') return (
    <div className={'j2-source-visual j2-source-visual--compare' + motionClass}>
      <div className="j2-compare-card">
        <span className="j2-compare-kicker">ELEMENT</span>
        <div className="j2-particle-row"><MiniAtom label="O" /><MiniAtom label="O" /><MiniAtom label="O" /></div>
        <strong>one type of atom</strong>
      </div>
      <div className="j2-compare-card">
        <span className="j2-compare-kicker">COMPOUND</span>
        <div className="j2-molecule-row"><MiniAtom label="H" /><MiniAtom label="O" variant="violet" /><MiniAtom label="H" /></div>
        <strong>chemically combined</strong>
      </div>
      <div className="j2-compare-card">
        <span className="j2-compare-kicker">MIXTURE</span>
        <div className="j2-mixture-row"><MiniAtom label="C" variant="lime" /><MiniAtom label="O" /><MiniAtom label="H" variant="violet" /></div>
        <strong>together, not chemically combined</strong>
      </div>
    </div>
  )

  if (kind === 'atomos') return (
    <div className={'j2-source-visual j2-source-visual--atomos' + motionClass}>
      <div className="j2-atomos-zoom">
        <div className="j2-big-element"><span>ELEMENT</span><strong>Au</strong></div>
        <b>ZOOM</b>
        <div className="j2-single-atom"><MiniAtom label="ATOM" variant="lime" /></div>
      </div>
      <div className="j2-atomos-quote"><strong>atomos</strong><span>“cannot be cut”</span></div>
    </div>
  )

  if (kind === 'question-timeline') return (
    <div className={'j2-source-visual j2-source-visual--question-history' + motionClass}>
      <HistoryRail />
      <div className="j2-history-question">?</div>
    </div>
  )

  if (kind === 'theory-models') return (
    <div className={'j2-source-visual j2-source-visual--theory' + motionClass}>
      <div className="j2-theory-card"><span>THEORY</span><strong>well-tested idea</strong><small>explains + connects observations</small></div>
      <div className="j2-model-card"><span>MODEL</span><strong>representation</strong><small>helps us understand what we cannot see</small></div>
      <div className="j2-model-types"><i>physical</i><i>mental</i><i>visual</i></div>
    </div>
  )

  if (kind === 'dalton') return (
    <div className={'j2-source-visual j2-source-visual--scientist' + motionClass}>
      <HistoryRail active="Dalton" />
      <div className="j2-scientist-model j2-dalton-model"><div className="j2-solid-sphere" /><strong>ATOM</strong><span>Dalton model</span></div>
    </div>
  )

  if (kind === 'thomson') return (
    <div className={'j2-source-visual j2-source-visual--scientist' + motionClass}>
      <HistoryRail active="Thomson" />
      <div className="j2-scientist-model j2-thomson-model">
        <div className="j2-positive-sphere"><Particle /><Particle /><Particle /><span>+</span><span>+</span><span>+</span></div>
        <strong>NEGATIVE PARTICLES</strong><span>electrons</span>
      </div>
    </div>
  )

  if (kind === 'rutherford') return (
    <div className={'j2-source-visual j2-source-visual--scientist' + motionClass}>
      <HistoryRail active="Rutherford" />
      <div className="j2-scientist-atom"><AtomModel kind="rutherford" motion={motion} /></div>
      <div className="j2-discovery-label"><strong>NUCLEUS</strong><span>tiny positive center</span><b>p+ protons</b></div>
    </div>
  )

  if (kind === 'bohr') return (
    <div className={'j2-source-visual j2-source-visual--scientist' + motionClass}>
      <HistoryRail active="Bohr" />
      <div className="j2-scientist-atom"><AtomModel kind="bohr" motion={motion} /></div>
      <div className="j2-energy-labels"><span>energy level 1</span><span>energy level 2</span></div>
    </div>
  )

  if (kind === 'cloud') return (
    <div className={'j2-source-visual j2-source-visual--scientist' + motionClass}>
      <HistoryRail />
      <div className="j2-scientist-atom"><AtomModel kind="cloud" motion={motion} /></div>
      <div className="j2-cloud-note"><strong>NOT fixed orbits</strong><span>electrons can be anywhere in a cloud around the nucleus</span></div>
    </div>
  )

  if (kind === 'modern') return (
    <div className={'j2-source-visual j2-source-visual--scientist' + motionClass}>
      <HistoryRail active="Chadwick" />
      <div className="j2-scientist-atom"><AtomModel kind="modern" motion={motion} /></div>
      <div className="j2-modern-key"><span><b>p+</b> proton</span><span><b>n</b> neutron</span><span><b>−</b> electron</span></div>
    </div>
  )

  if (kind === 'modern-summary') return (
    <div className={'j2-source-visual j2-source-visual--modern-summary' + motionClass}>
      <div className="j2-modern-summary__atom"><AtomModel kind="modern" motion={motion} /></div>
      <div className="j2-modern-summary__legend">
        <strong>MODERN MODEL OF THE ATOM</strong>
        <span><b className="is-proton">p+</b> protons · positive charge · nucleus</span>
        <span><b className="is-neutron">n</b> neutrons · neutral · nucleus</span>
        <span><b className="is-electron">−</b> electrons · negative charge · electron cloud</span>
      </div>
    </div>
  )

  return (
    <div className={'j2-source-visual j2-source-visual--timeline' + motionClass}>
      <HistoryRail />
      <div className="j2-timeline-message"><strong>NEW EVIDENCE</strong><b>→</b><strong>BETTER MODEL</strong></div>
    </div>
  )
}

export function J2OpeningLessonPlayer({ lesson, onBack }: { lesson: ScienceLesson; onBack: () => void }) {
  const initial = loadClasses()
  const [classes, setClasses] = useState<SavedClass[]>(initial)
  const [activeClassId, setActiveClassId] = useState(initial[0]?.id ?? 'default')
  const activeClass = classes.find((item) => item.id === activeClassId) ?? classes[0]
  const [slideIndex, setSlideIndex] = useState(activeClass?.slideIndex ?? 0)
  const [revealIndex, setRevealIndex] = useState(activeClass?.revealIndex ?? 0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showChinese, setShowChinese] = useState(false)
  const [highlights, setHighlights] = useState(true)
  const [motion, setMotion] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [focusMode, setFocusMode] = useState<FocusMode>(null)

  const slide = lesson.slides[slideIndex] ?? lesson.slides[0]
  const reveals = slide.reveals ?? []
  const visibleReveals = reveals.slice(0, revealIndex)
  const isQuestion = slide.layout === 'question' || slide.id.includes('question-')
  const kind = visualKindById[slide.id] ?? 'modern'

  const persistPosition = (nextSlideIndex: number, nextRevealIndex: number) => {
    setClasses((current) => {
      const nextClasses = current.map((item) => item.id === activeClassId
        ? { ...item, slideIndex: nextSlideIndex, revealIndex: nextRevealIndex }
        : item)
      saveClasses(nextClasses)
      return nextClasses
    })
  }

  const goToPosition = (nextSlideIndex: number, nextRevealIndex: number) => {
    setSlideIndex(nextSlideIndex)
    setRevealIndex(nextRevealIndex)
    persistPosition(nextSlideIndex, nextRevealIndex)
  }

  const next = () => {
    if (revealIndex < reveals.length) return goToPosition(slideIndex, revealIndex + 1)
    if (slideIndex < lesson.slides.length - 1) goToPosition(slideIndex + 1, 0)
  }

  const previous = () => {
    if (revealIndex > 0) return goToPosition(slideIndex, revealIndex - 1)
    if (slideIndex > 0) {
      const nextIndex = slideIndex - 1
      goToPosition(nextIndex, lesson.slides[nextIndex].reveals?.length ?? 0)
    }
  }

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault()
        if (revealIndex < reveals.length) goToPosition(slideIndex, revealIndex + 1)
        else if (slideIndex < lesson.slides.length - 1) goToPosition(slideIndex + 1, 0)
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault()
        if (revealIndex > 0) goToPosition(slideIndex, revealIndex - 1)
        else if (slideIndex > 0) {
          const nextIndex = slideIndex - 1
          goToPosition(nextIndex, lesson.slides[nextIndex].reveals?.length ?? 0)
        }
      }
      if (event.key === 'Escape') {
        setFocusMode(null)
        setDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', syncFullscreen)
    return () => document.removeEventListener('fullscreenchange', syncFullscreen)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen?.()
      else await document.documentElement.requestFullscreen?.()
    } catch {
      setIsFullscreen((value) => !value)
    }
  }

  const switchClass = (id: string) => {
    const chosen = classes.find((item) => item.id === id)
    if (!chosen) return
    setActiveClassId(id)
    setSlideIndex(Math.min(chosen.slideIndex, lesson.slides.length - 1))
    setRevealIndex(chosen.revealIndex)
  }

  const createClass = () => {
    const name = newClassName.trim()
    if (!name) return
    const created: SavedClass = { id: 'class-' + Date.now(), name, slideIndex: 0, revealIndex: 0 }
    const nextClasses = [...classes, created]
    setClasses(nextClasses)
    saveClasses(nextClasses)
    setActiveClassId(created.id)
    setNewClassName('')
    setSlideIndex(0)
    setRevealIndex(0)
  }

  const goToSlide = (index: number) => {
    goToPosition(index, 0)
    setDrawerOpen(false)
  }

  const isSectionTitle = slide.id === 'j2-ch1-1-title'
  const titleText = isQuestion ? slide.body.en : isSectionTitle ? slide.body.en : slide.title.en
  const bodyText = isQuestion || isSectionTitle || slide.id === 'j2-ch1-1-models-summary' ? '' : slide.body.en

  return (
    <main className={'j2-source-player' + (motion ? ' j2-source-player--motion' : '') + (isFullscreen ? ' j2-source-player--fullscreen' : '')}>
      <div className="j2-source-topline">
        <button type="button" className="j2-source-back" onClick={onBack} aria-label="Return to lesson library">←</button>
        <div><strong>{lesson.title}</strong><span>{activeClass?.name ?? 'J2 Class'} · Slide {slideIndex + 1}/{lesson.slides.length}</span></div>
      </div>

      <button className="j2-source-drawer-tab" type="button" onClick={() => setDrawerOpen((value) => !value)} aria-label="Open teacher tools">{drawerOpen ? '‹' : '›'}</button>

      <article className={'j2-source-slide j2-source-slide--' + kind}>
        <div className="j2-source-slide__visual-wrap" onClick={() => setFocusMode('visual')} role="button" tabIndex={0} aria-label="Expand slide visual">
          <J2SourceVisual slide={slide} motion={motion} />
        </div>

        <section className={'j2-source-copy' + (isQuestion ? ' j2-source-copy--question' : '')} onClick={() => setFocusMode('copy')} role="button" tabIndex={0} aria-label="Expand slide text">
          <span className="j2-source-kicker">{isQuestion ? 'QUESTION OF THE DAY!!' : isSectionTitle ? slide.title.en : slideIndex === 0 ? 'CHAPTER 1' : 'CHAPTER 1 · SECTION 1'}</span>
          <h1>{highlightText(titleText, highlights, slide.id)}</h1>
          {bodyText && <p className="j2-source-main-copy">{highlightText(bodyText, highlights, slide.id)}</p>}
          {visibleReveals.length > 0 && <div className="j2-source-reveals">{visibleReveals.map((item) => <p key={item.id}>{highlightText(item.text.en, highlights, slide.id)}</p>)}</div>}
        </section>

        {showChinese && (
          <aside className={'j2-source-chinese' + (isQuestion ? ' j2-source-chinese--question' : '')} lang="zh-Hant">
            <span>繁體中文支援</span>
            <strong>{isQuestion ? slide.body.zhHant : slide.title.zhHant}</strong>
            {!isQuestion && slide.body.zhHant && <p>{slide.body.zhHant}</p>}
            {visibleReveals.length > 0 && <div>{visibleReveals.map((item) => <em key={item.id}>{item.text.zhHant}</em>)}</div>}
          </aside>
        )}

        <div className="j2-source-controls">
          <button type="button" className={highlights ? 'is-on' : ''} onClick={() => setHighlights((value) => !value)} aria-label="Toggle highlights"><span>💡</span><small>Highlight</small></button>
          <button type="button" className={showChinese ? 'is-on' : ''} onClick={() => setShowChinese((value) => !value)} aria-label="Toggle Traditional Chinese support"><span>中文</span><small>Chinese</small></button>
          <button type="button" className={motion ? 'is-on' : ''} onClick={() => setMotion((value) => !value)} aria-label="Toggle slide motion"><span>{motion ? '⏸' : '▶'}</span><small>Motion</small></button>
          <button type="button" className={isFullscreen ? 'is-on' : ''} onClick={() => void toggleFullscreen()} aria-label="Toggle full screen"><span>⛶</span><small>Full screen</small></button>
        </div>
      </article>

      <div className="j2-source-nav">
        <button type="button" onClick={previous} disabled={slideIndex === 0 && revealIndex === 0}>←</button>
        <span>{reveals.length ? 'Reveal ' + revealIndex + '/' + reveals.length : 'Ready'}</span>
        <button type="button" onClick={next} disabled={slideIndex === lesson.slides.length - 1 && revealIndex === reveals.length}>→</button>
      </div>

      <aside className={'j2-source-drawer' + (drawerOpen ? ' is-open' : '')} aria-label="Teacher tools">
        <div className="j2-source-drawer__header"><div><strong>Teacher tools</strong><span>Hidden during normal teaching</span></div><button type="button" onClick={() => setDrawerOpen(false)}>×</button></div>
        <section>
          <label htmlFor="j2-class-select">Class</label>
          <select id="j2-class-select" value={activeClassId} onChange={(event) => switchClass(event.target.value)}>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <div className="j2-source-new-class"><input value={newClassName} onChange={(event) => setNewClassName(event.target.value)} placeholder="Name a new class" /><button type="button" onClick={createClass}>Add</button></div>
          <small>Each class remembers its own slide and reveal position on this browser.</small>
        </section>
        <section className="j2-source-drawer-toggles">
          <button className={highlights ? 'is-on' : ''} type="button" onClick={() => setHighlights((value) => !value)}>Highlights</button>
          <button className={showChinese ? 'is-on' : ''} type="button" onClick={() => setShowChinese((value) => !value)}>中文 support</button>
          <button className={motion ? 'is-on' : ''} type="button" onClick={() => setMotion((value) => !value)}>Motion {motion ? 'on' : 'off'}</button>
          <button type="button" onClick={() => goToPosition(slideIndex, reveals.length)}>Show all</button>
        </section>
        <section><strong>Jump to source slide</strong><div className="j2-source-thumbs">{lesson.slides.map((item, index) => <button className={index === slideIndex ? 'is-current' : ''} key={item.id} type="button" onClick={() => goToSlide(index)}><b>{index + 1}</b><span>{item.title.en || item.body.en}</span></button>)}</div></section>
        <section><strong>Teacher note</strong><p>{slide.teacherNote}</p></section>
        <section><strong>Lesson resources</strong><a href="https://docs.google.com/presentation/d/14AUxNBq96_rRR9exiieSsHBdvuth4ofh/edit" target="_blank" rel="noreferrer">Open source J2 PowerPoint</a></section>
        <footer>Curriculum order and wording follow J2 PPT (updated).pptx. Visuals are explanatory enhancements, not replacement content.</footer>
      </aside>

      {focusMode && <div className="j2-source-focus" role="dialog" aria-modal="true" aria-label={focusMode === 'copy' ? 'Expanded slide text' : 'Expanded slide visual'}>
        <button className="j2-source-focus__close" type="button" onClick={() => setFocusMode(null)}>Close ×</button>
        {focusMode === 'visual'
          ? <div className="j2-source-focus__visual"><J2SourceVisual slide={slide} motion={motion} /></div>
          : <div className="j2-source-focus__copy"><span className="j2-source-kicker">{isQuestion ? 'QUESTION OF THE DAY!!' : slide.title.en}</span><h2>{highlightText(titleText, highlights, slide.id)}</h2>{bodyText && <p>{highlightText(bodyText, highlights, slide.id)}</p>}{visibleReveals.map((item) => <p key={item.id}>{highlightText(item.text.en, highlights, slide.id)}</p>)}{showChinese && <div className="j2-source-focus__zh" lang="zh-Hant"><strong>{isQuestion ? slide.body.zhHant : slide.title.zhHant}</strong>{!isQuestion && slide.body.zhHant && <p>{slide.body.zhHant}</p>}</div>}</div>}
      </div>}
    </main>
  )
}
