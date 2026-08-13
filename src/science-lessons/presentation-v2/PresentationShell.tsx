import { useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { LanguageMode, LessonSlide } from '../data'
import type { StudentNotes } from './biomesV2Scenes'
import { biomesV2SceneBySlideId } from './biomesV2Scenes'

interface PresentationShellProps {
  slide: LessonSlide
  language: LanguageMode
  revealIndex: number
  totalReveals?: number
  totalSlides: number
  slideNumber: number
  onExit: () => void
  onPrevious?: () => void
  onNext?: () => void
  canPrevious?: boolean
  canNext?: boolean
  fallback: (slide: LessonSlide, revealIndex: number, language: LanguageMode) => ReactNode
}

export function PresentationShell({
  slide,
  language,
  revealIndex,
  totalReveals = 0,
  totalSlides,
  slideNumber,
  onExit,
  onPrevious = () => undefined,
  onNext = () => undefined,
  canPrevious = false,
  canNext = false,
  fallback,
}: PresentationShellProps) {
  const [notesOpen, setNotesOpen] = useState(false)
  const [notesReveal, setNotesReveal] = useState(1)
  const [notesMode, setNotesMode] = useState<'staged' | 'all'>('staged')
  const [activeSupportId, setActiveSupportId] = useState<string | null>(null)
  const [pinnedSupportId, setPinnedSupportId] = useState<string | null>(null)
  const v2Scene = biomesV2SceneBySlideId[slide.id]
  const useEnhancedScene = Boolean(v2Scene && language !== '繁體中文')
  const fallbackLanguage = language === 'Bilingual' ? 'English' : language
  const support = presentationSupport(slide, language, v2Scene?.zh)
  const supportVisible = language === 'Bilingual' && Boolean(support.primary || support.secondary)
  const renderer = useEnhancedScene && v2Scene ? v2Scene.render(Math.min(revealIndex, v2Scene.maxStep)) : fallback(slide, revealIndex, fallbackLanguage)
  const sceneId = useEnhancedScene ? v2Scene?.id ?? 'fallback' : 'fallback'
  const activeSupport = useEnhancedScene ? v2Scene?.supportTerms.find((term) => term.id === (pinnedSupportId ?? activeSupportId)) : undefined
  const studentNotes = useEnhancedScene ? v2Scene?.notes : undefined
  const noteStepCount = studentNotes ? 3 : 1
  const visibleNoteSteps = notesMode === 'all' ? noteStepCount : notesReveal

  const supportButtons = useMemo(() => useEnhancedScene ? v2Scene?.supportTerms ?? [] : [], [useEnhancedScene, v2Scene])

  return (
    <div className="presentation-shell" data-renderer={useEnhancedScene ? 'v2' : 'v1-fallback'} data-slide-id={slide.id}>
      <div className={`v2-stage unified-stage unified-stage--${sceneId}`} data-scene={sceneId} data-step={revealIndex} data-language={language}>
        {notesOpen && studentNotes ? (
          <StudentNotesView
            notes={studentNotes}
            visibleSteps={visibleNoteSteps}
            mode={notesMode}
            onRevealNext={() => setNotesReveal((current) => Math.min(noteStepCount, current + 1))}
            onShowAll={() => {
              setNotesMode('all')
              setNotesReveal(noteStepCount)
            }}
            onStaged={() => {
              setNotesMode('staged')
              setNotesReveal(1)
            }}
            onReturn={() => setNotesOpen(false)}
          />
        ) : (
          <>
            <div className="v2-english-plane">
              {renderer}
            </div>
            {supportButtons.map((term) => (
              <button
                className={`translation-hotspot ${pinnedSupportId === term.id ? 'is-pinned' : ''}`}
                key={term.id}
                type="button"
                style={{ '--x': `${term.x}%`, '--y': `${term.y}%` } as CSSProperties}
                onBlur={() => setActiveSupportId(null)}
                onClick={() => setPinnedSupportId((current) => current === term.id ? null : term.id)}
                onFocus={() => setActiveSupportId(term.id)}
                onMouseEnter={() => setActiveSupportId(term.id)}
                onMouseLeave={() => setActiveSupportId(null)}
              >
                {term.label}
              </button>
            ))}
            {activeSupport && (
              <aside
                className="translation-bubble"
                style={{ '--x': `${activeSupport.x}%`, '--y': `${activeSupport.y}%` } as CSSProperties}
              >
                <span>{activeSupport.label}</span>
                <strong lang="zh-Hant">{activeSupport.zh}</strong>
              </aside>
            )}
            <aside className={`v2-support-layer unified-support-layer ${supportVisible ? 'is-visible' : ''}`} aria-hidden={!supportVisible}>
              <span>{language === 'Bilingual' ? 'Bilingual support' : '中文支援'}</span>
              {support.primary && <strong lang={support.lang}>{support.primary}</strong>}
              {support.secondary && <p lang="zh-Hant">{support.secondary}</p>}
            </aside>
          </>
        )}
        <div className="unified-presenter-meta" aria-hidden="true">
          <span>{slideNumber} / {totalSlides}</span>
          <span>Reveal {Math.min(revealIndex, totalReveals)} / {totalReveals}</span>
        </div>
        <div className="unified-presenter-controls">
          {studentNotes && <button type="button" onClick={() => setNotesOpen((current) => !current)}>{notesOpen ? 'Return' : 'Notes'}</button>}
          <button type="button" onClick={onPrevious} disabled={!canPrevious}>Previous</button>
          <button type="button" onClick={onNext} disabled={!canNext}>Next</button>
          <button type="button" onClick={onExit}>Exit</button>
        </div>
      </div>
    </div>
  )
}

function StudentNotesView({
  notes,
  visibleSteps,
  mode,
  onRevealNext,
  onShowAll,
  onStaged,
  onReturn,
}: {
  notes: StudentNotes
  visibleSteps: number
  mode: 'staged' | 'all'
  onRevealNext: () => void
  onShowAll: () => void
  onStaged: () => void
  onReturn: () => void
}) {
  const showBullets = visibleSteps >= 2
  const showVocabulary = visibleSteps >= 3

  return (
    <section className="student-notes-view">
      <header>
        <span>Student notes</span>
        <h1>{notes.heading}</h1>
        <small>{notes.source}</small>
      </header>
      <div className="student-notes-grid">
        <article className="student-notes-main">
          <strong>{notes.keyLine}</strong>
          {showBullets && <ul>{notes.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
        </article>
        <StudentNotesDiagram diagram={notes.diagram} />
        {showVocabulary && (
          <article className="student-notes-vocab">
            <span>Key vocabulary</span>
            {notes.vocabulary.map((item) => (
              <p key={item.term}><strong>{item.term}</strong> {item.meaning}</p>
            ))}
          </article>
        )}
      </div>
      <footer className="student-notes-actions">
        <button type="button" onClick={onReturn}>Return to presentation</button>
        <button type="button" onClick={onRevealNext} disabled={mode === 'all' || visibleSteps >= 3}>Reveal next note</button>
        <button type="button" onClick={onStaged}>Staged notes</button>
        <button type="button" onClick={onShowAll}>Show all</button>
      </footer>
    </section>
  )
}

function StudentNotesDiagram({ diagram }: { diagram?: string }) {
  return (
    <article className={`student-notes-diagram student-notes-diagram--${diagram ?? 'plain'}`} aria-label="Student notes diagram">
      {diagram === 'biome-equation' && <><span>Climate</span><b>+</b><span>Organisms</span><b>=</b><strong>Biome</strong></>}
      {diagram === 'climate-axes' && <><span>wet</span><div><i /><i /></div><span>dry</span><strong>cold -&gt; hot</strong></>}
      {diagram === 'rainforest-layers' && <><span>Canopy</span><span>Understory</span><strong>many species</strong></>}
      {diagram === 'rainfall-bars' && <><span>Desert</span><span>Prairie</span><span>Savanna</span><strong>Rain forest</strong></>}
    </article>
  )
}

function presentationSupport(
  slide: LessonSlide,
  language: LanguageMode,
  v2ChineseSupport?: string,
) {
  if (language === 'English') return { primary: '', secondary: '', lang: 'en' }

  const chinese = v2ChineseSupport ?? slide.body.zhHant ?? slide.title.zhHant
  if (language === 'Bilingual') {
    return {
      primary: chinese,
      secondary: '',
      lang: 'zh-Hant',
    }
  }

  return {
    primary: chinese,
    secondary: '',
    lang: 'zh-Hant',
  }
}
