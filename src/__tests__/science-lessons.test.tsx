import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScienceLessonsApp } from '../science-lessons/ScienceLessonsApp'
import { rainfallComparisonData } from '../science-lessons/curriculum/biomeCharts'
import { findLesson, scienceLessons, scienceVisualAssets } from '../science-lessons/data'
import { validateScienceCurriculum } from '../science-lessons/validation'

const biomes = findLesson('j1-ch2-4-biomes-real-pilot')

describe('Science Lessons curriculum', () => {
  it('keeps lessons filterable and ordered by year, semester, and lesson order', () => {
    const sorted = [...scienceLessons].sort((first, second) => {
      if (first.year !== second.year) return first.year.localeCompare(second.year)
      if (first.semester !== second.semester) return first.semester.localeCompare(second.semester)
      return first.lessonOrder - second.lessonOrder
    })

    expect(scienceLessons.map((lesson) => lesson.id)).toEqual(sorted.map((lesson) => lesson.id))
    expect(scienceLessons.some((lesson) => lesson.year === 'J1')).toBe(true)
    expect(scienceLessons.some((lesson) => lesson.year === 'J2')).toBe(true)
    expect(scienceLessons.some((lesson) => lesson.semester === 'Fall')).toBe(true)
    expect(scienceLessons.some((lesson) => lesson.semester === 'Spring / Summer')).toBe(true)
  })

  it('loads the Biomes gold-standard pilot with required slides and resources', () => {
    expect(biomes.title).toContain('Biomes')
    expect(biomes.slides).toHaveLength(13)
    expect(biomes.resources.map((resource) => resource.id)).toEqual(
      expect.arrayContaining([
        'j1-ch2-4-ppt-source',
        'j1-ch2-4-homework',
        'j1-ch2-4-quiz',
        'j1-ch2-4-student-notes',
      ]),
    )
  })

  it('registers every Biomes media asset with provenance and a Science public path', () => {
    const assetIds = biomes.slides.flatMap((slide) => slide.media?.assetId ? [slide.media.assetId] : [])

    expect(assetIds.length).toBeGreaterThan(0)
    for (const assetId of assetIds) {
      const asset = scienceVisualAssets.find((item) => item.id === assetId)
      expect(asset, assetId).toBeDefined()
      expect(asset?.localPath).toMatch(/^\/science-lessons\//)
      expect(asset?.alt.length).toBeGreaterThan(12)
      expect(asset?.attribution.length).toBeGreaterThan(3)
      expect(asset?.origin).not.toBe('temporary')
    }
  })

  it('passes curriculum validation without errors', () => {
    const errors = validateScienceCurriculum().filter((issue) => issue.severity === 'error')

    expect(errors).toEqual([])
  })

  it('keeps the rainfall retrieval chart in increasing precipitation order', () => {
    const values = rainfallComparisonData.map((point) => point.representativeCm)

    expect(rainfallComparisonData.map((point) => point.label)).toEqual(['Desert', 'Prairie', 'Savanna', 'Rain forest'])
    expect(values).toEqual([...values].sort((first, second) => first - second))
    expect(values.at(-1)).toBeGreaterThan(values[0])
  })
})

describe('Science Lessons teacher flow', () => {
  it('opens Biomes into the viewer and advances reveals before changing slides', () => {
    render(<ScienceLessonsApp />)

    fireEvent.click(screen.getByRole('button', { name: /Continue last lesson/i }))

    expect(screen.getByRole('heading', { name: /Chapter 2.4: Biomes/i })).toBeInTheDocument()
    expect(screen.getByText(/Slide 1 of 13/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    expect(screen.getByText(/Reveal 1 of 2/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    expect(screen.getByText(/Slide 2 of 13/i)).toBeInTheDocument()
  })

  it('supports English, bilingual, and Traditional Chinese presentation modes', () => {
    render(<ScienceLessonsApp />)

    fireEvent.click(screen.getByRole('button', { name: /Continue last lesson/i }))
    fireEvent.click(screen.getByRole('button', { name: 'English' }))

    expect(screen.getByRole('heading', { name: /Chapter 2.4: Biomes/i })).toBeInTheDocument()
    expect(screen.queryByText(/第 2.4 章/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Bilingual' }))

    expect(screen.getByText(/第 2.4 章/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '繁體中文' }))

    expect(screen.getByRole('heading', { name: /第 2.4 章/ })).toBeInTheDocument()
  })
})
