import { useMemo, useState } from 'react'
import {
  findLesson,
  scienceLessons,
  scienceUnits,
  type LanguageMode,
  type LessonSlide,
  type ScienceLesson,
  type Semester,
  type YearLevel,
} from './data'

type Screen = 'home' | 'library' | 'viewer' | 'editor'

const languageOptions: LanguageMode[] = ['English', 'Bilingual', '繁體中文']

export function ScienceLessonsApp() {
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
          lesson={lesson}
          language={language}
          onLanguageChange={setLanguage}
          onBack={() => setScreen('library')}
          onEdit={() => setScreen('editor')}
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
          <span>Teacher workspace</span>
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
            Browse organised J1 and J2 lessons, present bilingual slides, keep teacher notes close, and open every
            worksheet, quiz, and video from one place.
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
          <div className="orbit orbit--one" />
          <div className="orbit orbit--two" />
          <span className="atom atom--one" />
          <span className="atom atom--two" />
          <span className="atom atom--three" />
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
          <p>Open a lesson for teaching, review its resources, or continue editing a draft.</p>
        </div>
        <button className="science-button science-button--primary" type="button" onClick={() => onOpenLesson(scienceLessons[0], 'editor')}>
          + New lesson
        </button>
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
                  Open lesson
                </button>
                <button className="science-icon-button" type="button" onClick={() => onOpenLesson(lesson, 'editor')} aria-label={`Edit ${lesson.title}`}>
                  ✎
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
  onEdit,
}: {
  lesson: ScienceLesson
  language: LanguageMode
  onLanguageChange: (language: LanguageMode) => void
  onBack: () => void
  onEdit: () => void
}) {
  const [slideIndex, setSlideIndex] = useState(0)
  const [notesOpen, setNotesOpen] = useState(true)
  const [resourcesOpen, setResourcesOpen] = useState(true)
  const slide = lesson.slides[slideIndex] ?? lesson.slides[0]

  const previous = () => setSlideIndex((current) => Math.max(0, current - 1))
  const next = () => setSlideIndex((current) => Math.min(lesson.slides.length - 1, current + 1))

  return (
    <main className="viewer-shell">
      <header className="viewer-toolbar">
        <div className="viewer-toolbar__lesson">
          <button className="viewer-back" type="button" onClick={onBack} aria-label="Return to lesson library">←</button>
          <div>
            <span>{lesson.year} · {lesson.semester}</span>
            <strong>{lesson.title}</strong>
          </div>
        </div>
        <div className="viewer-toolbar__controls">
          <div className="viewer-language" aria-label="Slide language">
            {languageOptions.map((item) => (
              <button className={language === item ? 'is-active' : ''} key={item} type="button" onClick={() => onLanguageChange(item)}>{item}</button>
            ))}
          </div>
          <button className="viewer-tool-button" type="button" onClick={onEdit}>✎ Edit lesson</button>
          <button className="viewer-tool-button viewer-tool-button--accent" type="button" onClick={() => document.documentElement.requestFullscreen?.()}>
            ⛶ Fullscreen
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
            <button className={index === slideIndex ? 'is-current' : ''} key={item.id} type="button" onClick={() => setSlideIndex(index)}>
              <span>{index + 1}</span>
              <SlideMiniature slide={item} />
            </button>
          ))}
        </aside>

        <section className="viewer-stage-area">
          <div className="viewer-stage">
            <SlideCanvas slide={slide} language={language} />
          </div>
          <div className="viewer-navigation">
            <button type="button" onClick={previous} disabled={slideIndex === 0}>← Previous</button>
            <span>Slide {slideIndex + 1} of {lesson.slides.length}</span>
            <button type="button" onClick={next} disabled={slideIndex === lesson.slides.length - 1}>Next →</button>
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
                {lesson.resources.map((resource) => (
                  <button key={resource.id} type="button">
                    <span className="resource-icon" aria-hidden="true">{resource.type === 'Video' ? '▶' : resource.type === 'Quiz' ? '?' : '▤'}</span>
                    <span><strong>{resource.title}</strong><small>{resource.type} · {resource.detail}</small></span>
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="viewer-panel viewer-panel--objectives">
            <span>Lesson objectives</span>
            <ul>{lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
          </section>
        </aside>
      </div>
    </main>
  )
}

function SlideCanvas({ slide, language }: { slide: LessonSlide; language: LanguageMode }) {
  return (
    <article className={`slide-canvas slide-canvas--${slide.visual}`}>
      <div className="slide-canvas__content">
        <span className="slide-label">Science concept</span>
        {(language === 'English' || language === 'Bilingual') && <h1>{slide.titleEn}</h1>}
        {(language === '繁體中文' || language === 'Bilingual') && <h2 lang="zh-Hant">{slide.titleZh}</h2>}
        <div className="slide-rule" />
        {(language === 'English' || language === 'Bilingual') && <p>{slide.bodyEn}</p>}
        {(language === '繁體中文' || language === 'Bilingual') && <p className="slide-chinese" lang="zh-Hant">{slide.bodyZh}</p>}
      </div>
      <ScienceVisual type={slide.visual} />
      <span className="slide-corner">IED · SCIENCE</span>
    </article>
  )
}

function SlideMiniature({ slide }: { slide: LessonSlide }) {
  return (
    <span className={`slide-miniature slide-miniature--${slide.visual}`}>
      <i />
      <b>{slide.titleEn}</b>
      <em />
    </span>
  )
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
  const [slides, setSlides] = useState(() => lesson.slides.map((slide) => ({ ...slide })))
  const [saveState, setSaveState] = useState<'Saved' | 'Unsaved'>('Saved')
  const selectedSlide = slides[selectedIndex] ?? slides[0]

  const updateSelectedSlide = (field: keyof LessonSlide, value: string) => {
    setSlides((current) => current.map((slide, index) => index === selectedIndex ? { ...slide, [field]: value } : slide))
    setSaveState('Unsaved')
  }

  const addSlide = () => {
    const nextSlide: LessonSlide = {
      id: `draft-${Date.now()}`,
      titleEn: 'New science idea',
      titleZh: '新的科學概念',
      bodyEn: 'Add the English explanation here.',
      bodyZh: '在這裡加入繁體中文說明。',
      visual: 'particles',
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
            <span>Lesson editor · {lesson.year} · {lesson.semester}</span>
            <strong>{title}</strong>
          </div>
        </div>
        <div className="editor-save-state"><span className={saveState === 'Saved' ? 'is-saved' : ''} />{saveState}</div>
        <div className="editor-toolbar__actions">
          <button className="science-button science-button--ghost" type="button" onClick={onLibrary}>Close</button>
          <button className="science-button science-button--ghost" type="button" onClick={onBack}>Preview</button>
          <button className="science-button science-button--primary" type="button" onClick={saveDraft}>Save draft</button>
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
                  <textarea value={selectedSlide.titleEn} onChange={(event) => updateSelectedSlide('titleEn', event.target.value)} />
                </label>
                <label>
                  <span>Explanation</span>
                  <textarea className="editor-textarea--body" value={selectedSlide.bodyEn} onChange={(event) => updateSelectedSlide('bodyEn', event.target.value)} />
                </label>
              </div>
              <div>
                <span className="editor-language-label editor-language-label--zh">繁 · Traditional Chinese</span>
                <label>
                  <span>投影片標題</span>
                  <textarea lang="zh-Hant" value={selectedSlide.titleZh} onChange={(event) => updateSelectedSlide('titleZh', event.target.value)} />
                </label>
                <label>
                  <span>說明</span>
                  <textarea className="editor-textarea--body" lang="zh-Hant" value={selectedSlide.bodyZh} onChange={(event) => updateSelectedSlide('bodyZh', event.target.value)} />
                </label>
              </div>
            </div>

            <div className="editor-media-block">
              <div className={`editor-media-preview editor-media-preview--${selectedSlide.visual}`}>
                <ScienceVisual type={selectedSlide.visual} />
              </div>
              <div>
                <span className="editor-language-label">Visual</span>
                <h3>Image or teaching visual</h3>
                <p>Use a diagram, photograph, graph, or embedded video that supports this slide.</p>
                <div className="editor-media-actions">
                  <button type="button">Replace image</button>
                  <button type="button">Add video</button>
                </div>
              </div>
            </div>

            <label className="editor-notes-field">
              <span>Teacher notes</span>
              <textarea value={selectedSlide.teacherNote} onChange={(event) => updateSelectedSlide('teacherNote', event.target.value)} />
            </label>
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
            <h3>Publishing workflow</h3>
            <p>Keep unfinished changes in a draft. Publishing approval will be connected after the pilot is validated.</p>
            <button type="button">Review lesson settings</button>
          </section>
        </aside>
      </div>
    </main>
  )
}
