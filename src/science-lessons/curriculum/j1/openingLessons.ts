import type { LessonSlide, ScienceLesson } from '../../types/lesson'

const driveUrl = (id: string) => `https://drive.google.com/file/d/${id}/view`

const sourceReferences = [
  {
    id: 'src-j1-opening-source-ppt',
    type: 'presentation' as const,
    title: 'Copy of J1 PPT.pptx',
    location: 'Google Drive / J1Science',
    driveFileId: '1STwllX6-z931Hsqst_A1FvN7xwLCVI0g',
    url: 'https://docs.google.com/presentation/d/1STwllX6-z931Hsqst_A1FvN7xwLCVI0g/edit',
    slideRange: 'Chapter 1 Section 1 opening: habitats, environment, abiotic and biotic factors, ecosystem organisation',
    notes:
      'Authoritative J1 source deck for the Monday opening sequence. Content checked against the Drive readiness report and rebuilt as a short teachable opening lesson.',
  },
  {
    id: 'src-j1-opening-pptx-v2',
    type: 'presentation' as const,
    title: 'J1-opening-teaching-ready-visual-v2.pptx',
    location: 'Google Drive generated teaching companion',
    driveFileId: '1Yn9ypEFE2E1TW_3QrZf55iez742CIiwJ',
    url: 'https://docs.google.com/presentation/d/1Yn9ypEFE2E1TW_3QrZf55iez742CIiwJ/edit',
    notes:
      'Editable PowerPoint companion using the same slide sequence and wording as this digital lesson.',
  },
]

const resources = [
  {
    id: 'j1-opening-source-ppt',
    title: 'Source PPT: Copy of J1 PPT.pptx',
    type: 'Presentation' as const,
    format: 'PPTX' as const,
    detail: 'Drive source for Chapter 1 Section 1 opening',
    href: 'https://docs.google.com/presentation/d/1STwllX6-z931Hsqst_A1FvN7xwLCVI0g/edit',
    driveFileId: '1STwllX6-z931Hsqst_A1FvN7xwLCVI0g',
    sourceId: 'src-j1-opening-source-ppt',
    teacherOnly: true,
  },
  {
    id: 'j1-opening-editable-pptx',
    title: 'Editable PPT: J1 opening teaching-ready visual v2',
    type: 'Presentation' as const,
    format: 'PPTX' as const,
    detail: 'Teacher-ready PowerPoint companion for conventional teaching',
    href: driveUrl('1Yn9ypEFE2E1TW_3QrZf55iez742CIiwJ'),
    driveFileId: '1Yn9ypEFE2E1TW_3QrZf55iez742CIiwJ',
    sourceId: 'src-j1-opening-pptx-v2',
    teacherOnly: true,
  },
]

