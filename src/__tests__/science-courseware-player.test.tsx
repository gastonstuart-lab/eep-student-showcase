import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { CoursewareApp, CoursewareLessonPlayer } from '../science-lessons/courseware/CoursewareApp'
import { coursewareSections, getCoursewareLesson } from '../science-lessons/courseware/coursewareManifest'

const createClass = (name: string) => {
  fireEvent.change(screen.getByLabelText('New class'), { target: { value: name } })
  fireEvent.click(screen.getByRole('button', { name: 'Create class' }))
}

const openJ1 = () => fireEvent.click(screen.getByRole('button', { name: /Living Things and the Environment/ }))

describe('Science courseware class sessions', () => {
  beforeEach(() => localStorage.clear())

  it('keeps page progress independent for multiple classes', () => {
    render(<CoursewareApp />)
    createClass('J1 Blue')
    openJ1()
    expect(screen.getByLabelText('Page 1 of 15')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByLabelText('Page 2 of 15')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open teacher tools' }))
    fireEvent.click(screen.getByRole('button', { name: /Back to classes/ }))
    createClass('J1 Gold')
    openJ1()
    expect(screen.getByLabelText('Page 1 of 15')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open teacher tools' }))
    fireEvent.click(screen.getByRole('button', { name: /Back to classes/ }))
    fireEvent.click(screen.getByRole('button', { name: /J1 Blue/ }))
    openJ1()
    expect(screen.getByLabelText('Page 2 of 15')).toBeInTheDocument()
  })

  it('keeps simple navigation direct and makes reveals opt-in', () => {
    render(<CoursewareApp />)
    createClass('J2 Purple')
    fireEvent.click(screen.getByRole('button', { name: /Elements and Atoms/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByLabelText('Page 2 of 15')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Simple mode' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByLabelText('Page 2 of 15')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByLabelText('Page 3 of 15')).toBeInTheDocument()
  })

  it('supports text enlargement, visual enlargement and Traditional Chinese help', () => {
    render(<CoursewareApp />)
    createClass('J1 Green')
    openJ1()

    fireEvent.click(screen.getByRole('button', { name: 'Enlarge the page text' }))
    expect(screen.getByRole('dialog', { name: 'Enlarged teaching text' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close enlarged text' }))

    fireEvent.click(screen.getByRole('button', { name: 'Enlarge the page visual' }))
    expect(screen.getByRole('dialog', { name: 'Enlarged teaching visual' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close enlarged text' }))

    fireEvent.click(screen.getByRole('button', { name: '中文' }))
    expect(screen.getByLabelText('Traditional Chinese support')).toBeInTheDocument()
  })

  it('clamps stale restored reveal progress to the current page artwork', () => {
    const section = coursewareSections[0]
    render(
      <CoursewareLessonPlayer
        lesson={getCoursewareLesson(section)}
        section={section}
        className="Current session"
        initialProgress={{
          slideIndex: 0,
          revealIndex: 99,
          chineseEnabled: false,
          highlightsEnabled: true,
          mode: 'interactive',
        }}
        onProgress={() => undefined}
        onExit={() => undefined}
      />,
    )

    expect(screen.getByLabelText('Page 1 of 15')).toHaveTextContent('reveal 1/1')
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByLabelText('Page 2 of 15')).toBeInTheDocument()
  })
})
