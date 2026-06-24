# Bilingual Public-Site Audit

> Planning document only. Audit baseline: known-good commit `0583ac3a1b8d8ec156eda970954832259337e369`.

## Executive summary

The stable site already has a solid translation framework and a substantial English/Traditional Chinese dictionary, but the public experience is not fully translated because many visible strings bypass that system. The most important gap is hub content: `src/hubs.ts` stores page titles, subtitles, descriptions, button labels, subject names, and eyebrows as English-only values. There are also hard-coded English strings in public route components, alt text, access messages, and calls to action.

The correct solution is not to add duplicate authoring fields everywhere. It is to:

1. translate fixed interface chrome through `translations.ts`;
2. add structured bilingual support only for teacher-authored content that genuinely needs it;
3. preserve clean English-only authoring where Traditional Chinese is not required;
4. ensure language mode changes the visible public page rather than only part of it.

## What is already working well

- Three language modes exist: English, bilingual, and Traditional Chinese.
- The chosen mode persists in local storage.
- `document.documentElement.lang` updates for Traditional Chinese mode.
- `UiText` provides a proper two-line bilingual presentation instead of forcing slash-separated text.
- A large set of showcase, submission, login, admin, empty-state, category, and about-page strings already has Traditional Chinese translations.
- Language menu supports outside-click and Escape closing.

## Structural problems

### A. Hub configuration is English-only — highest priority

`src/hubs.ts` contains English-only values for:

- department and subject eyebrows
- page titles
- subtitles
- introductions
- descriptions
- primary and secondary button labels
- section names

Affected routes:

- `/ied`
- `/eep`
- `/esl`
- `/esl/science`
- `/esl/language-arts`
- `/esl/performance-arts`
- `/esl/social-studies`

These values cannot currently react to the selected language mode.

Recommended model:

- keep route IDs and URLs language-neutral;
- add reusable `{ en, zh }` values for fixed seeded/default hub copy;
- for Firestore-authored hub content, support optional Traditional Chinese fields rather than mandatory duplicates;
- when Chinese is absent, fall back clearly to English rather than displaying blank content.

### B. Hard-coded public calls to action

Known examples in `HomePage` and `EepShowcasePage`:

- `Enter EEP →`
- `Enter ESL →`
- `EEP Learning Hub`
- `ESL Learning Hub`
- `Submit to the EEP Showcase →`
- `Submit to the EEP Showcase`

These should use translation keys.

### C. Image alt text is English-only

Known examples:

- THUHS campus building and international learning visual
- Books, workbooks, and story-based English enrichment materials
- Globe and subject learning materials for ESL
- Digital student website showcase visual

Alt text should switch with language mode, or use a bilingual-safe description where appropriate.

### D. Access and error messages bypass translations

`AccessDenied` includes hard-coded English variants for:

- staff account active but lacking section permission
- super administrator restriction
- administrator-provisioned account sign-in instruction

These need translation keys.

### E. Navigation semantics need route update during intro implementation

Once `/` becomes the intro:

- public brand should link to `/ied`;
- IED nav item should link to `/ied`;
- `BackNavigation` fallback should go to `/ied`, not `/`;
- not-found and access-denied “public hub” links should go to `/ied`;
- the intro page itself should remain intentionally minimal and bilingual.

## Route-by-route audit

### `/` — future intro page

Required bilingual content:

- International Education Department
- 國際教育處
- Enter / 進入

Recommendation: in English mode show English title and English button while still retaining the department’s official Traditional Chinese name beneath it. In Traditional Chinese mode show Traditional Chinese title prominently and `進入`. In bilingual mode show both.

### `/ied` — current HomePage

Already translated:

- hero eyebrow
- hero title
- hero lead/body
- pathway descriptions
- latest IED heading/support

Missing or hard-coded:

- Enter EEP
- Enter ESL
- EEP Learning Hub
- ESL Learning Hub
- hero and pathway alt text

Priority: high.

### `/eep`

The default EEP hub page copy is English-only in `hubs.ts`. Translate:

- English Enrichment Program
- EEP Student Website Showcase
- subtitle, intro, description
- Browse Showcase
- Submit Project

Priority: high.

### `/esl`

