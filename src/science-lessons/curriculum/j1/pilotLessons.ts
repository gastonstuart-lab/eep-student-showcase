import type { LessonSlide, ScienceLesson } from '../../types/lesson'

const j1Sources = [
  {
    id: 'src-j1-ppt',
    type: 'presentation' as const,
    title: 'Copy of J1 PPT.pptx',
    location: 'Google Drive / J1Science',
    notes: 'Authoritative J1 slide source. Slide ranges still need to be mapped before real pilot ingestion.',
  },
]

const reactionSlides: LessonSlide[] = [
  {
    id: 'reaction-1',
    title: { en: 'Why do some reactions start slowly?', zhHant: '為什麼有些反應開始得很慢？' },
    body: {
      en: 'Particles must collide with enough energy and in the correct orientation before a reaction can begin.',
      zhHant: '粒子必須以足夠的能量和正確的方向碰撞，反應才會開始。',
    },
    visual: 'particles',
    revealMode: 'step-by-step',
    reveals: [
      { id: 'reaction-1-a', text: { en: 'Particles collide.', zhHant: '粒子互相碰撞。' } },
      { id: 'reaction-1-b', text: { en: 'The collision needs enough energy.', zhHant: '碰撞需要足夠的能量。' } },
      { id: 'reaction-1-c', text: { en: 'The orientation also matters.', zhHant: '碰撞方向也很重要。' } },
    ],
    teacherNote: 'Ask students to compare a gentle tap with a strong push. Link the idea of minimum energy to activation energy.',
    sourceId: 'src-j1-ppt',
  },
  {
    id: 'reaction-2',
    title: { en: 'Activation energy', zhHant: '活化能' },
    body: {
      en: 'Activation energy is the minimum energy needed for reacting particles to form products.',
      zhHant: '活化能是反應粒子形成生成物所需的最低能量。',
    },
    visual: 'graph',
    revealMode: 'step-by-step',
    reveals: [
      { id: 'reaction-2-a', text: { en: 'Reactants start with stored energy.', zhHant: '反應物一開始具有儲存能量。' } },
      { id: 'reaction-2-b', text: { en: 'The peak is the energy barrier.', zhHant: '最高點是能量障礙。' } },
      { id: 'reaction-2-c', text: { en: 'Products form after particles pass the barrier.', zhHant: '粒子越過障礙後形成生成物。' } },
    ],
    teacherNote: 'Trace the curve from reactants to products. The peak represents the activation-energy barrier.',
    sourceId: 'src-j1-ppt',
  },
  {
    id: 'reaction-3',
    title: { en: 'What does a catalyst change?', zhHant: '催化劑改變了什麼？' },
    body: {
      en: 'A catalyst provides a different reaction pathway with lower activation energy. It is not used up.',
      zhHant: '催化劑提供具有較低活化能的不同反應途徑，而且不會被消耗。',
    },
    visual: 'experiment',
    teacherNote: 'Emphasise that a catalyst changes the pathway, not the overall energy difference between reactants and products.',
    sourceId: 'src-j1-ppt',
  },
  {
    id: 'reaction-4',
    title: { en: 'Check your understanding', zhHant: '檢查你的理解' },
    body: {
      en: 'Explain why lowering activation energy increases the rate of a reaction.',
      zhHant: '說明為什麼降低活化能會提高反應速率。',
    },
    visual: 'question',
    teacherNote: 'Give 45 seconds of silent thinking, then ask pairs to build one complete scientific sentence.',
    sourceId: 'src-j1-ppt',
  },
]

