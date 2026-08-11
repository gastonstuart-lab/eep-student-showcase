import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { rainfallComparisonData } from './curriculum/biomeCharts'
import {
  biomeAssetIds,
  findLesson,
  findVisualAsset,
  scienceLessons,
  scienceUnits,
  type LanguageMode,
  type LessonBiomeKey,
  type LessonVisualAsset,
  type LocalizedText,
  type LessonResource,
  type LessonSlide,
  type ScienceLesson,
  type Semester,
  type YearLevel,
} from './data'
import { BiomesV2Prototype } from './presentation-v2/BiomesV2Prototype'

type Screen = 'home' | 'library' | 'viewer' | 'editor'

const languageOptions: LanguageMode[] = ['English', 'Bilingual', '繁體中文']

export function ScienceLessonsApp() {
  if (window.location.search.includes('v2=biomes')) {
    return <BiomesV2Prototype />
  }

  return <ScienceLessonsWorkspace />
}

function ScienceLessonsWorkspace() {
  const [screen, setScreen] = useState<Screen>('home')
  const [year, setYear] = useState<YearLevel>('J1')
  const [semester, setSemester] = useState<Semester>('Fall')
  const [lessonId, setLessonId] = useState(scienceLessons[0].id)
  const [language, setLanguage] = useState<LanguageMode>('Bilingual')

  const lesson = findLesson(lessonId)

  const openLibrary = (nextYear = year, nextSemester = semester) => {
    setYear(nextYear)
    setSemester(nextSemester)
    setScreen('library')
  }

  const openLesson = (nextLesson: ScienceLesson, destination: 'viewer' | 'editor' = 'viewer') => {
    setLessonId(nextLesson.id)
    setYear(nextLesson.year)
    setSemester(nextLesson.semester)
    setScreen(destination)
  }

  return (
    <div className="science-app-shell">
      <AppHeader screen={screen} onNavigate={setScreen} />
      {screen === 'home' && (
        <ScienceHome
          year={year}
          semester={semester}
          onYearChange={setYear}
          onSemesterChange={setSemester}
          onBrowse={openLibrary}
          onOpenLesson={openLesson}
        />
      )}
      {screen === 'library' && (
        <LessonLibrary
          year={year}
          semester={semester}
          onYearChange={setYear}
          onSemesterChange={setSemester}
          onOpenLesson={openLesson}
        />
      )}
      {screen === 'viewer' && (
        <SlideViewer
          key={lesson.id}
          lesson={lesson}
          language={language}
          onLanguageChange={setLanguage}
          onBack={() => setScreen('library')}
        />
      )}
      {screen === 'editor' && (
        <LessonEditor lesson={lesson} onBack={() => setScreen('viewer')} onLibrary={() => setScreen('library')} />
      )}
    </div>
  )
}

function AppHeader({ screen, onNavigate }: { screen: Screen; onNavigate: (screen: Screen) => void }) {
  return (
    <header className="science-topbar">
      <div className="science-brand">
        <a className="science-brand__mark" href="/esl/science" aria-label="Return to the IED Science Hub">
          <span>IED</span>
        </a>
        <div>
          <strong>Science Lessons</strong>
          <span><a href="/esl/science">Back to Science Hub</a></span>
        </div>
      </div>

      <nav className="science-topnav" aria-label="Science Lessons navigation">
        <button className={screen === 'home' ? 'is-active' : ''} type="button" onClick={() => onNavigate('home')}>
          Home
        </button>
        <button className={screen === 'library' ? 'is-active' : ''} type="button" onClick={() => onNavigate('library')}>
          Lesson library
        </button>
      </nav>

      <div className="science-user">
        <span className="science-user__status">Pilot workspace</span>
        <span className="science-avatar" aria-hidden="true">SG</span>
      </div>
    </header>
  )
}

