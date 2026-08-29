export type {
  LanguageMode,
  LessonBiomeKey,
  LessonMedia,
  LessonResource,
  LessonResourceFormat,
  LessonResourceType,
  LessonSlide,
  LessonSourceReference,
  LessonVisual,
  LessonVisualAsset,
  LessonVisualOrigin,
  LessonVisualType,
  LocalizedText,
  RevealItem,
  RevealMode,
  ScienceLesson,
  ScienceUnit,
  Semester,
  YearLevel,
} from './types/lesson'

import { j1Ch24BiomesLessons } from './curriculum/j1/ch2-4-biomes'
import { j1OpeningLessons } from './curriculum/j1/openingLessons'
import { j1PilotLessons } from './curriculum/j1/pilotLessons'
import { j2OpeningLessons } from './curriculum/j2/openingLessons'
import { j2PilotLessons } from './curriculum/j2/pilotLessons'
import { scienceUnits } from './curriculum/units'
import type { ScienceLesson } from './types/lesson'

export { scienceUnits }
export { biomeAssetIds, biomesVisualAssets, findVisualAsset, scienceVisualAssets } from './curriculum/visualAssets'

export const scienceLessons: ScienceLesson[] = [
  ...j1OpeningLessons,
  ...j1Ch24BiomesLessons,
  ...j1PilotLessons,
  ...j2OpeningLessons,
  ...j2PilotLessons,
].sort((first, second) => {
  if (first.year !== second.year) return first.year.localeCompare(second.year)
  if (first.semester !== second.semester) return first.semester.localeCompare(second.semester)
  return first.lessonOrder - second.lessonOrder
})

export const findLesson = (lessonId: string) => scienceLessons.find((lesson) => lesson.id === lessonId) ?? scienceLessons[0]
