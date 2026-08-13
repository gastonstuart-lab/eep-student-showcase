import type { ProjectInput } from '../types'

export const projectFieldLimits = {
  title: 120,
  groupName: 120,
  className: 80,
  members: 300,
  description: 900,
  audience: 500,
  impact: 500,
} as const

export function isGoogleSitesUrl(value: string) {
  return /^https:\/\/sites\.google\.com\/.+/i.test(value.trim())
}

export function isOptionalHttpsUrl(value: string) {
  const trimmed = value.trim()
  return trimmed === '' || /^https:\/\/.+/i.test(trimmed)
}

export function validateProjectSubmission(project: ProjectInput, permission: boolean) {
  const errors: string[] = []

  if (!project.groupName.trim()) errors.push('Group name is required.')
  if (!project.className.trim()) errors.push('Class name is required.')
  if (!project.members.trim()) errors.push('Members are required.')
  if (!project.title.trim()) errors.push('Project title is required.')
  if (!project.description.trim()) errors.push('Description is required.')
  if (!project.audience.trim()) errors.push('Audience is required.')
  if (!project.impact.trim()) errors.push('Impact statement is required.')
  if (!isGoogleSitesUrl(project.googleSitesUrl)) errors.push('Use a valid Google Sites URL beginning with https://sites.google.com/.')
  if (!isOptionalHttpsUrl(project.imageUrl)) errors.push('Optional image URLs must begin with https://.')
  if (!permission) errors.push('Permission is required before submitting.')

  Object.entries(projectFieldLimits).forEach(([field, maxLength]) => {
    const value = project[field as keyof typeof projectFieldLimits]
    if (typeof value === 'string' && value.length > maxLength) {
      errors.push(`${field} must be ${maxLength} characters or fewer.`)
    }
  })

  return errors
}

export function projectSubmissionFingerprint(project: ProjectInput) {
  return [
    project.sectionId,
    project.title,
    project.groupName,
    project.className,
    project.members,
    project.googleSitesUrl,
  ]
    .map((value) => value.trim().toLowerCase())
    .join('|')
}
