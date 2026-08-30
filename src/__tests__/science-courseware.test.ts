import { describe, expect, it } from 'vitest'
import { coursewareSections, getCoursewareLesson } from '../science-lessons/courseware/coursewareManifest'

describe('Science courseware source hierarchy', () => {
  it('keeps J1 Chapter 1 Section 1 separate from its section title', () => {
    const section = coursewareSections.find((item) => item.id === 'j1-ch1-s1')
    expect(section).toMatchObject({
      year: 'J1',
      chapterNumber: 'Chapter 1',
      sectionNumber: 'Section 1',
      sectionTitle: 'Living Things and the Environment',
      sourceTitle: 'Copy of J1 PPT.pptx',
    })
    expect(section?.chapterNumber).not.toBe('Chapter 1.1')
  })

  it('keeps J2 chapter and section names exactly separated', () => {
    const section = coursewareSections.find((item) => item.id === 'j2-ch1-s1')
    expect(section).toMatchObject({
      year: 'J2',
      chapterNumber: 'Chapter 1',
      chapterTitle: 'Atoms and Bonding',
      sectionNumber: 'Section 1',
      sectionTitle: 'Elements and Atoms',
      sourceTitle: 'J2 PPT (updated).pptx',
    })
  })

  it('points both courseware sections at their locked fifteen-page opening lessons', () => {
    for (const section of coursewareSections) {
      expect(getCoursewareLesson(section).slides).toHaveLength(15)
    }
  })
})
