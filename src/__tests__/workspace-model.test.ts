import { describe, expect, it } from 'vitest'
import type { EffectiveAdmin } from '../auth'
import { hubConfigs } from '../hubs'
import { emptyStaffPermissions, fullStaffPermissions, staffPermissionLabels } from '../utils/authorization'
import { parseWorkspaceContentView, workspaceContentViewStatus } from '../components/studio/workspaceRouting'
import { buildWorkspaceContextOptions, buildWorkspaceNav, canShowSeedSampleDataAction, getAccessibleHubConfigs, shouldShowProjectSummary } from '../components/studio/workspaceModel'

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

  it('builds task routes from the active Science context', () => {
    const editor = staff({
      allowedSectionIds: ['esl-science', 'esl-language-arts'],
      permissions: { ...emptyStaffPermissions, createContent: true, editContent: true, publishContent: true },
    })
    const nav = buildWorkspaceNav(editor, 'esl-science')

    expect(nav.find((item) => item.label === 'Create Content')?.to).toBe('/admin/hubs/esl-science?view=create')
    expect(nav.find((item) => item.label === 'Content Library')?.to).toBe('/admin/hubs/esl-science?view=library')
    expect(nav.find((item) => item.label === 'Drafts')?.to).toBe('/admin/hubs/esl-science?view=drafts')
    expect(nav.find((item) => item.label === 'Scheduled')?.to).toBe('/admin/hubs/esl-science?view=scheduled')
    expect(nav.find((item) => item.label === 'Published')?.to).toBe('/admin/hubs/esl-science?view=published')
  })

  it('builds task routes from the active Language Arts context', () => {
    const editor = staff({
      allowedSectionIds: ['esl-science', 'esl-language-arts'],
      permissions: { ...emptyStaffPermissions, createContent: true, editContent: true, publishContent: true },
    })
    const nav = buildWorkspaceNav(editor, 'esl-language-arts')

    expect(nav.find((item) => item.label === 'Create Content')?.to).toBe('/admin/hubs/esl-language-arts?view=create')
    expect(nav.find((item) => item.label === 'Drafts')?.to).toBe('/admin/hubs/esl-language-arts?view=drafts')
  })

  it('rejects unauthorized active context values safely', () => {
    const editor = staff({
      allowedSectionIds: ['esl-science'],
      permissions: { ...emptyStaffPermissions, createContent: true, editContent: true, publishContent: true },
    })
    const nav = buildWorkspaceNav(editor, 'esl-language-arts')

    expect(nav.find((item) => item.label === 'Create Content')?.to).toBe('/admin/hubs/esl-science?view=create')
    expect(nav.map((item) => item.to).join(' ')).not.toContain('esl-language-arts')
  })

  it('shows Create Content if any permitted all-hubs destination allows creation', () => {
    const owner = staff({
      role: 'superAdmin',
      allowedSectionIds: ['*'],
      permissions: fullStaffPermissions,
    })
    const nav = buildWorkspaceNav(owner, 'all')

    expect(nav.find((item) => item.label === 'Create Content')?.to).toContain('?view=create')
  })

  it('hides Create Content in a hub context without creation permission', () => {
    const editor = staff({
      allowedSectionIds: ['esl-science'],
      permissions: { ...emptyStaffPermissions, editContent: true, createContent: false },
    })

    expect(buildWorkspaceNav(editor, 'esl-science').map((item) => item.label)).not.toContain('Create Content')
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
    expect(labels).not.toContain('Publishing Queue')
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

  it('maps workspace route views to honest filters and falls back safely', () => {
    expect(workspaceContentViewStatus.drafts).toBe('draft')
    expect(workspaceContentViewStatus.scheduled).toBe('scheduled')
    expect(workspaceContentViewStatus.published).toBe('published')
    expect(parseWorkspaceContentView('unknown')).toBe('library')
    expect(parseWorkspaceContentView(null)).toBe('library')
  })

  it('keeps sample seeding hidden outside development and emulator modes', () => {
    expect(canShowSeedSampleDataAction({ firebaseConfigured: true, emulatorMode: false, developmentFlag: false })).toBe(false)
    expect(canShowSeedSampleDataAction({ firebaseConfigured: false, emulatorMode: false, developmentFlag: false })).toBe(true)
    expect(canShowSeedSampleDataAction({ firebaseConfigured: true, emulatorMode: true, developmentFlag: false })).toBe(true)
    expect(canShowSeedSampleDataAction({ firebaseConfigured: true, emulatorMode: false, developmentFlag: true })).toBe(true)
  })

  it('excludes unrelated EEP project summaries from subject-editor contexts', () => {
    expect(shouldShowProjectSummary(true, ['esl-science'], 'esl-science')).toBe(false)
    expect(shouldShowProjectSummary(true, ['eep'], 'eep')).toBe(true)
    expect(shouldShowProjectSummary(true, ['ied', 'eep', 'esl-science'], 'all')).toBe(true)
  })

  it('uses staff-facing permission labels instead of raw permission keys', () => {
    expect(staffPermissionLabels.manageUsers).toBe('Manage staff access')
    expect(staffPermissionLabels.createContent).toBe('Create content')
    expect(staffPermissionLabels.deleteContent).toBe('Delete or archive content')
  })
})
