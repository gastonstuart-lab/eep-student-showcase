import { scienceLessons, scienceVisualAssets } from './data'
import type { ScienceLesson } from './types/lesson'

export interface CurriculumValidationIssue {
  severity: 'error' | 'warning'
  lessonId?: string
  slideId?: string
  message: string
}

export function validateScienceLesson(lesson: ScienceLesson): CurriculumValidationIssue[] {
  const issues: CurriculumValidationIssue[] = []
  const sourceIds = new Set(lesson.sourceReferences.map((source) => source.id))
  const slideIds = new Set<string>()

  if (lesson.slides.length === 0) {
    issues.push({ severity: 'error', lessonId: lesson.id, message: 'Lesson has no slides.' })
  }

  for (const slide of lesson.slides) {
    if (slideIds.has(slide.id)) {
      issues.push({ severity: 'error', lessonId: lesson.id, slideId: slide.id, message: 'Duplicate slide id.' })
    }
    slideIds.add(slide.id)

    if (!slide.title.en.trim()) {
      issues.push({ severity: 'error', lessonId: lesson.id, slideId: slide.id, message: 'Missing English slide title.' })
    }
    if (!slide.body.en.trim()) {
      issues.push({ severity: 'error', lessonId: lesson.id, slideId: slide.id, message: 'Missing English slide body.' })
    }
    if (!slide.teacherNote.trim()) {
      issues.push({ severity: 'warning', lessonId: lesson.id, slideId: slide.id, message: 'Missing teacher note.' })
    }
    if (slide.sourceId && !sourceIds.has(slide.sourceId)) {
      issues.push({ severity: 'error', lessonId: lesson.id, slideId: slide.id, message: `Unknown slide sourceId: ${slide.sourceId}.` })
    }
    if (slide.revealMode === 'step-by-step' && (!slide.reveals || slide.reveals.length === 0)) {
      issues.push({ severity: 'warning', lessonId: lesson.id, slideId: slide.id, message: 'Step-by-step slide has no reveal items.' })
    }
    if (slide.media?.assetId && !scienceVisualAssets.some((asset) => asset.id === slide.media?.assetId)) {
      issues.push({ severity: 'error', lessonId: lesson.id, slideId: slide.id, message: `Unknown media assetId: ${slide.media.assetId}.` })
    }
  }

  for (const resource of lesson.resources) {
    if (!resource.href && !resource.driveFileId) {
      issues.push({ severity: 'warning', lessonId: lesson.id, message: `Resource has no href or Drive file id: ${resource.title}.` })
    }
    if (resource.sourceId && !sourceIds.has(resource.sourceId)) {
      issues.push({ severity: 'error', lessonId: lesson.id, message: `Unknown resource sourceId: ${resource.sourceId}.` })
    }
  }

  return issues
}

export function validateScienceCurriculum() {
  const issues = scienceLessons.flatMap(validateScienceLesson)
  const localAssetPaths = new Set(scienceVisualAssets.map((asset) => asset.localPath))

  for (const asset of scienceVisualAssets) {
    if (!asset.localPath.startsWith('/science-lessons/')) {
      issues.push({ severity: 'error', message: `Asset ${asset.id} is outside the Science Lessons public asset path.` })
    }
    if (!asset.alt.trim()) {
      issues.push({ severity: 'error', message: `Asset ${asset.id} is missing alt text.` })
    }
    if (!asset.attribution.trim()) {
      issues.push({ severity: 'error', message: `Asset ${asset.id} is missing attribution.` })
    }
    if (!asset.license?.trim()) {
      issues.push({ severity: 'warning', message: `Asset ${asset.id} needs a verified license note.` })
    }
  }

  for (const lesson of scienceLessons) {
    for (const slide of lesson.slides) {
      if (slide.media?.assetId) {
        const asset = scienceVisualAssets.find((item) => item.id === slide.media?.assetId)
        if (asset && !localAssetPaths.has(asset.localPath)) {
          issues.push({ severity: 'error', lessonId: lesson.id, slideId: slide.id, message: `Asset path not registered: ${asset.localPath}.` })
        }
      }
    }
  }

  return issues
}
