import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import App from '../App'

function renderAt(path: string) {
  window.history.pushState({}, '', path)
  return render(<App />)
}

beforeEach(() => {
  window.localStorage.clear()
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  window.scrollTo = vi.fn()

  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    x: 120,
    y: 220,
    left: 120,
    top: 220,
    right: 520,
    bottom: 520,
    width: 400,
    height: 300,
    toJSON: () => ({}),
  }))
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.documentElement.classList.remove('ied-intro__scroll-lock')
})

describe('IED intro routing', () => {
  test('/ renders the dedicated intro and not the normal IED homepage', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { name: /International Education Department/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enter/i })).toBeInTheDocument()
    expect(screen.queryByText(/IED Learning Showcase Hub/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
  })

  test('/ied renders the existing IED homepage with normal header chrome', () => {
    renderAt('/ied')

    expect(screen.getByRole('heading', { name: /IED Learning Showcase Hub/i })).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Enter/i })).not.toBeInTheDocument()
  })

  test('brand and IED navigation link to /ied', () => {
    renderAt('/ied')

    const header = screen.getByRole('banner')
    expect(within(header).getByRole('link', { name: /IED Hub/i })).toHaveAttribute('href', '/ied')
    expect(within(header).getByRole('link', { name: 'IED' })).toHaveAttribute('href', '/ied')
  })

  test('Enter navigates from the intro to /ied', async () => {
    vi.useFakeTimers()
    renderAt('/')

    fireEvent.click(screen.getByRole('button', { name: /Enter/i }))

    expect(screen.getByRole('button', { name: /Enter/i })).toBeDisabled()

    await act(async () => {
      vi.advanceTimersByTime(920)
    })

    vi.useRealTimers()

    expect(screen.getByRole('heading', { name: /IED Learning Showcase Hub/i })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/ied')
  })

  test('existing public routes still render', () => {
    renderAt('/eep')
    expect(screen.getByRole('heading', { name: /EEP Learning Hub/i })).toBeInTheDocument()

    cleanup()
    renderAt('/esl')
    expect(screen.getByRole('heading', { name: /ESL Learning Hub/i })).toBeInTheDocument()

    cleanup()
    renderAt('/about')
    expect(screen.getByRole('heading', { name: /International Education at THUHS/i })).toBeInTheDocument()
  })
})
