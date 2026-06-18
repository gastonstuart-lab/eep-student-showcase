import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactElement, type ReactNode } from 'react'
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
} from 'react-router-dom'
import { AuthProvider, bootstrapSuperAdminEmail, useAuth } from './auth'
import { PremiumHero, type PremiumHeroAction } from './components/public/PremiumHero'
import { PremiumImageCard } from './components/public/PremiumImageCard'
import { ProgrammePathwayCard } from './components/public/ProgrammePathwayCard'
import { ScrollReveal } from './components/public/ScrollReveal'
import { SubjectPathwayCard } from './components/public/SubjectPathwayCard'
import {
  createContentItem,
  createProject,
  deleteAdminUser,
  deleteContentItem,
  deleteProject,
  saveAdminUser,
  saveHubPage,
  seedProjects,
  updateAdminUser,
  updateContentItem,
  updateProject,
  watchAdminUsers,
} from './data'
import { isFirebaseConfigured } from './firebase'
import { hubConfigById, hubConfigs } from './hubs'
import { LanguageProvider, LanguageToggle, UiText, useLanguage } from './i18n/LanguageContext'
import { categoryTranslationKeys, statusTranslationKeys, type TranslationKey } from './i18n/translations'
import { useAllPublishedContentItems, useContentItems } from './useContentItems'
import { useHubPage, useHubPages } from './useHubPages'
import { useProjects } from './useProjects'
import { projectFieldLimits, projectSubmissionFingerprint, validateProjectSubmission } from './utils/validation'
import {
  categories,
  contentTypes,
  type AdminRole,
  type AdminUser,
  type AdminUserInput,
  type ContentItem,
  type ContentItemInput,
  type ContentStatus,
  type ContentType,
  type HubPage as HubPageData,
  type HubPageInput,
  type Project,
  type ProjectCategory,
  type ProjectInput,
} from './types'
import './App.css'

const emptyProject: ProjectInput = {
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
}

const performanceArtsSection = {
  department: 'ESL' as const,
  sectionId: 'esl-performance-arts',
  sectionName: 'Performance Arts',
}

const emptyContentItem: ContentItemInput = {
  title: '',
  summary: '',
  body: '',
  type: 'announcement',
  department: performanceArtsSection.department,
  sectionId: performanceArtsSection.sectionId,
  sectionName: performanceArtsSection.sectionName,
  status: 'draft',
  featured: false,
  mediaUrl: '',
  linkUrl: '',
  eventDate: '',
  imageUrl: '',
  createdBy: '',
}

const contentTypeLabels: Record<ContentType, string> = {
  announcement: 'Announcement',
  event: 'Event',
  video: 'Video / Performance',
  resource: 'Resource',
  studentWork: 'Student Work',
  link: 'Webpage / Link',
}

const contentStatusLabels: Record<ContentStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  hidden: 'Hidden',
}

const contentStatusFilters = ['all', 'draft', 'published', 'hidden'] as const
type ContentStatusFilter = (typeof contentStatusFilters)[number]

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

const statLabelKeys: Record<string, TranslationKey> = {
  total: 'statTotal',
  pending: 'statPending',
  approved: 'statApproved',
  rejected: 'statRejected',
  hidden: 'statHidden',
  featured: 'statFeatured',
}

