import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { rainfallComparisonData } from '../curriculum/biomeCharts'
import './presentationV2.css'

type SceneId = 'biome' | 'climate' | 'rainforest' | 'rainfall'
type V2Language = 'English' | 'Bilingual' | 'Traditional Chinese'

interface Scene {
  id: SceneId
  label: string
  title: string
  support: string
  zh: string
  maxStep: number
}

const chineseOnlyMode: V2Language = 'Traditional Chinese'

const scenes: Scene[] = [
  {
    id: 'biome',
    label: '01 Concept',
    title: 'What is a biome?',
    support: 'A biome is a group of land ecosystems with similar climates and organisms.',
    zh: '生物群系是一組具有相似氣候和生物的陸地生態系。',
    maxStep: 3,
  },
  {
    id: 'climate',
    label: '02 Diagram',
    title: 'Climate determines the biome',
    support: 'Temperature and precipitation are the two climate clues students should track.',
    zh: '溫度和降水量是判斷生物群系的兩個重要氣候線索。',
    maxStep: 4,
  },
  {
    id: 'rainforest',
    label: '03 Photo',
    title: 'Rain forest',
    support: 'Canopy, understory, heavy rainfall, and many organisms are the note-worthy ideas.',
    zh: '樹冠層、林下層、大量降雨和豐富生物是筆記重點。',
    maxStep: 4,
  },
  {
    id: 'rainfall',
    label: '04 Graph',
    title: 'Rainfall changes the ecosystem',
    support: 'Use the curriculum values as evidence: less rain to more rain changes ecosystem conditions.',
    zh: '用課程數據作證據：降雨量由少到多，生態系條件也會改變。',
    maxStep: 4,
  },
]

const biomeCards = [
  { name: 'Climate', detail: 'temperature + precipitation', className: 'v2-biome-token--climate' },
  { name: 'Organisms', detail: 'plants + animals', className: 'v2-biome-token--organisms' },
  { name: 'Biome', detail: 'similar land ecosystems', className: 'v2-biome-token--biome' },
]

const climateBiomes = [
  { name: 'Tundra', note: 'cold + dry', x: 14, y: 73 },
  { name: 'Desert', note: 'hot + dry', x: 81, y: 74 },
  { name: 'Grassland', note: 'seasonal rain', x: 50, y: 49 },
  { name: 'Rain forest', note: 'hot + wet', x: 77, y: 19 },
]

const rainforestLabels = [
  { label: 'Canopy', detail: 'tall trees form a leafy roof', x: 56, y: 18 },
  { label: 'Understory', detail: 'shorter trees and vines grow in shade', x: 39, y: 57 },
  { label: 'Climate clue', detail: 'about 300 cm rain per year', x: 72, y: 71 },
]

export function BiomesV2Prototype() {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [language, setLanguage] = useState<V2Language>('English')
  const [step, setStep] = useState(0)
  const scene = scenes[sceneIndex]
  const supportVisible = language !== 'English'

  const currentScene = useMemo(() => {
    switch (scene.id) {
      case 'biome':
        return <BiomeConceptScene step={step} />
      case 'climate':
        return <ClimateScene step={step} />
      case 'rainforest':
        return <RainforestScene step={step} />
      case 'rainfall':
        return <RainfallScene step={step} />
    }
  }, [scene.id, step])

  const chooseScene = (index: number) => {
    setSceneIndex(index)
    setStep(0)
  }

  return (
    <main className="v2-prototype-shell">
      <header className="v2-toolbar">
        <a href="/science-lessons.html">Back to V1</a>
        <div className="v2-scene-tabs" aria-label="V2 prototype scenes">
          {scenes.map((item, index) => (
            <button className={index === sceneIndex ? 'is-active' : ''} key={item.id} type="button" onClick={() => chooseScene(index)}>
              <span>{item.label}</span>
              {item.title}
            </button>
          ))}
        </div>
        <div className="v2-language-tabs" aria-label="Language support">
          {(['English', 'Bilingual', chineseOnlyMode] as V2Language[]).map((item) => (
            <button className={language === item ? 'is-active' : ''} key={item} type="button" onClick={() => setLanguage(item)}>
              {item === chineseOnlyMode ? '繁體中文' : item}
            </button>
          ))}
        </div>
      </header>

      <section className="v2-stage-wrap" aria-label={`${scene.title} V2 prototype`}>
        <div className={`v2-stage v2-stage--${scene.id}`} data-scene={scene.id} data-step={step} data-language={language}>
          <div className="v2-english-plane">
            {currentScene}
          </div>
          <aside className={`v2-support-layer ${supportVisible ? 'is-visible' : ''}`} aria-hidden={!supportVisible}>
            <span>{language === chineseOnlyMode ? '中文支援' : 'Bilingual support'}</span>
            <strong>{language === chineseOnlyMode ? scene.zh : scene.support}</strong>
            {language === 'Bilingual' && <p>{scene.zh}</p>}
          </aside>
        </div>
      </section>

      <footer className="v2-controls">
        <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))}>Previous reveal</button>
        <span>{scene.title} · reveal {step} of {scene.maxStep}</span>
        <button type="button" onClick={() => setStep((value) => Math.min(scene.maxStep, value + 1))}>Next reveal</button>
      </footer>
    </main>
  )
}

