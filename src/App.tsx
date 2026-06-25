import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactElement, type ReactNode } from 'react'
import { useLayoutEffect } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { AuthProvider, mapAuthError, useAuth } from './auth'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PremiumHero, type PremiumHeroAction } from './components/public/PremiumHero'
import { IedEntryPage } from './components/public/IedEntryPage'
import { PremiumImageCard } from './components/public/PremiumImageCard'
import { ProgrammePathwayCard } from './components/public/ProgrammePathwayCard'
import { ScrollReveal } from './components/public/ScrollReveal'
import { SubjectPathwayCard } from './components/public/SubjectPathwayCard'
import { StaffAccessPage } from './components/studio/accessWizard/AccessWizard'
import { HubContentLibrary } from './components/studio/HubContentLibrary'
import { EmptyState, ProtectedAppShell } from './components/studio/ProtectedWorkspace'
import { buildWorkspaceContentStatusCounts, buildWorkspaceContextOptions, buildWorkspaceNav, canShowSeedSampleDataAction, getAccessibleHubConfigs, shouldShowProjectSummary } from './components/studio/workspaceModel'
import { workspaceHubViewUrl } from './components/studio/workspaceRouting'
import { ContentLayout } from './components/public/ContentLayout'
import {
  createProject,
  deleteProject,
  saveHubPage,
  seedProjects,
  updateProject,
  watchAuditLogs,
} from './data'
import { isFirebaseConfigured, useFirebaseEmulators } from './firebase'
import { hubConfigById, hubConfigs } from './hubs'
import { LanguageProvider, LanguageToggle, UiText, useLanguage } from './i18n/LanguageContext'
import { categoryTranslationKeys, statusTranslationKeys, type TranslationKey } from './i18n/translations'
import { useAllPublishedContentItems, useContentItems } from './useContentItems'
import { useHubPage, useHubPages } from './useHubPages'
import { useProjects } from './useProjects'
import { canCreateContentForAdmin } from './utils/authorization'
import { projectFieldLimits, projectSubmissionFingerprint, validateProjectSubmission } from './utils/validation'
import {
  categories,
  type AuditLogEntry,
  type ContentItem,
  type HubPage as HubPageData,
  type Project,
  type ProjectCategory,
  type ProjectInput,
} from './types'
import './App.css'

const emptyProject: ProjectInput = {
  sectionId: 'eep',
  title: '',
  groupName: '',
  className: '',
  members: '',
  category: 'Creative Projects',
  description: '',
  audience: '',
  impact: '',
  googleSitesUrl: '',
  imageUrl: '',
  status: 'pending',
  featured: false,
  studentPick: false,
  publiclyVisible: false,
}

const studentGuidePreziUrl = 'https://prezi.com/view/nGLmHqRktUdpbzEUlJmK/embed'

const categoryIcons: Record<ProjectCategory | 'All Projects', string> = {
  'All Projects': 'Grid',
  'Local Businesses': 'Shop',
  'School Clubs': 'Club',
  'Travel & Food Guides': 'Map',
  'Student Help': 'Help',
  Campaigns: 'Cause',
  'Creative Projects': 'Art',
}

const defaultPageDescription =
  'Explore student learning, creative projects, ESL subject hubs, and the EEP Student Website Showcase from the International Education Department at THUHS.'

const routeMeta = [
  { pattern: /^\/$/, title: 'International Education Department | THUHS', description: 'Enter the IED Learning Hub at THUHS.' },
  { pattern: /^\/ied\/?$/, title: 'IED Learning Hub | THUHS', description: defaultPageDescription },
  { pattern: /^\/eep\/?$/, title: 'EEP Learning Hub | THUHS', description: 'Explore EEP stories, language activities, creative work, and student website projects.' },
  { pattern: /^\/eep\/showcase\/?$/, title: 'EEP Student Website Showcase | THUHS', description: 'Browse approved student-built Google Sites projects from the EEP Student Website Showcase.' },
  { pattern: /^\/eep\/showcase\/submit\/?$|^\/submit\/?$/, title: 'Submit an EEP Project | THUHS', description: 'Submit a Google Sites student project to the EEP teacher review queue.' },
  { pattern: /^\/esl\/?$/, title: 'ESL Learning Hub | THUHS', description: 'Explore ESL subject hubs, resources, updates, and student learning.' },
  { pattern: /^\/esl\/science\/?$/, title: 'Science Hub | THUHS', description: 'Explore ESL science learning updates, resources, and student work.' },
  { pattern: /^\/esl\/language-arts\/?$/, title: 'Language Arts Hub | THUHS', description: 'Explore ESL language arts reading, writing, discussion, and student work.' },
  { pattern: /^\/esl\/performance-arts\/?$/, title: 'Performance Arts Hub | THUHS', description: 'Explore ESL performance arts events, videos, resources, and student work.' },
  { pattern: /^\/esl\/social-studies\/?$/, title: 'Social Studies Hub | THUHS', description: 'Explore ESL social studies learning, resources, and student work.' },
  { pattern: /^\/about\/?$/, title: 'About IED | THUHS', description: 'Learn about international education learning, communication, and student publishing at THUHS.' },
  { pattern: /^\/login\/?$/, title: 'Teacher Login | IED Learning Hub', description: 'Teacher sign-in for reviewing student submissions and managing hub content.' },
  { pattern: /^\/admin/, title: 'Teacher Dashboard | IED Learning Hub', description: 'Secure teacher tools for managing approved content, projects, and hub pages.' },
] as const

const submissionDestinations = {
  'eep-showcase': {
    sectionId: 'eep',
    name: 'EEP Student Website Showcase',
    title: 'Submit to the EEP Showcase',
    body: 'Send your Google Sites project to the teacher review queue for the EEP Student Website Showcase.',
    success: 'Project submitted to the EEP Student Website Showcase. It is awaiting teacher review.',
  },
  science: {
    sectionId: 'esl-science',
    name: 'Science Hub',
    title: 'Submit work to Science',
    body: 'Send your science learning, investigation, or explanation for teacher review.',
    success: 'Your Science submission is awaiting teacher review.',
  },
  'language-arts': {
    sectionId: 'esl-language-arts',
    name: 'Language Arts Hub',
    title: 'Submit work to Language Arts',
    body: 'Send your reading, writing, speaking, or response work for teacher review.',
    success: 'Your Language Arts submission is awaiting teacher review.',
  },
  'performance-arts': {
    sectionId: 'esl-performance-arts',
    name: 'Performance Arts Hub',
    title: 'Submit work to Performance Arts',
    body: 'Send your performance, rehearsal, media, or reflection work for teacher review.',
    success: 'Your Performance Arts submission is awaiting teacher review.',
  },
  'social-studies': {
    sectionId: 'esl-social-studies',
    name: 'Social Studies Hub',
    title: 'Submit work to Social Studies',
    body: 'Send your social studies project, explanation, or public update for teacher review.',
    success: 'Your Social Studies submission is awaiting teacher review.',
  },
} as const

type SubmissionDestinationId = keyof typeof submissionDestinations

const premiumAssets = {
  heroes: {
    home: '/images/ied-premium/heroes/ied-home-hero.webp',
    about: '/images/ied-premium/heroes/ied-about-hero.webp',
    eep: '/images/ied-premium/heroes/eep-hero.webp',
    esl: '/images/ied-premium/heroes/esl-hero.webp',
    science: '/images/ied-premium/heroes/science-hero.webp',
    languageArts: '/images/ied-premium/heroes/language-arts-hero.webp',
    performanceArts: '/images/ied-premium/heroes/performance-arts-hero.webp',
    socialStudies: '/images/ied-premium/heroes/social-studies-hero.webp',
    showcase: '/images/ied-premium/heroes/showcase-hero.webp',
  },
  mobile: {
    home: '/images/ied-premium/mobile/ied-home-mobile.webp',
    about: '/images/ied-premium/mobile/ied-about-mobile.webp',
    eep: '/images/ied-premium/mobile/eep-mobile.webp',
    esl: '/images/ied-premium/mobile/esl-mobile.webp',
    science: '/images/ied-premium/mobile/science-mobile.webp',
    languageArts: '/images/ied-premium/mobile/language-arts-mobile.webp',
    performanceArts: '/images/ied-premium/mobile/performance-arts-mobile.webp',
    socialStudies: '/images/ied-premium/mobile/social-studies-mobile.webp',
    showcase: '/images/ied-premium/mobile/showcase-mobile.webp',
  },
  cards: {
    home: '/images/ied-premium/cards/ied-home-card.webp',
    about: '/images/ied-premium/cards/ied-about-card.webp',
    eep: '/images/ied-premium/cards/eep-card.webp',
    esl: '/images/ied-premium/cards/esl-card.webp',
    science: '/images/ied-premium/cards/science-card.webp',
    languageArts: '/images/ied-premium/cards/language-arts-card.webp',
    performanceArts: '/images/ied-premium/cards/performance-arts-card.webp',
    socialStudies: '/images/ied-premium/cards/social-studies-card.webp',
    showcase: '/images/ied-premium/cards/showcase-card.webp',
  },
} as const

const demoPreviewProjects: Project[] = [
  {
    id: 'demo-taichung-food',
    sectionId: 'eep',
    title: 'Taichung Food Guide',
    groupName: 'Night Market Navigators',
    className: 'EEP 8A',
    members: 'Annie Chen, Leo Lin, Marcus Wu',
    category: 'Travel & Food Guides',
    description: 'A student-made guide to favorite food stops and helpful visitor tips.',
    audience: 'Visitors, exchange students, and classmates exploring Taichung.',
    impact: 'Helps people discover local restaurants with student-friendly recommendations.',
    googleSitesUrl: 'https://sites.google.com/view/taichung-food-guide',
    imageUrl: '',
    status: 'approved',
    featured: true,
    studentPick: true,
    publiclyVisible: true,
  },
  {
    id: 'demo-happy-paws',
    sectionId: 'eep',
    title: 'Happy Paws Pet Grooming',
    groupName: 'Pawsitive Web Team',
    className: 'EEP 8B',
    members: 'Ivy Chen, Ben Hsu, Tara Liu',
    category: 'Local Businesses',
    description: 'A friendly service website for pet grooming, appointments, and care tips.',
    audience: 'Families looking for local pet grooming services.',
    impact: 'Shows how a small business can build trust with clear online information.',
    googleSitesUrl: 'https://sites.google.com/view/happy-paws-pet-grooming',
    imageUrl: '',
    status: 'approved',
    featured: false,
    studentPick: true,
    publiclyVisible: true,
  },
  {
    id: 'demo-basketball-club',
    sectionId: 'eep',
    title: 'Basketball Club Hub',
    groupName: 'Full Court Builders',
    className: 'EEP 7B',
    members: 'Ethan Huang, Kai Wang, Jayden Liu',
    category: 'School Clubs',
    description: 'Practice schedules, team news, highlights, and sign-up information.',
    audience: 'Students who want to join or follow the basketball club.',
    impact: 'Makes club communication easier for players, families, and fans.',
    googleSitesUrl: 'https://sites.google.com/view/basketball-club-hub',
    imageUrl: '',
    status: 'approved',
    featured: true,
    studentPick: false,
    publiclyVisible: true,
  },
  {
    id: 'demo-night-market',
    sectionId: 'eep',
    title: 'Night Market for Visitors',
    groupName: 'Lantern Lane',
    className: 'EEP 8A',
    members: 'Tina Ko, Jason Ma, Selina Fang',
    category: 'Travel & Food Guides',
    description: 'A visitor guide with food vocabulary, maps, photos, and helpful local tips.',
    audience: 'Travelers visiting night markets for the first time.',
    impact: 'Helps visitors feel confident while supporting local vendors.',
    googleSitesUrl: 'https://sites.google.com/view/night-market-for-visitors',
    imageUrl: '',
    status: 'approved',
    featured: false,
    studentPick: false,
    publiclyVisible: true,
  },
  {
    id: 'demo-study-survival',
    sectionId: 'eep',
    title: 'Study Survival Guide',
    groupName: 'Focus Lab',
    className: 'EEP 8C',
    members: 'Sophie Lee, Ryan Peng, Chloe Yang',
    category: 'Student Help',
    description: 'Study plans, exam review tips, and student-tested organization templates.',
    audience: 'Students balancing homework, activities, and tests.',
    impact: 'Makes school routines easier to manage with practical advice.',
    googleSitesUrl: 'https://sites.google.com/view/study-survival-guide',
    imageUrl: '',
    status: 'approved',
    featured: false,
    studentPick: false,
    publiclyVisible: true,
  },
  {
    id: 'demo-ocean-campaign',
    sectionId: 'eep',
    title: 'Save the Ocean Campaign',
    groupName: 'Blue Future Team',
    className: 'EEP 9A',
    members: 'Mia Tsai, Nora Chang, William Ho',
    category: 'Campaigns',
    description: 'A campaign site with facts, pledge actions, and cleanup ideas.',
    audience: 'Students and families interested in protecting ocean life.',
    impact: 'Turns environmental awareness into practical school community action.',
    googleSitesUrl: 'https://sites.google.com/view/save-the-ocean-campaign',
    imageUrl: '',
    status: 'approved',
    featured: false,
    studentPick: true,
    publiclyVisible: true,
  },
  {
    id: 'demo-comic-world',
    sectionId: 'eep',
    title: 'Comic World Adventures',
    groupName: 'Panel Power',
    className: 'EEP 7A',
    members: 'Luna Kao, Felix Sun, Ariel Wu',
    category: 'Creative Projects',
    description: 'An original comic portal with characters, episodes, and reader polls.',
    audience: 'Young readers and classmates who enjoy illustrated stories.',
    impact: 'Encourages creative writing and audience feedback.',
    googleSitesUrl: 'https://sites.google.com/view/comic-world-adventures',
    imageUrl: '',
    status: 'approved',
    featured: false,
    studentPick: true,
    publiclyVisible: true,
  },
  {
    id: 'demo-family-bakery',
    sectionId: 'eep',
    title: 'Family Bakery Website',
    groupName: 'Sweet Street Studio',
    className: 'EEP 9B',
    members: 'Grace Lin, Owen Chen, Nina Hsu',
    category: 'Local Businesses',
    description: 'A warm bakery website with menu highlights, story pages, and contact details.',
    audience: 'Local families looking for fresh bread and cakes.',
    impact: 'Demonstrates how student design can support neighborhood businesses.',
    googleSitesUrl: 'https://sites.google.com/view/family-bakery-website',
    imageUrl: '',
    status: 'approved',
    featured: true,
    studentPick: false,
    publiclyVisible: true,
  },
  {
    id: 'demo-eco-actions',
    sectionId: 'eep',
    title: 'Eco Actions Today',
    groupName: 'Green Steps',
    className: 'EEP 9A',
    members: 'Olivia Wu, Max Lin, Phoebe Chang',
    category: 'Campaigns',
    description: 'A practical environmental action site with weekly challenges and resources.',
    audience: 'Students and families who want greener daily habits.',
    impact: 'Turns climate concern into simple actions people can do now.',
    googleSitesUrl: 'https://sites.google.com/view/eco-actions-today',
    imageUrl: '',
    status: 'approved',
    featured: false,
    studentPick: false,
    publiclyVisible: true,
  },
  {
    id: 'demo-soundwave',
    sectionId: 'eep',
    title: 'Soundwave Studio',
    groupName: 'Audio Makers',
    className: 'EEP 7C',
    members: 'Kevin Ho, Emma Lai, Victor Chen',
    category: 'Creative Projects',
    description: 'A music studio concept with playlists, recording tips, and artist features.',
    audience: 'Students interested in music production and creative audio.',
    impact: 'Connects creative students through music, tools, and shared inspiration.',
    googleSitesUrl: 'https://sites.google.com/view/soundwave-studio',
    imageUrl: '',
    status: 'approved',
    featured: false,
    studentPick: false,
    publiclyVisible: true,
  },
]

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ErrorBoundary>
          <AuthProvider>
            <Shell />
          </AuthProvider>
        </ErrorBoundary>
      </LanguageProvider>
    </BrowserRouter>
  )
}