const submissionDestinations = {
  'eep-showcase': {
    name: 'EEP Student Website Showcase',
    title: 'Submit to the EEP Showcase',
    body: 'Send your Google Sites project to the teacher review queue for the EEP Student Website Showcase.',
    success: 'Project submitted to the EEP Student Website Showcase. It is awaiting teacher review.',
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
  },
  {
    id: 'demo-happy-paws',
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
  },
  {
    id: 'demo-basketball-club',
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
  },
  {
    id: 'demo-night-market',
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
  },
  {
    id: 'demo-study-survival',
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
  },
  {
    id: 'demo-ocean-campaign',
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
  },
  {
    id: 'demo-comic-world',
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
  },
  {
    id: 'demo-family-bakery',
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
  },
  {
    id: 'demo-eco-actions',
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
  },
  {
    id: 'demo-soundwave',
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
  },
]

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Shell />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
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
    if (!location.hash) {
      return
    }

    const id = decodeURIComponent(location.hash.slice(1))
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'start' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [location.hash, location.pathname])

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
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
          <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>IED</NavLink>
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
              Login
            </Link>
          )}
        </div>
      </header>

      {!isFirebaseConfigured && location.pathname !== '/' && <FirebaseNotice />}

      <main className="page-transition" key={location.pathname}>
        {location.pathname !== '/' && <BackNavigation />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ied" element={<Navigate to="/" replace />} />
          <Route path="/eep" element={<HubPageView sectionId="eep" />} />
          <Route path="/eep/showcase" element={<EepShowcasePage />} />
          <Route path="/eep/showcase/submit" element={<SubmitPage destination="eep-showcase" />} />
          <Route path="/esl" element={<HubPageView sectionId="esl" />} />
          <Route path="/esl/science" element={<HubPageView sectionId="esl-science" />} />
          <Route path="/esl/language-arts" element={<HubPageView sectionId="esl-language-arts" />} />
          <Route path="/esl/performance-arts" element={<HubPageView sectionId="esl-performance-arts" />} />
          <Route path="/esl/social-studies" element={<HubPageView sectionId="esl-social-studies" />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/submit" element={<SubmitPage destination="eep-showcase" />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
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
              <ProtectedRoute sectionId="eep">
                <PendingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/approved"
            element={
              <ProtectedRoute sectionId="eep">
                <ApprovedPage />
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
              <ProtectedRoute requireSuperAdmin>
                <AdminUsersPage />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function BackNavigation() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/')
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
  sectionId,
}: {
  children: ReactElement
  requireSuperAdmin?: boolean
  sectionId?: string
}) {
  const { user, loading, adminLoading, isAdmin, isSuperAdmin, canManageSection } = useAuth()
  const { t } = useLanguage()

  if (loading || adminLoading) {
    return <PageMessage title={t('checkingSessionTitle')} body={t('checkingSessionBody')} />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin || (requireSuperAdmin && !isSuperAdmin) || (sectionId && !canManageSection(sectionId))) {
    return <AccessDenied />
  }

  return children
}

export function AccessDenied() {
  return (
    <section className="admin-page">
      <PageMessage
        title="Access denied"
        body="Your account is signed in, but it is not authorised to manage this area. Ask a super administrator to grant access."
      />
      <Link className="secondary-button" to="/">
        Return to public hub
      </Link>
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
        imageAlt="THUHS campus building and international learning visual"
        theme="ied"
        className="home-premium-hero"
        imagePosition="72% center"
        actions={[
          { label: 'Enter EEP →', to: '/eep', variant: 'blue' },
          { label: 'Enter ESL →', to: '/esl', variant: 'teal' },
          ...(hasPublishedIedContent ? [{ label: `${t('viewLatestIedUpdates')} ↓`, to: '#ied-published-content', variant: 'outline' } as PremiumHeroAction] : []),
        ]}
      />

      <ScrollReveal className="premium-pathway-grid" stagger>
        <ProgrammePathwayCard
          to="/eep"
          title="EEP Learning Hub"
          description={t('eepHomeDescription')}
          features={[
            t('eepFeatureBooksStories'),
            t('eepFeatureReadingVocab'),
            t('eepFeatureCreativeWork'),
            t('eepFeatureProjectsShowcases'),
          ]}
          cta={`${t('exploreEepHub')} →`}
          desktopImage={premiumAssets.cards.eep}
          imageAlt="Books, workbooks, and story-based English enrichment materials"
          theme="eep"
          kicker={t('eepProgramme')}
        />
        <ProgrammePathwayCard
          to="/esl"
          title="ESL Learning Hub"
          description={t('eslHomeDescription')}
          features={['Science', 'Language Arts', 'Performance Arts', 'Social Studies']}
          cta={`${t('exploreEslHub')} →`}
          desktopImage={premiumAssets.cards.esl}
          imageAlt="Globe and subject learning materials for ESL"
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
          <div className="content-list ied-published-grid">
            {iedContentItems.map((item) => (
              <ContentCard item={item} key={item.id} />
            ))}
          </div>
        </section>
      )}
    </section>
  )
}

