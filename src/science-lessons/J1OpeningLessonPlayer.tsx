import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ScienceLesson } from './data'
import type { LessonSlide } from './types/lesson'
import './j1OpeningLessonPlayer.css'

type SavedClass = { id: string; name: string; slideIndex: number; revealIndex: number }
type FocusMode = 'copy' | 'visual' | null

const STORAGE_KEY = 'science-lessons-j1-opening-classes-v1'

const asset = (name: string) => `${import.meta.env.BASE_URL}science-lessons/j1-opening/${name}`

const IMAGES = {
  pond: asset('pond.webp'),
  polarBear: asset('polar.webp'),
  elephants: asset('elephants.webp'),
  coral: asset('coral.webp'),
  bear: asset('bear-stream.webp'),
  wolf: asset('wolf-stream.webp'),
  sunlight: asset('pond.webp'),
  soil: asset('pond.webp'),
}

const STUDENT_REVEAL_EXCLUSIONS = new Set(['habitat-needs', 'abiotic-role'])
const HIGHLIGHT_TERMS = ['abiotic factors','biotic factors','living parts','nonliving parts','food','water','shelter','organism','environment','habitat','sunlight','oxygen','temperature','soil','species','population','community','ecosystem','ecology']

const visualKindById: Record<string, string> = {
  'j1-ch1-1-title':'title','j1-ch1-1-question-needs':'question-pond','j1-ch1-1-habitats':'habitats',
  'j1-ch1-1-question-parts':'question-wolf','j1-ch1-1-abiotic-overview':'abiotic','j1-ch1-1-biotic-factors':'biotic',
  'j1-ch1-1-water':'water','j1-ch1-1-sunlight':'sunlight','j1-ch1-1-oxygen':'oxygen','j1-ch1-1-temperature':'temperature',
  'j1-ch1-1-soil':'soil','j1-ch1-1-question-levels':'question-levels','j1-ch1-1-populations':'population',
  'j1-ch1-1-communities':'community','j1-ch1-1-ecosystems':'ecosystem',
}

const zhSupport: Record<string, string> = {
  'j1-ch1-1-title':'生物與環境',
  'j1-ch1-1-question-needs':'生物的環境會滿足哪些需求？',
  'j1-ch1-1-habitats':'棲地會提供生物生存、生長和繁殖所需的條件。',
  'j1-ch1-1-question-parts':'生物在棲地中會與哪兩個部分互動？',
  'j1-ch1-1-abiotic-overview':'非生物因子是棲地中沒有生命的部分。',
  'j1-ch1-1-biotic-factors':'生物因子是棲地中有生命的部分。',
  'j1-ch1-1-water':'所有生物都需要水才能生存。',
  'j1-ch1-1-sunlight':'植物進行光合作用需要陽光。',
  'j1-ch1-1-oxygen':'大多數生物需要氧氣才能生存。',
  'j1-ch1-1-temperature':'溫度會影響哪些生物能在一個地方生存。',
  'j1-ch1-1-soil':'土壤類型會影響一個地區能生活的生物。',
  'j1-ch1-1-question-levels':'生態系中的組織層次有哪些？',
  'j1-ch1-1-populations':'同一地區中同一物種的所有成員稱為族群。',
  'j1-ch1-1-communities':'生活在同一地區的所有不同族群組成群落。',
  'j1-ch1-1-ecosystems':'生態系包含生物群落和周圍的非生物環境。',
}

function loadClasses(): SavedClass[] {
  if (typeof window === 'undefined') return [{ id:'default', name:'J1 Class', slideIndex:0, revealIndex:0 }]
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as SavedClass[]
    if (Array.isArray(parsed) && parsed.length) return parsed
  } catch { /* local persistence is optional */ }
  return [{ id:'default', name:'J1 Class', slideIndex:0, revealIndex:0 }]
}

function saveClasses(classes: SavedClass[]) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(classes)) } catch { /* never block teaching */ }
}

