import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { CoursewareApp } from '../science-lessons/courseware/CoursewareApp'

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
})
