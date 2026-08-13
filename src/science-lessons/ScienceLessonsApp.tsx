import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { PresentationShell } from './presentation-v2/PresentationShell'
import { biomesV2SceneBySlideId } from './presentation-v2/biomesV2Scenes'
import { AquaticEnhancedSlide } from './AquaticEnhancedSlide'

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
              <strong>{units.length > 0 ? 'Lessons for this unit have not been added yet.' : 'Curriculum structure ready'}</strong>
              <p>{units.length > 0 ? 'This pathway is in place, and lesson content will appear here as it is populated.' : 'Units and lessons for this pathway will appear here as content is imported.'}</p>
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
  const presentationRef = useRef<HTMLDivElement>(null)
  const slide = lesson.slides[slideIndex] ?? lesson.slides[0]
  const enhancedPresentationScene = biomesV2SceneBySlideId[slide.id]
  const v1TotalReveals = slide.revealMode === 'step-by-step' ? (slide.reveals?.length ?? 0) : 0
  const usesEnhancedPresentation = isPresenting && language !== '繁體中文' && Boolean(enhancedPresentationScene)
  const totalReveals = usesEnhancedPresentation && enhancedPresentationScene ? enhancedPresentationScene.maxStep : v1TotalReveals
  const visibleRevealIndex = Math.min(revealIndex, totalReveals)

  const previous = useCallback(() => {
    if (visibleRevealIndex > 0) {
      setRevealIndex((current) => Math.max(0, current - 1))
      return
    }
    setSlideIndex((current) => Math.max(0, current - 1))
  }, [visibleRevealIndex])

  const next = useCallback(() => {
    if (visibleRevealIndex < totalReveals) {
      setRevealIndex((current) => Math.min(totalReveals, current + 1))
      return
    }
    setRevealIndex(0)
    setSlideIndex((current) => Math.min(lesson.slides.length - 1, current + 1))
  }, [lesson.slides.length, totalReveals, visibleRevealIndex])

  const jumpToSlide = (index: number) => {
    setRevealIndex(0)
    setSlideIndex(index)
  }

  const exitPresentation = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen?.()
    }
    setIsPresenting(false)
  }, [])

  useEffect(() => {
    const syncFullscreenExit = () => {
      if (isPresenting && document.fullscreenElement !== presentationRef.current) {
        setIsPresenting(false)
      }
    }

    document.addEventListener('fullscreenchange', syncFullscreenExit)
    return () => document.removeEventListener('fullscreenchange', syncFullscreenExit)
  }, [isPresenting])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isFormField = target?.closest('input, textarea, select, [contenteditable="true"]')
      if (isFormField) return

      if (event.key === 'Escape' && isPresenting) {
        event.preventDefault()
        void exitPresentation()
        return
      }

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
  }, [exitPresentation, isPresenting, lesson.slides.length, next, previous])

  const togglePresentation = async () => {
    if (isPresenting) {
      await exitPresentation()
      return
    }

    setIsPresenting(true)
    window.setTimeout(() => {
      void presentationRef.current?.requestFullscreen?.().catch(() => undefined)
    }, 0)
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

        <section className="viewer-stage-area">
          <div className="viewer-stage">
            <SlideCanvas slide={slide} language={language} visibleRevealCount={visibleRevealIndex} />
          </div>
          <div className="viewer-navigation">
            <button type="button" onClick={previous} disabled={slideIndex === 0 && visibleRevealIndex === 0}>← Previous</button>
            <span>Slide {slideIndex + 1} of {lesson.slides.length}{totalReveals > 0 ? ` · Reveal ${visibleRevealIndex} of ${totalReveals}` : ''}</span>
            <button type="button" onClick={next} disabled={slideIndex === lesson.slides.length - 1 && visibleRevealIndex === totalReveals}>Next →</button>
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
      {isPresenting && (
        <div className="classroom-presentation-overlay" ref={presentationRef} role="dialog" aria-label="Classroom presentation mode">
          <PresentationShell
            slide={slide}
            language={language}
            revealIndex={visibleRevealIndex}
            totalReveals={totalReveals}
            totalSlides={lesson.slides.length}
            slideNumber={slideIndex + 1}
            onExit={exitPresentation}
            onPrevious={previous}
            onNext={next}
            canPrevious={slideIndex > 0 || visibleRevealIndex > 0}
            canNext={slideIndex < lesson.slides.length - 1 || visibleRevealIndex < totalReveals}
            fallback={(fallbackSlide, fallbackRevealIndex) => (
              <SlideCanvas slide={fallbackSlide} language={language} visibleRevealCount={fallbackRevealIndex} hideSource />
            )}
          />
        </div>
      )}
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

function studentLabel(label: string, language: LanguageMode) {
  if (language !== '繁體中文') return label

  const labels: Record<string, string> = {
    'Chapter 2.4': '第 2.4 章',
    'Core idea': '核心概念',
    'Vocabulary map': '詞彙地圖',
    'Explain the pattern': '解釋規律',
    Retrieval: '複習提取',
    Compare: '比較',
    'Biome close-up': '生物群系特寫',
    'Question of the Day': '\u4eca\u65e5\u554f\u984c',
    'Exit check': '課堂檢核',
    CLIMATE: '氣候 CLIMATE',
    ORGANISMS: '生物 ORGANISMS',
    BIOME: '生物群系 BIOME',
    'temperature + precipitation': '溫度 + 降水量',
    'plants + animals': '植物 + 動物',
    'similar land ecosystems': '相似的陸地生態系',
    'A biome is a group of land ecosystems with similar climates and organisms.': '生物群系是由氣候和生物相似的陸地生態系組成。',
    Question: '問題',
    'Increasing annual precipitation': '年降水量增加',
    'cm per year': '公分 / 年',
    'MORE PRECIPITATION -> DIFFERENT ECOSYSTEM CONDITIONS': '降水量越多 -> 生態系條件越不同',
    'annual precipitation (cm/year)': '年降水量（公分 / 年）',
    'Climate shapes life': '氣候塑造生命',
    'factors determine biome': '\u6c7a\u5b9a\u751f\u7269\u7fa4\u7cfb\u7684\u56e0\u7d20',
    '< 25 cm rain/year': '\u6bcf\u5e74\u964d\u96e8\u5c11\u65bc 25 \u516c\u5206',
    'migration + thick fur': '\u9077\u5f99 + \u539a\u6bdb',
    'Canopy': '\u6a39\u51a0\u5c64 Canopy',
    'Understory': '\u6797\u4e0b\u5c64 Understory',
    'Prairie': '\u5927\u8349\u539f Prairie',
    'Savanna': '\u7a00\u6a39\u8349\u539f Savanna',
    'rain/year - grasses with few trees': '\u6bcf\u5e74\u964d\u96e8 - \u4ee5\u8349\u70ba\u4e3b\uff0c\u6a39\u6728\u8f03\u5c11',
    'rain/year - grasses with scattered trees': '\u6bcf\u5e74\u964d\u96e8 - \u4ee5\u8349\u70ba\u4e3b\uff0c\u6709\u96f6\u661f\u6a39\u6728',
    'Source PPT slide 99': '\u539f\u59cb PPT \u7b2c 99 \u5f35',
    'climate + organisms': '\u6c23\u5019 + \u751f\u7269',
    'warm or moderate + lots of rain': '\u6eab\u6696\u6216\u9069\u4e2d + \u5927\u91cf\u964d\u96e8',
    'canopy over understory': '\u6a39\u51a0\u5c64\u5728\u6797\u4e0b\u5c64\u4e0a\u65b9',
    'cooler nights support activity': '\u8f03\u6dbc\u7684\u591c\u665a\u652f\u6301\u52d5\u7269\u6d3b\u52d5',
    'prairie and savanna': '\u5927\u8349\u539f + \u7a00\u6a39\u8349\u539f',
    'rich soil, limited trees': '\u80a5\u6c83\u571f\u58e4\uff0c\u6a39\u6728\u53d7\u9650',
    'shed leaves, grow new ones': '\u843d\u8449\uff0c\u518d\u9577\u51fa\u65b0\u8449',
    'rain + seasonal change': '\u964d\u96e8 + \u5b63\u7bc0\u8b8a\u5316',
    'cones + needles': '\u6bec\u679c + \u91dd\u72c0\u8449',
    'herbivores and carnivores': '\u8349\u98df\u52d5\u7269 + \u8089\u98df\u52d5\u7269',
    'permafrost': '\u6c38\u4e45\u51cd\u571f permafrost',
    'long days, short season': '\u9577\u65e5\u7167\uff0c\u77ed\u5b63\u7bc0',
    'not part of any major biome': '\u4e0d\u5c6c\u65bc\u4efb\u4f55\u4e3b\u8981\u751f\u7269\u7fa4\u7cfb',
    'less rain -> more rain': '\u964d\u96e8\u8f03\u5c11 -> \u964d\u96e8\u8f03\u591a',
    'prove it with source evidence': '\u7528\u539f\u59cb\u6559\u6750\u8b49\u64da\u8aaa\u660e',
    'Desert': '\u6c99\u6f20 Desert',
    'Rain forest': '\u96e8\u6797 Rain forest',
    'reaction starting push': '反應開始的推力',
    'energy + orientation': '能量 + 方向',
    'minimum energy for products': '形成生成物的最低能量',
    'reactants -> barrier -> products': '反應物 -> 障礙 -> 生成物',
    'lower activation energy': '降低活化能',
    'helps, then remains': '幫助反應，然後保持不變',
    'more successful collisions': '更多成功碰撞',
    'use all three terms': '使用三個關鍵詞',
    'energy moves': '能量移動',
    'track energy direction': '追蹤能量方向',
    'energy leaves the system': '能量離開系統',
    'energy enters the system': '能量進入系統',
    'products lower or higher?': '生成物較低還是較高？',
    'use energy direction': '使用能量方向',
    'products lower than reactants': '生成物低於反應物',
    'system + surroundings + energy': '系統 + 周圍環境 + 能量',
    'successful collisions': '成功碰撞',
    'reaction energy profile': '反應能量圖',
    'energy transfer': '能量轉移',
    'solute + solvent -> solution': '溶質 + 溶劑 -> 溶液',
    'same volume, different solute amount': '相同體積，不同溶質量',
    'relative amount of solute': '溶質的相對多少',
    'solute amount compared with volume': '溶質量與體積比較',
    'maximum dissolved solute': '最大已溶解溶質量',
    'can dissolve more?': '還能再溶解嗎？',
    'use solute and volume': '使用溶質與體積',
    'maximum dissolved at a temperature': '某溫度下最大可溶解量',
    'temperature + solubility': '溫度 + 溶解度',
    'x-axis temperature, y-axis mass': 'x 軸溫度，y 軸質量',
    'temperature -> curve -> solubility': '溫度 -> 曲線 -> 溶解度',
    'same temperature, different curves': '相同溫度，不同曲線',
    'below, on, above': '曲線下、曲線上、曲線上方',
    'axis, curve, value, interpretation': '座標軸、曲線、數值、解釋',
    'Solution model': '溶液模型',
    'Graph reading': '圖表讀取',
    'organisms + environment': '生物 + 環境',
    'biotic + abiotic factors': '生物因子 + 非生物因子',
    'living or non-living?': '有生命還是沒有生命？',
    'habitat conditions matter': '棲地條件很重要',
    'survival and growth': '生存和生長',
    'feeding, resources, conditions': '覓食、資源、條件',
    'classify, then explain': '先分類，再解釋',
    'biotic + abiotic': '生物因子 + 非生物因子',
    'changes spread through food webs': '變化會在食物網中擴散',
    'producer -> consumers': '生產者 -> 消費者',
    'many feeding links': '許多覓食連結',
    'predict two consequences': '預測兩個結果',
    'one change, several effects': '一個變化，數個影響',
    'change + link + effect': '變化 + 連結 + 影響',
    'observe, classify, explain': '觀察、分類、解釋',
    'prediction + feeding link': '預測 + 覓食連結',
    'Aquatic model': '水域模型',
    'Food-web reasoning': '食物網推理',
  }

  return labels[label] ?? label
}

function isSolutionSlide(slide: LessonSlide) {
  return slide.id.includes('j1-ch3-')
}

function isJ2EcosystemSlide(slide: LessonSlide) {
  return slide.id.includes('j2-ch2-')
}

function SlideCanvas({
  slide,
  language,
  visibleRevealCount,
  hideSource = false,
}: {
  slide: LessonSlide
  language: LanguageMode
  visibleRevealCount: number
  hideSource?: boolean
}) {
  const visibleReveals = slide.revealMode === 'step-by-step' ? slide.reveals?.slice(0, visibleRevealCount) ?? [] : slide.reveals ?? []
  const layout = slide.layout ?? 'concept'
  const j2EcosystemSlide = isJ2EcosystemSlide(slide)

  if (j2EcosystemSlide) {
    return <AquaticEnhancedSlide slide={slide} language={language} visibleRevealCount={visibleRevealCount} hideSource={hideSource} />
  }

  return (
    <article className={`slide-canvas slide-canvas--${slide.visual} slide-layout slide-layout--${layout}${j2EcosystemSlide ? ' slide-canvas--j2-ecosystems' : ''}${slide.biomeKey ? ` slide-biome--${slide.biomeKey}` : ''}`}>
      {layout === 'hero' && <HeroVisualSlide slide={slide} language={language} visibleReveals={visibleReveals} />}
      {layout === 'concept' && <ConceptSlide slide={slide} language={language} visibleReveals={visibleReveals} />}
      {layout === 'vocabulary' && <VocabularySlide slide={slide} language={language} visibleReveals={visibleReveals} />}
      {layout === 'diagram' && <DiagramSlide slide={slide} language={language} visibleReveals={visibleReveals} />}
      {layout === 'comparison' && <ComparisonSlide slide={slide} language={language} visibleReveals={visibleReveals} />}
      {layout === 'image-focus' && <ImageFocusSlide slide={slide} language={language} visibleReveals={visibleReveals} />}
      {layout === 'question' && <QuestionSlide slide={slide} language={language} visibleReveals={visibleReveals} />}
      {slide.sourceId && !hideSource && <span className="slide-source">Source: {slide.sourceId}</span>}
      <span className="slide-corner">IED SCIENCE</span>
    </article>
  )
}

function SlideTitle({ slide, language, kicker }: { slide: LessonSlide; language: LanguageMode; kicker?: string }) {
  return (
    <div className="slide-title-block">
      {kicker && <span className="slide-label">{studentLabel(kicker, language)}</span>}
      {(language === 'English' || language === 'Bilingual') && <h1>{slide.title.en}</h1>}
      {language === '繁體中文' && <h1 lang="zh-Hant">{slide.title.zhHant ?? slide.title.en}</h1>}
      {language === 'Bilingual' && slide.title.zhHant && <h2 lang="zh-Hant">{slide.title.zhHant}</h2>}
      {slide.emphasis && <strong className="slide-emphasis">{studentLabel(slide.emphasis, language)}</strong>}
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
  const isReactionSlide = slide.id.includes('reactions') || slide.id.includes('energy-change')
  const solutionSlide = isSolutionSlide(slide)
  const j2EcosystemSlide = isJ2EcosystemSlide(slide)

  return (
    <>
      {j2EcosystemSlide ? <AquaticHeroScene slide={slide} language={language} /> : solutionSlide ? <SolutionHeroScene slide={slide} language={language} /> : isReactionSlide ? <ReactionHeroScene slide={slide} language={language} /> : <SciencePhoto slide={slide} className="slide-photo slide-photo--full" />}
      <section className="slide-hero-copy">
        <SlideTitle slide={slide} language={language} kicker={j2EcosystemSlide || solutionSlide || isReactionSlide ? 'Core idea' : 'Chapter 2.4'} />
        <SlideBody slide={slide} language={language} />
        <RevealStack items={visibleReveals} language={language} mode="prompts" />
      </section>
    </>
  )
}

function ConceptSlide({ slide, language, visibleReveals }: SlideLayoutProps) {
  const isReactionSlide = slide.id.includes('reactions') || slide.id.includes('energy-system')
  const solutionSlide = isSolutionSlide(slide)
  const j2EcosystemSlide = isJ2EcosystemSlide(slide)

  return (
    <>
      <section className="slide-concept-main">
        <SlideTitle slide={slide} language={language} kicker="Core idea" />
        <SlideBody slide={slide} language={language} />
        {j2EcosystemSlide && <RevealStack items={visibleReveals} language={language} mode="statements" />}
      </section>
      {j2EcosystemSlide ? <AquaticConceptMap slide={slide} language={language} /> : solutionSlide ? <SolutionConceptMap slide={slide} language={language} /> : isReactionSlide ? <ReactionConceptMap slide={slide} language={language} /> : <BiomeConceptMap language={language} />}
      {!j2EcosystemSlide && <RevealStack items={visibleReveals} language={language} mode="statements" />}
    </>
  )
}

function AquaticHeroScene({ slide, language }: { slide: LessonSlide; language: LanguageMode }) {
  const foodWeb = slide.id.includes('food-web')

  return (
    <section className={`aquatic-hero-scene ${foodWeb ? 'aquatic-hero-scene--food-web' : ''}`} aria-label="Aquatic ecosystem teaching scene">
      <div className="aquatic-waterline" />
      <span className="aquatic-fish aquatic-fish--one" />
      <span className="aquatic-fish aquatic-fish--two" />
      <span className="aquatic-plant aquatic-plant--one" />
      <span className="aquatic-plant aquatic-plant--two" />
      <span className="aquatic-sun" />
      {foodWeb && <AquaticFoodWebDiagram language={language} visibleCount={3} compact />}
      <div className="aquatic-hero-label">
        <strong>{foodWeb ? (language === '繁體中文' ? '食物網' : 'food web') : (language === '繁體中文' ? '水域棲地' : 'aquatic habitat')}</strong>
        <span>{foodWeb ? (language === '繁體中文' ? '追蹤覓食連結' : 'trace feeding links') : (language === '繁體中文' ? '生物和非生物因子互動' : 'biotic and abiotic factors interact')}</span>
      </div>
    </section>
  )
}

function AquaticConceptMap({ slide, language }: { slide: LessonSlide; language: LanguageMode }) {
  const foodWeb = slide.id.includes('food-web-model')
  const factors = foodWeb
    ? [
        { className: 'concept-factor--aquatic-biotic', title: language === '繁體中文' ? '生產者' : 'PRODUCER', subtitle: language === '繁體中文' ? '食物來源開始' : 'starts food source' },
        { className: 'concept-factor--aquatic-abiotic', title: language === '繁體中文' ? '消費者' : 'CONSUMERS', subtitle: language === '繁體中文' ? '透過覓食連結' : 'connected by feeding' },
        { className: 'concept-factor--aquatic-system', title: language === '繁體中文' ? '食物網' : 'FOOD WEB', subtitle: language === '繁體中文' ? '多條相連路徑' : 'many connected paths' },
      ]
    : [
        { className: 'concept-factor--aquatic-biotic', title: language === '繁體中文' ? '生物因子' : 'BIOTIC', subtitle: language === '繁體中文' ? '有生命的部分' : 'living parts' },
        { className: 'concept-factor--aquatic-abiotic', title: language === '繁體中文' ? '非生物因子' : 'ABIOTIC', subtitle: language === '繁體中文' ? '沒有生命的部分' : 'non-living parts' },
        { className: 'concept-factor--aquatic-system', title: language === '繁體中文' ? '生態系' : 'ECOSYSTEM', subtitle: language === '繁體中文' ? '互動的系統' : 'interacting system' },
      ]

  return (
    <section className="concept-map aquatic-concept-map" aria-label="Aquatic ecosystem concept map">
      <div className="concept-map__equation aquatic-concept-map__flow">
        {factors.map((factor, index) => (
          <Fragment key={factor.title}>
            <article className={`concept-factor ${factor.className}`}>
              <strong>{factor.title}</strong>
              <span>{factor.subtitle}</span>
            </article>
            {index < factors.length - 1 && <b aria-hidden="true">{foodWeb ? '→' : index === 0 ? '+' : '='}</b>}
          </Fragment>
        ))}
      </div>
      <div className="concept-definition">
        {foodWeb
          ? (language === '繁體中文' ? '食物網顯示多條覓食連結，因此一個族群的變化可能影響多種生物。' : 'A food web shows many feeding links, so one population change can affect several organisms.')
          : (language === '繁體中文' ? '水域生態系包含生物因子和非生物因子，兩者都會影響生物。' : 'Aquatic ecosystems include biotic and abiotic factors, and both affect organisms.')}
      </div>
    </section>
  )
}

function SolutionHeroScene({ slide, language }: { slide: LessonSlide; language: LanguageMode }) {
  const graphMode = slide.id.includes('solubility')

  return (
    <section className={`solution-hero-scene ${graphMode ? 'solution-hero-scene--graph' : ''}`} aria-label="Solutions and solubility teaching model">
      <div className="solution-hero-beaker">
        <span className="solution-liquid" />
        <span className="solution-particle solution-particle--1" />
        <span className="solution-particle solution-particle--2" />
        <span className="solution-particle solution-particle--3" />
        <span className="solution-particle solution-particle--4" />
        <span className="solution-undissolved" />
      </div>
      <div className="solution-hero-card">
        <strong>{graphMode ? (language === '繁體中文' ? '溶解度曲線' : 'solubility curve') : (language === '繁體中文' ? '溶液模型' : 'solution model')}</strong>
        <span>{graphMode ? (language === '繁體中文' ? '溫度對應最大可溶解量' : 'temperature maps to maximum dissolved amount') : (language === '繁體中文' ? '溶質分散在溶劑中' : 'solute spreads through solvent')}</span>
      </div>
      {graphMode && <SolubilityCurveBoard language={language} visibleCount={4} />}
    </section>
  )
}

function SolutionConceptMap({ slide, language }: { slide: LessonSlide; language: LanguageMode }) {
  const graphMode = slide.id.includes('temperature-solubility')
  const factors = graphMode
    ? [
        { className: 'concept-factor--solution-solvent', title: language === '繁體中文' ? '溫度' : 'TEMPERATURE', subtitle: language === '繁體中文' ? 'x 軸讀取' : 'read on x-axis' },
        { className: 'concept-factor--solution-solute', title: language === '繁體中文' ? '曲線' : 'CURVE', subtitle: language === '繁體中文' ? '指定物質' : 'substance named' },
        { className: 'concept-factor--solution-final', title: language === '繁體中文' ? '溶解度' : 'SOLUBILITY', subtitle: language === '繁體中文' ? 'y 軸最大質量' : 'maximum mass on y-axis' },
      ]
    : [
        { className: 'concept-factor--solution-solute', title: language === '繁體中文' ? '溶質' : 'SOLUTE', subtitle: language === '繁體中文' ? '被溶解的物質' : 'substance that dissolves' },
        { className: 'concept-factor--solution-solvent', title: language === '繁體中文' ? '溶劑' : 'SOLVENT', subtitle: language === '繁體中文' ? '使溶質溶解' : 'does the dissolving' },
        { className: 'concept-factor--solution-final', title: language === '繁體中文' ? '溶液' : 'SOLUTION', subtitle: language === '繁體中文' ? '均勻分散' : 'evenly spread mixture' },
      ]

  return (
    <section className="concept-map solution-concept-map" aria-label="Solution concept map">
      <div className="concept-map__equation solution-concept-map__flow">
        {factors.map((factor, index) => (
          <Fragment key={factor.title}>
            <article className={`concept-factor ${factor.className}`}>
              <strong>{factor.title}</strong>
              <span>{factor.subtitle}</span>
            </article>
            {index < factors.length - 1 && <b aria-hidden="true">{graphMode ? '→' : index === 0 ? '+' : '='}</b>}
          </Fragment>
        ))}
      </div>
      <div className="concept-definition">
        {graphMode
          ? (language === '繁體中文' ? '閱讀溶解度曲線時，要先確認物質，再用溫度找到最大可溶解量。' : 'When reading a solubility curve, identify the substance first, then use temperature to find the maximum dissolved amount.')
          : (language === '繁體中文' ? '濃度比較的是已溶解溶質量與溶液體積的關係。' : 'Concentration compares dissolved solute amount with solution volume.')}
      </div>
    </section>
  )
}

function ReactionHeroScene({ slide, language }: { slide: LessonSlide; language: LanguageMode }) {
  const energyChange = slide.id.includes('energy-change')

  return (
    <section className={`reaction-hero-scene ${energyChange ? 'reaction-hero-scene--energy' : ''}`} aria-label="Reaction particle model">
      <div className="particle-track">
        <span className="particle particle--one" />
        <span className="particle particle--two" />
        <span className="particle particle--three" />
        <span className="particle particle--four" />
      </div>
      <div className="reaction-hero-barrier">
        <strong>{energyChange ? (language === '繁體中文' ? '能量轉移' : 'energy transfer') : (language === '繁體中文' ? '活化能' : 'activation energy')}</strong>
        <span>{energyChange ? (language === '繁體中文' ? '進入或離開系統' : 'into or out of system') : (language === '繁體中文' ? '反應開始前必須越過' : 'must be crossed before reaction starts')}</span>
      </div>
    </section>
  )
}

function BiomeConceptMap({ language }: { language: LanguageMode }) {
  return (
    <section className="concept-map" aria-label="Climate and organisms form a biome">
      <div className="concept-map__equation">
        <article className="concept-factor concept-factor--climate">
          <strong>{studentLabel('CLIMATE', language)}</strong>
          <span>{studentLabel('temperature + precipitation', language)}</span>
        </article>
        <b aria-hidden="true">+</b>
        <article className="concept-factor concept-factor--organisms">
          <strong>{studentLabel('ORGANISMS', language)}</strong>
          <span>{studentLabel('plants + animals', language)}</span>
        </article>
        <b aria-hidden="true">=</b>
        <article className="concept-factor concept-factor--biome">
          <strong>{studentLabel('BIOME', language)}</strong>
          <span>{studentLabel('similar land ecosystems', language)}</span>
        </article>
      </div>
      <div className="concept-definition">{studentLabel('A biome is a group of land ecosystems with similar climates and organisms.', language)}</div>
    </section>
  )
}

function ReactionConceptMap({ slide, language }: { slide: LessonSlide; language: LanguageMode }) {
  const isSystemSlide = slide.id.includes('energy-system')
  const factors = isSystemSlide
    ? [
        { className: 'concept-factor--reactants', title: language === '繁體中文' ? '系統' : 'SYSTEM', subtitle: language === '繁體中文' ? '正在反應的化學物質' : 'reacting chemicals' },
        { className: 'concept-factor--barrier', title: language === '繁體中文' ? '能量方向' : 'ENERGY DIRECTION', subtitle: language === '繁體中文' ? '進入或離開系統' : 'into or out of the system' },
        { className: 'concept-factor--products', title: language === '繁體中文' ? '周圍環境' : 'SURROUNDINGS', subtitle: language === '繁體中文' ? '空氣、容器、手、溫度計' : 'air, container, hand, thermometer' },
      ]
    : [
        { className: 'concept-factor--reactants', title: language === '繁體中文' ? '反應物' : 'REACTANTS', subtitle: language === '繁體中文' ? '具有儲存的化學能' : 'stored chemical energy' },
        { className: 'concept-factor--barrier', title: language === '繁體中文' ? '活化能' : 'ACTIVATION ENERGY', subtitle: language === '繁體中文' ? '必須越過的最低能量' : 'minimum energy barrier' },
        { className: 'concept-factor--products', title: language === '繁體中文' ? '生成物' : 'PRODUCTS', subtitle: language === '繁體中文' ? '成功碰撞後形成' : 'form after successful collisions' },
      ]

  return (
    <section className="concept-map reaction-concept-map" aria-label="Reaction concept map">
      <div className="concept-map__equation reaction-concept-map__flow">
        {factors.map((factor, index) => (
          <Fragment key={factor.title}>
            <article className={`concept-factor ${factor.className}`}>
              <strong>{factor.title}</strong>
              <span>{factor.subtitle}</span>
            </article>
            {index < factors.length - 1 && <b aria-hidden="true">→</b>}
          </Fragment>
        ))}
      </div>
      <div className="concept-definition">
        {isSystemSlide
          ? (language === '繁體中文' ? '判斷吸熱或放熱時，要追蹤能量穿過系統邊界的方向。' : 'To classify endothermic or exothermic reactions, track energy across the system boundary.')
          : (language === '繁體中文' ? '反應開始前，粒子必須以足夠能量碰撞並越過活化能障礙。' : 'Before a reaction starts, particles must collide with enough energy to pass the activation-energy barrier.')}
      </div>
    </section>
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
  const isReaction = slide.id.includes('reactions') || slide.id.includes('exothermic') || slide.id.includes('endothermic')
  const solutionSlide = isSolutionSlide(slide)
  const j2EcosystemSlide = isJ2EcosystemSlide(slide)

  return (
    <>
      <section className="slide-diagram-copy">
        <SlideTitle slide={slide} language={language} kicker={j2EcosystemSlide ? 'Aquatic model' : solutionSlide ? 'Solution model' : isReaction ? 'reaction energy profile' : 'Explain the pattern'} />
        <SlideBody slide={slide} language={language} />
        <RevealStack items={visibleReveals} language={language} mode={isClimate ? 'statements' : 'stack'} />
      </section>
      <TeachingDiagram slide={slide} language={language} />
    </>
  )
}

function ComparisonSlide({ slide, language, visibleReveals }: SlideLayoutProps) {
  const isRainfall = slide.id.includes('rainfall-spectrum')
  const isReaction = slide.id.includes('reactions') || slide.id.includes('energy-profile')
  const solutionSlide = isSolutionSlide(slide)
  const j2EcosystemSlide = isJ2EcosystemSlide(slide)

  return (
    <>
      <section className="slide-comparison-heading">
        <SlideTitle slide={slide} language={language} kicker={j2EcosystemSlide ? 'Food-web reasoning' : solutionSlide && slide.visual === 'graph' ? 'Graph reading' : isReaction ? 'energy transfer' : isRainfall ? 'Retrieval' : 'Compare'} />
        <SlideBody slide={slide} language={language} />
      </section>
      {j2EcosystemSlide ? <AquaticComparison slide={slide} language={language} visibleCount={visibleReveals.length} /> : solutionSlide ? <SolutionComparison slide={slide} language={language} visibleCount={visibleReveals.length} /> : isReaction ? <ReactionComparison slide={slide} language={language} visibleCount={visibleReveals.length} /> : isRainfall ? <RainfallSpectrum visibleCount={visibleReveals.length} language={language} /> : <GrasslandComparison language={language} />}
      {!isRainfall && !isReaction && !solutionSlide && !j2EcosystemSlide && <RevealStack items={visibleReveals} language={language} mode="chips" />}
    </>
  )
}

function ImageFocusSlide({ slide, language, visibleReveals }: SlideLayoutProps) {
  return (
    <>
      <SciencePhoto slide={slide} className="slide-photo slide-photo--panel">
        {slide.biomeKey === 'rainforest' && (
          <>
            <span className="photo-label photo-label--canopy">{studentLabel('Canopy', language)}</span>
            <span className="photo-label photo-label--understory">{studentLabel('Understory', language)}</span>
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
  const kicker = slide.id.includes('question-day') ? 'Question of the Day' : 'Exit check'

  return (
    <>
      <section className="slide-question-copy">
        <SlideTitle slide={slide} language={language} kicker={kicker} />
        <SlideBody slide={slide} language={language} />
      </section>
      {currentQuestion && (
        <section className="exit-question-focus" aria-live="polite">
          <span>{studentLabel('Question', language)} {visibleReveals.length}</span>
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

function TeachingDiagram({ slide, language }: { slide: LessonSlide; language: LanguageMode }) {
  if (isJ2EcosystemSlide(slide)) {
    return <AquaticTeachingDiagram slide={slide} language={language} />
  }

  if (isSolutionSlide(slide)) {
    return <SolutionTeachingDiagram slide={slide} language={language} />
  }

  if (slide.id.includes('energy-profile') || slide.id.includes('exothermic') || slide.id.includes('endothermic')) {
    return <ReactionEnergyDiagram slide={slide} language={language} />
  }

  if (slide.id.includes('catalyst-not-used')) {
    return <CatalystCycleDiagram language={language} />
  }

  if (slide.id.includes('climate-drivers')) {
    return (
      <section className="climate-concept-diagram" aria-label="Conceptual temperature and precipitation biome diagram">
        <div className="climate-question">{language === '繁體中文' ? '哪兩個氣候因素會幫助決定生物群系？' : 'What two climate factors help determine the biome?'}</div>
        <div className="climate-axis climate-axis--temperature" aria-hidden="true">
          <span>{language === '繁體中文' ? '冷' : 'cold'}</span>
          <i />
          <span>{language === '繁體中文' ? '熱' : 'hot'}</span>
        </div>
        <div className="climate-axis climate-axis--precipitation" aria-hidden="true">
          <span>{language === '繁體中文' ? '濕' : 'wet'}</span>
          <i />
          <span>{language === '繁體中文' ? '乾' : 'dry'}</span>
        </div>
        <div className="climate-field">
          <span className="climate-marker climate-marker--tundra">{language === '繁體中文' ? '冷 + 乾' : 'cold + dry'}<br /><strong>{language === '繁體中文' ? '凍原 tundra' : 'tundra'}</strong></span>
          <span className="climate-marker climate-marker--desert">{language === '繁體中文' ? '熱 + 乾' : 'hot + dry'}<br /><strong>{language === '繁體中文' ? '沙漠 desert' : 'desert'}</strong></span>
          <span className="climate-marker climate-marker--grassland">{language === '繁體中文' ? '季節性降雨' : 'seasonal rain'}<br /><strong>{language === '繁體中文' ? '草原 grassland' : 'grassland'}</strong></span>
          <span className="climate-marker climate-marker--rainforest">{language === '繁體中文' ? '熱 + 濕' : 'hot + wet'}<br /><strong>{language === '繁體中文' ? '雨林 rain forest' : 'rain forest'}</strong></span>
        </div>
        <div className="climate-rule">
          <strong>{language === '繁體中文' ? '溫度 + 降水量' : 'TEMPERATURE + PRECIPITATION'}</strong>
          <span>{language === '繁體中文' ? '提供判斷生物群系條件的氣候線索。' : 'give the climate clues for biome conditions.'}</span>
        </div>
      </section>
    )
  }

  if (slide.biomeKey === 'desert') {
    return (
      <section className="teaching-visual-stack" aria-label="Desert image and water balance">
        <SciencePhoto slide={slide} className="slide-photo slide-photo--diagram slide-photo--short" />
        <div className="desert-balance" aria-label="Desert evaporation and precipitation comparison">
          <div><span>{language === '繁體中文' ? '水分進入' : 'water in'}</span><strong>&lt; 25 cm</strong><small>{language === '繁體中文' ? '每年降雨' : 'rain per year'}</small></div>
          <b>&lt;</b>
          <div><span>{language === '繁體中文' ? '水分流失' : 'water out'}</span><strong>{language === '繁體中文' ? '蒸發 evaporation' : 'evaporation'}</strong><small>{language === '繁體中文' ? '超過降水量' : 'exceeds precipitation'}</small></div>
        </div>
      </section>
    )
  }

  if (slide.biomeKey === 'tundra') {
    return (
      <section className="teaching-visual-stack" aria-label="Tundra landscape and permafrost cross-section">
        <SciencePhoto slide={slide} className="slide-photo slide-photo--diagram slide-photo--short" />
        <div className="permafrost-diagram" aria-label="Permafrost cross-section diagram">
          <div className="permafrost-surface"><span>{language === '繁體中文' ? '夏季表層' : 'summer surface'}</span><strong>{language === '繁體中文' ? '濕軟地面' : 'marshy ground'}</strong></div>
          <div className="permafrost-active"><span>{language === '繁體中文' ? '活動層' : 'active layer'}</span><strong>{language === '繁體中文' ? '短暫融化' : 'brief thaw'}</strong></div>
          <div className="permafrost-layer"><span>{language === '繁體中文' ? '永凍土 permafrost' : 'permafrost'}</span><strong>{language === '繁體中文' ? '全年凍結的土壤' : 'frozen soil all year'}</strong></div>
        </div>
      </section>
    )
  }

  return <SciencePhoto slide={slide} className="slide-photo slide-photo--diagram" />
}

function AquaticTeachingDiagram({ slide, language }: { slide: LessonSlide; language: LanguageMode }) {
  if (slide.id.includes('food-chain') || slide.id.includes('population-change')) {
    return <AquaticFoodWebDiagram language={language} visibleCount={slide.id.includes('population-change') ? 4 : 3} />
  }

  const factors = [
    { title: language === '繁體中文' ? '生物因子' : 'Biotic', detail: language === '繁體中文' ? '魚、水生植物、藻類' : 'fish, aquatic plants, algae', className: 'aquatic-factor-card--biotic' },
    { title: language === '繁體中文' ? '非生物因子' : 'Abiotic', detail: language === '繁體中文' ? '水、光、溫度' : 'water, light, temperature', className: 'aquatic-factor-card--abiotic' },
    { title: language === '繁體中文' ? '棲地影響' : 'Habitat effect', detail: language === '繁體中文' ? '影響生存和生長' : 'affects survival and growth', className: 'aquatic-factor-card--effect' },
  ]

  return (
    <section className="aquatic-factor-diagram" aria-label="Aquatic ecosystem factors">
      <div className="aquatic-factor-pond">
        <span className="aquatic-sun" />
        <span className="aquatic-fish aquatic-fish--one" />
        <span className="aquatic-fish aquatic-fish--two" />
        <span className="aquatic-plant aquatic-plant--one" />
        <span className="aquatic-plant aquatic-plant--two" />
      </div>
      <div className="aquatic-factor-list">
        {factors.map((factor) => (
          <article className={factor.className} key={factor.title}>
            <strong>{factor.title}</strong>
            <span>{factor.detail}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

function AquaticComparison({ slide, language, visibleCount }: { slide: LessonSlide; language: LanguageMode; visibleCount: number }) {
  if (slide.id.includes('food') || slide.id.includes('producer')) {
    return <AquaticFoodWebDiagram language={language} visibleCount={visibleCount} showChange={slide.id.includes('remove-producer')} />
  }

  if (slide.id.includes('freshwater-marine')) {
    const habitats = [
      { title: language === '繁體中文' ? '淡水' : 'Freshwater', detail: language === '繁體中文' ? '河流、湖泊、池塘' : 'rivers, lakes, ponds', className: 'aquatic-habitat-card--fresh' },
      { title: language === '繁體中文' ? '海洋' : 'Marine', detail: language === '繁體中文' ? '海域和海洋' : 'seas and oceans', className: 'aquatic-habitat-card--marine' },
    ]

    return (
      <section className="aquatic-habitat-comparison" aria-label="Freshwater and marine habitat comparison">
        {habitats.map((habitat, index) => (
          <article className={`${habitat.className} ${index < Math.max(1, visibleCount) ? 'is-visible' : ''}`} key={habitat.title}>
            <span className="aquatic-water-surface" />
            <strong>{habitat.title}</strong>
            <small>{habitat.detail}</small>
          </article>
        ))}
      </section>
    )
  }

  const sortCards = [
    { title: language === '繁體中文' ? '生物因子' : 'Biotic factors', detail: language === '繁體中文' ? '有生命：魚、植物、藻類' : 'living: fish, plants, algae', className: 'aquatic-sort-card--biotic' },
    { title: language === '繁體中文' ? '非生物因子' : 'Abiotic factors', detail: language === '繁體中文' ? '無生命：水、光、溫度' : 'non-living: water, light, temperature', className: 'aquatic-sort-card--abiotic' },
  ]

  return (
    <section className="aquatic-sort-comparison" aria-label="Biotic and abiotic factor sort">
      {sortCards.map((card, index) => (
        <article className={`${card.className} ${index < Math.max(1, visibleCount) ? 'is-visible' : ''}`} key={card.title}>
          <strong>{card.title}</strong>
          <span>{card.detail}</span>
        </article>
      ))}
    </section>
  )
}

function AquaticFoodWebDiagram({
  language,
  visibleCount,
  compact = false,
  showChange = false,
}: {
  language: LanguageMode
  visibleCount: number
  compact?: boolean
  showChange?: boolean
}) {
  const nodes = [
    { key: 'producer', label: language === '繁體中文' ? '藻類 / 水生植物' : 'algae / aquatic plants', className: 'aquatic-web-node--producer' },
    { key: 'small', label: language === '繁體中文' ? '小型消費者' : 'small consumer', className: 'aquatic-web-node--small' },
    { key: 'fish', label: language === '繁體中文' ? '魚' : 'fish', className: 'aquatic-web-node--fish' },
    { key: 'predator', label: language === '繁體中文' ? '較大型掠食者' : 'larger predator', className: 'aquatic-web-node--predator' },
  ]

  return (
    <section className={`aquatic-food-web ${compact ? 'aquatic-food-web--compact' : ''}`} aria-label="Aquatic food web diagram">
      <div className="aquatic-web-canvas">
        {nodes.map((node, index) => (
          <article className={`aquatic-web-node ${node.className} ${index < Math.max(1, visibleCount) ? 'is-visible' : ''}${showChange && index === 0 ? ' is-reduced' : ''}`} key={node.key}>
            <span>{node.label}</span>
          </article>
        ))}
        <span className={`aquatic-web-link aquatic-web-link--one ${visibleCount >= 1 ? 'is-visible' : ''}`} />
        <span className={`aquatic-web-link aquatic-web-link--two ${visibleCount >= 2 ? 'is-visible' : ''}`} />
        <span className={`aquatic-web-link aquatic-web-link--three ${visibleCount >= 3 ? 'is-visible' : ''}`} />
        {showChange && <span className={`aquatic-web-change ${visibleCount >= 1 ? 'is-visible' : ''}`}>{language === '繁體中文' ? '減少' : 'decrease'}</span>}
      </div>
      <div className="aquatic-web-caption">
        {language === '繁體中文' ? '用箭頭追蹤覓食連結，再預測影響。' : 'Trace feeding links with arrows, then predict effects.'}
      </div>
    </section>
  )
}

function SolutionTeachingDiagram({ slide, language }: { slide: LessonSlide; language: LanguageMode }) {
  if (slide.visual === 'graph') {
    return <SolubilityCurveBoard language={language} visibleCount={3} compact />
  }

  const saturation = slide.id.includes('saturation') || slide.id.includes('solubility-definition')
  const states = saturation
    ? [
        { title: language === '繁體中文' ? '加入溶質' : 'add solute', detail: language === '繁體中文' ? '溶解' : 'dissolves', particles: 5 },
        { title: language === '繁體中文' ? '繼續加入' : 'add more', detail: language === '繁體中文' ? '仍可溶解' : 'still dissolves', particles: 8 },
        { title: language === '繁體中文' ? '達到最大值' : 'maximum reached', detail: language === '繁體中文' ? '固體留下' : 'solid remains', particles: 10, sediment: true },
      ]
    : [
        { title: language === '繁體中文' ? '溶質' : 'solute', detail: language === '繁體中文' ? '被溶解' : 'dissolves', particles: 4 },
        { title: language === '繁體中文' ? '溶劑' : 'solvent', detail: language === '繁體中文' ? '使其溶解' : 'does dissolving', particles: 2 },
        { title: language === '繁體中文' ? '溶液' : 'solution', detail: language === '繁體中文' ? '均勻分散' : 'spread evenly', particles: 8 },
      ]

  return (
    <section className={`solution-sequence ${saturation ? 'solution-sequence--saturation' : ''}`} aria-label="Solution particle sequence">
      {states.map((state) => (
        <article key={state.title}>
          <div className="solution-mini-beaker">
            <span className="solution-mini-liquid" />
            {Array.from({ length: state.particles }, (_, index) => <span className={`solution-dot solution-dot--${index % 5}`} key={index} />)}
            {state.sediment && <span className="solution-mini-sediment" />}
          </div>
          <strong>{state.title}</strong>
          <span>{state.detail}</span>
        </article>
      ))}
    </section>
  )
}

function SolutionComparison({ slide, language, visibleCount }: { slide: LessonSlide; language: LanguageMode; visibleCount: number }) {
  if (slide.visual === 'graph') {
    return <SolubilityCurveBoard language={language} visibleCount={visibleCount} showComparison={slide.id.includes('compare-curves')} showZones={slide.id.includes('below-above')} />
  }

  const saturation = slide.id.includes('saturated') || slide.id.includes('saturation')
  const cards = saturation
    ? [
        { title: language === '繁體中文' ? '未飽和' : 'Unsaturated', detail: language === '繁體中文' ? '還能再溶解' : 'can dissolve more', particles: 6 },
        { title: language === '繁體中文' ? '飽和' : 'Saturated', detail: language === '繁體中文' ? '已達最大值' : 'maximum reached', particles: 10, sediment: true },
      ]
    : [
        { title: language === '繁體中文' ? '稀溶液' : 'Dilute', detail: language === '繁體中文' ? '溶質較少' : 'less solute', particles: 4 },
        { title: language === '繁體中文' ? '濃溶液' : 'Concentrated', detail: language === '繁體中文' ? '溶質較多' : 'more solute', particles: 10 },
      ]

  return (
    <section className="solution-beaker-comparison" aria-label="Solution concentration comparison">
      {cards.map((card, index) => (
        <article className={index < Math.max(1, visibleCount) ? 'is-visible' : ''} key={card.title}>
          <div className="solution-beaker">
            <span className="solution-liquid" />
            {Array.from({ length: card.particles }, (_, particleIndex) => <span className={`solution-dot solution-dot--${particleIndex % 5}`} key={particleIndex} />)}
            {card.sediment && <span className="solution-mini-sediment" />}
          </div>
          <strong>{card.title}</strong>
          <span>{card.detail}</span>
        </article>
      ))}
    </section>
  )
}

function SolubilityCurveBoard({
  language,
  visibleCount,
  compact = false,
  showComparison = false,
  showZones = false,
}: {
  language: LanguageMode
  visibleCount: number
  compact?: boolean
  showComparison?: boolean
  showZones?: boolean
}) {
  const showVertical = visibleCount >= 1
  const showCurve = visibleCount >= 2
  const showHorizontal = visibleCount >= 3
  const showAnswer = visibleCount >= 4

  return (
    <section className={`solubility-curve-board ${compact ? 'solubility-curve-board--compact' : ''}`} aria-label="Large solubility curve teaching graph">
      <div className="solubility-chart-title">
        <strong>{language === '繁體中文' ? '溶解度曲線' : 'Solubility curve'}</strong>
        <span>{language === '繁體中文' ? '示意圖：用來源圖表讀取精確數值' : 'schematic: use source graph for exact values'}</span>
      </div>
      <div className="solubility-plot">
        <span className="solubility-axis solubility-axis--x">{language === '繁體中文' ? '溫度' : 'Temperature'}</span>
        <span className="solubility-axis solubility-axis--y">{language === '繁體中文' ? '最大溶質質量' : 'Maximum mass of solute'}</span>
        {showZones && (
          <>
            <span className="solubility-zone solubility-zone--above">{language === '繁體中文' ? '上方：多餘固體' : 'above: extra solid'}</span>
            <span className="solubility-zone solubility-zone--below">{language === '繁體中文' ? '下方：未飽和' : 'below: unsaturated'}</span>
          </>
        )}
        <svg viewBox="0 0 700 420" role="img" aria-label={language === '繁體中文' ? '用溫度讀取溶解度曲線' : 'Read a solubility curve from temperature to solubility'}>
          <path className="solubility-grid" d="M92 65 H650 M92 135 H650 M92 205 H650 M92 275 H650 M92 345 H650 M170 45 V360 M275 45 V360 M380 45 V360 M485 45 V360 M590 45 V360" />
          <path className={`solubility-main-curve ${showCurve ? 'is-visible' : ''}`} d="M105 318 C190 286 250 250 320 212 C405 165 492 130 635 74" />
          {showComparison && <path className={`solubility-second-curve ${showCurve ? 'is-visible' : ''}`} d="M108 258 C205 246 300 226 398 196 C500 166 580 136 635 106" />}
          <line className={`solubility-read-line solubility-read-line--vertical ${showVertical ? 'is-visible' : ''}`} x1="380" y1="350" x2="380" y2="184" />
          <line className={`solubility-read-line solubility-read-line--horizontal ${showHorizontal ? 'is-visible' : ''}`} x1="92" y1="184" x2="380" y2="184" />
          <circle className={`solubility-read-point ${showCurve ? 'is-visible' : ''}`} cx="380" cy="184" r="9" />
          <text x="360" y="386">{language === '繁體中文' ? '溫度' : 'temperature'}</text>
          <text x="18" y="188">{language === '繁體中文' ? '溶解度' : 'solubility'}</text>
          <text x="505" y="88">{language === '繁體中文' ? '來源曲線 A' : 'source curve A'}</text>
          {showComparison && <text x="495" y="128">{language === '繁體中文' ? '來源曲線 B' : 'source curve B'}</text>}
        </svg>
      </div>
      {showAnswer && (
        <div className="solubility-answer">
          {language === '繁體中文' ? '讀法：溫度 -> 曲線 -> y 軸最大質量' : 'Read: temperature -> curve -> y-axis maximum mass'}
        </div>
      )}
    </section>
  )
}

function ReactionEnergyDiagram({ slide, language }: { slide: LessonSlide; language: LanguageMode }) {
  const isExothermic = slide.id.includes('exothermic')
  const isEndothermic = slide.id.includes('endothermic')

  return (
    <section className={`reaction-energy-diagram ${isExothermic ? 'reaction-energy-diagram--exo' : ''}${isEndothermic ? ' reaction-energy-diagram--endo' : ''}`} aria-label="Reaction energy profile diagram">
      <div className="reaction-energy-axis reaction-energy-axis--y">{language === '繁體中文' ? '能量' : 'Energy'}</div>
      <div className="reaction-energy-axis reaction-energy-axis--x">{language === '繁體中文' ? '反應進行' : 'Reaction progress'}</div>
      <svg viewBox="0 0 640 360" role="img" aria-label={language === '繁體中文' ? '反應物越過活化能障礙形成生成物' : 'Reactants pass an activation energy barrier to form products'}>
        <path className="energy-grid" d="M80 70 H590 M80 150 H590 M80 230 H590 M80 310 H590" />
        <path className="energy-curve energy-curve--main" d={isEndothermic ? 'M90 250 C185 245 205 70 312 78 C435 88 455 150 565 142' : 'M90 220 C188 215 205 68 314 76 C420 84 455 280 565 278'} />
        {slide.id.includes('catalyst-pathway') && <path className="energy-curve energy-curve--catalyst" d="M90 220 C185 214 220 145 318 148 C420 152 455 280 565 278" />}
        <line className="energy-arrow" x1="165" y1="218" x2="165" y2="82" />
        <text x="86" y={isEndothermic ? '244' : '214'}>{language === '繁體中文' ? '反應物' : 'Reactants'}</text>
        <text x="280" y="58">{language === '繁體中文' ? '活化能' : 'Activation energy'}</text>
        <text x="490" y={isEndothermic ? '136' : '272'}>{language === '繁體中文' ? '生成物' : 'Products'}</text>
        {slide.id.includes('catalyst-pathway') && <text x="314" y="168">{language === '繁體中文' ? '催化路徑較低' : 'catalyst path lower'}</text>}
      </svg>
      {(isExothermic || isEndothermic) && (
        <div className="energy-transfer-badge">
          <strong>{isExothermic ? (language === '繁體中文' ? '放熱' : 'Exothermic') : (language === '繁體中文' ? '吸熱' : 'Endothermic')}</strong>
          <span>{isExothermic ? (language === '繁體中文' ? '能量離開系統' : 'energy leaves system') : (language === '繁體中文' ? '能量進入系統' : 'energy enters system')}</span>
        </div>
      )}
    </section>
  )
}

function CatalystCycleDiagram({ language }: { language: LanguageMode }) {
  const labels = language === '繁體中文'
    ? ['反應物接觸', '較容易形成生成物', '催化劑仍可再用']
    : ['reactants interact', 'products form more easily', 'catalyst remains reusable']

  return (
    <section className="catalyst-cycle-diagram" aria-label="Catalyst reuse cycle">
      {labels.map((label, index) => (
        <article key={label} className={`catalyst-cycle-step catalyst-cycle-step--${index}`}>
          <span>{index + 1}</span>
          <strong>{label}</strong>
        </article>
      ))}
      <div className="catalyst-core">{language === '繁體中文' ? '催化劑' : 'Catalyst'}</div>
    </section>
  )
}

function ReactionComparison({ slide, language, visibleCount }: { slide: LessonSlide; language: LanguageMode; visibleCount: number }) {
  const catalystMode = slide.id.includes('catalyst')
  const cards = catalystMode
    ? [
        { title: language === '繁體中文' ? '沒有催化劑' : 'Without catalyst', value: language === '繁體中文' ? '較高障礙' : 'higher barrier', className: 'reaction-compare-card--high' },
        { title: language === '繁體中文' ? '有催化劑' : 'With catalyst', value: language === '繁體中文' ? '較低障礙' : 'lower barrier', className: 'reaction-compare-card--low' },
      ]
    : [
        { title: language === '繁體中文' ? '放熱' : 'Exothermic', value: language === '繁體中文' ? '生成物較低' : 'products lower', className: 'reaction-compare-card--exo' },
        { title: language === '繁體中文' ? '吸熱' : 'Endothermic', value: language === '繁體中文' ? '生成物較高' : 'products higher', className: 'reaction-compare-card--endo' },
      ]

  return (
    <section className="reaction-comparison" aria-label="Reaction energy comparison">
      {cards.map((card, index) => (
        <article className={`${card.className} ${index < Math.max(1, visibleCount) ? 'is-visible' : ''}`} key={card.title}>
          <span>{card.title}</span>
          <strong>{card.value}</strong>
          <i />
        </article>
      ))}
    </section>
  )
}

function GrasslandComparison({ language }: { language: LanguageMode }) {
  const grasslandVisual = findVisualAsset('biomes-grassland-savanna')
  const src = grasslandVisual?.localPath ?? '/science-lessons/biomes/grassland-savanna.jpg'

  return (
    <section className="grassland-comparison" aria-label="Prairie and savanna comparison">
      <article className="grassland-panel grassland-panel--prairie">
        <img src={src} alt="" aria-hidden="true" />
        <div>
          <span>{studentLabel('Prairie', language)}</span>
          <strong>25-75 cm</strong>
          <p>{studentLabel('rain/year - grasses with few trees', language)}</p>
        </div>
      </article>
      <article className="grassland-panel grassland-panel--savanna">
        <img src={src} alt="" aria-hidden="true" />
        <div>
          <span>{studentLabel('Savanna', language)}</span>
          <strong>120 cm</strong>
          <p>{studentLabel('rain/year - grasses with scattered trees', language)}</p>
        </div>
      </article>
    </section>
  )
}

function RainfallSpectrum({ visibleCount, language }: { visibleCount: number; language: LanguageMode }) {
  const maxRainfall = Math.max(...rainfallComparisonData.map((point) => point.representativeCm))

  return (
    <section className="rainfall-spectrum" aria-label="Annual precipitation chart in centimeters per year">
      <div className="rainfall-chart-title">
        <strong>{studentLabel('Increasing annual precipitation', language)}</strong>
        <span>{studentLabel('cm per year', language)}</span>
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
            <span>{studentLabel(point.label, language)}</span>
            <strong>{point.valueLabel}</strong>
          </article>
        ))}
      </div>
      <div className="rainfall-direction" aria-hidden="true">{studentLabel('MORE PRECIPITATION -> DIFFERENT ECOSYSTEM CONDITIONS', language)}</div>
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
