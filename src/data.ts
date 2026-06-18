import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  ContentItem,
  ContentItemInput,
  ContentStatus,
  AdminUser,
  AdminUserInput,
  HubPage,
  HubPageInput,
  Project,
  ProjectInput,
  ProjectStatus,
  AuditLogEntry,
} from './types'
import { normalizeStaffPermissions } from './utils/authorization'
import { normalizeStaffUsername, protectedOwnerEmail, protectedOwnerUsername } from './utils/staffAuth'
import { normalizeContentAppearance, sanitizeContentItemInput } from './utils/contentAppearance'

const projectsPath = 'projects'
const contentItemsPath = 'contentItems'
const hubPagesPath = 'hubPages'
const adminUsersPath = 'adminUsers'
const auditLogsPath = 'auditLogs'

const requireDb = () => {
  if (!db) {
    throw new Error('Firebase is not configured. Add VITE_FIREBASE_* values to your environment.')
  }

  return db
}

const fromFirestore = (id: string, data: DocumentData): Project => ({
  id,
  title: data.title ?? '',
  groupName: data.groupName ?? '',
  className: data.className ?? '',
  members: data.members ?? '',
  category: data.category ?? 'Creative Projects',
  description: data.description ?? '',
  audience: data.audience ?? '',
  impact: data.impact ?? '',
  googleSitesUrl: data.googleSitesUrl ?? '',
  imageUrl: data.imageUrl ?? '',
  status: data.status ?? 'pending',
  featured: Boolean(data.featured),
  studentPick: Boolean(data.studentPick),
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
})

const contentItemFromFirestore = (id: string, data: DocumentData): ContentItem => ({
  id,
  title: data.title ?? '',
  summary: data.summary ?? '',
  body: data.body ?? '',
  type: data.type ?? 'announcement',
  department: data.department ?? 'ESL',
  sectionId: data.sectionId ?? '',
  sectionName: data.sectionName ?? '',
  status: data.status ?? 'draft',
  featured: Boolean(data.featured),
  mediaUrl: data.mediaUrl ?? '',
  linkUrl: data.linkUrl ?? '',
  eventDate: data.eventDate ?? '',
  imageUrl: data.imageUrl ?? '',
  ...normalizeContentAppearance(data),
  publishDate: data.publishDate ?? '',
  expiryDate: data.expiryDate ?? '',
  actionLabel: data.actionLabel ?? '',
  actionUrl: data.actionUrl ?? '',
  actionStyle: data.actionStyle ?? data.ctaStyle ?? 'link',
  actionNewTab: Boolean(data.actionNewTab ?? true),
  secondaryActionLabel: data.secondaryActionLabel ?? '',
  secondaryActionUrl: data.secondaryActionUrl ?? '',
  secondaryActionStyle: data.secondaryActionStyle ?? 'secondary',
  secondaryActionNewTab: Boolean(data.secondaryActionNewTab ?? true),
  imageAlt: data.imageAlt ?? '',
  thumbnailUrl: data.thumbnailUrl ?? '',
  hideImage: Boolean(data.hideImage),
  pinned: Boolean(data.pinned),
  createdBy: data.createdBy ?? '',
  sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : undefined,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
})

function stripUndefinedFields<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)) as T
}

const hubPageFromFirestore = (id: string, data: DocumentData): HubPage => ({
  id,
  sectionId: data.sectionId ?? id,
  title: data.title ?? '',
  subtitle: data.subtitle ?? '',
  intro: data.intro ?? '',
  description: data.description ?? '',
  heroImageUrl: data.heroImageUrl ?? '',
  accent: data.accent ?? data.themeColor ?? '#006bd6',
  parentSectionId: data.parentSectionId ?? '',
  childSectionIds: Array.isArray(data.childSectionIds) ? data.childSectionIds : [],
  primaryButtonText: data.primaryButtonText ?? '',
  primaryButtonUrl: data.primaryButtonUrl ?? '',
  secondaryButtonText: data.secondaryButtonText ?? '',
  secondaryButtonUrl: data.secondaryButtonUrl ?? '',
  featured: Boolean(data.featured),
  updatedAt: data.updatedAt,
})

