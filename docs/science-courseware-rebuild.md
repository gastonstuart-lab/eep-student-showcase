# Science Courseware rebuild — implementation brief

## Why this exists

Do not continue extending the old Science lesson presentation architecture.

The project had accumulated several presentation systems (generic SlideViewer, J1 opening player, J2 opening player, Biomes V2). That caused inconsistent navigation, controls and visual behaviour. Approved artboard pages also hid the old navigation because the old player special-cased them.

The rebuild uses one courseware shell and individually designed teaching pages.

## Non-negotiable source rules

1. **PowerPoint is the curriculum authority.**
   - J1: `Copy of J1 PPT.pptx` — Drive ID `1STwllX6-z931Hsqst_A1FvN7xwLCVI0g`
   - J2: `J2 PPT (updated).pptx` — Drive ID `14AUxNBq96_rRR9exiieSsHBdvuth4ofh`
2. Preserve chapter/section hierarchy, page order and student-facing English from the source.
3. Do not silently rewrite awkward grammar or punctuation. Improvements belong in visual teaching design, not source-text invention.
4. Traditional Chinese is support layered onto the English lesson; it does not replace the source.
5. Approved visual mockups are the visual benchmark where one exists.

Exact opening-page text is locked in:
`src/science-lessons/courseware/coursewareSourcePages.ts`

## Correct hierarchy for the first release

### J1
- Chapter 1
- Section 1
- Living Things and the Environment
- 15 source pages

### J2
- Chapter 1
- Atoms and Bonding
- Section 1
- Elements and Atoms
- 15 source pages

Do not collapse these into labels such as `Chapter 1.1`.

## Architecture

### Curriculum manifest
`src/science-lessons/courseware/coursewareManifest.ts`

Owns course → chapter → section identity and authoritative source file references.

### Source page manifest
`src/science-lessons/courseware/coursewareSourcePages.ts`

Owns exact PowerPoint page text and source-slide numbers. This is separate from presentation wording used by older renderers.

### Courseware shell
`src/science-lessons/courseware/CoursewareApp.tsx`

The shell owns controls that must remain stable across every page:
- Previous
- Next
- page/progress position
- fullscreen
- Traditional Chinese support
- teacher drawer
- keyboard navigation
- chapter/section identity

A teaching page must never remove or replace shell navigation.

### Teaching page canvas

Each page is a 16:9 scene. It may be individually designed for the teaching purpose. Do not force all content through a generic card/template renderer.

Reusable scene components are encouraged (photo regions, diagrams, labels, reveal regions, vocabulary hotspots), but the page composition must be intentional.

## Current proof

The isolated courseware route is:
`science-lessons.html?courseware=1`

J1 approved artboards currently used inside the new shell:
- source page 2 — Question of the Day
- source page 3 — Habitats
- source page 5 — Abiotic Factors

These retain the approved visual artwork and click-in-place Traditional Chinese proof.

J1 source pages 1 and 4 are currently shell/fallback scenes, not final approved page artwork.

J2 currently uses a dedicated atoms/particles fallback visual language so it never reuses J1 habitat imagery. This is scaffolding, not the final J2 art direction.

## Controls

Permanent navigation is owned by the shell and is present on approved and non-approved pages.

Do not ship fake controls. The Highlight control is currently disabled in the courseware proof because the approved raster artwork already contains baked emphasis and a true reversible highlight state has not yet been implemented.

## Production sequence for today

### Batch 1 — finish the J1 visual grammar
Create/finalise:
1. source page 1 — Chapter/Section opening
2. source page 4 — second Question of the Day
3. source page 6 — Biotic Factors (use the approved Biotic reference)
Then browser-review pages 1–6 as one continuous lesson.

### Batch 2 — J1 abiotic sequence
Design source pages 7–11:
- Water
- Sunlight
- Oxygen
- Temperature
- Soil

Use meaningful diagrams/examples; do not create five copies of the same layout.

### Batch 3 — J1 organization sequence
Design source pages 12–15:
- Question of the Day
- Populations
- Communities
- Ecosystems

The visuals should progressively show the organization hierarchy.

### J1 acceptance gate
Do not move to J2 production until:
- all 15 pages are source-faithful
- permanent navigation works on every page
- backward navigation works
- fullscreen works
- teacher drawer works
- Chinese support works where implemented
- screenshots have been visually inspected at 1440×900 and 1366×768

### J2 visual checkpoint
Create three representative final pages first:
1. Chapter 1 — Atoms and Bonding
2. Section 1 — Elements and Atoms / Question of the Day
3. one Atomic Theory scientist/model page

Get the visual language right once, then complete source pages 1–15 without changing the shell.

## Do not spend today's release window on

- Firebase preview credentials
- admin/editor redesign
- quiz systems
- class analytics
- refactoring the old J1/J2 players
- broad platform cleanup
- speculative animations
- new curriculum content beyond the PowerPoint source

## Release acceptance

A teacher should be able to:
1. open one link
2. choose J1 or J2
3. see the correct Chapter and Section names
4. press Present
5. teach continuously page-by-page
6. go backward/forward
7. use fullscreen
8. access Chinese support
9. open teacher notes without changing the teaching page

The opening J1 and J2 sections are the release target. The whole Science platform is not.
