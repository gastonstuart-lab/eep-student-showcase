import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { LessonSlide, ScienceLesson } from '../types/lesson'
import { coursewareArtwork, type CoursewareArtwork } from './coursewareArtwork'
import { FocusOverlay, type FocusContent } from './CoursewareInteractions'
import { coursewareSections, getCoursewareLesson, type CoursewareSection } from './coursewareManifest'
import { defaultCoursewareProgress, type CoursewareProgress } from './coursewareSession'
import { coursewareSourcePages, type CoursewareSourcePage } from './coursewareSourcePages'
import './courseware.css'

type TeachingMode = 'simple' | 'interactive'

type TeacherClass = {
  id: string
  name: string
  lastSectionId?: string
  progress: Record<string, CoursewareProgress>
}

const STORAGE_KEY = 'science-courseware-classes-v1'

const loadClasses = (): TeacherClass[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const sourceEnglish = (sourcePage: CoursewareSourcePage | undefined, slide: LessonSlide) => {
  if (!sourcePage) return [slide.title.en, slide.body.en].filter(Boolean).join('\n\n')
  return [sourcePage.heading, sourcePage.subheading, sourcePage.prompt, ...sourcePage.paragraphs, sourcePage.byline]
    .filter(Boolean)
    .join('\n\n')
}

const chineseCopy = (slide: LessonSlide) => [
  slide.title.zhHant,
  slide.body.zhHant,
  ...(slide.reveals ?? []).map((item) => item.text.zhHant),
].filter(Boolean) as string[]

function ArtworkPage({
  artwork,
  slide,
  sourcePage,
  revealIndex,
  mode,
  chineseEnabled,
  highlightsEnabled,
  onFocus,
}: {
  artwork: CoursewareArtwork
  slide: LessonSlide
  sourcePage?: CoursewareSourcePage
  revealIndex: number
  mode: TeachingMode
  chineseEnabled: boolean
  highlightsEnabled: boolean
  onFocus: (content: FocusContent) => void
}) {
  const chinese = chineseCopy(slide)
  const masks = mode === 'interactive'
    ? artwork.revealBlocks.filter((block) => block.stage > revealIndex)
    : []

  return (
    <article className={`courseware-artboard courseware-artboard--${artwork.approval}`}>
      <img className="courseware-artboard__image" src={artwork.src} alt={artwork.alt} />
      {!highlightsEnabled && (
        <img
          className="courseware-artboard__neutralized"
          src={artwork.src}
          alt=""
          aria-hidden="true"
          style={{ clipPath: `inset(${artwork.highlightRegion.top ?? 0} ${100 - Number.parseFloat(String(artwork.highlightRegion.width ?? '100'))}% ${100 - Number.parseFloat(String(artwork.highlightRegion.height ?? '100'))}% ${artwork.highlightRegion.left ?? 0})` }}
        />
      )}
      {masks.map((mask) => (
        <span className="courseware-reveal-mask" key={mask.id} style={mask.style} aria-hidden="true" />
      ))}
      <button
        className="courseware-focus-hotspot courseware-focus-hotspot--text"
        type="button"
        style={artwork.textRegion}
        onClick={() => onFocus({ english: sourceEnglish(sourcePage, slide), chinese: chinese.join('\n\n') })}
        aria-label="Enlarge the page text"
      />
      <button
        className="courseware-focus-hotspot courseware-focus-hotspot--visual"
        type="button"
        style={artwork.visualRegion}
        onClick={() => onFocus({ kind: 'image', imageSrc: artwork.src, alt: artwork.alt })}
        aria-label="Enlarge the page visual"
      />
      {chineseEnabled && chinese.length > 0 && (
        <aside className="courseware-chinese-panel" lang="zh-Hant" aria-label="Traditional Chinese support">
          <strong>繁體中文支援</strong>
          {chinese.map((line, index) => <p key={`${slide.id}-zh-${index}`}>{line}</p>)}
        </aside>
      )}
    </article>
  )
}

function UnfinishedPage({ slide, sourcePage }: { slide: LessonSlide; sourcePage?: CoursewareSourcePage }) {
  return (
    <article className="courseware-unfinished">
      <div className="courseware-unfinished__flag">UNFINISHED · FINAL ARTWORK REQUIRED</div>
      <span>Source page {sourcePage?.sourceSlide ?? '—'}</span>
      <h2>{sourcePage?.subheading ?? sourcePage?.heading ?? slide.title.en}</h2>
      <p>{sourcePage?.prompt ?? sourcePage?.paragraphs.join(' ') ?? slide.body.en}</p>
      <strong>NOT PRODUCTION READY</strong>
    </article>
  )
}

export function CoursewareLessonPlayer({
  lesson,
  section,
  className,
  initialProgress,
  onProgress,
  onExit,
  exitLabel = 'Back to classes',
}: {
  lesson: ScienceLesson
  section: CoursewareSection
  className: string
  initialProgress: CoursewareProgress
  onProgress: (progress: CoursewareProgress) => void
  onExit: () => void
  exitLabel?: string
}) {
  const safeInitialIndex = Math.min(Math.max(0, initialProgress.slideIndex), lesson.slides.length - 1)
  const initialSlide = lesson.slides[safeInitialIndex] ?? lesson.slides[0]
  const initialArtwork = initialSlide ? coursewareArtwork[initialSlide.id] : undefined
  const initialRevealCount = initialProgress.mode === 'interactive' && initialArtwork
    ? Math.max(0, ...initialArtwork.revealBlocks.map((block) => block.stage))
    : 0
  const [slideIndex, setSlideIndex] = useState(safeInitialIndex)
  const [revealIndex, setRevealIndex] = useState(Math.min(Math.max(0, initialProgress.revealIndex), initialRevealCount))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [chineseEnabled, setChineseEnabled] = useState(initialProgress.chineseEnabled)
  const [highlightsEnabled, setHighlightsEnabled] = useState(initialProgress.highlightsEnabled)
  const [mode, setMode] = useState<TeachingMode>(initialProgress.mode)
  const [focusContent, setFocusContent] = useState<FocusContent | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const shellRef = useRef<HTMLElement>(null)

  const slide = lesson.slides[slideIndex] ?? lesson.slides[0]
  const artwork = coursewareArtwork[slide.id]
  const sourcePage = coursewareSourcePages[slide.id]
  const revealCount = mode === 'interactive' && artwork
    ? Math.max(0, ...artwork.revealBlocks.map((block) => block.stage))
    : 0

  useEffect(() => {
    onProgress({ slideIndex, revealIndex, chineseEnabled, highlightsEnabled, mode })
  }, [chineseEnabled, highlightsEnabled, mode, onProgress, revealIndex, slideIndex])

  const resetTransientState = useCallback(() => {
    setDrawerOpen(false)
    setFocusContent(null)
  }, [])

  const next = useCallback(() => {
    if (mode === 'interactive' && revealIndex < revealCount) {
      setRevealIndex((value) => value + 1)
      return
    }
    if (slideIndex < lesson.slides.length - 1) {
      setSlideIndex((value) => value + 1)
      setRevealIndex(0)
      resetTransientState()
    }
  }, [lesson.slides.length, mode, resetTransientState, revealCount, revealIndex, slideIndex])

  const previous = useCallback(() => {
    if (mode === 'interactive' && revealIndex > 0) {
      setRevealIndex((value) => value - 1)
      return
    }
    if (slideIndex > 0) {
      const previousSlide = lesson.slides[slideIndex - 1]
      const previousArtwork = coursewareArtwork[previousSlide.id]
      setSlideIndex((value) => value - 1)
      setRevealIndex(mode === 'interactive' && previousArtwork
        ? Math.max(0, ...previousArtwork.revealBlocks.map((block) => block.stage))
        : 0)
      resetTransientState()
    }
  }, [lesson.slides, mode, resetTransientState, revealIndex, slideIndex])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable="true"]')) return
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault()
        next()
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault()
        previous()
      }
      if (event.key === 'Escape' && focusContent) setFocusContent(null)
      else if (event.key === 'Escape' && drawerOpen) setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen, focusContent, next, previous])

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen?.().catch(() => undefined)
      setIsFullscreen(false)
      return
    }
    if (!shellRef.current?.requestFullscreen) return
    try {
      await shellRef.current.requestFullscreen()
      setIsFullscreen(true)
    } catch {
      setIsFullscreen(false)
    }
  }

  const jumpTo = (index: number) => {
    setSlideIndex(index)
    setRevealIndex(0)
    resetTransientState()
  }

  const setTeachingMode = (value: TeachingMode) => {
    setMode(value)
    setRevealIndex(value === 'simple' ? 0 : revealIndex)
  }

  return (
    <main className={`courseware-shell ${isFullscreen ? 'is-fullscreen' : ''}`} ref={shellRef}>
      <div className="courseware-identity">
        <strong>{section.year}</strong>
        <span>{className}</span>
        <span>{section.chapterNumber} · {section.sectionNumber}</span>
        <button type="button" onClick={() => setTeachingMode(mode === 'simple' ? 'interactive' : 'simple')}>
          {mode === 'simple' ? 'Simple mode' : 'Interactive mode'}
        </button>
      </div>

      <section className="courseware-stage" aria-label={`Page ${slideIndex + 1} of ${lesson.slides.length}`}>
        {artwork
          ? <ArtworkPage artwork={artwork} slide={slide} sourcePage={sourcePage} revealIndex={revealIndex} mode={mode} chineseEnabled={chineseEnabled} highlightsEnabled={highlightsEnabled} onFocus={setFocusContent} />
          : <UnfinishedPage slide={slide} sourcePage={sourcePage} />}

        <button className="courseware-drawer-tab" type="button" onClick={() => setDrawerOpen(true)} aria-label="Open teacher tools">›</button>
        <button className={`courseware-chinese-control ${chineseEnabled ? 'is-on' : ''}`} type="button" onClick={() => setChineseEnabled((value) => !value)} aria-pressed={chineseEnabled}>中文</button>
        <button className={`courseware-highlight-control ${highlightsEnabled ? 'is-on' : ''}`} type="button" onClick={() => setHighlightsEnabled((value) => !value)} aria-pressed={highlightsEnabled}>💡<small>Highlight</small></button>
        <button className="courseware-fullscreen-control" type="button" onClick={() => void toggleFullscreen()} aria-label="Toggle full screen">⛶<small>Full Screen</small></button>

        <nav className="courseware-nav" aria-label="Lesson navigation">
          <button type="button" onClick={previous} disabled={slideIndex === 0 && revealIndex === 0} aria-label="Previous">←</button>
          <span><b>{slideIndex + 1}</b> / {lesson.slides.length}{revealCount > 0 && <small> · reveal {revealIndex}/{revealCount}</small>}</span>
          <button type="button" onClick={next} disabled={slideIndex === lesson.slides.length - 1 && revealIndex === revealCount} aria-label="Next">→</button>
        </nav>
      </section>

      <aside className={`courseware-drawer ${drawerOpen ? 'is-open' : ''}`} aria-label="Teacher tools">
        <header>
          <div><strong>Teacher tools</strong><span>{className} · {section.year}</span></div>
          <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close teacher tools">×</button>
        </header>
        <button className="courseware-drawer__exit" type="button" onClick={onExit}>← {exitLabel}</button>
        <section className="courseware-drawer__mode">
          <strong>Teaching mode</strong>
          <button className={mode === 'simple' ? 'is-current' : ''} type="button" onClick={() => setTeachingMode('simple')}>Simple</button>
          <button className={mode === 'interactive' ? 'is-current' : ''} type="button" onClick={() => setTeachingMode('interactive')}>Interactive</button>
        </section>
        <section>
          <strong>Current source page</strong>
          <p>PowerPoint page {sourcePage?.sourceSlide ?? slideIndex + 1}: {sourcePage?.subheading ?? sourcePage?.heading ?? slide.title.en}</p>
          <small>{section.sourceTitle}</small>
        </section>
        <section>
          <strong>Jump to page</strong>
          <div className="courseware-page-list">
            {lesson.slides.map((item, index) => (
              <button className={index === slideIndex ? 'is-current' : ''} key={item.id} type="button" onClick={() => jumpTo(index)}>
                <b>{index + 1}</b><span>{item.title.en}</span>
              </button>
            ))}
          </div>
        </section>
        <section><strong>Teacher note</strong><p>{slide.teacherNote}</p></section>
        <section>
          <strong>Source</strong>
          <a href={`https://drive.google.com/file/d/${section.sourceDriveId}/view`} target="_blank" rel="noreferrer">Open authoritative PowerPoint</a>
        </section>
      </aside>

      {focusContent && <FocusOverlay content={focusContent} chineseEnabled={chineseEnabled} onClose={() => setFocusContent(null)} />}
    </main>
  )
}

