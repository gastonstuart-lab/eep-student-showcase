import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { LessonSlide } from '../types/lesson'
import { coursewareSections, getCoursewareLesson, type CoursewareSection } from './coursewareManifest'
import { coursewareSourcePages, type CoursewareSourcePage } from './coursewareSourcePages'
import { HIGHLIGHT_PHRASES, J2Visual, renderHighlightedText } from './CoursewareVisuals'
import './courseware.css'

type TranslationPatch = {
  id: string
  zh: string
  variant: 'question' | 'copy' | 'title' | 'label' | 'center'
  style: CSSProperties
}

type ApprovedArtboard = {
  src: string
  alt: string
  patches: TranslationPatch[]
}

const j1Asset = (name: string) => `${import.meta.env.BASE_URL}science-lessons/j1-opening/${name}`

const APPROVED_ARTBOARDS: Record<string, ApprovedArtboard> = {
  'j1-ch1-1-question-needs': {
    src: j1Asset('approved/02-question.webp'),
    alt: 'Question of the Day habitat page',
    patches: [
      { id: 'question-full', zh: '生物的環境會滿足哪些需求？', variant: 'question', style: { left: '3.7%', top: '31.5%', width: '44.2%', height: '41%' } },
    ],
  },
  'j1-ch1-1-habitats': {
    src: j1Asset('approved/03-habitats.webp'),
    alt: 'Habitats page with polar, savanna and reef habitats',
    patches: [
      { id: 'habitats-title', zh: '棲地', variant: 'title', style: { left: '3.2%', top: '18.5%', width: '27%', height: '11.5%' } },
      { id: 'habitats-sentence-1', zh: '生物從環境中獲得生存、生長和繁殖所需的食物、水、庇護所和其他東西。', variant: 'copy', style: { left: '3.2%', top: '34.2%', width: '37.8%', height: '23.8%' } },
      { id: 'habitats-sentence-2', zh: '能提供生物生存、生長和繁殖所需事物的環境稱為棲地。', variant: 'copy', style: { left: '3.2%', top: '62.2%', width: '36.8%', height: '24.5%' } },
    ],
  },
  'j1-ch1-1-abiotic-overview': {
    src: j1Asset('approved/05-abiotic.webp'),
    alt: 'Abiotic factors page with five nonliving habitat factors',
    patches: [
      { id: 'abiotic-title', zh: '非生物因子', variant: 'title', style: { left: '3.1%', top: '19.5%', width: '27%', height: '24.5%' } },
      { id: 'abiotic-sentence-1', zh: '非生物因子是生物棲地中沒有生命的部分。', variant: 'copy', style: { left: '7.7%', top: '51%', width: '33%', height: '14.5%' } },
      { id: 'abiotic-sentence-2', zh: '這些因子包括水、陽光、氧氣、溫度和土壤。', variant: 'copy', style: { left: '7.7%', top: '68%', width: '33%', height: '15.5%' } },
      { id: 'abiotic-center', zh: '生物棲地中的非生物部分', variant: 'center', style: { left: '62.4%', top: '35.3%', width: '14.5%', height: '24.5%' } },
      { id: 'abiotic-water', zh: '水', variant: 'label', style: { left: '48.6%', top: '47.7%', width: '10.2%', height: '5.4%' } },
      { id: 'abiotic-sunlight', zh: '陽光', variant: 'label', style: { left: '64.5%', top: '25.5%', width: '11.1%', height: '5.2%' } },
      { id: 'abiotic-oxygen', zh: '氧氣', variant: 'label', style: { left: '80.9%', top: '47.6%', width: '10.5%', height: '5.5%' } },
      { id: 'abiotic-temperature', zh: '溫度', variant: 'label', style: { left: '54.7%', top: '78.2%', width: '11.2%', height: '5.5%' } },
      { id: 'abiotic-soil', zh: '土壤', variant: 'label', style: { left: '73.6%', top: '78.2%', width: '10.7%', height: '5.5%' } },
    ],
  },
}

