# Science Lesson Pipeline

This workflow is for turning authoritative Science curriculum sources into classroom-ready interactive lessons. The goal is not to reproduce every PowerPoint slide. The goal is to preserve curriculum meaning and produce projector-first teaching moments.

## 1. Obtain Authoritative Sources

- Use the current source PPTX/PDF/homework/quiz/test files from Stuart or Drive.
- Keep English curriculum wording authoritative.
- Record each source in `sourceReferences` with title, location, Drive ID or local file path, and relevant slide/page range.

## 2. Extract PPTX Content

Place a local `.pptx` somewhere outside `dist/`, then run:

```bash
npm run science:extract-pptx -- path/to/source.pptx science-pptx-extract/unit-name
```

The extractor writes:

- `manifest.json`: slide order, extracted text, image references, and source slide numbers.
- `media/`: embedded PPTX image files.
- a copy of the original PPTX for traceability.

Use `manifest.json` to preserve `originalSlideRef` and source slide order in lesson/asset metadata.

## 3. Segment Into Teaching Moments

For each source section, identify the teacher action:

- define a term
- compare examples
- explain a process
- read a graph
- label a diagram
- check understanding

Split dense source slides when students need clearer note-taking moments. Do not remove essential curriculum wording just to make a minimal slide.

## 4. Choose The Visual Type

Use this source priority:

1. strong original curriculum visual
2. strong visual from Stuart's previous successful Science material
3. high-quality legitimate scientific/educational image
4. accurate graph/chart/map created from explicit factual data
5. purpose-built educational diagram
6. temporary visual only if unavoidable

Never use decorative geometry as a substitute for Science information.

## 5. Register Visual Provenance

Every meaningful visual should be represented in `src/science-lessons/curriculum/visualAssets.ts` or a unit-specific registry with:

- local asset path
- source URL or original source reference
- creator/organisation
- license/status note
- attribution
- retrieval date
- visual type
- origin category
- lesson and slide usage
- alt text

Local images should live under `public/science-lessons/<unit>/` for reliable classroom loading.

## 6. Build The ScienceLesson

Create or update a structured lesson file under:

```text
src/science-lessons/curriculum/j1/
src/science-lessons/curriculum/j2/
```

Each slide should include:

- English title/body
- Traditional Chinese support where useful
- layout
- visual type
- media `assetId` when a local visual is used
- source ID
- teacher note
- reveals only when they match natural teaching

## 7. Attach Resources

Add real homework, quiz, notes, worksheet, video, or test resources with Drive IDs or URLs. Mark teacher-only sources/answer keys clearly.

## 8. Automated Validation

Run:

```bash
npm run lint
npm run test -- --run
npm run build
git diff --check
```

Science tests validate lesson ordering, Biomes slide count, resources, visual provenance, language modes, and reveal progression.

## 9. Playwright Visual QA

Inspect at 1440x900 and 1920x1080. Required checks:

- normal viewer mode
- fullscreen/presentation mode
- slides 1, 3, 4, 5, 6, 10, 12, 13 for Biomes-like lessons
- English, bilingual, and Traditional Chinese modes

Reject any slide that looks like a dashboard, generic web card, decorative template, or low-value image collage.

## 10. Stuart Review

Stuart reviews only the high-value decisions:

- curriculum accuracy
- whether the slide teaches the intended Science idea
- whether the visual feels like strong Science classroom material
- whether Chinese support helps rather than overwhelms

## 11. Ready-For-Classroom Flag

A lesson is ready when:

- source references and resources are real
- every meaningful visual has provenance
- all critical assets load locally
- tests/build pass
- Playwright review looks credible beside Stuart's strongest Science decks
- Stuart approves the classroom sequence
