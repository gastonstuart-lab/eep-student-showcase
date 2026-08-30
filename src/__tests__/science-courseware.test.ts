import { describe, expect, it } from 'vitest'
import { coursewareSections, getCoursewareLesson } from '../science-lessons/courseware/coursewareManifest'
import { coursewareSourcePages } from '../science-lessons/courseware/coursewareSourcePages'
import { coursewareArtwork, FINAL_ARTWORK_IDS } from '../science-lessons/courseware/coursewareArtwork'
import { sourceSectionMappingByUnitId } from '../science-lessons/curriculum/curriculumSourceMap'

describe('Science courseware source hierarchy', () => {
  it('keeps J1 Chapter 1 Section 1 separate from its section title', () => {
    const section = coursewareSections.find((item) => item.id === 'j1-ch1-s1')
    expect(section).toMatchObject({
      year: 'J1',
      chapterNumber: 'Chapter 1',
      sectionNumber: 'Section 1',
      sectionTitle: 'Living Things and the Environment',
      sourceTitle: 'Copy of J1 PPT.pptx',
      sourceDriveId: '1STwllX6-z931Hsqst_A1FvN7xwLCVI0g',
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
      sourceDriveId: '14AUxNBq96_rRR9exiieSsHBdvuth4ofh',
    })
  })

  it('points both courseware sections at their locked fifteen-page opening lessons', () => {
    for (const section of coursewareSections) {
      expect(getCoursewareLesson(section).slides).toHaveLength(15)
    }
  })

  it('derives courseware section labels from the shared source hierarchy map', () => {
    const j1 = coursewareSections.find((item) => item.id === 'j1-ch1-s1')
    const j2 = coursewareSections.find((item) => item.id === 'j2-ch1-s1')

    expect(j1).toMatchObject({
      chapterNumber: sourceSectionMappingByUnitId['j1-fall-life-ecosystems'].chapterNumber,
      sectionNumber: sourceSectionMappingByUnitId['j1-fall-life-ecosystems'].sectionNumber,
      sectionTitle: sourceSectionMappingByUnitId['j1-fall-life-ecosystems'].sectionTitle,
    })
    expect(j2).toMatchObject({
      chapterNumber: sourceSectionMappingByUnitId['j2-fall-atoms-bonding'].chapterNumber,
      chapterTitle: sourceSectionMappingByUnitId['j2-fall-atoms-bonding'].chapterTitle,
      sectionNumber: sourceSectionMappingByUnitId['j2-fall-atoms-bonding'].sectionNumber,
      sectionTitle: sourceSectionMappingByUnitId['j2-fall-atoms-bonding'].sectionTitle,
    })
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

  it('keeps the source maps at exactly fifteen opening pages per year', () => {
    expect(Object.keys(coursewareSourcePages).filter((id) => id.startsWith('j1-'))).toHaveLength(15)
    expect(Object.keys(coursewareSourcePages).filter((id) => id.startsWith('j2-'))).toHaveLength(15)
  })

  it('registers only canonical gold artwork and never the old fallback folder', () => {
    for (const artwork of Object.values(coursewareArtwork)) {
      expect(artwork.src).toContain('science-lessons/gold/')
      expect(artwork.src).not.toContain('j1-opening')
      expect(artwork.src).not.toMatch(/pond|bear-stream|wolf-stream|coral/)
      expect(artwork.textRegion).toBeTruthy()
      expect(artwork.visualRegion).toBeTruthy()
    }
  })

  it('locks Gate A and the approved J2 continuation into the final artwork set', () => {
    const gateA = [
      'j1-ch1-1-title',
      'j1-ch1-1-question-needs',
      'j1-ch1-1-habitats',
      'j1-ch1-1-question-parts',
      'j1-ch1-1-abiotic-overview',
      'j1-ch1-1-biotic-factors',
    ]
    const j2Approved = getCoursewareLesson(coursewareSections[1]).slides.slice(0, 10).map((slide) => slide.id)
    expect(FINAL_ARTWORK_IDS).toEqual(expect.arrayContaining([...gateA, ...j2Approved]))
    expect(FINAL_ARTWORK_IDS).toHaveLength(30)
  })
})
