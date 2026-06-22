/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  languageModeLabels,
  translations,
  type LanguageMode,
  type TranslationKey,
} from './translations'

const storageKey = 'eep-language-mode'

interface LanguageContextValue {
  mode: LanguageMode
  setMode: (mode: LanguageMode) => void
  t: (key: TranslationKey, values?: Record<string, string | number>) => string
  text: (key: TranslationKey, values?: Record<string, string | number>) => { en: string; zh: string }
}

const modes: LanguageMode[] = ['en', 'bilingual', 'zh-Hant']
const LanguageContext = createContext<LanguageContextValue | null>(null)

const isLanguageMode = (value: string | null): value is LanguageMode =>
  Boolean(value && modes.includes(value as LanguageMode))

const fill = (template: string, values?: Record<string, string | number>) =>
  values
    ? Object.entries(values).reduce(
        (next, [key, value]) => next.replaceAll(`{${key}}`, String(value)),
        template,
      )
    : template

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<LanguageMode>(() => {
    if (typeof window === 'undefined') {
      return 'en'
    }

    const saved = window.localStorage.getItem(storageKey)
    return isLanguageMode(saved) ? saved : 'en'
  })

  useEffect(() => {
    window.localStorage.setItem(storageKey, mode)
    document.documentElement.lang = mode === 'zh-Hant' ? 'zh-Hant' : 'en'
  }, [mode])

  const value = useMemo<LanguageContextValue>(
    () => ({
      mode,
      setMode: setModeState,
      text: (key, values) => ({
        en: fill(translations[key].en, values),
        zh: fill(translations[key].zh, values),
      }),
      t: (key, values) => {
        const entry = translations[key]
        const en = fill(entry.en, values)
        const zh = fill(entry.zh, values)

        if (mode === 'zh-Hant') {
          return zh
        }

        if (mode === 'bilingual') {
          return `${en} / ${zh}`
        }

        return en
      },
    }),
    [mode],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }

  return context
}

export function UiText({
  id,
  as: Component = 'span',
  className,
  values,
}: {
  id: TranslationKey
  as?: 'span' | 'p' | 'h1' | 'h2' | 'strong'
  className?: string
  values?: Record<string, string | number>
}) {
  const { mode, text } = useLanguage()
  const entry = text(id, values)

  if (mode === 'bilingual') {
    return (
      <Component className={className}>
        <span>{entry.en}</span>
        <span className="translation-line">{entry.zh}</span>
      </Component>
    )
  }

  return <Component className={className}>{mode === 'zh-Hant' ? entry.zh : entry.en}</Component>
}

export function LanguageToggle() {
  const { mode, setMode, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!toggleRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div className="language-toggle" ref={toggleRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('languageToggle')}
        className="language-toggle-button"
        type="button"
        onClick={() => setOpen((nextOpen) => !nextOpen)}
      >
        <span>{languageModeLabels[mode]}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="language-menu" role="menu">
          {modes.map((item) => (
            <button
              aria-checked={mode === item}
              className={mode === item ? 'active' : ''}
              key={item}
              role="menuitemradio"
              type="button"
              onClick={() => {
                setMode(item)
                setOpen(false)
              }}
            >
              {languageModeLabels[item]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
