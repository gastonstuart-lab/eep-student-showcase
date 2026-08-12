import type { CSSProperties } from 'react'
import { rainfallComparisonData } from '../curriculum/biomeCharts'

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

export function BiomeConceptScene({ step }: { step: number }) {
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
        <i className={step >= 3 ? 'is-on' : ''}>-&gt;</i>
      </div>
      <p className={`v2-definition ${step >= 3 ? 'is-on' : ''}`}>
        A biome is a group of land ecosystems with similar climates and organisms.
      </p>
    </section>
  )
}

export function ClimateScene({ step }: { step: number }) {
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

export function RainforestScene({ step }: { step: number }) {
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

export function RainfallScene({ step }: { step: number }) {
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
        <div className="v2-rainfall-direction">dry -&gt; wet</div>
      </div>
    </section>
  )
}