const solubilitySlides: LessonSlide[] = [
  {
    id: 'solution-1',
    title: { en: 'What is concentration?', zhHant: '什麼是濃度？' },
    body: {
      en: 'Concentration describes how much solute is dissolved in a particular volume of solution.',
      zhHant: '濃度描述在特定體積的溶液中溶解了多少溶質。',
    },
    visual: 'particles',
    teacherNote: 'Use two cups with equal volume but different drink-powder amounts as a visual comparison.',
    sourceId: 'src-j1-ppt',
  },
  {
    id: 'solution-2',
    title: { en: 'Reading a solubility curve', zhHant: '閱讀溶解度曲線' },
    body: {
      en: 'The curve shows the maximum mass of solute that dissolves at each temperature.',
      zhHant: '曲線顯示在每個溫度下可溶解的最大溶質質量。',
    },
    visual: 'graph',
    revealMode: 'step-by-step',
    reveals: [
      { id: 'solution-2-a', text: { en: 'Choose the temperature on the x-axis.', zhHant: '在 x 軸選擇溫度。' } },
      { id: 'solution-2-b', text: { en: 'Move up to the curve.', zhHant: '向上移動到曲線。' } },
      { id: 'solution-2-c', text: { en: 'Read the mass on the y-axis.', zhHant: '在 y 軸讀取質量。' } },
    ],
    teacherNote: 'Model one reading slowly: choose temperature, move vertically to the curve, then horizontally to mass.',
    sourceId: 'src-j1-ppt',
  },
  {
    id: 'solution-3',
    title: { en: 'Saturated or unsaturated?', zhHant: '飽和還是不飽和？' },
    body: {
      en: 'A saturated solution contains the maximum amount of dissolved solute at that temperature.',
      zhHant: '飽和溶液在該溫度下含有最大量的已溶解溶質。',
    },
    visual: 'experiment',
    teacherNote: 'Ask what evidence would show that no more solute can dissolve.',
    sourceId: 'src-j1-ppt',
  },
]

export const j1PilotLessons: ScienceLesson[] = [
  {
    id: 'activation-energy-catalysts',
    unitId: 'j1-fall-reactions',
    title: 'Activation Energy and Catalysts',
    subtitle: 'Why reactions need a starting push and how catalysts help',
    year: 'J1',
    semester: 'Fall',
    chapter: 'Ch.2',
    lessonOrder: 10,
    duration: 50,
    status: 'Published',
    updated: '12 July 2026',
    objectives: [
      'Define activation energy.',
      'Interpret a simple reaction-profile graph.',
      'Explain how a catalyst changes reaction rate.',
    ],
    sourceReferences: j1Sources,
    slides: reactionSlides,
    resources: [
      { id: 'r1', title: 'Activation energy practice', type: 'Worksheet', format: 'PDF', detail: 'PDF · 2 pages', sourceId: 'src-j1-ppt' },
      { id: 'r2', title: 'Teacher answer key', type: 'Answer key', format: 'PDF', detail: 'PDF · 2 pages', sourceId: 'src-j1-ppt', teacherOnly: true },
      { id: 'r3', title: 'Five-question exit ticket', type: 'Quiz', format: 'Google Forms', detail: 'Editable · 5 questions', sourceId: 'src-j1-ppt' },
      { id: 'r4', title: 'Catalyst demonstration', type: 'Video', format: 'Video', detail: '3 min 24 sec', sourceId: 'src-j1-ppt' },
    ],
  },
  {
    id: 'endo-exothermic',
    unitId: 'j1-fall-reactions',
    title: 'Endothermic and Exothermic Reactions',
    subtitle: 'Tracking energy movement during chemical change',
    year: 'J1',
    semester: 'Fall',
    chapter: 'Ch.2',
    lessonOrder: 11,
    duration: 50,
    status: 'Draft',
    updated: '10 July 2026',
    objectives: ['Identify energy entering or leaving a system.', 'Compare endothermic and exothermic reaction profiles.'],
    sourceReferences: j1Sources,
    slides: reactionSlides.slice(0, 3),
    resources: [{ id: 'r5', title: 'Energy-change card sort', type: 'Worksheet', format: 'PDF', detail: 'PDF · 1 page', sourceId: 'src-j1-ppt' }],
  },
  {
    id: 'concentration-solubility',
    unitId: 'j1-spring-solutions',
    title: 'Concentration and Solubility',
    subtitle: 'From dissolved particles to interpreting solubility curves',
    year: 'J1',
    semester: 'Spring / Summer',
    chapter: 'Ch.3.1',
    lessonOrder: 1,
    duration: 100,
    status: 'Published',
    updated: '8 July 2026',
    objectives: ['Describe concentration.', 'Explain saturation.', 'Read values from a solubility curve.'],
    sourceReferences: j1Sources,
    slides: solubilitySlides,
    resources: [
      { id: 'r6', title: 'Solubility-curve practice', type: 'Worksheet', format: 'PDF', detail: 'PDF · 3 pages', sourceId: 'src-j1-ppt' },
      { id: 'r7', title: 'Solubility review quiz', type: 'Quiz', format: 'Google Forms', detail: 'Editable · 10 questions', sourceId: 'src-j1-ppt' },
    ],
  },
]
