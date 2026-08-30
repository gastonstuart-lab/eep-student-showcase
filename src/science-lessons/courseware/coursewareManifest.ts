import { findLesson } from '../data'
import { sourceSectionMappingByUnitId } from '../curriculum/curriculumSourceMap'
import type { ScienceLesson, YearLevel } from '../data'

export type CoursewareSection = {
  id: string
  year: YearLevel
  chapterNumber: string
  chapterTitle?: string
  sectionNumber: string
  sectionTitle: string
  lessonId: string
  sourceTitle: string
  sourceDriveId: string
}

export const coursewareSections: CoursewareSection[] = [
  {
    id: 'j1-ch1-s1',
    year: sourceSectionMappingByUnitId['j1-fall-life-ecosystems'].year,
    chapterNumber: sourceSectionMappingByUnitId['j1-fall-life-ecosystems'].chapterNumber,
    sectionNumber: sourceSectionMappingByUnitId['j1-fall-life-ecosystems'].sectionNumber ?? 'Section 1',
    sectionTitle: sourceSectionMappingByUnitId['j1-fall-life-ecosystems'].sectionTitle,
    lessonId: 'j1-ch1-1-habitats-ecosystems-opening',
    sourceTitle: sourceSectionMappingByUnitId['j1-fall-life-ecosystems'].sourceTitle,
    sourceDriveId: sourceSectionMappingByUnitId['j1-fall-life-ecosystems'].driveFileId ?? '',
  },
  {
    id: 'j2-ch1-s1',
    year: sourceSectionMappingByUnitId['j2-fall-atoms-bonding'].year,
    chapterNumber: sourceSectionMappingByUnitId['j2-fall-atoms-bonding'].chapterNumber,
    chapterTitle: sourceSectionMappingByUnitId['j2-fall-atoms-bonding'].chapterTitle,
    sectionNumber: sourceSectionMappingByUnitId['j2-fall-atoms-bonding'].sectionNumber ?? 'Section 1',
    sectionTitle: sourceSectionMappingByUnitId['j2-fall-atoms-bonding'].sectionTitle,
    lessonId: 'j2-ch1-1-elements-atoms-opening',
    sourceTitle: sourceSectionMappingByUnitId['j2-fall-atoms-bonding'].sourceTitle,
    sourceDriveId: sourceSectionMappingByUnitId['j2-fall-atoms-bonding'].driveFileId ?? '',
  },
]

export const getCoursewareLesson = (section: CoursewareSection): ScienceLesson => findLesson(section.lessonId)

export const findCoursewareSection = (sectionId: string): CoursewareSection | undefined =>
  coursewareSections.find((section) => section.id === sectionId)