const adminUserFromFirestore = (id: string, data: DocumentData): AdminUser => ({
  id,
  email: data.email ?? '',
  username: data.username ?? (data.email === protectedOwnerEmail ? protectedOwnerUsername : normalizeStaffUsername(data.email ?? id)),
  normalizedUsername:
    data.normalizedUsername ?? normalizeStaffUsername(data.username ?? (data.email === protectedOwnerEmail ? protectedOwnerUsername : data.email ?? id)),
  authEmail: data.authEmail ?? data.email ?? '',
  contactEmail: data.contactEmail ?? '',
  displayName: data.displayName ?? '',
  role: data.role === 'superAdmin' || data.role === 'admin' ? data.role : 'editor',
  active: Boolean(data.active),
  protectedOwner: Boolean(data.protectedOwner) || data.email === protectedOwnerEmail,
  mustChangePassword: Boolean(data.mustChangePassword),
  allowedSectionIds: Array.isArray(data.allowedSectionIds) ? data.allowedSectionIds : [],
  permissions: normalizeStaffPermissions(
    data.role === 'superAdmin' || data.role === 'admin' ? data.role : 'editor',
    data.permissions,
  ),
  createdBy: data.createdBy ?? '',
  updatedBy: data.updatedBy ?? '',
  lastPasswordResetAt: data.lastPasswordResetAt,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
})

const auditLogFromFirestore = (id: string, data: DocumentData): AuditLogEntry => ({
  id,
  action: data.action ?? '',
  actorUid: data.actorUid ?? '',
  actorUsername: data.actorUsername ?? '',
  actorDisplayName: data.actorDisplayName ?? '',
  targetType: data.targetType ?? '',
  targetId: data.targetId ?? '',
  targetLabel: data.targetLabel ?? '',
  summary: data.summary ?? {},
  createdAt: data.createdAt,
})

export const watchProjects = (
  onChange: (projects: Project[]) => void,
  onError: (error: Error) => void,
  status?: ProjectStatus,
) => {
  const firestore = requireDb()
  const constraints: QueryConstraint[] = []

  if (status) {
    constraints.push(where('status', '==', status))
  } else {
    constraints.push(orderBy('createdAt', 'desc'))
  }

  return onSnapshot(
    query(collection(firestore, projectsPath), ...constraints),
    (snapshot) => {
      const projects = snapshot.docs
        .map((projectDoc) => fromFirestore(projectDoc.id, projectDoc.data()))
        .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))

      onChange(projects)
    },
    onError,
  )
}