function decodeHashId(hash: string) {
  try {
    return decodeURIComponent(hash.slice(1))
  } catch {
    return hash.slice(1)
  }
}

function focusMainContent() {
  document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true })
}

function scrollElementIntoRouteView(target: HTMLElement) {
  const documentStyles = window.getComputedStyle(document.documentElement)
  const targetStyles = window.getComputedStyle(target)
  const scrollPaddingTop = Number.parseFloat(documentStyles.scrollPaddingTop) || 0
  const scrollMarginTop = Number.parseFloat(targetStyles.scrollMarginTop) || 0
  const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - scrollPaddingTop - scrollMarginTop)

  scrollRouteWindowTo(top)
}

function scrollRouteWindowTo(top: number) {
  const root = document.documentElement
  const scrollTarget = document.scrollingElement ?? document.documentElement
  const previousScrollBehavior = root.style.scrollBehavior

  root.style.scrollBehavior = 'auto'
  window.scrollTo({ top, left: 0, behavior: 'auto' })
  scrollTarget.scrollTop = top
  scrollTarget.scrollLeft = 0
  root.style.scrollBehavior = previousScrollBehavior
}

function useRouteScrollRestoration() {
  const location = useLocation()

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    return () => {
      window.history.scrollRestoration = previousScrollRestoration
    }
  }, [])

  useLayoutEffect(() => {
    const keepScrollPosition = (scrollToDestination: () => void) => {
      scrollToDestination()
      focusMainContent()

      const frame = window.requestAnimationFrame(scrollToDestination)
      const settleTimer = window.setTimeout(scrollToDestination, 50)
      const finalTimer = window.setTimeout(scrollToDestination, 150)
      const lateTimer = window.setTimeout(scrollToDestination, 350)
      const loadedTimer = window.setTimeout(scrollToDestination, 700)

      return () => {
        window.cancelAnimationFrame(frame)
        window.clearTimeout(settleTimer)
        window.clearTimeout(finalTimer)
        window.clearTimeout(lateTimer)
        window.clearTimeout(loadedTimer)
      }
    }

    if (location.hash) {
      const targetId = decodeHashId(location.hash)

      return keepScrollPosition(() => {
        const target = document.getElementById(targetId)

        if (target) {
          scrollElementIntoRouteView(target)
        } else {
          scrollRouteWindowTo(0)
        }
      })
    }

    return keepScrollPosition(() => scrollRouteWindowTo(0))
  }, [location.hash, location.pathname, location.search])
}

function Shell() {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth()
  const { mode, t, text } = useLanguage()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const chromeText = (key: TranslationKey) => {
    const entry = text(key)

    return mode === 'zh-Hant' ? entry.zh : entry.en
  }

  useRouteScrollRestoration()

  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    )

    revealItems.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [location.pathname])

  useEffect(() => {
    const meta = routeMeta.find((item) => item.pattern.test(location.pathname)) ?? {
      title: 'Page Not Found | IED Learning Hub',
      description: 'The requested IED Learning Hub page could not be found.',
    }
    const canonical = `${window.location.origin}${location.pathname}`

    document.title = meta.title
    updateMeta('description', meta.description)
    updateMeta('og:title', meta.title, 'property')
    updateMeta('og:description', meta.description, 'property')
    updateMeta('og:image', `${window.location.origin}${premiumAssets.cards.home}`, 'property')
    updateMeta('og:type', 'website', 'property')
    updateMeta('robots', 'index, follow')
    updateCanonical(canonical)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileMenuOpen])

  const protectedWorkspaceRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/change-password'
  const introRoute = location.pathname === '/'

  return (
    <div className={protectedWorkspaceRoute ? 'app-shell app-shell--workspace' : 'app-shell'}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      {!protectedWorkspaceRoute && !introRoute && (
        <header className="topbar">
          <Link className="brand" to="/ied">
            <img className="brand-logo" src="/school-logo.svg" alt="" />
            <span className="brand-text">
              <strong>IED Hub</strong>
              <small>Learning Showcase</small>
            </span>
          </Link>
          <button
            className="mobile-menu-button"
            type="button"
            aria-controls="topbar-actions"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            Menu
          </button>
          <nav className="main-nav" aria-label={t('primaryNavigation')}>
            <NavLink to="/ied" onClick={() => setMobileMenuOpen(false)}>IED</NavLink>
            <NavLink to="/eep" onClick={() => setMobileMenuOpen(false)}>EEP</NavLink>
            <NavLink to="/esl" onClick={() => setMobileMenuOpen(false)}>ESL</NavLink>
            <NavLink to="/about" onClick={() => setMobileMenuOpen(false)}>{chromeText('navAbout')}</NavLink>
          </nav>
          <div id="topbar-actions" className={`topbar-actions${mobileMenuOpen ? ' is-open' : ''}`}>
            <LanguageToggle />
            {user ? (
              <>
                {isAdmin && (
                  <Link className="small-button" to="/admin" onClick={() => setMobileMenuOpen(false)}>
                    {chromeText('navAdmin')}
                  </Link>
                )}
                {isAdmin && (
                  <Link className="small-button admin-hubs-shortcut" to="/admin/hubs" onClick={() => setMobileMenuOpen(false)}>
                    Hubs
                  </Link>
                )}
                {isSuperAdmin && (
                  <Link className="small-button" to="/admin/users" onClick={() => setMobileMenuOpen(false)}>
                    Access
                  </Link>
                )}
                <button
                  className="small-button"
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    void logout()
                  }}
                >
                  {chromeText('signOut')}
                </button>
              </>
            ) : (
              <Link className="small-button" to="/login" onClick={() => setMobileMenuOpen(false)}>
                {chromeText('loginTitle')}
              </Link>
            )}
          </div>
        </header>
      )}

      {!isFirebaseConfigured && !introRoute && <FirebaseNotice />}

      <main className={protectedWorkspaceRoute ? 'page-transition route-main route-main--workspace' : 'page-transition route-main'} id="main-content" key={location.pathname} tabIndex={-1}>
        {!protectedWorkspaceRoute && !introRoute && <BackNavigation />}
        <Routes>
          <Route path="/" element={<IedEntryPage />} />
          <Route path="/ied" element={<HomePage />} />
          <Route path="/eep" element={<HubPageView sectionId="eep" />} />
          <Route path="/eep/showcase" element={<EepShowcasePage />} />
          <Route path="/eep/showcase/submit" element={<SubmitPage destination="eep-showcase" />} />
          <Route path="/esl/science/submit" element={<SubmitPage destination="science" />} />
          <Route path="/esl/language-arts/submit" element={<SubmitPage destination="language-arts" />} />
          <Route path="/esl/performance-arts/submit" element={<SubmitPage destination="performance-arts" />} />
          <Route path="/esl/social-studies/submit" element={<SubmitPage destination="social-studies" />} />
          <Route path="/esl" element={<HubPageView sectionId="esl" />} />
          <Route path="/esl/science" element={<HubPageView sectionId="esl-science" />} />
          <Route path="/esl/language-arts" element={<HubPageView sectionId="esl-language-arts" />} />
          <Route path="/esl/performance-arts" element={<HubPageView sectionId="esl-performance-arts" />} />
          <Route path="/esl/social-studies" element={<HubPageView sectionId="esl-social-studies" />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/submit" element={<SubmitPage destination="eep-showcase" />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/change-password" element={<PasswordChangePage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pending"
            element={
              <ProtectedRoute>
                <Navigate to="/admin/submissions/eep?status=pending" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/approved"
            element={
              <ProtectedRoute>
                <Navigate to="/admin/submissions/eep?status=approved" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/submissions/:sectionId"
            element={
              <ProtectedRoute>
                <SubmissionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hubs"
            element={
              <ProtectedRoute>
                <HubAdminListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hubs/:sectionId"
            element={
              <ProtectedRoute>
                <HubAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireManageUsers>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute requireAuditLog>
                <AuditLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/performance-arts"
            element={
              <ProtectedRoute>
                <Navigate to="/admin/hubs/esl-performance-arts" replace />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

function updateMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.append(element)
  }

  element.content = content
}

function updateCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.append(element)
  }

  element.href = href
}

function BackNavigation() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/ied')
  }

  return (
    <button className="back-link" type="button" onClick={goBack}>
      <span aria-hidden="true">&larr;</span>
      {t('back')}
    </button>
  )
}

function FirebaseNotice() {
  const { t } = useLanguage()

  return (
    <div className="notice">
      {t('firebaseNotice')}
    </div>
  )
}

function ProtectedRoute({
  children,
  requireSuperAdmin = false,
  requireManageUsers = false,
  requireAuditLog = false,
  sectionId,
}: {
  children: ReactElement
  requireSuperAdmin?: boolean
  requireManageUsers?: boolean
  requireAuditLog?: boolean
  sectionId?: string
}) {
  const { user, loading, adminLoading, adminUser, isAdmin, isSuperAdmin, canManageUsers, canViewAuditLog, canManageSection } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()

  if (loading || adminLoading) {
    return <PageMessage title={t('checkingSessionTitle')} body={t('checkingSessionBody')} />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminUser?.mustChangePassword && location.pathname !== '/admin/change-password') {
    return <Navigate to="/admin/change-password" replace />
  }

  if (
    !isAdmin ||
    (requireSuperAdmin && !isSuperAdmin) ||
    (requireManageUsers && !canManageUsers) ||
    (requireAuditLog && !canViewAuditLog) ||
    (sectionId && !canManageSection(sectionId))
  ) {
    return <AccessDenied sectionId={sectionId} requireSuperAdmin={requireSuperAdmin || requireManageUsers || requireAuditLog} />
  }

  return <ProtectedAppShell>{children}</ProtectedAppShell>
}

export function AccessDenied({ sectionId, requireSuperAdmin = false }: { sectionId?: string; requireSuperAdmin?: boolean }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const body = user
    ? sectionId
      ? 'Your staff account is active, but it does not have permission to manage this section.'
      : requireSuperAdmin
        ? 'This page is limited to super administrators.'
        : t('accessDeniedBody')
    : 'Sign in with an administrator-provisioned staff account.'

  return (
    <section className="admin-page">
      <PageMessage
        title={t('accessDeniedTitle')}
        body={body}
      />
      <Link className="secondary-button" to="/ied">
        {t('returnToPublicHub')}
      </Link>
    </section>
  )
}

function NotFoundPage() {
  const { t } = useLanguage()

  return (
    <section className="missing-page">
      <PageMessage title={t('notFoundTitle')} body={t('notFoundBody')} />
      <div className="hero-actions">
        <Link className="primary-button blue" to="/ied">
          {t('returnToPublicHub')}
        </Link>
        <Link className="secondary-button" to="/eep/showcase">
          {t('browseProjects')}
        </Link>
      </div>
    </section>
  )
}

function HomePage() {
  const { t } = useLanguage()
  const { contentItems, loading: contentLoading, error: contentError } = useAllPublishedContentItems()
  const iedContentItems = useMemo(() => contentItems.filter((item) => item.sectionId === 'ied'), [contentItems])
  const hasPublishedIedContent = !contentLoading && !contentError && iedContentItems.length > 0

  return (
    <section className="hub-page ied-home">
      <PremiumHero
        eyebrow={t('iedHeroEyebrow')}
        title={t('iedHeroTitle')}
        lead={t('iedHeroEmphasis')}
        body={t('iedHeroBody')}
        desktopImage={premiumAssets.heroes.home}
        mobileImage={premiumAssets.mobile.home}
        imageAlt={t('iedHeroImageAlt')}
        theme="ied"
        className="home-premium-hero"
        imagePosition="72% center"
        actions={[
          { label: `${t('enterEep')} →`, to: '/eep', variant: 'blue' },
          { label: `${t('enterEsl')} →`, to: '/esl', variant: 'teal' },
          ...(hasPublishedIedContent ? [{ label: `${t('viewLatestIedUpdates')} ↓`, to: '#ied-published-content', variant: 'outline' } as PremiumHeroAction] : []),
        ]}
      />

      <ScrollReveal className="premium-pathway-grid" stagger>
        <ProgrammePathwayCard
          to="/eep"
          title={t('eepLearningHub')}
          description={t('eepHomeDescription')}
          cta={`${t('exploreEepHub')} →`}
          desktopImage={premiumAssets.cards.eep}
          imageAlt={t('eepCardImageAlt')}
          theme="eep"
          kicker={t('eepProgramme')}
        />
        <ProgrammePathwayCard
          to="/esl"
          title={t('eslLearningHub')}
          description={t('eslHomeDescription')}
          cta={`${t('exploreEslHub')} →`}
          desktopImage={premiumAssets.cards.esl}
          imageAlt={t('eslCardImageAlt')}
          theme="esl"
          kicker={t('eslProgramme')}
        />
      </ScrollReveal>

      {hasPublishedIedContent && (
        <section className="content-module ied-published-content reveal" id="ied-published-content" aria-labelledby="ied-published-heading">
          <div className="section-heading ied-published-heading">
            <div>
              <h2 id="ied-published-heading">{t('latestFromIed')}</h2>
              <p>{t('latestFromIedSupport')}</p>
            </div>
          </div>
          <ContentLayout className="ied-published-grid" items={iedContentItems} />
        </section>
      )}
    </section>
  )
}

function EepShowcasePage() {
  const { projects, loading, error } = useProjects('approved', true, 'eep')
  const { t } = useLanguage()
  const location = useLocation()
  const [category, setCategory] = useState<'All Projects' | ProjectCategory>('All Projects')
  const querySearch = useMemo(() => new URLSearchParams(location.search).get('q') ?? '', [location.search])
  const [searchDraft, setSearchDraft] = useState(() => ({ source: location.search, value: querySearch }))
  const search = searchDraft.source === location.search ? searchDraft.value : querySearch
  const showingDemoPreview = !isFirebaseConfigured || (!loading && !error && projects.length === 0)
  const displayProjects = showingDemoPreview ? demoPreviewProjects : projects

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase()

    return displayProjects.filter((project) => {
      const matchesCategory = category === 'All Projects' || project.category === category
      const matchesSearch =
        !term ||
        [project.title, project.groupName, project.className, project.description, project.category]
          .join(' ')
          .toLowerCase()
          .includes(term)

      return matchesCategory && matchesSearch
    })
  }, [category, displayProjects, search])

  const featured = displayProjects.filter((project) => project.featured).slice(0, 4)
  const picks = displayProjects.filter((project) => project.studentPick).slice(0, 4)
  const latest = displayProjects.slice(0, 4)
  return (
    <>
      <PremiumHero
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        lead={t('heroSubtitle')}
        body={t('heroSupport')}
        desktopImage={premiumAssets.heroes.showcase}
        mobileImage={premiumAssets.mobile.showcase}
        imageAlt={t('showcaseHeroImageAlt')}
        theme="showcase"
        className="showcase-premium-hero"
        imagePosition="76% center"
        actions={[
          { label: `${t('submitToEepShowcase')} →`, to: '/eep/showcase/submit', variant: 'blue' },
          { label: `${t('browseProjects')} →`, to: '/eep/showcase#projects', variant: 'outline' },
        ]}
      />
      <div className="wave-divider" aria-hidden="true"></div>

      <section className="category-bar reveal" id="categories" aria-label={t('projectCategories')}>
        {(['All Projects', ...categories] as const).map((item) => (
          <button
            className={category === item ? 'category-pill active' : 'category-pill'}
            key={item}
            type="button"
            onClick={() => setCategory(item)}
          >
            <span>{categoryIcons[item]}</span>
            {t(categoryTranslationKeys[item])}
          </button>
        ))}
      </section>

      <section className="content-grid showcase-dashboard reveal" id="projects">
        <div className="gallery-main">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{showingDemoPreview ? t('demoPreview') : t('approvedShowcase')}</p>
              <h2>{t('allProjectsTitle')}</h2>
            </div>
            <input
              className="search"
              value={search}
              onChange={(event) => setSearchDraft({ source: location.search, value: event.target.value })}
              placeholder={t('gallerySearchPlaceholder')}
              type="search"
            />
          </div>

          {loading && <PageMessage title={t('loadingShowcaseTitle')} body={t('loadingShowcaseBody')} />}
          {error && <PageMessage title={t('couldNotLoadProjects')} body={error} />}
          {!loading && !filteredProjects.length && (
            <div className="empty-showcase">
              <h2>{t('noApprovedTitle')}</h2>
              <p>{t('noApprovedBody')}</p>
              <div className="hero-actions">
                <Link className="primary-button blue" to="/eep/showcase/submit">
                  {t('submitToEepShowcase')}
                </Link>
                <Link className="secondary-button" to="/login">
                  {t('teacherLogin')}
                </Link>
              </div>
            </div>
          )}

          <div className="project-grid">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        <aside className="sidebar">
          <Spotlight titleKey="featuredProjects" projects={featured} />
          <Spotlight titleKey="studentPicks" projects={picks} />
          <Spotlight titleKey="latestAdditions" projects={latest} />
        </aside>
      </section>

      <section className="impact-strip reveal">
        <div>
          <UiText id="impactTitle" as="h2" />
          <UiText id="impactBody" as="p" />
        </div>
        <article>
          <span>50+</span>
          <p>{t('impactWebsites')}</p>
        </article>
        <article>
          <span>20+</span>
          <p>{t('impactTeams')}</p>
        </article>
        <article>
          <span>{t('impactReal')}</span>
          <p>{t('impactImpact')}</p>
        </article>
      </section>
    </>
  )
}

