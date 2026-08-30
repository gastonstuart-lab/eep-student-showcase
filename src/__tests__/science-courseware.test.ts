import { describe, expect, it } from 'vitest'
import { coursewareSections, getCoursewareLesson } from '../science-lessons/courseware/coursewareManifest'
import { coursewareSourcePages } from '../science-lessons/courseware/coursewareSourcePages'

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

  it('preserves awkward source wording instead of silently rewriting the J1 PowerPoint', () => {
    expect(coursewareSourcePages['j1-ch1-1-abiotic-overview'].paragraphs[1]).toBe(
      'These factors are: water, sunlight, oxygen. Temperature and soil.',
    )
    expect(coursewareSourcePages['j1-ch1-1-biotic-factors'].paragraphs).toEqual([
      'An organism interacts with both the living and nonliving parts of its habitat.',
      'The living parts of a habitat are called biotic factors.',
      'Animals and plants in the habitat are the biotic factors.',
      'Example: Wolves, birds, plants, seeds and fish.',
    ])
    expect(coursewareSourcePages['j1-ch1-1-populations'].paragraphs[1]).toBe(
      'All the members of one species in a area are called the population.',
    )
  })

  it('preserves the J2 Chapter 1 and Section 1 source hierarchy inside the page text', () => {
    expect(coursewareSourcePages['j2-ch1-title']).toMatchObject({
      sourceSlide: 1,
      heading: 'Chapter 1:',
      subheading: 'ATOMS AND BONDING',
    })
    expect(coursewareSourcePages['j2-ch1-1-title']).toMatchObject({
      sourceSlide: 2,
      heading: 'Chapter 1: Section 1',
      subheading: 'Elements and Atoms',
    })
  })
})
