import { readFileSync } from 'node:fs'
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'

let testEnv: RulesTestEnvironment

const projectId = 'eep-student-showcase-rules-test'
const bootstrapUid = 'bootstrap-owner'
const editorUid = 'science-editor'
const publisherUid = 'science-publisher'
const disabledEditorUid = 'disabled-editor'
const recordSuperAdminUid = 'record-super-admin'
const wrongBootstrapEmailUid = 'wrong-bootstrap'
const unverifiedBootstrapUid = 'unverified-bootstrap'
const bootstrapAuth = {
  email: 'gastonstuart@googlemail.com',
  email_verified: true,
}
const editorAuth = {
  email: 'science.editor@example.com',
  email_verified: true,
}
const publisherAuth = {
  email: 'science.publisher@example.com',
  email_verified: true,
}
const disabledEditorAuth = {
  email: 'disabled.editor@example.com',
  email_verified: true,
}
const recordSuperAdminAuth = {
  email: 'record.super@example.com',
  email_verified: true,
}
const wrongBootstrapEmailAuth = {
  email: 'not-gastonstuart@googlemail.com',
  email_verified: true,
}
const unverifiedBootstrapAuth = {
  email: 'gastonstuart@googlemail.com',
  email_verified: false,
}

const fullPermissions = {
  manageUsers: true,
  manageProjects: true,
  manageHubSettings: true,
  createContent: true,
  editContent: true,
  publishContent: true,
  deleteContent: true,
  viewAuditLog: true,
}

const pendingProject = {
  sectionId: 'eep',
  title: 'Student Google Site',
  groupName: 'Team One',
  className: 'EEP 8A',
  members: 'A, B',
  category: 'Creative Projects',
  description: 'A student-built public website for review.',
  audience: 'Classmates',
  impact: 'Shares student learning with a real audience.',
  googleSitesUrl: 'https://sites.google.com/view/student-site',
  imageUrl: '',
  status: 'pending',
  featured: false,
  studentPick: false,
  publiclyVisible: false,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
}

const validContentItem = {
  title: 'Public Update',
  summary: 'Visible',
  body: '',
  type: 'announcement',
  department: 'ESL',
  sectionId: 'esl-science',
  sectionName: 'Science',
  status: 'draft',
  featured: false,
  mediaUrl: '',
  linkUrl: '',
  eventDate: '',
  imageUrl: '',
  displayStyle: 'standard',
  contentWidth: 'normal',
  imagePlacement: 'top',
  textAlignment: 'left',
  accentStyle: 'none',
  ctaStyle: 'hidden',
  createdBy: 'science.editor@example.com',
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  })
})

afterEach(async () => {
  await testEnv.clearFirestore()
})

afterAll(async () => {
  await testEnv?.cleanup()
})

