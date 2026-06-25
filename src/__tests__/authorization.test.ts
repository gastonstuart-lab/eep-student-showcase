import { describe, expect, it } from 'vitest'
import { canManageProjectsForAdmin, canManageSectionForAdmin, emptyStaffPermissions, type PermissionAdmin } from '../utils/authorization'

const editor: PermissionAdmin = {
  role: 'editor',
  active: true,
  allowedSectionIds: ['esl-science'],
}

describe('authorization helpers', () => {
  it('allows super admins to manage every section and projects', () => {
    const superAdmin: PermissionAdmin = {
      role: 'superAdmin',
      active: true,
      allowedSectionIds: [],
    }

    expect(canManageSectionForAdmin(superAdmin, 'esl-social-studies')).toBe(true)
    expect(canManageProjectsForAdmin(superAdmin)).toBe(true)
  })

  it('limits editors to explicitly allowed sections', () => {
    expect(canManageSectionForAdmin(editor, 'esl-science')).toBe(true)
    expect(canManageSectionForAdmin(editor, 'esl-social-studies')).toBe(false)
  })

  it('allows submission management through explicit permission in an assigned hub', () => {
    expect(canManageProjectsForAdmin({ ...editor, permissions: emptyStaffPermissions })).toBe(false)
    expect(canManageProjectsForAdmin({
      ...editor,
      permissions: { ...emptyStaffPermissions, manageProjects: true },
    })).toBe(true)
  })

  it('rejects inactive or missing administrators', () => {
    expect(canManageSectionForAdmin({ ...editor, active: false }, 'esl-science')).toBe(false)
    expect(canManageProjectsForAdmin(null)).toBe(false)
  })
})
