import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ScienceLessonsApp } from './ScienceLessonsApp'
import './scienceLessons.css'

const root = document.getElementById('science-lessons-root')

if (!root) {
  throw new Error('Science Lessons root element was not found.')
}

createRoot(root).render(
  <StrictMode>
    <ScienceLessonsApp />
  </StrictMode>,
)