function HubPageView({ sectionId }: { sectionId: string }) {
  const config = hubConfigById[sectionId]
  const { user } = useAuth()
  const { hubPage, loading, error } = useHubPage(sectionId)
  const { contentItems, loading: contentLoading, error: contentError } = useContentItems(sectionId, 'published')
  const { projects } = useProjects('approved', sectionId === 'eep', 'eep')

  if (!config || !hubPage) {
    return <PageMessage title="Hub not found" body="This learning hub is not available." />
  }

  const childConfigs = config.children.map((childId) => hubConfigById[childId]).filter(Boolean)
  const featured = contentItems.filter((item) => item.featured || item.type === 'studentWork').slice(0, 3)
  const announcements = contentItems.filter((item) => item.type === 'announcement').slice(0, 3)
  const events = contentItems.filter((item) => item.type === 'event').slice(0, 4)
  const videos = contentItems.filter((item) => item.type === 'video').slice(0, 3)
  const resources = contentItems.filter((item) => item.type === 'resource' || item.type === 'link').slice(0, 4)
  const recent = contentItems.slice(0, 5)
  const eepProjects = (projects.length ? projects : demoPreviewProjects).filter((project) => project.featured).slice(0, 3)
  const displayHubPage = withSubmissionAction(getDisplayHubPage(config.sectionId, hubPage, Boolean(user)), config.sectionId)
  const programCards = getProgramCards(config.sectionId)
  const subjectHighlights = getSubjectHighlights(config.sectionId)

  return (
    <section className={config.kind === 'subject' ? 'performance-page hub-page' : 'department-page hub-page'}>
      <HubHero
        hubPage={displayHubPage}
        eyebrow={config.eyebrow}
        loading={loading}
        error={error}
        visual={getHeroVisual(config.sectionId)}
      />

      {programCards.length > 0 && (
        <div className="programme-feature-grid reveal reveal-stagger">
          {programCards.map((card) => (
            <ProgrammeFeatureCard card={card} key={card.title} />
          ))}
        </div>
      )}

      {!programCards.length && childConfigs.length > 0 && (
        <div className="hub-route-grid subject-grid reveal reveal-stagger">
          {childConfigs.map((childConfig) => (
            <ProgrammeFeatureCard
              card={{
                title: childConfig.sectionName,
                kicker: 'Subject Hub',
                body: childConfig.defaults.subtitle,
                image: getCardImage(childConfig.sectionId),
                imageAlt: `${childConfig.sectionName} learning visual`,
                primaryLabel: 'Enter Hub',
                primaryUrl: childConfig.route,
                tone: 'esl',
              }}
              key={childConfig.sectionId}
            />
          ))}
        </div>
      )}

      {config.kind === 'subject' && (
        <SubjectIntroStrip
          sectionId={config.sectionId}
          highlights={subjectHighlights}
          accent={config.defaults.accent}
        />
      )}

      {sectionId === 'eep' && (
        <section className="hub-band reveal">
          <div>
            <p className="eyebrow">EEP Workflow</p>
            <h2>Student websites from submission to public showcase</h2>
            <p>
              The existing submit, pending, approve, and public gallery workflow is still active for EEP projects.
            </p>
          </div>
          <article>
            <span>{eepProjects.length || '0'}</span>
            <p>featured projects ready to browse</p>
          </article>
          <article>
            <span>EN / 繁中</span>
            <p>Language toggle remains available across the app</p>
          </article>
        </section>
      )}

      {contentLoading && <PageMessage title={`Loading ${hubPage.title}`} body="Fetching published hub content..." />}
      {contentError && <PageMessage title="Could not load hub content" body={contentError} />}

      {!contentLoading && !contentError && !contentItems.length && config.kind === 'subject' && (
        <EmptySubjectState sectionId={config.sectionId} sectionName={config.sectionName} showAdminLink={Boolean(user)} />
      )}

      <div className="performance-layout reveal">
        <div className="performance-main">
          <ContentSection title="Latest Updates" items={announcements} />
          <ContentSection title="Featured Work" items={featured} highlight />
          <ContentSection title="Videos / Performances" items={videos} />
        </div>
        <div className="performance-sidebar">
          <ContentSection title="Upcoming Events" items={events} compact />
          <ContentSection title="Resources / Web Links" items={resources} compact />
          <ContentSection title="Recent Updates" items={recent} compact />
          {sectionId === 'eep' && (
            <section className="content-module">
              <div className="section-heading">
                <h2>EEP Showcase</h2>
              </div>
              <Link className="primary-button blue" to="/eep/showcase">
                Browse Student Projects
              </Link>
            </section>
          )}
        </div>
      </div>
    </section>
  )
}

interface ProgrammeFeature {
  title: string
  kicker: string
  body: string
  image: string
  imageAlt: string
  primaryLabel?: string
  primaryUrl?: string
  secondaryLabel?: string
  secondaryUrl?: string
  tone: 'eep' | 'esl' | 'science' | 'language' | 'performance' | 'social'
}

function ProgrammeFeatureCard({ card }: { card: ProgrammeFeature }) {
  if (card.tone === 'science' || card.tone === 'language' || card.tone === 'performance' || card.tone === 'social') {
    return (
      <SubjectPathwayCard
        to={card.primaryUrl ?? '#'}
        title={card.title}
        description={card.body}
        image={card.image}
        imageAlt={card.imageAlt}
        cta={card.primaryLabel ?? 'Enter Hub'}
        theme={card.tone}
      />
    )
  }

  const theme = card.tone === 'esl' ? 'teal' : 'blue'

  return (
    <PremiumImageCard
      title={card.title}
      kicker={card.kicker}
      body={card.body}
      image={card.image}
      imageAlt={card.imageAlt}
      actionLabel={card.primaryLabel ?? 'Coming soon'}
      actionTo={card.primaryUrl}
      secondaryLabel={card.secondaryLabel}
      secondaryTo={card.secondaryUrl}
      theme={theme}
    />
  )
}