export function CoursewareApp() {
  const [classes, setClasses] = useState<TeacherClass[]>(loadClasses)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(() => loadClasses()[0]?.id ?? null)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [newClassName, setNewClassName] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes))
  }, [classes])

  const selectedClass = classes.find((item) => item.id === selectedClassId) ?? null
  const activeSection = coursewareSections.find((section) => section.id === activeSectionId) ?? null

  const saveProgress = useCallback((sectionId: string, progress: CoursewareProgress) => {
    if (!selectedClassId) return
    setClasses((current) => current.map((item) => item.id === selectedClassId
      ? { ...item, lastSectionId: sectionId, progress: { ...item.progress, [sectionId]: progress } }
      : item))
  }, [selectedClassId])

  const saveActiveProgress = useCallback((progress: CoursewareProgress) => {
    if (activeSectionId) saveProgress(activeSectionId, progress)
  }, [activeSectionId, saveProgress])

  const createClass = (event: FormEvent) => {
    event.preventDefault()
    const name = newClassName.trim()
    if (!name) return
    const item: TeacherClass = { id: crypto.randomUUID(), name, progress: {} }
    setClasses((current) => [...current, item])
    setSelectedClassId(item.id)
    setNewClassName('')
  }

  if (activeSection && selectedClass) {
    const lesson = getCoursewareLesson(activeSection)

    return (
      <CoursewareLessonPlayer
        key={`${selectedClass.id}-${activeSection.id}`}
        lesson={lesson}
        section={activeSection}
        className={selectedClass.name}
        initialProgress={selectedClass.progress[activeSection.id] ?? defaultCoursewareProgress()}
        onProgress={saveActiveProgress}
        onExit={() => setActiveSectionId(null)}
      />
    )
  }

  return (
    <main className="courseware-home">
      <header>
        <span>IED · ESL Science</span>
        <h1>Science Courseware</h1>
        <p>Choose a class, then present the exact curriculum pages in one continuous classroom lesson.</p>
      </header>

      <section className="courseware-class-manager" aria-label="Classes">
        <div>
          <strong>Classes</strong>
          <div className="courseware-class-list">
            {classes.length === 0 && <p>Create a class to keep each group’s place and teaching mode separate.</p>}
            {classes.map((item) => (
              <button className={item.id === selectedClassId ? 'is-selected' : ''} type="button" key={item.id} onClick={() => setSelectedClassId(item.id)}>
                <b>{item.name}</b>
                <small>{item.lastSectionId ? `Resume ${(item.progress[item.lastSectionId]?.slideIndex ?? 0) + 1}/15` : 'Not started'}</small>
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={createClass}>
          <label htmlFor="new-class-name">New class</label>
          <input id="new-class-name" value={newClassName} onChange={(event) => setNewClassName(event.target.value)} placeholder="e.g. J1 Blue" />
          <button type="submit">Create class</button>
        </form>
      </section>

      <section className="courseware-lesson-picker" aria-label="Opening lessons">
        <h2>{selectedClass ? `Lessons for ${selectedClass.name}` : 'Select or create a class'}</h2>
        <div className="courseware-section-grid">
          {coursewareSections.map((section) => {
            const progress = selectedClass?.progress[section.id]
            return (
              <button className="courseware-section-card" key={section.id} type="button" onClick={() => setActiveSectionId(section.id)} disabled={!selectedClass}>
                <span>{section.year}</span>
                <small>{section.chapterNumber}</small>
                {section.chapterTitle && <strong>{section.chapterTitle}</strong>}
                <small>{section.sectionNumber}</small>
                <h2>{section.sectionTitle}</h2>
                <em>{progress ? `Resume page ${progress.slideIndex + 1} · ${progress.mode}` : '15 source pages · Start →'}</em>
              </button>
            )
          })}
        </div>
      </section>
    </main>
  )
}
