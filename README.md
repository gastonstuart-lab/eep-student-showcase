# IED Learning Hub

Public learning hub for THUHS International Education Department work. The app includes the IED homepage, EEP Learning Hub, EEP Student Website Showcase, ESL subject hubs, public student submissions, and protected teacher administration tools.

## Routes

- `/` and `/ied`: IED public home
- `/eep`: EEP Learning Hub
- `/eep/showcase`: approved EEP Student Website Showcase
- `/eep/showcase/submit` and `/submit`: public student submission form
- `/esl`: ESL Learning Hub
- `/esl/science`, `/esl/language-arts`, `/esl/performance-arts`, `/esl/social-studies`: subject hubs
- `/projects/:id`: approved project detail page
- `/about`: IED context and links
- `/login`: teacher sign-in
- `/admin`, `/admin/pending`, `/admin/approved`, `/admin/hubs`, `/admin/hubs/:sectionId`, `/admin/users`: protected teacher tools

Unknown routes show a 404 page and do not silently redirect home.

## Local Setup

Use `npm.cmd` on Windows:

```bash
npm.cmd install
npm.cmd run dev
```

To run the closed staff-access system locally without touching production, start local emulators and opt in from `.env`:

```env
VITE_USE_FIREBASE_EMULATORS=true
VITE_FIREBASE_EMULATOR_HOST=127.0.0.1
VITE_FIREBASE_AUTH_EMULATOR_PORT=9099
VITE_FIRESTORE_EMULATOR_PORT=8080
VITE_FUNCTIONS_EMULATOR_PORT=5001
```

Start emulators in one terminal:

```bash
npm.cmd run emulators:start
```

Seed the protected local owner in another terminal (emulator-only):

```bash
npm.cmd run emulators:seed-owner
```

Run the local staff-flow smoke test (creates staff user, verifies forced password change, verifies permissions persistence, disables the user):

```bash
npm.cmd run emulators:smoke-staff
```

This creates or repairs local emulator records for:

- Firebase Auth user `gastonstuart@googlemail.com`
- `adminUsers/{uid}` protected owner record
- `staffUsernames/stuart`

You can then sign in as username `stuart` and use `/admin/users` locally.

Before shipping changes:

```bash
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

Firestore rules tests require Java because they run the Firebase emulator:

```bash
npm.cmd run test:rules
```

## Firebase Project

Use only this Firebase project:

```text
eep-student-showcase
```

Do not use the GradeFlow Firebase project.

Hosting target:

```text
target: iedhub
site: ied-hub
production URL: https://ied-hub.web.app
legacy/default URL: https://eep-student-showcase.web.app
```

PowerShell may block the Firebase `.ps1` shim, so use `firebase.cmd`.

## Environment Variables

Create a local `.env` file in the project root. Do not commit it.

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=eep-student-showcase.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=eep-student-showcase
VITE_FIREBASE_APP_ID=your_web_app_id
VITE_FIREBASE_STORAGE_BUCKET=eep-student-showcase.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY=optional_recaptcha_v3_site_key
VITE_STAFF_AUTH_DOMAIN=staff.eep-student-showcase.local
VITE_USE_FIREBASE_EMULATORS=false
VITE_FIREBASE_EMULATOR_HOST=127.0.0.1
VITE_FIREBASE_AUTH_EMULATOR_PORT=9099
VITE_FIRESTORE_EMULATOR_PORT=8080
VITE_FUNCTIONS_EMULATOR_PORT=5001
```

The Firebase web app values come from Firebase Console > Project settings > General > Your apps > Web app.

App Check is optional. To activate it, create/register a reCAPTCHA v3 site key in Firebase Console > App Check for the web app, add the site key to local/hosting environment configuration, and enforce App Check only after confirming legitimate submissions and admin actions still work.

Never commit real API keys beyond the Firebase public web config placeholders, service accounts, private keys, logs, build output, `.env`, `.firebase`, or emulator cache files.

## Closed Staff Access Model

The public learning pages are visible, and public student submissions remain anonymous pending submissions. Staff administration is closed: there is no signup UI, no public registration route, no student account system, and no public email reset for internally generated staff identifiers.

Staff sign in at `/login` with:

- `Username`
- `Password`

The browser normalizes the username and signs in to Firebase Auth with a hidden internal email. The frontend and Functions backend both use the stable default internal domain `staff.eep-student-showcase.local`; for example, `science.jones` becomes `science.jones@staff.eep-student-showcase.local`. If `VITE_STAFF_AUTH_DOMAIN` is overridden for the browser, the Functions environment variable `STAFF_AUTH_DOMAIN` must be set to the exact same hostname. Do not use `GCLOUD_PROJECT` or the Firebase Auth domain as the staff email domain. The migration username `stuart` maps to the protected owner Auth email `gastonstuart@googlemail.com`.

