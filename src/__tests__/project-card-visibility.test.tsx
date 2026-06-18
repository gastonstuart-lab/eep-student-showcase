import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ProjectCard } from '../App'
import { LanguageProvider } from '../i18n/LanguageContext'
import type { Project } from '../types'

const projects: Project[] = [
  {
    id: 'alpha',
    title: 'Alpha Food Guide',
    groupName: 'Alpha Team',
    className: 'EEP 8A',
    members: 'A, B',
    category: 'Travel & Food Guides',
    description: 'A student travel and food guide.',
    audience: 'Visitors',
    impact: 'Helps visitors explore.',
    googleSitesUrl: 'https://sites.google.com/view/alpha',
    imageUrl: '',
    status: 'approved',
    featured: true,
    studentPick: false,
  },
  {
    id: 'beta',
    title: 'Beta Club Hub',
    groupName: 'Beta Team',
    className: 'EEP 8B',
    members: 'C, D',
    category: 'School Clubs',
    description: 'A school club website.',
    audience: 'Students',
    impact: 'Helps classmates join.',
    googleSitesUrl: 'https://sites.google.com/view/beta',
    imageUrl: '',
    status: 'approved',
    featured: false,
    studentPick: true,
  },
]

function ShowcaseHarness() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All Projects')
  const visibleProjects = projects.filter((project) => {
    const matchesCategory = category === 'All Projects' || project.category === category
    const matchesQuery = project.title.toLowerCase().includes(query.toLowerCase())
    return matchesCategory && matchesQuery
  })

  return (
    <BrowserRouter>
      <LanguageProvider>
        <button type="button" onClick={() => setCategory('School Clubs')}>
          School Clubs
        </button>
        <input aria-label="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="project-grid">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </LanguageProvider>
    </BrowserRouter>
  )
}

describe('ProjectCard visibility', () => {
  it('does not depend on reveal animation after filtering or searching', async () => {
    const user = userEvent.setup()
    const { container } = render(<ShowcaseHarness />)

    expect(screen.getByText('Alpha Food Guide')).toBeVisible()
    expect(screen.getByText('Beta Club Hub')).toBeVisible()
    expect(container.querySelector('.project-card.reveal')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'School Clubs' }))

    expect(screen.queryByText('Alpha Food Guide')).not.toBeInTheDocument()
    expect(screen.getByText('Beta Club Hub')).toBeVisible()
    expect(container.querySelector('.project-card.reveal')).toBeNull()

    await user.type(screen.getByLabelText('Search'), 'Beta')

    expect(screen.getByText('Beta Club Hub')).toBeVisible()
    expect(container.querySelector('.project-card.reveal')).toBeNull()
  })
})
