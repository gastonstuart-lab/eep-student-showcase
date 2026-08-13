import type { LessonSlide, ScienceLesson } from '../../types/lesson'

const j2Sources = [
  {
    id: 'src-j2-ppt',
    type: 'presentation' as const,
    title: 'J2 PPT (updated).pptx',
    location: 'Google Drive / J2Science',
    notes: 'Authoritative J2 slide source. Ch.3.3 and Ch.3.4 supporting files still need exact Drive IDs or URLs.',
  },
]

const ecosystemSlides: LessonSlide[] = [
  {
    id: 'ecosystem-1',
    title: { en: 'An ecosystem is a connected system', zhHant: '生態系是一個相互連結的系統' },
    body: {
      en: 'Living organisms interact with each other and with non-living parts of their environment.',
      zhHant: '生物彼此互動，也與環境中的非生物部分互動。',
    },
    visual: 'ecosystem',
    revealMode: 'step-by-step',
    reveals: [
      { id: 'ecosystem-1-a', text: { en: 'Biotic factors are living parts.', zhHant: '生物因素是有生命的部分。' } },
      { id: 'ecosystem-1-b', text: { en: 'Abiotic factors are non-living parts.', zhHant: '非生物因素是沒有生命的部分。' } },
      { id: 'ecosystem-1-c', text: { en: 'Both affect survival and growth.', zhHant: '兩者都會影響生存和生長。' } },
    ],
    teacherNote: 'Invite students to identify one biotic and one abiotic factor in the image.',
    sourceId: 'src-j2-ppt',
  },
  {
    id: 'ecosystem-2',
    title: { en: 'Changes spread through food webs', zhHant: '變化會在食物網中擴散' },
    body: {
      en: 'A change in one population can affect several other organisms in the same food web.',
      zhHant: '一個族群的變化可能影響同一食物網中的多種其他生物。',
    },
    visual: 'ecosystem',
    teacherNote: 'Remove one producer from a simple food web and ask students to predict two consequences.',
    sourceId: 'src-j2-ppt',
  },
]

export const j2PilotLessons: ScienceLesson[] = [
  {
    id: 'aquatic-ecosystems',
    unitId: 'j2-fall-ecosystems',
    title: 'Aquatic Ecosystems',
    subtitle: 'How organisms interact in freshwater and marine habitats',
    year: 'J2',
    semester: 'Fall',
    chapter: 'Ch.2.5',
    lessonOrder: 1,
    duration: 50,
    status: 'Published',
    updated: '6 July 2026',
    objectives: ['Identify biotic and abiotic factors.', 'Predict effects of change in a food web.'],
    sourceReferences: j2Sources,
    slides: ecosystemSlides,
    resources: [
      { id: 'r8', title: 'Aquatic food-web challenge', type: 'Worksheet', format: 'PDF', detail: 'PDF · 2 pages', sourceId: 'src-j2-ppt' },
      { id: 'r9', title: 'Coastal seas clip', type: 'Video', format: 'Video', detail: '6 min 12 sec', sourceId: 'src-j2-ppt' },
    ],
  },
]