The Vite app connects to Auth, Firestore, and Functions emulators only when `VITE_USE_FIREBASE_EMULATORS=true`.

Staff access records live in `adminUsers/{uid}` and include:

- `username`, `normalizedUsername`, hidden `authEmail`, optional `contactEmail`
- `displayName`
- `role`: `superAdmin`, `admin`, or `editor`
- `active`
- `protectedOwner`
- `mustChangePassword`
- `allowedSectionIds`
- granular `permissions`
- created/updated audit metadata

Permissions:

- `manageUsers`
- `manageProjects`
- `manageHubSettings`
- `createContent`
- `editContent`
- `publishContent`
- `deleteContent`
- `viewAuditLog`

Super administrators receive all permissions. Administrators and editors receive explicit permissions plus selected section IDs. Legacy editor records without a `permissions` object retain their section-scoped behavior for compatibility, but new staff records should always include explicit permissions.

Protected owner:

```text
username: stuart
Auth email: gastonstuart@googlemail.com
```

The protected owner bootstrap path does not depend on email verification. After Stuart signs in, the `ensureProtectedOwnerRecord` callable creates or repairs `adminUsers/{uid}` and `staffUsernames/stuart` using the existing Firebase Auth UID; it never creates a second Auth user. The protected owner cannot be disabled, archived, demoted, made inactive, stripped of full permissions, stripped of `['*']` section access, reset through staff management, or changed to a non-owner username, even by the protected owner account itself. Only safe profile changes such as display name and contact email are accepted.

### Staff Workflow

1. An authorised staff user with `manageUsers` opens `/admin/users`.
2. They create a staff account with username, display name, optional contact email, role, sections, permissions, and a temporary password.
3. The browser calls the `createStaffUser` Cloud Function. The function validates the caller, reserves the username transactionally, creates the Firebase Auth user with the Admin SDK, creates the staff record, sets `mustChangePassword: true`, and writes an audit entry. The temporary password is never stored.
4. The administrator shares the one-time temporary password out of band.
5. The staff member signs in by username and must change the temporary password before any admin page opens. The browser reauthenticates the current session, then calls `changeOwnPassword`; the server verifies recent authentication, updates the Firebase Auth password with the Admin SDK, clears `mustChangePassword` only after the password update succeeds, revokes refresh tokens, writes an audit entry, and tells the client to sign out and sign back in.
6. Administrator password resets use `resetStaffPassword`, set a new temporary password, revoke refresh tokens, set `mustChangePassword: true`, and write an audit entry. The protected owner cannot be reset through this management flow.
7. Disabling staff uses `disableStaffUser`, disables Firebase Auth, revokes refresh tokens, marks the staff record inactive, and preserves authored content and audit history.
8. Archiving is preferred over permanent deletion. The current implementation archives/disables access rather than deleting Auth and audit history.

There is no public email password reset on `/login`; staff are told to contact an IED Hub administrator.

### Enforcement

- React hides and gates staff UI based on the active staff record and explicit permissions.
- Cloud Functions re-check caller permissions server-side before creating, updating, resetting, disabling, enabling, or archiving staff.
- No standalone callable can clear `mustChangePassword`; only `changeOwnPassword` can clear it after a successful Admin SDK password update.
- Firestore rules allow public reads only for approved/published content, allow public pending project submissions only through the validated schema, deny client writes to `adminUsers`, `staffUsernames`, and `auditLogs`, and enforce section/action permissions for private content.
- A random Firebase Auth user without an active valid staff record has no private access.
- If the Functions backend is unavailable, `/admin/users` disables create/update/reset/enable/disable/archive controls and shows a backend-unavailable message instead of pretending the action can succeed.

### Authentication Blocking

The repository includes a prepared `blockUnprovisionedStaffSignup` blocking function. It rejects every client-side Auth account creation attempt; a `staffUsernames/{username}` reservation document alone never authorises signup. Administrator provisioning uses the trusted `createStaffUser` callable and Firebase Admin SDK `createUser` from a secure backend. Firebase's Admin SDK user-management API is designed for elevated server-side account management, while blocking functions run in the client authentication flow before a client token is returned.

Important operational caveat: Firebase Authentication blocking functions require upgrading Firebase Authentication to Identity Platform and registering/deploying the blocking function in Firebase/Google Cloud. This may require Blaze billing. Do not enable billing or deploy the blocking function without explicit approval.

