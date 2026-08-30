import { sourceSectionMappingByUnitId } from './curriculumSourceMap'
import type { ScienceLesson } from '../types/lesson'

export type LessonMigrationStatus = 'modern-courseware' | 'source-backed-legacy' | 'source-incomplete'

export type LessonMigrationClassification = {
  status: LessonMigrationStatus
  sourceSectionId?: string
  sourceSlideRange?: string
  reason: string
}

export function classifyScienceLessonMigration(lesson: ScienceLesson): LessonMigrationClassification {
  const mapping = sourceSectionMappingByUnitId[lesson.unitId]

  if (lesson.presentation?.kind === 'courseware') {
    return {
      status: 'modern-courseware',
      sourceSectionId: mapping?.id,
      sourceSlideRange: mapping?.sourceSlideRange,
      reason: 'Lesson uses the approved Courseware presentation engine.',
    }
  }

  if (mapping?.status === 'verified-from-original-ppt' && mapping.sourceSlideRange) {
    return {
      status: 'source-backed-legacy',
      sourceSectionId: mapping.id,
      sourceSlideRange: mapping.sourceSlideRange,
      reason: 'Curriculum source range is verified from the original PPTX, but the lesson still uses the legacy Science workspace presentation.',
    }
  }

  return {
    status: 'source-incomplete',
    sourceSectionId: mapping?.id,
    sourceSlideRange: mapping?.sourceSlideRange,
    reason: 'The lesson needs an original-PPT source range before it can be promoted to modern courseware.',
  }
}
