import { findLesson } from '../data'
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
    year: 'J1',
    chapterNumber: 'Chapter 1',
    sectionNumber: 'Section 1',
    sectionTitle: 'Living Things and the Environment',
    lessonId: 'j1-ch1-1-habitats-ecosystems-opening',
    sourceTitle: 'Copy of J1 PPT.pptx',
    sourceDriveId: '1STwllX6-z931Hsqst_A1FvN7xwLCVI0g',
  },
  {
    id: 'j2-ch1-s1',
    year: 'J2',
    chapterNumber: 'Chapter 1',
    chapterTitle: 'Atoms and Bonding',
    sectionNumber: 'Section 1',
    sectionTitle: 'Elements and Atoms',
    lessonId: 'j2-ch1-1-elements-atoms-opening',
    sourceTitle: 'J2 PPT (updated).pptx',
    sourceDriveId: '14AUxNBq96_rRR9exiieSsHBdvuth4ofh',
  },
]

export const getCoursewareLesson = (section: CoursewareSection): ScienceLesson => findLesson(section.lessonId)

export const findCoursewareSection = (sectionId: string): CoursewareSection | undefined =>
  coursewareSections.find((section) => section.id === sectionId)