function highlightText(text: string, enabled: boolean): ReactNode {
  if (!enabled) return text
  const escaped = HIGHLIGHT_TERMS.map((term) => term.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&')).join('|')
  const pieces = text.split(new RegExp('(' + escaped + ')', 'gi'))
  return pieces.map((piece, index) => HIGHLIGHT_TERMS.some((term) => term.toLowerCase() === piece.toLowerCase())
    ? <mark key={piece + '-' + index}>{piece}</mark>
    : piece)
}

function slideReveals(slide: LessonSlide) {
  return (slide.reveals ?? []).filter((item) => !STUDENT_REVEAL_EXCLUSIONS.has(item.id))
}

function J1GoldVisual({ slide, motion }: { slide: LessonSlide; motion: boolean }) {
  const kind = visualKindById[slide.id] ?? 'ecosystem'
  const cls = motion ? ' is-motion' : ''

  if (kind === 'title') return (
    <div className={'j1-gold-visual j1-gold-visual--title' + cls}>
      <img className="j1-gold-bg" src={IMAGES.pond} alt="Duck and turtle sharing a pond habitat" />
      <div className="j1-gold-animal-orbs">
        <img src={IMAGES.polarBear} alt="Polar bear in an icy habitat" />
        <img src={IMAGES.elephants} alt="Elephants at a watering hole" />
        <img src={IMAGES.coral} alt="Fish in a coral reef habitat" />
      </div>
    </div>
  )

  if (kind.startsWith('question-')) {
    const src = kind === 'question-pond' ? IMAGES.pond : kind === 'question-wolf' ? IMAGES.bear : IMAGES.sunlight
    return <div className={'j1-gold-visual j1-gold-visual--question' + cls}><img className="j1-gold-bg" src={src} alt="Habitat scene" /><span className="j1-gold-question-mark">?</span></div>
  }

  if (kind === 'habitats') return (
    <div className={'j1-gold-collage' + cls}>
      <figure className="j1-gold-collage__hero"><img src={IMAGES.polarBear} alt="Polar bear on sea ice" /><figcaption>Polar habitat</figcaption></figure>
      <figure><img src={IMAGES.elephants} alt="Elephants at a watering hole" /><figcaption>Watering hole</figcaption></figure>
      <figure><img src={IMAGES.coral} alt="Fish living in a coral reef" /><figcaption>Coral reef</figcaption></figure>
    </div>
  )

  if (kind === 'abiotic') {
    const factors = [['💧','Water'],['☀','Sunlight'],['O₂','Oxygen'],['🌡','Temperature'],['🌱','Soil']]
    return (
      <div className={'j1-gold-factor-scene' + cls}>
        <img className="j1-gold-bg" src={IMAGES.sunlight} alt="Forest showing nonliving environmental conditions" />
        <div className="j1-gold-factor-hub">
          <strong>Nonliving parts<br />of a habitat</strong>
          {factors.map(([icon,label], index) => <span className={'j1-gold-factor j1-gold-factor--' + (index + 1)} key={label}><b>{icon}</b><em>{label}</em></span>)}
        </div>
      </div>
    )
  }

  if (kind === 'biotic') return (
    <div className={'j1-gold-visual j1-gold-visual--biotic' + cls}>
      <img className="j1-gold-bg" src={IMAGES.wolf} alt="Gray wolf in a natural habitat" />
      <div className="j1-gold-biotic-pictures" aria-hidden="true">
        <figure><img src={IMAGES.coral} alt="" /><figcaption>fish</figcaption></figure>
        <figure><img src={IMAGES.pond} alt="" /><figcaption>plants</figcaption></figure>
      </div>
      <div className="j1-gold-biotic-tags"><span>Animals</span><span>Plants</span><span>Birds</span><span>Fish</span><span>Seeds</span></div>
    </div>
  )

  if (kind === 'water' || kind === 'sunlight') {
    const src = kind === 'water' ? IMAGES.pond : IMAGES.sunlight
    const symbol = kind === 'water' ? 'H₂O' : '☀'
    const caption = kind === 'water' ? 'photosynthesis · bodies · survival' : 'Sunlight → photosynthesis'
    return <div className={'j1-gold-visual j1-gold-visual--' + kind + cls}><img className="j1-gold-bg" src={src} alt={kind + ' in a habitat'} /><div className="j1-gold-big-symbol">{symbol}</div><div className="j1-gold-visual-caption">{caption}</div></div>
  }

  if (kind === 'oxygen') return (
    <div className={'j1-gold-oxygen' + cls}>
      <div className="j1-gold-oxygen__air"><strong>O₂</strong><span>Land organisms get oxygen from the air.</span></div>
      <div className="j1-gold-oxygen__water"><img src={IMAGES.coral} alt="Fish in oxygenated water" /><span>Water organisms use oxygen dissolved in water.</span></div>
    </div>
  )

  if (kind === 'temperature') return (
    <div className={'j1-gold-temperature' + cls}>
      <div><img src={IMAGES.polarBear} alt="Polar bear in a cold habitat" /><strong>COLD</strong></div>
      <div><img src={IMAGES.elephants} alt="Elephants in a warm habitat" /><strong>HOT</strong></div>
      <span className="j1-gold-thermometer">🌡</span>
    </div>
  )

  if (kind === 'soil') return (
    <div className={'j1-gold-soil' + cls}>
      <img src={IMAGES.soil} alt="Seedling growing from soil" />
      <div className="j1-gold-soil-layers"><span>rock pieces</span><span>nutrients</span><span>air</span><span>water</span><span>decaying remains</span></div>
    </div>
  )

  if (kind === 'population' || kind === 'community') {
    const src = kind === 'population' ? IMAGES.elephants : IMAGES.coral
    const label = kind === 'population' ? 'POPULATION' : 'COMMUNITY'
    const caption = kind === 'population' ? 'one species · one area' : 'different populations together'
    return <div className={'j1-gold-organisation' + cls}><img className="j1-gold-bg" src={src} alt={label} /><div className="j1-gold-organisation-card"><strong>{label}</strong><span>{caption}</span></div></div>
  }

  return <div className={'j1-gold-organisation' + cls}><img className="j1-gold-bg" src={IMAGES.sunlight} alt="Forest ecosystem" /><div className="j1-gold-ecosystem-flow"><span>community</span><b>+</b><span>nonliving surroundings</span><b>=</b><strong>ECOSYSTEM</strong></div></div>
}

export function J1OpeningLessonPlayer({ lesson, onBack }: { lesson: ScienceLesson; onBack: () => void }) {
  const [classes, setClasses] = useState<SavedClass[]>(() => loadClasses())
  const [activeClassId, setActiveClassId] = useState(() => loadClasses()[0]?.id ?? 'default')
  const activeClass = classes.find((item) => item.id === activeClassId) ?? classes[0]
  const [slideIndex, setSlideIndex] = useState(() => activeClass?.slideIndex ?? 0)
  const [revealIndex, setRevealIndex] = useState(() => activeClass?.revealIndex ?? 0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showChinese, setShowChinese] = useState(false)
  const [highlights, setHighlights] = useState(true)
  const [motion, setMotion] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [focusMode, setFocusMode] = useState<FocusMode>(null)
  const stageRef = useRef<HTMLElement>(null)

  const slide = lesson.slides[slideIndex] ?? lesson.slides[0]
  const reveals = slideReveals(slide)
  const visibleReveals = reveals.slice(0, revealIndex)
  const isQuestion = slide.id.includes('question-')
  const kind = visualKindById[slide.id] ?? 'ecosystem'

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
    if (revealIndex < reveals.length) {
      goToPosition(slideIndex, revealIndex + 1)
      return
    }
    if (slideIndex < lesson.slides.length - 1) goToPosition(slideIndex + 1, 0)
  }

  const previous = () => {
    if (revealIndex > 0) {
      goToPosition(slideIndex, revealIndex - 1)
      return
    }
    if (slideIndex > 0) {
      const nextIndex = slideIndex - 1
      goToPosition(nextIndex, slideReveals(lesson.slides[nextIndex]).length)
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
          goToPosition(nextIndex, slideReveals(lesson.slides[nextIndex]).length)
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

  const switchClass = (id: string) => {
    const nextClass = classes.find((item) => item.id === id)
    if (!nextClass) return
    setActiveClassId(id)
    setSlideIndex(Math.min(nextClass.slideIndex, lesson.slides.length - 1))
    setRevealIndex(nextClass.revealIndex)
  }

  const createClass = () => {
    const name = newClassName.trim()
    if (!name) return
    const created: SavedClass = { id:'class-' + Date.now(), name, slideIndex:0, revealIndex:0 }
    const nextClasses = [...classes, created]
    setClasses(nextClasses); saveClasses(nextClasses); setNewClassName(''); setActiveClassId(created.id); setSlideIndex(0); setRevealIndex(0)
  }

  const goToSlide = (index: number) => { goToPosition(index, 0); setDrawerOpen(false) }
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen?.()
    else await stageRef.current?.requestFullscreen?.()
  }

  return (
    <main className={'j1-gold-player' + (motion ? ' j1-gold-player--motion' : '')} ref={stageRef}>
      <div className="j1-gold-topline">
        <button type="button" className="j1-gold-back" onClick={onBack} aria-label="Return to lesson library">←</button>
        <div><strong>{lesson.title}</strong><span>{activeClass?.name ?? 'J1 Class'} · Slide {slideIndex + 1}/{lesson.slides.length}</span></div>
      </div>

      <button className="j1-gold-drawer-tab" type="button" onClick={() => setDrawerOpen((value) => !value)} aria-label="Open teacher tools">{drawerOpen ? '‹' : '›'}</button>

      <article className={'j1-gold-slide j1-gold-slide--' + kind}>
        <div className="j1-gold-slide__visual-wrap" onClick={() => setFocusMode('visual')} role="button" tabIndex={0} aria-label="Expand slide visual"><J1GoldVisual slide={slide} motion={motion} /></div>
        <section className={'j1-gold-copy' + (isQuestion ? ' j1-gold-copy--question' : '')} onClick={() => setFocusMode('copy')} role="button" tabIndex={0} aria-label="Expand slide text">
          <span className="j1-gold-kicker">{isQuestion ? 'QUESTION OF THE DAY' : slideIndex === 0 ? 'Chapter 1 · Section 1' : 'J1 · Slide ' + (slideIndex + 1)}</span>
          <h1>{highlightText(slideIndex === 0 ? 'LIVING THINGS & THE ENVIRONMENT' : isQuestion ? slide.body.en : slide.title.en, highlights)}</h1>
          {!isQuestion && <p className="j1-gold-main-copy">{highlightText(slideIndex === 0 ? 'Habitats and ecosystems' : slide.body.en, highlights)}</p>}
          {visibleReveals.length > 0 && <div className="j1-gold-reveals">{visibleReveals.map((item) => <p key={item.id}>{highlightText(item.text.en, highlights)}</p>)}</div>}
          {showChinese && <div className="j1-gold-translation" lang="zh-Hant">{zhSupport[slide.id] ?? slide.body.zhHant}</div>}
        </section>

        {slideIndex === 0 && <div className="j1-gold-bottom-message">Living things depend on the environment to live, grow, and reproduce.</div>}

        <div className="j1-gold-slide-controls">
          <button type="button" className={highlights ? 'is-on' : ''} onClick={() => setHighlights((value) => !value)} aria-label="Toggle highlights"><span>💡</span><small>Highlight</small></button>
          <button type="button" className={showChinese ? 'is-on' : ''} onClick={() => setShowChinese((value) => !value)} aria-label="Toggle Traditional Chinese support"><span>中文</span><small>Chinese</small></button>
          <button type="button" onClick={() => void toggleFullscreen()} aria-label="Toggle full screen"><span>⛶</span><small>Full screen</small></button>
        </div>
      </article>

      <div className="j1-gold-nav">
        <button type="button" onClick={previous} disabled={slideIndex === 0 && revealIndex === 0}>←</button>
        <span>{reveals.length > 0 ? 'Reveal ' + revealIndex + '/' + reveals.length : 'Ready'}</span>
        <button type="button" onClick={next} disabled={slideIndex === lesson.slides.length - 1 && revealIndex === reveals.length}>→</button>
      </div>

      <aside className={'j1-gold-drawer' + (drawerOpen ? ' is-open' : '')} aria-label="Teacher tools">
        <div className="j1-gold-drawer__header"><div><strong>Teacher tools</strong><span>Hidden during normal teaching</span></div><button type="button" onClick={() => setDrawerOpen(false)}>×</button></div>
        <section>
          <label htmlFor="j1-class-select">Class</label>
          <select id="j1-class-select" value={activeClassId} onChange={(event) => switchClass(event.target.value)}>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <div className="j1-gold-new-class"><input value={newClassName} onChange={(event) => setNewClassName(event.target.value)} placeholder="Name a new class" /><button type="button" onClick={createClass}>Add</button></div>
          <small>Each class remembers its own slide and reveal position on this browser.</small>
        </section>
        <section className="j1-gold-drawer-toggles">
          <button className={highlights ? 'is-on' : ''} type="button" onClick={() => setHighlights((value) => !value)}>Highlights</button>
          <button className={showChinese ? 'is-on' : ''} type="button" onClick={() => setShowChinese((value) => !value)}>中文 support</button>
          <button className={motion ? 'is-on' : ''} type="button" onClick={() => setMotion((value) => !value)}>Motion {motion ? 'on' : 'off'}</button>
          <button type="button" onClick={() => setRevealIndex(reveals.length)}>Show all</button>
        </section>
        <section><strong>Jump to slide</strong><div className="j1-gold-thumbs">{lesson.slides.map((item, index) => <button className={index === slideIndex ? 'is-current' : ''} key={item.id} type="button" onClick={() => goToSlide(index)}><b>{index + 1}</b><span>{item.title.en}</span></button>)}</div></section>
        <section><strong>Teacher note</strong><p>{slide.teacherNote}</p></section>
        <section><strong>Lesson resources</strong><a href="https://docs.google.com/presentation/d/1STwllX6-z931Hsqst_A1FvN7xwLCVI0g/edit" target="_blank" rel="noreferrer">Open source J1 PowerPoint</a></section>
        <footer>Visual photo sources include Unsplash, U.S. Fish & Wildlife Service and Wikimedia Commons. The source PPT remains the curriculum authority.</footer>
      </aside>

      {focusMode && <div className="j1-gold-focus" role="dialog" aria-modal="true" aria-label={focusMode === 'copy' ? 'Expanded slide text' : 'Expanded slide visual'}>
        <button className="j1-gold-focus__close" type="button" onClick={() => setFocusMode(null)}>Close ×</button>
        {focusMode === 'visual'
          ? <div className="j1-gold-focus__visual"><J1GoldVisual slide={slide} motion={motion} /></div>
          : <div className="j1-gold-focus__copy"><span className="j1-gold-kicker">{isQuestion ? 'QUESTION OF THE DAY' : slide.title.en}</span><h2>{highlightText(slideIndex === 0 ? 'LIVING THINGS & THE ENVIRONMENT' : isQuestion ? slide.body.en : slide.title.en, highlights)}</h2>{!isQuestion && <p>{highlightText(slideIndex === 0 ? 'Habitats and ecosystems' : slide.body.en, highlights)}</p>}{visibleReveals.map((item) => <p key={item.id}>{highlightText(item.text.en, highlights)}</p>)}{showChinese && <div className="j1-gold-translation" lang="zh-Hant">{zhSupport[slide.id] ?? slide.body.zhHant}</div>}</div>}
      </div>}
    </main>
  )
}
