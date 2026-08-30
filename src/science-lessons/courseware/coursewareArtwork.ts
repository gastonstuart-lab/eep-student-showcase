import type { CSSProperties } from 'react'

export type ArtworkApproval = 'approved' | 'final' | 'candidate' | 'unfinished'

export type RevealBlock = {
  id: string
  stage: number
  style: CSSProperties
}

export type CoursewareArtwork = {
  src: string
  alt: string
  approval: ArtworkApproval
  textRegion: CSSProperties
  visualRegion: CSSProperties
  highlightRegion: CSSProperties
  revealBlocks: RevealBlock[]
}

const asset = (path: string) => `${import.meta.env.BASE_URL}science-lessons/gold/${path}`

const leftText: CSSProperties = { left: '1.5%', top: '12%', width: '47%', height: '74%' }
const rightVisual: CSSProperties = { left: '45%', top: '9%', width: '53%', height: '76%' }
const leftHighlight: CSSProperties = { left: '0', top: '10%', width: '53%', height: '78%' }

const block = (id: string, stage: number, top: string, height: string, left = '3%', width = '42%'): RevealBlock => ({
  id,
  stage,
  style: { left, top, width, height },
})

export const coursewareArtwork: Record<string, CoursewareArtwork> = {
  'j1-ch1-1-title': {
    src: asset('j1/01-title.png'),
    alt: 'Living Things and the Environment chapter opening in a wetland habitat',
    approval: 'final',
    textRegion: leftText,
    visualRegion: rightVisual,
    highlightRegion: leftHighlight,
    revealBlocks: [block('j1-01-title', 1, '22%', '40%', '2%', '51%')],
  },
  'j1-ch1-1-question-needs': {
    src: asset('j1/02-question.png'),
    alt: 'Question of the Day with a turtle in its pond habitat',
    approval: 'approved',
    textRegion: leftText,
    visualRegion: rightVisual,
    highlightRegion: leftHighlight,
    revealBlocks: [block('j1-02-question', 1, '27%', '50%')],
  },
  'j1-ch1-1-habitats': {
    src: asset('j1/03-habitats.png'),
    alt: 'Habitats explained with polar, savanna and reef examples',
    approval: 'approved',
    textRegion: leftText,
    visualRegion: rightVisual,
    highlightRegion: leftHighlight,
    revealBlocks: [
      block('j1-03-first', 1, '34%', '24%'),
      block('j1-03-second', 2, '60%', '27%'),
    ],
  },
  'j1-ch1-1-question-parts': {
    src: asset('j1/04-question-parts.png'),
    alt: 'Question about biotic and abiotic parts of a bear habitat',
    approval: 'final',
    textRegion: leftText,
    visualRegion: rightVisual,
    highlightRegion: leftHighlight,
    revealBlocks: [block('j1-04-question', 1, '25%', '58%')],
  },
  'j1-ch1-1-abiotic-overview': {
    src: asset('j1/05-abiotic.png'),
    alt: 'Abiotic factors diagram showing water, sunlight, oxygen, temperature and soil',
    approval: 'approved',
    textRegion: leftText,
    visualRegion: rightVisual,
    highlightRegion: leftHighlight,
    revealBlocks: [
      block('j1-05-first', 1, '48%', '15%', '4%', '37%'),
      block('j1-05-second', 2, '64%', '20%', '4%', '37%'),
    ],
  },
  'j1-ch1-1-biotic-factors': {
    src: asset('j1/06-biotic.png'),
    alt: 'Biotic factors explained with wolves, a bird, plants, seeds and fish',
    approval: 'approved',
    textRegion: leftText,
    visualRegion: rightVisual,
    highlightRegion: leftHighlight,
    revealBlocks: [
      block('j1-06-first', 1, '32%', '14%', '4%', '40%'),
      block('j1-06-second', 2, '46%', '13%', '4%', '40%'),
      block('j1-06-third', 3, '59%', '12%', '4%', '40%'),
      block('j1-06-fourth', 4, '70%', '13%', '4%', '40%'),
    ],
  },
  'j1-ch1-1-water': {
    src: asset('j1/07-water.png'), alt: 'Water as an abiotic factor with photosynthesis and organism hydration', approval: 'final',
    textRegion: leftText, visualRegion: rightVisual, highlightRegion: leftHighlight,
    revealBlocks: [block('j1-07-first', 1, '39%', '15%'), block('j1-07-second', 2, '54%', '13%'), block('j1-07-third', 3, '67%', '13%')],
  },
  'j1-ch1-1-sunlight': {
    src: asset('j1/08-sunlight.png'), alt: 'Sunlight as an abiotic factor supporting photosynthesis', approval: 'final',
    textRegion: leftText, visualRegion: rightVisual, highlightRegion: leftHighlight,
    revealBlocks: [block('j1-08-first', 1, '40%', '13%'), block('j1-08-second', 2, '53%', '15%'), block('j1-08-third', 3, '68%', '14%')],
  },
  'j1-ch1-1-oxygen': {
    src: asset('j1/09-oxygen.png'), alt: 'Oxygen in air and water as an abiotic factor', approval: 'final',
    textRegion: leftText, visualRegion: rightVisual, highlightRegion: leftHighlight,
    revealBlocks: [block('j1-09-first', 1, '41%', '13%'), block('j1-09-second', 2, '54%', '13%'), block('j1-09-third', 3, '67%', '15%')],
  },
  'j1-ch1-1-temperature': {
    src: asset('j1/10-temperature.png'), alt: 'Hot and cold habitats showing temperature as an abiotic factor', approval: 'final',
    textRegion: leftText, visualRegion: rightVisual, highlightRegion: leftHighlight,
    revealBlocks: [block('j1-10-first', 1, '42%', '17%'), block('j1-10-second', 2, '60%', '21%')],
  },
  'j1-ch1-1-soil': {
    src: asset('j1/11-soil.png'), alt: 'Soil composition and its influence on organisms', approval: 'final',
    textRegion: leftText, visualRegion: rightVisual, highlightRegion: leftHighlight,
    revealBlocks: [block('j1-11-first', 1, '40%', '16%'), block('j1-11-second', 2, '56%', '14%'), block('j1-11-third', 3, '70%', '14%')],
  },
  'j1-ch1-1-question-levels': {
    src: asset('j1/12-question-levels.png'), alt: 'Question about levels of organization within an ecosystem', approval: 'final',
    textRegion: leftText, visualRegion: rightVisual, highlightRegion: leftHighlight,
    revealBlocks: [block('j1-12-question', 1, '27%', '50%')],
  },
  'j1-ch1-1-populations': {
    src: asset('j1/13-populations.png'), alt: 'Species and population explained with a group of the same species', approval: 'final',
    textRegion: leftText, visualRegion: rightVisual, highlightRegion: leftHighlight,
    revealBlocks: [block('j1-13-first', 1, '42%', '18%'), block('j1-13-second', 2, '61%', '19%')],
  },
  'j1-ch1-1-communities': {
    src: asset('j1/14-communities.png'), alt: 'Community shown as interacting populations in one area', approval: 'final',
    textRegion: leftText, visualRegion: rightVisual, highlightRegion: leftHighlight,
    revealBlocks: [block('j1-14-first', 1, '40%', '13%'), block('j1-14-second', 2, '53%', '16%'), block('j1-14-third', 3, '69%', '14%')],
  },
  'j1-ch1-1-ecosystems': {
    src: asset('j1/15-ecosystems.png'), alt: 'Ecosystem showing a community and its nonliving surroundings', approval: 'final',
    textRegion: leftText, visualRegion: rightVisual, highlightRegion: leftHighlight,
    revealBlocks: [block('j1-15-first', 1, '43%', '20%'), block('j1-15-second', 2, '64%', '18%')],
  },

  'j2-ch1-title': {
    src: asset('j2/01-chapter-title.png'),
    alt: 'Atoms and Bonding chapter opening with luminous particle models',
    approval: 'approved',
    textRegion: leftText,
    visualRegion: rightVisual,
    highlightRegion: leftHighlight,
    revealBlocks: [block('j2-01-title', 1, '22%', '42%', '2%', '48%')],
  },
  'j2-ch1-1-title': {
    src: asset('j2/02-section-title.png'),
    alt: 'Elements and Atoms section opening with matter, atom, molecule, element and compound visuals',
    approval: 'approved',
    textRegion: leftText,
    visualRegion: rightVisual,
    highlightRegion: leftHighlight,
    revealBlocks: [block('j2-02-title', 1, '27%', '38%', '2%', '47%')],
  },
  'j2-ch1-1-question-building-blocks': {
    src: asset('j2/03-question-building-blocks.png'),
    alt: 'Question about elements as the building blocks of matter',
    approval: 'approved',
    textRegion: leftText,
    visualRegion: rightVisual,
    highlightRegion: leftHighlight,
    revealBlocks: [block('j2-03-question', 1, '25%', '58%', '2%', '47%')],
  },
  'j2-ch1-1-building-blocks-matter': {
    src: asset('j2/04-building-blocks.png'),
    alt: 'Matter, elements and combinations of elements explained with scientific models',
    approval: 'approved',
    textRegion: leftText,
    visualRegion: rightVisual,
    highlightRegion: leftHighlight,
    revealBlocks: [
      block('j2-04-first', 1, '38%', '12%', '3%', '43%'),
      block('j2-04-second', 2, '50%', '12%', '3%', '43%'),
      block('j2-04-third', 3, '62%', '20%', '3%', '43%'),
    ],
  },
  'j2-ch1-1-elements-compounds-mixtures': {
    src: asset('j2/05-elements-compounds-mixtures.png'),
    alt: 'Particle comparison of elements, compounds and mixtures',
    approval: 'approved',
    textRegion: leftText,
    visualRegion: rightVisual,
    highlightRegion: leftHighlight,
    revealBlocks: [
      block('j2-05-first', 1, '42%', '20%', '3%', '43%'),
      block('j2-05-second', 2, '63%', '19%', '3%', '43%'),
    ],
  },
  'j2-ch1-1-particles-elements': {
    src: asset('j2/06-particles-elements.png'),
    alt: 'Particles of elements illustrated with atomos and Democritus',
    approval: 'approved',
    textRegion: leftText,
    visualRegion: rightVisual,
    highlightRegion: leftHighlight,
    revealBlocks: [
      block('j2-06-first', 1, '43%', '12%', '3%', '43%'),
      block('j2-06-second', 2, '55%', '26%', '3%', '43%'),
    ],
  },
  'j2-ch1-1-question-theory': {
    src: asset('j2/07-question-theory.png'),
    alt: 'Question about how atomic theory developed and changed',
    approval: 'approved',
    textRegion: leftText,
    visualRegion: rightVisual,
    highlightRegion: leftHighlight,
    revealBlocks: [block('j2-07-question', 1, '26%', '56%', '2%', '47%')],
  },
  'j2-ch1-1-theory-models': {
    src: asset('j2/08-theory-models.png'),
    alt: 'Scientific theory and models with an atomic-model development timeline',
    approval: 'approved',
    textRegion: leftText,
    visualRegion: rightVisual,
    highlightRegion: leftHighlight,
    revealBlocks: [
      block('j2-08-first', 1, '38%', '20%', '3%', '43%'),
      block('j2-08-second', 2, '59%', '22%', '3%', '43%'),
    ],
  },
  'j2-ch1-1-dalton': {
    src: asset('j2/09-dalton.png'),
    alt: 'Dalton atomic theory with solid sphere model',
    approval: 'approved',
    textRegion: leftText,
    visualRegion: rightVisual,
    highlightRegion: leftHighlight,
    revealBlocks: [
      block('j2-09-first', 1, '55%', '13%', '3%', '43%'),
      block('j2-09-second', 2, '69%', '12%', '3%', '43%'),
    ],
  },
  'j2-ch1-1-thomson': {
    src: asset('j2/10-thomson.png'),
    alt: 'Thomson model showing negatively charged electrons within the atom',
    approval: 'approved',
    textRegion: leftText,
    visualRegion: rightVisual,
    highlightRegion: leftHighlight,
    revealBlocks: [
      block('j2-10-first', 1, '43%', '12%', '3%', '43%'),
      block('j2-10-second', 2, '55%', '13%', '3%', '43%'),
      block('j2-10-third', 3, '68%', '14%', '3%', '43%'),
    ],
  },
  'j2-ch1-1-rutherford': {
    src: asset('j2/11-rutherford.png'), alt: 'Rutherford gold-foil scattering evidence for a tiny positive nucleus', approval: 'final',
    textRegion: leftText, visualRegion: rightVisual, highlightRegion: leftHighlight,
    revealBlocks: [block('j2-11-first', 1, '56%', '15%'), block('j2-11-second', 2, '71%', '12%')],
  },
  'j2-ch1-1-bohr': {
    src: asset('j2/12-bohr.png'), alt: 'Bohr model with electrons in discrete energy levels', approval: 'final',
    textRegion: leftText, visualRegion: rightVisual, highlightRegion: leftHighlight,
    revealBlocks: [block('j2-12-first', 1, '55%', '19%')],
  },
  'j2-ch1-1-electron-cloud': {
    src: asset('j2/13-electron-cloud.png'), alt: 'Fixed orbit model dissolving into an electron probability cloud', approval: 'final',
    textRegion: leftText, visualRegion: rightVisual, highlightRegion: leftHighlight,
    revealBlocks: [block('j2-13-first', 1, '54%', '17%'), block('j2-13-second', 2, '71%', '15%')],
  },
  'j2-ch1-1-modern-model': {
    src: asset('j2/14-modern-model.png'), alt: 'Modern atomic model with charged protons and neutral neutrons', approval: 'final',
    textRegion: leftText, visualRegion: rightVisual, highlightRegion: leftHighlight,
    revealBlocks: [block('j2-14-first', 1, '55%', '13%'), block('j2-14-second', 2, '68%', '11%'), block('j2-14-third', 3, '79%', '11%')],
  },
  'j2-ch1-1-models-summary': {
    src: asset('j2/15-models-summary.png'), alt: 'Timeline from Dalton through Chadwick and the modern atomic model', approval: 'final',
    textRegion: leftText, visualRegion: { left: '31%', top: '18%', width: '67%', height: '68%' }, highlightRegion: leftHighlight,
    revealBlocks: [block('j2-15-summary', 1, '26%', '55%', '31%', '66%')],
  },
}

export const FINAL_ARTWORK_IDS = Object.entries(coursewareArtwork)
  .filter(([, artwork]) => artwork.approval === 'approved' || artwork.approval === 'final')
  .map(([id]) => id)