const fallbackImageFor = (slide: LessonSlide) => {
  if (slide.layout === 'question') return j1Asset('pond.webp')
  if (slide.id.includes('water') || slide.id.includes('ecosystem') || slide.id.includes('community')) return j1Asset('pond.webp')
  if (slide.id.includes('biotic') || slide.id.includes('population')) return j1Asset('wolf-stream.webp')
  if (slide.id.includes('oxygen')) return j1Asset('coral.webp')
  return j1Asset('bear-stream.webp')
}

function SourcePage({
  slide,
  sourcePage,
  chineseEnabled,
  translated,
  onToggleTranslated,
  isTitlePage,
  year,
  highlights,
}: {
  slide: LessonSlide
  sourcePage?: CoursewareSourcePage
  chineseEnabled: boolean
  translated: Set<string>
  onToggleTranslated: (id: string) => void
  isTitlePage: boolean
  year: 'J1' | 'J2'
  highlights: boolean
}) {
  const exactParagraphs = sourcePage?.paragraphs ?? [slide.body.en, ...(slide.reveals ?? []).map((item) => item.text.en)]
  const visibleParagraphs = exactParagraphs
  const isQuestion = Boolean(sourcePage?.prompt) || slide.layout === 'question' || slide.id.includes('question-')
  const sourceHeading = sourcePage?.heading ?? slide.title.en
  const sourceSubheading = sourcePage?.subheading
  const prompt = sourcePage?.prompt ?? slide.body.en
  const translatedParagraphs = [slide.body.zhHant, ...(slide.reveals ?? []).map((item) => item.text.zhHant)]

  const translatable = (id: string, english: string, chinese?: string, className?: string) => (
    <button
      className={`courseware-source-text ${className ?? ''} ${chineseEnabled && chinese ? 'is-translation-ready' : ''}`}
      type="button"
      onClick={() => chineseEnabled && chinese && onToggleTranslated(id)}
      aria-label={chineseEnabled && chinese ? `Translate ${english}` : undefined}
    >
      {translated.has(id) && chinese
        ? <span lang="zh-Hant">{chinese}</span>
        : renderHighlightedText(english, HIGHLIGHT_PHRASES[slide.id] ?? [], highlights)}
    </button>
  )

  return (
    <article data-slide-id={slide.id} className={`courseware-source-page courseware-source-page--${year.toLowerCase()} ${isQuestion ? 'courseware-source-page--question' : ''}`}>
      {year === 'J1'
        ? <img src={fallbackImageFor(slide)} alt="" aria-hidden="true" />
        : <J2Visual slideId={slide.id} />}
      <div className="courseware-source-page__wash" />
      <span className="courseware-page-badge" aria-hidden="true">{sourcePage?.sourceSlide ?? ''}</span>
      <div className="courseware-source-page__copy">
        {isQuestion ? (
          <>
            <span className="courseware-kicker">{sourceHeading}</span>
            {translatable(`${slide.id}-prompt`, prompt, slide.body.zhHant, 'courseware-question')}
          </>
        ) : isTitlePage ? (
          <>
            <span className="courseware-kicker">{sourceHeading}</span>
            {translatable(`${slide.id}-title`, sourceSubheading ?? slide.body.en, slide.body.zhHant, 'courseware-title')}
            <span className="courseware-byline">{sourcePage?.byline ?? 'BY: XG LAWRENCE'}</span>
          </>
        ) : (
          <>
            <span className="courseware-kicker">{sourceSubheading ? sourceHeading : ''}</span>
            {translatable(`${slide.id}-title`, sourceSubheading ?? sourceHeading, slide.title.zhHant, 'courseware-title')}
            {visibleParagraphs.length > 0 && (
              <div className="courseware-reveals courseware-reveals--source">
                {visibleParagraphs.map((paragraph, index) => (
                  <div key={`${slide.id}-source-${index}`}>
                    {translatable(
                      `${slide.id}-source-${index}`,
                      paragraph,
                      translatedParagraphs[index],
                      index === 0 ? 'courseware-body' : 'courseware-reveal',
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </article>
  )
}

function ArtboardPage({
  artboard,
  chineseEnabled,
  translated,
  onToggleTranslated,
}: {
  artboard: ApprovedArtboard
  chineseEnabled: boolean
  translated: Set<string>
  onToggleTranslated: (id: string) => void
}) {
  return (
    <article className={`courseware-artboard ${chineseEnabled ? 'is-translation-ready' : ''}`}>
      <img src={artboard.src} alt={artboard.alt} />
      {artboard.patches.map((patch) => (
        <div key={patch.id}>
          <button
            className="courseware-translation-hotspot"
            type="button"
            style={patch.style}
            disabled={!chineseEnabled}
            onClick={() => onToggleTranslated(patch.id)}
            aria-label={`Show Traditional Chinese for ${patch.id}`}
          />
          {translated.has(patch.id) && (
            <span
              className={`courseware-translation-overlay courseware-translation-overlay--${patch.variant}`}
              style={patch.style}
              lang="zh-Hant"
            >
              {patch.zh}
            </span>
          )}
        </div>
      ))}
    </article>
  )
}

function CoursewarePlayer({ section, onExit }: { section: CoursewareSection; onExit: () => void }) {
  const lesson = useMemo(() => getCoursewareLesson(section), [section])
  const [slideIndex, setSlideIndex] = useState(0)
  const [revealIndex, setRevealIndex] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [chineseEnabled, setChineseEnabled] = useState(false)
  const [translatedIds, setTranslatedIds] = useState<string[]>([])
  const [highlights, setHighlights] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const shellRef = useRef<HTMLElement>(null)

  const slide = lesson.slides[slideIndex] ?? lesson.slides[0]
  const artboard = APPROVED_ARTBOARDS[slide.id]
  const sourcePage = coursewareSourcePages[slide.id]
  const revealCount = 0
  const translated = useMemo(() => new Set(translatedIds), [translatedIds])

  const resetTransientState = useCallback(() => {
    setTranslatedIds([])
    setDrawerOpen(false)
  }, [])

  const next = useCallback(() => {
    if (revealIndex < revealCount) {
      setRevealIndex((value) => value + 1)
      return
    }
    if (slideIndex < lesson.slides.length - 1) {
      setSlideIndex((value) => value + 1)
      setRevealIndex(0)
      resetTransientState()
    }
  }, [lesson.slides.length, resetTransientState, revealCount, revealIndex, slideIndex])

  const previous = useCallback(() => {
    if (revealIndex > 0) {
      setRevealIndex((value) => value - 1)
      return
    }
    if (slideIndex > 0) {
      setSlideIndex((value) => value - 1)
      setRevealIndex(0)
      resetTransientState()
    }
  }, [resetTransientState, revealIndex, slideIndex])

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
      if (event.key === 'Escape' && drawerOpen) setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen, next, previous])

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
    if (isFullscreen) {
      setIsFullscreen(false)
      return
    }
    setIsFullscreen(true)
    const target = shellRef.current ?? document.documentElement
    await target.requestFullscreen?.().catch(() => undefined)
  }

  const toggleChinese = () => {
    if (chineseEnabled) setTranslatedIds([])
    setChineseEnabled((value) => !value)
  }

  const toggleTranslated = (id: string) => {
    if (!chineseEnabled) return
    setTranslatedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const jumpTo = (index: number) => {
    setSlideIndex(index)
    setRevealIndex(0)
    resetTransientState()
  }

  return (
    <main className={`courseware-shell ${isFullscreen ? 'is-fullscreen' : ''}`} ref={shellRef}>
      <div className="courseware-identity">
        <strong>{section.year}</strong>
        <span>{section.chapterNumber}{section.chapterTitle ? ` · ${section.chapterTitle}` : ''}</span>
        <span>{section.sectionNumber} · {section.sectionTitle}</span>
      </div>

      <section className="courseware-stage" aria-label={`Page ${slideIndex + 1} of ${lesson.slides.length}`}>
        {artboard
          ? <ArtboardPage artboard={artboard} chineseEnabled={chineseEnabled} translated={translated} onToggleTranslated={toggleTranslated} />
          : <SourcePage slide={slide} sourcePage={sourcePage} chineseEnabled={chineseEnabled} translated={translated} onToggleTranslated={toggleTranslated} isTitlePage={Boolean(sourcePage?.byline)} year={section.year} highlights={highlights} />}

        <button className={`courseware-drawer-tab ${artboard ? 'is-artboard-control' : ''}`} type="button" onClick={() => setDrawerOpen(true)} aria-label="Open teacher tools">›</button>

        <button className={`courseware-chinese-control ${artboard ? 'is-artboard-control' : ''} ${chineseEnabled ? 'is-on' : ''}`} type="button" onClick={toggleChinese} aria-pressed={chineseEnabled} aria-label="Toggle Traditional Chinese click support">中文</button>
        <button className={`courseware-highlight-control ${artboard ? 'is-artboard-control' : ''} ${highlights ? 'is-on' : ''}`} type="button" onClick={() => setHighlights((value) => !value)} aria-label="Toggle highlights" aria-pressed={highlights}>💡<small>Highlight</small></button>
        <button className={`courseware-fullscreen-control ${artboard ? 'is-artboard-control' : ''}`} type="button" onClick={() => void toggleFullscreen()} aria-label="Toggle full screen">⛶<small>Full Screen</small></button>

        <nav className="courseware-nav" aria-label="Lesson navigation">
          <button type="button" onClick={previous} disabled={slideIndex === 0 && revealIndex === 0} aria-label="Previous">←</button>
          <span>
            <b>{slideIndex + 1}</b> / {lesson.slides.length}

          </span>
          <button type="button" onClick={next} disabled={slideIndex === lesson.slides.length - 1 && revealIndex === revealCount} aria-label="Next">→</button>
        </nav>
      </section>

      <aside className={`courseware-drawer ${drawerOpen ? 'is-open' : ''}`} aria-label="Teacher tools">
        <header>
          <div><strong>Teacher tools</strong><span>{section.year} · {section.chapterNumber} · {section.sectionNumber}</span></div>
          <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close teacher tools">×</button>
        </header>
        <button className="courseware-drawer__exit" type="button" onClick={onExit}>← Back to sections</button>
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
        <section>
          <strong>Teacher note</strong>
          <p>{slide.teacherNote}</p>
        </section>
        <section>
          <strong>Source</strong>
          <a href={`https://drive.google.com/file/d/${section.sourceDriveId}/view`} target="_blank" rel="noreferrer">Open authoritative PowerPoint</a>
        </section>
      </aside>
    </main>
  )
}

export function CoursewareApp() {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const activeSection = coursewareSections.find((section) => section.id === activeSectionId) ?? null

  if (activeSection) return <CoursewarePlayer section={activeSection} onExit={() => setActiveSectionId(null)} />

  return (
    <main className="courseware-home">
      <header>
        <span>IED · ESL Science</span>
        <h1>Science Courseware</h1>
        <p>Choose the exact chapter and section from the source PowerPoint, then present it as one continuous classroom lesson.</p>
      </header>
      <div className="courseware-section-grid">
        {coursewareSections.map((section) => (
          <button className="courseware-section-card" key={section.id} type="button" onClick={() => setActiveSectionId(section.id)}>
            <span>{section.year}</span>
            <small>{section.chapterNumber}</small>
            {section.chapterTitle && <strong>{section.chapterTitle}</strong>}
            <small>{section.sectionNumber}</small>
            <h2>{section.sectionTitle}</h2>
            <em>15 source pages · Present →</em>
          </button>
        ))}
      </div>
    </main>
  )
}
