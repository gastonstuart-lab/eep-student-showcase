import { describe, expect, it } from 'vitest'
import {
  isGoogleSitesUrl,
  isOptionalHttpsUrl,
  projectSubmissionFingerprint,
  validateProjectSubmission,
} from '../utils/validation'
import type { ProjectInput } from '../types'

const validProject: ProjectInput = {
  title: 'Student Site',
  groupName: 'Team',
  className: 'EEP 8A',
  members: 'A, B',
  category: 'Creative Projects',
  description: 'A useful student website.',
  audience: 'Families',
  impact: 'Shares learning.',
  googleSitesUrl: 'https://sites.google.com/view/student-site',
  imageUrl: '',
  status: 'pending',
  featured: false,
  studentPick: false,
}

describe('submission validation', () => {
  it('accepts Google Sites URLs and rejects other URLs', () => {
    expect(isGoogleSitesUrl('https://sites.google.com/view/student-site')).toBe(true)
    expect(isGoogleSitesUrl('https://example.com')).toBe(false)
    expect(isGoogleSitesUrl('http://sites.google.com/view/not-https')).toBe(false)
  })

  it('requires optional image URLs to be HTTPS', () => {
    expect(isOptionalHttpsUrl('')).toBe(true)
    expect(isOptionalHttpsUrl('https://example.com/image.jpg')).toBe(true)
    expect(isOptionalHttpsUrl('http://example.com/image.jpg')).toBe(false)
  })

  it('validates required submission fields and permission', () => {
    expect(validateProjectSubmission(validProject, true)).toEqual([])
    expect(validateProjectSubmission({ ...validProject, googleSitesUrl: 'https://example.com' }, true)).toContain(
      'Use a valid Google Sites URL beginning with https://sites.google.com/.',
    )
    expect(validateProjectSubmission(validProject, false)).toContain('Permission is required before submitting.')
  })

  it('creates a stable duplicate-submission fingerprint', () => {
    expect(projectSubmissionFingerprint(validProject)).toBe(
      projectSubmissionFingerprint({
        ...validProject,
        title: '  STUDENT SITE ',
        googleSitesUrl: 'HTTPS://SITES.GOOGLE.COM/VIEW/STUDENT-SITE',
      }),
    )
  })
})