function EepShowcasePage() {
  const { projects, loading, error } = useProjects('approved')
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
        imageAlt="Digital student website showcase visual"
        theme="showcase"
        className="showcase-premium-hero"
        imagePosition="76% center"
        actions={[
          { label: 'Submit to the EEP Showcase →', to: '/eep/showcase/submit', variant: 'blue' },
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
                  Submit to the EEP Showcase
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
  const { projects } = useProjects('approved', sectionId === 'eep')

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
  const displayHubPage = getDisplayHubPage(config.sectionId, hubPage, Boolean(user))
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
        <aside className="performance-sidebar">
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
        </aside>
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
        primaryLabel: 'Browse Showcase',
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
      <div className={compact ? 'content-list compact' : 'content-list'}>
        {items.map((item) => (
          <ContentCard compact={compact} item={item} key={item.id} />
        ))}
      </div>
    </section>
  )
}

function ContentCard({ item, compact = false }: { item: ContentItem; compact?: boolean }) {
  const { t } = useLanguage()
  const targetUrl = item.linkUrl || item.mediaUrl
  const cardDate = formatContentDate(item)

  return (
    <article className={`${compact ? 'content-card compact' : 'content-card'}${targetUrl ? ' has-link' : ''}`}>
      {item.imageUrl && !compact && <img src={item.imageUrl} alt={`${item.title} visual`} />}
      <div>
        <span className="badge">{contentTypeLabels[item.type]}</span>
        <h3>{item.title}</h3>
        {cardDate && <p className="meta">{cardDate}</p>}
        <p>{item.summary}</p>
        {!compact && item.body && <p className="muted">{item.body}</p>}
        {targetUrl && (
          <a className="small-link" href={targetUrl} target="_blank" rel="noreferrer">
            {t('openContentLink')}
          </a>
        )}
      </div>
    </article>
  )
}

function formatContentDate(item: ContentItem) {
  if (item.eventDate) {
    return formatEventDate(item.eventDate)
  }

  const stamp = item.updatedAt ?? item.createdAt

  if (!stamp || typeof stamp.toDate !== 'function') {
    return ''
  }

  const date = stamp.toDate()

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function formatEventDate(value: string) {
  if (!value) {
    return ''
  }

  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
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
  const { projects, loading } = useProjects('approved')
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
  const [project, setProject] = useState<ProjectInput>(emptyProject)
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

    const validationErrors = validateProjectSubmission(project, permission)
    if (validationErrors.length) {
      setMessage(validationErrors.join(' '))
      return
    }

    const now = Date.now()
    const lastSubmissionAt = Number(window.localStorage.getItem('eep-last-submission-at') ?? 0)
    const fingerprint = projectSubmissionFingerprint(project)
    const lastFingerprint = window.localStorage.getItem('eep-last-submission-fingerprint')

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
        ...project,
        status: 'pending',
        featured: false,
        studentPick: false,
      })
      window.localStorage.setItem('eep-last-submission-at', String(Date.now()))
      window.localStorage.setItem('eep-last-submission-fingerprint', fingerprint)
      setProject(emptyProject)
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
      <div className="submit-form-heading">
        <UiText id="submitFormEyebrow" as="p" className="eyebrow" />
        <UiText id="submitFormTitle" as="h2" />
        <UiText id="submitFormBody" as="p" />
        <p className="submission-destination">
          <strong>Submitting to:</strong> {submissionDestination.name}
        </p>
      </div>
      <ProjectForm
        disabled={saving}
        project={project}
        onChange={setProject}
        onSubmit={submit}
        submitLabel={saving ? t('submitting') : t('submitProject')}
      >
        <label className="honeypot-field" aria-hidden="true">
          Website
          <input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
        <label className="checkbox-row">
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

function LoginPage() {
  const { login, user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!isFirebaseConfigured) {
    return (
      <section className="login-page">
        <div className="login-card">
          <FirebaseMissingPanel />
        </div>
      </section>
    )
  }

  if (user) {
    return <Navigate to="/admin" replace />
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    try {
      await login(email, password)
      navigate('/admin')
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : t('loginFailed'))
    }
  }

  return (
    <section className="login-page">
      <form className="login-card" onSubmit={submit}>
        <PageHeading
          eyebrow={t('teacherAccess')}
          title={t('loginTitle')}
          body={t('loginBody')}
        />
        <label>
          {t('email')}
          <input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" />
        </label>
        <label>
          {t('password')}
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
          />
        </label>
        <button className="primary-button" type="submit">
          {t('signIn')}
        </button>
        {error && <p className="form-message">{error}</p>}
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
  const { canManageProjects, isSuperAdmin } = useAuth()
  const { projects, loading, error } = useProjects(undefined, canManageProjects)
  const { t } = useLanguage()
  const [seedMessage, setSeedMessage] = useState('')

  const stats = {
    total: projects.length,
    pending: projects.filter((project) => project.status === 'pending').length,
    approved: projects.filter((project) => project.status === 'approved').length,
    rejected: projects.filter((project) => project.status === 'rejected').length,
    hidden: projects.filter((project) => project.status === 'hidden').length,
    featured: projects.filter((project) => project.featured).length,
  }

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
    <section className="admin-page">
      <PageHeading
        eyebrow={t('adminEyebrow')}
        title={t('adminTitle')}
        body={t('adminBody')}
      />
      <div className="admin-actions">
        <Link className="primary-button" to="/admin/pending">
          {t('pendingSubmissions')}
        </Link>
        <Link className="secondary-button" to="/admin/approved">
          {t('approvedProjects')}
        </Link>
        <Link className="secondary-button" to="/admin/hubs">
          Hub Pages
        </Link>
        {isSuperAdmin && (
          <Link className="secondary-button" to="/admin/users">
            Manage Access
          </Link>
        )}
        {canManageProjects && (
          <button className="secondary-button" type="button" onClick={() => void runSeed()}>
            {t('seedSampleData')}
          </button>
        )}
      </div>
      {seedMessage && <p className="form-message">{seedMessage}</p>}
      {loading && <PageMessage title={t('loadingDashboardTitle')} body={t('loadingDashboardBody')} />}
      {error && <PageMessage title={t('couldNotLoadDashboard')} body={error} />}
      <div className="stats-grid">
        {Object.entries(stats).map(([label, value]) => (
          <article className="stat-card" key={label}>
            <span>{value}</span>
            <p>{t(statLabelKeys[label])}</p>
          </article>
        ))}
      </div>
    </section>
  )
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
            <Link className="hub-card" key={config.sectionId} to={`/admin/hubs/${config.sectionId}`}>
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

const adminRoleLabels: Record<AdminRole, string> = {
  superAdmin: 'Super administrator',
  editor: 'Editor',
}

const emptyAdminUser: AdminUserInput = {
  email: '',
  displayName: '',
  role: 'editor',
  active: true,
  allowedSectionIds: [],
}

function AdminUsersPage() {
  const { user, adminUser } = useAuth()
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState('')
  const [draftUid, setDraftUid] = useState('')
  const [draft, setDraft] = useState<AdminUserInput>(emptyAdminUser)
  const editingUser = adminUsers.find((item) => item.id === editingId)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return undefined
    }

    return watchAdminUsers(
      (nextAdminUsers) => {
        setAdminUsers(nextAdminUsers)
        setLoading(false)
      },
      (watchError) => {
        setError(watchError.message)
        setLoading(false)
      },
    )
  }, [])

  const startCreate = () => {
    setEditingId('')
    setDraftUid('')
    setDraft(emptyAdminUser)
    setMessage('')
  }

  const startEdit = (item: AdminUser) => {
    setEditingId(item.id)
    setDraftUid(item.id)
    setDraft({
      email: item.email,
      displayName: item.displayName,
      role: item.role,
      active: item.active,
      allowedSectionIds: item.allowedSectionIds,
    })
    setMessage('')
  }

  const saveAdmin = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    const uid = draftUid.trim()

    if (!uid) {
      setMessage('Firebase UID is required.')
      return
    }

    if (!draft.email.trim()) {
      setMessage('Email is required.')
      return
    }

    try {
      if (editingId) {
        await updateAdminUser(editingId, draft)
        setMessage(`Updated access for ${draft.email}.`)
      } else {
        await saveAdminUser(uid, draft)
        setMessage(`Created access for ${draft.email}.`)
        startCreate()
      }
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'Could not save administrator access.')
    }
  }

  const deactivateAdmin = async (item: AdminUser) => {
    if (item.id === user?.uid && adminUser?.source === 'bootstrap') {
      setMessage(`The bootstrap owner ${bootstrapSuperAdminEmail} cannot remove their own final super-admin access here.`)
      return
    }

    await updateAdminUser(item.id, { active: false })
    setMessage(`Deactivated ${item.email}.`)
  }

  const removeAdmin = async (item: AdminUser) => {
    if (!confirmDelete(`Remove access for ${item.email}?`)) {
      return
    }

    if (item.id === user?.uid && adminUser?.source === 'bootstrap') {
      setMessage(`The bootstrap owner ${bootstrapSuperAdminEmail} cannot remove their own final super-admin access here.`)
      return
    }

    await deleteAdminUser(item.id)
    setMessage(`Removed access for ${item.email}.`)
  }

  return (
    <section className="admin-page">
      <PageHeading
        eyebrow="Super administrator"
        title="Manage administrator access"
        body="Add editors after they already have a Firebase Authentication account. Use the Firebase UID as the document ID."
      />
      <p className="content-admin-context">
        Bootstrap owner: <strong>{bootstrapSuperAdminEmail}</strong>. This account must use a verified email address.
      </p>
      {message && <p className="form-message" aria-live="polite">{message}</p>}
      {loading && <PageMessage title="Loading administrators" body="Fetching administrator records..." />}
      {error && <PageMessage title="Could not load administrators" body={error} />}

      <div className="content-admin-grid">
        <form className="content-editor" onSubmit={saveAdmin}>
          <div className="modal-header">
            <h2>{editingUser ? `Edit ${editingUser.email}` : 'Add administrator or editor'}</h2>
            {editingUser && (
              <button className="small-button" type="button" onClick={startCreate}>
                New
              </button>
            )}
          </div>
          <AdminUserForm draft={draft} uid={draftUid} editing={Boolean(editingId)} onDraftChange={setDraft} onUidChange={setDraftUid} />
          <button className="primary-button" type="submit">
            {editingUser ? 'Save access' : 'Create access'}
          </button>
        </form>

        <div className="content-admin-list">
          {adminUsers.length ? (
            adminUsers.map((item) => (
              <article className="admin-item content-admin-item" key={item.id}>
                <div>
                  <div className="content-item-badges">
                    <span className={`status-badge ${item.active ? 'status-published' : 'status-hidden'}`}>
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="badge">{adminRoleLabels[item.role]}</span>
                  </div>
                  <h2>{item.displayName || item.email}</h2>
                  <p className="meta">{item.email}</p>
                  <p className="meta">UID: {item.id}</p>
                  <p>
                    Sections:{' '}
                    {item.role === 'superAdmin'
                      ? 'All sections'
                      : item.allowedSectionIds.length
                        ? item.allowedSectionIds.join(', ')
                        : 'None'}
                  </p>
                </div>
                <div className="admin-item-actions">
                  <button className="secondary-button" type="button" onClick={() => startEdit(item)}>
                    Edit
                  </button>
                  <button className="secondary-button" type="button" disabled={!item.active} onClick={() => void deactivateAdmin(item)}>
                    Deactivate
                  </button>
                  <button className="danger-button" type="button" onClick={() => void removeAdmin(item)}>
                    Remove
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-manager-state">
              <h3>No administrator records yet.</h3>
              <p>The verified bootstrap owner can still manage the application.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function AdminUserForm({
  draft,
  uid,
  editing,
  onDraftChange,
  onUidChange,
}: {
  draft: AdminUserInput
  uid: string
  editing: boolean
  onDraftChange: (draft: AdminUserInput) => void
  onUidChange: (uid: string) => void
}) {
  const update = (field: keyof AdminUserInput, value: string | boolean | string[]) => {
    onDraftChange({ ...draft, [field]: value })
  }

  const toggleSection = (sectionId: string) => {
    update(
      'allowedSectionIds',
      draft.allowedSectionIds.includes(sectionId)
        ? draft.allowedSectionIds.filter((item) => item !== sectionId)
        : [...draft.allowedSectionIds, sectionId],
    )
  }

  return (
    <div className="form-grid">
      <label className="span-2">
        Firebase UID
        <input value={uid} onChange={(event) => onUidChange(event.target.value)} disabled={editing} required />
      </label>
      <label>
        Email
        <input value={draft.email} onChange={(event) => update('email', event.target.value)} required type="email" />
      </label>
      <label>
        Display name
        <input value={draft.displayName} onChange={(event) => update('displayName', event.target.value)} />
      </label>
      <label>
        Role
        <select value={draft.role} onChange={(event) => update('role', event.target.value as AdminRole)}>
          {Object.entries(adminRoleLabels).map(([role, label]) => (
            <option key={role} value={role}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="checkbox-row">
        <input checked={draft.active} onChange={(event) => update('active', event.target.checked)} type="checkbox" />
        <span>Account is active</span>
      </label>
      {draft.role === 'editor' && (
        <fieldset className="span-2 section-checkboxes">
          <legend>Allowed sections</legend>
          {hubConfigs.map((config) => (
            <label className="checkbox-row" key={config.sectionId}>
              <input
                checked={draft.allowedSectionIds.includes(config.sectionId)}
                onChange={() => toggleSection(config.sectionId)}
                type="checkbox"
              />
              <span>
                {config.sectionName} <small>({config.sectionId})</small>
              </span>
            </label>
          ))}
        </fieldset>
      )}
    </div>
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

function hubDraftFromPage(hubPage: HubPageData): HubPageInput {
  return {
    sectionId: hubPage.sectionId,
    title: hubPage.title,
    subtitle: hubPage.subtitle,
    intro: hubPage.intro,
    description: hubPage.description,
    heroImageUrl: hubPage.heroImageUrl,
    accent: hubPage.accent,
    parentSectionId: hubPage.parentSectionId,
    childSectionIds: hubPage.childSectionIds,
    primaryButtonText: hubPage.primaryButtonText,
    primaryButtonUrl: hubPage.primaryButtonUrl,
    secondaryButtonText: hubPage.secondaryButtonText,
    secondaryButtonUrl: hubPage.secondaryButtonUrl,
    featured: hubPage.featured,
  }
}

function emptyContentDraftFor(config: (typeof hubConfigs)[number], userEmail: string): ContentItemInput {
  return {
    ...emptyContentItem,
    department: config.department,
    sectionId: config.sectionId,
    sectionName: config.sectionName,
    createdBy: userEmail,
  }
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
  const [hubDraft, setHubDraft] = useState<HubPageInput>(() => hubDraftFromPage(hubPage))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [contentDraft, setContentDraft] = useState<ContentItemInput>(() => emptyContentDraftFor(config, userEmail))
  const [statusFilter, setStatusFilter] = useState<ContentStatusFilter>('all')
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null)
  const [message, setMessage] = useState('')
  const editingItem = contentItems.find((item) => item.id === editingId)
  const visibleContentItems =
    statusFilter === 'all' ? contentItems : contentItems.filter((item) => item.status === statusFilter)

  const resetContentDraft = () => {
    setEditingId(null)
    setContentDraft(emptyContentDraftFor(config, userEmail))
    setPreviewItem(null)
    setMessage('')
  }

  const startEdit = (item: ContentItem) => {
    setEditingId(item.id)
    setContentDraft({
      title: item.title,
      summary: item.summary,
      body: item.body,
      type: item.type,
      department: item.department,
      sectionId: item.sectionId,
      sectionName: item.sectionName,
      status: item.status,
      featured: item.featured,
      mediaUrl: item.mediaUrl,
      linkUrl: item.linkUrl,
      eventDate: item.eventDate,
      imageUrl: item.imageUrl,
      createdBy: item.createdBy || userEmail,
      sortOrder: item.sortOrder,
    })
    setPreviewItem(null)
    setMessage('')
  }

  const saveHub = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')

    try {
      await saveHubPage(config.sectionId, {
        ...hubDraft,
        sectionId: config.sectionId,
        childSectionIds: config.children,
      })
      setMessage('Hub page settings saved.')
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'Could not save hub page settings.')
    }
  }

  const saveContent = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')

    const payload = {
      ...contentDraft,
      department: config.department,
      sectionId: config.sectionId,
      sectionName: config.sectionName,
      createdBy: contentDraft.createdBy || userEmail,
      sortOrder: contentDraft.sortOrder ?? contentItems.length + 1,
    }

    try {
      if (editingId) {
        await updateContentItem(editingId, payload)
        setMessage('Content item updated.')
      } else {
        await createContentItem(payload)
        resetContentDraft()
        setMessage('Content item created.')
      }
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'Could not save content item.')
    }
  }

  const setItemStatus = async (item: ContentItem, status: ContentStatus) => {
    await updateContentItem(item.id, { status })
    setMessage(`"${item.title}" moved to ${contentStatusLabels[status]}.`)
  }

  const duplicateItem = async (item: ContentItem) => {
    await createContentItem({
      title: `${item.title} Copy`,
      summary: item.summary,
      body: item.body,
      type: item.type,
      department: config.department,
      sectionId: config.sectionId,
      sectionName: config.sectionName,
      status: 'draft',
      featured: false,
      mediaUrl: item.mediaUrl,
      linkUrl: item.linkUrl,
      eventDate: item.eventDate,
      imageUrl: item.imageUrl,
      createdBy: userEmail,
      sortOrder: contentItems.length + 1,
    })
    setMessage(`"${item.title}" duplicated as a draft.`)
  }

  const deleteItem = async (item: ContentItem) => {
    if (!confirmDelete(`Delete "${item.title}"? This cannot be undone.`)) {
      return
    }

    await deleteContentItem(item.id)
    if (previewItem?.id === item.id) {
      setPreviewItem(null)
    }
    if (editingId === item.id) {
      resetContentDraft()
    }
    setMessage(`"${item.title}" deleted.`)
  }

  const moveItem = async (item: ContentItem, direction: -1 | 1) => {
    const orderedItems = contentItems.map((contentItem, index) => ({
      ...contentItem,
      sortOrder: contentItem.sortOrder ?? index + 1,
    }))
    const currentIndex = orderedItems.findIndex((contentItem) => contentItem.id === item.id)
    const swapIndex = currentIndex + direction

    if (currentIndex < 0 || swapIndex < 0 || swapIndex >= orderedItems.length) {
      return
    }

    const current = orderedItems[currentIndex]
    const swap = orderedItems[swapIndex]
    await Promise.all([
      updateContentItem(current.id, { sortOrder: swap.sortOrder }),
      updateContentItem(swap.id, { sortOrder: current.sortOrder }),
    ])
    setMessage(`"${item.title}" display order updated.`)
  }

  return (
    <section className="admin-page performance-admin">
      <PageHeading
        eyebrow="Teacher dashboard"
        title={`Manage ${config.sectionName}`}
        body={`Create, preview, publish, hide, and order content for ${config.sectionName}.`}
      />
      <div className="admin-actions">
        <Link className="secondary-button" to="/admin/hubs">
          All Hubs
        </Link>
        <Link className="secondary-button" to={config.route}>
          View public page
        </Link>
        <button className="primary-button blue" type="button" onClick={resetContentDraft}>
          Add content
        </button>
      </div>
      <p className="content-admin-context">
        Managing hub: <strong>{config.sectionName}</strong> <span>{config.route}</span>
      </p>
      {message && <p className="form-message">{message}</p>}
      {loading && <PageMessage title="Loading content" body="Fetching content items..." />}
      {error && <PageMessage title="Could not load content" body={error} />}

      <div className="content-admin-grid">
        <div className="content-admin-list">
          <form className="content-editor" onSubmit={saveHub}>
            <div className="modal-header">
              <h2>Hub Page Settings</h2>
            </div>
            <HubSettingsForm draft={hubDraft} onChange={setHubDraft} />
            <button className="primary-button" type="submit">
              Save Hub Settings
            </button>
          </form>

          <form className="content-editor" onSubmit={saveContent}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Content Item' : 'Create Content Item'}</h2>
            </div>
            <ContentItemForm draft={contentDraft} onChange={setContentDraft} />
            <button className="primary-button" type="submit">
              {editingItem ? 'Save Content' : 'Create Content'}
            </button>
          </form>

          {previewItem && (
            <section className="content-editor preview-panel" aria-label="Content preview">
              <div className="modal-header">
                <h2>Preview</h2>
                <button className="small-button" type="button" onClick={() => setPreviewItem(null)}>
                  Close
                </button>
              </div>
              <ContentCard item={previewItem} />
            </section>
          )}
        </div>

        <div className="content-admin-list">
          <div className="section-heading content-manager-heading">
            <div>
              <h2>Content Items</h2>
              <p>{contentItems.length} total items for {config.sectionName}</p>
            </div>
            <label>
              Status
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ContentStatusFilter)}>
                {contentStatusFilters.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All' : contentStatusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {!visibleContentItems.length && !loading ? (
            <div className="empty-manager-state">
              <h3>{contentItems.length ? 'No items match this filter.' : 'No content items yet.'}</h3>
              <p>
                {contentItems.length
                  ? 'Choose another status filter to see more content.'
                  : 'Use Add content to create a draft, then publish it when it is ready.'}
              </p>
            </div>
          ) : (
            visibleContentItems.map((item) => (
              <article className="admin-item content-admin-item" key={item.id}>
                <div>
                  <div className="content-item-badges">
                    <span className="badge">{contentTypeLabels[item.type]}</span>
                    <span className={`status-badge status-${item.status}`}>{contentStatusLabels[item.status]}</span>
                  </div>
                  <h2>{item.title}</h2>
                  <p className="meta">
                    {config.sectionName} {item.eventDate ? `/ ${formatEventDate(item.eventDate)}` : ''}
                  </p>
                  <p>{item.summary}</p>
                </div>
                <div className="admin-item-actions">
                  <button
                    className="secondary-button icon-button"
                    disabled={contentItems[0]?.id === item.id}
                    type="button"
                    onClick={() => void moveItem(item, -1)}
                    title="Move up"
                  >
                    Up
                  </button>
                  <button
                    className="secondary-button icon-button"
                    disabled={contentItems[contentItems.length - 1]?.id === item.id}
                    type="button"
                    onClick={() => void moveItem(item, 1)}
                    title="Move down"
                  >
                    Down
                  </button>
                  <button className="secondary-button" type="button" onClick={() => startEdit(item)}>
                    Edit
                  </button>
                  <button className="secondary-button" type="button" onClick={() => setPreviewItem(item)}>
                    Preview
                  </button>
                  <button className="secondary-button" type="button" onClick={() => void duplicateItem(item)}>
                    Duplicate
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => void setItemStatus(item, item.status === 'published' ? 'hidden' : 'published')}
                  >
                    {item.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => void deleteItem(item)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function HubSettingsForm({
  draft,
  onChange,
}: {
  draft: HubPageInput
  onChange: (draft: HubPageInput) => void
}) {
  const update = (field: keyof HubPageInput, value: string | boolean) => {
    onChange({ ...draft, [field]: value })
  }

  return (
    <div className="form-grid">
      <label>
        Title
        <input value={draft.title} onChange={(event) => update('title', event.target.value)} required />
      </label>
      <label>
        Subtitle
        <input value={draft.subtitle} onChange={(event) => update('subtitle', event.target.value)} />
      </label>
      <label className="span-2">
        Intro
        <input value={draft.intro} onChange={(event) => update('intro', event.target.value)} />
      </label>
      <label className="span-2">
        Description
        <textarea value={draft.description} onChange={(event) => update('description', event.target.value)} />
      </label>
      <label>
        Hero image URL
        <input value={draft.heroImageUrl} onChange={(event) => update('heroImageUrl', event.target.value)} type="url" />
      </label>
      <label>
        Accent color
        <input value={draft.accent} onChange={(event) => update('accent', event.target.value)} />
      </label>
      <label>
        Primary button text
        <input value={draft.primaryButtonText} onChange={(event) => update('primaryButtonText', event.target.value)} />
      </label>
      <label>
        Primary button URL
        <input value={draft.primaryButtonUrl} onChange={(event) => update('primaryButtonUrl', event.target.value)} />
      </label>
      <label>
        Secondary button text
        <input value={draft.secondaryButtonText} onChange={(event) => update('secondaryButtonText', event.target.value)} />
      </label>
      <label>
        Secondary button URL
        <input value={draft.secondaryButtonUrl} onChange={(event) => update('secondaryButtonUrl', event.target.value)} />
      </label>
      <label className="checkbox-row span-2">
        <input checked={draft.featured} onChange={(event) => update('featured', event.target.checked)} type="checkbox" />
        <span>Feature this hub in admin lists</span>
      </label>
    </div>
  )
}

function ContentItemForm({
  draft,
  onChange,
}: {
  draft: ContentItemInput
  onChange: (draft: ContentItemInput) => void
}) {
  const update = (field: keyof ContentItemInput, value: string | boolean) => {
    onChange({ ...draft, [field]: value })
  }

  return (
    <div className="form-grid">
      <label>
        Title
        <input value={draft.title} onChange={(event) => update('title', event.target.value)} required />
      </label>
      <label>
        Type
        <select value={draft.type} onChange={(event) => update('type', event.target.value as ContentType)} required>
          {contentTypes.map((type) => (
            <option key={type} value={type}>
              {contentTypeLabels[type]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Status
        <select value={draft.status} onChange={(event) => update('status', event.target.value as ContentStatus)} required>
          {Object.entries(contentStatusLabels).map(([status, label]) => (
            <option key={status} value={status}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Event date
        <input value={draft.eventDate} onChange={(event) => update('eventDate', event.target.value)} type="date" />
      </label>
      <label className="span-2">
        Summary
        <input value={draft.summary} onChange={(event) => update('summary', event.target.value)} required />
      </label>
      <label className="span-2">
        Body
        <textarea value={draft.body} onChange={(event) => update('body', event.target.value)} />
      </label>
      <label>
        YouTube or Google Drive link
        <input value={draft.mediaUrl} onChange={(event) => update('mediaUrl', event.target.value)} type="url" />
      </label>
      <label>
        Webpage/resource link
        <input value={draft.linkUrl} onChange={(event) => update('linkUrl', event.target.value)} type="url" />
      </label>
      <label className="span-2">
        Image URL
        <input value={draft.imageUrl} onChange={(event) => update('imageUrl', event.target.value)} type="url" />
      </label>
      <label className="checkbox-row span-2">
        <input checked={draft.featured} onChange={(event) => update('featured', event.target.checked)} type="checkbox" />
        <span>Feature this item on the public hub</span>
      </label>
    </div>
  )
}

function PendingPage() {
  const { projects, loading, error } = useProjects('pending')
  const { t } = useLanguage()

  return (
    <AdminListPage
      title={t('pendingTitle')}
      body={t('pendingBody')}
      empty={t('noPending')}
      error={error}
      loading={loading}
      projects={projects}
      renderActions={(project) => (
        <>
          <button
            className="primary-button"
            type="button"
            onClick={() => void updateProject(project.id, { status: 'approved' })}
          >
            {t('approve')}
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => void updateProject(project.id, { status: 'rejected' })}
          >
            {t('reject')}
          </button>
          <button
            className="danger-button"
            type="button"
            onClick={() => {
              if (confirmDelete(`Delete "${project.title}"? This cannot be undone.`)) {
                void deleteProject(project.id)
              }
            }}
          >
            {t('delete')}
          </button>
        </>
      )}
    />
  )
}

function ApprovedPage() {
  const { projects, loading, error } = useProjects('approved')
  const { t } = useLanguage()
  const [editingId, setEditingId] = useState<string | null>(null)
  const editingProject = projects.find((project) => project.id === editingId)

  return (
    <section className="admin-page">
      <PageHeading
        eyebrow={t('approvedEyebrow')}
        title={t('approvedTitle')}
        body={t('approvedBody')}
      />
      {loading && <PageMessage title={t('loadingApprovedTitle')} body={t('loadingApprovedBody')} />}
      {error && <PageMessage title={t('couldNotLoadProjects')} body={error} />}
      {!loading && !projects.length && <PageMessage title={t('noApprovedAdminTitle')} body={t('approveFirst')} />}

      <div className="admin-list">
        {projects.map((project) => (
          <article className="admin-item" key={project.id}>
            <ProjectPreview project={project} />
            <div className="admin-item-actions">
              <button className="secondary-button" type="button" onClick={() => setEditingId(project.id)}>
                {t('edit')}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => void updateProject(project.id, { featured: !project.featured })}
              >
                {project.featured ? t('unfeature') : t('feature')}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => void updateProject(project.id, { studentPick: !project.studentPick })}
              >
                {project.studentPick ? t('removePick') : t('studentPick')}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => void updateProject(project.id, { status: 'hidden' })}
              >
                {t('hide')}
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={() => {
                  if (confirmDelete(`Delete "${project.title}"? This cannot be undone.`)) {
                    void deleteProject(project.id)
                  }
                }}
              >
                {t('delete')}
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
            await updateProject(editingProject.id, nextProject)
            setEditingId(null)
          }}
        />
      )}
    </section>
  )
}

function AdminListPage({
  title,
  body,
  empty,
  projects,
  loading,
  error,
  renderActions,
}: {
  title: string
  body: string
  empty: string
  projects: Project[]
  loading: boolean
  error: string
  renderActions: (project: Project) => ReactElement
}) {
  const { t } = useLanguage()

  return (
    <section className="admin-page">
      <PageHeading eyebrow={t('teacherReview')} title={title} body={body} />
      {loading && <PageMessage title={t('loadingProjectsTitle')} body={t('reviewQueueBody')} />}
      {error && <PageMessage title={t('couldNotLoadProjects')} body={error} />}
      {!loading && !projects.length && <PageMessage title={empty} body={t('nothingNeedsAttention')} />}
      <div className="admin-list">
        {projects.map((project) => (
          <article className="admin-item" key={project.id}>
            <ProjectPreview project={project} />
            <div className="admin-item-actions">{renderActions(project)}</div>
          </article>
        ))}
      </div>
    </section>
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