Until Identity Platform blocking is enabled, arbitrary Firebase Auth account creation may still be technically possible through Firebase APIs, but those accounts receive no private Firestore access because rules require the protected owner email or an active staff record. This is not the same as Authentication-level signup blocking.

### Migration

- Stuart can sign in as `stuart`; internally this uses `gastonstuart@googlemail.com`.
- After Functions are configured, `ensureProtectedOwnerRecord` automatically creates or repairs the persisted protected owner staff record for `stuart` using Stuart's existing Auth UID. `/admin/users` also provides a one-time repair action for the protected bootstrap path.
- Keep `teacher@eep.com` disabled or unprivileged unless explicitly needed. Do not auto-grant it broad rights.

## Firestore Collections

- `projects`: student project submissions and approved showcase records.
- `contentItems`: announcements, events, resources, videos, links, and student work.
- `hubPages`: public hub page copy/settings keyed by section ID.
- `adminUsers`: staff access records keyed by Firebase Auth UID.
- `staffUsernames`: server-managed username reservations for uniqueness.
- `auditLogs`: immutable staff/action audit entries written by trusted backend logic.

Required public project submission constraints are mirrored in client validation and Firestore rules: bounded text fields, valid category, Google Sites URL, optional HTTPS image URL, pending status, no featured/student-pick flags, and timestamps.

## Commands

```bash
npm.cmd run lint
npm.cmd test
npm.cmd run test:rules
npm.cmd run build
npm.cmd --prefix functions run lint
npm.cmd --prefix functions test
npm.cmd --prefix functions run build
```

Deployment commands are prepared but should only be run after explicit approval:

```bash
firebase.cmd deploy --only firestore:rules --project eep-student-showcase
firebase.cmd deploy --only functions --project eep-student-showcase
firebase.cmd deploy --only hosting:iedhub --project eep-student-showcase
```

Rollback:

1. In Firebase Hosting, select the previous known-good release for `ied-hub` and roll back.
2. If rules were deployed, redeploy the previous reviewed `firestore.rules` from Git.
3. Confirm `/`, `/eep/showcase`, `/login`, and `/admin` behavior after rollback.

## CI

GitHub Actions workflow `.github/workflows/validate.yml` runs on pushes and pull requests:

- `npm ci`
- `npm ci --prefix functions`
- lint
- functions lint
- unit tests
- functions tests
- Firestore rules tests with Java and Firebase emulator
- production build
- functions build

CI does not deploy.

## Architecture

Current structure:

- `src/App.tsx`: routes and remaining page composition
- `src/auth.tsx`: authentication and effective authorization state
- `src/data.ts`: Firestore data services
- `src/staffFunctions.ts`: callable staff-access function wrappers
- `src/hubs.ts`: hub configuration
- `src/i18n`: language mode and translations
- `src/components/public`: premium public visual components
- `src/components/ErrorBoundary.tsx`: app-level error boundary
- `src/utils/validation.ts`: project submission validation
- `src/utils/staffAuth.ts`: username normalization and internal Auth identifier generation
- `src/__tests__`: Vitest regression and validation tests
- `functions/src/index.ts`: staff provisioning, password reset, archive/disable, audit, and blocking function code
- `firestore.rules` and `firestore.rules.test.ts`: security boundary and emulator coverage

`App.tsx` is still large, but new work should continue extracting pages, forms, and admin modules incrementally without changing public routes or Firestore collection names.

## Production Checklist

- `.env` is local only and not tracked.
- Firebase project remains `eep-student-showcase`.
- Hosting target remains `iedhub`.
- `npm.cmd run lint` passes.
- `npm.cmd test` passes.
- `npm.cmd run test:rules` passes in an environment with Java.
- `npm.cmd run build` passes.
- `npm.cmd --prefix functions run lint`, `npm.cmd --prefix functions test`, and `npm.cmd --prefix functions run build` pass.
- Public pages load in English, Traditional Chinese, and bilingual modes.
- Showcase cards remain visible after async loading, filtering, and searching.
- Public submissions create pending projects only.
- Unauthorized authenticated users see Access denied.
- Editors are limited to allowed sections by Firestore rules.
- Staff account changes go through Cloud Functions, not direct client writes to `adminUsers`.
- Unknown routes show the 404 page.
- No production deploy has been run without approval.

## Known Limitations

- The initial JavaScript bundle is still above Vite's 500 kB warning threshold. Route-level code splitting is the next performance improvement.
- Firestore rules tests require Java locally. They are configured for CI with Java 21.
