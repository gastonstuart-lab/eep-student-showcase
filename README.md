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
```

The Firebase web app values come from Firebase Console > Project settings > General > Your apps > Web app.

App Check is optional. To activate it, create/register a reCAPTCHA v3 site key in Firebase Console > App Check for the web app, add the site key to local/hosting environment configuration, and enforce App Check only after confirming legitimate submissions and admin actions still work.

Never commit real API keys beyond the Firebase public web config placeholders, service accounts, private keys, logs, build output, `.env`, `.firebase`, or emulator cache files.

## Authorization Model

Firestore rules are the final security boundary.

Bootstrap super administrator:

```text
gastonstuart@googlemail.com
```

This account is a super administrator only when signed in with Firebase Auth and the email is verified.

Additional administrators live in `adminUsers/{uid}` where the document ID is the Firebase Authentication UID.

Fields:

- `email`
- `displayName`
- `role`: `superAdmin` or `editor`
- `active`
- `allowedSectionIds`
- `createdAt`
- `updatedAt`

Permissions:

- `superAdmin`: manages projects, all hubs/content, and administrator records.
- `editor`: manages only sections listed in `allowedSectionIds`.
- EEP project management requires `eep` in `allowedSectionIds`.
- Editors cannot manage administrator records or escalate permissions.
- Disabled administrator records have no write access.
- Public visitors can read only approved projects, published content, and public hub pages.
- Public visitors can create only valid pending project submissions.

Use `/admin/users` as the bootstrap owner or another super admin to add editors. The person must already have a Firebase Authentication account so their UID can be used.

### Administrator account setup

Do not enable public self-registration. Teacher accounts are created deliberately in Firebase Authentication, then authorised by verified email and role.

1. In Firebase Console > Authentication, create the teacher email/password account.
2. The teacher signs in at `/login`.
3. If the email is not verified, the application shows the verification-required screen and can send the Firebase verification email.
4. The teacher opens the verification email and clicks the verification link.
5. The teacher returns to the app and uses "I've verified my email - check again" to refresh the Firebase user and ID token.
6. The bootstrap owner `gastonstuart@googlemail.com` receives super-admin access automatically only after the email is verified.
7. Other teachers require an active `adminUsers/{uid}` role record before they can manage content. Editors remain limited to their `allowedSectionIds`.

Password recovery is available from `/login` with "Forgot password?". The confirmation is intentionally neutral, so it does not reveal whether a teacher account exists.

Verification troubleshooting:

- Confirm the Firebase Authentication account email exactly matches the intended teacher email.
- For the bootstrap owner, the email must be exactly `gastonstuart@googlemail.com`.
- Ask the teacher to use the newest verification email if several were sent.
- After clicking the email link, use "I've verified my email - check again" or refresh the app.
- If a verified teacher still sees access denied, confirm their `adminUsers/{uid}` document exists, is `active: true`, and has the correct `role` and `allowedSectionIds`.

## Firestore Collections

- `projects`: student project submissions and approved showcase records.
- `contentItems`: announcements, events, resources, videos, links, and student work.
- `hubPages`: public hub page copy/settings keyed by section ID.
- `adminUsers`: administrator/editor access records keyed by Firebase Auth UID.

Required public project submission constraints are mirrored in client validation and Firestore rules: bounded text fields, valid category, Google Sites URL, optional HTTPS image URL, pending status, no featured/student-pick flags, and timestamps.

## Commands

```bash
npm.cmd run lint
npm.cmd test
npm.cmd run test:rules
npm.cmd run build
```

Deployment commands are prepared but should only be run after explicit approval:

```bash
firebase.cmd deploy --only firestore:rules --project eep-student-showcase
firebase.cmd deploy --only hosting:iedhub --project eep-student-showcase
```

Rollback:

1. In Firebase Hosting, select the previous known-good release for `ied-hub` and roll back.
2. If rules were deployed, redeploy the previous reviewed `firestore.rules` from Git.
3. Confirm `/`, `/eep/showcase`, `/login`, and `/admin` behavior after rollback.

## CI

GitHub Actions workflow `.github/workflows/validate.yml` runs on pushes and pull requests:

- `npm ci`
- lint
- unit tests
- Firestore rules tests with Java and Firebase emulator
- production build

CI does not deploy.

## Architecture

Current structure:

- `src/App.tsx`: routes and remaining page composition
- `src/auth.tsx`: authentication and effective authorization state
- `src/data.ts`: Firestore data services
- `src/hubs.ts`: hub configuration
- `src/i18n`: language mode and translations
- `src/components/public`: premium public visual components
- `src/components/ErrorBoundary.tsx`: app-level error boundary
- `src/utils/validation.ts`: project submission validation
- `src/__tests__`: Vitest regression and validation tests
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
- Public pages load in English, Traditional Chinese, and bilingual modes.
- Showcase cards remain visible after async loading, filtering, and searching.
- Public submissions create pending projects only.
- Unauthorized authenticated users see Access denied.
- Editors are limited to allowed sections by Firestore rules.
- Unknown routes show the 404 page.
- No production deploy has been run without approval.

## Known Limitations

- The initial JavaScript bundle is still above Vite's 500 kB warning threshold. Route-level code splitting is the next performance improvement.
- Firestore rules tests require Java locally. They are configured for CI with Java 21.