function BiomeConceptScene({ step }: { step: number }) {
  return (
    <section className="v2-scene v2-biome-scene">
      <div className="v2-title-block">
        <span>Core idea</span>
        <h1>What is a biome?</h1>
      </div>
      <div className="v2-biome-landscape" aria-hidden="true">
        <span className="v2-sun" />
        <span className="v2-rain" />
        <span className="v2-forest" />
        <span className="v2-grass" />
      </div>
      <div className="v2-biome-equation">
        {biomeCards.map((card, index) => (
          <article className={`v2-biome-token ${card.className} ${step >= index + 1 ? 'is-on' : ''}`} key={card.name}>
            <span>{card.detail}</span>
            <strong>{card.name}</strong>
          </article>
        ))}
        <b className={step >= 2 ? 'is-on' : ''}>+</b>
        <i className={step >= 3 ? 'is-on' : ''}>→</i>
      </div>
      <p className={`v2-definition ${step >= 3 ? 'is-on' : ''}`}>
        A biome is a group of land ecosystems with similar climates and organisms.
      </p>
    </section>
  )
}

function ClimateScene({ step }: { step: number }) {
  return (
    <section className="v2-scene v2-climate-scene">
      <div className="v2-title-block">
        <span>Conceptual climate map</span>
        <h1>Climate determines the biome</h1>
      </div>
      <div className="v2-climate-board">
        <div className={`v2-temp-axis ${step >= 1 ? 'is-on' : ''}`}><span>cold</span><i /><span>hot</span></div>
        <div className={`v2-rain-axis ${step >= 2 ? 'is-on' : ''}`}><span>wet</span><i /><span>dry</span></div>
        <div className="v2-climate-field">
          {climateBiomes.map((item, index) => (
            <span
              className={`v2-climate-point ${step >= index + 1 ? 'is-on' : ''}`}
              key={item.name}
              style={{ '--x': `${item.x}%`, '--y': `${item.y}%` } as CSSProperties}
            >
              <small>{item.note}</small>
              <strong>{item.name}</strong>
            </span>
          ))}
        </div>
      </div>
      <p className={`v2-climate-rule ${step >= 4 ? 'is-on' : ''}`}>Temperature + precipitation create different ecosystem conditions.</p>
    </section>
  )
}

function RainforestScene({ step }: { step: number }) {
  return (
    <section className="v2-scene v2-rainforest-scene">
      <img src="/science-lessons/biomes/rainforest-canopy.jpg" alt="Tropical rainforest canopy" />
      <div className="v2-photo-vignette" />
      <div className="v2-title-block">
        <span>Photo investigation</span>
        <h1>Rain forest</h1>
      </div>
      {rainforestLabels.map((item, index) => (
        <article
          className={`v2-hotspot ${step >= index + 1 ? 'is-on' : ''}`}
          key={item.label}
          style={{ '--x': `${item.x}%`, '--y': `${item.y}%` } as CSSProperties}
        >
          <strong>{item.label}</strong>
          <span>{item.detail}</span>
        </article>
      ))}
      <div className={`v2-rainfall-badge ${step >= 4 ? 'is-on' : ''}`}>
        <strong>300 cm/year</strong>
        <span>heavy annual precipitation</span>
      </div>
    </section>
  )
}

function RainfallScene({ step }: { step: number }) {
  const max = 300

  return (
    <section className="v2-scene v2-rainfall-scene">
      <div className="v2-title-block">
        <span>Science data visual</span>
        <h1>Rainfall changes the ecosystem</h1>
      </div>
      <div className="v2-rainfall-chart">
        <div className="v2-rainfall-axis"><span>300</span><span>200</span><span>100</span><span>0</span></div>
        <div className="v2-rainfall-plot">
          {[300, 200, 100].map((value) => <span className="v2-gridline" key={value} style={{ '--y': `${100 - (value / max) * 100}%` } as CSSProperties} />)}
          {rainfallComparisonData.map((item, index) => (
            <article
              className={`v2-rainfall-bar v2-rainfall-bar--${index} ${step >= index + 1 ? 'is-on' : ''}`}
              key={item.label}
              style={{ '--height': `${(item.representativeCm / max) * 100}%` } as CSSProperties}
            >
              <i />
              <strong>{item.valueLabel}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
        <div className="v2-rainfall-direction">dry → wet</div>
      </div>
    </section>
  )
}
