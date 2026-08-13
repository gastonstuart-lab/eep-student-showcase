# Science Lessons Product Blueprint

## Product Direction

Science Lessons is one teacher-facing product inside the IED Hub. The V1 workspace remains the product shell: professional lesson browsing, Science Lessons branding, slide thumbnails, teacher notes, resources, objectives, source references, language controls, and a clear Present action.

The V2 experiment contributes presentation mechanics only: fullscreen 16:9 teaching canvases, scene-specific renderers, staged teaching states, graph/image/diagram-led moments, and non-destructive Traditional Chinese support. Teachers should not see a V1/V2 choice in the normal workflow.

## Source Fidelity

Original source material is authoritative. Source slides define curriculum structure, order, wording, traceability, and exam-linked content. Delivery may improve through teaching states, but it must not silently rewrite, reorder, or expand the curriculum.

A source slide may contain multiple teaching states, such as revealing a label, animating a graph, focusing an image, showing a definition, or opening student notes. Continuation canvases should be reserved for source slides that are too dense to teach effectively in one canvas.

## Architecture

```text
Lesson Workspace
  -> Presentation Session
  -> Presentation Shell
  -> Source Slide
  -> Teaching State(s)
  -> Scene Renderer
       -> Enhanced renderer
       -> Legacy/Fallback renderer
```

Each source slide should be able to carry or resolve:

- source reference and source slide identity
- original content and exam-linked wording
- teaching states
- optional enhanced scene renderer
- translation support targets
- student note-taking representation
- private teacher notes and resources

Use a small metadata-driven registry for enhanced renderers instead of giant slide-number conditionals.

## Presentation Behavior

The right arrow advances the teaching moment. Depending on the current source slide, that may reveal text, animate a graph, reveal a label, focus an image, open a comparison, reveal notes, or move to the next source slide.

Audience presentation should have almost no permanent UI. Teacher controls should be subtle, edge/bottom-revealed, and include Previous, Next, state indicator, Notes, support controls where needed, and Exit. Escape exits safely and returns to the same teacher workspace position where practical.

## Traditional Chinese Support

English slide geometry is immutable. Chinese support must never move, resize, push, or alter English content or diagram geometry.

Traditional Chinese is on-demand support for important vocabulary, definitions, and note-taking sentences. It should appear as a small floating tooltip, contextual support bubble, or fixed overlay. It should support hover, click/tap pinning, and keyboard focus where practical. It should not translate every word on every slide.

## Student Notes View

Presentation view teaches; Notes view supports student recording. Student notes are not private teacher notes and are not a downloadable completed worksheet.

For implemented gold scenes, Notes view should provide:

- a clear heading tied to the same source slide
- key exam-linked wording
- structured bullets
- key vocabulary
- simple reproducible diagrams or graphs where useful
- staged notes reveal and Show All modes

Teacher-private notes, answers, reminders, timing cues, and resource reminders must remain out of the audience presentation path.

## Gold Lesson Scope

The gold vertical slice is J1 Chapter 2.4 Biomes. Enhanced scenes currently cover:

- What is a biome?
- Climate determines the biome
- Rain forest
- Rainfall changes the ecosystem

All other Biomes source slides use the legacy/fallback renderer inside the same presentation shell. The teacher should not need to know which renderer is active.

## Postponed

This checkpoint does not include J2, Firebase persistence, full editor features, multi-device presenter sync, permission/publishing UI, service worker/PWA work, or a redesign of the IED Hub.
