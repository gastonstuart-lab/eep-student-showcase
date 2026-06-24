# File-by-File Implementation Map

> Planning only. Future implementation must start from known-good commit `0583ac3a1b8d8ec156eda970954832259337e369` on a fresh branch.

## Phase A — IED intro route

### `src/App.tsx`

Change only the routing and public-shell conditions needed for the intro:

- import `IedIntroPage`
- render `<Route path="/" element={<IedIntroPage />} />`
- render the existing `<HomePage />` at `/ied`
- remove the current `/ied` redirect to `/`
- hide the topbar only when `location.pathname === '/'`
- hide `FirebaseNotice` and `BackNavigation` on `/`
- update public brand link from `/` to `/ied`
- update IED navigation link from `/` to `/ied`
- update fallback public-hub destinations in `BackNavigation`, 404, and access-denied views to `/ied`
- add `/ied` route metadata matching the existing homepage metadata
- preserve all admin, EEP, ESL, showcase, project, login, and unknown routes

Do not move intro state into `AppRoot`, `main.tsx`, or `PremiumHero`.

### `src/components/public/IedIntroPage.tsx`

New route component responsible only for:

- exact 12-card grid from `docs/ied-intro-final-spec.md`
- school logo
- English and Traditional Chinese department name
- Enter button
- subtle pointer movement
- local transition state
- `useNavigate()` to `/ied`
- cleanup of timers and body scrolling
- reduced-motion detection

The component must render independently of the normal public shell.

### `src/components/public/IedIntroPage.css`

New isolated stylesheet:

- full viewport layout
- 4×3 desktop and 3×4 mobile grids
- centre glass panel
- logo container
- selected transition card expansion
- no selectors that target generic global classes such as `.card`, `.hero`, `main`, `header`, or `body` except a temporary explicit scroll-lock class
- all class names prefixed with `ied-intro__`

### `src/App.test.tsx` or a focused new route test

Add tests for:

- `/` renders intro and not normal HomePage content
- `/ied` renders existing homepage
- header hidden at `/`
- header visible at `/ied`
- brand and IED nav target `/ied`
- Enter navigates to `/ied` with fake timers
- other routes still render

### `scripts/run-route-scroll-test-v4.mjs` and site-audit configuration

Update expected public route inventory to include both `/` and `/ied`.

Verify `/` does not require normal route-scroll assumptions while `/ied` does.

## Phase B — fixed bilingual public UI

### `src/i18n/translations.ts`

Add keys for all currently hard-coded fixed public strings, including:

- Enter EEP
- Enter ESL
- EEP Learning Hub
- ESL Learning Hub
- Submit to the EEP Showcase
- fixed image alt descriptions
- section-specific access-denied messages
- sign-in-with-provisioned-account message
- intro Enter label
- subject and hub fixed labels not already covered

Do not add raw HTML to translations.

### `src/App.tsx`

Replace hard-coded fixed strings with `t()` or `UiText`.

Do not translate student-authored project content automatically.

### `src/hubs.ts`

Refactor seeded/default human-facing copy to a bilingual-safe representation.

Recommended approach:

- route IDs, URLs, department codes, child IDs, accent values remain unchanged
- fixed labels use translation keys where possible
- larger seeded copy uses typed `{ en, zh }` values or dedicated translation keys
- button URLs remain plain strings
- fallback language is English

Avoid making every database authoring field mandatory in both languages.

### `src/types.ts`

Only change if the bilingual hub/content model requires a typed optional translation shape.

Prefer a small reusable type such as:

```ts
interface LocalizedText {
  en: string
  zh?: string
}
```

Do not create broad schema changes during the intro task.

### Public hub rendering component(s)

Wherever `HubPageView` consumes hub defaults or Firestore data:

- select English, bilingual, or Traditional Chinese text through one shared helper
- fall back from missing Chinese to English
- do not render blank headings or buttons
- use two-line bilingual rendering for prominent headings when appropriate

### Tests

Add coverage for:

- English mode
- Traditional Chinese mode
- bilingual mode
- English fallback when Chinese is absent
- no blank values
- fixed CTA labels change language

## Phase C — Content Creator Wizard later

Likely files:

- `src/components/studio/HubContentLibrary.tsx`
- creator wizard component files already used by `/admin/hubs/:sectionId?view=create`
- `src/types.ts`
- `src/data.ts`
- `firestore.rules`
- related tests

Follow `docs/content-creator-wizard-final-workflow.md`.

This must be a separate PR from the intro unless Codex proves the changes are truly isolated and all validations pass.

## Files explicitly off-limits during intro work

- `src/main.tsx`
- `src/components/public/PremiumHero.tsx`
- Firebase project configuration
- Firestore rules
- Cloud Functions
- staff-management code
- production deployment configuration

## Required implementation order

1. create fresh branch from `0583ac3`
2. add route test that initially fails
3. add `IedIntroPage`
4. make minimal `App.tsx` routing changes
5. run focused tests
6. run lint, full test suite, and build
7. run route-scroll and site audit
8. capture screenshots
9. fix all findings
10. commit and report SHA, preview URL, and rollback command
