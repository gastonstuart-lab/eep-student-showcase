# Security and Admin Audit

> Planning document only. Audit baseline: known-good commit `0583ac3a1b8d8ec156eda970954832259337e369`.

## Summary

The current authorization model is materially stronger than the original prototype. It uses a protected bootstrap owner, active staff records, per-section access, explicit permissions, server-side Functions for sensitive account actions, and Firestore rules that separate create/edit/publish/delete capabilities.

No obvious critical authorization bypass was found in the inspected stable code. The main remaining risks are operational and consistency-related rather than architectural: email-verification handling for the bootstrap owner, legacy editor compatibility, authenticated end-to-end QA, schema expansion for bilingual content, and keeping client checks aligned with Firestore rules and Functions.

## Existing strengths

### Protected owner

- Bootstrap owner email is fixed to `gastonstuart@googlemail.com`.
- Client derives a protected super-admin identity with all sections and full permissions.
- A callable Function repairs or creates the persistent protected-owner record.
- Protected owner state is not dependent solely on a mutable Firestore role record.

### Explicit permissions

The model distinguishes:

- manage projects
- manage users
- manage hub settings
- create content
- edit content
- publish content
- delete content
- view audit log

Section access is separately checked through `allowedSectionIds`, including controlled wildcard support.

### Publish controls

Firestore rules require stronger permission combinations when content enters or leaves publish-controlled states such as scheduled, published, or hidden.

A user who can merely create draft content cannot automatically publish it.

### Public data boundaries

- project submissions can only create pending, unfeatured, non-student-pick records with strict fields and lengths;
- public project reads require approved status;
- public content-item reads require published status;
- non-public reads require relevant section management rights;
- hub pages are publicly readable but only staff with hub-settings permission may write;
- audit logs cannot be created, edited, or deleted directly by the client;
- staff username records cannot be accessed directly by clients.

### Test and audit tooling

The repository includes commands for:

- unit tests
- Firestore rules tests
- route-scroll tests
- site audit
- emulator smoke tests for staff flows

## Findings and follow-up work

### 1. Bootstrap owner rule should also require verified email

Current Firestore bootstrap check compares the authentication token email only.

Recommended hardening:

- require `request.auth.token.email_verified == true` in Firestore rules;
- confirm Cloud Functions apply the same requirement;
- add rules tests for verified and unverified bootstrap-owner tokens.

This matches the stated product policy that protected-owner access requires a verified email.

### 2. Legacy editor compatibility should have a retirement plan

Rules still support records without the newer `permissions` map when role is `editor` and the section is explicitly allowed.

This is useful for migration, but it creates two authorization models.

Recommended action:

- inventory legacy records;
- migrate them to explicit permissions;
- add a target date or migration condition for removing `hasLegacySectionAccess`;
- retain tests until migration is complete.

### 3. Client and rules authorization must be regression-tested together

The client uses authorization helpers while Firestore uses parallel rule functions. Drift could cause confusing UI or blocked writes.

Required matrix:

- contributor: create drafts only
- editor: create/edit drafts in assigned hubs
- publisher: publish in assigned hubs
- hub administrator: hub settings plus intended content rights
- project manager: EEP projects only
- staff administrator: manage users only as designed
- super administrator: global access

For each role, test both visible UI and actual Firestore write outcomes.

### 4. Auth errors are English-only

`mapAuthError` returns fixed English strings. This is not a security flaw, but it undermines the Traditional Chinese experience and may expose inconsistent wording.

Recommended action:

- map error codes to translation keys rather than final strings;
- keep generic responses for invalid credentials to avoid account enumeration;
- preserve the current non-specific credential error.

### 5. Persistent owner repair failure needs clear operational handling

The client keeps bootstrap access active even if the persistent owner record repair fails, while showing an admin error.

That is a reasonable recovery design, but operations should define:

- where the failure appears;
- how Stuart can retry repair;
- how audit logging behaves during fallback access;
- whether staff-management functions rely on the persistent record.

Add emulator tests for this degraded state.

### 6. Bilingual schema changes require coordinated rules updates

`isValidContentItem()` uses `keys().hasOnly(...)`. Any future optional Chinese fields will be rejected until rules are updated.

A bilingual implementation must update together:

- TypeScript types
- create/update payloads
- Firestore validation allow-list
- string-length and plain-text validation
- rules tests
- data migration/fallback behaviour

Do not add client fields first and defer rules changes.

### 7. Scheduling validation is structurally limited

Dates are currently validated largely as strings. Future schedule functionality should ensure server-side behaviour is well-defined for:

- timezone
- publish and expiry ordering
- expired content
- edits after scheduled publication
- hidden versus expired state

Use Asia/Taipei consistently for teacher-facing scheduling while storing unambiguous timestamps for execution.

### 8. Authenticated visual and workflow QA remains incomplete

Existing PR notes explicitly identify missing hands-on checks for:

- create staff
- edit staff
- password reset
- disable/re-enable
- archive
- protected-owner repair
- role-specific desktop/mobile views

These should be completed in emulators before production launch.

## Protected-owner QA checklist

- owner can sign in only with verified expected email
- owner retains access if Firestore owner record is missing
- owner record is repaired by trusted Function
- owner cannot be disabled
- owner cannot be archived
- owner cannot be demoted
- owner cannot lose wildcard section access
- owner cannot lose required permissions
- another super administrator cannot alter protected-owner guarantees
- audit log records attempted prohibited actions where applicable

## Firestore rules QA additions

Add tests for:

- unverified bootstrap email denied
- inactive admin denied
- allowed section without permission denied
- permission without allowed section denied
- wildcard section access behaviour
- creator cannot publish
- editor cannot publish unless granted
- publisher cannot edit outside assigned section
- moving content between sections requires rights in both
- project manager cannot manage non-EEP hub content
- user manager cannot read audit logs unless separately permitted
- audit logs remain client-write denied
- username records remain client inaccessible
- bilingual optional fields obey limits and fallback rules

## Operational recommendations

- Use emulators for all staff-management QA.
- Never test destructive staff actions against production first.
- Keep at least one documented recovery path for the protected owner.
- Do not expose raw Functions or Firebase error messages to staff.
- Record preview URL, branch, commit, Firebase project, and deployment target in every deployment report.
- Require explicit Stuart approval before production Hosting, Functions, or rules deployment.

## Current risk assessment

- Critical authorization bypass found: **No, based on inspected files**
- High-priority hardening: **verified-email requirement for bootstrap rule**
- High-priority QA gap: **authenticated staff lifecycle and role matrix**
- Medium technical debt: **legacy editor compatibility**
- Medium integration risk: **future bilingual fields versus strict rules schema**
- Low public-submission risk: **currently constrained by status, field, URL, and length validation**