The default ESL hub page copy is English-only in `hubs.ts`. Translate:

- ESL Department
- ESL Subject Hubs
- subtitle, intro, description
- subject buttons
- Performance Arts
- EEP Showcase

Priority: high.

### `/esl/science`

Translate seeded/default hub copy:

- ESL Science
- Science Hub
- subtitle, intro, description
- Back to ESL
- Manage Hub

Priority: high.

### `/esl/language-arts`

Translate seeded/default hub copy:

- ESL Language Arts
- Language Arts Hub
- subtitle, intro, description
- Back to ESL
- Manage Hub

Priority: high.

### `/esl/performance-arts`

Translate seeded/default hub copy:

- ESL Performance Arts
- Performance Arts Hub
- subtitle, intro, description
- Back to ESL
- Manage Hub

Priority: high.

### `/esl/social-studies`

Translate seeded/default hub copy:

- ESL Social Studies
- Social Studies Hub
- subtitle, intro, description
- Back to ESL
- Manage Hub

Priority: high.

### `/eep/showcase`

Already strong:

- hero copy
- categories
- search placeholder
- loading/empty states
- spotlight headings
- impact section

Missing or hard-coded:

- Submit to the EEP Showcase
- image alt text
- any project-authored English content remains English, which is acceptable unless a project supplies Traditional Chinese copy

Priority: medium.

### `/eep/showcase/submit` and `/submit`

Most form chrome is translated. Verify all actual labels, validation messages, legal/permission language, placeholders, and success errors use keys rather than raw strings.

Priority: medium.

### `/about`

Translation dictionary coverage is strong. Verify all links, captions, alt text, statistical labels, and card text are actually rendered through `t()` or `UiText`.

Priority: medium.

### `/login`

Core login fields and setup notices are translated. Verify Firebase/Auth error mapping does not surface raw English technical messages to Traditional Chinese users.

Priority: medium.

### `/projects/:id`

Interface labels are translated, but student-authored title, description, audience, and impact remain source-language content. That is appropriate. Do not auto-translate student work.

Priority: low.

### Public 404 and access-denied screens

Core messages are translated, but alternate access-denied branches contain raw English and destination links will need `/ied` after intro routing.

Priority: high.

## Translation wording recommendations

Use these consistent Traditional Chinese terms:

- International Education Department — 國際教育處
- Traditional Chinese — 繁體中文 / 繁中
- Learning Hub — 學習中心
- Showcase — 成果展示 or 作品展示, selected consistently by context
- Student Website Showcase — 學生網站成果展示
- Science — 科學
- Language Arts — 語文
- Performance Arts — 表演藝術
- Social Studies — 社會領域
- Back to ESL — 返回 ESL
- Manage Hub — 管理學習中心
- Enter — 進入

Avoid wording that suggests Taiwan is part of China. Use Taiwan-context terminology and `繁體中文`, not a generic identity statement about “Chinese”.

## Recommended implementation sequence

1. Add missing fixed translation keys.
2. Replace hard-coded public UI strings in `App.tsx`.
3. Introduce bilingual seeded hub defaults.
4. Add optional Traditional Chinese fields to genuinely public teacher-authored hub content only.
5. Add explicit English fallback behaviour.
6. Test all public routes in all three modes.
7. Check topbar at desktop, tablet, and mobile widths.
8. Check that no language mode causes overflow or card-height collapse.

## Required QA matrix

For every public route, test:

- English mode
- bilingual mode
- Traditional Chinese mode
- 1440 × 900
- 1024 × 768
- 390 × 844

Verify:

- no English-only fixed UI in Traditional Chinese mode
- no blank values when Chinese content is absent
- no slash-separated text where two-line bilingual presentation is expected
- no topbar overlap
- no horizontal scrolling
- no clipped buttons
- no inconsistent subject naming
- correct `lang` attribute
- keyboard access to language menu

## Definition of done

- all fixed public UI strings are translated;
- seeded hub defaults switch language correctly;
- optional teacher-authored Chinese content has a clear fallback;
- no unnecessary mandatory duplicate fields;
- all listed routes pass visual QA in three language modes;
- lint, tests, build, route-scroll checks, and site audit pass.
