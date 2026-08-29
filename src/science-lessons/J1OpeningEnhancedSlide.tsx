import { useState } from 'react'
import type { LanguageMode, LessonSlide } from './data'

type FocusPanel = 'question' | 'visual' | 'vocab' | null

const keywords = [
  'organism',
  'environment',
  'habitat',
  'abiotic factors',
  'biotic factors',
  'water',
  'sunlight',
  'oxygen',
  'temperature',
  'soil',
  'species',
  'population',
  'community',
  'ecosystem',
  'ecology',
]

const zhSupport: Record<string, string> = {
  organism: '生物',
  environment: '環境',
  habitat: '棲地',
  'abiotic factors': '非生物因子',
  'biotic factors': '生物因子',
  water: '水',
  sunlight: '陽光',
  oxygen: '氧氣',
  temperature: '溫度',
  soil: '土壤',
  species: '物種',
  population: '族群',
  community: '群落',
  ecosystem: '生態系',
  ecology: '生態學',
}

const visualKind: Record<string, string> = {
  'j1-ch1-1-title': 'forest',
  'j1-ch1-1-question-needs': 'question',
  'j1-ch1-1-habitats': 'habitat',
  'j1-ch1-1-question-parts': 'question',
  'j1-ch1-1-abiotic-overview': 'abiotic',
  'j1-ch1-1-biotic-factors': 'biotic',
  'j1-ch1-1-water': 'water',
  'j1-ch1-1-sunlight': 'sunlight',
  'j1-ch1-1-oxygen': 'oxygen',
  'j1-ch1-1-temperature': 'temperature',
  'j1-ch1-1-soil': 'soil',
  'j1-ch1-1-question-levels': 'question',
  'j1-ch1-1-populations': 'population',
  'j1-ch1-1-communities': 'community',
  'j1-ch1-1-ecosystems': 'ecosystem',
}

function splitHighlighted(text: string, enabled: boolean) {
  if (!enabled) return text
  const escaped = keywords.sort((a, b) => b.length - a.length).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi')
  return text.split(pattern).map((part, index) => {
    const match = keywords.find((word) => word.toLowerCase() === part.toLowerCase())
    return match ? <mark key={`${part}-${index}`}>{part}</mark> : part
  })
}

function revealText(slide: LessonSlide, showChinese: boolean) {
  return (slide.reveals ?? []).map((item) => ({
    id: item.id,
    en: item.text.en,
    zh: showChinese ? item.text.zhHant : undefined,
  }))
}