async function seedAdminUsers() {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await setDoc(doc(db, 'adminUsers', editorUid), {
      email: editorAuth.email,
      displayName: 'Science Editor',
      role: 'editor',
      active: true,
      allowedSectionIds: ['esl-science'],
      permissions: {
        manageUsers: false,
        manageProjects: false,
        manageHubSettings: false,
        createContent: true,
        editContent: true,
        publishContent: false,
        deleteContent: false,
        viewAuditLog: false,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    await setDoc(doc(db, 'adminUsers', disabledEditorUid), {
      email: disabledEditorAuth.email,
      displayName: 'Disabled Editor',
      role: 'editor',
      active: false,
      allowedSectionIds: ['esl-science'],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    await setDoc(doc(db, 'adminUsers', publisherUid), {
      email: publisherAuth.email,
      displayName: 'Science Publisher',
      role: 'editor',
      active: true,
      allowedSectionIds: ['esl-science'],
      permissions: {
        manageUsers: false,
        manageProjects: false,
        manageHubSettings: false,
        createContent: true,
        editContent: true,
        publishContent: true,
        deleteContent: false,
        viewAuditLog: false,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    await setDoc(doc(db, 'adminUsers', recordSuperAdminUid), {
      email: recordSuperAdminAuth.email,
      displayName: 'Record Super Admin',
      role: 'superAdmin',
      active: true,
      allowedSectionIds: ['*'],
      permissions: fullPermissions,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })
}

describe('Firestore security rules', () => {
  it('allows unauthenticated users to read approved projects and published content only', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      await setDoc(doc(db, 'projects', 'approved'), { ...pendingProject, status: 'approved', publiclyVisible: true })
      await setDoc(doc(db, 'projects', 'pending'), pendingProject)
      await setDoc(doc(db, 'contentItems', 'published'), {
        title: 'Published',
        summary: 'Visible',
        body: '',
        type: 'announcement',
        department: 'ESL',
        sectionId: 'esl-science',
        sectionName: 'Science',
        status: 'published',
        featured: false,
        mediaUrl: '',
        linkUrl: '',
        eventDate: '',
        imageUrl: '',
        displayStyle: 'standard',
        contentWidth: 'normal',
        imagePlacement: 'top',
        textAlignment: 'left',
        accentStyle: 'none',
        ctaStyle: 'hidden',
        createdBy: '',
      })
      await setDoc(doc(db, 'contentItems', 'draft'), {
        title: 'Draft',
        summary: 'Private',
        body: '',
        type: 'announcement',
        department: 'ESL',
        sectionId: 'esl-science',
        sectionName: 'Science',
        status: 'draft',
        featured: false,
        mediaUrl: '',
        linkUrl: '',
        eventDate: '',
        imageUrl: '',
        displayStyle: 'standard',
        contentWidth: 'normal',
        imagePlacement: 'top',
        textAlignment: 'left',
        accentStyle: 'none',
        ctaStyle: 'hidden',
        createdBy: '',
      })
    })

    const db = testEnv.unauthenticatedContext().firestore()
    await assertSucceeds(getDoc(doc(db, 'projects', 'approved')))
    await assertFails(getDoc(doc(db, 'projects', 'pending')))
    await assertSucceeds(getDoc(doc(db, 'contentItems', 'published')))
    await assertFails(getDoc(doc(db, 'contentItems', 'draft')))
  })

  it('allows public pending project creation and rejects approved creation, updates, and deletes', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertSucceeds(setDoc(doc(db, 'projects', 'pending-public'), pendingProject))
    await assertFails(setDoc(doc(db, 'projects', 'approved-public'), { ...pendingProject, status: 'approved', publiclyVisible: true }))
    await assertFails(updateDoc(doc(db, 'projects', 'pending-public'), { status: 'approved' }))
    await assertFails(deleteDoc(doc(db, 'projects', 'pending-public')))
  })

  it('rejects invalid public pending submissions', async () => {
    const db = testEnv.unauthenticatedContext().firestore()

    await assertFails(setDoc(doc(db, 'projects', 'bad-site'), {
      ...pendingProject,
      googleSitesUrl: 'https://example.com/not-google-sites',
    }))
    await assertFails(setDoc(doc(db, 'projects', 'bad-image'), {
      ...pendingProject,
      imageUrl: 'http://example.com/image.jpg',
    }))
    await assertFails(setDoc(doc(db, 'projects', 'bad-featured'), {
      ...pendingProject,
      featured: true,
    }))
  })

  it('rejects invalid content appearance values', async () => {
    const db = testEnv.authenticatedContext(editorUid, editorAuth).firestore()

    await assertFails(setDoc(doc(db, 'contentItems', 'bad-display'), {
      ...validContentItem,
      displayStyle: 'unexpected',
    }))

    await assertFails(setDoc(doc(db, 'contentItems', 'bad-badge'), {
      ...validContentItem,
      badgeText: 'x'.repeat(25),
    }))
  })

  it('allows the protected bootstrap owner to manage protected content without email-verification onboarding', async () => {
    const db = testEnv.authenticatedContext(bootstrapUid, bootstrapAuth).firestore()
    await assertSucceeds(setDoc(doc(db, 'contentItems', 'science'), {
      title: 'Science',
      summary: 'Admin write',
      body: '',
      type: 'announcement',
      department: 'ESL',
      sectionId: 'esl-science',
      sectionName: 'Science',
      status: 'draft',
      featured: false,
      mediaUrl: '',
      linkUrl: '',
      eventDate: '',
      imageUrl: '',
      displayStyle: 'standard',
      contentWidth: 'normal',
      imagePlacement: 'top',
      textAlignment: 'left',
      accentStyle: 'none',
      ctaStyle: 'hidden',
      createdBy: bootstrapAuth.email,
    }))
    await assertFails(setDoc(doc(db, 'adminUsers', 'new-admin'), {
      email: 'new@example.com',
      displayName: 'New Admin',
      role: 'editor',
      active: true,
      allowedSectionIds: ['eep'],
    }))
  })

  it('requires the bootstrap super admin to use the exact owner email, not email verification', async () => {
    const wrongEmailDb = testEnv.authenticatedContext(wrongBootstrapEmailUid, wrongBootstrapEmailAuth).firestore()
    const unverifiedDb = testEnv.authenticatedContext(unverifiedBootstrapUid, unverifiedBootstrapAuth).firestore()

    await assertFails(setDoc(doc(wrongEmailDb, 'adminUsers', 'blocked-wrong-email'), {
      email: 'blocked@example.com',
      displayName: 'Blocked',
      role: 'editor',
      active: true,
      allowedSectionIds: ['eep'],
    }))
    await assertSucceeds(setDoc(doc(unverifiedDb, 'contentItems', 'owner-without-email-verification'), {
      title: 'Owner',
      summary: 'Owner write',
      body: '',
      type: 'announcement',
      department: 'ESL',
      sectionId: 'esl-science',
      sectionName: 'Science',
      status: 'draft',
      featured: false,
      mediaUrl: '',
      linkUrl: '',
      eventDate: '',
      imageUrl: '',
      displayStyle: 'standard',
      contentWidth: 'normal',
      imagePlacement: 'top',
      textAlignment: 'left',
      accentStyle: 'none',
      ctaStyle: 'hidden',
      createdBy: unverifiedBootstrapAuth.email,
    }))
  })

  it('allows active adminUsers super admins to manage protected data', async () => {
    await seedAdminUsers()
    const db = testEnv.authenticatedContext(recordSuperAdminUid, recordSuperAdminAuth).firestore()

    await assertFails(setDoc(doc(db, 'adminUsers', 'managed-by-record-super'), {
      email: 'managed@example.com',
      displayName: 'Managed',
      role: 'editor',
      active: true,
      allowedSectionIds: ['eep'],
    }))
    await assertSucceeds(setDoc(doc(db, 'hubPages', 'esl-social-studies'), {
      department: 'ESL',
      sectionId: 'esl-social-studies',
      sectionName: 'Social Studies',
      title: 'Social Studies',
      subtitle: 'Published settings',
      body: 'Visible hub copy',
      accent: '#b45f24',
      heroImageUrl: '',
      updatedAt: serverTimestamp(),
    }))
  })

  it('allows editor access to allowed sections and rejects disallowed sections and admin management', async () => {
    await seedAdminUsers()
    const db = testEnv.authenticatedContext(editorUid, editorAuth).firestore()

    await assertSucceeds(setDoc(doc(db, 'contentItems', 'allowed'), {
      title: 'Allowed',
      summary: 'Allowed',
      body: '',
      type: 'announcement',
      department: 'ESL',
      sectionId: 'esl-science',
      sectionName: 'Science',
      status: 'draft',
      featured: false,
      mediaUrl: '',
      linkUrl: '',
      eventDate: '',
      imageUrl: '',
      displayStyle: 'standard',
      contentWidth: 'normal',
      imagePlacement: 'top',
      textAlignment: 'left',
      accentStyle: 'none',
      ctaStyle: 'hidden',
      createdBy: editorAuth.email,
    }))
    await assertFails(setDoc(doc(db, 'contentItems', 'blocked'), {
      title: 'Blocked',
      summary: 'Blocked',
      body: '',
      type: 'announcement',
      department: 'ESL',
      sectionId: 'esl-social-studies',
      sectionName: 'Social Studies',
      status: 'draft',
      featured: false,
      mediaUrl: '',
      linkUrl: '',
      eventDate: '',
      imageUrl: '',
      displayStyle: 'standard',
      contentWidth: 'normal',
      imagePlacement: 'top',
      textAlignment: 'left',
      accentStyle: 'none',
      ctaStyle: 'hidden',
      createdBy: editorAuth.email,
    }))
    await assertFails(setDoc(doc(db, 'adminUsers', 'escalation'), {
      email: 'escalation@example.com',
      displayName: 'Escalation',
      role: 'superAdmin',
      active: true,
      allowedSectionIds: ['*'],
    }))
  })

  it('requires publish permission for scheduled and published content states', async () => {
    await seedAdminUsers()
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      await setDoc(doc(db, 'contentItems', 'editor-draft'), validContentItem)
      await setDoc(doc(db, 'contentItems', 'publisher-draft'), {
        ...validContentItem,
        title: 'Publisher Draft',
        createdBy: publisherAuth.email,
      })
      await setDoc(doc(db, 'contentItems', 'publisher-scheduled'), {
        ...validContentItem,
        title: 'Publisher Scheduled',
        status: 'scheduled',
        createdBy: publisherAuth.email,
      })
    })

    const editorDb = testEnv.authenticatedContext(editorUid, editorAuth).firestore()
    await assertSucceeds(setDoc(doc(editorDb, 'contentItems', 'editor-new-draft'), {
      ...validContentItem,
      title: 'Editor New Draft',
    }))
    await assertFails(setDoc(doc(editorDb, 'contentItems', 'editor-new-scheduled'), {
      ...validContentItem,
      title: 'Editor New Scheduled',
      status: 'scheduled',
    }))
    await assertFails(setDoc(doc(editorDb, 'contentItems', 'editor-new-published'), {
      ...validContentItem,
      title: 'Editor New Published',
      status: 'published',
    }))
    await assertSucceeds(updateDoc(doc(editorDb, 'contentItems', 'editor-draft'), {
      title: 'Edited Draft',
    }))
    await assertFails(updateDoc(doc(editorDb, 'contentItems', 'editor-draft'), {
      status: 'scheduled',
    }))
    await assertFails(updateDoc(doc(editorDb, 'contentItems', 'editor-draft'), {
      status: 'published',
    }))

    const publisherDb = testEnv.authenticatedContext(publisherUid, publisherAuth).firestore()
    await assertSucceeds(setDoc(doc(publisherDb, 'contentItems', 'publisher-new-scheduled'), {
      ...validContentItem,
      title: 'Publisher New Scheduled',
      status: 'scheduled',
      createdBy: publisherAuth.email,
    }))
    await assertSucceeds(setDoc(doc(publisherDb, 'contentItems', 'publisher-new-published'), {
      ...validContentItem,
      title: 'Publisher New Published',
      status: 'published',
      createdBy: publisherAuth.email,
    }))
    await assertSucceeds(updateDoc(doc(publisherDb, 'contentItems', 'publisher-draft'), {
      status: 'scheduled',
    }))
    await assertSucceeds(updateDoc(doc(publisherDb, 'contentItems', 'publisher-scheduled'), {
      status: 'published',
    }))
  })

  it('rejects disabled administrator writes', async () => {
    await seedAdminUsers()
    const db = testEnv.authenticatedContext(disabledEditorUid, disabledEditorAuth).firestore()

    await assertFails(setDoc(doc(db, 'contentItems', 'disabled'), {
      title: 'Disabled',
      summary: 'Disabled',
      body: '',
      type: 'announcement',
      department: 'ESL',
      sectionId: 'esl-science',
      sectionName: 'Science',
      status: 'draft',
      featured: false,
      mediaUrl: '',
      linkUrl: '',
      eventDate: '',
      imageUrl: '',
      displayStyle: 'standard',
      contentWidth: 'normal',
      imagePlacement: 'top',
      textAlignment: 'left',
      accentStyle: 'none',
      ctaStyle: 'hidden',
      createdBy: disabledEditorAuth.email,
    }))
  })
})
