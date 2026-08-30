export type CoursewareProgress = {
  slideIndex: number
  revealIndex: number
  chineseEnabled: boolean
  highlightsEnabled: boolean
  mode: 'simple' | 'interactive'
}

export const defaultCoursewareProgress = (): CoursewareProgress => ({
  slideIndex: 0,
  revealIndex: 0,
  chineseEnabled: false,
  highlightsEnabled: true,
  mode: 'simple',
})