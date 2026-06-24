# Final IED Intro Specification

> Planning document only. Do not treat this branch as an implementation base. Implement from known-good commit `0583ac3a1b8d8ec156eda970954832259337e369` on a fresh Codex branch.

## Route behaviour

- `/` shows the intro only.
- `/ied` shows the existing IED homepage.
- Opening `/ied` directly never replays the intro.
- Browser Back from `/ied` returns to `/` and shows the intro.
- The public header is hidden only on `/`.
- Header brand and IED navigation point to `/ied`.
- EEP, ESL, subject, showcase, about, login, project, and admin routes stay unchanged.

## Desktop composition

Use a 4-column × 3-row image grid filling the viewport. Cards have consistent rounded corners, narrow gaps, a subtle dark-blue edge treatment, and a restrained 1–2 degree overall tilt. Do not enlarge the full grid beyond the viewport enough to clip the school logo or centre panel.

### Exact 12-card layout

| Position | Image | Purpose |
|---|---|---|
| Row 1, Col 1 | `/images/ied-premium/workspace/luce-chapel-hero.webp` | Campus identity |
| Row 1, Col 2 | `/images/ied-premium/heroes/eep-hero.webp` | EEP |
| Row 1, Col 3 | `/images/ied-premium/heroes/esl-hero.webp` | ESL |
| Row 1, Col 4 | `/images/ied-premium/heroes/science-hero.webp` | Science |
| Row 2, Col 1 | `/images/ied-premium/heroes/language-arts-hero.webp` | Language Arts |
| Row 2, Col 2 | `/images/ied-premium/cards/eep-card.webp` | Supporting EEP visual |
| Row 2, Col 3 | `/images/ied-premium/heroes/ied-home-hero.webp` | **Selected transition tile** |
| Row 2, Col 4 | `/images/ied-premium/heroes/performance-arts-hero.webp` | Performance Arts |
| Row 3, Col 1 | `/images/ied-premium/heroes/social-studies-hero.webp` | Social Studies |
| Row 3, Col 2 | `/images/ied-premium/heroes/showcase-hero.webp` | Student Showcase |
| Row 3, Col 3 | `/images/ied-premium/cards/esl-card.webp` | Supporting ESL visual |
| Row 3, Col 4 | `/images/ied-premium/heroes/ied-about-hero.webp` | Department identity |

The school-building transition tile is fixed at **Row 2, Column 3**. Do not move it to the exact centre of a 4-column grid, because there is no single centre column. This position places it directly behind and slightly right of the centre panel, creating a natural Enter transition.

## Logo

- Source: `/school-logo.svg`
- Top-left placement
- Desktop width: 220–250 px
- Mobile width: 150–170 px
- White or near-white contained panel with 12–16 px internal padding
- Minimum 20 px desktop edge spacing and 14 px mobile edge spacing
- Visible immediately, with no entrance delay

## Centre glass panel

Text:

- `International Education Department`
- `國際教育處`
- `Enter`

Rules:

- Desktop width: 520–580 px
- Mobile width: no more than `calc(100vw - 40px)`
- Dark translucent navy glass, not bright white
- Moderate blur only; text must remain crisp
- English heading should fit on two lines at desktop sizes
- Traditional Chinese sits below as a clear secondary line
- Enter is a real `<button>` with keyboard focus styles
- All content visible immediately

## Interaction

Subtle pointer movement may shift the grid by at most 8–12 px. It must not rotate or move enough to expose blank background, clip the logo, or create motion sickness.

On Enter:

1. Disable the button.
2. Fade logo and centre panel over about 200 ms.
3. Fade non-selected cards over about 400 ms.
4. Expand Row 2, Column 3 to cover the viewport over 800–900 ms.
5. Navigate to `/ied` after the expansion is visually complete.
6. Restore normal scrolling before or immediately after navigation.
7. Let the existing homepage perform its normal route transition.

No blank white frame is permitted.

## Mobile layout

Use 3 columns × 4 rows. Maintain the same image order in reading order. The transition tile therefore remains item 7, which becomes Row 3, Column 1 on mobile.

- Grid may extend slightly beyond viewport edges, but never more than needed to avoid thin gaps.
- Centre panel remains visually dominant.
- Logo must not overlap the centre panel.
- Hint text is optional on mobile and should be removed if it competes for space.
- No horizontal scrolling.

## Accessibility and reduced motion

- Intro page has one `<main>` and one `<h1>`.
- Decorative image cards use empty alt text.
- Logo has useful school-name alt text.
- Enter has visible keyboard focus.
- With `prefers-reduced-motion: reduce`, skip card movement and use a short cross-fade followed by navigation.

## Forbidden approaches

- no overlay above the existing homepage
- no React portal
- no wrapper in `main.tsx`
- no iframe
- no integration inside `PremiumHero`
- no `sessionStorage` or `localStorage` replay logic
- no body-scroll lock left active after navigation

## Required proof before review

- desktop screenshot of `/` at 1440 × 900
- laptop screenshot of `/` at 1366 × 768
- mobile screenshot of `/` at 390 × 844
- screenshot of `/ied` after Enter
- successful lint, test, and build
- no console errors
- no failed internal links
- exact commit SHA and rollback command
