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

type PublicCopyPair = readonly [en: string, zh: string]

const sharedPublicHubCopy: PublicCopyPair[] = [
  ['Subject Hub', '學科學習中心'],
  ['Latest Updates', '最新消息'],
  ['Featured Work', '精選作品'],
  ['Videos / Performances', '影片／表演'],
  ['Upcoming Events', '即將舉行的活動'],
  ['Resources / Web Links', '學習資源／網路連結'],
  ['Recent Updates', '最近更新'],
  ['Learning Focus', '學習重點'],
  ['Published Updates', '已發布內容'],
  ['Manage this hub', '管理此學習中心'],
]

const eepPublicCopy: PublicCopyPair[] = [
  ['English Enrichment Program', '英語增能課程'],
  ['EEP Learning Hub', 'EEP 學習中心'],
  ['Books, stories, language activities, creative work, and student publishing.', '書籍、故事、語言活動、創意作品與學生出版。'],
  [
    'Explore stories, books, reading, vocabulary, writing, discussion, creative responses, class challenges, and student projects from across EEP. The Student Website Showcase remains part of EEP, now placed within the wider Projects & Showcases pathway.',
    '探索 EEP 的故事、書籍、閱讀、字彙、寫作、討論、創意回應、班級挑戰與學生專題。學生網站成果展示仍是 EEP 的一部分，並納入更完整的「專題與成果展示」學習路徑。',
  ],
  ['Browse Showcase →', '瀏覽成果展示 →'],
  ['Submit Project →', '送出專題 →'],
  ['Books & Stories', '書籍與故事'],
  ['EEP Reading', 'EEP 閱讀'],
  ['Class reading, story worlds, book responses, recommendations, and shared reading moments.', '課堂閱讀、故事世界、閱讀回應、書籍推薦與共享閱讀時光。'],
  ['Explore Books & Stories →', '探索書籍與故事 →'],
  ['Reading & Vocabulary', '閱讀與字彙'],
  ['Language Growth', '語言成長'],
  ['Useful word work, reading routines, vocabulary practice, and language-building activities.', '實用字詞活動、閱讀習慣、字彙練習與語言能力培養。'],
  ['Explore Reading & Vocabulary →', '探索閱讀與字彙 →'],
  ['Creative Work', '創意作品'],
  ['Student Voice', '學生表達'],
  ['Creative writing, multimedia responses, posters, presentations, and student-made class work.', '創意寫作、多媒體回應、海報、簡報與學生自製課堂作品。'],
  ['Explore Creative Work →', '探索創意作品 →'],
  ['Projects & Showcases', '專題與成果展示'],
  ['Public Work', '公開作品'],
  ['Student projects and the existing Student Website Showcase browse and submission flow.', '學生專題，以及現有學生網站成果展示的瀏覽與送件流程。'],
  ['Explore Projects & Showcases →', '探索專題與成果展示 →'],
  ['EEP Workflow', 'EEP 學習流程'],
  ['Student websites from submission to public showcase', '學生網站從送件到公開展示'],
  ['The existing submit, pending, approve, and public gallery workflow is still active for EEP projects.', 'EEP 專題仍保留送件、待審核、核准與公開展示的完整流程。'],
  ['featured projects ready to browse', '個精選專題可供瀏覽'],
  ['Language toggle remains available across the app', '全站皆可切換語言'],
  ['EEP Showcase', 'EEP 成果展示'],
  ['Browse Student Projects', '瀏覽學生專題'],
]

