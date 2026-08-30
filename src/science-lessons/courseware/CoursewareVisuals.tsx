/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'

export const HIGHLIGHT_PHRASES: Record<string, string[]> = {
  'j1-ch1-1-question-parts': ['two parts', 'organism’s habitat', 'interacts'],
  'j1-ch1-1-biotic-factors': ['interacts', 'living parts', 'living', 'nonliving', 'biotic factors', 'Animals', 'plants', 'Example'],
  'j1-ch1-1-water': ['water', 'sunlight', 'carbon dioxide', 'photosynthesis', 'need water to live'],
  'j1-ch1-1-sunlight': ['Sunlight', 'photosynthesis', 'cannot grow', 'Few organisms'],
  'j1-ch1-1-oxygen': ['oxygen', 'air', 'water around them'],
  'j1-ch1-1-temperature': ['Temperatures', 'determine', 'adapt', 'HOT', 'COLD'],
  'j1-ch1-1-soil': ['Soil', 'rock pieces', 'nutrients', 'air', 'water', 'decaying remains', 'influences'],
  'j1-ch1-1-question-levels': ['levels of organization', 'ecosystem'],
  'j1-ch1-1-populations': ['species', 'physically similar', 'mate', 'produce offspring', 'population'],
  'j1-ch1-1-communities': ['more than one species', 'different populations', 'community', 'interact'],
  'j1-ch1-1-ecosystems': ['ecosystem', 'community', 'nonliving surroundings', 'ecology'],
  'j2-ch1-1-question-building-blocks': ['elements', 'building blocks', 'matter'],
  'j2-ch1-1-building-blocks-matter': ['Matter', 'mass', 'takes up space', 'Elements', 'simplest pure substances', 'building blocks of matter'],
  'j2-ch1-1-elements-compounds-mixtures': ['compound', 'chemically', 'specific ratio', 'mixture', 'not chemically combined'],
  'j2-ch1-1-particles-elements': ['atom', 'smallest particle', 'Democritus', 'atomos'],
  'j2-ch1-1-question-theory': ['atomic theory', 'develop', 'change'],
  'j2-ch1-1-theory-models': ['scientific theory', 'well-tested idea', 'Models', 'representations'],
  'j2-ch1-1-dalton': ['DALTON', 'atomic theory', 'accepted today'],
  'j2-ch1-1-thomson': ['THOMSON', 'smaller parts', 'negatively charged particles', 'electrons'],
  'j2-ch1-1-rutherford': ['RUTHERFORD', 'nucleus', 'protons', 'positive charge'],
  'j2-ch1-1-bohr': ['BOHR', 'specific amounts of energy', 'orbits'],
  'j2-ch1-1-electron-cloud': ['CLOUD OF ELECTRONS', 'cloud', 'energy level'],
  'j2-ch1-1-modern-model': ['MODERN ATOMIC MODEL', 'Chadwick', 'neutron', 'electrically neutral'],
}

export function renderHighlightedText(text: string, phrases: string[], enabled: boolean): ReactNode {
  if (!enabled || phrases.length === 0) return text
  let nodes: ReactNode[] = [text]

  for (const phrase of [...phrases].sort((a, b) => b.length - a.length)) {
    nodes = nodes.flatMap((node, nodeIndex) => {
      if (typeof node !== 'string') return [node]
      const lower = node.toLowerCase()
      const target = phrase.toLowerCase()
      const parts: ReactNode[] = []
      let cursor = 0
      let match = lower.indexOf(target)

      while (match >= 0) {
        if (match > cursor) parts.push(node.slice(cursor, match))
        parts.push(<mark key={phrase + '-' + nodeIndex + '-' + match}>{node.slice(match, match + phrase.length)}</mark>)
        cursor = match + phrase.length
        match = lower.indexOf(target, cursor)
      }
      if (cursor < node.length) parts.push(node.slice(cursor))
      return parts.length ? parts : [node]
    })
  }

  return nodes
}


