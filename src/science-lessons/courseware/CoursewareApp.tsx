import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { LessonSlide } from '../types/lesson'
import { coursewareSections, getCoursewareLesson, type CoursewareSection } from './coursewareManifest'
import { coursewareSourcePages, type CoursewareSourcePage } from './coursewareSourcePages'
import { FocusOverlay, HIGHLIGHT_PHRASES, renderHighlightedText, type FocusContent } from './CoursewareInteractions'
import './courseware.css'

type TranslationPatch = {
  id: string
  en: string
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
      { id: 'question-full', en: 'What needs are met by an organism’s environment?', zh: '生物的環境會滿足哪些需求？', variant: 'question', style: { left: '3.7%', top: '31.5%', width: '44.2%', height: '41%' } },
    ],
  },
  'j1-ch1-1-habitats': {
    src: j1Asset('approved/03-habitats.webp'),
    alt: 'Habitats page with polar, savanna and reef habitats',
    patches: [
      { id: 'habitats-title', en: 'Habitats', zh: '棲地', variant: 'title', style: { left: '3.2%', top: '18.5%', width: '27%', height: '11.5%' } },
      { id: 'habitats-sentence-1', en: 'An organism obtains food, water, shelter, and other things it needs to live, grow, and reproduce from its environment.', zh: '生物從環境中獲得生存、生長和繁殖所需的食物、水、庇護所和其他東西。', variant: 'copy', style: { left: '3.2%', top: '34.2%', width: '37.8%', height: '23.8%' } },
      { id: 'habitats-sentence-2', en: 'An environment that provides the things the organism needs to live, grow, and reproduce is called its habitat.', zh: '能提供生物生存、生長和繁殖所需事物的環境稱為棲地。', variant: 'copy', style: { left: '3.2%', top: '62.2%', width: '36.8%', height: '24.5%' } },
    ],
  },
  'j1-ch1-1-abiotic-overview': {
    src: j1Asset('approved/05-abiotic.webp'),
    alt: 'Abiotic factors page with five nonliving habitat factors',
    patches: [
      { id: 'abiotic-title', en: 'Abiotic Factors', zh: '非生物因子', variant: 'title', style: { left: '3.1%', top: '19.5%', width: '27%', height: '24.5%' } },
      { id: 'abiotic-sentence-1', en: 'Abiotic factors are the nonliving parts of an organism’s habitat.', zh: '非生物因子是生物棲地中沒有生命的部分。', variant: 'copy', style: { left: '7.7%', top: '51%', width: '33%', height: '14.5%' } },
      { id: 'abiotic-sentence-2', en: 'These factors are: water, sunlight, oxygen. Temperature and soil.', zh: '這些因子包括水、陽光、氧氣、溫度和土壤。', variant: 'copy', style: { left: '7.7%', top: '68%', width: '33%', height: '15.5%' } },
      { id: 'abiotic-center', en: 'Nonliving parts of an organism’s habitat', zh: '生物棲地中的非生物部分', variant: 'center', style: { left: '62.4%', top: '35.3%', width: '14.5%', height: '24.5%' } },
      { id: 'abiotic-water', en: 'Water', zh: '水', variant: 'label', style: { left: '48.6%', top: '47.7%', width: '10.2%', height: '5.4%' } },
      { id: 'abiotic-sunlight', en: 'Sunlight', zh: '陽光', variant: 'label', style: { left: '64.5%', top: '25.5%', width: '11.1%', height: '5.2%' } },
      { id: 'abiotic-oxygen', en: 'Oxygen', zh: '氧氣', variant: 'label', style: { left: '80.9%', top: '47.6%', width: '10.5%', height: '5.5%' } },
      { id: 'abiotic-temperature', en: 'Temperature', zh: '溫度', variant: 'label', style: { left: '54.7%', top: '78.2%', width: '11.2%', height: '5.5%' } },
      { id: 'abiotic-soil', en: 'Soil', zh: '土壤', variant: 'label', style: { left: '73.6%', top: '78.2%', width: '10.7%', height: '5.5%' } },
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
  revealIndex,
  chineseEnabled,
  translated,
  onToggleTranslated,
  isTitlePage,
  year,
  highlightsEnabled,
  onFocusText,
}: {
  slide: LessonSlide
  sourcePage?: CoursewareSourcePage
  revealIndex: number
  chineseEnabled: boolean
  translated: Set<string>
  onToggleTranslated: (id: string) => void
  isTitlePage: boolean
  year: 'J1' | 'J2'
  highlightsEnabled: boolean
  onFocusText: (content: FocusContent) => void
}) {
  const exactParagraphs = sourcePage?.paragraphs ?? [slide.body.en, ...(slide.reveals ?? []).map((item) => item.text.en)]
  const visibleParagraphs = exactParagraphs.slice(0, Math.min(exactParagraphs.length, Math.max(1, revealIndex + 1)))
  const isQuestion = Boolean(sourcePage?.prompt) || slide.layout === 'question' || slide.id.includes('question-')
  const sourceHeading = sourcePage?.heading ?? slide.title.en
  const sourceSubheading = sourcePage?.subheading
  const prompt = sourcePage?.prompt ?? slide.body.en
  const translatedParagraphs = [slide.body.zhHant, ...(slide.reveals ?? []).map((item) => item.text.zhHant)]

  const translatable = (id: string, english: string, chinese?: string, className?: string) => (
    <button
      className={`courseware-source-text ${className ?? ''} ${chineseEnabled && chinese ? 'is-translation-ready' : ''}`}
      type="button"
      onClick={() => {
        if (chineseEnabled && chinese) {
          onToggleTranslated(id)
          return
        }
        onFocusText({ english, chinese })
      }}
      aria-label={chineseEnabled && chinese ? `Translate ${english}` : `Enlarge ${english}`}
    >
      {translated.has(id) && chinese
        ? <span lang="zh-Hant">{chinese}</span>
        : renderHighlightedText(english, HIGHLIGHT_PHRASES[slide.id] ?? [], highlightsEnabled)}
    </button>
  )

  return (
    <article className={`courseware-source-page courseware-source-page--${year.toLowerCase()} ${isQuestion ? 'courseware-source-page--question' : ''}`}>
      {year === 'J1'
        ? <img src={fallbackImageFor(slide)} alt="" aria-hidden="true" />
        : <div className="courseware-atom-scene" aria-hidden="true"><i/><i/><i/><b/><span/><span/><span/></div>}
      <div className="courseware-source-page__wash" />
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
            <span className="courseware-kicker">{sourceSubheading ? sourceHeading : `${year} · SOURCE PAGE ${sourcePage?.sourceSlide ?? ''}`}</span>
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
  onFocusText,
}: {
  artboard: ApprovedArtboard
  chineseEnabled: boolean
  translated: Set<string>
  onToggleTranslated: (id: string) => void
  onFocusText: (content: FocusContent) => void
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
            onClick={() => {
              if (chineseEnabled) {
                onToggleTranslated(patch.id)
                return
              }
              onFocusText({ english: patch.en, chinese: patch.zh })
            }}
            aria-label={chineseEnabled ? `Show Traditional Chinese for ${patch.id}` : `Enlarge ${patch.en}`}
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
  const [highlightsEnabled, setHighlightsEnabled] = useState(true)
  const [focusContent, setFocusContent] = useState<FocusContent | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const shellRef = useRef<HTMLElement>(null)

  const slide = lesson.slides[slideIndex] ?? lesson.slides[0]
  const artboard = APPROVED_ARTBOARDS[slide.id]
  const sourcePage = coursewareSourcePages[slide.id]
  const sourceParagraphCount = sourcePage?.paragraphs.length
  const revealCount = artboard ? 0 : Math.max(0, (sourceParagraphCount ?? ((slide.reveals?.length ?? 0) + 1)) - 1)
  const translated = useMemo(() => new Set(translatedIds), [translatedIds])

  const resetTransientState = useCallback(() => {
    setTranslatedIds([])
    setDrawerOpen(false)
    setFocusContent(null)
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
      const previousSlide = lesson.slides[slideIndex - 1]
      const previousIsArtboard = Boolean(APPROVED_ARTBOARDS[previousSlide.id])
      setSlideIndex((value) => value - 1)
      setRevealIndex(previousIsArtboard ? 0 : (previousSlide.reveals?.length ?? 0))
      resetTransientState()
    }
  }, [lesson.slides, resetTransientState, revealIndex, slideIndex])

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
      if (event.key === 'Escape' && focusContent) {
        setFocusContent(null)
        return
      }
      if (event.key === 'Escape' && drawerOpen) setDrawerOpen(false)
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
    if (isFullscreen) {
      setIsFullscreen(false)
      return
    }
    setIsFullscreen(true)
    await shellRef.current?.requestFullscreen?.().catch(() => undefined)
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
          ? <ArtboardPage artboard={artboard} chineseEnabled={chineseEnabled} translated={translated} onToggleTranslated={toggleTranslated} onFocusText={setFocusContent} />
          : <SourcePage slide={slide} sourcePage={sourcePage} revealIndex={revealIndex} chineseEnabled={chineseEnabled} translated={translated} onToggleTranslated={toggleTranslated} isTitlePage={Boolean(sourcePage?.byline)} year={section.year} highlightsEnabled={highlightsEnabled} onFocusText={setFocusContent} />}

        <button className={`courseware-drawer-tab ${artboard ? 'is-artboard-control' : ''}`} type="button" onClick={() => setDrawerOpen(true)} aria-label="Open teacher tools">›</button>

        <button className={`courseware-chinese-control ${artboard ? 'is-artboard-control' : ''} ${chineseEnabled ? 'is-on' : ''}`} type="button" onClick={toggleChinese} aria-pressed={chineseEnabled} aria-label="Toggle Traditional Chinese click support">中文</button>
        <button
          className={`courseware-highlight-control ${artboard ? 'is-artboard-control' : ''} ${highlightsEnabled ? 'is-on' : ''}`}
          type="button"
          onClick={() => !artboard && setHighlightsEnabled((value) => !value)}
          aria-label={artboard ? 'Highlights are built into this approved artwork' : 'Toggle highlights'}
          aria-pressed={highlightsEnabled}
          disabled={Boolean(artboard)}
        >💡<small>Highlight</small></button>
        <button className={`courseware-fullscreen-control ${artboard ? 'is-artboard-control' : ''}`} type="button" onClick={() => void toggleFullscreen()} aria-label="Toggle full screen">⛶<small>Full Screen</small></button>

        <nav className="courseware-nav" aria-label="Lesson navigation">
          <button type="button" onClick={previous} disabled={slideIndex === 0 && revealIndex === 0} aria-label="Previous">←</button>
          <span>
            <b>{slideIndex + 1}</b> / {lesson.slides.length}
            {revealCount > 0 && <small> · reveal {revealIndex}/{revealCount}</small>}
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

      {focusContent && (
        <FocusOverlay
          content={focusContent}
          chineseEnabled={chineseEnabled}
          onClose={() => setFocusContent(null)}
        />
      )}
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