function SubjectIntroStrip({
  sectionId,
  highlights,
  accent,
}: {
  sectionId: string
  highlights: string[]
  accent: string
}) {
  return (
    <section
      className={`subject-intro-strip reveal subject-strip-${sectionId}`}
      style={{ '--subject-accent': accent } as CSSProperties}
    >
      <div>
        <p className="eyebrow">Learning Focus</p>
        <h2>{getSubjectFocusTitle(sectionId)}</h2>
        <p>{getSubjectFocusBody(sectionId)}</p>
      </div>
      <div className="subject-focus-list">
        {highlights.map((highlight) => (
          <span key={highlight}>{highlight}</span>
        ))}
      </div>
    </section>
  )
}

function EmptySubjectState({
  sectionId,
  sectionName,
  showAdminLink,
}: {
  sectionId: string
  sectionName: string
  showAdminLink: boolean
}) {
  const copy = getSubjectEmptyCopy(sectionId, sectionName)

  return (
    <section className={`empty-subject-state reveal subject-strip-${sectionId}`}>
      <div className="empty-subject-icon" aria-hidden="true">
        <span>{copy.badge}</span>
      </div>
      <div>
        <p className="eyebrow">Published Updates</p>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
        {showAdminLink && (
          <Link className="secondary-button" to={`/admin/hubs/${sectionId}`}>
            Manage this hub
          </Link>
        )}
      </div>
    </section>
  )
}

function getDisplayHubPage(sectionId: string, hubPage: HubPageData, isAuthenticated: boolean): HubPageData {
  if (sectionId === 'eep') {
    return {
      ...hubPage,
      title: 'EEP Learning Hub',
      subtitle: 'Books, stories, language activities, creative work, and student publishing.',
      intro: 'Explore stories, books, reading, vocabulary, writing, discussion, creative responses, class challenges, and student projects from across EEP.',
      description:
        'The Student Website Showcase remains part of EEP, now placed within the wider Projects & Showcases pathway.',
      primaryButtonText: 'Browse Showcase',
      primaryButtonUrl: '/eep/showcase',
      secondaryButtonText: 'Submit Project',
      secondaryButtonUrl: '/eep/showcase/submit',
    }
  }

  if (sectionId === 'esl') {
    return {
      ...hubPage,
      title: 'ESL Learning Hub',
      subtitle: 'Subject learning, resources, activities, and updates across the ESL programme.',
      intro: 'Explore Science, Language Arts, Performance Arts, and Social Studies learning spaces.',
      description:
        'Each subject hub gathers class updates, resources, student work, events, media links, and reusable learning materials.',
      primaryButtonText: 'Science',
      primaryButtonUrl: '/esl/science',
      secondaryButtonText: 'Performance Arts',
      secondaryButtonUrl: '/esl/performance-arts',
    }
  }

  if (sectionId.startsWith('esl-') && !isAuthenticated) {
    return {
      ...hubPage,
      secondaryButtonText: '',
      secondaryButtonUrl: '',
    }
  }

  return hubPage
}

function getProgramCards(sectionId: string): ProgrammeFeature[] {
  if (sectionId === 'eep') {
    return [
      {
        title: 'Books & Stories',
        kicker: 'EEP Reading',
        body: 'Class reading, story worlds, book responses, recommendations, and shared reading moments.',
        image: premiumAssets.cards.eep,
        imageAlt: 'Books and story materials for EEP reading',
        primaryLabel: 'Explore Books & Stories',
        tone: 'eep',
      },
      {
        title: 'Reading & Vocabulary',
        kicker: 'Language Growth',
        body: 'Useful word work, reading routines, vocabulary practice, and language-building activities.',
        image: premiumAssets.cards.languageArts,
        imageAlt: 'Reading and vocabulary learning materials',
        primaryLabel: 'Explore Reading & Vocabulary',
        tone: 'eep',
      },
      {
        title: 'Creative Work',
        kicker: 'Student Voice',
        body: 'Creative writing, multimedia responses, posters, presentations, and student-made class work.',
        image: premiumAssets.cards.performanceArts,
        imageAlt: 'Creative performance and expression materials',
        primaryLabel: 'Explore Creative Work',
        tone: 'eep',
      },
      {
        title: 'Projects & Showcases',
        kicker: 'Public Work',
        body: 'Student projects and the existing Student Website Showcase browse and submission flow.',
        image: premiumAssets.cards.showcase,
        imageAlt: 'Digital student showcase publishing visual',
        primaryLabel: 'Explore Projects & Showcases',
        primaryUrl: '/eep/showcase',
        secondaryLabel: 'Submit Project',
        secondaryUrl: '/eep/showcase/submit',
        tone: 'eep',
      },
    ]
  }

  if (sectionId === 'esl') {
    return [
      {
        title: 'Science',
        kicker: 'Subject Hub',
        body: 'Inquiry, experiments, vocabulary, explanations, and evidence-based student thinking.',
        image: premiumAssets.cards.science,
        imageAlt: 'Science experiments and inquiry visual',
        primaryLabel: 'Enter Science',
        primaryUrl: '/esl/science',
        tone: 'science',
      },
      {
        title: 'Language Arts',
        kicker: 'Subject Hub',
        body: 'Reading, writing, speaking, discussion, craft, reflection, and published responses.',
        image: premiumAssets.cards.languageArts,
        imageAlt: 'Language arts reading and writing visual',
        primaryLabel: 'Enter Language Arts',
        primaryUrl: '/esl/language-arts',
        tone: 'language',
      },
      {
        title: 'Performance Arts',
        kicker: 'Subject Hub',
        body: 'Voice, movement, story, rehearsal, performance reflection, and public sharing.',
        image: premiumAssets.cards.performanceArts,
        imageAlt: 'Performance arts rehearsal and storytelling visual',
        primaryLabel: 'Enter Performance Arts',
        primaryUrl: '/esl/performance-arts',
        tone: 'performance',
      },
      {
        title: 'Social Studies',
        kicker: 'Subject Hub',
        body: 'Culture, geography, history, discussion, perspective-taking, and civic learning.',
        image: premiumAssets.cards.socialStudies,
        imageAlt: 'Social studies geography and culture visual',
        primaryLabel: 'Enter Social Studies',
        primaryUrl: '/esl/social-studies',
        tone: 'social',
      },
    ]
  }

  return []
}

function getSubjectHighlights(sectionId: string) {
  const highlights: Record<string, string[]> = {
    'esl-science': ['Inquiry', 'Experiments', 'Evidence', 'Academic Vocabulary'],
    'esl-language-arts': ['Reading', 'Writing Craft', 'Discussion', 'Published Responses'],
    'esl-performance-arts': ['Voice', 'Movement', 'Rehearsal', 'Reflection'],
    'esl-social-studies': ['Culture', 'Geography', 'History', 'Perspective'],
  }

  return highlights[sectionId] ?? []
}

function getSubjectFocusTitle(sectionId: string) {
  const titles: Record<string, string> = {
    'esl-science': 'Investigate, explain, and connect evidence.',
    'esl-language-arts': 'Read closely, write clearly, and share ideas.',
    'esl-performance-arts': 'Build expressive English through performance.',
    'esl-social-studies': 'Understand communities, places, and perspectives.',
  }

  return titles[sectionId] ?? 'Explore learning through English.'
}

function getSubjectFocusBody(sectionId: string) {
  const bodies: Record<string, string> = {
    'esl-science':
      'Students use English to ask questions, describe processes, explain evidence, and connect scientific thinking to the world around them.',
    'esl-language-arts':
      'Students develop voice and confidence through purposeful reading, discussion, writing craft, feedback, and publication.',
    'esl-performance-arts':
      'Students practice voice, movement, story, audience awareness, and reflection through carefully prepared performance work.',
    'esl-social-studies':
      'Students use English to compare cultures, interpret places and events, and discuss civic ideas with care and clarity.',
  }

  return bodies[sectionId] ?? 'Learning updates, resources, and student work will gather here as the hub grows.'
}

function getSubjectEmptyCopy(sectionId: string, sectionName: string) {
  const copy: Record<string, { title: string; body: string; badge: string }> = {
    'esl-science': {
      title: 'Science updates are on the way',
      body: 'New Science learning resources will appear here as they are published.',
      badge: 'SCI',
    },
    'esl-language-arts': {
      title: 'Language Arts updates are on the way',
      body: 'New Language Arts learning resources will appear here as they are published.',
      badge: 'LA',
    },
    'esl-performance-arts': {
      title: 'Performance Arts updates are on the way',
      body: 'New Performance Arts learning resources will appear here as they are published.',
      badge: 'PA',
    },
    'esl-social-studies': {
      title: 'Social Studies updates are on the way',
      body: 'New Social Studies learning resources will appear here as they are published.',
      badge: 'SS',
    },
  }

  return (
    copy[sectionId] ?? {
      title: `${sectionName} updates are on the way`,
      body: `New ${sectionName} learning resources will appear here as they are published.`,
      badge: 'NEW',
    }
  )
}

function HubHero({
  hubPage,
  eyebrow,
  loading,
  error,
  visual,
}: {
  hubPage: HubPageData
  eyebrow: string
  loading?: boolean
  error?: string
  visual?: string
}) {
  const heroAssets = getHeroAssets(visual)
  const actions: PremiumHeroAction[] = []

  if (hubPage.primaryButtonText && hubPage.primaryButtonUrl) {
    actions.push({
      label: heroButtonLabel(hubPage.primaryButtonText),
      to: hubPage.primaryButtonUrl,
      variant: visual === 'esl' || visual === 'esl-science' ? 'teal' : 'blue',
    })
  }

  if (hubPage.secondaryButtonText && hubPage.secondaryButtonUrl) {
    actions.push({
      label: heroButtonLabel(hubPage.secondaryButtonText),
      to: hubPage.secondaryButtonUrl,
      variant: 'outline',
    })
  }

  return (
    <>
      <PremiumHero
        eyebrow={eyebrow}
        title={hubPage.title}
        lead={hubPage.subtitle}
        body={`${hubPage.intro}${hubPage.description ? ` ${hubPage.description}` : ''}`}
        desktopImage={heroAssets.desktop}
        mobileImage={heroAssets.mobile}
        imageAlt={heroAssets.alt}
        theme={heroAssets.theme}
        imagePosition={heroAssets.imagePosition}
        darkOverlay={heroAssets.darkOverlay}
        actions={actions}
      />
      {loading && <p className="muted premium-hero-status">Loading saved hub settings...</p>}
      {error && <p className="form-message premium-hero-status">{error}</p>}
    </>
  )
}

function getHeroVisual(sectionId: string) {
  if (sectionId === 'eep' || sectionId === 'esl' || sectionId.startsWith('esl-')) {
    return sectionId
  }

  return undefined
}

function heroButtonLabel(label: string) {
  return label.includes('→') ? label : `${label} →`
}

function getHeroAssets(sectionId = 'ied') {
  const assets: Record<string, { desktop: string; mobile: string; alt: string; theme: string; imagePosition: string; darkOverlay?: boolean }> = {
    ied: {
      desktop: premiumAssets.heroes.home,
      mobile: premiumAssets.mobile.home,
      alt: 'International Education Department learning showcase visual',
      theme: 'ied',
      imagePosition: '72% center',
    },
    eep: {
      desktop: premiumAssets.heroes.eep,
      mobile: premiumAssets.mobile.eep,
      alt: 'EEP books, stories, language activities, and creative work',
      theme: 'eep',
      imagePosition: '76% center',
    },
    esl: {
      desktop: premiumAssets.heroes.esl,
      mobile: premiumAssets.mobile.esl,
      alt: 'ESL subject learning across science, language arts, performance arts, and social studies',
      theme: 'esl',
      imagePosition: '76% center',
    },
    'esl-science': {
      desktop: premiumAssets.heroes.science,
      mobile: premiumAssets.mobile.science,
      alt: 'Science inquiry, experiments, ecosystems, and evidence visual',
      theme: 'science',
      imagePosition: '76% center',
    },
    'esl-language-arts': {
      desktop: premiumAssets.heroes.languageArts,
      mobile: premiumAssets.mobile.languageArts,
      alt: 'Language Arts reading, writing, speaking, stories, and discussion visual',
      theme: 'language',
      imagePosition: '76% center',
    },
    'esl-performance-arts': {
      desktop: premiumAssets.heroes.performanceArts,
      mobile: premiumAssets.mobile.performanceArts,
      alt: 'Performance Arts rehearsal, voice, movement, storytelling, and reflection visual',
      theme: 'performance',
      imagePosition: '77% center',
      darkOverlay: true,
    },
    'esl-social-studies': {
      desktop: premiumAssets.heroes.socialStudies,
      mobile: premiumAssets.mobile.socialStudies,
      alt: 'Social Studies geography, history, culture, communities, and perspective visual',
      theme: 'social',
      imagePosition: '77% center',
    },
  }

  return assets[sectionId] ?? assets.ied
}

