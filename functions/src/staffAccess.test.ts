import { describe, expect, it } from 'vitest'
import { HttpsError } from 'firebase-functions/v2/https'
import { normalizeUsername, staffAuthEmail, validateUsername } from './index.js'

describe('staff access helpers', () => {
  it('normalizes usernames case-insensitively', () => {
    expect(normalizeUsername('  Science.Jones  ')).toBe('science.jones')
  })

  it('derives the protected owner identity from the migration username', () => {
    expect(staffAuthEmail('stuart')).toBe('gastonstuart@googlemail.com')
  })

  it('rejects invalid or reserved usernames', () => {
    expect(() => validateUsername('root')).toThrow(HttpsError)
    expect(() => validateUsername('a')).toThrow(HttpsError)
    expect(() => validateUsername('science jones')).toThrow(HttpsError)
  })
})