const eslPublicCopy: PublicCopyPair[] = [
  ['ESL Department', 'ESL 學科課程'],
  ['ESL Learning Hub', 'ESL 學習中心'],
  ['Subject learning, resources, activities, and updates across the ESL programme.', 'ESL 課程的學科學習、資源、活動與最新消息。'],
  [
    'Explore Science, Language Arts, Performance Arts, and Social Studies learning spaces. Each subject hub gathers class updates, resources, student work, events, media links, and reusable learning materials.',
    '探索自然科學、語文、表演藝術與社會領域的學習空間。每個學科中心整合課堂消息、學習資源、學生作品、活動、媒體連結與可重複使用的教材。',
  ],
  ['Science →', '自然科學 →'],
  ['Performance Arts →', '表演藝術 →'],
  ['Science', '自然科學'],
  ['Inquiry, experiments, vocabulary, explanations, and evidence-based student thinking.', '探究、實驗、學術字彙、解說與以證據為基礎的學生思考。'],
  ['Enter Science →', '進入自然科學 →'],
  ['Language Arts', '語文'],
  ['Reading, writing, speaking, discussion, craft, reflection, and published responses.', '閱讀、寫作、口語表達、討論、寫作技巧、反思與發表作品。'],
  ['Enter Language Arts →', '進入語文 →'],
  ['Performance Arts', '表演藝術'],
  ['Voice, movement, story, rehearsal, performance reflection, and public sharing.', '聲音、動作、故事、排練、表演反思與公開分享。'],
  ['Enter Performance Arts →', '進入表演藝術 →'],
  ['Social Studies', '社會領域'],
  ['Culture, geography, history, discussion, perspective-taking, and civic learning.', '文化、地理、歷史、討論、觀點理解與公民學習。'],
  ['Enter Social Studies →', '進入社會領域 →'],
]

const subjectPublicCopy: Record<string, PublicCopyPair[]> = {
  '/esl/science': [
    ['ESL Science', 'ESL 自然科學'],
    ['Science Hub', '自然科學學習中心'],
    ['Inquiry, experiments, vocabulary, and student explanations.', '探究、實驗、學術字彙與學生解說。'],
    [
      'A home for science updates, resources, investigations, and student thinking. Students use English to ask questions, explain evidence, describe processes, and connect science learning to everyday life.',
      '提供自然科學消息、學習資源、探究活動與學生思考成果。學生運用英語提出問題、解釋證據、描述過程，並將科學學習連結到日常生活。',
    ],
    ['Inquiry', '探究'],
    ['Experiments', '實驗'],
    ['Evidence', '證據'],
    ['Academic Vocabulary', '學術字彙'],
    ['Investigate, explain, and connect evidence.', '探究、解釋並連結證據。'],
    ['Students use English to ask questions, describe processes, explain evidence, and connect scientific thinking to the world around them.', '學生運用英語提出問題、描述過程、解釋證據，並將科學思考連結到周遭世界。'],
    ['Science updates are on the way', '自然科學內容即將推出'],
    ['New Science learning resources will appear here as they are published.', '新的自然科學學習資源發布後將顯示於此。'],
  ],
  '/esl/language-arts': [
    ['ESL Language Arts', 'ESL 語文'],
    ['Language Arts Hub', '語文學習中心'],
    ['Reading, writing, speaking, and published student responses.', '閱讀、寫作、口語表達與學生發表作品。'],
    [
      'A home for classroom texts, writing craft, discussion, and student publication. Students build confidence through purposeful reading, writing, speaking, reflection, and feedback.',
      '提供課堂文本、寫作技巧、討論活動與學生發表作品。學生透過有目的的閱讀、寫作、口語表達、反思與回饋建立自信。',
    ],
    ['Reading', '閱讀'],
    ['Writing Craft', '寫作技巧'],
    ['Discussion', '討論'],
    ['Published Responses', '發表作品'],
    ['Read closely, write clearly, and share ideas.', '深入閱讀、清楚寫作並分享想法。'],
    ['Students develop voice and confidence through purposeful reading, discussion, writing craft, feedback, and publication.', '學生透過有目的的閱讀、討論、寫作技巧、回饋與發表，培養表達能力與自信。'],
    ['Language Arts updates are on the way', '語文內容即將推出'],
    ['New Language Arts learning resources will appear here as they are published.', '新的語文學習資源發布後將顯示於此。'],
  ],
  '/esl/performance-arts': [
    ['ESL Performance Arts', 'ESL 表演藝術'],
    ['Performance Arts Hub', '表演藝術學習中心'],
    ['Announcements, showcases, student work, video links, resources, and updates.', '公告、成果展示、學生作品、影片連結、學習資源與最新消息。'],
    [
      'A bright home for voice, movement, story, rehearsal, and performance reflection. Students develop expressive English through theatre, movement, spoken word, performance choices, and audience awareness.',
      '提供聲音、動作、故事、排練與表演反思的學習空間。學生透過戲劇、動作、口語表演、舞台選擇與觀眾意識，培養具表達力的英語。',
    ],
    ['Voice', '聲音'],
    ['Movement', '動作'],
    ['Rehearsal', '排練'],
    ['Reflection', '反思'],
    ['Build expressive English through performance.', '透過表演培養具表達力的英語。'],
    ['Students practice voice, movement, story, audience awareness, and reflection through carefully prepared performance work.', '學生透過精心準備的表演作品，練習聲音、動作、故事、觀眾意識與反思。'],
    ['Performance Arts updates are on the way', '表演藝術內容即將推出'],
    ['New Performance Arts learning resources will appear here as they are published.', '新的表演藝術學習資源發布後將顯示於此。'],
  ],
  '/esl/social-studies': [
    ['ESL Social Studies', 'ESL 社會領域'],
    ['Social Studies Hub', '社會領域學習中心'],
    ['Culture, geography, history, discussion, and civic learning.', '文化、地理、歷史、討論與公民學習。'],
    [
      'A home for social studies questions, class resources, projects, and public updates. Students use English to compare perspectives, explain places and events, discuss communities, and connect learning to the world.',
      '提供社會領域問題、課堂資源、學生專題與公開消息。學生運用英語比較觀點、解釋地點與事件、討論社群，並將學習連結到世界。',
    ],
    ['Culture', '文化'],
    ['Geography', '地理'],
    ['History', '歷史'],
    ['Perspective', '觀點'],
    ['Understand communities, places, and perspectives.', '理解社群、地方與不同觀點。'],
    ['Students use English to compare cultures, interpret places and events, and discuss civic ideas with care and clarity.', '學生運用英語比較文化、理解地點與事件，並以謹慎清楚的方式討論公民議題。'],
    ['Social Studies updates are on the way', '社會領域內容即將推出'],
    ['New Social Studies learning resources will appear here as they are published.', '新的社會領域學習資源發布後將顯示於此。'],
  ],
}

