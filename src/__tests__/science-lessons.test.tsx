import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScienceLessonsApp } from '../science-lessons/ScienceLessonsApp'
import { rainfallComparisonData } from '../science-lessons/curriculum/biomeCharts'
import { biomesHomeworkCoverage, biomesQuizCoverage } from '../science-lessons/curriculum/j1/ch2-4-biomes-assessment'
import { findLesson, scienceLessons, scienceVisualAssets } from '../science-lessons/data'
import { BiomesV2Prototype } from '../science-lessons/presentation-v2/BiomesV2Prototype'
import { PresentationShell } from '../science-lessons/presentation-v2/PresentationShell'
import { validateScienceCurriculum } from '../science-lessons/validation'

const biomesLesson1 = findLesson('j1-ch2-4-biomes-lesson-1')
const biomesLesson2 = findLesson('j1-ch2-4-biomes-lesson-2')
const biomesLessons = scienceLessons.filter((lesson) => lesson.unitId === 'j1-ch2-biomes')

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

  it('loads exactly two canonical Biomes lessons in teaching order', () => {
    expect(biomesLessons.map((lesson) => lesson.id)).toEqual([
      'j1-ch2-4-biomes-lesson-1',
      'j1-ch2-4-biomes-lesson-2',
    ])
    expect(biomesLesson1.title).toBe('What Is a Biome? Climate and Major Examples')
    expect(biomesLesson2.title).toBe('Forests, Tundra, Mountains and Ice')
    expect(biomesLesson1.slides).toHaveLength(11)
    expect(biomesLesson2.slides).toHaveLength(10)
  })

  it('attaches the authoritative Biomes resources to both canonical lessons', () => {
    for (const lesson of biomesLessons) {
      expect(lesson.sourceReferences.find((source) => source.id === 'src-j1-ch2-4-ppt')?.slideRange).toContain('Slides 99-116')
      expect(lesson.resources.map((resource) => resource.id)).toEqual(
        expect.arrayContaining([
          'j1-ch2-4-ppt-source',
          'j1-ch2-4-homework',
          'j1-ch2-4-quiz',
          'j1-ch2-4-student-notes',
        ]),
      )
    }
  })

  it('represents required Biomes source concepts before assessment', () => {
    const allText = biomesLessons.flatMap((lesson) => lesson.slides).map((slide) => [
      slide.title.en,
      slide.body.en,
      slide.emphasis ?? '',
      ...(slide.reveals?.map((reveal) => reveal.text.en) ?? []),
    ].join(' ')).join(' ')

    for (const concept of [
      'temperature',
      'precipitation',
      'six major biomes',
      'canopy',
      'understory',
      'less than 25 cm',
      'Prairie',
      'Savanna',
      'Deciduous',
      'coniferous',
      'Permafrost',
      'migrate south',
      'Mountains',
    ]) {
      expect(allText).toMatch(new RegExp(concept, 'i'))
    }
  })

  it('maps homework and quiz coverage 10 out of 10', () => {
    const slideIds = new Set(biomesLessons.flatMap((lesson) => lesson.slides.map((slide) => slide.id)))
    const lessonIds = new Set(biomesLessons.map((lesson) => lesson.id))

    expect(biomesHomeworkCoverage).toHaveLength(10)
    expect(biomesQuizCoverage).toHaveLength(10)
    expect(biomesHomeworkCoverage.map((item) => item.question)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(biomesQuizCoverage.map((item) => item.question)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(biomesQuizCoverage.find((item) => item.question === 7)?.assessedConcept).toContain('TEACHER CONFIRMATION REQUIRED')

    for (const item of [...biomesHomeworkCoverage, ...biomesQuizCoverage]) {
      expect(item.taughtInLessonIds.every((lessonId) => lessonIds.has(lessonId))).toBe(true)
      expect(item.taughtInSlideIds.every((slideId) => slideIds.has(slideId))).toBe(true)
    }
  })

  it('registers every Biomes media asset with provenance and a Science public path', () => {
    const assetIds = biomesLessons.flatMap((lesson) => lesson.slides.flatMap((slide) => slide.media?.assetId ? [slide.media.assetId] : []))

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

  it('includes Traditional Chinese content for student-facing Biomes slides and reveals', () => {
    for (const slide of biomesLessons.flatMap((lesson) => lesson.slides)) {
      expect(slide.title.zhHant?.trim()).toBeTruthy()
      expect(slide.body.zhHant?.trim()).toBeTruthy()
      for (const reveal of slide.reveals ?? []) {
        expect(reveal.text.zhHant?.trim()).toBeTruthy()
      }
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
    expect(screen.getByText(/Slide 1 of 11/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    expect(screen.getByText(/Reveal 1 of 2/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    expect(screen.getByText(/Slide 2 of 11/i)).toBeInTheDocument()
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

  it('keeps final Biomes QA labels correct in Traditional Chinese mode', () => {
    const { container } = render(<ScienceLessonsApp />)

    fireEvent.click(screen.getByRole('button', { name: /Continue last lesson/i }))
    fireEvent.click(container.querySelectorAll('.viewer-thumbnails > button')[1])

    expect(screen.getAllByText(/Question of the Day/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/Exit check/i)).not.toBeInTheDocument()

    fireEvent.click(container.querySelectorAll('.viewer-language > button')[2])
    fireEvent.click(container.querySelectorAll('.viewer-thumbnails > button')[7])

    expect(screen.getByText('\u6bcf\u5e74\u964d\u96e8\u5c11\u65bc 25 \u516c\u5206')).toBeInTheDocument()
    expect(screen.queryByText('< 25 cm rain/year')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Return to lesson library/i }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Present lesson' })[1])
    fireEvent.click(container.querySelectorAll('.viewer-language > button')[2])
    fireEvent.click(container.querySelectorAll('.viewer-thumbnails > button')[6])

    expect(screen.getByText('\u9077\u5f99 + \u539a\u6bdb')).toBeInTheDocument()
    expect(screen.queryByText('migration + thick fur')).not.toBeInTheDocument()
  })
})

describe('Biomes presentation V2 prototype', () => {
  it('keeps Chinese support outside the immutable English slide plane', () => {
    const { container } = render(<BiomesV2Prototype />)

    const englishPlane = container.querySelector('.v2-english-plane')
    const supportLayer = container.querySelector('.v2-support-layer')

    expect(englishPlane).toBeInTheDocument()
    expect(supportLayer).toBeInTheDocument()
    expect(englishPlane?.contains(supportLayer)).toBe(false)
    expect(supportLayer?.contains(englishPlane)).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Bilingual' }))

    expect(container.querySelector('.v2-stage')).toHaveAttribute('data-language', 'Bilingual')
    expect(supportLayer).toHaveClass('is-visible')
    expect(englishPlane?.querySelector('.v2-title-block h1')).toHaveTextContent('What is a biome?')
  })

  it('uses V2 scenes inside the unified presenter and falls back without moving English content into Chinese support', () => {
    const v2Slide = biomesLesson1.slides.find((slide) => slide.id === 'j1-ch2-4-biome-definition')
    const fallbackSlide = biomesLesson1.slides.find((slide) => slide.id === 'j1-ch2-4-six-biomes')

    expect(v2Slide).toBeDefined()
    expect(fallbackSlide).toBeDefined()

    const { container, rerender } = render(
      <PresentationShell
        slide={v2Slide!}
        language="Bilingual"
        revealIndex={3}
        totalSlides={biomesLesson1.slides.length}
        slideNumber={2}
        onExit={() => undefined}
        fallback={(slide) => <div data-testid="fallback">{slide.title.en}</div>}
      />,
    )

    expect(container.querySelector('.presentation-shell')).toHaveAttribute('data-renderer', 'v2')
    expect(container.querySelector('.v2-english-plane')).toHaveTextContent('What is a biome?')
    expect(container.querySelector('.v2-support-layer')).toHaveClass('is-visible')
    expect(container.querySelector('.v2-english-plane')?.contains(container.querySelector('.v2-support-layer'))).toBe(false)

    rerender(
      <PresentationShell
        slide={fallbackSlide!}
        language="Bilingual"
        revealIndex={1}
        totalSlides={biomesLesson1.slides.length}
        slideNumber={4}
        onExit={() => undefined}
        fallback={(slide) => <div data-testid="fallback">{slide.title.en}</div>}
      />,
    )

    expect(container.querySelector('.presentation-shell')).toHaveAttribute('data-renderer', 'v1-fallback')
    expect(screen.getByTestId('fallback')).toHaveTextContent('Six major land biomes')
    expect(container.querySelector('.v2-support-layer')).toHaveClass('is-visible')
  })

  it('renders Presentation Mode for both canonical Biomes lessons', () => {
    const lesson1Slide = biomesLesson1.slides.find((slide) => slide.id === 'j1-ch2-4-biome-definition')
    const lesson2Slide = biomesLesson2.slides.find((slide) => slide.id === 'j1-ch2-4-tundra')

    const { container, rerender } = render(
      <PresentationShell
        slide={lesson1Slide!}
        language="English"
        revealIndex={1}
        totalSlides={biomesLesson1.slides.length}
        slideNumber={3}
        onExit={() => undefined}
        fallback={(slide) => <div data-testid="fallback">{slide.title.en}</div>}
      />,
    )

    expect(container.querySelector('.presentation-shell')).toHaveAttribute('data-slide-id', 'j1-ch2-4-biome-definition')
    expect(container.querySelector('.presentation-shell')).toHaveAttribute('data-renderer', 'v2')

    rerender(
      <PresentationShell
        slide={lesson2Slide!}
        language="English"
        revealIndex={2}
        totalSlides={biomesLesson2.slides.length}
        slideNumber={5}
        onExit={() => undefined}
        fallback={(slide) => <div data-testid="fallback">{slide.title.en}</div>}
      />,
    )

    expect(container.querySelector('.presentation-shell')).toHaveAttribute('data-slide-id', 'j1-ch2-4-tundra')
    expect(container.querySelector('.presentation-shell')).toHaveAttribute('data-renderer', 'v1-fallback')
    expect(screen.getByTestId('fallback')).toHaveTextContent('Tundra biomes')
  })

  it('supports staged notes, show all notes, and return to presentation', () => {
    const v2Slide = biomesLesson1.slides.find((slide) => slide.id === 'j1-ch2-4-biome-definition')

    render(
      <PresentationShell
        slide={v2Slide!}
        language="English"
        revealIndex={3}
        totalSlides={biomesLesson1.slides.length}
        slideNumber={2}
        onExit={() => undefined}
        fallback={(slide) => <div>{slide.title.en}</div>}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Notes' }))

    expect(screen.getByRole('heading', { name: 'What is a biome?' })).toBeInTheDocument()
    expect(screen.getByText(/A biome is a group of land ecosystems/i)).toBeInTheDocument()
    expect(screen.queryByText(/Climate means temperature/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reveal next note' }))

    expect(screen.getByText(/Climate means temperature/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Show all' }))

    expect(screen.getByText(/Key vocabulary/i)).toBeInTheDocument()
    expect(screen.getByText(/a living thing/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Return to presentation' }))

    expect(screen.getByText('Climate')).toBeInTheDocument()
  })

  it('pins a translation bubble without placing it inside the English plane', () => {
    const v2Slide = biomesLesson1.slides.find((slide) => slide.id === 'j1-ch2-4-biome-definition')
    const { container } = render(
      <PresentationShell
        slide={v2Slide!}
        language="Bilingual"
        revealIndex={3}
        totalSlides={biomesLesson1.slides.length}
        slideNumber={2}
        onExit={() => undefined}
        fallback={(slide) => <div>{slide.title.en}</div>}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'biome' }))

    const bubble = container.querySelector('.translation-bubble')

    expect(bubble).toHaveTextContent('biome')
    expect(bubble).toHaveTextContent('生物群系')
    expect(container.querySelector('.v2-english-plane')?.contains(bubble)).toBe(false)
  })
})
