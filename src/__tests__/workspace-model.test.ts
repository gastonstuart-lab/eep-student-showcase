import { describe, expect, it } from 'vitest'
import type { EffectiveAdmin } from '../auth'
import { hubConfigs } from '../hubs'
import { emptyStaffPermissions, fullStaffPermissions } from '../utils/authorization'
import { buildWorkspaceContextOptions, buildWorkspaceNav, getAccessibleHubConfigs } from '../components/studio/workspaceModel'

function staff(patch: Partial<EffectiveAdmin>): EffectiveAdmin {
  return {
    id: 'staff-1',
    email: 'staff@example.com',
    username: 'staff',
    normalizedUsername: 'staff',
    authEmail: 'staff@example.com',
    contactEmail: 'staff@example.com',
    displayName: 'Staff User',
    role: 'editor',
    active: true,
    protectedOwner: false,
    mustChangePassword: false,
    allowedSectionIds: [],
    permissions: emptyStaffPermissions,
    source: 'adminUsers',
    ...patch,
  }
}

describe('workspace permission model', () => {
  it('shows only the assigned subject context for a subject editor', () => {
    const editor = staff({
      allowedSectionIds: ['esl-science'],
      permissions: { ...emptyStaffPermissions, createContent: true, editContent: true },
    })

    expect(getAccessibleHubConfigs(editor).map((config) => config.sectionId)).toEqual(['esl-science'])
    expect(buildWorkspaceContextOptions(editor).map((option) => option.id)).toEqual(['esl-science'])
  })

  it('does not expose staff access or project tools to an editor without those permissions', () => {
    const editor = staff({
      allowedSectionIds: ['esl-science'],
      permissions: { ...emptyStaffPermissions, createContent: true, editContent: true },
    })
    const labels = buildWorkspaceNav(editor).map((item) => item.label)

    expect(labels).toContain('Create Content')
    expect(labels).toContain('Content Library')
    expect(labels).not.toContain('Staff Access')
    expect(labels).not.toContain('Pending Submissions')
    expect(labels).not.toContain('Approved Projects')
  })

  it('hides publishing navigation when publishContent is not granted', () => {
    const editor = staff({
      allowedSectionIds: ['eep'],
      permissions: { ...emptyStaffPermissions, createContent: true, editContent: true, publishContent: false },
    })

    expect(buildWorkspaceNav(editor).map((item) => item.label)).not.toContain('Published')
  })

  it('shows project tools and staff access only when an administrator has matching permissions', () => {
    const admin = staff({
      role: 'admin',
      allowedSectionIds: ['eep'],
      permissions: {
        ...emptyStaffPermissions,
        createContent: true,
        editContent: true,
        publishContent: true,
        manageProjects: true,
        manageUsers: true,
      },
    })
    const labels = buildWorkspaceNav(admin).map((item) => item.label)

    expect(labels).toContain('Pending Submissions')
    expect(labels).toContain('Approved Projects')
    expect(labels).toContain('Staff Access')
    expect(labels).toContain('Published')
  })

  it('gives super administrators every hub plus platform tools', () => {
    const owner = staff({
      role: 'superAdmin',
      protectedOwner: true,
      allowedSectionIds: ['*'],
      permissions: fullStaffPermissions,
      source: 'bootstrap',
    })
    const labels = buildWorkspaceNav(owner).map((item) => item.label)

    expect(getAccessibleHubConfigs(owner).map((config) => config.sectionId)).toEqual(hubConfigs.map((config) => config.sectionId))
    expect(buildWorkspaceContextOptions(owner).map((option) => option.id)[0]).toBe('all')
    expect(labels).toContain('Platform Overview')
    expect(labels).toContain('Staff Access')
    expect(labels).toContain('Activity / Audit')
  })

  it('returns no protected workspace options for inactive users', () => {
    const inactive = staff({ active: false, allowedSectionIds: ['eep'], permissions: fullStaffPermissions })

    expect(getAccessibleHubConfigs(inactive)).toEqual([])
    expect(buildWorkspaceContextOptions(inactive)).toEqual([])
    expect(buildWorkspaceNav(inactive)).toEqual([])
  })
})
