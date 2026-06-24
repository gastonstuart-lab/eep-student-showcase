# Content Creator Wizard — Final Workflow Specification

> Planning document only. Implement later from the known-good baseline, not from this experimental branch.

## Product goal

The wizard should help a teacher publish useful content quickly without forcing them to understand layout systems, translation architecture, or Firestore structure.

## Final step order

### 1. Choose destination

Teacher chooses the hub:

- IED
- EEP
- ESL
- Science
- Language Arts
- Performance Arts
- Social Studies

Show only destinations the signed-in teacher can manage.

### 2. Choose content type

Use clear visual cards:

- Announcement
- Event
- Resource
- Student Work
- Gallery
- Video
- Link
- Highlight / Feature

The choice should control which later fields appear. Do not show irrelevant fields.

### 3. Add core content

Required:

- title
- short summary
- main content or description

Optional:

- call-to-action text
- call-to-action URL
- date/location for events
- author/class attribution for student work

### 4. Add media

Offer:

- image URL or upload flow supported by the existing project
- video URL
- external link
- optional image alt text

Show a real thumbnail or media preview immediately.

### 5. Choose presentation

Keep this deliberately simple. Offer a small set of tested layouts rather than many disconnected controls:

- Standard card
- Wide feature
- Image left
- Image right
- Full-width announcement
- Gallery

Optional settings:

- light/dark text treatment when supported
- focal point for image crop
- featured toggle

Every setting must visibly change the live preview and the saved public rendering.

### 6. Traditional Chinese support

This step is optional, not mandatory.

Default behaviour:

- English content can be published without duplicate Chinese fields.
- Teacher can select “Add Traditional Chinese version”.
- Only then reveal Traditional Chinese title, summary, body, CTA, and alt-text fields relevant to the chosen content type.
- Missing Traditional Chinese fields fall back to English.
- Never save blank Chinese values that override valid English content.

### 7. Preview

Preview must use the same renderer or shared presentation component as the public page. It must not be a fake approximation.

Preview controls:

- English
- Bilingual
- Traditional Chinese
- Desktop
- Mobile

Preview should show:

- destination hub context
- final card/layout
- media crop
- CTA
- publication state

### 8. Publish settings

Choices:

- Save as draft
- Publish now
- Schedule

Scheduling fields appear only when Schedule is chosen.

Show a final summary:

- hub
- content type
- language coverage
- layout
- publication time

### 9. Confirmation

After saving:

- show success state
- provide “View on hub”
- provide “Edit again”
- provide “Create another”
- preserve no temporary password-like sensitive values

## Non-negotiable UX rules

- Destination comes before content type.
- Content comes before design.
- Traditional Chinese is optional and contextual.
- Live preview must be connected to real saved output.
- Do not place the language selector in a way that breaks the public topbar.
- Do not expose raw permission keys or internal IDs.
- Do not show controls the teacher cannot use.
- Preserve entered content when moving backward and forward.
- Warn before leaving with unsaved changes.
- Errors appear next to the relevant field and in a concise summary.

## Required create/edit tests

- create each content type
- edit existing item
- switch destination where permitted
- add/remove Traditional Chinese version
- verify English fallback
- change each presentation layout and compare preview to public render
- save draft
- publish now
- schedule and cancel schedule
- invalid URL
- missing required title
- media load failure
- mobile preview
- cancel with unsaved changes

## Definition of done

- wizard order matches this document;
- all controls affect real output;
- preview and public rendering match;
- optional bilingual content works without blank overrides;
- permissions filter destinations correctly;
- draft, publish, schedule, edit, and cancel flows pass tests;
- no regression to public navigation or language toggle.
