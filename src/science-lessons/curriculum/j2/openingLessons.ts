import type { LessonSlide, ScienceLesson } from '../../types/lesson'

const driveUrl = (id: string) => `https://drive.google.com/file/d/${id}/view`

const atomModelSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><rect width='1200' height='800' fill='rgb(8,18,48)'/><circle cx='600' cy='400' r='330' fill='none' stroke='rgb(93,188,252)' stroke-width='7' opacity='.55'/><circle cx='600' cy='400' r='245' fill='none' stroke='rgb(112,235,198)' stroke-width='5' opacity='.45'/><ellipse cx='600' cy='400' rx='390' ry='120' fill='none' stroke='rgb(147,197,253)' stroke-width='8' opacity='.65' transform='rotate(-25 600 400)'/><ellipse cx='600' cy='400' rx='390' ry='120' fill='none' stroke='rgb(45,212,191)' stroke-width='8' opacity='.55' transform='rotate(25 600 400)'/><circle cx='600' cy='400' r='82' fill='rgb(250,204,21)'/><circle cx='570' cy='390' r='30' fill='rgb(248,113,113)'/><circle cx='628' cy='418' r='30' fill='rgb(96,165,250)'/><circle cx='612' cy='365' r='25' fill='rgb(248,113,113)'/><circle cx='374' cy='251' r='24' fill='rgb(125,211,252)'/><circle cx='812' cy='548' r='24' fill='rgb(125,211,252)'/><circle cx='870' cy='270' r='24' fill='rgb(125,211,252)'/><text x='80' y='105' fill='white' font-family='Arial' font-size='54' font-weight='700'>Modern atom model</text><text x='80' y='168' fill='rgb(203,213,225)' font-family='Arial' font-size='30'>nucleus, protons, neutrons, electron cloud</text><text x='704' y='400' fill='white' font-family='Arial' font-size='32' font-weight='700'>nucleus</text><text x='915' y='270' fill='rgb(191,219,254)' font-family='Arial' font-size='30'>electron</text></svg>`

const matterSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><defs><radialGradient id='g' cx='45%' cy='30%'><stop offset='0%' stop-color='rgb(186,230,253)'/><stop offset='70%' stop-color='rgb(14,116,144)'/><stop offset='100%' stop-color='rgb(8,47,73)'/></radialGradient></defs><rect width='1200' height='800' fill='rgb(5,19,40)'/><circle cx='610' cy='405' r='260' fill='url(%23g)'/><g fill='rgb(255,255,255)' opacity='.88'><circle cx='522' cy='320' r='20'/><circle cx='585' cy='352' r='16'/><circle cx='648' cy='307' r='20'/><circle cx='704' cy='380' r='16'/><circle cx='555' cy='460' r='18'/><circle cx='640' cy='500' r='22'/><circle cx='740' cy='470' r='14'/></g><text x='72' y='120' fill='white' font-family='Arial' font-size='58' font-weight='700'>Matter zoom</text><text x='72' y='186' fill='rgb(203,213,225)' font-family='Arial' font-size='32'>everything around us is made from particles</text><text x='820' y='620' fill='rgb(191,219,254)' font-family='Arial' font-size='34'>droplet → particles → atoms</text></svg>`

const timelineSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><rect width='1200' height='800' fill='rgb(15,23,42)'/><line x1='130' y1='410' x2='1070' y2='410' stroke='rgb(148,163,184)' stroke-width='8'/><g font-family='Arial'><text x='75' y='120' fill='white' font-size='58' font-weight='700'>Atomic models changed</text><text x='75' y='184' fill='rgb(203,213,225)' font-size='32'>new evidence improved the model over time</text></g><g font-family='Arial' font-size='28' text-anchor='middle'><circle cx='160' cy='410' r='44' fill='rgb(59,130,246)'/><text x='160' y='420' fill='white' font-weight='700'>1</text><text x='160' y='505' fill='white'>Democritus</text><text x='160' y='545' fill='rgb(203,213,225)' font-size='24'>tiny pieces</text><circle cx='330' cy='410' r='44' fill='rgb(34,197,94)'/><text x='330' y='420' fill='white' font-weight='700'>2</text><text x='330' y='505' fill='white'>Dalton</text><text x='330' y='545' fill='rgb(203,213,225)' font-size='24'>atomic theory</text><circle cx='500' cy='410' r='44' fill='rgb(14,165,233)'/><text x='500' y='420' fill='white' font-weight='700'>3</text><text x='500' y='505' fill='white'>Thomson</text><text x='500' y='545' fill='rgb(203,213,225)' font-size='24'>electrons</text><circle cx='670' cy='410' r='44' fill='rgb(234,179,8)'/><text x='670' y='420' fill='white' font-weight='700'>4</text><text x='670' y='505' fill='white'>Rutherford</text><text x='670' y='545' fill='rgb(203,213,225)' font-size='24'>nucleus</text><circle cx='840' cy='410' r='44' fill='rgb(168,85,247)'/><text x='840' y='420' fill='white' font-weight='700'>5</text><text x='840' y='505' fill='white'>Bohr</text><text x='840' y='545' fill='rgb(203,213,225)' font-size='24'>energy levels</text><circle cx='1010' cy='410' r='44' fill='rgb(239,68,68)'/><text x='1010' y='420' fill='white' font-weight='700'>6</text><text x='1010' y='505' fill='white'>Chadwick</text><text x='1010' y='545' fill='rgb(203,213,225)' font-size='24'>neutrons</text></g></svg>`

const sourceReferences = [
  {
    id: 'src-j2-opening-source-ppt',
    type: 'presentation' as const,
    title: 'J2 PPT (updated).pptx',
    location: 'Google Drive / J2Science',
    driveFileId: '14AUxNBq96_rRR9exiieSsHBdvuth4ofh',
    url: 'https://docs.google.com/presentation/d/14AUxNBq96_rRR9exiieSsHBdvuth4ofh/edit',
    slideRange: 'Chapter 1 Section 1 opening: matter, elements, atoms, models and atomic theory',
    notes:
      'Authoritative J2 source deck for the Monday opening sequence. Content checked against the Drive readiness report and rebuilt as a short teachable opening lesson.',
  },
  {
    id: 'src-j2-opening-pptx-v2',
    type: 'presentation' as const,
    title: 'J2-opening-teaching-ready-visual-v2.pptx',
    location: 'Google Drive generated teaching companion',
    driveFileId: '1WikGkibvBob-Crp2AHiKsFaKnza22kcB',
    url: 'https://docs.google.com/presentation/d/1WikGkibvBob-Crp2AHiKsFaKnza22kcB/edit',
    notes:
      'Editable PowerPoint companion using the same slide sequence and wording as this digital lesson.',
  },
]

const resources = [
  {
    id: 'j2-opening-source-ppt',
    title: 'Source PPT: J2 PPT (updated).pptx',
    type: 'Presentation' as const,
    format: 'PPTX' as const,
    detail: 'Drive source for Chapter 1 Section 1 opening',
    href: 'https://docs.google.com/presentation/d/14AUxNBq96_rRR9exiieSsHBdvuth4ofh/edit',
    driveFileId: '14AUxNBq96_rRR9exiieSsHBdvuth4ofh',
    sourceId: 'src-j2-opening-source-ppt',
    teacherOnly: true,
  },
  {
    id: 'j2-opening-editable-pptx',
    title: 'Editable PPT: J2 opening teaching-ready visual v2',
    type: 'Presentation' as const,
    format: 'PPTX' as const,
    detail: 'Teacher-ready PowerPoint companion for conventional teaching',
    href: driveUrl('1WikGkibvBob-Crp2AHiKsFaKnza22kcB'),
    driveFileId: '1WikGkibvBob-Crp2AHiKsFaKnza22kcB',
    sourceId: 'src-j2-opening-pptx-v2',
    teacherOnly: true,
  },
]

const slides: LessonSlide[] = [
  {
    id: 'j2-ch1-1-opening-question',
    title: { en: 'Elements and atoms', zhHant: '元素與原子' },
    body: {
      en: 'Main question: Why are elements sometimes called the building blocks of matter?',
      zhHant: '主要問題：為什麼元素有時被稱為物質的基本組成單位？',
    },
    visual: 'particles',
    layout: 'hero',
    emphasis: 'matter -> particles -> atoms',
    media: { type: 'image', title: 'Matter zoom model', src: matterSvg, alt: 'Matter zooming into particles and atoms' },
    revealMode: 'step-by-step',
    reveals: [
      { id: 'opening-1', text: { en: 'Start with matter students can see and touch.', zhHant: '從學生看得見、摸得到的物質開始。' } },
      { id: 'opening-2', text: { en: 'Then zoom in to particles that are too small to see directly.', zhHant: '接著放大到無法直接看見的微小粒子。' } },
    ],
    teacherNote:
      'Open with a familiar object or water droplet, then move toward the particle model. Avoid starting with vocabulary only.',
    sourceId: 'src-j2-opening-source-ppt',
  },
  {
    id: 'j2-ch1-1-matter-elements',
    title: { en: 'Matter is made from elements', zhHant: '物質由元素組成' },
    body: {
      en: 'Matter has mass and takes up space. Elements are the simplest pure substances.',
      zhHant: '物質有質量並佔有空間。元素是最簡單的純物質。',
    },
    visual: 'particles',
    layout: 'image-focus',
    emphasis: 'building blocks of matter',
    media: { type: 'image', title: 'Matter particle model', src: matterSvg, alt: 'Droplet and particles model' },
    revealMode: 'step-by-step',
    reveals: [
      { id: 'matter', text: { en: 'Matter: anything that has mass and takes up space.', zhHant: '物質：任何有質量並佔有空間的東西。' } },
      { id: 'element', text: { en: 'Element: the simplest pure substance.', zhHant: '元素：最簡單的純物質。' } },
      { id: 'compare', text: { en: 'Compounds and mixtures use elements in different ways.', zhHant: '化合物和混合物以不同方式使用元素。' } },
    ],
    teacherNote:
      'Use the slide to separate the big idea from vocabulary: matter is the stuff; elements are the simplest building blocks.',
    sourceId: 'src-j2-opening-source-ppt',
  },
  {
    id: 'j2-ch1-1-atom-model',
    title: { en: 'An atom is the smallest particle of an element', zhHant: '原子是元素中最小的粒子' },
    body: {
      en: 'Atoms are too small to see directly, so scientists use models to explain them.',
      zhHant: '原子太小，無法直接看見，所以科學家使用模型來解釋它們。',
    },
    visual: 'particles',
    layout: 'image-focus',
    emphasis: 'models explain what we cannot see',
    media: { type: 'image', title: 'Atom model', src: atomModelSvg, alt: 'Modern atom model with nucleus and electron cloud' },
    revealMode: 'step-by-step',
    reveals: [
      { id: 'atom', text: { en: 'Atom: the smallest particle of an element.', zhHant: '原子：元素中最小的粒子。' } },
      { id: 'model', text: { en: 'A model helps explain something too small or complex to see clearly.', zhHant: '模型幫助解釋太小或太複雜、無法清楚看見的事物。' } },
      { id: 'limits', text: { en: 'Ask: What does this model show? What does it not show perfectly?', zhHant: '提問：這個模型顯示了什麼？它不能完美顯示什麼？' } },
    ],
    teacherNote:
      'Students often copy atom diagrams without understanding models. Ask what the model shows and what it cannot show perfectly.',
    sourceId: 'src-j2-opening-source-ppt',
  },
  {
    id: 'j2-ch1-1-atomic-models-timeline',
    title: { en: 'Atomic models changed when evidence changed', zhHant: '當證據改變時，原子模型也改變' },
    body: {
      en: 'Democritus, Dalton, Thomson, Rutherford, Bohr and Chadwick each helped scientists improve the model of the atom.',
      zhHant: '德謨克利特、道爾頓、湯姆森、拉塞福、波耳和查兌克都幫助科學家改進原子模型。',
    },
    visual: 'particles',
    layout: 'image-focus',
    emphasis: 'evidence changes models',
    media: { type: 'image', title: 'Atomic theory timeline', src: timelineSvg, alt: 'Timeline of atomic theory models' },
    revealMode: 'step-by-step',
    reveals: [
      { id: 'early', text: { en: 'Early idea: matter can be divided into tiny pieces.', zhHant: '早期想法：物質可以分成微小的部分。' } },
      { id: 'electrons', text: { en: 'New evidence led to electrons and the nucleus.', zhHant: '新的證據導向電子和原子核的概念。' } },
      { id: 'modern', text: { en: 'The modern model includes protons, neutrons and an electron cloud.', zhHant: '現代模型包含質子、中子和電子雲。' } },
    ],
    teacherNote:
      'Do not turn this into a biography lesson. Keep the teaching point: scientific models improve when new evidence appears.',
    sourceId: 'src-j2-opening-source-ppt',
  },
  {
    id: 'j2-ch1-1-modern-atom',
    title: { en: 'The modern atom has a nucleus and an electron cloud', zhHant: '現代原子有原子核和電子雲' },
    body: {
      en: 'The nucleus contains protons and neutrons. Electrons are found in the electron cloud around the nucleus.',
      zhHant: '原子核含有質子和中子。電子位於原子核周圍的電子雲中。',
    },
    visual: 'particles',
    layout: 'image-focus',
    emphasis: 'nucleus + electron cloud',
    media: { type: 'image', title: 'Modern atom model', src: atomModelSvg, alt: 'Modern atom model with labels' },
    revealMode: 'step-by-step',
    reveals: [
      { id: 'nucleus', text: { en: 'Nucleus: the small center of the atom.', zhHant: '原子核：原子中央很小的部分。' } },
      { id: 'proton-neutron', text: { en: 'Protons and neutrons are found in the nucleus.', zhHant: '質子和中子位於原子核中。' } },
      { id: 'electron-cloud', text: { en: 'Electrons are found in the electron cloud.', zhHant: '電子位於電子雲中。' } },
    ],
    teacherNote:
      'Use this still model in the PowerPoint version. In the digital lesson, pause and label the atom before students draw it.',
    sourceId: 'src-j2-opening-pptx-v2',
  },
  {
    id: 'j2-ch1-1-vocabulary-check',
    title: { en: 'Key words students should be able to say', zhHant: '學生應該能說出的關鍵詞' },
    body: {
      en: 'Use matter, element, compound, atom, electron and nucleus in short spoken answers.',
      zhHant: '在簡短口頭回答中使用 matter、element、compound、atom、electron 和 nucleus。',
    },
    visual: 'question',
    layout: 'question',
    emphasis: 'definition + example',
    revealMode: 'step-by-step',
    reveals: [
      { id: 'vocab-matter', text: { en: 'Matter: anything that has mass and takes up space.', zhHant: '物質：任何有質量並佔有空間的東西。' } },
      { id: 'vocab-element', text: { en: 'Element: the simplest pure substance.', zhHant: '元素：最簡單的純物質。' } },
      { id: 'vocab-compound', text: { en: 'Compound: two or more elements chemically combined.', zhHant: '化合物：兩種或多種元素以化學方式結合。' } },
      { id: 'vocab-atom', text: { en: 'Atom: the smallest particle of an element.', zhHant: '原子：元素中最小的粒子。' } },
      { id: 'vocab-electron', text: { en: 'Electron: a negatively charged particle in the atom.', zhHant: '電子：原子中帶負電的粒子。' } },
      { id: 'vocab-nucleus', text: { en: 'Nucleus: the small center of the atom.', zhHant: '原子核：原子中央很小的部分。' } },
    ],
    teacherNote:
      'Run this as oral retrieval. Students answer in English; click or switch language only when they need Traditional Chinese support.',
    sourceId: 'src-j2-opening-pptx-v2',
  },
]

export const j2OpeningLessons: ScienceLesson[] = [
  {
    id: 'j2-ch1-1-elements-atoms-opening',
    unitId: 'j2-fall-atoms-bonding',
    title: 'Elements and Atoms: Opening Lesson',
    subtitle: 'Main question, matter, elements, atoms, models, atomic theory and the modern atom',
    year: 'J2',
    semester: 'Fall',
    chapter: 'Ch.1.1',
    lessonOrder: -10,
    duration: 50,
    status: 'Published',
    updated: '29 August 2026',
    objectives: [
      'Answer why elements can be called the building blocks of matter.',
      'Define matter, element, compound and atom in student-friendly English.',
      'Explain why scientists use models for atoms.',
      'Identify nucleus, protons, neutrons, electrons and electron cloud in the modern atom model.',
    ],
    sourceReferences,
    slides,
    resources,
  },
]
