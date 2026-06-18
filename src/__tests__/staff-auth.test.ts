import { describe, expect, it } from 'vitest'
import { defaultStaffAuthDomain, staffUsernameToAuthEmail } from '../utils/staffAuth'

describe('staff auth identity mapping', () => {
  it('uses the stable internal staff auth domain', () => {
    expect(defaultStaffAuthDomain).toBe('staff.eep-student-showcase.local')
    expect(staffUsernameToAuthEmail('science.jones')).toBe('science.jones@staff.eep-student-showcase.local')
  })
})
