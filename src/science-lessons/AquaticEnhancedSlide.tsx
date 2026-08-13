import type { CSSProperties } from 'react'
import type { LanguageMode, LessonSlide, LocalizedText } from './data'

type SceneKind = 'hero' | 'definition' | 'gallery' | 'annotated' | 'food-web' | 'summary'
type HabitatImage = 'lake' | 'stream-river' | 'pond' | 'estuary' | 'intertidal' | 'open-ocean'

interface AquaticTerm {
  en: string
  zh: string
  icon: string
}

interface AquaticLabel {
  en: string
  zh: string
  x: number
  y: number
  tone?: 'fresh' | 'marine' | 'warm' | 'deep'
}

interface AquaticPanel {
  image: HabitatImage
  en: string
  zh: string
  detailEn: string
  detailZh: string
  tone?: 'fresh' | 'marine' | 'warm' | 'deep'
}

interface AquaticSceneConfig {
  kind: SceneKind
  image: HabitatImage
  chapter: string
  headingEn?: string
  headingZh?: string
  kickerEn?: string
  kickerZh?: string
  terms: AquaticTerm[]
  think: LocalizedText
  labels?: AquaticLabel[]
  panels?: AquaticPanel[]
  focusTerms?: AquaticTerm[]
}

const asset = (name: HabitatImage) => `/science-lessons/aquatic/${name}.png`

const coreTerms = {
  aquatic: { en: 'aquatic ecosystem', zh: '水域生態系', icon: '~' },
  freshwater: { en: 'freshwater', zh: '淡水', icon: 'F' },
  marine: { en: 'marine / saltwater', zh: '海洋 / 鹽水', icon: 'M' },
  habitat: { en: 'habitat', zh: '棲地', icon: 'H' },
  biotic: { en: 'biotic factor', zh: '生物因子', icon: 'B' },
  abiotic: { en: 'abiotic factor', zh: '非生物因子', icon: 'A' },
  organism: { en: 'organism', zh: '生物', icon: 'O' },
  algae: { en: 'algae', zh: '藻類', icon: 'Al' },
  light: { en: 'light', zh: '光', icon: 'L' },
  temperature: { en: 'temperature', zh: '溫度', icon: 'T' },
  producer: { en: 'producer', zh: '生產者', icon: 'P' },
  consumer: { en: 'consumer', zh: '消費者', icon: 'C' },
  foodWeb: { en: 'food web', zh: '食物網', icon: 'W' },
  population: { en: 'population', zh: '族群', icon: 'N' },
  feedingLink: { en: 'feeding link', zh: '覓食連結', icon: '->' },
  prediction: { en: 'prediction', zh: '預測', icon: '?' },
  evidence: { en: 'evidence', zh: '證據', icon: 'E' },
  coastal: { en: 'coastal seas', zh: '沿海海域', icon: 'Co' },
}

