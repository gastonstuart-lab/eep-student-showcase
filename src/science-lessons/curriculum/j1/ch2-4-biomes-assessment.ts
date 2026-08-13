export interface BiomesAssessmentCoverageItem {
  question: number
  source: 'homework' | 'quiz'
  assessedConcept: string
  taughtInLessonIds: string[]
  taughtInSlideIds: string[]
}

export const biomesHomeworkCoverage: BiomesAssessmentCoverageItem[] = [
  {
    question: 1,
    source: 'homework',
    assessedConcept: 'Definition of biome',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-1'],
    taughtInSlideIds: ['j1-ch2-4-biome-definition'],
  },
  {
    question: 2,
    source: 'homework',
    assessedConcept: 'Six major biomes found on Earth',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-1'],
    taughtInSlideIds: ['j1-ch2-4-six-biomes'],
  },
  {
    question: 3,
    source: 'homework',
    assessedConcept: 'Temperature and precipitation build climate',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-1'],
    taughtInSlideIds: ['j1-ch2-4-biome-definition', 'j1-ch2-4-climate-drivers'],
  },
  {
    question: 4,
    source: 'homework',
    assessedConcept: 'Temperate rain forest and tropical rain forest differences',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-1'],
    taughtInSlideIds: ['j1-ch2-4-rain-forest'],
  },
  {
    question: 5,
    source: 'homework',
    assessedConcept: 'Canopy and understory difference',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-1'],
    taughtInSlideIds: ['j1-ch2-4-rainforest-layers'],
  },
  {
    question: 6,
    source: 'homework',
    assessedConcept: 'Desert receives less than 25 cm of rain per year',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-1'],
    taughtInSlideIds: ['j1-ch2-4-desert'],
  },
  {
    question: 7,
    source: 'homework',
    assessedConcept: 'Prairie and savanna as the two grassland types',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-1'],
    taughtInSlideIds: ['j1-ch2-4-grassland'],
  },
  {
    question: 8,
    source: 'homework',
    assessedConcept: 'Deciduous trees shed leaves and grow new ones',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-2'],
    taughtInSlideIds: ['j1-ch2-4-deciduous-forest'],
  },
  {
    question: 9,
    source: 'homework',
    assessedConcept: 'Boreal forest animal examples',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-2'],
    taughtInSlideIds: ['j1-ch2-4-boreal-animals'],
  },
  {
    question: 10,
    source: 'homework',
    assessedConcept: 'Permafrost as frozen tundra soil',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-2'],
    taughtInSlideIds: ['j1-ch2-4-tundra'],
  },
]

export const biomesQuizCoverage: BiomesAssessmentCoverageItem[] = [
  {
    question: 1,
    source: 'quiz',
    assessedConcept: 'Tundra is the coldest biome',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-2'],
    taughtInSlideIds: ['j1-ch2-4-tundra'],
  },
  {
    question: 2,
    source: 'quiz',
    assessedConcept: 'Permafrost is frozen soil in the tundra',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-2'],
    taughtInSlideIds: ['j1-ch2-4-tundra'],
  },
  {
    question: 3,
    source: 'quiz',
    assessedConcept: 'Canopy is the leafy roof',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-1'],
    taughtInSlideIds: ['j1-ch2-4-rainforest-layers'],
  },
  {
    question: 4,
    source: 'quiz',
    assessedConcept: 'Understory plants grow in the shade of bigger trees',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-1'],
    taughtInSlideIds: ['j1-ch2-4-rainforest-layers'],
  },
  {
    question: 5,
    source: 'quiz',
    assessedConcept: 'Temperate rain forest receives about 300 cm of rain per year',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-1'],
    taughtInSlideIds: ['j1-ch2-4-rain-forest'],
  },
  {
    question: 6,
    source: 'quiz',
    assessedConcept: 'Boreal forest grows closest to the coldest parts of the world',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-2'],
    taughtInSlideIds: ['j1-ch2-4-boreal-forest'],
  },
  {
    question: 7,
    source: 'quiz',
    assessedConcept: 'TEACHER CONFIRMATION REQUIRED - expected source answer currently interpreted as Tropical Rain Forest',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-1'],
    taughtInSlideIds: ['j1-ch2-4-rain-forest'],
  },
  {
    question: 8,
    source: 'quiz',
    assessedConcept: 'Deciduous forest trees lose leaves during part of the year',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-2'],
    taughtInSlideIds: ['j1-ch2-4-deciduous-forest'],
  },
  {
    question: 9,
    source: 'quiz',
    assessedConcept: 'Tundra has very little rainfall and midnight sun in mid-summer',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-2'],
    taughtInSlideIds: ['j1-ch2-4-tundra', 'j1-ch2-4-tundra-plants'],
  },
  {
    question: 10,
    source: 'quiz',
    assessedConcept: 'Savanna receives about 120 cm of rain and can be found in Africa',
    taughtInLessonIds: ['j1-ch2-4-biomes-lesson-1'],
    taughtInSlideIds: ['j1-ch2-4-grassland'],
  },
]

export const biomesAssessmentCoverage = [...biomesHomeworkCoverage, ...biomesQuizCoverage]
