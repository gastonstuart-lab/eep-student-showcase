import { useMemo, useState } from 'react'
import { biomesV2Scenes } from './biomesV2Scenes'
import './presentationV2.css'

type V2Language = 'English' | 'Bilingual' | 'Traditional Chinese'

const chineseOnlyMode: V2Language = 'Traditional Chinese'

export function BiomesV2Prototype() {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [language, setLanguage] = useState<V2Language>('English')
  const [step, setStep] = useState(0)
  const scene = biomesV2Scenes[sceneIndex]
  const supportVisible = language !== 'English'

  const currentScene = useMemo(() => scene.render(step), [scene, step])

  const chooseScene = (index: number) => {
    setSceneIndex(index)
    setStep(0)
  }

  return (
    <main className="v2-prototype-shell">
      <header className="v2-toolbar">
        <a href="/science-lessons.html">Back to V1</a>
        <div className="v2-scene-tabs" aria-label="V2 prototype scenes">
          {biomesV2Scenes.map((item, index) => (
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