function getCardImage(sectionId: string) {
  const images: Record<string, string> = {
    eep: premiumAssets.cards.eep,
    esl: premiumAssets.cards.esl,
    'esl-science': premiumAssets.cards.science,
    'esl-language-arts': premiumAssets.cards.languageArts,
    'esl-performance-arts': premiumAssets.cards.performanceArts,
    'esl-social-studies': premiumAssets.cards.socialStudies,
  }

  return images[sectionId] ?? premiumAssets.cards.home
}

function ContentSection({
  title,
  items,
  compact = false,
  highlight = false,
}: {
  title: string
  items: ContentItem[]
  compact?: boolean
  highlight?: boolean
}) {
  if (!items.length) {
    return null
  }

  return (
    <section className={highlight ? 'content-module highlight' : 'content-module'}>
      <div className="section-heading">
        <h2>{title}</h2>
      </div>
      <ContentLayout compact={compact} items={items} />
    </section>
  )
}

function confirmDelete(message: string) {
  return window.confirm(message)
}

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useLanguage()

  return (
    <article className="project-card">
      <img
        src={projectImageSrc(project)}
        alt={`${project.title} preview`}
        onError={(event) => handleProjectImageError(event, project)}
      />
      <div className="project-card-body">
        <span className="badge">{t(categoryTranslationKeys[project.category])}</span>
        <h2>{project.title}</h2>
        <p className="meta">
          {project.groupName} / {project.className}
        </p>
        <p>{project.description}</p>
        <div className="card-actions">
          <a className="primary-button blue" href={project.googleSitesUrl} target="_blank" rel="noreferrer">
            {t('viewSite')}
          </a>
          <Link className="secondary-button" to={`/projects/${project.id}`}>
            {t('details')}
          </Link>
        </div>
      </div>
    </article>
  )
}

function Spotlight({ titleKey, projects }: { titleKey: TranslationKey; projects: Project[] }) {
  const { t } = useLanguage()

  return (
    <section className="spotlight reveal">
      <h2>{t(titleKey)}</h2>
      {projects.length ? (
        projects.map((project) => (
          <Link className="spotlight-item" key={project.id} to={`/projects/${project.id}`}>
            <img
              src={projectImageSrc(project)}
              alt={`${project.title} thumbnail`}
              onError={(event) => handleProjectImageError(event, project)}
            />
            <span>
              <strong>{project.title}</strong>
              <small>{project.groupName}</small>
            </span>
          </Link>
        ))
      ) : (
        <p className="muted">{t('noProjectsYet')}</p>
      )}
    </section>
  )
}

function ProjectDetailPage() {
  const { t } = useLanguage()
  const { id } = useParams()
  const { projects, loading } = useProjects('approved', true)
  const showingDemoPreview = !isFirebaseConfigured || (!loading && projects.length === 0)
  const displayProjects = showingDemoPreview ? demoPreviewProjects : projects
  const project = displayProjects.find((item) => item.id === id)

  if (loading) {
    return <PageMessage title={t('loadingProjectTitle')} body={t('loadingProjectBody')} />
  }

  if (!project) {
    return <PageMessage title={t('projectNotFoundTitle')} body={t('projectNotFoundBody')} />
  }

  return (
    <section className="detail-page page-panel">
      <img
        className="detail-image"
        src={projectImageSrc(project)}
        alt={`${project.title} project visual`}
        onError={(event) => handleProjectImageError(event, project)}
      />
      <div className="detail-content">
        <span className="badge">{t(categoryTranslationKeys[project.category])}</span>
        <h1>{project.title}</h1>
        <p className="meta">
          {project.groupName} / {project.className}
        </p>
        <dl className="detail-list">
          <div>
            <dt>{t('members')}</dt>
            <dd>{project.members}</dd>
          </div>
          <div>
            <dt>{t('description')}</dt>
            <dd>{project.description}</dd>
          </div>
          <div>
            <dt>{t('audience')}</dt>
            <dd>{project.audience}</dd>
          </div>
          <div>
            <dt>{t('impact')}</dt>
            <dd>{project.impact}</dd>
          </div>
        </dl>
        <a className="primary-button" href={project.googleSitesUrl} target="_blank" rel="noreferrer">
          {t('openGoogleSites')}
        </a>
      </div>
    </section>
  )
}

