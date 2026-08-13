export type YearLevel = 'J1' | 'J2'
export type Semester = 'Fall' | 'Spring / Summer'
export type LessonStatus = 'Published' | 'Draft'
export type LanguageMode = 'English' | 'Bilingual' | '繁體中文'

export interface LessonSlide {
  id: string
  titleEn: string
  titleZh: string
  bodyEn: string
  bodyZh: string
  visual: 'particles' | 'graph' | 'experiment' | 'ecosystem' | 'question'
  teacherNote: string
}

export interface LessonResource {
  id: string
  title: string
  type: 'Worksheet' | 'Quiz' | 'Video' | 'Answer key'
  detail: string
}

export interface ScienceLesson {
  id: string
  unitId: string
  title: string
  subtitle: string
  year: YearLevel
  semester: Semester
  duration: number
  status: LessonStatus
  updated: string
  objectives: string[]
  slides: LessonSlide[]
  resources: LessonResource[]
}

export interface ScienceUnit {
  id: string
  number: string
  title: string
  description: string
  year: YearLevel
  semester: Semester
  accent: 'cyan' | 'violet' | 'amber' | 'green'
}

export const scienceUnits: ScienceUnit[] = [
  {
    id: 'j1-fall-reactions',
    number: 'Unit 2',
    title: 'Chemical Reactions',
    description: 'Energy changes, reaction rates, catalysts and clear scientific explanations.',
    year: 'J1',
    semester: 'Fall',
    accent: 'cyan',
  },
  {
    id: 'j1-spring-solutions',
    number: 'Unit 3',
    title: 'Solutions and Solubility',
    description: 'Volume, concentration, dissolving, saturation and solubility curves.',
    year: 'J1',
    semester: 'Spring / Summer',
    accent: 'violet',
  },
  {
    id: 'j2-fall-ecosystems',
    number: 'Unit 2',
    title: 'Ecosystems',
    description: 'Habitats, food webs, adaptation and interactions within ecosystems.',
    year: 'J2',
    semester: 'Fall',
    accent: 'green',
  },
  {
    id: 'j2-spring-earth',
    number: 'Unit 3',
    title: 'Earth Systems',
    description: 'Water, weather, human impact and evidence-based environmental decisions.',
    year: 'J2',
    semester: 'Spring / Summer',
    accent: 'amber',
  },
]

const reactionSlides: LessonSlide[] = [
  {
    id: 'reaction-1',
    titleEn: 'Why do some reactions start slowly?',
    titleZh: '為什麼有些反應開始得很慢？',
    bodyEn: 'Particles must collide with enough energy and in the correct orientation before a reaction can begin.',
    bodyZh: '粒子必須以足夠的能量和正確的方向碰撞，反應才會開始。',
    visual: 'particles',
    teacherNote: 'Ask students to compare a gentle tap with a strong push. Link the idea of minimum energy to activation energy.',
  },
  {
    id: 'reaction-2',
    titleEn: 'Activation energy',
    titleZh: '活化能',
    bodyEn: 'Activation energy is the minimum energy needed for reacting particles to form products.',
    bodyZh: '活化能是反應粒子形成生成物所需的最低能量。',
    visual: 'graph',
    teacherNote: 'Trace the curve from reactants to products. The peak represents the activation-energy barrier.',
  },
  {
    id: 'reaction-3',
    titleEn: 'What does a catalyst change?',
    titleZh: '催化劑改變了什麼？',
    bodyEn: 'A catalyst provides a different reaction pathway with lower activation energy. It is not used up.',
    bodyZh: '催化劑提供具有較低活化能的不同反應途徑，而且不會被消耗。',
    visual: 'experiment',
    teacherNote: 'Emphasise that a catalyst changes the pathway, not the overall energy difference between reactants and products.',
  },
  {
    id: 'reaction-4',
    titleEn: 'Check your understanding',
    titleZh: '檢查你的理解',
    bodyEn: 'Explain why lowering activation energy increases the rate of a reaction.',
    bodyZh: '說明為什麼降低活化能會提高反應速率。',
    visual: 'question',
    teacherNote: 'Give 45 seconds of silent thinking, then ask pairs to build one complete scientific sentence.',
  },
]

const solubilitySlides: LessonSlide[] = [
  {
    id: 'solution-1',
    titleEn: 'What is concentration?',
    titleZh: '什麼是濃度？',
    bodyEn: 'Concentration describes how much solute is dissolved in a particular volume of solution.',
    bodyZh: '濃度描述在特定體積的溶液中溶解了多少溶質。',
    visual: 'particles',
    teacherNote: 'Use two cups with equal volume but different drink-powder amounts as a visual comparison.',
  },
  {
    id: 'solution-2',
    titleEn: 'Reading a solubility curve',
    titleZh: '閱讀溶解度曲線',
    bodyEn: 'The curve shows the maximum mass of solute that dissolves at each temperature.',
    bodyZh: '曲線顯示在每個溫度下可溶解的最大溶質質量。',
    visual: 'graph',
    teacherNote: 'Model one reading slowly: choose temperature, move vertically to the curve, then horizontally to mass.',
  },
  {
    id: 'solution-3',
    titleEn: 'Saturated or unsaturated?',
    titleZh: '飽和還是不飽和？',
    bodyEn: 'A saturated solution contains the maximum amount of dissolved solute at that temperature.',
    bodyZh: '飽和溶液在該溫度下含有最大量的已溶解溶質。',
    visual: 'experiment',
    teacherNote: 'Ask what evidence would show that no more solute can dissolve.',
  },
]