const sceneConfigs: Record<string, AquaticSceneConfig> = {
  'j2-ch2-aquatic-title': {
    kind: 'hero',
    image: 'lake',
    chapter: 'CHAPTER 2 · SECTION 5',
    kickerEn: 'freshwater + marine environments',
    kickerZh: '淡水與海洋環境',
    terms: [coreTerms.aquatic, coreTerms.freshwater, coreTerms.marine, coreTerms.habitat],
    think: {
      en: 'What living and non-living things would a fish need from its habitat?',
      zhHant: '想一想：魚需要從棲地中獲得哪些生物和非生物條件？',
    },
    panels: [
      { image: 'lake', en: 'Freshwater', zh: '淡水', detailEn: 'lakes, ponds, rivers, streams', detailZh: '湖泊、池塘、河流、溪流', tone: 'fresh' },
      { image: 'open-ocean', en: 'Marine', zh: '海洋', detailEn: 'seas and oceans', detailZh: '海域和海洋', tone: 'marine' },
    ],
  },
  'j2-ch2-ecosystem-system': {
    kind: 'definition',
    image: 'pond',
    chapter: 'CHAPTER 2 · SECTION 5',
    terms: [coreTerms.biotic, coreTerms.abiotic, coreTerms.organism, coreTerms.habitat],
    think: {
      en: 'Why does an ecosystem need both living and non-living parts?',
      zhHant: '想一想：為什麼生態系同時需要生物和非生物部分？',
    },
    labels: [
      { en: 'fish / plants / algae', zh: '魚 / 植物 / 藻類', x: 36, y: 64, tone: 'fresh' },
      { en: 'water / light / temperature', zh: '水 / 光 / 溫度', x: 70, y: 33, tone: 'marine' },
    ],
  },
  'j2-ch2-biotic-abiotic-sort': {
    kind: 'annotated',
    image: 'pond',
    chapter: 'CHAPTER 2 · SECTION 5',
    kickerEn: 'classify, then explain',
    kickerZh: '先分類，再解釋',
    terms: [coreTerms.biotic, coreTerms.abiotic, coreTerms.algae, coreTerms.light, coreTerms.temperature],
    think: {
      en: 'Which examples are living, and which examples are non-living?',
      zhHant: '想一想：哪些例子有生命？哪些例子沒有生命？',
    },
    labels: [
      { en: 'biotic: fish', zh: '生物：魚', x: 61, y: 56, tone: 'fresh' },
      { en: 'biotic: plants', zh: '生物：植物', x: 38, y: 70, tone: 'fresh' },
      { en: 'abiotic: water', zh: '非生物：水', x: 53, y: 39, tone: 'marine' },
      { en: 'abiotic: sunlight', zh: '非生物：陽光', x: 72, y: 23, tone: 'warm' },
    ],
  },
  'j2-ch2-freshwater-marine': {
    kind: 'gallery',
    image: 'lake',
    chapter: 'CHAPTER 2 · SECTION 5',
    terms: [coreTerms.freshwater, coreTerms.marine, coreTerms.habitat, coreTerms.organism],
    think: {
      en: 'Why should we check habitat conditions before moving an organism?',
      zhHant: '想一想：為什麼移動生物前要先確認棲地條件？',
    },
    panels: [
      { image: 'lake', en: 'lake', zh: '湖泊', detailEn: 'standing freshwater', detailZh: '靜止淡水', tone: 'fresh' },
      { image: 'stream-river', en: 'stream / river', zh: '溪流 / 河流', detailEn: 'moving freshwater', detailZh: '流動淡水', tone: 'fresh' },
      { image: 'pond', en: 'pond', zh: '池塘', detailEn: 'shallow freshwater habitat', detailZh: '較淺的淡水棲地', tone: 'fresh' },
      { image: 'open-ocean', en: 'sea / ocean', zh: '海域 / 海洋', detailEn: 'saltwater habitat', detailZh: '鹽水棲地', tone: 'marine' },
    ],
  },
  'j2-ch2-habitat-needs': {
    kind: 'annotated',
    image: 'lake',
    chapter: 'CHAPTER 2 · SECTION 5',
    terms: [coreTerms.habitat, coreTerms.organism, coreTerms.light, coreTerms.temperature],
    think: {
      en: 'How can one habitat factor affect survival or growth?',
      zhHant: '想一想：一個棲地因子如何影響生存或生長？',
    },
    labels: [
      { en: 'clear water', zh: '清澈的水', x: 47, y: 56, tone: 'marine' },
      { en: 'shelter near plants', zh: '植物附近的躲藏處', x: 31, y: 70, tone: 'fresh' },
      { en: 'light reaches shallow water', zh: '光到達淺水區', x: 64, y: 28, tone: 'warm' },
    ],
  },
  'j2-ch2-interaction-types': {
    kind: 'annotated',
    image: 'stream-river',
    chapter: 'CHAPTER 2 · SECTION 5',
    terms: [coreTerms.feedingLink, coreTerms.habitat, coreTerms.abiotic, coreTerms.organism],
    think: {
      en: 'Which interaction could be shown with an arrow?',
      zhHant: '想一想：哪一種互動可以用箭頭表示？',
    },
    labels: [
      { en: 'current changes where organisms can live', zh: '水流影響生物能在哪裡生活', x: 53, y: 36, tone: 'marine' },
      { en: 'feeding links connect organisms', zh: '覓食連結連接生物', x: 62, y: 63, tone: 'fresh' },
      { en: 'resource needs can create competition', zh: '資源需求可能造成競爭', x: 38, y: 62, tone: 'warm' },
    ],
  },
  'j2-ch2-habitat-application': {
    kind: 'summary',
    image: 'estuary',
    chapter: 'CHAPTER 2 · SECTION 5',
    kickerEn: 'habitat evidence',
    kickerZh: '棲地證據',
    terms: [coreTerms.habitat, coreTerms.biotic, coreTerms.abiotic, coreTerms.evidence],
    think: {
      en: 'Can your answer classify and explain each factor?',
      zhHant: '想一想：你的答案能否分類並解釋每個因子？',
    },
    panels: [
      { image: 'lake', en: 'Name habitat', zh: '說出棲地', detailEn: 'freshwater or marine', detailZh: '淡水或海洋', tone: 'fresh' },
      { image: 'pond', en: 'Classify factors', zh: '分類因子', detailEn: 'biotic + abiotic', detailZh: '生物 + 非生物', tone: 'marine' },
      { image: 'stream-river', en: 'Explain effect', zh: '解釋影響', detailEn: 'survival or growth', detailZh: '生存或生長', tone: 'warm' },
    ],
  },
  'j2-ch2-habitat-exit': {
    kind: 'summary',
    image: 'lake',
    chapter: 'CHAPTER 2 · SECTION 5',
    terms: [coreTerms.biotic, coreTerms.abiotic, coreTerms.aquatic, coreTerms.evidence],
    think: {
      en: 'Write one strong sentence using both key words.',
      zhHant: '想一想：用兩個關鍵詞寫出一句完整句子。',
    },
  },
  'j2-ch2-food-web-title': {
    kind: 'hero',
    image: 'open-ocean',
    chapter: 'CHAPTER 2 · SECTION 5',
    kickerEn: 'changes spread through food webs',
    kickerZh: '變化會在食物網中擴散',
    terms: [coreTerms.foodWeb, coreTerms.feedingLink, coreTerms.population, coreTerms.prediction],
    think: {
      en: 'What might happen if one population in a food web decreases?',
      zhHant: '想一想：如果食物網中的一個族群減少，可能會發生什麼？',
    },
  },
  'j2-ch2-food-chain': {
    kind: 'food-web',
    image: 'open-ocean',
    chapter: 'CHAPTER 2 · SECTION 5',
    terms: [coreTerms.producer, coreTerms.consumer, coreTerms.feedingLink, coreTerms.algae],
    think: {
      en: 'What does the arrow show in a feeding chain?',
      zhHant: '想一想：食物鏈中的箭頭表示什麼？',
    },
  },
  'j2-ch2-food-web-model': {
    kind: 'food-web',
    image: 'pond',
    chapter: 'CHAPTER 2 · SECTION 5',
    terms: [coreTerms.foodWeb, coreTerms.feedingLink, coreTerms.consumer, coreTerms.population],
    think: {
      en: 'Why is a food web harder to predict than one chain?',
      zhHant: '想一想：為什麼食物網比一條食物鏈更難預測？',
    },
  },
  'j2-ch2-remove-producer': {
    kind: 'food-web',
    image: 'pond',
    chapter: 'CHAPTER 2 · SECTION 5',
    terms: [coreTerms.producer, coreTerms.population, coreTerms.prediction, coreTerms.feedingLink],
    think: {
      en: 'Which two consequences can follow when a producer decreases?',
      zhHant: '想一想：當生產者減少時，可能出現哪兩個結果？',
    },
  },
  'j2-ch2-population-change': {
    kind: 'food-web',
    image: 'open-ocean',
    chapter: 'CHAPTER 2 · SECTION 5',
    terms: [coreTerms.population, coreTerms.foodWeb, coreTerms.feedingLink, coreTerms.prediction],
    think: {
      en: 'How can one change spread to several organisms?',
      zhHant: '想一想：一個變化如何影響多種生物？',
    },
  },
  'j2-ch2-ecosystem-balance': {
    kind: 'summary',
    image: 'estuary',
    chapter: 'CHAPTER 2 · SECTION 5',
    terms: [coreTerms.evidence, coreTerms.population, coreTerms.feedingLink, coreTerms.prediction],
    think: {
      en: 'Can you name the change, the link and the effect?',
      zhHant: '想一想：你能說出變化、連結和影響嗎？',
    },
  },
  'j2-ch2-video-observation': {
    kind: 'annotated',
    image: 'intertidal',
    chapter: 'CHAPTER 2 · SECTION 5',
    terms: [coreTerms.coastal, coreTerms.organism, coreTerms.habitat, coreTerms.feedingLink],
    think: {
      en: 'What can you observe, classify and explain from the clip?',
      zhHant: '想一想：你能從影片中觀察、分類並解釋什麼？',
    },
    labels: [
      { en: 'organisms', zh: '生物', x: 40, y: 64, tone: 'fresh' },
      { en: 'habitat conditions', zh: '棲地條件', x: 60, y: 38, tone: 'marine' },
      { en: 'possible feeding interaction', zh: '可能的覓食互動', x: 66, y: 67, tone: 'warm' },
    ],
  },
  'j2-ch2-food-web-exit': {
    kind: 'summary',
    image: 'open-ocean',
    chapter: 'CHAPTER 2 · SECTION 5',
    terms: [coreTerms.prediction, coreTerms.population, coreTerms.feedingLink, coreTerms.evidence],
    think: {
      en: 'Can you justify your prediction using a feeding link?',
      zhHant: '想一想：你能用覓食連結說明你的預測嗎？',
    },
  },
}