function SubmitPage({ destination }: { destination: SubmissionDestinationId }) {
  const { t } = useLanguage()
  const submissionDestination = submissionDestinations[destination]
  const destinationConfig = hubConfigById[submissionDestination.sectionId]
  const { hubPage } = useHubPage(submissionDestination.sectionId)
  const submissionsEnabled = hubPage?.submissionsEnabled ?? destinationConfig?.defaults.submissionsEnabled ?? false
  const [project, setProject] = useState<ProjectInput>(() => ({
    ...emptyProject,
    sectionId: submissionDestination.sectionId,
  }))
  const [permission, setPermission] = useState(false)
  const [website, setWebsite] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')

    if (saving) {
      return
    }

    if (website.trim()) {
      setMessage('Submission could not be accepted.')
      return
    }

    if (!submissionsEnabled) {
      setMessage(t('submissionsClosedBody'))
      return
    }

    const scopedProject = { ...project, sectionId: submissionDestination.sectionId }
    const validationErrors = validateProjectSubmission(scopedProject, permission)
    if (validationErrors.length) {
      setMessage(validationErrors.join(' '))
      return
    }

    const now = Date.now()
    const fingerprint = projectSubmissionFingerprint(scopedProject)
    const storagePrefix = `ied-last-submission:${submissionDestination.sectionId}`
    const lastSubmissionAt = Number(window.localStorage.getItem(`${storagePrefix}:at`) ?? 0)
    const lastFingerprint = window.localStorage.getItem(`${storagePrefix}:fingerprint`)

    if (lastFingerprint === fingerprint && now - lastSubmissionAt < 10 * 60 * 1000) {
      setMessage('This project was already submitted recently. Please wait before submitting it again.')
      return
    }

    if (now - lastSubmissionAt < 15 * 1000) {
      setMessage('Please wait a few seconds before sending another submission.')
      return
    }

    setSaving(true)
    try {
      await createProject({
        ...scopedProject,
        sectionId: submissionDestination.sectionId,
        status: 'pending',
        featured: false,
        studentPick: false,
        publiclyVisible: false,
      })
      window.localStorage.setItem(`${storagePrefix}:at`, String(Date.now()))
      window.localStorage.setItem(`${storagePrefix}:fingerprint`, fingerprint)
      setProject({ ...emptyProject, sectionId: submissionDestination.sectionId })
      setPermission(false)
      setMessage(submissionDestination.success)
    } catch (error) {
      setMessage(
        navigator.onLine
          ? error instanceof Error
            ? error.message
            : t('submissionFailed')
          : 'You appear to be offline. Your form data has been kept; please try again when the connection returns.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="form-page page-panel">
      <PremiumHero
        eyebrow={t('submitPageEyebrow')}
        title={submissionDestination.title}
        lead={submissionDestination.body}
        body="Use the guide below, prepare your Google Sites project, then send it for teacher review."
        desktopImage={premiumAssets.heroes.showcase}
        mobileImage={premiumAssets.mobile.showcase}
        imageAlt="Student website submission and digital publishing visual"
        theme="showcase"
        className="submit-premium-hero"
        imagePosition="76% center"
        actions={[{ label: t('browseProjects'), to: '/eep/showcase#projects', variant: 'outline' }]}
      />
      <StudentGuideEmbed />
      {!submissionsEnabled && (
        <PageMessage title={t('submissionsClosedTitle')} body={t('submissionsClosedBody')} />
      )}
      <div className="submit-form-heading">
        <UiText id="submitFormEyebrow" as="p" className="eyebrow" />
        <UiText id="submitFormTitle" as="h2" />
        <UiText id="submitFormBody" as="p" />
        <p className="submission-destination">
          <strong>Submitting to:</strong> {submissionDestination.name}
        </p>
      </div>
      <ProjectForm
        disabled={saving || !submissionsEnabled}
        project={project}
        onChange={(nextProject) => setProject({ ...nextProject, sectionId: submissionDestination.sectionId })}
        onSubmit={submit}
        submitLabel={saving ? t('submitting') : t('submitProject')}
      >
        <label className="honeypot-field" aria-hidden="true">
          Website
          <input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
        <label className="checkbox-row" id="submission-permission">
          <input
            checked={permission}
            disabled={saving}
            onChange={(event) => setPermission(event.target.checked)}
            required
            type="checkbox"
          />
          <span>{t('permissionCheckbox')}</span>
        </label>
      </ProjectForm>
      {message && <p className="form-message" aria-live="polite">{message}</p>}
    </section>
  )
}

function StudentGuideEmbed() {
  const { t } = useLanguage()

  return (
      <section className="student-guide reveal">
      <div className="student-guide-copy">
        <UiText id="studentGuideEyebrow" as="p" className="eyebrow" />
        <UiText id="studentGuideTitle" as="h2" />
        <UiText id="studentGuideBody" as="p" />
        <div className="student-resource-actions">
          <a className="sites-link" href="https://sites.google.com/new" target="_blank" rel="noreferrer">
            <img src="/google-sites-logo.svg" alt="" />
            {t('openGoogleSitesShort')}
          </a>
          <a className="pdf-link" href="/EEPWebPlan.pdf" download>
            {t('downloadPdf')}
          </a>
        </div>
      </div>
      <div className="prezi-frame">
        {studentGuidePreziUrl ? (
          <iframe
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            src={studentGuidePreziUrl}
            title={t('preziTitle')}
          />
        ) : (
          <div className="prezi-placeholder">
            <strong>{t('preziReady')}</strong>
            <span>{t('preziAddLink')}</span>
          </div>
        )}
      </div>
    </section>
  )
}

function AboutPage() {
  const { t } = useLanguage()

  return (
    <section className="about-page">
      <PremiumHero
        eyebrow={t('aboutEyebrow')}
        title={t('aboutTitle')}
        lead={t('aboutBody')}
        body="EEP and ESL create connected pathways for communication, confidence, public work, and international learning."
        desktopImage={premiumAssets.heroes.about}
        mobileImage={premiumAssets.mobile.about}
        imageAlt={t('campusAlt')}
        theme="ied"
        className="about-premium-hero"
        imagePosition="70% center"
        actions={[
          { label: t('thuhsWebsite'), to: 'https://www.hn.thu.edu.tw/', variant: 'blue' },
          { label: t('exploreProjects'), to: '/eep/showcase#projects', variant: 'outline' },
        ]}
      />

      <section className="ied-stats reveal" aria-label={t('schoolAtGlance')}>
        <article>
          <span>1958</span>
          <p>{t('schoolRoots')}</p>
        </article>
        <article>
          <span>K-12+</span>
          <p>{t('learningPathway')}</p>
        </article>
        <article>
          <span>IED</span>
          <p>{t('globalLearning')}</p>
        </article>
      </section>

      <div className="about-grid ied-grid reveal reveal-stagger">
        <article>
          <UiText id="globalCommunicationTitle" as="h2" />
          <UiText id="globalCommunicationBody" as="p" />
        </article>
        <article>
          <UiText id="digitalCreativityTitle" as="h2" />
          <UiText id="digitalCreativityBody" as="p" />
        </article>
        <article>
          <UiText id="communityAudiencesTitle" as="h2" />
          <UiText id="communityAudiencesBody" as="p" />
        </article>
        <article>
          <UiText id="confidenceTitle" as="h2" />
          <UiText id="confidenceBody" as="p" />
        </article>
      </div>

      <section className="about-showcase-link reveal">
        <div>
          <UiText id="studentWebsites" as="p" className="eyebrow" />
          <UiText id="publicWorkTitle" as="h2" />
          <UiText id="publicWorkBody" as="p" />
        </div>
        <Link className="primary-button blue" to="/eep/showcase#projects">
          {t('exploreProjects')}
        </Link>
      </section>
    </section>
  )
}

export function LoginPage() {
  const { login, user, adminUser } = useAuth()
  const { t } = useLanguage()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [signingIn, setSigningIn] = useState(false)

  if (!isFirebaseConfigured) {
    return (
      <section className="login-page">
        <div className="login-card">
          <FirebaseMissingPanel />
        </div>
      </section>
    )
  }

  if (user && adminUser?.mustChangePassword) {
    return <Navigate to="/admin/change-password" replace />
  }

  if (user) {
    return <Navigate to="/admin" replace />
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSigningIn(true)

    try {
      await login(username, password)
    } catch (loginError) {
      setError(mapAuthError(loginError))
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <section className="login-page">
      <form className="login-card" onSubmit={submit}>
        <PageHeading
          eyebrow={t('teacherAccess')}
          title={t('loginTitle')}
          body="Sign in with the username and password issued by an IED Hub administrator."
        />
        <label>
          Username
          <input
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            type="text"
          />
        </label>
        <label>
          {t('password')}
          <input
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
          />
        </label>
        <button className="primary-button" type="submit" disabled={signingIn}>
          {signingIn ? 'Signing in...' : t('signIn')}
        </button>
        <p className="muted">Forgot your password? Contact an IED Hub administrator.</p>
        <div aria-live="polite">
          {error && <p className="form-message">{error}</p>}
        </div>
      </form>
    </section>
  )
}

function PasswordChangePage() {
  const { user, adminUser, changePassword, logout } = useAuth()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminUser && !adminUser.mustChangePassword) {
    return <Navigate to="/admin" replace />
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (newPassword.length < 12) {
      setError('Use at least 12 characters for the new staff password.')
      return
    }

    if (newPassword === currentPassword) {
      setError('Choose a new password that is different from the temporary password.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('The new password and confirmation do not match.')
      return
    }

    setSaving(true)

    try {
      await changePassword(currentPassword, newPassword)
      navigate('/login', { replace: true })
    } catch (changeError) {
      setError(mapAuthError(changeError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="login-page">
      <form className="login-card verification-card" onSubmit={submit}>
        <PageHeading
          eyebrow="Staff password"
          title="Change your temporary password"
          body="This staff account must set a new password before using the administration area."
        />
        <p className="submission-destination">
          Signed in as <strong>{adminUser?.username ?? user.email ?? 'this staff account'}</strong>
        </p>
        <label>
          Current temporary password
          <input
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            type="password"
          />
        </label>
        <label>
          New password
          <input
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            type="password"
          />
        </label>
        <label>
          Confirm new password
          <input
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
          />
        </label>
        <div className="admin-actions">
          <button className="primary-button blue" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Change password'}
          </button>
          <button className="secondary-button" type="button" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
        <div aria-live="polite">
          {error && <p className="form-message">{error}</p>}
        </div>
      </form>
    </section>
  )
}

function FirebaseMissingPanel() {
  const { t } = useLanguage()

  return (
    <div className="missing-config">
      <PageHeading
        eyebrow={t('localSetupNeeded')}
        title={t('firebaseMissingTitle')}
        body={t('firebaseMissingBody')}
      />
      <p>{t('firebaseEnvHelp')}</p>
      <code>VITE_FIREBASE_API_KEY</code>
      <code>VITE_FIREBASE_AUTH_DOMAIN</code>
      <code>VITE_FIREBASE_PROJECT_ID</code>
      <code>VITE_FIREBASE_APP_ID</code>
      <code>VITE_FIREBASE_STORAGE_BUCKET</code>
      <code>VITE_FIREBASE_MESSAGING_SENDER_ID</code>
    </div>
  )
}

function AdminDashboard() {
  const { adminUser, canManageProjects } = useAuth()
  const navigate = useNavigate()
  const { projects, loading: projectsLoading, error: projectsError } = useProjects(undefined, canManageProjects)
  const { t } = useLanguage()
  const [seedMessage, setSeedMessage] = useState('')
  const accessibleHubs = useMemo(() => getAccessibleHubConfigs(adminUser), [adminUser])
  const defaultWorkspaceHub = accessibleHubs.find((config) => config.sectionId !== 'ied') ?? accessibleHubs[0]
  const dashboardContextId = adminUser?.role === 'superAdmin' ? 'all' : defaultWorkspaceHub?.sectionId
  const navItems = useMemo(() => buildWorkspaceNav(adminUser, dashboardContextId), [adminUser, dashboardContextId])
  const contextOptions = useMemo(() => buildWorkspaceContextOptions(adminUser), [adminUser])
  const contextHubs = dashboardContextId === 'all'
    ? accessibleHubs
    : accessibleHubs.filter((config) => config.sectionId === dashboardContextId)
  const firstCreatableHub = accessibleHubs.find((config) => canCreateContentForAdmin(adminUser, config.sectionId))
  const hasAccessTo = (sectionId: string) => accessibleHubs.some((config) => config.sectionId === sectionId)
  const iedContent = useContentItems('ied', undefined, hasAccessTo('ied'))
  const eepContent = useContentItems('eep', undefined, hasAccessTo('eep'))
  const eslContent = useContentItems('esl', undefined, hasAccessTo('esl'))
  const scienceContent = useContentItems('esl-science', undefined, hasAccessTo('esl-science'))
  const languageArtsContent = useContentItems('esl-language-arts', undefined, hasAccessTo('esl-language-arts'))
  const performanceArtsContent = useContentItems('esl-performance-arts', undefined, hasAccessTo('esl-performance-arts'))
  const socialStudiesContent = useContentItems('esl-social-studies', undefined, hasAccessTo('esl-social-studies'))
  const contentBySection: Record<string, ReturnType<typeof useContentItems>> = {
    ied: iedContent,
    eep: eepContent,
    esl: eslContent,
    'esl-science': scienceContent,
    'esl-language-arts': languageArtsContent,
    'esl-performance-arts': performanceArtsContent,
    'esl-social-studies': socialStudiesContent,
  }
  const scopedContentItems = contextHubs.flatMap((config) => contentBySection[config.sectionId]?.contentItems ?? [])
  const contentLoading = contextHubs.some((config) => contentBySection[config.sectionId]?.loading)
  const contentError = contextHubs.map((config) => contentBySection[config.sectionId]?.error).find(Boolean)
  const showProjectSummary = shouldShowProjectSummary(canManageProjects, contextHubs.map((config) => config.sectionId), dashboardContextId)
  const showSeedAction = canManageProjects && canShowSeedSampleDataAction({
    firebaseConfigured: isFirebaseConfigured,
    emulatorMode: useFirebaseEmulators,
    developmentFlag: import.meta.env.VITE_SHOW_SAMPLE_DATA_ACTION === 'true',
  })
  const contentStats = buildWorkspaceContentStatusCounts(scopedContentItems)
  const recentContent = [...scopedContentItems]
    .sort((a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0))
    .slice(0, 5)
  const projectStats = {
    pending: projects.filter((project) => project.status === 'pending').length,
    approved: projects.filter((project) => project.status === 'approved').length,
    featured: projects.filter((project) => project.featured).length,
  }
  const needsAttention = [
    ...(showProjectSummary && projectStats.pending > 0 ? [{
      label: 'Pending submissions',
      count: projectStats.pending,
      to: submissionRoute(defaultWorkspaceHub?.sectionId ?? 'eep', 'pending'),
      helper: 'Student projects waiting for review.',
    }] : []),
    ...(contentStats.draft > 0 && defaultWorkspaceHub ? [{
      label: 'Draft content',
      count: contentStats.draft,
      to: workspaceHubViewUrl(defaultWorkspaceHub.sectionId, 'drafts'),
      helper: 'Unpublished items that may need finishing.',
    }] : []),
    ...(contentStats.scheduled > 0 && defaultWorkspaceHub ? [{
      label: 'Scheduled content',
      count: contentStats.scheduled,
      to: workspaceHubViewUrl(defaultWorkspaceHub.sectionId, 'scheduled'),
      helper: 'Upcoming posts queued for publication.',
    }] : []),
  ]
  const quickLinks = [
    ...(navItems.some((item) => item.to === '/admin/users') ? [{ label: 'Staff Access', to: '/admin/users' }] : []),
    ...(navItems.some((item) => item.to === '/admin/hubs') ? [{ label: 'Manage Hubs', to: '/admin/hubs' }] : []),
    ...(navItems.some((item) => item.to === '/admin/audit') ? [{ label: 'Audit & Activity', to: '/admin/audit' }] : []),
    { label: 'Public IED Hub', to: '/ied' },
  ]
  const workspaceLine = accessibleHubs.length
    ? `Working across ${dashboardContextId === 'all' ? 'all assigned hubs' : contextHubs.map((config) => config.sectionName).join(', ')}.`
    : 'No hubs are assigned to this account yet.'

  const runSeed = async () => {
    setSeedMessage(t('seedingSamples'))
    try {
      const count = await seedProjects()
      setSeedMessage(count ? t('createdSamples', { count }) : t('seedSkipped'))
    } catch (seedError) {
      setSeedMessage(seedError instanceof Error ? seedError.message : t('seedFailed'))
    }
  }

  return (
    <section className="admin-page workspace-dashboard">
      <div className="overview-topline">
        <div>
          <h1>Good to see you, {adminUser?.displayName || adminUser?.username || 'there'}.</h1>
          <p>{workspaceLine}</p>
        </div>
        <label className="overview-context-select">
          <span>Working context</span>
          <select
            aria-label="Working context"
            value={dashboardContextId ?? contextOptions[0]?.id ?? ''}
            onChange={(event) => {
              const option = contextOptions.find((item) => item.id === event.target.value)
              if (option) navigate(option.route)
            }}
          >
            {contextOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
      </div>

      {firstCreatableHub ? (
        <section className="overview-create-panel" aria-labelledby="overview-create-heading">
          <div>
            <h2 id="overview-create-heading">
              {dashboardContextId === 'all' ? 'Create content for a hub' : `Create content for ${firstCreatableHub.sectionName}`}
            </h2>
            <p>Draft a hub update, resource, event, link, media item, or student-work story using the protected content workflow.</p>
            <Link className="primary-button blue" to={workspaceHubViewUrl(firstCreatableHub.sectionId, 'create')}>Create Content</Link>
          </div>
          <img src="/images/ied-premium/workspace/luce-chapel-hero.webp" alt="Luce Chapel on the Tunghai University campus" />
        </section>
      ) : (
        <EmptyState
          title="No publishing action is available yet."
          body="This account is active, but it does not currently have permission to create hub content."
        />
      )}

      {seedMessage && <p className="form-message">{seedMessage}</p>}
      {contentLoading && <PageMessage title={t('loadingDashboardTitle')} body={t('loadingDashboardBody')} />}
      {contentError && <PageMessage title="Could not load content summary" body={contentError} />}
      {projectsLoading && showProjectSummary && <PageMessage title={t('loadingDashboardTitle')} body={t('loadingDashboardBody')} />}
      {projectsError && showProjectSummary && <PageMessage title={t('couldNotLoadDashboard')} body={projectsError} />}

      <div className="overview-grid">
        <section className="overview-panel" aria-labelledby="needs-attention-heading">
          <div className="overview-panel-heading">
            <h2 id="needs-attention-heading">Needs attention</h2>
            <span>{needsAttention.length ? `${needsAttention.length} active` : 'Clear'}</span>
          </div>
          {needsAttention.length ? (
            <div className="overview-action-list">
              {needsAttention.map((item) => (
                <Link to={item.to} key={item.label}>
                  <span>{item.count}</span>
                  <strong>{item.label}</strong>
                  <small>{item.helper}</small>
                </Link>
              ))}
            </div>
          ) : (
            <p className="overview-empty-note">No drafts, scheduled posts, or permitted submissions need attention right now.</p>
          )}
        </section>

        <section className="overview-panel" aria-labelledby="recent-activity-heading">
          <div className="overview-panel-heading">
            <h2 id="recent-activity-heading">Recent activity</h2>
            {defaultWorkspaceHub && <Link to={workspaceHubViewUrl(defaultWorkspaceHub.sectionId, 'library')}>View library</Link>}
          </div>
          {recentContent.length ? (
            <div className="overview-recent-list">
              {recentContent.map((item) => (
                <Link key={item.id} to={workspaceHubViewUrl(item.sectionId, 'library')}>
                  <span>
                    <strong>{item.title || 'Untitled draft'}</strong>
                    <small>{item.sectionName} / {item.status} / {formatDashboardTime(item.updatedAt ?? item.createdAt)}</small>
                  </span>
                  <em>Open</em>
                </Link>
              ))}
            </div>
          ) : (
            <p className="overview-empty-note">Recent content updates will appear here after the first draft or publication.</p>
          )}
        </section>

        <section className="overview-panel overview-panel--quiet" aria-labelledby="quick-access-heading">
          <div className="overview-panel-heading">
            <h2 id="quick-access-heading">Quick access</h2>
          </div>
          <div className="overview-quick-links">
            {quickLinks.map((item) => <Link to={item.to} key={item.label}>{item.label}</Link>)}
          </div>
        </section>
      </div>

      {showProjectSummary && (projectStats.approved > 0 || projectStats.featured > 0) && (
        <div className="overview-footnote">
          <span>{projectStats.approved} approved projects</span>
          <span>{projectStats.featured} featured</span>
        </div>
      )}
      {showSeedAction && (
        <div className="workspace-utility-row">
          <button className="workspace-text-button" type="button" onClick={() => void runSeed()}>
            {t('seedSampleData')}
          </button>
        </div>
      )}
    </section>
  )
}

function formatDashboardTime(stamp?: ContentItem['updatedAt']) {
  if (!stamp?.toDate) return 'Not saved yet'
  return stamp.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function HubAdminListPage() {
  const { hubPages, loading, error } = useHubPages()
  const { canManageSection } = useAuth()
  const manageableConfigs = hubConfigs.filter((config) => canManageSection(config.sectionId))

  return (
    <section className="admin-page">
      <PageHeading
        eyebrow="Teacher dashboard"
        title="Manage Learning Hubs"
        body="Edit hub page settings and manage published content for IED, EEP, ESL, and ESL subject hubs."
      />
      {loading && <PageMessage title="Loading hubs" body="Fetching saved hub settings..." />}
      {error && <PageMessage title="Could not load hubs" body={error} />}
      <div className="hub-admin-list">
        {manageableConfigs.map((config) => {
          const hubPage = hubPages.find((item) => item.sectionId === config.sectionId)

          return (
            <Link
              className="hub-card hub-card--admin"
              data-section-id={config.sectionId}
              key={config.sectionId}
              to={`/admin/hubs/${config.sectionId}`}
            >
              <span>{config.department}</span>
              <h2>{hubPage?.title ?? config.defaults.title}</h2>
              <p>{hubPage?.subtitle ?? config.defaults.subtitle}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function AdminUsersPage() {
  return <StaffAccessPage />
}

function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return undefined
    }

    return watchAuditLogs(
      (nextEntries) => {
        setEntries(nextEntries)
        setLoading(false)
      },
      (watchError) => {
        setError(watchError.message)
        setLoading(false)
      },
    )
  }, [])

  return (
    <section className="admin-page">
      <PageHeading
        eyebrow="Audit Log"
        title="Staff activity history"
        body="Review protected staff, content, project, and hub-setting actions recorded by trusted backend operations."
      />
      {loading && <PageMessage title="Loading audit log" body="Fetching the latest staff activity..." />}
      {error && <PageMessage title="Could not load audit log" body={error} />}
      <div className="content-admin-list">
        {entries.length ? (
          entries.map((entry) => (
            <article className="admin-item content-admin-item" key={entry.id}>
              <div>
                <div className="content-item-badges">
                  <span className="badge">{entry.action}</span>
                  <span className="status-badge status-published">{entry.targetType}</span>
                </div>
                <h2>{entry.targetLabel || entry.targetId}</h2>
                <p className="meta">
                  {entry.actorDisplayName || entry.actorUsername || entry.actorUid}
                  {entry.createdAt ? ` - ${entry.createdAt.toDate().toLocaleString()}` : ''}
                </p>
                <p className="meta">{JSON.stringify(entry.summary)}</p>
              </div>
            </article>
          ))
        ) : (
          !loading && (
            <div className="empty-manager-state">
              <h3>No audit entries yet.</h3>
              <p>Trusted backend actions will appear here after staff provisioning or publishing events occur.</p>
            </div>
          )
        )}
      </div>
    </section>
  )
}

function HubAdminPage() {
  const { sectionId = 'ied' } = useParams()
  const config = hubConfigById[sectionId]
  const { user, canManageSection } = useAuth()
  const canManageHub = Boolean(config && canManageSection(config.sectionId))
  const { hubPage } = useHubPage(sectionId)
  const { contentItems, loading, error } = useContentItems(sectionId, undefined, canManageHub)

  if (!config) {
    return <PageMessage title="Hub not found" body="This hub section is not available." />
  }

  if (!canManageHub) {
    return <AccessDenied />
  }

  if (!hubPage) {
    return <PageMessage title="Hub not found" body="This hub section is not available." />
  }

  return (
    <HubAdminEditor
      config={config}
      contentItems={contentItems}
      error={error}
      hubPage={hubPage}
      key={`${config.sectionId}:${hubPage.updatedAt?.toMillis() ?? 'fallback'}:${user?.email ?? ''}`}
      loading={loading}
      userEmail={user?.email ?? ''}
    />
  )
}

function HubAdminEditor({
  config,
  contentItems,
  error,
  hubPage,
  loading,
  userEmail,
}: {
  config: (typeof hubConfigs)[number]
  contentItems: ContentItem[]
  error: string
  hubPage: HubPageData
  loading: boolean
  userEmail: string
}) {
  return (
    <HubContentLibrary
      config={config}
      contentItems={contentItems}
      error={error}
      hubPage={hubPage}
      loading={loading}
      userEmail={userEmail}
    />
  )
}

function submissionDestinationForSection(sectionId: string): SubmissionDestinationId | null {
  const entry = Object.entries(submissionDestinations).find(([, destination]) => destination.sectionId === sectionId)
  return entry ? entry[0] as SubmissionDestinationId : null
}

function withSubmissionAction(hubPage: HubPageData, sectionId: string): HubPageData {
  if (!hubPage.submissionsEnabled) {
    if (hubPage.secondaryButtonUrl?.includes('/submit')) {
      return { ...hubPage, secondaryButtonText: '', secondaryButtonUrl: '' }
    }
    return hubPage
  }

  const destination = submissionDestinationForSection(sectionId)
  if (!destination) return hubPage
  const submitUrl = destination === 'eep-showcase'
    ? '/eep/showcase/submit'
    : `${hubConfigById[sectionId]?.route}/submit`

  return {
    ...hubPage,
    secondaryButtonText: hubPage.submissionsButtonLabel || hubPage.secondaryButtonText || 'Submit Work',
    secondaryButtonUrl: submitUrl,
  }
}

const submissionStatuses = ['settings', 'pending', 'approved', 'rejected', 'archived'] as const
type SubmissionTab = typeof submissionStatuses[number]

function parseSubmissionTab(value: string | null): SubmissionTab {
  return submissionStatuses.includes(value as SubmissionTab) ? value as SubmissionTab : 'pending'
}

function submissionRoute(sectionId: string, status: SubmissionTab = 'pending') {
  return `/admin/submissions/${sectionId}?status=${status}`
}

function SubmissionsPage() {
  const { sectionId = 'eep' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { canManageSection, canManageHubSettings } = useAuth()
  const { t } = useLanguage()
  const config = hubConfigById[sectionId]
  const canManage = Boolean(config && canManageSection(config.sectionId))
  const { projects, loading, error } = useProjects(undefined, canManage, config?.sectionId)
  const { hubPage } = useHubPage(config?.sectionId ?? 'eep')
  const activeTab = parseSubmissionTab(searchParams.get('status'))
  const [editingId, setEditingId] = useState<string | null>(null)
  const editingProject = projects.find((project) => project.id === editingId)

  if (!config) {
    return <PageMessage title={t('hubNotFoundTitle')} body={t('hubNotFoundBody')} />
  }

  if (!canManage) {
    return <AccessDenied sectionId={config.sectionId} />
  }

  const counts = {
    pending: projects.filter((project) => project.status === 'pending').length,
    approved: projects.filter((project) => project.status === 'approved' || project.status === 'hidden').length,
    rejected: projects.filter((project) => project.status === 'rejected').length,
    archived: projects.filter((project) => project.status === 'archived').length,
  }
  const visibleProjects = projects.filter((project) => {
    if (activeTab === 'approved') return project.status === 'approved' || project.status === 'hidden'
    if (activeTab === 'settings') return false
    return project.status === activeTab
  })

  const setTab = (tab: SubmissionTab) => setSearchParams({ status: tab })

  return (
    <section className="admin-page submissions-page">
      <PageHeading
        eyebrow="Student submissions"
        title={`${config.sectionName} Submissions`}
        body="Manage this hub's independent submission settings and review queue without mixing records from other hubs."
      />
      <div className="submission-tabs" role="tablist" aria-label="Submission views">
        {submissionStatuses.map((tab) => (
          <button
            aria-selected={activeTab === tab}
            className={activeTab === tab ? 'active' : ''}
            key={tab}
            role="tab"
            type="button"
            onClick={() => setTab(tab)}
          >
            {tab === 'settings' ? 'Settings' : `${tab[0].toUpperCase()}${tab.slice(1)} (${counts[tab]})`}
          </button>
        ))}
      </div>

      {activeTab === 'settings' ? (
        <SubmissionSettingsPanel
          canEdit={canManageHubSettings(config.sectionId)}
          config={config}
          hubPage={hubPage ?? hubPageFromConfigFallback(config)}
        />
      ) : (
        <>
          {loading && <PageMessage title={t('loadingProjectsTitle')} body={t('reviewQueueBody')} />}
          {error && <PageMessage title={t('couldNotLoadProjects')} body={error} />}
          {!loading && !visibleProjects.length && (
            <PageMessage
              title={`No ${activeTab} submissions`}
              body={`${config.sectionName} has no ${activeTab} student submissions right now.`}
            />
          )}
          <div className="admin-list">
            {visibleProjects.map((project) => (
              <article className="admin-item" key={project.id}>
                <ProjectPreview project={project} />
                <div className="admin-item-actions">
                  <a className="secondary-button" href={project.googleSitesUrl} target="_blank" rel="noreferrer">Preview</a>
                  <button className="secondary-button" type="button" onClick={() => setEditingId(project.id)}>Edit metadata</button>
                  <button className="secondary-button" type="button" onClick={() => void updateProject(project.id, { featured: !project.featured })}>
                    {project.featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button className="secondary-button" type="button" onClick={() => void updateProject(project.id, { studentPick: !project.studentPick })}>
                    {project.studentPick ? 'Remove pick' : 'Student pick'}
                  </button>
                  {project.status !== 'approved' && (
                    <button className="primary-button" type="button" onClick={() => void updateProject(project.id, { status: 'approved', publiclyVisible: true })}>
                      Approve
                    </button>
                  )}
                  {project.status === 'approved' && (
                    <button className="secondary-button" type="button" onClick={() => void updateProject(project.id, { status: 'hidden', publiclyVisible: false })}>
                      Unpublish
                    </button>
                  )}
                  {project.status === 'hidden' && (
                    <button className="secondary-button" type="button" onClick={() => void updateProject(project.id, { status: 'approved', publiclyVisible: true })}>
                      Publish
                    </button>
                  )}
                  {project.status !== 'rejected' && (
                    <button className="secondary-button" type="button" onClick={() => void updateProject(project.id, { status: 'rejected', publiclyVisible: false })}>
                      Reject
                    </button>
                  )}
                  {project.status === 'archived' ? (
                    <button className="secondary-button" type="button" onClick={() => void updateProject(project.id, { status: 'pending', publiclyVisible: false })}>
                      Restore
                    </button>
                  ) : (
                    <button className="secondary-button" type="button" onClick={() => void updateProject(project.id, { status: 'archived', publiclyVisible: false })}>
                      Archive
                    </button>
                  )}
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => {
                      if (confirmDelete(`Delete "${project.title}"? This cannot be undone.`)) {
                        void deleteProject(project.id)
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
          {editingProject && (
            <EditProjectModal
              project={editingProject}
              onClose={() => setEditingId(null)}
              onSave={async (nextProject) => {
                await updateProject(editingProject.id, { ...nextProject, sectionId: editingProject.sectionId })
                setEditingId(null)
              }}
            />
          )}
        </>
      )}
    </section>
  )
}

function hubPageFromConfigFallback(config: (typeof hubConfigs)[number]): HubPageData {
  return { id: config.sectionId, ...config.defaults }
}

function SubmissionSettingsPanel({
  canEdit,
  config,
  hubPage,
}: {
  canEdit: boolean
  config: (typeof hubConfigs)[number]
  hubPage: HubPageData
}) {
  const [draft, setDraft] = useState({
    submissionsEnabled: Boolean(hubPage.submissionsEnabled),
    submissionsButtonLabel: hubPage.submissionsButtonLabel || config.defaults.submissionsButtonLabel || 'Submit Work',
    submissionsInstructions: hubPage.submissionsInstructions || config.defaults.submissionsInstructions || '',
    submissionsPubliclyVisible: hubPage.submissionsPubliclyVisible ?? true,
    submissionsGuidance: hubPage.submissionsGuidance || config.defaults.submissionsGuidance || '',
    submissionsAcceptedTypes: hubPage.submissionsAcceptedTypes || config.defaults.submissionsAcceptedTypes || '',
  })
  const [message, setMessage] = useState('')

  const save = async (event: FormEvent) => {
    event.preventDefault()
    await saveHubPage(config.sectionId, {
      ...hubPage,
      ...draft,
      sectionId: config.sectionId,
      childSectionIds: config.children,
    })
    setMessage('Submission settings saved.')
  }

  return (
    <form className="submission-settings-panel form-grid" onSubmit={save}>
      <label className="checkbox-row span-2">
        <input checked={draft.submissionsEnabled} disabled={!canEdit} type="checkbox" onChange={(event) => setDraft({ ...draft, submissionsEnabled: event.target.checked })} />
        <span>Student submissions are open for {config.sectionName}</span>
      </label>
      <label>Public button label<input disabled={!canEdit} value={draft.submissionsButtonLabel} onChange={(event) => setDraft({ ...draft, submissionsButtonLabel: event.target.value })} /></label>
      <label>Accepted work types<input disabled={!canEdit} value={draft.submissionsAcceptedTypes} onChange={(event) => setDraft({ ...draft, submissionsAcceptedTypes: event.target.value })} /></label>
      <label className="span-2">Instructions<textarea disabled={!canEdit} value={draft.submissionsInstructions} onChange={(event) => setDraft({ ...draft, submissionsInstructions: event.target.value })} /></label>
      <label className="span-2">Student guidance<textarea disabled={!canEdit} value={draft.submissionsGuidance} onChange={(event) => setDraft({ ...draft, submissionsGuidance: event.target.value })} /></label>
      <label className="checkbox-row span-2">
        <input checked={draft.submissionsPubliclyVisible} disabled={!canEdit} type="checkbox" onChange={(event) => setDraft({ ...draft, submissionsPubliclyVisible: event.target.checked })} />
        <span>Approved work may be publicly visible on this hub.</span>
      </label>
      {canEdit ? <button className="primary-button blue" type="submit">Save submission settings</button> : <p className="module-note quiet">You can review submissions, but cannot edit hub settings.</p>}
      {message && <p className="form-message span-2">{message}</p>}
    </form>
  )
}

function ProjectPreview({ project }: { project: Project }) {
  const { t } = useLanguage()

  return (
    <div className="project-preview">
      <img src={projectImageSrc(project)} alt="" onError={(event) => handleProjectImageError(event, project)} />
      <div>
        <span className="badge">{t(statusTranslationKeys[project.status])}</span>
        <h2>{project.title}</h2>
        <p className="meta">
          {project.groupName} / {project.className} / {t(categoryTranslationKeys[project.category])}
        </p>
        <p>{project.description}</p>
        <p>
          <strong>{t('audience')}:</strong> {project.audience}
        </p>
        <p>
          <strong>{t('impact')}:</strong> {project.impact}
        </p>
      </div>
    </div>
  )
}

function EditProjectModal({
  project,
  onClose,
  onSave,
}: {
  project: Project
  onClose: () => void
  onSave: (project: ProjectInput) => Promise<void>
}) {
  const { t } = useLanguage()
  const [draft, setDraft] = useState<ProjectInput>({
    sectionId: project.sectionId,
    title: project.title,
    groupName: project.groupName,
    className: project.className,
    members: project.members,
    category: project.category,
    description: project.description,
    audience: project.audience,
    impact: project.impact,
    googleSitesUrl: project.googleSitesUrl,
    imageUrl: project.imageUrl,
    status: project.status,
    featured: project.featured,
    studentPick: project.studentPick,
    publiclyVisible: project.publiclyVisible,
  })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await onSave(draft)
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-label={t('editProject')}>
        <div className="modal-header">
          <h2>{t('editProject')}</h2>
          <button className="small-button" type="button" onClick={onClose}>
            {t('close')}
          </button>
        </div>
        <ProjectForm project={draft} onChange={setDraft} onSubmit={submit} submitLabel={t('saveChanges')} />
      </div>
    </div>
  )
}

function ProjectForm({
  project,
  onChange,
  onSubmit,
  submitLabel,
  disabled = false,
  children,
}: {
  project: ProjectInput
  onChange: (project: ProjectInput) => void
  onSubmit: (event: FormEvent) => void
  submitLabel: string
  disabled?: boolean
  children?: ReactNode
}) {
  const { t } = useLanguage()
  const update = (field: keyof ProjectInput, value: string | boolean) => {
    onChange({ ...project, [field]: value })
  }

  return (
    <form className="project-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label>
          {t('groupName')}
          <input disabled={disabled} maxLength={projectFieldLimits.groupName} value={project.groupName} onChange={(event) => update('groupName', event.target.value)} required />
        </label>
        <label>
          {t('className')}
          <input disabled={disabled} maxLength={projectFieldLimits.className} value={project.className} onChange={(event) => update('className', event.target.value)} required />
        </label>
        <label>
          {t('members')}
          <input disabled={disabled} maxLength={projectFieldLimits.members} value={project.members} onChange={(event) => update('members', event.target.value)} required />
        </label>
        <label>
          {t('projectTitle')}
          <input disabled={disabled} maxLength={projectFieldLimits.title} value={project.title} onChange={(event) => update('title', event.target.value)} required />
        </label>
        <label>
          {t('category')}
          <select
            value={project.category}
            disabled={disabled}
            onChange={(event) => update('category', event.target.value as ProjectCategory)}
            required
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {t(categoryTranslationKeys[item])}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('googleSitesUrl')}
          <input
            disabled={disabled}
            value={project.googleSitesUrl}
            onChange={(event) => update('googleSitesUrl', event.target.value)}
            pattern="https://sites\.google\.com/.*"
            required
            type="url"
          />
        </label>
        <label className="span-2">
          {t('imageUrl')}
          <input
            disabled={disabled}
            value={project.imageUrl}
            onChange={(event) => update('imageUrl', event.target.value)}
            placeholder={t('imagePlaceholder')}
            pattern="https://.*"
            type="url"
          />
        </label>
        <label className="span-2">
          {t('description')}
          <textarea disabled={disabled} maxLength={projectFieldLimits.description} value={project.description} onChange={(event) => update('description', event.target.value)} required />
        </label>
        <label className="span-2">
          {t('audience')}
          <textarea disabled={disabled} maxLength={projectFieldLimits.audience} value={project.audience} onChange={(event) => update('audience', event.target.value)} required />
        </label>
        <label className="span-2">
          {t('impactStatement')}
          <textarea disabled={disabled} maxLength={projectFieldLimits.impact} value={project.impact} onChange={(event) => update('impact', event.target.value)} required />
        </label>
      </div>
      {children}
      <button className="primary-button" disabled={disabled} type="submit">
        {submitLabel}
      </button>
    </form>
  )
}

function PageHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{body}</p>
    </div>
  )
}

function PageMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="page-message">
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  )
}

function projectImageSrc(project: Project) {
  return project.imageUrl || fallbackImage(project)
}

function handleProjectImageError(event: { currentTarget: HTMLImageElement }, project: Project) {
  const fallback = fallbackImage(project)

  if (event.currentTarget.src !== fallback) {
    event.currentTarget.src = fallback
  }
}

function fallbackImage(project: Project) {
  const presets: Record<string, { bg: string; accent: string; accent2: string; label: string; scene: string }> = {
    'Taichung Food Guide': {
      bg: '#fff3d3',
      accent: '#f28c28',
      accent2: '#18a878',
      label: 'Taichung Food Guide',
      scene: '<circle cx="560" cy="250" r="58" fill="#f28c28"/><path d="M510 210h100v28H510zM500 268h120v26H500z" fill="#fff"/><path d="M182 322c72-58 152-58 224 0" fill="none" stroke="#18a878" stroke-width="18" stroke-linecap="round"/>',
    },
    'Happy Paws Pet Grooming': {
      bg: '#e9fbf3',
      accent: '#18a878',
      accent2: '#f6a83f',
      label: 'Happy Paws',
      scene: '<circle cx="545" cy="236" r="44" fill="#f6a83f"/><circle cx="500" cy="202" r="22" fill="#f6a83f"/><circle cx="590" cy="202" r="22" fill="#f6a83f"/><path d="M492 292c30 28 76 28 106 0" fill="none" stroke="#17324d" stroke-width="12" stroke-linecap="round"/><circle cx="530" cy="240" r="8" fill="#17324d"/><circle cx="566" cy="240" r="8" fill="#17324d"/>',
    },
    'Basketball Club Hub': {
      bg: '#e4f1ff',
      accent: '#006bd6',
      accent2: '#f47d2d',
      label: 'Basketball Club',
      scene: '<circle cx="550" cy="244" r="64" fill="#f47d2d"/><path d="M486 244h128M550 180v128M510 200c44 35 44 56 0 88M590 200c-44 35-44 56 0 88" stroke="#7a3513" stroke-width="8" fill="none"/><rect x="178" y="178" width="200" height="130" rx="18" fill="#006bd6" opacity=".16"/>',
    },
    'Night Market for Visitors': {
      bg: '#e7edff',
      accent: '#5367c9',
      accent2: '#ffbf3f',
      label: 'Night Market',
      scene: '<path d="M470 176h160l-26 52H496z" fill="#ffbf3f"/><path d="M500 228h100v84H500z" fill="#5367c9"/><circle cx="208" cy="188" r="24" fill="#ff6b6b"/><circle cx="282" cy="214" r="24" fill="#ffbf3f"/><circle cx="354" cy="190" r="24" fill="#18a878"/>',
    },
    'Study Survival Guide': {
      bg: '#e8fbff',
      accent: '#00a2c7',
      accent2: '#f9c84a',
      label: 'Study Guide',
      scene: '<rect x="470" y="188" width="150" height="100" rx="14" fill="#00a2c7"/><rect x="492" y="212" width="106" height="12" rx="6" fill="#fff"/><rect x="492" y="240" width="72" height="12" rx="6" fill="#fff"/><path d="M190 190h180v126H190z" fill="#fff" stroke="#00a2c7" stroke-width="10"/><path d="M220 230h120M220 264h90" stroke="#f9c84a" stroke-width="12" stroke-linecap="round"/>',
    },
    'Save the Ocean Campaign': {
      bg: '#def8ff',
      accent: '#007fb7',
      accent2: '#18a878',
      label: 'Save the Ocean',
      scene: '<path d="M150 304c90-58 156 58 246 0s156 58 246 0v70H150z" fill="#007fb7" opacity=".7"/><ellipse cx="536" cy="244" rx="76" ry="44" fill="#18a878"/><circle cx="604" cy="234" r="18" fill="#18a878"/><path d="M488 214l-38-26M488 274l-38 26M552 214l38-26M552 274l38 26" stroke="#18a878" stroke-width="18" stroke-linecap="round"/>',
    },
    'Comic World Adventures': {
      bg: '#fff0f7',
      accent: '#5975d9',
      accent2: '#f9c84a',
      label: 'Comic World',
      scene: '<path d="M472 184h142v98H540l-40 42 10-42h-38z" fill="#f9c84a" stroke="#17324d" stroke-width="8"/><text x="543" y="246" text-anchor="middle" font-family="Arial" font-size="32" font-weight="900" fill="#17324d">WOW</text><rect x="180" y="172" width="206" height="150" rx="18" fill="#5975d9" opacity=".18"/>',
    },
    'Family Bakery Website': {
      bg: '#fff1dc',
      accent: '#c86d2d',
      accent2: '#f9c84a',
      label: 'Family Bakery',
      scene: '<ellipse cx="540" cy="266" rx="84" ry="44" fill="#c86d2d"/><path d="M484 252c32-34 80-34 112 0" fill="none" stroke="#fff3d3" stroke-width="16" stroke-linecap="round"/><rect x="180" y="184" width="190" height="110" rx="16" fill="#fff"/><path d="M210 230h130M210 260h86" stroke="#c86d2d" stroke-width="12" stroke-linecap="round"/>',
    },
    'Eco Actions Today': {
      bg: '#e8fbec',
      accent: '#18a878',
      accent2: '#8bc34a',
      label: 'Eco Actions',
      scene: '<path d="M540 320V210" stroke="#18a878" stroke-width="16" stroke-linecap="round"/><ellipse cx="500" cy="232" rx="54" ry="28" fill="#8bc34a" transform="rotate(-30 500 232)"/><ellipse cx="580" cy="250" rx="54" ry="28" fill="#18a878" transform="rotate(30 580 250)"/><circle cx="230" cy="248" r="54" fill="#18a878" opacity=".18"/><path d="M196 250h70M230 216v70" stroke="#18a878" stroke-width="12" stroke-linecap="round"/>',
    },
    'Soundwave Studio': {
      bg: '#eef3ff',
      accent: '#5975d9',
      accent2: '#00a2c7',
      label: 'Soundwave Studio',
      scene: '<path d="M480 260a70 70 0 0 1 140 0v46h-28v-46a42 42 0 0 0-84 0v46h-28z" fill="#5975d9"/><rect x="186" y="218" width="18" height="70" rx="9" fill="#00a2c7"/><rect x="226" y="188" width="18" height="130" rx="9" fill="#5975d9"/><rect x="266" y="238" width="18" height="52" rx="9" fill="#f9c84a"/><rect x="306" y="204" width="18" height="94" rx="9" fill="#18a878"/>',
    },
  }
  const categoryFallbacks: Record<string, { bg: string; accent: string; accent2: string; label: string; scene: string }> = {
    'Local Businesses': presets['Happy Paws Pet Grooming'],
    'School Clubs': presets['Basketball Club Hub'],
    'Travel & Food Guides': presets['Taichung Food Guide'],
    'Student Help': presets['Study Survival Guide'],
    Campaigns: presets['Eco Actions Today'],
    'Creative Projects': presets['Comic World Adventures'],
  }
  const palette = presets[project.title] ?? categoryFallbacks[project.category] ?? presets['Comic World Adventures']
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
      <rect width="800" height="500" fill="${palette.bg}"/>
      <circle cx="665" cy="92" r="92" fill="#ffffff" opacity=".7"/>
      <circle cx="105" cy="420" r="120" fill="#ffffff" opacity=".55"/>
      <rect x="96" y="82" width="608" height="338" rx="34" fill="#ffffff" stroke="#d8ecfb" stroke-width="8"/>
      <rect x="96" y="82" width="608" height="62" rx="34" fill="${palette.accent}"/>
      <circle cx="140" cy="113" r="9" fill="#fff" opacity=".9"/>
      <circle cx="172" cy="113" r="9" fill="#fff" opacity=".72"/>
      <circle cx="204" cy="113" r="9" fill="#fff" opacity=".55"/>
      <rect x="146" y="176" width="250" height="30" rx="15" fill="${palette.accent}"/>
      <rect x="146" y="224" width="190" height="18" rx="9" fill="${palette.accent2}" opacity=".82"/>
      <rect x="146" y="258" width="226" height="18" rx="9" fill="#b8d8ec"/>
      ${palette.scene}
      <text x="400" y="462" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#17324d">${palette.label}</text>
    </svg>`

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export default App