export function J1Visual({ slideId }: { slideId: string }) {
  if (slideId.includes('water')) {
    return <div className="courseware-j1-visual courseware-j1-water" aria-hidden="true">
      <div className="courseware-water-drop">H₂O</div>
      <div className="courseware-photo-equation"><span>sunlight</span><b>+</b><span>CO₂</span><b>+</b><span>water</span><strong>→ photosynthesis →</strong><em>food</em></div>
    </div>
  }

  if (slideId.includes('sunlight')) {
    return <div className="courseware-j1-visual courseware-j1-sunlight" aria-hidden="true">
      <div className="courseware-sun-disc"/><div className="courseware-plant"><i/><i/><b/></div><strong>LIGHT → PHOTOSYNTHESIS</strong><small>No light → very little plant growth</small>
    </div>
  }

  if (slideId.includes('oxygen')) {
    return <div className="courseware-j1-visual courseware-j1-oxygen" aria-hidden="true">
      <div><span>AIR</span><strong>O₂</strong><small>land organisms</small></div>
      <div className="is-water"><span>WATER</span><strong>O₂</strong><i/><i/><i/><small>fish + aquatic organisms</small></div>
    </div>
  }

  if (slideId.includes('temperature')) {
    return <div className="courseware-j1-visual courseware-j1-temperature" aria-hidden="true">
      <div className="is-hot"><strong>HOT</strong><span>☀</span></div>
      <div className="courseware-thermometer"><i/></div>
      <div className="is-cold"><strong>COLD</strong><span>❄</span></div>
    </div>
  }

  if (slideId.includes('soil')) {
    return <div className="courseware-j1-visual courseware-j1-soil" aria-hidden="true">
      <div className="courseware-soil-plant"><i/><i/><b/></div>
      <div className="courseware-soil-layer is-top">decaying remains</div>
      <div className="courseware-soil-layer is-middle">nutrients · air · water</div>
      <div className="courseware-soil-layer is-bottom">rock pieces</div>
    </div>
  }

  if (slideId.includes('question-levels')) {
    return <div className="courseware-j1-visual courseware-j1-levels" aria-hidden="true">
      <span>SPECIES</span><b>→</b><span>POPULATION</span><b>→</b><span>COMMUNITY</span><b>→</b><span>ECOSYSTEM</span>
    </div>
  }

  if (slideId.includes('populations')) {
    return <div className="courseware-j1-visual courseware-j1-population" aria-hidden="true">
      <strong>ONE SPECIES</strong><div><i/><i/><i/><i/><i/><i/></div><span>= POPULATION</span>
    </div>
  }

  if (slideId.includes('communities')) {
    return <div className="courseware-j1-visual courseware-j1-community" aria-hidden="true">
      <strong>MANY POPULATIONS</strong><div><span>Wolves</span><span>Birds</span><span>Plants</span><span>Fish</span></div><em>= COMMUNITY</em>
    </div>
  }

  if (slideId.includes('ecosystems')) {
    return <div className="courseware-j1-visual courseware-j1-ecosystem" aria-hidden="true">
      <strong>ECOSYSTEM</strong><div><span>community</span><span>water</span><span>soil</span><span>air</span><span>sunlight</span></div><small>living things + nonliving surroundings</small>
    </div>
  }

  return null
}

export function J2Visual({ slideId }: { slideId: string }) {
  if (slideId.includes('elements-compounds-mixtures')) {
    return <div className="courseware-j2-visual courseware-j2-mixtures" aria-hidden="true">
      <div className="courseware-particle-vessel"><strong>COMPOUND</strong><i/><i/><i/><i/><i/><i/></div>
      <div className="courseware-particle-vessel is-mixture"><strong>MIXTURE</strong><i/><i/><i/><i/><i/><i/></div>
    </div>
  }

  if (slideId.includes('particles-elements')) {
    return <div className="courseware-j2-visual courseware-j2-particle-zoom" aria-hidden="true">
      <div className="courseware-matter-block">MATTER</div><b>→</b><div className="courseware-element-block">ELEMENT</div><b>→</b><div className="courseware-mini-atom"><i/><i/><i/><span/></div>
    </div>
  }

  if (slideId.includes('building-blocks')) {
    return <div className="courseware-j2-visual courseware-j2-blocks" aria-hidden="true">
      <span>MATTER</span><span>ELEMENTS</span><span>ATOMS</span><i/><i/><i/><i/><i/>
    </div>
  }

  if (slideId.includes('dalton')) {
    return <div className="courseware-j2-visual courseware-j2-model courseware-j2-model--dalton" aria-hidden="true"><span>1803</span><b/><strong>DALTON</strong><small>solid sphere</small></div>
  }

  if (slideId.includes('thomson')) {
    return <div className="courseware-j2-visual courseware-j2-model courseware-j2-model--thomson" aria-hidden="true"><span>1897</span><b><i/><i/><i/><i/></b><strong>THOMSON</strong><small>electrons inside the atom</small></div>
  }

  if (slideId.includes('rutherford')) {
    return <div className="courseware-j2-visual courseware-j2-model courseware-j2-model--rutherford" aria-hidden="true"><span>1911</span><b><i/><i/><i/></b><strong>RUTHERFORD</strong><small>tiny positive nucleus</small></div>
  }

  if (slideId.includes('bohr')) {
    return <div className="courseware-j2-visual courseware-j2-model courseware-j2-model--bohr" aria-hidden="true"><span>1913</span><b><i/><i/><i/><em/><em/><em/></b><strong>BOHR</strong><small>specific energy levels</small></div>
  }

  if (slideId.includes('electron-cloud')) {
    return <div className="courseware-j2-visual courseware-j2-cloud" aria-hidden="true"><b/><i/><i/><i/><strong>ELECTRON CLOUD</strong></div>
  }

  if (slideId.includes('modern-model')) {
    return <div className="courseware-j2-visual courseware-j2-modern" aria-hidden="true"><div className="courseware-modern-cloud"/><div className="courseware-modern-nucleus"><b>p+</b><b>n°</b><b>p+</b><b>n°</b></div><strong>MODERN MODEL</strong></div>
  }

  if (slideId.includes('theory-models') || slideId.includes('question-theory') || slideId.includes('models-summary')) {
    return <div className="courseware-j2-visual courseware-j2-timeline" aria-hidden="true">
      <span>Dalton</span><b>→</b><span>Thomson</span><b>→</b><span>Rutherford</span><b>→</b><span>Bohr</span><b>→</b><span>Modern</span>
    </div>
  }

  return <div className="courseware-atom-scene" aria-hidden="true"><i/><i/><i/><b/><span/><span/><span/></div>
}