export const createProject = (project: ProjectInput) =>
  addDoc(collection(requireDb(), projectsPath), {
    ...project,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

export const updateProject = (id: string, project: Partial<ProjectInput>) =>
  updateDoc(doc(requireDb(), projectsPath, id), {
    ...project,
    updatedAt: serverTimestamp(),
  })

export const deleteProject = (id: string) => deleteDoc(doc(requireDb(), projectsPath, id))

export const watchContentItems = (
  sectionId: string,
  onChange: (contentItems: ContentItem[]) => void,
  onError: (error: Error) => void,
  status?: ContentStatus,
) => {
  const firestore = requireDb()
  const sectionIds = sectionId === 'esl-performance-arts' ? ['esl-performance-arts', 'performance-arts'] : [sectionId]
  const constraints: QueryConstraint[] = [where('sectionId', 'in', sectionIds)]

  if (status) {
    constraints.push(where('status', '==', status))
  }

  return onSnapshot(
    query(collection(firestore, contentItemsPath), ...constraints),
    (snapshot) => {
      const contentItems = snapshot.docs
        .map((contentDoc) => contentItemFromFirestore(contentDoc.id, contentDoc.data()))
        .sort((a, b) => {
          const orderSort = (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER)
          const eventSort = (b.eventDate || '').localeCompare(a.eventDate || '')
          const createdSort = (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)

          return orderSort || (a.type === 'event' || b.type === 'event' ? eventSort || createdSort : createdSort)
        })

      onChange(contentItems)
    },
    onError,
  )
}

export const watchAllPublishedContentItems = (
  onChange: (contentItems: ContentItem[]) => void,
  onError: (error: Error) => void,
) => {
  const firestore = requireDb()

  return onSnapshot(
    query(collection(firestore, contentItemsPath), where('status', '==', 'published')),
    (snapshot) => {
      const contentItems = snapshot.docs
        .map((contentDoc) => contentItemFromFirestore(contentDoc.id, contentDoc.data()))
        .sort(
          (a, b) =>
            (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER) ||
            (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0),
        )

      onChange(contentItems)
    },
    onError,
  )
}

export const createContentItem = (contentItem: ContentItemInput) =>
  addDoc(collection(requireDb(), contentItemsPath), {
    ...stripUndefinedFields(sanitizeContentItemInput(contentItem)),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

export const updateContentItem = (id: string, contentItem: Partial<ContentItemInput>) =>
  updateDoc(doc(requireDb(), contentItemsPath, id), {
    ...stripUndefinedFields(contentItem),
    updatedAt: serverTimestamp(),
  })

export const deleteContentItem = (id: string) => deleteDoc(doc(requireDb(), contentItemsPath, id))

export const watchHubPage = (
  sectionId: string,
  onChange: (hubPage: HubPage | null) => void,
  onError: (error: Error) => void,
) =>
  onSnapshot(
    doc(requireDb(), hubPagesPath, sectionId),
    (snapshot) => onChange(snapshot.exists() ? hubPageFromFirestore(snapshot.id, snapshot.data()) : null),
    onError,
  )

export const watchHubPages = (onChange: (hubPages: HubPage[]) => void, onError: (error: Error) => void) =>
  onSnapshot(
    collection(requireDb(), hubPagesPath),
    (snapshot) => {
      const hubPages = snapshot.docs
        .map((hubDoc) => hubPageFromFirestore(hubDoc.id, hubDoc.data()))
        .sort((a, b) => a.sectionId.localeCompare(b.sectionId))

      onChange(hubPages)
    },
    onError,
  )

export const saveHubPage = (sectionId: string, hubPage: HubPageInput) =>
  setDoc(
    doc(requireDb(), hubPagesPath, sectionId),
    {
      ...hubPage,
      sectionId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

export const watchAdminUser = (
  uid: string,
  onChange: (adminUser: AdminUser | null) => void,
  onError: (error: Error) => void,
) =>
  onSnapshot(
    doc(requireDb(), adminUsersPath, uid),
    (snapshot) => onChange(snapshot.exists() ? adminUserFromFirestore(snapshot.id, snapshot.data()) : null),
    onError,
  )

export const watchAdminUsers = (onChange: (adminUsers: AdminUser[]) => void, onError: (error: Error) => void) =>
  onSnapshot(
    collection(requireDb(), adminUsersPath),
    (snapshot) => {
      const adminUsers = snapshot.docs
        .map((adminDoc) => adminUserFromFirestore(adminDoc.id, adminDoc.data()))
        .sort((a, b) => a.normalizedUsername.localeCompare(b.normalizedUsername))

      onChange(adminUsers)
    },
    onError,
  )

export const saveAdminUser = (uid: string, adminUser: AdminUserInput) =>
  setDoc(
    doc(requireDb(), adminUsersPath, uid),
    {
      ...adminUser,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  )

export const updateAdminUser = (uid: string, adminUser: Partial<AdminUserInput>) =>
  updateDoc(doc(requireDb(), adminUsersPath, uid), {
    ...adminUser,
    updatedAt: serverTimestamp(),
  })

export const deleteAdminUser = (uid: string) => deleteDoc(doc(requireDb(), adminUsersPath, uid))

export const watchAuditLogs = (onChange: (entries: AuditLogEntry[]) => void, onError: (error: Error) => void) =>
  onSnapshot(
    query(collection(requireDb(), auditLogsPath), orderBy('createdAt', 'desc')),
    (snapshot) => {
      onChange(snapshot.docs.map((auditDoc) => auditLogFromFirestore(auditDoc.id, auditDoc.data())))
    },
    onError,
  )

export const seedProjects = async () => {
  const firestore = requireDb()
  const existing = await getDocs(collection(firestore, projectsPath))

  if (!existing.empty) {
    return 0
  }

  const samples: ProjectInput[] = [
    {
      title: 'Taichung Food Guide',
      groupName: 'Night Market Navigators',
      className: 'EEP 8A',
      members: 'Annie Chen, Leo Lin, Marcus Wu',
      category: 'Travel & Food Guides',
      description: 'A bilingual guide to student-approved food stops across Taichung.',
      audience: 'Exchange students, visiting families, and hungry classmates.',
      impact: 'Helps visitors support local restaurants and explore confidently.',
      googleSitesUrl: 'https://sites.google.com/view/taichung-food-guide',
      imageUrl:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      status: 'approved',
      featured: true,
      studentPick: true,
    },
    {
      title: 'Basketball Club Hub',
      groupName: 'Full Court Builders',
      className: 'EEP 7B',
      members: 'Ethan Huang, Kai Wang, Jayden Liu',
      category: 'School Clubs',
      description: 'Schedules, practice notes, game recaps, and sign-up information for the club.',
      audience: 'Students interested in joining or following school basketball.',
      impact: 'Makes club communication easier and helps new players feel welcome.',
      googleSitesUrl: 'https://sites.google.com/view/basketball-club-hub',
      imageUrl:
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
      status: 'approved',
      featured: true,
      studentPick: false,
    },
    {
      title: 'Save the Ocean Campaign',
      groupName: 'Blue Future Team',
      className: 'EEP 9A',
      members: 'Mia Tsai, Nora Chang, William Ho',
      category: 'Campaigns',
      description: 'An action campaign with facts, pledge cards, and local cleanup ideas.',
      audience: 'Students and families who want simple environmental actions.',
      impact: 'Turns ocean awareness into measurable school community participation.',
      googleSitesUrl: 'https://sites.google.com/view/save-the-ocean-campaign',
      imageUrl:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      status: 'approved',
      featured: false,
      studentPick: true,
    },
    {
      title: 'Study Survival Guide',
      groupName: 'Focus Lab',
      className: 'EEP 8C',
      members: 'Sophie Lee, Ryan Peng, Chloe Yang',
      category: 'Student Help',
      description: 'A practical toolkit for planning homework, reviewing tests, and reducing stress.',
      audience: 'Middle school students balancing classes, clubs, and exams.',
      impact: 'Shares student-tested routines that make studying feel more manageable.',
      googleSitesUrl: 'https://sites.google.com/view/study-survival-guide',
      imageUrl:
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
      status: 'approved',
      featured: false,
      studentPick: false,
    },
    {
      title: 'Comic World Adventures',
      groupName: 'Panel Power',
      className: 'EEP 7A',
      members: 'Luna Kao, Felix Sun, Ariel Wu',
      category: 'Creative Projects',
      description: 'An interactive comic portal with characters, episodes, and reader polls.',
      audience: 'Young readers and classmates who enjoy original stories.',
      impact: 'Encourages creative writing, visual storytelling, and audience feedback.',
      googleSitesUrl: 'https://sites.google.com/view/comic-world-adventures',
      imageUrl:
        'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=1200&q=80',
      status: 'approved',
      featured: false,
      studentPick: true,
    },
    {
      title: 'Family Bakery Website',
      groupName: 'Sweet Street Studio',
      className: 'EEP 9B',
      members: 'Grace Lin, Owen Chen, Nina Hsu',
      category: 'Local Businesses',
      description: 'A warm website concept for a neighborhood bakery with menu and story pages.',
      audience: 'Local families and customers looking for fresh bread and cakes.',
      impact: 'Shows how student design can help small businesses explain their value online.',
      googleSitesUrl: 'https://sites.google.com/view/family-bakery-website',
      imageUrl:
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
      status: 'approved',
      featured: true,
      studentPick: false,
    },
  ]

  await Promise.all(
    samples.map((sample) =>
      addDoc(collection(firestore, projectsPath), {
        ...sample,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    ),
  )

  return samples.length
}