function ScienceHome({
  year,
  semester,
  onYearChange,
  onSemesterChange,
  onBrowse,
  onOpenLesson,
}: {
  year: YearLevel
  semester: Semester
  onYearChange: (year: YearLevel) => void
  onSemesterChange: (semester: Semester) => void
  onBrowse: (year?: YearLevel, semester?: Semester) => void
  onOpenLesson: (lesson: ScienceLesson, destination?: 'viewer' | 'editor') => void
}) {
  const selectedLessons = scienceLessons.filter((lesson) => lesson.year === year && lesson.semester === semester)
  const continueLesson = selectedLessons[0] ?? scienceLessons[0]

  return (
    <main className="science-page science-home-page">
      <section className="science-hero">
        <div className="science-hero__copy">
          <p className="science-eyebrow">IED · ESL Science</p>
          <h1>Everything needed to teach the next Science lesson.</h1>
          <p>
            Find the right J1 or J2 lesson quickly, press Present, and teach from source-faithful Science slides with
            notes and resources close at hand.
          </p>
          <div className="science-hero__actions">
            <button className="science-button science-button--primary" type="button" onClick={() => onBrowse()}>
              Browse lesson library <span aria-hidden="true">→</span>
            </button>
            <button className="science-button science-button--ghost" type="button" onClick={() => onOpenLesson(continueLesson)}>
              Continue last lesson
            </button>
          </div>
        </div>
        <div className="science-hero__visual" aria-hidden="true">
          <div className="teacher-flow-card">
            <span>Teacher path</span>
            <ol>
              <li>IED</li>
              <li>ESL</li>
              <li>Science</li>
              <li>Science Lessons</li>
              <li>Present</li>
            </ol>
          </div>
          <div className="science-hero__panel">
            <span>Next lesson</span>
            <strong>{continueLesson.title}</strong>
            <small>{continueLesson.year} · {continueLesson.semester} · {continueLesson.duration} min</small>
          </div>
        </div>
      </section>

      <section className="science-selection" aria-labelledby="choose-course-heading">
        <div className="science-section-heading">
          <div>
            <p className="science-eyebrow">Choose teaching context</p>
            <h2 id="choose-course-heading">Find the right course in two clicks</h2>
          </div>
          <span className="science-count">{scienceLessons.length} pilot lessons</span>
        </div>

        <div className="science-selector-grid">
          <div className="science-choice-card">
            <span className="science-choice-card__number">01</span>
            <h3>Year level</h3>
            <p>Select the curriculum and language demand for the class.</p>
            <div className="science-segmented" aria-label="Year level">
              {(['J1', 'J2'] as YearLevel[]).map((item) => (
                <button className={year === item ? 'is-selected' : ''} key={item} type="button" onClick={() => onYearChange(item)}>
                  <strong>{item}</strong>
                  <span>{item === 'J1' ? 'Foundation science' : 'Developing science'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="science-choice-card">
            <span className="science-choice-card__number">02</span>
            <h3>Teaching semester</h3>
            <p>Keep the lesson sequence aligned with the school year.</p>
            <div className="science-segmented science-segmented--semester" aria-label="Semester">
              {(['Fall', 'Spring / Summer'] as Semester[]).map((item) => (
                <button className={semester === item ? 'is-selected' : ''} key={item} type="button" onClick={() => onSemesterChange(item)}>
                  <strong>{item}</strong>
                  <span>{item === 'Fall' ? 'First teaching sequence' : 'Second teaching sequence'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button className="science-open-selection" type="button" onClick={() => onBrowse(year, semester)}>
          <span>
            Open <strong>{year}</strong> · <strong>{semester}</strong>
          </span>
          <span aria-hidden="true">↗</span>
        </button>
      </section>

      <section className="science-dashboard-grid">
        <article className="science-dashboard-card science-dashboard-card--wide">
          <div className="science-card-topline">
            <span className="science-card-icon" aria-hidden="true">▶</span>
            <span>{continueLesson.status}</span>
          </div>
          <p className="science-eyebrow">Continue teaching</p>
          <h2>{continueLesson.title}</h2>
          <p>{continueLesson.subtitle}</p>
          <div className="science-progress" aria-label="Lesson progress">
            <span style={{ width: '42%' }} />
          </div>
          <div className="science-card-footer">
            <span>Last opened at slide 2 of {continueLesson.slides.length}</span>
            <button type="button" onClick={() => onOpenLesson(continueLesson)}>Resume presentation →</button>
          </div>
        </article>

        <article className="science-dashboard-card">
          <div className="science-card-topline">
            <span className="science-card-icon" aria-hidden="true">⌁</span>
            <span>Organised</span>
          </div>
          <h3>Four curriculum pathways</h3>
          <p>J1 and J2 are separated by semester, unit, lesson, and teaching order.</p>
          <div className="mini-pathway" aria-hidden="true">
            <span>J1</span><i /><span>Fall</span><i /><span>Unit 2</span>
          </div>
        </article>
      </section>
    </main>
  )
}

function LessonLibrary({
  year,
  semester,
  onYearChange,
  onSemesterChange,
  onOpenLesson,
}: {
  year: YearLevel
  semester: Semester
  onYearChange: (year: YearLevel) => void
  onSemesterChange: (semester: Semester) => void
  onOpenLesson: (lesson: ScienceLesson, destination?: 'viewer' | 'editor') => void
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'All' | 'Published' | 'Draft'>('All')

  const units = scienceUnits.filter((unit) => unit.year === year && unit.semester === semester)
  const lessons = useMemo(
    () => scienceLessons.filter((lesson) => {
      const matchesContext = lesson.year === year && lesson.semester === semester
      const matchesStatus = status === 'All' || lesson.status === status
      const searchText = `${lesson.title} ${lesson.subtitle}`.toLowerCase()
      return matchesContext && matchesStatus && searchText.includes(query.trim().toLowerCase())
    }),
    [query, semester, status, year],
  )

  return (
    <main className="science-page science-library-page">
      <section className="library-heading">
        <div>
          <p className="science-eyebrow">Science curriculum</p>
          <h1>Unit and lesson library</h1>
          <p>Choose the year, semester, and lesson, then open a classroom-ready presentation.</p>
        </div>
      </section>

      <section className="library-toolbar" aria-label="Lesson filters">
        <div className="science-tabs">
          {(['J1', 'J2'] as YearLevel[]).map((item) => (
            <button className={year === item ? 'is-active' : ''} key={item} type="button" onClick={() => onYearChange(item)}>{item}</button>
          ))}
        </div>
        <div className="science-tabs science-tabs--semester">
          {(['Fall', 'Spring / Summer'] as Semester[]).map((item) => (
            <button className={semester === item ? 'is-active' : ''} key={item} type="button" onClick={() => onSemesterChange(item)}>{item}</button>
          ))}
        </div>
        <label className="science-search">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Search lessons</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search lessons" />
        </label>
        <select aria-label="Filter by publishing status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
          <option>All</option>
          <option>Published</option>
          <option>Draft</option>
        </select>
      </section>

      <div className="library-layout">
        <aside className="unit-rail">
          <div className="unit-rail__heading">
            <span>Teaching sequence</span>
            <strong>{year} · {semester}</strong>
          </div>
          {units.length > 0 ? units.map((unit, index) => (
            <article className={`unit-rail-card unit-rail-card--${unit.accent}`} key={unit.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <small>{unit.number}</small>
                <h2>{unit.title}</h2>
                <p>{unit.description}</p>
              </div>
            </article>
          )) : (
            <div className="science-empty-state">
              <strong>Curriculum structure ready</strong>
              <p>Units for this pathway will appear here as content is imported.</p>
            </div>
          )}
        </aside>

        <section className="lesson-list" aria-live="polite">
          <div className="lesson-list__heading">
            <div>
              <span>{lessons.length} lessons</span>
              <h2>{year} · {semester}</h2>
            </div>
            <span>Ordered for teaching</span>
          </div>

          {lessons.length > 0 ? lessons.map((lesson, index) => (
            <article className="lesson-row" key={lesson.id}>
              <div className="lesson-row__number">{String(index + 1).padStart(2, '0')}</div>
              <div className="lesson-row__main">
                <div className="lesson-row__meta">
                  <span className={`science-status science-status--${lesson.status.toLowerCase()}`}>{lesson.status}</span>
                  {lesson.title.includes('REAL PILOT') && <span className="science-status science-status--pilot">Real pilot</span>}
                  <span>{lesson.chapter}</span>
                  <span>{lesson.duration} min</span>
                  <span>{lesson.slides.length} slides</span>
                  <span>{lesson.resources.length} resources</span>
                </div>
                <h3>{lesson.title}</h3>
                <p>{lesson.subtitle}</p>
                <small>Updated {lesson.updated}</small>
              </div>
              <div className="lesson-row__actions">
                <button className="science-button science-button--primary" type="button" onClick={() => onOpenLesson(lesson)}>
                  Present lesson
                </button>
              </div>
            </article>
          )) : (
            <div className="science-empty-state science-empty-state--large">
              <strong>No lessons match these filters</strong>
              <p>Try a different year, semester, publishing status, or search term.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function SlideViewer({
  lesson,
  language,
  onLanguageChange,
  onBack,
}: {
  lesson: ScienceLesson
  language: LanguageMode
  onLanguageChange: (language: LanguageMode) => void
  onBack: () => void
}) {
  const [slideIndex, setSlideIndex] = useState(0)
  const [revealIndex, setRevealIndex] = useState(0)
  const [notesOpen, setNotesOpen] = useState(true)
  const [resourcesOpen, setResourcesOpen] = useState(true)
  const [isPresenting, setIsPresenting] = useState(false)
  const stageAreaRef = useRef<HTMLElement>(null)
  const slide = lesson.slides[slideIndex] ?? lesson.slides[0]
  const totalReveals = slide.revealMode === 'step-by-step' ? (slide.reveals?.length ?? 0) : 0

  const previous = useCallback(() => {
    if (revealIndex > 0) {
      setRevealIndex((current) => Math.max(0, current - 1))
      return
    }
    setSlideIndex((current) => Math.max(0, current - 1))
  }, [revealIndex])

  const next = useCallback(() => {
    if (revealIndex < totalReveals) {
      setRevealIndex((current) => Math.min(totalReveals, current + 1))
      return
    }
    setRevealIndex(0)
    setSlideIndex((current) => Math.min(lesson.slides.length - 1, current + 1))
  }, [lesson.slides.length, revealIndex, totalReveals])

  const jumpToSlide = (index: number) => {
    setRevealIndex(0)
    setSlideIndex(index)
  }

  useEffect(() => {
    const syncPresentationState = () => setIsPresenting(document.fullscreenElement === stageAreaRef.current)
    document.addEventListener('fullscreenchange', syncPresentationState)
    return () => document.removeEventListener('fullscreenchange', syncPresentationState)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isFormField = target?.closest('input, textarea, select, [contenteditable="true"]')
      if (isFormField) return

      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault()
        next()
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault()
        previous()
      }
      if (event.key === 'Home') {
        event.preventDefault()
        setRevealIndex(0)
        setSlideIndex(0)
      }
      if (event.key === 'End') {
        event.preventDefault()
        setRevealIndex(0)
        setSlideIndex(lesson.slides.length - 1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lesson.slides.length, next, previous])

  const togglePresentation = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen?.()
      return
    }

    await stageAreaRef.current?.requestFullscreen?.()
  }

  return (
    <main className="viewer-shell">
      <header className="viewer-toolbar">
        <div className="viewer-toolbar__lesson">
          <button className="viewer-back" type="button" onClick={onBack} aria-label="Return to lesson library">←</button>
          <div>
            <span>{lesson.year} · {lesson.semester} · {lesson.chapter}</span>
            <strong>{lesson.title}</strong>
          </div>
        </div>
        <div className="viewer-toolbar__controls">
          <div className="viewer-language" aria-label="Slide language">
            {languageOptions.map((item) => (
              <button className={language === item ? 'is-active' : ''} key={item} type="button" onClick={() => onLanguageChange(item)}>{item}</button>
            ))}
          </div>
          <button className="viewer-tool-button viewer-tool-button--accent" type="button" onClick={togglePresentation}>
            ⛶ {isPresenting ? 'Exit' : 'Present'}
          </button>
        </div>
      </header>

      <div className="viewer-workspace">
        <aside className="viewer-thumbnails" aria-label="Lesson slides">
          <div className="viewer-thumbnails__top">
            <span>Slides</span>
            <strong>{lesson.slides.length}</strong>
          </div>
          {lesson.slides.map((item, index) => (
            <button className={index === slideIndex ? 'is-current' : ''} key={item.id} type="button" onClick={() => jumpToSlide(index)}>
              <span>{index + 1}</span>
              <SlideMiniature slide={item} />
            </button>
          ))}
        </aside>

        <section className={`viewer-stage-area${isPresenting ? ' is-presenting' : ''}`} ref={stageAreaRef}>
          <div className="viewer-stage">
            <SlideCanvas slide={slide} language={language} visibleRevealCount={revealIndex} />
          </div>
          <div className="viewer-navigation">
            <button type="button" onClick={previous} disabled={slideIndex === 0 && revealIndex === 0}>← Previous</button>
            <span>Slide {slideIndex + 1} of {lesson.slides.length}{totalReveals > 0 ? ` · Reveal ${revealIndex} of ${totalReveals}` : ''}</span>
            <button type="button" onClick={next} disabled={slideIndex === lesson.slides.length - 1 && revealIndex === totalReveals}>Next →</button>
          </div>
        </section>

        <aside className="viewer-inspector">
          <section className="viewer-panel">
            <button className="viewer-panel__heading" type="button" onClick={() => setNotesOpen((value) => !value)}>
              <span><i aria-hidden="true">●</i> Teacher notes</span>
              <span aria-hidden="true">{notesOpen ? '−' : '+'}</span>
            </button>
            {notesOpen && <p>{slide.teacherNote}</p>}
          </section>

          <section className="viewer-panel">
            <button className="viewer-panel__heading" type="button" onClick={() => setResourcesOpen((value) => !value)}>
              <span><i aria-hidden="true">◆</i> Lesson resources</span>
              <span aria-hidden="true">{resourcesOpen ? '−' : '+'}</span>
            </button>
            {resourcesOpen && (
              <div className="resource-stack">
                {lesson.resources.map((resource) => <ResourceLink key={resource.id} resource={resource} />)}
              </div>
            )}
          </section>

          <section className="viewer-panel viewer-panel--objectives">
            <span>Lesson objectives</span>
            <ul>{lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
          </section>

          <section className="viewer-panel viewer-panel--sources">
            <span>Source references</span>
            <ul>{lesson.sourceReferences.map((source) => <li key={source.id}><strong>{source.title}</strong><small>{source.slideRange ?? source.location}</small></li>)}</ul>
          </section>
        </aside>
      </div>
    </main>
  )
}

function localizedText(text: LocalizedText, language: LanguageMode) {
  if (language === '繁體中文') return text.zhHant ?? text.en
  return text.en
}

function secondaryText(text: LocalizedText, language: LanguageMode) {
  if (language === 'Bilingual') return text.zhHant
  return undefined
}

function SlideCanvas({
  slide,
  language,
  visibleRevealCount,
}: {
  slide: LessonSlide
  language: LanguageMode
  visibleRevealCount: number
}) {
  const visibleReveals = slide.revealMode === 'step-by-step' ? slide.reveals?.slice(0, visibleRevealCount) ?? [] : slide.reveals ?? []
  const layout = slide.layout ?? 'concept'

  return (
    <article className={`slide-canvas slide-canvas--${slide.visual} slide-layout slide-layout--${layout}${slide.biomeKey ? ` slide-biome--${slide.biomeKey}` : ''}`}>
      {layout === 'hero' && <HeroVisualSlide slide={slide} language={language} visibleReveals={visibleReveals} />}
      {layout === 'concept' && <ConceptSlide slide={slide} language={language} visibleReveals={visibleReveals} />}
      {layout === 'vocabulary' && <VocabularySlide slide={slide} language={language} visibleReveals={visibleReveals} />}
      {layout === 'diagram' && <DiagramSlide slide={slide} language={language} visibleReveals={visibleReveals} />}
      {layout === 'comparison' && <ComparisonSlide slide={slide} language={language} visibleReveals={visibleReveals} />}
      {layout === 'image-focus' && <ImageFocusSlide slide={slide} language={language} visibleReveals={visibleReveals} />}
      {layout === 'question' && <QuestionSlide slide={slide} language={language} visibleReveals={visibleReveals} />}
      {slide.sourceId && <span className="slide-source">Source: {slide.sourceId}</span>}
      <span className="slide-corner">IED SCIENCE</span>
    </article>
  )
}

function SlideTitle({ slide, language, kicker }: { slide: LessonSlide; language: LanguageMode; kicker?: string }) {
  return (
    <div className="slide-title-block">
      {kicker && <span className="slide-label">{kicker}</span>}
      {(language === 'English' || language === 'Bilingual') && <h1>{slide.title.en}</h1>}
      {language === '繁體中文' && <h1 lang="zh-Hant">{slide.title.zhHant ?? slide.title.en}</h1>}
      {language === 'Bilingual' && slide.title.zhHant && <h2 lang="zh-Hant">{slide.title.zhHant}</h2>}
      {slide.emphasis && <strong className="slide-emphasis">{slide.emphasis}</strong>}
    </div>
  )
}

function SlideBody({ slide, language }: { slide: LessonSlide; language: LanguageMode }) {
  return (
    <div className="slide-body-copy">
      {(language === 'English' || language === 'Bilingual') && <p>{slide.body.en}</p>}
      {language === '繁體中文' && <p lang="zh-Hant">{slide.body.zhHant ?? slide.body.en}</p>}
      {language === 'Bilingual' && slide.body.zhHant && <p className="slide-chinese" lang="zh-Hant">{slide.body.zhHant}</p>}
    </div>
  )
}

function RevealStack({
  items,
  language,
  mode = 'stack',
}: {
  items: NonNullable<LessonSlide['reveals']>
  language: LanguageMode
  mode?: 'stack' | 'chips' | 'cards' | 'questions' | 'prompts' | 'statements'
}) {
  if (items.length === 0) return null

  return (
    <ul className={`slide-reveal-list slide-reveal-list--${mode}`}>
      {items.map((item) => (
        <li key={item.id}>
          <span>{localizedText(item.text, language)}</span>
          {secondaryText(item.text, language) && <small lang="zh-Hant">{secondaryText(item.text, language)}</small>}
        </li>
      ))}
    </ul>
  )
}

function HeroVisualSlide({ slide, language, visibleReveals }: SlideLayoutProps) {
  return (
    <>
      <SciencePhoto slide={slide} className="slide-photo slide-photo--full" />
      <section className="slide-hero-copy">
        <SlideTitle slide={slide} language={language} kicker="Chapter 2.4" />
        <SlideBody slide={slide} language={language} />
        <RevealStack items={visibleReveals} language={language} mode="prompts" />
      </section>
    </>
  )
}

function ConceptSlide({ slide, language, visibleReveals }: SlideLayoutProps) {
  return (
    <>
      <section className="slide-concept-main">
        <SlideTitle slide={slide} language={language} kicker="Core idea" />
        <SlideBody slide={slide} language={language} />
      </section>
      <section className="concept-map" aria-label="Climate and organisms form a biome">
        <div className="concept-map__equation">
          <article className="concept-factor concept-factor--climate">
            <strong>CLIMATE</strong>
            <span>temperature + precipitation</span>
          </article>
          <b aria-hidden="true">+</b>
          <article className="concept-factor concept-factor--organisms">
            <strong>ORGANISMS</strong>
            <span>plants + animals</span>
          </article>
          <b aria-hidden="true">=</b>
          <article className="concept-factor concept-factor--biome">
            <strong>BIOME</strong>
            <span>similar land ecosystems</span>
          </article>
        </div>
        <div className="concept-definition">A biome is a group of land ecosystems with similar climates and organisms.</div>
      </section>
      <RevealStack items={visibleReveals} language={language} mode="statements" />
    </>
  )
}

function VocabularySlide({ slide, language, visibleReveals }: SlideLayoutProps) {
  const biomes = slide.revealMode === 'step-by-step' ? visibleReveals : slide.reveals ?? []

  return (
    <>
      <section className="slide-vocab-heading">
        <SlideTitle slide={slide} language={language} kicker="Vocabulary map" />
        <SlideBody slide={slide} language={language} />
      </section>
      <section className="biome-vocab-grid">
        {biomes.map((item, index) => (
          <article className={`biome-token biome-token--${index}`} key={item.id}>
            <img src={findVisualAsset(biomeAssetIds[biomeOrder[index]])?.localPath} alt="" aria-hidden="true" />
            <strong>{localizedText(item.text, language)}</strong>
            {secondaryText(item.text, language) && <small lang="zh-Hant">{secondaryText(item.text, language)}</small>}
          </article>
        ))}
      </section>
    </>
  )
}

function DiagramSlide({ slide, language, visibleReveals }: SlideLayoutProps) {
  const isClimate = slide.id.includes('climate-drivers')

  return (
    <>
      <section className="slide-diagram-copy">
        <SlideTitle slide={slide} language={language} kicker="Explain the pattern" />
        <SlideBody slide={slide} language={language} />
        <RevealStack items={visibleReveals} language={language} mode={isClimate ? 'statements' : 'stack'} />
      </section>
      <TeachingDiagram slide={slide} />
    </>
  )
}

function ComparisonSlide({ slide, language, visibleReveals }: SlideLayoutProps) {
  const isRainfall = slide.id.includes('rainfall-spectrum')

  return (
    <>
      <section className="slide-comparison-heading">
        <SlideTitle slide={slide} language={language} kicker={isRainfall ? 'Retrieval' : 'Compare'} />
        <SlideBody slide={slide} language={language} />
      </section>
      {isRainfall ? <RainfallSpectrum visibleCount={visibleReveals.length} /> : <GrasslandComparison />}
      {!isRainfall && <RevealStack items={visibleReveals} language={language} mode="chips" />}
    </>
  )
}

function ImageFocusSlide({ slide, language, visibleReveals }: SlideLayoutProps) {
  return (
    <>
      <SciencePhoto slide={slide} className="slide-photo slide-photo--panel">
        {slide.biomeKey === 'rainforest' && (
          <>
            <span className="photo-label photo-label--canopy">Canopy</span>
            <span className="photo-label photo-label--understory">Understory</span>
          </>
        )}
      </SciencePhoto>
      <section className="image-focus-copy">
        <SlideTitle slide={slide} language={language} kicker="Biome close-up" />
        <SlideBody slide={slide} language={language} />
        <RevealStack items={visibleReveals} language={language} mode="cards" />
      </section>
    </>
  )
}

function QuestionSlide({ slide, language, visibleReveals }: SlideLayoutProps) {
  const currentQuestion = visibleReveals.at(-1)

  return (
    <>
      <section className="slide-question-copy">
        <SlideTitle slide={slide} language={language} kicker="Exit check" />
        <SlideBody slide={slide} language={language} />
      </section>
      {currentQuestion && (
        <section className="exit-question-focus" aria-live="polite">
          <span>Question {visibleReveals.length}</span>
          <strong>{localizedText(currentQuestion.text, language)}</strong>
          {secondaryText(currentQuestion.text, language) && <small lang="zh-Hant">{secondaryText(currentQuestion.text, language)}</small>}
        </section>
      )}
      {visibleReveals.length > 1 && <RevealStack items={visibleReveals} language={language} mode="questions" />}
    </>
  )
}

interface SlideLayoutProps {
  slide: LessonSlide
  language: LanguageMode
  visibleReveals: NonNullable<LessonSlide['reveals']>
}

const biomeOrder: LessonBiomeKey[] = ['rainforest', 'desert', 'grassland', 'deciduous', 'boreal', 'tundra']

function visualForSlide(slide: LessonSlide): LessonVisualAsset | undefined {
  return findVisualAsset(slide.media?.assetId ?? (slide.biomeKey ? biomeAssetIds[slide.biomeKey] : undefined))
}

function SciencePhoto({
  slide,
  className,
  children,
}: {
  slide: LessonSlide
  className: string
  children?: ReactNode
}) {
  const visual = visualForSlide(slide)
  const src = visual?.localPath ?? slide.media?.src ?? '/science-lessons/biomes/earth-blue-marble.jpg'
  const alt = visual?.alt ?? slide.media?.alt ?? 'Science lesson visual'
  const attribution = visual?.attribution ?? slide.media?.credit ?? 'Source visual'

  return (
    <figure className={className}>
      <img src={src} alt={alt} />
      {children}
      <figcaption>{attribution}</figcaption>
    </figure>
  )
}

function TeachingDiagram({ slide }: { slide: LessonSlide }) {
  if (slide.id.includes('climate-drivers')) {
    return (
      <section className="climate-concept-diagram" aria-label="Conceptual temperature and precipitation biome diagram">
        <div className="climate-question">What two climate factors help determine the biome?</div>
        <div className="climate-axis climate-axis--temperature" aria-hidden="true">
          <span>cold</span>
          <i />
          <span>hot</span>
        </div>
        <div className="climate-axis climate-axis--precipitation" aria-hidden="true">
          <span>wet</span>
          <i />
          <span>dry</span>
        </div>
        <div className="climate-field">
          <span className="climate-marker climate-marker--tundra">cold + dry<br /><strong>tundra</strong></span>
          <span className="climate-marker climate-marker--desert">hot + dry<br /><strong>desert</strong></span>
          <span className="climate-marker climate-marker--grassland">seasonal rain<br /><strong>grassland</strong></span>
          <span className="climate-marker climate-marker--rainforest">hot + wet<br /><strong>rain forest</strong></span>
        </div>
        <div className="climate-rule">
          <strong>TEMPERATURE + PRECIPITATION</strong>
          <span>give the climate clues for biome conditions.</span>
        </div>
      </section>
    )
  }

  if (slide.biomeKey === 'desert') {
    return (
      <section className="teaching-visual-stack" aria-label="Desert image and water balance">
        <SciencePhoto slide={slide} className="slide-photo slide-photo--diagram slide-photo--short" />
        <div className="desert-balance" aria-label="Desert evaporation and precipitation comparison">
          <div><span>water in</span><strong>&lt; 25 cm</strong><small>rain per year</small></div>
          <b>&lt;</b>
          <div><span>water out</span><strong>evaporation</strong><small>exceeds precipitation</small></div>
        </div>
      </section>
    )
  }

  if (slide.biomeKey === 'tundra') {
    return (
      <section className="teaching-visual-stack" aria-label="Tundra landscape and permafrost cross-section">
        <SciencePhoto slide={slide} className="slide-photo slide-photo--diagram slide-photo--short" />
        <div className="permafrost-diagram" aria-label="Permafrost cross-section diagram">
          <div className="permafrost-surface"><span>summer surface</span><strong>marshy ground</strong></div>
          <div className="permafrost-active"><span>active layer</span><strong>brief thaw</strong></div>
          <div className="permafrost-layer"><span>permafrost</span><strong>frozen soil all year</strong></div>
        </div>
      </section>
    )
  }

  return <SciencePhoto slide={slide} className="slide-photo slide-photo--diagram" />
}

function GrasslandComparison() {
  const grasslandVisual = findVisualAsset('biomes-grassland-savanna')
  const src = grasslandVisual?.localPath ?? '/science-lessons/biomes/grassland-savanna.jpg'

  return (
    <section className="grassland-comparison" aria-label="Prairie and savanna comparison">
      <article className="grassland-panel grassland-panel--prairie">
        <img src={src} alt="" aria-hidden="true" />
        <div>
          <span>Prairie</span>
          <strong>25-75 cm</strong>
          <p>rain/year · grasses with few trees</p>
        </div>
      </article>
      <article className="grassland-panel grassland-panel--savanna">
        <img src={src} alt="" aria-hidden="true" />
        <div>
          <span>Savanna</span>
          <strong>120 cm</strong>
          <p>rain/year · grasses with scattered trees</p>
        </div>
      </article>
    </section>
  )
}

function RainfallSpectrum({ visibleCount }: { visibleCount: number }) {
  const maxRainfall = Math.max(...rainfallComparisonData.map((point) => point.representativeCm))

  return (
    <section className="rainfall-spectrum" aria-label="Annual precipitation chart in centimeters per year">
      <div className="rainfall-chart-title">
        <strong>Increasing annual precipitation</strong>
        <span>cm per year</span>
      </div>
      <div className="rainfall-axis" aria-hidden="true"><span>300</span><span>200</span><span>100</span><span>0</span></div>
      <div className="rainfall-plot">
        <span className="rainfall-gridline rainfall-gridline--300" />
        <span className="rainfall-gridline rainfall-gridline--200" />
        <span className="rainfall-gridline rainfall-gridline--100" />
        {rainfallComparisonData.map((point, index) => (
          <article
            className={`${index < visibleCount ? 'is-visible' : ''} rainfall-bar--${index}`}
            key={point.label}
            style={{
              '--bar': `${Math.max(8, (point.representativeCm / maxRainfall) * 100)}%`,
              '--rainfall-column': String(index + 1),
            } as CSSProperties}
          >
            <i />
            <span>{point.label}</span>
            <strong>{point.valueLabel}</strong>
          </article>
        ))}
      </div>
      <div className="rainfall-direction" aria-hidden="true">MORE PRECIPITATION -&gt; DIFFERENT ECOSYSTEM CONDITIONS</div>
    </section>
  )
}

function SlideMiniature({ slide }: { slide: LessonSlide }) {
  return (
    <span className={`slide-miniature slide-miniature--${slide.visual}`}>
      <i />
      <b>{slide.title.en}</b>
      <em />
    </span>
  )
}

function ResourceLink({ resource }: { resource: LessonResource }) {
  const icon = resource.type === 'Video' ? '▶' : resource.type === 'Quiz' ? '?' : resource.type === 'Test' ? 'T' : '▤'
  const content = (
    <>
      <span className="resource-icon" aria-hidden="true">{icon}</span>
      <span><strong>{resource.title}</strong><small>{resource.type} · {resource.detail}{resource.teacherOnly ? ' · Teacher only' : ''}</small></span>
      <span aria-hidden="true">{resource.href ? '↗' : '待'}</span>
    </>
  )

  if (resource.href) {
    return (
      <a href={resource.href} target="_blank" rel="noreferrer">
        {content}
      </a>
    )
  }

  return <button type="button" disabled title="Add the real Drive URL or file path during curriculum ingestion">{content}</button>
}

function ScienceVisual({ type }: { type: LessonSlide['visual'] }) {
  if (type === 'graph') {
    return (
      <div className="science-visual science-visual--graph" aria-hidden="true">
        <span className="graph-axis graph-axis--x" /><span className="graph-axis graph-axis--y" />
        <span className="graph-curve" /><i>Activation energy</i>
      </div>
    )
  }
  if (type === 'experiment') {
    return (
      <div className="science-visual science-visual--experiment" aria-hidden="true">
        <span className="flask flask--one"><i /></span><span className="flask flask--two"><i /></span>
        <b>Lower energy pathway</b>
      </div>
    )
  }
  if (type === 'ecosystem') {
    return (
      <div className="science-visual science-visual--ecosystem" aria-hidden="true">
        <span className="sun" /><span className="leaf leaf--one" /><span className="leaf leaf--two" />
        <span className="water" /><span className="fish">◁</span>
      </div>
    )
  }
  if (type === 'question') {
    return <div className="science-visual science-visual--question" aria-hidden="true">?</div>
  }
  return (
    <div className="science-visual science-visual--particles" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => <span key={index} />)}
    </div>
  )
}

function LessonEditor({ lesson, onBack, onLibrary }: { lesson: ScienceLesson; onBack: () => void; onLibrary: () => void }) {
  const [title, setTitle] = useState(lesson.title)
  const [subtitle, setSubtitle] = useState(lesson.subtitle)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [slides, setSlides] = useState<LessonSlide[]>(() => lesson.slides.map((slide) => ({
    ...slide,
    title: { ...slide.title },
    body: { ...slide.body },
    reveals: slide.reveals?.map((item) => ({ ...item, text: { ...item.text } })),
  })))
  const [saveState, setSaveState] = useState<'Saved' | 'Unsaved'>('Saved')
  const selectedSlide = slides[selectedIndex] ?? slides[0]

  const updateSelectedSlide = <Field extends keyof LessonSlide>(field: Field, value: LessonSlide[Field]) => {
    setSlides((current) => current.map((slide, index) => index === selectedIndex ? { ...slide, [field]: value } : slide))
    setSaveState('Unsaved')
  }

  const updateSelectedSlideText = (field: 'title' | 'body', locale: 'en' | 'zhHant', value: string) => {
    setSlides((current) => current.map((slide, index) => index === selectedIndex ? {
      ...slide,
      [field]: { ...slide[field], [locale]: value },
    } : slide))
    setSaveState('Unsaved')
  }

  const addReveal = () => {
    const nextReveal = {
      id: `reveal-${Date.now()}`,
      text: { en: 'New reveal point', zhHant: '新的逐步顯示重點' },
    }

    setSlides((current) => current.map((slide, index) => index === selectedIndex ? {
      ...slide,
      revealMode: 'step-by-step',
      reveals: [...(slide.reveals ?? []), nextReveal],
    } : slide))
    setSaveState('Unsaved')
  }

  const addSlide = () => {
    const nextSlide: LessonSlide = {
      id: `draft-${Date.now()}`,
      title: { en: 'New science idea', zhHant: '新的科學概念' },
      body: { en: 'Add the English explanation here.', zhHant: '在這裡加入繁體中文說明。' },
      visual: 'particles',
      revealMode: 'all-at-once',
      teacherNote: 'Add a teaching prompt or misconception to watch for.',
    }
    setSlides((current) => [...current, nextSlide])
    setSelectedIndex(slides.length)
    setSaveState('Unsaved')
  }

  const saveDraft = () => {
    setSaveState('Saved')
  }

  return (
    <main className="editor-shell">
      <header className="editor-toolbar">
        <div className="editor-toolbar__left">
          <button className="viewer-back" type="button" onClick={onBack} aria-label="Return to presentation">←</button>
          <div>
            <span>Prototype editor · local only · {lesson.year} · {lesson.semester}</span>
            <strong>{title}</strong>
          </div>
        </div>
        <div className="editor-save-state"><span className={saveState === 'Saved' ? 'is-saved' : ''} />{saveState}</div>
        <div className="editor-toolbar__actions">
          <button className="science-button science-button--ghost" type="button" onClick={onLibrary}>Close</button>
          <button className="science-button science-button--ghost" type="button" onClick={onBack}>Preview</button>
          <button className="science-button science-button--primary" type="button" onClick={saveDraft}>Mark local draft reviewed</button>
        </div>
      </header>

      <div className="editor-workspace">
        <aside className="editor-sidebar">
          <div className="editor-sidebar__heading"><span>Slides</span><strong>{slides.length}</strong></div>
          <div className="editor-slide-list">
            {slides.map((slide, index) => (
              <button className={index === selectedIndex ? 'is-selected' : ''} key={slide.id} type="button" onClick={() => setSelectedIndex(index)}>
                <span>{index + 1}</span>
                <SlideMiniature slide={slide} />
                <i aria-hidden="true">⋮</i>
              </button>
            ))}
          </div>
          <button className="editor-add-slide" type="button" onClick={addSlide}>+ Add slide</button>
        </aside>

        <section className="editor-canvas-area">
          <div className="editor-lesson-fields">
            <label>
              <span>Lesson title</span>
              <input value={title} onChange={(event) => { setTitle(event.target.value); setSaveState('Unsaved') }} />
            </label>
            <label>
              <span>Lesson subtitle</span>
              <input value={subtitle} onChange={(event) => { setSubtitle(event.target.value); setSaveState('Unsaved') }} />
            </label>
          </div>

          <div className="editor-slide-card">
            <div className="editor-slide-card__topline">
              <span>Slide {selectedIndex + 1}</span>
              <div>
                <button type="button">Duplicate</button>
                <button type="button">More ···</button>
              </div>
            </div>
            <div className="editor-bilingual-grid">
              <div>
                <span className="editor-language-label">EN · English</span>
                <label>
                  <span>Slide heading</span>
                  <textarea value={selectedSlide.title.en} onChange={(event) => updateSelectedSlideText('title', 'en', event.target.value)} />
                </label>
                <label>
                  <span>Explanation</span>
                  <textarea className="editor-textarea--body" value={selectedSlide.body.en} onChange={(event) => updateSelectedSlideText('body', 'en', event.target.value)} />
                </label>
              </div>
              <div>
                <span className="editor-language-label editor-language-label--zh">繁 · Traditional Chinese</span>
                <label>
                  <span>投影片標題</span>
                  <textarea lang="zh-Hant" value={selectedSlide.title.zhHant ?? ''} onChange={(event) => updateSelectedSlideText('title', 'zhHant', event.target.value)} />
                </label>
                <label>
                  <span>說明</span>
                  <textarea className="editor-textarea--body" lang="zh-Hant" value={selectedSlide.body.zhHant ?? ''} onChange={(event) => updateSelectedSlideText('body', 'zhHant', event.target.value)} />
                </label>
              </div>
            </div>

            <div className="editor-media-block">
              <div className={`editor-media-preview editor-media-preview--${selectedSlide.visual}`}>
                <ScienceVisual type={selectedSlide.visual} />
              </div>
              <div>
                <span className="editor-language-label">Visual</span>
                <h3>Prototype visual note</h3>
                <p>This surface does not replace media or persist curriculum changes. Use source files for real edits.</p>
                <div className="editor-media-actions">
                  <button type="button" disabled>Media replacement postponed</button>
                  <button type="button" disabled>Video insertion postponed</button>
                </div>
              </div>
            </div>

            <label className="editor-notes-field">
              <span>Teacher notes</span>
              <textarea value={selectedSlide.teacherNote} onChange={(event) => updateSelectedSlide('teacherNote', event.target.value)} />
            </label>

            <section className="editor-reveal-block">
              <div className="editor-inspector-heading">
                <h3>Progressive reveal</h3>
                <button type="button" onClick={addReveal}>+ Add point</button>
              </div>
              <p>{selectedSlide.revealMode === 'step-by-step' ? 'Teacher navigation reveals these points one at a time.' : 'This slide currently appears all at once.'}</p>
              {selectedSlide.reveals && selectedSlide.reveals.length > 0 && (
                <ol>
                  {selectedSlide.reveals.map((item) => (
                    <li key={item.id}>
                      <span>{item.text.en}</span>
                      {item.text.zhHant && <small lang="zh-Hant">{item.text.zhHant}</small>}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </section>

        <aside className="editor-inspector">
          <section>
            <p className="science-eyebrow">Insert content</p>
            <h2>Build this slide</h2>
            <div className="editor-block-grid">
              <button type="button"><span>T</span>Text</button>
              <button type="button"><span>文</span>Translation</button>
              <button type="button"><span>▧</span>Image</button>
              <button type="button"><span>▶</span>Video</button>
            </div>
          </section>

          <section>
            <div className="editor-inspector-heading"><h3>Attached resources</h3><button type="button">+ Add</button></div>
            <div className="editor-resource-list">
              {lesson.resources.map((resource) => (
                <article key={resource.id}>
                  <span aria-hidden="true">{resource.type === 'Video' ? '▶' : '▤'}</span>
                  <div><strong>{resource.title}</strong><small>{resource.type} · {resource.detail}</small></div>
                  <button type="button" aria-label={`More options for ${resource.title}`}>⋮</button>
                </article>
              ))}
            </div>
          </section>

          <section className="editor-publish-card">
            <span className="science-status science-status--published">{lesson.status}</span>
            <h3>Prototype only</h3>
            <p>Firebase persistence and publishing are intentionally postponed until the classroom slide standard is validated.</p>
            <button type="button" disabled>Publishing postponed</button>
          </section>
        </aside>
      </div>
    </main>
  )
}