const slides: LessonSlide[] = [
  {
    id: 'j1-ch1-1-opening-question',
    title: { en: 'Life in ecosystems', zhHant: '生態系中的生命' },
    body: {
      en: "Main question: What needs are met by an organism's environment?",
      zhHant: '主要問題：生物的環境會滿足哪些需求？',
    },
    visual: 'ecosystem',
    layout: 'hero',
    emphasis: 'organisms + environment',
    revealMode: 'step-by-step',
    reveals: [
      { id: 'opening-question-1', text: { en: 'Today we connect organisms to the places where they live.', zhHant: '今天我們把生物和牠們生活的地方連結起來。' } },
      { id: 'opening-question-2', text: { en: 'By the end, students should use the words habitat, biotic and abiotic accurately.', zhHant: '課堂結束時，學生應能正確使用 habitat、biotic 和 abiotic。' } },
    ],
    teacherNote:
      'Keep this as a question-first opening. Students should predict the needs first, then attach vocabulary after the idea is clear.',
    sourceId: 'src-j1-opening-source-ppt',
  },
  {
    id: 'j1-ch1-1-habitat-needs',
    title: { en: 'A habitat gives an organism what it needs', zhHant: '棲地提供生物所需的東西' },
    body: {
      en: 'Food, water, shelter and space help organisms live, grow and reproduce.',
      zhHant: '食物、水、庇護所和空間幫助生物生存、生長和繁殖。',
    },
    visual: 'ecosystem',
    layout: 'concept',
    emphasis: 'survival and growth',
    revealMode: 'step-by-step',
    reveals: [
      { id: 'habitat-needs-food', text: { en: 'Food gives energy and materials for growth.', zhHant: '食物提供能量和生長所需的物質。' } },
      { id: 'habitat-needs-water', text: { en: 'Water keeps life processes working.', zhHant: '水讓生命過程能夠運作。' } },
      { id: 'habitat-needs-shelter', text: { en: 'Shelter and space help organisms avoid danger and reproduce.', zhHant: '庇護所和空間幫助生物避開危險並繁殖。' } },
    ],
    teacherNote:
      'Point to a visible scene or board sketch and make students label the four needs before writing the definition of habitat.',
    sourceId: 'src-j1-opening-source-ppt',
  },
  {
    id: 'j1-ch1-1-biotic-abiotic-sort',
    title: { en: 'A habitat has living and nonliving parts', zhHant: '棲地有有生命和無生命的部分' },
    body: {
      en: 'Biotic factors are living parts. Abiotic factors are nonliving parts that still affect life.',
      zhHant: '生物因子是有生命的部分。非生物因子是無生命但仍會影響生命的部分。',
    },
    visual: 'ecosystem',
    layout: 'comparison',
    emphasis: 'biotic + abiotic factors',
    revealMode: 'step-by-step',
    reveals: [
      { id: 'biotic-1', text: { en: 'Biotic examples: plants, animals, fish, birds and seeds.', zhHant: '生物因子例子：植物、動物、魚、鳥和種子。' } },
      { id: 'abiotic-1', text: { en: 'Abiotic examples: water, sunlight, oxygen, soil and temperature.', zhHant: '非生物因子例子：水、陽光、氧氣、土壤和溫度。' } },
      { id: 'sort-1', text: { en: 'Classify first, then explain how the factor affects life.', zhHant: '先分類，再解釋這個因子如何影響生命。' } },
    ],
    teacherNote:
      'Make this interactive: call out examples and have students hold up one finger for biotic and two fingers for abiotic.',
    sourceId: 'src-j1-opening-source-ppt',
  },
  {
    id: 'j1-ch1-1-abiotic-factors',
    title: { en: 'Abiotic factors shape where organisms can live', zhHant: '非生物因子會塑造生物能生活的地方' },
    body: {
      en: 'Water, sunlight, oxygen, temperature and soil affect which organisms can survive in a habitat.',
      zhHant: '水、陽光、氧氣、溫度和土壤會影響哪些生物能在棲地中生存。',
    },
    visual: 'ecosystem',
    layout: 'diagram',
    emphasis: 'habitat conditions matter',
    revealMode: 'step-by-step',
    reveals: [
      { id: 'abiotic-water', text: { en: 'Water: how much is available?', zhHant: '水：可用的水量有多少？' } },
      { id: 'abiotic-light', text: { en: 'Sunlight and temperature: what conditions does the organism experience?', zhHant: '陽光和溫度：生物面對什麼條件？' } },
      { id: 'abiotic-soil', text: { en: 'Soil and oxygen: what resources are available?', zhHant: '土壤和氧氣：有哪些資源可用？' } },
    ],
    teacherNote:
      'Ask which abiotic factor would change fastest after a storm. Use that to show why nonliving factors still matter.',
    sourceId: 'src-j1-opening-source-ppt',
  },
  {
    id: 'j1-ch1-1-organization',
    title: { en: 'How are living things organized in an ecosystem?', zhHant: '生態系中的生物如何組織？' },
    body: {
      en: 'Species, populations, communities and ecosystems describe larger and larger levels of organization.',
      zhHant: '物種、族群、群落和生態系描述越來越大的組織層次。',
    },
    visual: 'ecosystem',
    layout: 'diagram',
    emphasis: 'species -> population -> community -> ecosystem',
    revealMode: 'step-by-step',
    reveals: [
      { id: 'org-species', text: { en: 'Species: one kind of organism.', zhHant: '物種：一種生物。' } },
      { id: 'org-population', text: { en: 'Population: one species living in one area.', zhHant: '族群：同一地區中的同一物種。' } },
      { id: 'org-community', text: { en: 'Community: different populations living together.', zhHant: '群落：不同族群共同生活。' } },
      { id: 'org-ecosystem', text: { en: 'Ecosystem: the community plus nonliving surroundings.', zhHant: '生態系：群落加上周圍的非生物環境。' } },
    ],
    teacherNote:
      'Use one example all the way through: one frog, many frogs, frogs plus plants and insects, then the pond with water and sunlight.',
    sourceId: 'src-j1-opening-source-ppt',
  },
  {
    id: 'j1-ch1-1-vocabulary-check',
    title: { en: 'Key words students should be able to say', zhHant: '學生應該能說出的關鍵詞' },
    body: {
      en: 'Use the vocabulary to answer the main question in one clear English sentence.',
      zhHant: '使用詞彙，用一句清楚的英文回答主要問題。',
    },
    visual: 'question',
    layout: 'vocabulary',
    emphasis: 'classify, then explain',
    revealMode: 'step-by-step',
    reveals: [
      { id: 'vocab-habitat', text: { en: 'Habitat: the place that provides what an organism needs.', zhHant: '棲地：提供生物所需事物的地方。' } },
      { id: 'vocab-abiotic', text: { en: 'Abiotic: a nonliving part of a habitat.', zhHant: '非生物：棲地中沒有生命的部分。' } },
      { id: 'vocab-biotic', text: { en: 'Biotic: a living part of a habitat.', zhHant: '生物：棲地中有生命的部分。' } },
      { id: 'vocab-ecosystem', text: { en: 'Ecosystem: a community plus nonliving surroundings.', zhHant: '生態系：群落加上非生物環境。' } },
    ],
    teacherNote:
      'Quick oral retrieval before moving deeper into Chapter 1 Section 1. Require a full English sentence, not isolated words.',
    sourceId: 'src-j1-opening-pptx-v2',
  },
]

export const j1OpeningLessons: ScienceLesson[] = [
  {
    id: 'j1-ch1-1-habitats-ecosystems-opening',
    unitId: 'j1-fall-life-ecosystems',
    title: 'Habitats and Ecosystems: Opening Lesson',
    subtitle: 'Main question, habitat needs, biotic/abiotic factors and ecosystem organisation',
    year: 'J1',
    semester: 'Fall',
    chapter: 'Ch.1.1',
    lessonOrder: -10,
    duration: 50,
    status: 'Published',
    updated: '29 August 2026',
    objectives: [
      "Answer: What needs are met by an organism's environment?",
      'Define habitat using food, water, shelter and space.',
      'Classify examples as biotic or abiotic factors.',
      'Explain species, population, community and ecosystem as levels of organization.',
    ],
    sourceReferences,
    slides,
    resources,
  },
]
