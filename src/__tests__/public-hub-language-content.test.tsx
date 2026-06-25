import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext'

function PublicHubFixture() {
  const { setMode } = useLanguage()

  return (
    <>
      <button type="button" onClick={() => setMode('bilingual')}>Bilingual</button>
      <button type="button" onClick={() => setMode('zh-Hant')}>Traditional Chinese</button>
      <h1>EEP Learning Hub</h1>
      <p>Books, stories, language activities, creative work, and student publishing.</p>
    </>
  )
}

describe('public hub fixed content language modes', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.pushState({}, '', '/eep')
  })

  it('renders EEP main content bilingually and in Traditional Chinese', async () => {
    const user = userEvent.setup()
    render(
      <LanguageProvider>
        <PublicHubFixture />
      </LanguageProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Bilingual' }))
    await waitFor(() => {
      expect(screen.getByText('EEP Learning Hub / EEP 學習中心')).toBeInTheDocument()
      expect(screen.getByText('Books, stories, language activities, creative work, and student publishing. / 書籍、故事、語言活動、創意作品與學生出版。')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Traditional Chinese' }))
    await waitFor(() => {
      expect(screen.getByText('EEP 學習中心')).toBeInTheDocument()
      expect(screen.getByText('書籍、故事、語言活動、創意作品與學生出版。')).toBeInTheDocument()
    })
  })
})