export function J1OpeningEnhancedSlide({
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
  const [showChineseSupport, setShowChineseSupport] = useState(language === '繁體中文')
  const [showHighlights, setShowHighlights] = useState(true)
  const [focusPanel, setFocusPanel] = useState<FocusPanel>(null)
  const shouldShowChinese = language === '繁體中文' || showChineseSupport
  const kind = visualKind[slide.id] ?? 'habitat'
  const reveals = revealText(slide, shouldShowChinese).slice(0, visibleRevealCount)
  const title = language === '繁體中文' ? slide.title.zhHant ?? slide.title.en : slide.title.en
  const body = language === '繁體中文' ? slide.body.zhHant ?? slide.body.en : slide.body.en

  const vocabularyWords = keywords.filter((word) => `${slide.title.en} ${slide.body.en} ${(slide.reveals ?? []).map((item) => item.text.en).join(' ')}`.toLowerCase().includes(word.toLowerCase()))

  return (
    <article className={`slide-canvas j1-source-slide j1-source-slide--${kind}`}>
      <div className="j1-source-slide__topline">
        <span>J1 · Chapter 1 · Section 1</span>
        <strong>Living Things and the Environment</strong>
      </div>

      <section className="j1-source-slide__copy" aria-label="Slide teaching text">
        <button className="j1-source-slide__title" type="button" onClick={() => setFocusPanel('question')}>
          <span>{slide.id.includes('question') ? 'QUESTION OF THE DAY' : 'SOURCE SLIDE'}</span>
          <h1>{title}</h1>
          {shouldShowChinese && language !== '繁體中文' && slide.title.zhHant && <small lang="zh-Hant">{slide.title.zhHant}</small>}
        </button>

        <button className="j1-source-slide__main-question" type="button" onClick={() => setFocusPanel('question')}>
          <p>{splitHighlighted(body, showHighlights)}</p>
          {shouldShowChinese && language !== '繁體中文' && slide.body.zhHant && <small lang="zh-Hant">{slide.body.zhHant}</small>}
        </button>

        <div className="j1-source-slide__reveals" aria-label="Revealed teaching points">
          {reveals.map((item, index) => (
            <button className="j1-source-reveal" type="button" key={item.id} onClick={() => setFocusPanel('question')}>
              <i>{index + 1}</i>
              <span>{splitHighlighted(item.en, showHighlights)}</span>
              {item.zh && <small lang="zh-Hant">{item.zh}</small>}
            </button>
          ))}
        </div>
      </section>

      <button className="j1-source-slide__visual" type="button" onClick={() => setFocusPanel('visual')} aria-label="Expand slide visual">
        <J1Visual kind={kind} />
      </button>

      <button className="j1-source-slide__vocab" type="button" onClick={() => setFocusPanel('vocab')} aria-label="Expand key vocabulary">
        <span>Key vocabulary</span>
        <div>
          {vocabularyWords.slice(0, 5).map((word) => (
            <strong key={word}>{word}</strong>
          ))}
        </div>
      </button>

      <div className="j1-source-slide__controls" aria-label="Teaching controls">
        <button type="button" className={showHighlights ? 'is-on' : ''} onClick={() => setShowHighlights((value) => !value)}>Highlights</button>
        <button type="button" className={shouldShowChinese ? 'is-on' : ''} onClick={() => setShowChineseSupport((value) => !value)}>中文</button>
      </div>

      {!hideSource && <span className="slide-source">Source: J1 PPT · Ch.1 Sec.1</span>}

      {focusPanel && (
        <div className="j1-focus-overlay" role="dialog" aria-modal="true" aria-label="Expanded teaching view">
          <button className="j1-focus-overlay__close" type="button" onClick={() => setFocusPanel(null)}>Close ×</button>
          {focusPanel === 'visual' && (
            <div className="j1-focus-overlay__visual"><J1Visual kind={kind} large /></div>
          )}
          {focusPanel === 'question' && (
            <div className="j1-focus-overlay__text">
              <span>{slide.id.includes('question') ? 'QUESTION OF THE DAY' : 'TEACHING POINT'}</span>
              <h2>{title}</h2>
              <p>{splitHighlighted(body, showHighlights)}</p>
              {reveals.map((item) => <p key={item.id}>{splitHighlighted(item.en, showHighlights)}</p>)}
              {shouldShowChinese && slide.body.zhHant && <small lang="zh-Hant">{slide.body.zhHant}</small>}
            </div>
          )}
          {focusPanel === 'vocab' && (
            <div className="j1-focus-overlay__vocab">
              <span>KEY VOCABULARY</span>
              {vocabularyWords.map((word) => (
                <p key={word}><strong>{word}</strong><small lang="zh-Hant">{zhSupport[word] ?? ''}</small></p>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}

function J1Visual({ kind, large = false }: { kind: string; large?: boolean }) {
  return (
    <div className={`j1-visual j1-visual--${kind}${large ? ' j1-visual--large' : ''}`}>
      {(kind === 'forest' || kind === 'habitat' || kind === 'ecosystem') && <ForestScene />}
      {kind === 'question' && <QuestionGraphic />}
      {kind === 'abiotic' && <AbioticGraphic />}
      {kind === 'biotic' && <BioticGraphic />}
      {kind === 'water' && <WaterGraphic />}
      {kind === 'sunlight' && <SunlightGraphic />}
      {kind === 'oxygen' && <OxygenGraphic />}
      {kind === 'temperature' && <TemperatureGraphic />}
      {kind === 'soil' && <SoilGraphic />}
      {kind === 'population' && <OrganizationGraphic level="population" />}
      {kind === 'community' && <OrganizationGraphic level="community" />}
    </div>
  )
}

function ForestScene() {
  return <div className="j1-scene"><span className="sun" /><span className="cloud c1" /><span className="tree t1" /><span className="tree t2" /><span className="river" /><span className="deer" /><span className="fish" /><span className="frog" /><span className="label food">food</span><span className="label water">water</span><span className="label shelter">shelter</span><span className="label space">space</span></div>
}

function QuestionGraphic() {
  return <div className="j1-question-graphic"><strong>?</strong><span>Think first</span><small>Then reveal evidence</small></div>
}

function AbioticGraphic() {
  return <div className="j1-factor-wheel"><strong>Abiotic</strong><span>water</span><span>sunlight</span><span>oxygen</span><span>temperature</span><span>soil</span><small>nonliving conditions</small></div>
}

function BioticGraphic() {
  return <div className="j1-biotic-grid"><span className="plant">plant</span><span className="bird">bird</span><span className="fish-card">fish</span><span className="wolf">wolf</span><strong>living parts</strong></div>
}

function WaterGraphic() {
  return <div className="j1-water-cycle"><span className="drop">H₂O</span><strong>Water supports life</strong><small>photosynthesis · bodies · survival</small></div>
}

function SunlightGraphic() {
  return <div className="j1-sunlight"><span className="sun big" /><strong>Sunlight → photosynthesis</strong><small>no light means fewer plants and algae</small></div>
}

function OxygenGraphic() {
  return <div className="j1-oxygen"><strong>O₂</strong><span>air</span><span>water</span><small>land organisms breathe air · fish use dissolved oxygen</small></div>
}

function TemperatureGraphic() {
  return <div className="j1-temperature"><span className="thermo" /><strong>HOT ↔ COLD</strong><small>organisms adapt to the temperature of their environment</small></div>
}

function SoilGraphic() {
  return <div className="j1-soil"><span className="sprout" /><strong>rock + nutrients + air + water + decay</strong><small>soil type influences organisms</small></div>
}

function OrganizationGraphic({ level }: { level: 'population' | 'community' }) {
  if (level === 'population') {
    return <div className="j1-organization"><strong>Population</strong><div><span>frog</span><span>frog</span><span>frog</span><span>frog</span></div><small>one species · one area</small></div>
  }
  return <div className="j1-organization j1-organization--community"><strong>Community</strong><div><span>frog</span><span>fish</span><span>plant</span><span>bird</span></div><small>different populations together</small></div>
}
