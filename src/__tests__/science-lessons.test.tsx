import { fireEvent, render, screen, within } from '@testing-library/react'
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
const activationLesson = findLesson('activation-energy-catalysts')
const energyChangeLesson = findLesson('endo-exothermic')
const concentrationLesson = findLesson('j1-concentration-saturation')
const solubilityLesson = findLesson('j1-solubility-curves')
const j2HabitatLesson = findLesson('j2-aquatic-habitats')
const j2FoodWebLesson = findLesson('j2-aquatic-food-webs')
const j1OpeningLesson = findLesson('j1-ch1-1-habitats-ecosystems-opening')
const j2OpeningLesson = findLesson('j2-ch1-1-elements-atoms-opening')
const biomesLessons = scienceLessons.filter((lesson) => lesson.unitId === 'j1-ch2-biomes')
const reactionLessons = scienceLessons.filter((lesson) => lesson.unitId === 'j1-fall-reactions')
const solutionLessons = scienceLessons.filter((lesson) => lesson.unitId === 'j1-spring-solutions')
const j2EcosystemLessons = scienceLessons.filter((lesson) => lesson.unitId === 'j2-fall-ecosystems')

function presentLessonFromLibrary(title: RegExp) {
  const lessonHeading = screen.getByRole('heading', { name: title })
  const row = lessonHeading.closest('article')
  if (!row) throw new Error(`Lesson row not found for ${String(title)}`)
  fireEvent.click(within(row).getByRole('button', { name: 'Present lesson' }))
}


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


  it('loads the new J1 and J2 opening lessons first in Fall teaching order', () => {
    const j1Fall = scienceLessons.filter((lesson) => lesson.year === 'J1' && lesson.semester === 'Fall')
    const j2Fall = scienceLessons.filter((lesson) => lesson.year === 'J2' && lesson.semester === 'Fall')

    expect(j1Fall[0]?.id).toBe('j1-ch1-1-habitats-ecosystems-opening')
    expect(j2Fall[0]?.id).toBe('j2-ch1-1-elements-atoms-opening')
    expect(j1OpeningLesson.slides).toHaveLength(6)
    expect(j2OpeningLesson.slides).toHaveLength(6)
  })

  it('opens both new opening lessons from the library', () => {
    render(<ScienceLessonsApp />)

    fireEvent.click(screen.getByRole('button', { name: /Browse lesson library/i }))
    presentLessonFromLibrary(/Habitats and Ecosystems: Opening Lesson/i)
    expect(screen.getByText(/What needs are met by an organism's environment/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Return to lesson library/i }))
    fireEvent.click(screen.getByRole('button', { name: 'J2' }))
    presentLessonFromLibrary(/Elements and Atoms: Opening Lesson/i)
    expect(screen.getByText(/Why are elements sometimes called the building blocks of matter/i)).toBeInTheDocument()
  })

describe('Science Lessons teacher flow', () => {
  it('opens Biomes into the viewer and advances reveals before changing slides', () => {
    render(<ScienceLessonsApp />)

    fireEvent.click(screen.getByRole('button', { name: /Browse lesson library/i }))
    presentLessonFromLibrary(/What Is a Biome\? Climate and Major Examples/i)

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

    fireEvent.click(screen.getByRole('button', { name: /Browse lesson library/i }))
    presentLessonFromLibrary(/What Is a Biome\? Climate and Major Examples/i)
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

    fireEvent.click(screen.getByRole('button', { name: /Browse lesson library/i }))
    presentLessonFromLibrary(/What Is a Biome\? Climate and Major Examples/i)
    fireEvent.click(container.querySelectorAll('.viewer-thumbnails > button')[1])

    expect(screen.getAllByText(/Question of the Day/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/Exit check/i)).not.toBeInTheDocument()

    fireEvent.click(container.querySelectorAll('.viewer-language > button')[2])
    fireEvent.click(container.querySelectorAll('.viewer-thumbnails > button')[7])

    expect(screen.getByText('\u6bcf\u5e74\u964d\u96e8\u5c11\u65bc 25 \u516c\u5206')).toBeInTheDocument()
    expect(screen.queryByText('< 25 cm rain/year')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Return to lesson library/i }))
    presentLessonFromLibrary(/Forests, Tundra, Mountains and Ice/i)
    fireEvent.click(container.querySelectorAll('.viewer-language > button')[2])
    fireEvent.click(container.querySelectorAll('.viewer-thumbnails > button')[6])

    expect(screen.getByText('\u9077\u5f99 + \u539a\u6bdb')).toBeInTheDocument()
    expect(screen.queryByText('migration + thick fur')).not.toBeInTheDocument()
  })
})

