# IED Hub Visual QA Matrix

> Planning document only. The stable site remains untouched.

## Required viewports

| Name | Size |
|---|---:|
| Desktop | 1440 × 900 |
| Laptop | 1366 × 768 |
| Tablet landscape | 1024 × 768 |
| Mobile | 390 × 844 |

## Public routes

- `/`
- `/ied`
- `/eep`
- `/esl`
- `/esl/science`
- `/esl/language-arts`
- `/esl/performance-arts`
- `/esl/social-studies`
- `/eep/showcase`
- `/eep/showcase/submit`
- `/about`
- `/login`
- one approved `/projects/:id` route
- an unknown route for the 404 page

## Language modes

Run each public route in:

- English
- Bilingual
- Traditional Chinese

## Global checks

- header height and alignment
- logo visible and undistorted
- language menu opens, closes on outside click, and closes on Escape
- no topbar collision at tablet/mobile widths
- no horizontal overflow
- no black strip or blank band
- no permanently hidden reveal content
- no clipped buttons or cards
- keyboard focus is visible
- skip link works
- route change resets scroll appropriately
- back navigation works
- images maintain usable crops
- all internal links resolve
- no serious/critical Axe violations
- no console errors or failed asset requests

## Intro-specific checks

- intro is the only page content at `/`
- logo, centre panel, both language lines, and Enter button render immediately
- the selected school-building tile is correct
- pointer movement is subtle and never exposes empty background
- Enter disables repeated clicks
- transition contains no white flash
- navigation ends at `/ied`
- scrolling is restored after transition
- direct `/ied` load does not replay intro
- browser Back returns to `/`
- reduced-motion mode uses a short cross-fade

## Public hub checks

- `/ied` displays the unchanged existing homepage after intro routing
- EEP and ESL pathway links work
- four ESL subject cards/routes are present
- Social Studies is included everywhere required
- Manage Hub controls are hidden from unauthenticated users
- published content sections do not leave empty gaps
- Firebase notice behaviour remains intentional in local development

## Showcase checks

- category filters work
- search works
- empty state is readable
- demo/approved state is clearly identified
- project cards remain visible after reveal animation
- project detail route works
- submission link resolves

## Submission checks

- all required labels are visible
- validation is understandable
- permission checkbox is present
- loading/success/error states do not shift layout excessively
- mobile form fields fit viewport

## Protected workspace checks

Run authenticated checks for each available role:

- super administrator
- administrator
- section editor / contributor

Check:

- correct workspace navigation
- inaccessible hubs are absent
- creator wizard destinations match permissions
- staff access management is restricted appropriately
- protected owner cannot be demoted, disabled, archived, or stripped of access
- no raw permission keys are shown to ordinary users

## Evidence required before asking Stuart to review

- screenshots for all changed routes at desktop and mobile
- short screen recording for any animation or wizard flow
- lint output
- test output
- build output
- route-scroll/site-audit summary
- exact commit SHA
- preview URL and expiry
- rollback command

Do not ask Stuart to pull or review work that has not passed this matrix for the changed area.
