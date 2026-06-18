import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

let testEnv: RulesTestEnvironment

const projectId = 'eep-student-showcase-scoped-rules-test'
const scienceEditorUid = 'science-editor-scoped'
const eepEditorUid = 'eep-editor-scoped'

const scienceEditorAuth = {
  email: 'science.editor@example.com',
  email_verified: true,
}

const eepEditorAuth = {
  email: 'eep.editor@example.com',
  email_verified: true,
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  })
})

beforeEach(async () => {
  await testEnv.clearFirestore()

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()

    await setDoc(doc(db, 'adminUsers', scienceEditorUid), {
      email: scienceEditorAuth.email,
      displayName: 'Science Editor',
      role: 'editor',
      active: true,
      allowedSectionIds: ['esl-science'],
    })

    await setDoc(doc(db, 'adminUsers', eepEditorUid), {
      email: eepEditorAuth.email,
      displayName: 'EEP Editor',
      role: 'editor',
      active: true,
      allowedSectionIds: ['eep'],
    })

    await setDoc(doc(db, 'projects', 'approved-project'), {
      title: 'Approved Project',
      status: 'approved',
    })

    await setDoc(doc(db, 'projects', 'pending-project'), {
      title: 'Pending Project',
      status: 'pending',
    })

    await setDoc(doc(db, 'contentItems', 'science-draft'), {
      title: 'Science Draft',
      sectionId: 'esl-science',
      status: 'draft',
    })

    await setDoc(doc(db, 'contentItems', 'social-studies-draft'), {
      title: 'Social Studies Draft',
      sectionId: 'esl-social-studies',
      status: 'draft',
    })

    await setDoc(doc(db, 'contentItems', 'social-studies-published'), {
      title: 'Published Social Studies',
      sectionId: 'esl-social-studies',
      status: 'published',
    })
  })
})

afterAll(async () => {
  await testEnv?.cleanup()
})

describe('section-scoped editor authorization', () => {
  it('prevents a non-EEP editor from reading pending projects or managing project records', async () => {
    const db = testEnv.authenticatedContext(scienceEditorUid, scienceEditorAuth).firestore()

    await assertSucceeds(getDoc(doc(db, 'projects', 'approved-project')))
    await assertFails(getDoc(doc(db, 'projects', 'pending-project')))
    await assertFails(setDoc(doc(db, 'projects', 'blocked-approved-project'), {
      title: 'Blocked Project',
      status: 'approved',
    }))
    await assertFails(updateDoc(doc(db, 'projects', 'pending-project'), {
      status: 'approved',
    }))
    await assertFails(deleteDoc(doc(db, 'projects', 'pending-project')))
  })

  it('allows an EEP editor to read and manage project records', async () => {
    const db = testEnv.authenticatedContext(eepEditorUid, eepEditorAuth).firestore()

    await assertSucceeds(getDoc(doc(db, 'projects', 'pending-project')))
    await assertSucceeds(setDoc(doc(db, 'projects', 'managed-project'), {
      title: 'Managed Project',
      status: 'approved',
    }))
    await assertSucceeds(updateDoc(doc(db, 'projects', 'managed-project'), {
      featured: true,
    }))
    await assertSucceeds(deleteDoc(doc(db, 'projects', 'managed-project')))
  })

  it('allows draft reads only inside an editor’s assigned sections while keeping published content public', async () => {
    const db = testEnv.authenticatedContext(scienceEditorUid, scienceEditorAuth).firestore()

    await assertSucceeds(getDoc(doc(db, 'contentItems', 'science-draft')))
    await assertFails(getDoc(doc(db, 'contentItems', 'social-studies-draft')))
    await assertSucceeds(getDoc(doc(db, 'contentItems', 'social-studies-published')))
  })
})
