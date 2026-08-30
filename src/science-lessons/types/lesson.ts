export type YearLevel = 'J1' | 'J2'
export type Semester = 'Fall' | 'Spring / Summer'
export type LessonStatus = 'Published' | 'Draft'
export type LanguageMode = 'English' | 'Bilingual' | '繁體中文'

export type LessonVisual = 'particles' | 'graph' | 'experiment' | 'ecosystem' | 'question' | 'image' | 'video'
export type LessonSlideLayout = 'hero' | 'concept' | 'vocabulary' | 'diagram' | 'comparison' | 'image-focus' | 'question'
export type LessonBiomeKey = 'rainforest' | 'desert' | 'grassland' | 'deciduous' | 'boreal' | 'tundra' | 'mountains'
export type LessonResourceType = 'Worksheet' | 'Quiz' | 'Video' | 'Answer key' | 'Classwork' | 'Test' | 'Link' | 'Presentation'
export type LessonResourceFormat = 'PDF' | 'PPTX' | 'Google Drive' | 'Google Slides' | 'Google Docs' | 'Google Forms' | 'Video' | 'Web'
export type LessonSourceType = 'drive-folder' | 'presentation' | 'document' | 'worksheet' | 'quiz' | 'test' | 'manual-entry'
export type LessonVisualType = 'photo' | 'diagram' | 'graph' | 'map' | 'video' | 'source-slide'
export type LessonVisualOrigin =
  | 'original-source'
  | 'stuart-previous-material'
  | 'external-educational'
  | 'generated-data-visual'
  | 'purpose-built-educational'
  | 'temporary'
export type RevealMode = 'all-at-once' | 'step-by-step'

export type LessonPresentation = {
  kind: 'courseware'
  sectionId: string
}

export interface LocalizedText {
  en: string
  zhHant?: string
}

export interface LessonSourceReference {
  id: string
  type: LessonSourceType
  title: string
  location?: string
  driveFileId?: string
  url?: string
  slideRange?: string
  notes?: string
}

export interface LessonMedia {
  type: 'image' | 'video' | 'embed'
  title: string
  assetId?: string
  src?: string
  alt?: string
  credit?: string
  poster?: string
  sourceId?: string
}

export interface LessonVisualAsset {
  id: string
  title: string
  type: LessonVisualType
  origin: LessonVisualOrigin
  localPath: string
  alt: string
  attribution: string
  sourceUrl?: string
  creator?: string
  organisation?: string
  license?: string
  retrieved?: string
  originalSourceId?: string
  originalSlideRef?: string
  lessonIds: string[]
  slideIds: string[]
  usage: string
  notes?: string
}

export interface RevealItem {
  id: string
  text: LocalizedText
  teacherNote?: string
}

export interface LessonSlide {
  id: string
  title: LocalizedText
  body: LocalizedText
  visual: LessonVisual
  layout?: LessonSlideLayout
  biomeKey?: LessonBiomeKey
  emphasis?: string
  teacherNote: string
  revealMode?: RevealMode
  reveals?: RevealItem[]
  media?: LessonMedia
  sourceId?: string
}

export interface LessonResource {
  id: string
  title: string
  type: LessonResourceType
  format: LessonResourceFormat
  detail: string
  href?: string
  driveFileId?: string
  sourceId?: string
  teacherOnly?: boolean
}

export interface ScienceLesson {
  id: string
  unitId: string
  title: string
  subtitle: string
  year: YearLevel
  semester: Semester
  chapter: string
  lessonOrder: number
  duration: number
  status: LessonStatus
  updated: string
  objectives: string[]
  sourceReferences: LessonSourceReference[]
  slides: LessonSlide[]
  resources: LessonResource[]
  presentation?: LessonPresentation
}

export interface ScienceUnit {
  id: string
  number: string
  title: string
  description: string
  year: YearLevel
  semester: Semester
  accent: 'cyan' | 'violet' | 'amber' | 'green'
  sourceReferences?: LessonSourceReference[]
}
