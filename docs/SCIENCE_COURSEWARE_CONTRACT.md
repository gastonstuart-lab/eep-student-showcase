Do not redesign or reinterpret the approved Science courseware without explicit user instruction.

# Science courseware production contract

## Locked baseline

- Baseline branch: `science-gold-master`
- Locked baseline commit: `af3b8e35295c811a4750e24dffdaafc7ac76fed1`
- Production branch: `codex/science-courseware-final-production`
- The repository default branch is not an authority for this courseware.

## Curriculum authorities

| Year | Source | Google Drive file ID | Required range |
|---|---|---|---|
| J1 | Copy of J1 PPT.pptx | `1STwllX6-z931Hsqst_A1FvN7xwLCVI0g` | Slides 1–15 |
| J2 | J2 PPT (updated).pptx | `14AUxNBq96_rRR9exiieSsHBdvuth4ofh` | Slides 1–15 |

The source hierarchy and wording live in [`coursewareManifest.ts`](../src/science-lessons/courseware/coursewareManifest.ts) and [`coursewareSourcePages.ts`](../src/science-lessons/courseware/coursewareSourcePages.ts). Do not silently correct awkward source wording.

## Visual authorities

- Canonical artboards: [`public/science-lessons/gold`](../public/science-lessons/gold)
- Machine-readable inventory: [`manifest.json`](../public/science-lessons/gold/manifest.json)
- Runtime registry and interaction regions: [`coursewareArtwork.ts`](../src/science-lessons/courseware/coursewareArtwork.ts)
- J1 uses the approved premium ecology/nature language.
- J2 pages 1–10 use the locked navy/purple atomic language; pages 11–15 must continue that exact system.
- Generic CSS slides, stock fallback photographs, the rejected J2 dashboard treatment, and assets from unrelated branches are prohibited.

## Required runtime behavior

- One shared player shell for both years.
- Simple mode advances directly page by page.
- Interactive mode enables staged reveals.
- Highlights are reversible.
- Traditional Chinese help is hidden until requested.
- Text and the main visual can be enlarged independently.
- Fullscreen, keyboard navigation, page position, source link, teacher note, and jump navigation remain available.
- Multiple classes keep separate page positions and teaching modes in local storage.
- A page without final artwork must display an unmistakable unfinished state; it must never receive a generic production fallback.

## PowerPoint parity

- [`J1-opening-courseware.pptx`](../public/science-lessons/gold/powerpoint/J1-opening-courseware.pptx)
- [`J2-opening-courseware.pptx`](../public/science-lessons/gold/powerpoint/J2-opening-courseware.pptx)

Each deck contains the same 15 production artboards in order and source provenance in speaker notes.

## Release gates

1. Source IDs, hierarchy, exact page count, and protected awkward wording pass unit tests.
2. Every registry entry points to the canonical gold asset path.
3. Build, lint, focused interaction tests, and full repository tests pass.
4. Browser QA captures all 30 pages at 1440×900 and representative pages at 1366×768, including simple and interactive modes, Chinese support, highlights, enlargement, fullscreen control presence, and two-class progress isolation.
5. PowerPoint render QA shows 15 pages per deck with no overflow.
6. Production deployment requires explicit user approval; a preview is not production.

## Rollback

Revert the final production commit on `codex/science-courseware-final-production`, or rebuild from the locked baseline commit above. Never overwrite `science-gold-master` while recovering the courseware.
