import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import App from '../App'

function renderAt(path: string) {
  window.history.pushState({}, '', path)
  return render(<App />)
}

async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
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
  window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 16))
  window.cancelAnimationFrame = vi.fn((id: number) => window.clearTimeout(id))

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
  document.documentElement.classList.remove('ied-intro__home-arriving')
  document.documentElement.classList.remove('ied-intro__home-revealing')
  document.querySelectorAll('.ied-intro__carryover-layer').forEach((element) => element.remove())
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

  test('Enter navigates after expansion and hold, then removes the temporary layer', async () => {
    vi.useFakeTimers()
    renderAt('/')

    fireEvent.click(screen.getByRole('button', { name: /Enter/i }))
    fireEvent.click(screen.getByRole('button', { name: /Enter/i }))

    expect(screen.getByRole('button', { name: /Enter/i })).toBeDisabled()
    expect(document.documentElement).toHaveClass('ied-intro__scroll-lock')

    await advance(1500)
    expect(window.location.pathname).toBe('/')
    expect(screen.getByRole('heading', { name: /International Education Department/i })).toBeInTheDocument()

    await advance(340)

    expect(screen.getByRole('heading', { name: /IED Learning Showcase Hub/i })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/ied')
    expect(document.querySelectorAll('.ied-intro__carryover-layer')).toHaveLength(1)
    expect(document.documentElement).toHaveClass('ied-intro__scroll-lock')

    await advance(700)
    expect(document.querySelector('.ied-intro__carryover-layer')).not.toBeInTheDocument()
    expect(document.documentElement).not.toHaveClass('ied-intro__scroll-lock')
    expect(document.documentElement).not.toHaveClass('ied-intro__home-arriving')
  })

  test('reduced-motion Enter uses a short handoff without a carryover layer', async () => {
    vi.useFakeTimers()
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    renderAt('/')

    fireEvent.click(screen.getByRole('button', { name: /Enter/i }))

    await advance(520)

    expect(window.location.pathname).toBe('/ied')
    expect(screen.getByRole('heading', { name: /IED Learning Showcase Hub/i })).toBeInTheDocument()
    expect(document.querySelector('.ied-intro__carryover-layer')).not.toBeInTheDocument()
    expect(document.documentElement).not.toHaveClass('ied-intro__scroll-lock')
  })

  test('browser Back returns from /ied to the intro', async () => {
    vi.useFakeTimers()
    renderAt('/')

    fireEvent.click(screen.getByRole('button', { name: /Enter/i }))
    await advance(1840)

    expect(window.location.pathname).toBe('/ied')
    vi.useRealTimers()

    act(() => {
      window.history.back()
    })

    await waitFor(() => expect(window.location.pathname).toBe('/'))
    expect(screen.getByRole('heading', { name: /International Education Department/i })).toBeInTheDocument()
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