const ecosystemSlides: LessonSlide[] = [
  {
    id: 'ecosystem-1',
    titleEn: 'An ecosystem is a connected system',
    titleZh: '生態系是一個相互連結的系統',
    bodyEn: 'Living organisms interact with each other and with non-living parts of their environment.',
    bodyZh: '生物彼此互動，也與環境中的非生物部分互動。',
    visual: 'ecosystem',
    teacherNote: 'Invite students to identify one biotic and one abiotic factor in the image.',
  },
  {
    id: 'ecosystem-2',
    titleEn: 'Changes spread through food webs',
    titleZh: '變化會在食物網中擴散',
    bodyEn: 'A change in one population can affect several other organisms in the same food web.',
    bodyZh: '一個族群的變化可能影響同一食物網中的多種其他生物。',
    visual: 'ecosystem',
    teacherNote: 'Remove one producer from a simple food web and ask students to predict two consequences.',
  },
]

export const scienceLessons: ScienceLesson[] = [
  {
    id: 'activation-energy-catalysts',
    unitId: 'j1-fall-reactions',
    title: 'Activation Energy and Catalysts',
    subtitle: 'Why reactions need a starting push and how catalysts help',
    year: 'J1',
    semester: 'Fall',
    duration: 50,
    status: 'Published',
    updated: '12 July 2026',
    objectives: [
      'Define activation energy.',
      'Interpret a simple reaction-profile graph.',
      'Explain how a catalyst changes reaction rate.',
    ],
    slides: reactionSlides,
    resources: [
      { id: 'r1', title: 'Activation energy practice', type: 'Worksheet', detail: 'PDF · 2 pages' },
      { id: 'r2', title: 'Teacher answer key', type: 'Answer key', detail: 'PDF · 2 pages' },
      { id: 'r3', title: 'Five-question exit ticket', type: 'Quiz', detail: 'Editable · 5 questions' },
      { id: 'r4', title: 'Catalyst demonstration', type: 'Video', detail: '3 min 24 sec' },
    ],
  },
  {
    id: 'endo-exothermic',
    unitId: 'j1-fall-reactions',
    title: 'Endothermic and Exothermic Reactions',
    subtitle: 'Tracking energy movement during chemical change',
    year: 'J1',
    semester: 'Fall',
    duration: 50,
    status: 'Draft',
    updated: '10 July 2026',
    objectives: ['Identify energy entering or leaving a system.', 'Compare endothermic and exothermic reaction profiles.'],
    slides: reactionSlides.slice(0, 3),
    resources: [{ id: 'r5', title: 'Energy-change card sort', type: 'Worksheet', detail: 'PDF · 1 page' }],
  },
  {
    id: 'concentration-solubility',
    unitId: 'j1-spring-solutions',
    title: 'Concentration and Solubility',
    subtitle: 'From dissolved particles to interpreting solubility curves',
    year: 'J1',
    semester: 'Spring / Summer',
    duration: 100,
    status: 'Published',
    updated: '8 July 2026',
    objectives: ['Describe concentration.', 'Explain saturation.', 'Read values from a solubility curve.'],
    slides: solubilitySlides,
    resources: [
      { id: 'r6', title: 'Solubility-curve practice', type: 'Worksheet', detail: 'PDF · 3 pages' },
      { id: 'r7', title: 'Solubility review quiz', type: 'Quiz', detail: 'Editable · 10 questions' },
    ],
  },
  {
    id: 'aquatic-ecosystems',
    unitId: 'j2-fall-ecosystems',
    title: 'Aquatic Ecosystems',
    subtitle: 'How organisms interact in freshwater and marine habitats',
    year: 'J2',
    semester: 'Fall',
    duration: 50,
    status: 'Published',
    updated: '6 July 2026',
    objectives: ['Identify biotic and abiotic factors.', 'Predict effects of change in a food web.'],
    slides: ecosystemSlides,
    resources: [
      { id: 'r8', title: 'Aquatic food-web challenge', type: 'Worksheet', detail: 'PDF · 2 pages' },
      { id: 'r9', title: 'Coastal seas clip', type: 'Video', detail: '6 min 12 sec' },
    ],
  },
]

export const findLesson = (lessonId: string) => scienceLessons.find((lesson) => lesson.id === lessonId) ?? scienceLessons[0]