const subjectSharedCopy: PublicCopyPair[] = [
  ['Back to ESL →', '返回 ESL →'],
  ['Manage Hub →', '管理學習中心 →'],
]

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

const publicHubCopyForPath = (pathname: string): PublicCopyPair[] => {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

  if (normalizedPath === '/eep') {
    return [...sharedPublicHubCopy, ...eepPublicCopy]
  }

  if (normalizedPath === '/esl') {
    return [...sharedPublicHubCopy, ...eslPublicCopy]
  }

  const subjectCopy = subjectPublicCopy[normalizedPath]
  return subjectCopy ? [...sharedPublicHubCopy, ...subjectSharedCopy, ...subjectCopy] : []
}

const translatedPublicCopy = (mode: LanguageMode, [en, zh]: PublicCopyPair) => {
  if (mode === 'zh-Hant') return zh
  if (mode === 'bilingual') return `${en} / ${zh}`
  return en
}

const applyPublicHubTranslations = (mode: LanguageMode) => {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !document.body) return

  const copy = publicHubCopyForPath(window.location.pathname)
  if (!copy.length) return

  const lookup = new Map<string, PublicCopyPair>()
  copy.forEach((pair) => {
    const [en, zh] = pair
    lookup.set(en, pair)
    lookup.set(zh, pair)
    lookup.set(`${en} / ${zh}`, pair)
  })

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  let current = walker.nextNode()

  while (current) {
    textNodes.push(current as Text)
    current = walker.nextNode()
  }

  textNodes.forEach((node) => {
    const parent = node.parentElement
    if (!parent || parent.closest('script, style, textarea, input, select, option, [contenteditable="true"]')) return

    const raw = node.nodeValue ?? ''
    const trimmed = raw.trim()
    if (!trimmed) return

    const pair = lookup.get(trimmed)
    if (!pair) return

    const nextText = translatedPublicCopy(mode, pair)
    const nextValue = raw.replace(trimmed, nextText)
    if (nextValue !== raw) node.nodeValue = nextValue
  })
}

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

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined' || !document.body) return undefined

    let animationFrame = 0
    const scheduleTranslation = () => {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = window.requestAnimationFrame(() => applyPublicHubTranslations(mode))
    }

    scheduleTranslation()
    const observer = new MutationObserver(scheduleTranslation)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })

    return () => {
      window.cancelAnimationFrame(animationFrame)
      observer.disconnect()
    }
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