describe('J1 Chemical Reactions production unit', () => {
  it('appears in the correct J1 Fall order after the production Biomes lessons', () => {
    expect(reactionLessons.map((lesson) => lesson.id)).toEqual([
      'activation-energy-catalysts',
      'endo-exothermic',
    ])
    expect(reactionLessons.every((lesson) => lesson.year === 'J1')).toBe(true)
    expect(reactionLessons.every((lesson) => lesson.semester === 'Fall')).toBe(true)
    expect(reactionLessons.every((lesson) => lesson.status === 'Published')).toBe(true)
    expect(activationLesson.lessonOrder).toBeGreaterThan(biomesLesson2.lessonOrder)
    expect(energyChangeLesson.lessonOrder).toBe(activationLesson.lessonOrder + 1)
  })

  it('upgrades both Chemical Reactions lessons with production slide flow and metadata', () => {
    expect(activationLesson.slides).toHaveLength(8)
    expect(energyChangeLesson.slides).toHaveLength(8)

    for (const lesson of reactionLessons) {
      expect(lesson.objectives.length).toBeGreaterThanOrEqual(4)
      expect(lesson.sourceReferences.map((source) => source.id)).toEqual([
        'src-j1-ch2-reactions-ppt',
        'src-j1-ch2-reactions-pilot',
      ])
      expect(lesson.resources.map((resource) => resource.id)).toEqual([
        'j1-ch2-reactions-source-ppt',
        'j1-ch2-reactions-board-plan',
      ])
      expect(lesson.slides.every((slide) => slide.teacherNote.trim().length > 20)).toBe(true)
      expect(lesson.slides.every((slide) => slide.title.zhHant?.trim())).toBe(true)
      expect(lesson.slides.every((slide) => slide.body.zhHant?.trim())).toBe(true)
      expect(lesson.slides.some((slide) => slide.revealMode === 'step-by-step' && (slide.reveals?.length ?? 0) >= 3)).toBe(true)
    }
  })

  it('includes the intended production concepts without dropping recovered pilot material', () => {
    const allText = reactionLessons.flatMap((lesson) => lesson.slides).map((slide) => [
      slide.title.en,
      slide.body.en,
      slide.emphasis ?? '',
      ...(slide.reveals?.map((reveal) => reveal.text.en) ?? []),
    ].join(' ')).join(' ')

    for (const concept of [
      'Activation energy',
      'catalyst',
      'successful collision',
      'not used up',
      'Endothermic',
      'Exothermic',
      'system',
      'surroundings',
      'products lower',
      'products higher',
    ]) {
      expect(allText).toMatch(new RegExp(concept, 'i'))
    }
  })

  it('opens the Chemical Reactions Teacher Workspace and advances a representative reveal', () => {
    render(<ScienceLessonsApp />)

    fireEvent.click(screen.getByRole('button', { name: /Browse lesson library/i }))
    presentLessonFromLibrary(/Activation Energy and Catalysts/i)

    expect(screen.getByRole('heading', { name: /Activation energy and catalysts/i })).toBeInTheDocument()
    expect(screen.getByText(/Lesson objectives/i)).toBeInTheDocument()
    expect(screen.getByText(/Source references/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    expect(screen.getByText(/Reveal 1 of 2/i)).toBeInTheDocument()
  })

  it('supports English, bilingual, and Traditional Chinese for the Chemical Reactions workspace', () => {
    const { container } = render(<ScienceLessonsApp />)

    fireEvent.click(screen.getByRole('button', { name: /Browse lesson library/i }))
    presentLessonFromLibrary(/Activation Energy and Catalysts/i)
    fireEvent.click(screen.getByRole('button', { name: 'English' }))

    expect(screen.getByRole('heading', { name: /Activation energy and catalysts/i })).toBeInTheDocument()
    expect(screen.queryByText(/活化能與催化劑/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Bilingual' }))

    expect(screen.getByText(/活化能與催化劑/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '繁體中文' }))

    expect(screen.getByRole('heading', { name: /活化能與催化劑/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Activation energy and catalysts/i })).not.toBeInTheDocument()
    expect(container.querySelector('.slide-canvas')).toHaveTextContent('反應開始的推力')
  })

  it('renders Presentation Mode for the Chemical Reactions production unit', () => {
    const { container } = render(<ScienceLessonsApp />)

    fireEvent.click(screen.getByRole('button', { name: /Browse lesson library/i }))
    presentLessonFromLibrary(/Activation Energy and Catalysts/i)
    fireEvent.click(container.querySelector('.viewer-tool-button--accent')!)

    expect(screen.getByRole('dialog', { name: /Classroom presentation mode/i })).toBeInTheDocument()
    expect(screen.getAllByText(/activation energy/i).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Exit' }))

    expect(screen.queryByRole('dialog', { name: /Classroom presentation mode/i })).not.toBeInTheDocument()
  })
})

describe('J1 Solutions and Solubility production unit', () => {
  it('replaces the recovered pilot with two ordered Spring / Summer production lessons', () => {
    expect(solutionLessons.map((lesson) => lesson.id)).toEqual([
      'j1-concentration-saturation',
      'j1-solubility-curves',
    ])
    expect(solutionLessons.every((lesson) => lesson.year === 'J1')).toBe(true)
    expect(solutionLessons.every((lesson) => lesson.semester === 'Spring / Summer')).toBe(true)
    expect(solutionLessons.every((lesson) => lesson.status === 'Published')).toBe(true)
    expect(concentrationLesson.lessonOrder).toBe(1)
    expect(solubilityLesson.lessonOrder).toBe(2)
    expect(concentrationLesson.duration).toBe(50)
    expect(solubilityLesson.duration).toBe(50)
  })

  it('upgrades the Solutions sequence with production slide flow and metadata', () => {
    expect(concentrationLesson.title).toBe('Concentration, Solutes and Saturation')
    expect(solubilityLesson.title).toBe('Solubility and Solubility Curves')
    expect(concentrationLesson.slides).toHaveLength(8)
    expect(solubilityLesson.slides).toHaveLength(8)

    for (const lesson of solutionLessons) {
      expect(lesson.sourceReferences.map((source) => source.id)).toEqual([
        'src-j1-ch3-solutions-ppt',
        'src-j1-ch3-solutions-pilot',
      ])
      expect(lesson.resources.map((resource) => resource.id)).toEqual([
        'j1-ch3-solutions-source-ppt',
        'j1-ch3-solubility-curve-practice',
        'j1-ch3-solubility-review-quiz',
      ])
      expect(lesson.objectives.length).toBeGreaterThanOrEqual(4)
      expect(lesson.slides.every((slide) => slide.teacherNote.trim().length > 30)).toBe(true)
      expect(lesson.slides.every((slide) => slide.title.zhHant?.trim())).toBe(true)
      expect(lesson.slides.every((slide) => slide.body.zhHant?.trim())).toBe(true)
      expect(lesson.slides.some((slide) => slide.revealMode === 'step-by-step' && (slide.reveals?.length ?? 0) >= 3)).toBe(true)
    }
  })

  it('covers the recovered concentration, saturation, solubility and graph-reading concepts', () => {
    const allText = solutionLessons.flatMap((lesson) => lesson.slides).map((slide) => [
      slide.title.en,
      slide.body.en,
      slide.emphasis ?? '',
      ...(slide.reveals?.map((reveal) => reveal.text.en) ?? []),
    ].join(' ')).join(' ')

    for (const concept of [
      'solute',
      'solvent',
      'concentration',
      'volume',
      'dilute',
      'concentrated',
      'saturated',
      'unsaturated',
      'solubility',
      'temperature',
      'x-axis',
      'y-axis',
      'curve',
    ]) {
      expect(allText).toMatch(new RegExp(concept, 'i'))
    }
  })

  it('opens the Solutions Teacher Workspace from J1 Spring / Summer and advances concentration reveals', () => {
    render(<ScienceLessonsApp />)

    fireEvent.click(screen.getByRole('button', { name: /Browse lesson library/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Spring / Summer' }))
    presentLessonFromLibrary(/Aquatic Ecosystems and Habitat Factors/i)

    expect(screen.getByText(/Concentration, Solutes and Saturation/i)).toBeInTheDocument()
    expect(screen.getByText(/Lesson objectives/i)).toBeInTheDocument()
    expect(screen.getByText(/Source references/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    expect(screen.getByText(/Reveal 1 of 3/i)).toBeInTheDocument()
    expect(screen.getByText(/Solute: the substance that dissolves/i)).toBeInTheDocument()
  })

  it('renders English, bilingual, and Traditional Chinese for representative Solutions slides', () => {
    const { container } = render(<ScienceLessonsApp />)

    fireEvent.click(screen.getByRole('button', { name: /Browse lesson library/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Spring / Summer' }))
    presentLessonFromLibrary(/Aquatic Ecosystems and Habitat Factors/i)
    fireEvent.click(container.querySelectorAll('.viewer-thumbnails > button')[2])
    fireEvent.click(screen.getByRole('button', { name: 'English' }))

    expect(screen.getByRole('heading', { name: /What is concentration/i })).toBeInTheDocument()
    expect(screen.queryByText(/什麼是濃度/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Bilingual' }))

    expect(screen.getByText(/什麼是濃度/)).toBeInTheDocument()

    fireEvent.click(container.querySelectorAll('.viewer-language > button')[2])

    expect(screen.getByRole('heading', { name: /什麼是濃度/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /What is concentration/i })).not.toBeInTheDocument()
    expect(container.querySelector('.slide-canvas')).toHaveTextContent('相同體積')
    expect(container.querySelector('.slide-canvas')).not.toHaveTextContent('same volume')
  })

  it('renders the large solubility curve and staged crosshair content', () => {
    const { container } = render(<ScienceLessonsApp />)

    fireEvent.click(screen.getByRole('button', { name: /Browse lesson library/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Spring / Summer' }))
    presentLessonFromLibrary(/Aquatic Food Webs and Ecosystem Change/i)
    fireEvent.click(container.querySelectorAll('.viewer-thumbnails > button')[4])

    expect(screen.getByRole('heading', { name: /Use a graph-reading crosshair/i })).toBeInTheDocument()
    expect(container.querySelector('.solubility-curve-board')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    expect(screen.getByText(/Reveal 4 of 4/i)).toBeInTheDocument()
    expect(container.querySelector('.solubility-read-line--vertical')).toHaveClass('is-visible')
    expect(container.querySelector('.solubility-read-line--horizontal')).toHaveClass('is-visible')
    expect(container.querySelector('.solubility-answer')).toHaveTextContent(/temperature -> curve -> y-axis/i)
  })

  it('renders Presentation Mode for the Solutions production unit', () => {
    const { container } = render(<ScienceLessonsApp />)

    fireEvent.click(screen.getByRole('button', { name: /Browse lesson library/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Spring / Summer' }))
    presentLessonFromLibrary(/Aquatic Food Webs and Ecosystem Change/i)
    fireEvent.click(container.querySelector('.viewer-tool-button--accent')!)

    expect(screen.getByRole('dialog', { name: /Classroom presentation mode/i })).toBeInTheDocument()
    expect(screen.getAllByText(/solubility/i).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Exit' }))

    expect(screen.queryByRole('dialog', { name: /Classroom presentation mode/i })).not.toBeInTheDocument()
  })
})

describe('J2 Aquatic Ecosystems production unit', () => {
  it('appears as the first ordered J2 Fall production sequence', () => {
    expect(j2EcosystemLessons.map((lesson) => lesson.id)).toEqual([
      'j2-aquatic-habitats',
      'j2-aquatic-food-webs',
    ])
    expect(j2EcosystemLessons.every((lesson) => lesson.year === 'J2')).toBe(true)
    expect(j2EcosystemLessons.every((lesson) => lesson.semester === 'Fall')).toBe(true)
    expect(j2EcosystemLessons.every((lesson) => lesson.status === 'Published')).toBe(true)
    expect(j2HabitatLesson.chapter).toBe('Ch.2.5')
    expect(j2FoodWebLesson.lessonOrder).toBe(j2HabitatLesson.lessonOrder + 1)
  })

  it('upgrades recovered J2 ecosystem material with production metadata and bilingual slide content', () => {
    expect(j2HabitatLesson.title).toBe('Aquatic Ecosystems and Habitat Factors')
    expect(j2FoodWebLesson.title).toBe('Aquatic Food Webs and Ecosystem Change')
    expect(j2HabitatLesson.slides).toHaveLength(8)
    expect(j2FoodWebLesson.slides).toHaveLength(8)

    for (const lesson of j2EcosystemLessons) {
      expect(lesson.objectives.length).toBeGreaterThanOrEqual(4)
      expect(lesson.sourceReferences.map((source) => source.id)).toEqual([
        'src-j2-ch2-ecosystems-ppt',
        'src-j2-ch2-ecosystems-pilot',
      ])
      expect(lesson.resources.map((resource) => resource.id)).toEqual([
        'j2-ch2-ecosystems-source-ppt',
        'j2-ch2-aquatic-food-web-challenge',
        'j2-ch2-coastal-seas-clip',
      ])
      expect(lesson.slides.every((slide) => slide.teacherNote.trim().length > 25)).toBe(true)
      expect(lesson.slides.every((slide) => slide.title.zhHant?.trim())).toBe(true)
      expect(lesson.slides.every((slide) => slide.body.zhHant?.trim())).toBe(true)
      expect(lesson.slides.some((slide) => slide.revealMode === 'step-by-step' && (slide.reveals?.length ?? 0) >= 3)).toBe(true)
    }
  })

  it('covers the recovered J2 aquatic ecosystem concepts without dropping pilot material', () => {
    const allText = j2EcosystemLessons.flatMap((lesson) => lesson.slides).map((slide) => [
      slide.title.en,
      slide.body.en,
      slide.emphasis ?? '',
      ...(slide.reveals?.map((reveal) => reveal.text.en) ?? []),
    ].join(' ')).join(' ')

    for (const concept of [
      'Aquatic ecosystems',
      'freshwater',
      'marine',
      'habitat',
      'biotic',
      'abiotic',
      'survival',
      'food webs',
      'producer',
      'population',
      'feeding link',
      'predict',
    ]) {
      expect(allText).toMatch(new RegExp(concept, 'i'))
    }
  })

  it('opens the J2 Teacher Workspace and advances a representative reveal', () => {
    const { container } = render(<ScienceLessonsApp />)

    fireEvent.click(screen.getByRole('button', { name: /Browse lesson library/i }))
    fireEvent.click(screen.getByRole('button', { name: 'J2' }))
    presentLessonFromLibrary(/Aquatic Ecosystems and Habitat Factors/i)

    expect(screen.getByText(/Aquatic Ecosystems and Habitat Factors/i)).toBeInTheDocument()
    expect(screen.getByText(/Lesson objectives/i)).toBeInTheDocument()
    expect(screen.getByText(/Source references/i)).toBeInTheDocument()
    expect(container.querySelector('[data-aquatic-enhanced="true"]')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /KEY WORDS/i })).toBeInTheDocument()
    expect(screen.getByText(/THINK!/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    expect(screen.getByText(/Reveal 1 of 3/i)).toBeInTheDocument()
    expect(screen.getByText(/Freshwater and marine habitats are both aquatic ecosystems/i)).toBeInTheDocument()
  })

  it('supports English, bilingual and Traditional Chinese for J2 ecosystem slides without representative English label leakage', () => {
    const { container } = render(<ScienceLessonsApp />)

    fireEvent.click(screen.getByRole('button', { name: /Browse lesson library/i }))
    fireEvent.click(screen.getByRole('button', { name: 'J2' }))
    presentLessonFromLibrary(/Aquatic Ecosystems and Habitat Factors/i)
    fireEvent.click(container.querySelectorAll('.viewer-thumbnails > button')[1])
    fireEvent.click(screen.getByRole('button', { name: 'English' }))

    expect(screen.getByRole('heading', { name: /An ecosystem is a connected system/i })).toBeInTheDocument()
    expect(screen.queryByText(/生態系是一個相互連結的系統/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Bilingual' }))

    expect(screen.getByText(/生態系是一個相互連結的系統/)).toBeInTheDocument()

    fireEvent.click(container.querySelectorAll('.viewer-language > button')[2])

    expect(screen.getByRole('heading', { name: /生態系是一個相互連結的系統/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /An ecosystem is a connected system/i })).not.toBeInTheDocument()
    expect(container.querySelector('[data-aquatic-enhanced="true"]')).toHaveTextContent('生物因子')
    expect(container.querySelector('[data-aquatic-enhanced="true"]')).not.toHaveTextContent('BIOTIC')
  })

  it('renders the J2 aquatic food-web visual and staged change reasoning', () => {
    const { container } = render(<ScienceLessonsApp />)

    fireEvent.click(screen.getByRole('button', { name: /Browse lesson library/i }))
    fireEvent.click(screen.getByRole('button', { name: 'J2' }))
    presentLessonFromLibrary(/Aquatic Food Webs and Ecosystem Change/i)
    fireEvent.click(container.querySelectorAll('.viewer-thumbnails > button')[3])

    expect(screen.getByRole('heading', { name: /Prediction: remove one producer/i })).toBeInTheDocument()
    expect(container.querySelector('[data-aquatic-enhanced="true"]')).toBeInTheDocument()
    expect(container.querySelector('.aquatic-foodweb-board')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    expect(screen.getByText(/Reveal 3 of 3/i)).toBeInTheDocument()
    expect(container.querySelector('.aquatic-web-change')).toBeInTheDocument()
    expect(container.querySelectorAll('.aquatic-web-arrow.is-visible').length).toBeGreaterThanOrEqual(3)
  })

  it('renders Presentation Mode for the J2 production unit', () => {
    const { container } = render(<ScienceLessonsApp />)

    fireEvent.click(screen.getByRole('button', { name: /Browse lesson library/i }))
    fireEvent.click(screen.getByRole('button', { name: 'J2' }))
    presentLessonFromLibrary(/Aquatic Food Webs and Ecosystem Change/i)
    fireEvent.click(container.querySelector('.viewer-tool-button--accent')!)

    expect(screen.getByRole('dialog', { name: /Classroom presentation mode/i })).toBeInTheDocument()
    expect(screen.getAllByText(/food webs/i).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Exit' }))

    expect(screen.queryByRole('dialog', { name: /Classroom presentation mode/i })).not.toBeInTheDocument()
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