export function AquaticEnhancedSlide({
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
  const config = sceneConfigs[slide.id] ?? sceneConfigs['j2-ch2-aquatic-title']
  const visibleReveals = slide.revealMode === 'step-by-step' ? slide.reveals?.slice(0, visibleRevealCount) ?? [] : slide.reveals ?? []
  const title = text(slide.title, language)
  const subtitle = secondary(slide.title, language)
  const body = text(slide.body, language)
  const bodySecondary = secondary(slide.body, language)

  return (
    <article className={`slide-canvas aquatic-enhanced aquatic-enhanced--${config.kind}`} data-aquatic-enhanced="true" data-slide-id={slide.id}>
      <div className="aquatic-enhanced__backdrop">
        <img src={asset(config.image)} alt="" />
      </div>
      <div className="aquatic-enhanced__wash" />
      <header className="aquatic-enhanced__chapter">
        <span className="aquatic-drop-mark" aria-hidden="true">~</span>
        <strong>{config.chapter}</strong>
      </header>
      <main className="aquatic-enhanced__main">
        <section className="aquatic-enhanced__copy">
          {config.kickerEn && <span className="aquatic-kicker">{language === '繁體中文' ? config.kickerZh : config.kickerEn}</span>}
          <h1>{title}</h1>
          {subtitle && <h2 lang="zh-Hant">{subtitle}</h2>}
          <p>{body}</p>
          {bodySecondary && <p className="aquatic-enhanced__zh" lang="zh-Hant">{bodySecondary}</p>}
          <AquaticRevealList reveals={visibleReveals} language={language} compact={config.kind === 'hero'} />
        </section>
        <AquaticVisual config={config} slide={slide} language={language} visibleRevealCount={visibleRevealCount} />
      </main>
      <AquaticVocabularyRail terms={config.terms} language={language} />
      <AquaticThinkBar prompt={config.think} language={language} />
      {slide.sourceId && !hideSource && <span className="aquatic-enhanced__source">Source: {slide.sourceId}</span>}
    </article>
  )
}

function AquaticVisual({
  config,
  slide,
  language,
  visibleRevealCount,
}: {
  config: AquaticSceneConfig
  slide: LessonSlide
  language: LanguageMode
  visibleRevealCount: number
}) {
  if (config.kind === 'hero') return <AquaticHeroVisual config={config} slide={slide} language={language} visibleRevealCount={visibleRevealCount} />
  if (config.kind === 'gallery') return <AquaticGalleryVisual config={config} language={language} visibleRevealCount={visibleRevealCount} />
  if (config.kind === 'food-web') return <AquaticFoodWebVisual slide={slide} language={language} visibleRevealCount={visibleRevealCount} />
  if (config.kind === 'summary') return <AquaticSummaryVisual config={config} slide={slide} language={language} visibleRevealCount={visibleRevealCount} />
  return <AquaticAnnotatedVisual config={config} language={language} visibleRevealCount={visibleRevealCount} />
}

function AquaticHeroVisual({
  slide,
  language,
  visibleRevealCount,
}: {
  config: AquaticSceneConfig
  slide: LessonSlide
  language: LanguageMode
  visibleRevealCount: number
}) {
  const foodWeb = slide.id.includes('food-web')

  return (
    <section className="aquatic-hero-board" aria-label="Aquatic hero visual">
      <div className={`aquatic-hero-board__badge ${visibleRevealCount >= 1 ? 'is-visible' : ''}`}>
        <strong>{foodWeb ? label('producer -> consumers', '生產者 -> 消費者', language) : label('freshwater -> marine', '淡水 -> 海洋', language)}</strong>
        <span>{studentEmphasis(slide.emphasis, language)}</span>
      </div>
    </section>
  )
}

function AquaticAnnotatedVisual({ config, language, visibleRevealCount }: { config: AquaticSceneConfig; language: LanguageMode; visibleRevealCount: number }) {
  return (
    <section className="aquatic-annotated-board" aria-label="Labelled aquatic habitat diagram">
      <img src={asset(config.image)} alt="" />
      {(config.labels ?? []).map((item, index) => (
        <div
          className={`aquatic-callout aquatic-callout--${item.tone ?? 'marine'} ${visibleRevealCount > index ? 'is-visible' : ''}`}
          key={`${item.en}-${index}`}
          style={{ '--x': `${item.x}%`, '--y': `${item.y}%` } as CSSProperties}
        >
          <span />
          <strong>{label(item.en, item.zh, language)}</strong>
        </div>
      ))}
    </section>
  )
}

function AquaticGalleryVisual({ config, language, visibleRevealCount }: { config: AquaticSceneConfig; language: LanguageMode; visibleRevealCount: number }) {
  return (
    <section className="aquatic-gallery-board" aria-label="Aquatic habitat examples">
      {(config.panels ?? []).map((panel, index) => (
        <article className={`aquatic-gallery-card aquatic-gallery-card--${panel.tone ?? 'fresh'} ${visibleRevealCount > index - 1 ? 'is-visible' : ''}`} key={panel.en}>
          <img src={asset(panel.image)} alt="" />
          <div>
            <strong>{label(panel.en, panel.zh, language)}</strong>
            <span>{label(panel.detailEn, panel.detailZh, language)}</span>
          </div>
        </article>
      ))}
    </section>
  )
}

function AquaticFoodWebVisual({ slide, language, visibleRevealCount }: { slide: LessonSlide; language: LanguageMode; visibleRevealCount: number }) {
  const producerReduced = slide.id.includes('remove-producer') && visibleRevealCount >= 1
  const showWeb = slide.id.includes('food-web-model') || slide.id.includes('population-change') || slide.id.includes('remove-producer')

  return (
    <section className="aquatic-foodweb-board aquatic-food-web" aria-label="Aquatic food web diagram">
      <img src={asset(slide.id.includes('food-chain') ? 'pond' : 'open-ocean')} alt="" />
      <div className="aquatic-foodweb-overlay">
        <div className={`aquatic-web-organism aquatic-web-organism--producer ${producerReduced ? 'is-reduced' : ''}`}>
          <strong>{label('algae / aquatic plants', '藻類 / 水生植物', language)}</strong>
          {producerReduced && <em className="aquatic-web-change">{label('decrease', '減少', language)}</em>}
        </div>
        <div className="aquatic-web-organism aquatic-web-organism--small">
          <strong>{label('small consumer', '小型消費者', language)}</strong>
        </div>
        <div className="aquatic-web-organism aquatic-web-organism--fish">
          <strong>{label('fish', '魚', language)}</strong>
        </div>
        <div className="aquatic-web-organism aquatic-web-organism--predator">
          <strong>{label('larger predator', '較大型掠食者', language)}</strong>
        </div>
        <span className={`aquatic-web-arrow aquatic-web-arrow--one ${visibleRevealCount >= 1 ? 'is-visible' : ''}`} />
        <span className={`aquatic-web-arrow aquatic-web-arrow--two ${visibleRevealCount >= 2 ? 'is-visible' : ''}`} />
        <span className={`aquatic-web-arrow aquatic-web-arrow--three ${visibleRevealCount >= 3 || showWeb ? 'is-visible' : ''}`} />
        <aside className="aquatic-foodweb-caption">
          {showWeb ? label('Trace feeding links, then predict effects.', '追蹤覓食連結，然後預測影響。', language) : label('Producer -> consumers', '生產者 -> 消費者', language)}
        </aside>
      </div>
    </section>
  )
}

function AquaticSummaryVisual({
  config,
  slide,
  language,
  visibleRevealCount,
}: {
  config: AquaticSceneConfig
  slide: LessonSlide
  language: LanguageMode
  visibleRevealCount: number
}) {
  const steps = config.panels ?? [
    { image: 'lake' as const, en: 'Change', zh: '變化', detailEn: slide.reveals?.[0]?.text.en ?? 'name what changes', detailZh: slide.reveals?.[0]?.text.zhHant ?? '說出變化', tone: 'fresh' as const },
    { image: 'stream-river' as const, en: 'Link', zh: '連結', detailEn: slide.reveals?.[1]?.text.en ?? 'trace the feeding link', detailZh: slide.reveals?.[1]?.text.zhHant ?? '追蹤覓食連結', tone: 'marine' as const },
    { image: 'open-ocean' as const, en: 'Effect', zh: '影響', detailEn: slide.reveals?.[2]?.text.en ?? 'predict the effect', detailZh: slide.reveals?.[2]?.text.zhHant ?? '預測影響', tone: 'deep' as const },
  ]

  return (
    <section className="aquatic-summary-board" aria-label="Aquatic lesson summary">
      {steps.map((step, index) => (
        <article className={`aquatic-summary-step aquatic-summary-step--${step.tone ?? 'fresh'} ${visibleRevealCount > index - 1 ? 'is-visible' : ''}`} key={step.en}>
          <img src={asset(step.image)} alt="" />
          <strong>{label(step.en, step.zh, language)}</strong>
          <span>{label(step.detailEn, step.detailZh, language)}</span>
        </article>
      ))}
    </section>
  )
}

function AquaticVocabularyRail({ terms, language }: { terms: AquaticTerm[]; language: LanguageMode }) {
  return (
    <aside className="aquatic-vocab-rail" aria-label="Key words">
      <h3>{language === '繁體中文' ? '關鍵詞' : language === 'Bilingual' ? 'KEY WORDS 關鍵詞' : 'KEY WORDS'}</h3>
      <ul>
        {terms.map((term) => (
          <li key={term.en}>
            <span className="aquatic-vocab-icon" aria-hidden="true">{term.icon}</span>
            <strong>{label(term.en, term.zh, language)}</strong>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function AquaticThinkBar({ prompt, language }: { prompt: LocalizedText; language: LanguageMode }) {
  return (
    <footer className="aquatic-think-bar">
      <strong>{language === '繁體中文' ? '想一想' : 'THINK!'}</strong>
      <span>{text(prompt, language)}</span>
      {language === 'Bilingual' && prompt.zhHant && <small lang="zh-Hant">{prompt.zhHant}</small>}
    </footer>
  )
}

function AquaticRevealList({ reveals, language, compact = false }: { reveals: { text: LocalizedText; id: string }[]; language: LanguageMode; compact?: boolean }) {
  if (reveals.length === 0) return null

  return (
    <ul className={`aquatic-reveal-list ${compact ? 'aquatic-reveal-list--compact' : ''}`}>
      {reveals.map((reveal) => (
        <li key={reveal.id}>
          <span aria-hidden="true">→</span>
          <strong>{text(reveal.text, language)}</strong>
          {language === 'Bilingual' && reveal.text.zhHant && <small lang="zh-Hant">{reveal.text.zhHant}</small>}
        </li>
      ))}
    </ul>
  )
}

function text(item: LocalizedText, language: LanguageMode) {
  if (language === '繁體中文') return item.zhHant ?? item.en
  return item.en
}

function secondary(item: LocalizedText, language: LanguageMode) {
  return language === 'Bilingual' ? item.zhHant : undefined
}

function label(en: string, zh: string, language: LanguageMode) {
  if (language === '繁體中文') return zh
  if (language === 'Bilingual') return `${en} ${zh}`
  return en
}

function studentEmphasis(emphasis: string | undefined, language: LanguageMode) {
  if (!emphasis) return ''
  const zh: Record<string, string> = {
    'organisms + environment': '生物 + 環境',
    'changes spread through food webs': '變化會在食物網中擴散',
  }
  return language === '繁體中文' ? zh[emphasis] ?? emphasis : emphasis
}
