import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, setDoc, updateDoc } from 'firebase/firestore'

let testEnv: RulesTestEnvironment
const projectId = 'publish-state-regression'
const contributorUid = 'contributor-user'
const publisherUid = 'publisher-user'
const contributorAuth = { email: 'contributor@example.com', email_verified: true }
const publisherAuth = { email: 'publisher@example.com', email_verified: true }

function item(status: 'draft' | 'scheduled' | 'published' | 'hidden', title = 'Valid title') {
  return {
    title,
    summary: 'Valid summary',
    body: 'Valid body',
    type: 'announcement',
    department: 'ESL',
    sectionId: 'esl-science',
    sectionName: 'Science',
    status,
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
    createdBy: 'staff@example.com',
  }
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
})

beforeEach(async () => {
  await testEnv.clearFirestore()
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await setDoc(doc(db, 'adminUsers', contributorUid), {
      role: 'editor', active: true, allowedSectionIds: ['esl-science'],
      permissions: { createContent: true, editContent: true, publishContent: false },
    })
    await setDoc(doc(db, 'adminUsers', publisherUid), {
      role: 'editor', active: true, allowedSectionIds: ['esl-science'],
      permissions: { createContent: true, editContent: true, publishContent: true },
    })
    await setDoc(doc(db, 'contentItems', 'draft'), item('draft'))
    await setDoc(doc(db, 'contentItems', 'scheduled'), item('scheduled'))
    await setDoc(doc(db, 'contentItems', 'published'), item('published'))
    await setDoc(doc(db, 'contentItems', 'hidden'), item('hidden'))
  })
})

afterAll(async () => testEnv.cleanup())

describe('publish-controlled updates', () => {
  it('allows contributors to edit drafts but not controlled states', async () => {
    const db = testEnv.authenticatedContext(contributorUid, contributorAuth).firestore()
    await assertSucceeds(updateDoc(doc(db, 'contentItems', 'draft'), { title: 'Draft edit' }))
    await assertFails(updateDoc(doc(db, 'contentItems', 'scheduled'), { title: 'Scheduled edit' }))
    await assertFails(updateDoc(doc(db, 'contentItems', 'published'), { title: 'Published edit' }))
    await assertFails(updateDoc(doc(db, 'contentItems', 'hidden'), { title: 'Hidden edit' }))
  })

  it('blocks contributors from controlled transitions in either direction', async () => {
    const db = testEnv.authenticatedContext(contributorUid, contributorAuth).firestore()
    await assertFails(updateDoc(doc(db, 'contentItems', 'draft'), { status: 'scheduled' }))
    await assertFails(updateDoc(doc(db, 'contentItems', 'draft'), { status: 'published' }))
    await assertFails(updateDoc(doc(db, 'contentItems', 'scheduled'), { status: 'draft' }))
    await assertFails(updateDoc(doc(db, 'contentItems', 'published'), { status: 'draft' }))
  })

  it('allows publishers to edit and transition controlled content', async () => {
    const db = testEnv.authenticatedContext(publisherUid, publisherAuth).firestore()
    await assertSucceeds(updateDoc(doc(db, 'contentItems', 'scheduled'), { title: 'Scheduled edit' }))
    await assertSucceeds(updateDoc(doc(db, 'contentItems', 'published'), { title: 'Published edit' }))
    await assertSucceeds(updateDoc(doc(db, 'contentItems', 'hidden'), { title: 'Hidden edit' }))
    await assertSucceeds(updateDoc(doc(db, 'contentItems', 'draft'), { status: 'scheduled' }))
    await assertSucceeds(updateDoc(doc(db, 'contentItems', 'scheduled'), { status: 'published' }))
    await assertSucceeds(updateDoc(doc(db, 'contentItems', 'hidden'), { status: 'draft' }))
  })
})
