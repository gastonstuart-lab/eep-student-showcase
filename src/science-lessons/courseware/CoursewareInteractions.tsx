/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'

export type FocusContent = {
  kind?: 'text'
  english: string
  chinese?: string
} | {
  kind: 'image'
  imageSrc: string
  alt: string
}

export const HIGHLIGHT_PHRASES: Record<string, string[]> = {
  'j1-ch1-1-question-needs': ['organism’s environment'],
  'j1-ch1-1-habitats': ['food', 'water', 'shelter', 'environment', 'habitat'],
  'j1-ch1-1-question-parts': ['two parts', 'organism’s habitat', 'interacts'],
  'j1-ch1-1-abiotic-overview': ['Abiotic factors', 'nonliving parts', 'water', 'sunlight', 'oxygen', 'Temperature', 'soil'],
  'j1-ch1-1-biotic-factors': ['living', 'nonliving', 'biotic factors', 'Animals', 'plants'],
  'j1-ch1-1-water': ['water', 'sunlight', 'carbon dioxide', 'photosynthesis'],
  'j1-ch1-1-sunlight': ['photosynthesis', 'cannot grow', 'sunlight'],
  'j1-ch1-1-oxygen': ['oxygen', 'air', 'water'],
  'j1-ch1-1-temperature': ['Temperatures', 'determine', 'adapt', 'HOT', 'COLD'],
  'j1-ch1-1-soil': ['rock pieces', 'nutrients', 'air', 'water', 'decaying remains', 'influences'],
  'j1-ch1-1-question-levels': ['levels of organization', 'ecosystem'],
  'j1-ch1-1-populations': ['species', 'physically similar', 'mate', 'produce offspring', 'population'],
  'j1-ch1-1-communities': ['different populations', 'community', 'interact'],
  'j1-ch1-1-ecosystems': ['ecosystem', 'community', 'nonliving surroundings', 'ecology'],
  'j2-ch1-1-question-building-blocks': ['elements', 'building blocks of matter'],
  'j2-ch1-1-building-blocks-matter': ['Matter', 'mass', 'takes up space', 'Elements', 'simplest pure substances', 'building blocks of matter'],
  'j2-ch1-1-elements-compounds-mixtures': ['compound', 'chemically', 'specific ratio', 'mixture', 'not chemically combined'],
  'j2-ch1-1-particles-elements': ['atom', 'smallest particle', 'Democritus', 'atomos'],
  'j2-ch1-1-question-theory': ['atomic theory', 'develop', 'change'],
  'j2-ch1-1-theory-models': ['scientific theory', 'well-tested idea', 'Models', 'representations'],
  'j2-ch1-1-dalton': ['Dalton', 'atomic theory', 'accepted today'],
  'j2-ch1-1-thomson': ['Thomson', 'negatively charged particles', 'electrons'],
  'j2-ch1-1-rutherford': ['Rutherford', 'positive charge', 'nucleus', 'protons'],
  'j2-ch1-1-bohr': ['Bohr', 'specific amounts of energy', 'orbits'],
  'j2-ch1-1-electron-cloud': ['cloud', 'energy level'],
  'j2-ch1-1-modern-model': ['Chadwick', 'neutron', 'electrically neutral'],
}

export function renderHighlightedText(text: string, phrases: string[], enabled: boolean): ReactNode {
  if (!enabled || phrases.length === 0) return text

  let nodes: ReactNode[] = [text]
  for (const phrase of [...phrases].sort((a, b) => b.length - a.length)) {
    nodes = nodes.flatMap((node, outerIndex) => {
      if (typeof node !== 'string') return [node]
      const lower = node.toLowerCase()
      const target = phrase.toLowerCase()
      const parts: ReactNode[] = []
      let cursor = 0
      let match = lower.indexOf(target)

      while (match >= 0) {
        if (match > cursor) parts.push(node.slice(cursor, match))
        parts.push(<mark key={phrase + '-' + outerIndex + '-' + match}>{node.slice(match, match + phrase.length)}</mark>)
        cursor = match + phrase.length
        match = lower.indexOf(target, cursor)
      }

      if (cursor < node.length) parts.push(node.slice(cursor))
      return parts.length ? parts : [node]
    })
  }

  return nodes
}

export function FocusOverlay({
  content,
  chineseEnabled,
  onClose,
}: {
  content: FocusContent
  chineseEnabled: boolean
  onClose: () => void
}) {
  return (
    <div className="courseware-focus-overlay" role="dialog" aria-modal="true" aria-label={content.kind === 'image' ? 'Enlarged teaching visual' : 'Enlarged teaching text'} onClick={onClose}>
      <div className={`courseware-focus-card ${content.kind === 'image' ? 'courseware-focus-card--image' : ''}`} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close enlarged text">×</button>
        {content.kind === 'image' ? (
          <img src={content.imageSrc} alt={content.alt} />
        ) : (
          <>
            <p>{content.english}</p>
            {chineseEnabled && content.chinese && <p lang="zh-Hant">{content.chinese}</p>}
          </>
        )}
      </div>
    </div>
  )
}
