import { describe, expect, it, vi } from 'vitest'
import type { ContentItemInput } from '../types'

const firestoreMocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn((database: unknown, path: string) => ({ database, path })),
  deleteDoc: vi.fn(),
  deleteField: vi.fn(() => ({ __deleteField: true })),
  doc: vi.fn((database: unknown, path: string, id: string) => ({ database, path, id })),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  serverTimestamp: vi.fn(() => ({ __serverTimestamp: true })),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn(),
}))

vi.mock('firebase/firestore', () => firestoreMocks)
vi.mock('../firebase', () => ({ db: { name: 'test-db' } }))

const { createContentItem, updateContentItem } = await import('../data')

describe('content item Firestore writes', () => {
  it('deletes undefined optional fields on update so cleared badge text is removed', async () => {
    await updateContentItem('content-1', { badgeText: undefined } as Partial<ContentItemInput>)

    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      { database: { name: 'test-db' }, path: 'contentItems', id: 'content-1' },
      {
        badgeText: { __deleteField: true },
        updatedAt: { __serverTimestamp: true },
      },
    )
  })

  it('strips undefined optional fields on create instead of writing delete sentinels', async () => {
    await createContentItem({
      title: 'Title',
      summary: 'Summary',
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
      contentWidth: 'medium',
      imagePlacement: 'top',
      textAlignment: 'left',
      accentStyle: 'neutral',
      badgeText: undefined,
      ctaStyle: 'hidden',
      createdBy: 'teacher@example.com',
    })

    expect(firestoreMocks.addDoc).toHaveBeenCalledWith(
      { database: { name: 'test-db' }, path: 'contentItems' },
      expect.not.objectContaining({ badgeText: expect.anything() }),
    )
  })
})
