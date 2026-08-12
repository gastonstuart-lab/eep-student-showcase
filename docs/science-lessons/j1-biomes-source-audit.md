# J1 Chapter 2.4 Biomes Source Audit

Audit date: 2026-08-12
Branch: `science-lessons-pilot`
Frozen shell baseline: `6451472`

This audit inventories the Biomes material currently available in the worktree and compares it with the implemented 13-slide pilot. It is audit and planning only. It does not redesign the Science Lessons shell or change curriculum implementation files.

## Executive Summary

Facts from located files:

- The current implemented lesson is `j1-ch2-4-biomes-real-pilot` in `src/science-lessons/curriculum/j1/ch2-4-biomes.ts`.
- The implemented pilot has 13 slides, 4 resources, 2 source references, and 9 registered local visual assets.
- The authoritative original source files are referenced by Google Drive IDs in the lesson data, but the original `Copy of J1 PPT.pptx`, student-notes PDF, homework PDF, and quiz PDF were not found as local files in this worktree.
- The locally inspectable source-like material is 6 exported PPT slide images in `tmp/drive-reference-biomes-ppt/` and 2 rendered student-notes page samples in `tmp/drive-reference-pdf-samples/`.
- The existing V2 presentation scenes enhance 4 of the 13 pilot slides: biome definition, climate drivers, rain forest, and rainfall comparison.

Planning conclusions:

- The full Ch.2.4 Biomes classroom-ready unit should be treated as 2 teachable lessons, not just the current one-pass pilot: one concept/examples lesson and one evidence/resources/checking lesson.
- Before a full curriculum build, the original PPTX/PDF files should be obtained locally or extracted from Drive so slide order, original embedded visuals, homework, quiz, and student-notes wording can be verified without relying on screenshots and app metadata.
- The current pilot is useful as a gold vertical slice, but it contains expanded teaching scaffolding, replacement visuals, V2 diagrams, and Traditional Chinese support that are not directly present in the located original-like files.

## 1. Source File Inventory

### Authoritative Sources Referenced But Not Local

| Source | Type | Path or reference | Contains | Approx. count | Status | Embedded/external assets |
| --- | --- | --- | --- | ---: | --- | --- |
| `Copy of J1 PPT.pptx` | PPTX / Google Slides source | Drive ID `1STwllX6-z931Hsqst_A1FvN7xwLCVI0g`; URL in `src/science-lessons/curriculum/j1/ch2-4-biomes.ts` | Authoritative source deck for Ch.2.4, from "BIOMES" through "MOUNTAINS AND ICE" | Unknown in Drive; 6 local exported slide images found | Authoritative reference; original file not local | Lesson data says embedded PPT images were not materialized into this checkpoint |
| `2026_03_10_biomes_student_notes.pdf` | Student notes PDF | Drive ID `1gllgvUd9IiWh8UzJoZvSGxaj2bgRvcyy`; URL in `src/science-lessons/curriculum/j1/ch2-4-biomes.ts` | Two-page student notes covering definition, six major biomes, examples, tundra, mountains/ice | 2 pages from local PNG samples | Authoritative reference; original PDF not local | Rendered page images only; no embedded assets extracted |
| `J1 Sci Ch.2.4 HW` | Homework PDF | Drive ID `1ANbOTp6a4V32oOsAxH2MdRUcE_B_RGEb`; URL in `src/science-lessons/curriculum/j1/ch2-4-biomes.ts` | Homework, app metadata says 10 questions | Unknown; not local | Authoritative resource reference; original file not local | Unknown |
| `J1 Sci Ch.2.4 Quiz` | Quiz PDF | Drive ID `1im18Xue1lG6hbOdsdOZW9n-MiihkSczd`; URL in `src/science-lessons/curriculum/j1/ch2-4-biomes.ts` | Quiz, app metadata says 10 questions | Unknown; not local | Authoritative resource reference; original file not local | Unknown |

### Local Source-Like Exports

| Path | Type | Contains | Approx. count | Authority | Embedded/external assets |
| --- | --- | --- | ---: | --- | --- |
| `tmp/drive-reference-biomes-ppt/Slide1.PNG` | PNG slide export, 960x720 | Tropical Rainforest: location, rainfall, climate, plants/soil | 1 slide image | Derived export from source deck | Text-only screenshot; no separate embedded assets |
| `tmp/drive-reference-biomes-ppt/Slide2.PNG` | PNG slide export, 960x720 | Tundra: location, precipitation, climate, plants/soil/permafrost | 1 slide image | Derived export from source deck | Text-only screenshot; no separate embedded assets |
| `tmp/drive-reference-biomes-ppt/Slide3.PNG` | PNG slide export, 960x720 | Desert: location, precipitation, climate, plants/soil | 1 slide image | Derived export from source deck | Text-only screenshot; no separate embedded assets |
| `tmp/drive-reference-biomes-ppt/Slide4.PNG` | PNG slide export, 960x720 | Taiga/Boreal Forest: location, precipitation, climate, plants/soil, animals | 1 slide image | Derived export from source deck | Text-only screenshot; no separate embedded assets |
| `tmp/drive-reference-biomes-ppt/Slide5.PNG` | PNG slide export, 960x720 | Temperate Forest: location, precipitation, climate, plants/soil, animals | 1 slide image | Derived export from source deck | Text-only screenshot; no separate embedded assets |
| `tmp/drive-reference-biomes-ppt/Slide6.PNG` | PNG slide export, 960x720 | Grasslands: location, precipitation, climate, plants/soil | 1 slide image | Derived export from source deck | Text-only screenshot; no separate embedded assets |
| `tmp/drive-reference-pdf-samples/2026-03-10-biomes-student-notes-p01.png` | PNG render of PDF page, 953x1348 | Student notes page 1: question of day, biome definition, six major biomes, rain forest, desert, grassland, start of deciduous forest | 1 page | Derived page render from student-notes PDF | Text page render; no separate embedded assets |
| `tmp/drive-reference-pdf-samples/2026-03-10-biomes-student-notes-p02.png` | PNG render of PDF page, 953x1348 | Student notes page 2: deciduous forest continuation, boreal forest, tundra, mountains and ice | 1 page | Derived page render from student-notes PDF | Text page render; no separate embedded assets |

### Implemented Curriculum And Presentation Files

| Path | Type | Contains | Approx. count | Authority | Embedded/external assets |
| --- | --- | --- | ---: | --- | --- |
| `src/science-lessons/curriculum/j1/ch2-4-biomes.ts` | TypeScript curriculum data | Current 13-slide Biomes pilot, source references, objectives, resources, teacher notes, reveals, language strings | 13 implemented slides | Current implementation; derived from source | References local public assets and Drive resources |
| `src/science-lessons/presentation-v2/biomesV2Scenes.tsx` | TypeScript/React scene registry | 4 enhanced V2 scenes: biome, climate, rainforest, rainfall | 4 enhanced scenes | Current implementation | Scene renderers are code-generated diagrams/visual treatments |
| `src/science-lessons/presentation-v2/BiomesV2SceneComponents.tsx` | TypeScript/React scene components | Visual renderers for concept equation, climate diagram, rainforest layers, rainfall graph | 4 scene renderers | Current implementation | Uses code-native visuals, not original embedded images |
| `src/science-lessons/curriculum/biomeCharts.ts` | TypeScript data | Rainfall comparison values for desert, prairie, savanna, rain forest | 4 data points | Current implementation; values align with notes | No embedded assets |
| `src/science-lessons/curriculum/visualAssets.ts` | TypeScript asset registry | 9 Biomes visual assets with paths, provenance, attribution notes, usage | 9 assets | Current implementation | External educational images copied into `public/science-lessons/biomes/` |
| `src/science-lessons/data.ts` | TypeScript registry | Registers the Biomes lesson in `scienceLessons` | 1 relevant lesson registration | Current implementation | No embedded assets |
| `src/science-lessons/curriculum/units.ts` | TypeScript unit data | Contains `j1-ch2-biomes` unit reference | 1 relevant unit | Current implementation | No embedded assets |
| `src/__tests__/science-lessons.test.tsx` | Vitest tests | Validates 13 Biomes slides, resources, visual provenance, reveal progression, V2 modes | Test coverage, not curriculum source | Derived validation | No embedded assets |

### Scripts And Process References

| Path | Type | Contains | Approx. count | Authority | Embedded/external assets |
| --- | --- | --- | ---: | --- | --- |
| `scripts/science-lessons/extract-pptx.mjs` | Node script | Extracts a local PPTX into manifest, ordered slide text, image refs, and copied media | N/A | Process tooling | Extracts embedded PPTX media when source PPTX exists locally |
| `scripts/science-lessons/validate-assets.mjs` | Node script | Verifies the 9 required public Biomes image assets exist | 9 checked paths | Process tooling | Checks local files only |
| `scripts/science-lessons/capture-visual-review.mjs` | Node/Playwright script | Captures public visual-review screenshots for Science Lessons | N/A | Process tooling | Produces derived screenshots |
| `SCIENCE_LESSON_PIPELINE.md` | Markdown process doc | Source-to-lesson workflow, source priority, validation, visual QA expectations | N/A | Process guidance | No embedded assets |
| `SCIENCE_LESSONS_PRODUCT_BLUEPRINT.md` | Markdown product doc | Science Lessons product direction, source fidelity, architecture, V2 scene scope | N/A | Product guidance | No embedded assets |

### Local Public Visual Assets

| Path | Type | Current use | Source relation | Quality/action |
| --- | --- | --- | --- | --- |
| `public/science-lessons/biomes/earth-blue-marble.jpg` | Map/photo | Slide `j1-ch2-4-title` | Replacement/support visual; not found in local original screenshots | Keep if attribution is finalized |
| `public/science-lessons/biomes/rainforest-canopy.jpg` | Photo | Slide `j1-ch2-4-rain-forest` and V2 rainforest context | Replacement/support visual | Keep or replace if original deck has a stronger required visual |
| `public/science-lessons/biomes/desert-sahara.jpg` | Photo | Slide `j1-ch2-4-desert` | Replacement/support visual | Keep if attribution is finalized |
| `public/science-lessons/biomes/grassland-savanna.jpg` | Photo | Slides `j1-ch2-4-six-biomes`, `j1-ch2-4-grassland` | Replacement/support visual | Keep if attribution is finalized |
| `public/science-lessons/biomes/deciduous-autumn.jpg` | Photo | Slide `j1-ch2-4-deciduous-forest` | Replacement/support visual | Keep if attribution is finalized |
| `public/science-lessons/biomes/boreal-taiga.jpg` | Photo | Slide `j1-ch2-4-boreal-forest` | Replacement/support visual | Keep if attribution is finalized |
| `public/science-lessons/biomes/tundra-alpine.jpg` | Photo | Slide `j1-ch2-4-tundra` | Replacement/support visual | Keep if attribution is finalized |
| `public/science-lessons/biomes/mountains-ice.jpg` | Photo | Slide `j1-ch2-4-mountains-ice` | Replacement/support visual | Keep if attribution is finalized |
| `public/science-lessons/biomes/permafrost-pattern.jpg` | Photo | Registered as secondary tundra context | Replacement/support visual | Keep as secondary context only |

## 2. Original Content Sequence

The sequence below is reconstructed from the 2-page student notes and 6 exported source-deck slide images. The original PPTX was not local, so exact full deck order remains uncertain.

| Original position | Source | Heading/topic | Key instructional content | Questions/prompts | Activity | Visual/diagram/chart/map | Dependencies |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| Notes p.1 block 1 | `tmp/drive-reference-pdf-samples/2026-03-10-biomes-student-notes-p01.png` | Biomes / Question of the Day | What are the six major biomes found on Earth? | "What are the six major biomes found on Earth?" | Opening prompt | None visible | Leads into definition and list |
| Notes p.1 block 2 | Same | What is a biome? | A biome is a group of land ecosystems with similar climates and organisms; climate means temperature and precipitation; climate determines the biome | Implicit definition check | Note-taking | None visible | Sets up all biome examples |
| Notes p.1 block 3 | Same | Six major biomes | Rain forest, desert, grassland, deciduous forest, boreal forest, tundra | Recall/list prompt implied | Vocabulary list | None visible | Names the examples that follow |
| Notes p.1 block 4 | Same | Rain forest biomes | Temperate rain forests have moderate temperatures and a lot of rain, about 300 cm per year; tropical rain forests are warm/humid year-round; canopy; understory; many species habitat | None explicit | Note-taking/vocabulary | None visible | Depends on biome definition and climate factors |
| PPT export 1 | `tmp/drive-reference-biomes-ppt/Slide1.PNG` | Tropical Rainforest | Location near equator; rainfall 200-400 cm/year; hot/humid 20-30C; tall trees with large leaves; thin nutrient-poor soil | None visible | Teacher explanation | Text-only slide | Adds location/range detail not fully represented in notes |
| Notes p.1 block 5 | `tmp/drive-reference-pdf-samples/2026-03-10-biomes-student-notes-p01.png` | Desert biomes | Less than 25 cm rain/year; evaporation greater than precipitation; rapid cooling after sunset; animals active at night | None explicit | Note-taking | None visible | Uses precipitation comparison |
| PPT export 3 | `tmp/drive-reference-biomes-ppt/Slide3.PNG` | Desert | Location Sahara, Australia, southwestern USA; precipitation less than 25 cm/year; very hot days/cold nights; cactus/water-storing plants; sandy dry soil | None visible | Teacher explanation | Text-only slide | Adds location/plants/soil detail not fully represented in pilot |
| Notes p.1 block 6 | `tmp/drive-reference-pdf-samples/2026-03-10-biomes-student-notes-p01.png` | Grassland biomes | Mostly grasses and non-woody plants; prairies or savannas differ in rainfall; savannas 120 cm/year; prairies 25-75 cm/year; more comfortable than desert; breeze carries smell of sun-warmed soil; rich soil; not enough rain for very big trees | None explicit | Note-taking/comparison | None visible | Depends on desert/rainfall contrast |
| PPT export 6 | `tmp/drive-reference-biomes-ppt/Slide6.PNG` | Grasslands | Locations: prairies, pampas, savannas; precipitation 25-75 cm/year; warm summers/cold winters in some areas; grasses with deep roots; fertile soil | None visible | Teacher explanation | Text-only slide | Adds locations/deep roots; differs from notes by emphasizing prairie-like rainfall |
| Notes p.1-p.2 block 7 | `tmp/drive-reference-pdf-samples/2026-03-10-biomes-student-notes-p01.png`, `tmp/drive-reference-pdf-samples/2026-03-10-biomes-student-notes-p02.png` | Deciduous forest biomes | Deciduous trees shed leaves and grow new ones; oaks and maples; enough rain for trees; about 50 cm/year; temperatures vary greatly; growing season 5-6 months; bears, deer, red foxes, birds | None explicit | Note-taking/vocabulary | None visible | Continues from p.1 to p.2 |
| PPT export 5 | `tmp/drive-reference-biomes-ppt/Slide5.PNG` | Temperate Forest | Location North America, Europe, East Asia; precipitation 75-150 cm/year; four seasons; deciduous trees lose leaves in winter; fertile soil; deer, squirrels, birds, foxes | None visible | Teacher explanation | Text-only slide | Similar to deciduous forest notes but rainfall differs |
| Notes p.2 block 8 | `tmp/drive-reference-pdf-samples/2026-03-10-biomes-student-notes-p02.png` | Boreal forest biomes | Coniferous trees; seeds in cones; needle-shaped leaves; very cold winters; summers warm enough to melt snow; animals eat conifer seeds; red squirrels, lynxes, wolves, insects, birds; herbivores and carnivores | None explicit | Note-taking/vocabulary | None visible | Plant traits before animal examples |
| PPT export 4 | `tmp/drive-reference-biomes-ppt/Slide4.PNG` | Taiga (Boreal Forest) | Location Canada, Russia, northern Europe; precipitation moderate, mainly snow; long cold winters, short summers; evergreen pine/spruce; acidic soil; animals moose, wolves, bears, lynx | None visible | Teacher explanation | Text-only slide | Adds location/snow/soil/animal examples |
| Notes p.2 block 9 | `tmp/drive-reference-pdf-samples/2026-03-10-biomes-student-notes-p02.png` | Tundra biomes | Extremely cold and dry; no more precipitation than deserts; soil frozen all year; permafrost; summer rainwater creates marsh; mosses, grasses, shrubs, dwarf trees; growth during long days/short summer; midnight sun; insect abundance; birds eat insects/migrate; thick fur; wolves/Arctic hares/caribou | None explicit | Note-taking/vocabulary | None visible | Builds on desert precipitation contrast and soil/permafrost |
| PPT export 2 | `tmp/drive-reference-biomes-ppt/Slide2.PNG` | Tundra | Location Arctic regions of North America, Europe, Asia; precipitation 15-25 cm/year; extremely cold, winter often below -30C; mosses/grasses; permafrost soil | None visible | Teacher explanation | Text-only slide | Adds location and numeric temperature detail |
| Notes p.2 block 10 | `tmp/drive-reference-pdf-samples/2026-03-10-biomes-student-notes-p02.png` | Mountains and ice | Some land areas are not part of any major biome; mountain ranges; land covered in thick sheets of ice; many different biomes as you go up mountains | None explicit | Concept clarification | None visible | Final exception/extension after six biomes |

Teacher-only information was not identifiable in the located original-like source images. No videos, hyperlinks, maps, charts, or original diagrams were visible in the local source-like exports.

## 3. Current Pilot Mapping

| Current slide | Represents original content | Classification | Omitted or uncertain original content |
| --- | --- | --- | --- |
| `j1-ch2-4-title` / Chapter 2.4: Biomes | Notes p.1 title/question-of-day and overall topic | Expanded and redesigned | Original prompt asks for six major biomes; current adds global climate framing and Blue Marble map not seen in located source |
| `j1-ch2-4-biome-definition` / What is a biome? | Notes p.1 "What is a biome?" definition | Source-faithful with scaffolding | No major omission; V2 concept equation is invented support |
| `j1-ch2-4-climate-drivers` / Climate determines the biome | Notes p.1 climate determines biome wording | Expanded and redesigned | Original notes define climate as temperature and precipitation but do not show the implemented axes/diagram |
| `j1-ch2-4-six-biomes` / Six major land biomes | Notes p.1 six-biome list | Source-faithful with visual replacement | Local source has no photo visual; current uses grassland asset |
| `j1-ch2-4-rain-forest` / Rain forest biomes | Notes p.1 rain forest section and PPT export 1 | Condensed, expanded, redesigned | Missing source deck location details: equator, Amazon, Central Africa, Southeast Asia; PPT rainfall range 200-400 cm differs from notes/current 300 cm emphasis; nutrient-poor soil not represented |
| `j1-ch2-4-desert` / Desert biomes | Notes p.1 desert section and PPT export 3 | Mostly source-faithful, redesigned | Missing locations Sahara/Australia/southwestern USA; cactus/water-storing plants; sandy dry soil |
| `j1-ch2-4-grassland` / Grassland biomes | Notes p.1 grassland section and PPT export 6 | Mostly source-faithful, partially condensed | Missing locations prairies/pampas/savannas; deep roots; breeze detail; source tension between savanna 120 cm and PPT export's 25-75 cm grasslands figure needs resolution |
| `j1-ch2-4-deciduous-forest` / Deciduous forest biomes | Notes p.1-p.2 deciduous section and PPT export 5 | Mostly source-faithful, partially condensed | Missing locations North America/Europe/East Asia; PPT rainfall 75-150 cm differs from notes/current 50 cm; winter/four-seasons wording could be more explicit |
| `j1-ch2-4-boreal-forest` / Boreal forest biomes | Notes p.2 boreal section and PPT export 4 | Mostly source-faithful, partially condensed | Missing locations Canada/Russia/northern Europe; moderate mainly snow; acidic soil; moose/bears from PPT export |
| `j1-ch2-4-tundra` / Tundra biomes | Notes p.2 tundra section and PPT export 2 | Condensed and redesigned | Missing Arctic locations; 15-25 cm/year; winter below -30C; mosses/grasses/shrubs/dwarf trees; summer insect/bird/migration/fur examples; wolves/Arctic hares/caribou |
| `j1-ch2-4-mountains-ice` / Mountains and ice | Notes p.2 final section | Source-faithful with visual replacement | No major omission; local source has no mountain/ice visual |
| `j1-ch2-4-rainfall-spectrum` / Rainfall changes the ecosystem | Synthesizes notes rainfall values from multiple sections | Invented support/scaffolding from source facts | Original located sources do not show a graph; useful but should be marked as generated from source values |
| `j1-ch2-4-exit-check` / Exit check | Synthesizes definition/list/permafrost/evidence checks | Invented support/scaffolding | No located original exit-check slide/page; homework/quiz likely cover similar checks but not inspectable locally |

## 4. Gap Analysis

Major gaps found: 11.

1. The original `Copy of J1 PPT.pptx` is not local, so exact slide count, order, hidden speaker notes, original theme, and embedded media cannot be audited directly.
2. Only 6 PPT slide exports are locally inspectable; the "BIOMES" title/definition/list slides referenced in the app data are not present as PPT exports.
3. The original student-notes PDF is not local; only 2 rendered PNG pages are available.
4. The homework PDF is not local; app metadata says 10 questions, but the questions and answer expectations cannot be audited.
5. The quiz PDF is not local; app metadata says 10 questions, but the questions and answer expectations cannot be audited.
6. No original PPT embedded images, diagrams, maps, videos, hyperlinks, or media files were located.
7. Source fidelity conflicts need resolution: rainforest rainfall is 200-400 cm/year in PPT export but 300 cm/year in notes/current pilot; deciduous/temperate forest rainfall is 75-150 cm/year in PPT export but 50 cm/year in notes/current pilot; grasslands are split between savanna 120 cm and prairie 25-75 cm in notes but 25-75 cm in the PPT export.
8. Several source deck location details are absent from the pilot: tropical rainforest near equator/Amazon/Central Africa/Southeast Asia; tundra Arctic regions; desert Sahara/Australia/southwestern USA; taiga Canada/Russia/northern Europe; temperate forest North America/Europe/East Asia; grasslands prairies/pampas/savannas.
9. Several organism/soil/adaptation details from source exports are omitted or condensed: nutrient-poor rainforest soil, cactus/water-storing desert plants, sandy dry desert soil, grass deep roots, acidic taiga soil, moose/bears, tundra plants, insects/birds/migration/fur.
10. Traditional Chinese support exists in the implementation but is authored support, not located in original source files; source-derived translation scope needs explicit QA against authoritative English.
11. Current generated visuals and V2 scenes are pedagogically useful but are not original assets; final source-fidelity metadata should mark them as generated/replacement visuals derived from source facts.

Duplicated content:

- Rainfall facts appear in individual biome slides and again in the generated rainfall graph. This is useful retrieval practice but should be intentionally marked as review/synthesis.
- Tundra permafrost appears in the notes, PPT export, current tundra slide, and support visuals. This should remain because it is a core vocabulary item.

Ambiguous or uncertain:

- Whether the six local PPT exports are the full Ch.2.4 source deck section or only a subset.
- Whether the homework/quiz include additional activities, diagrams, or question types that should shape the final lesson sequence.
- Whether there are teacher notes or answer keys in Drive that are not referenced in the current app data.

## 5. Asset Audit

| Asset | Source slide/page | Type | Currently used | Quality | Recommended handling | Licensing/source note |
| --- | --- | --- | --- | --- | --- | --- |
| `tmp/drive-reference-biomes-ppt/Slide1.PNG` | PPT export 1 / Tropical Rainforest | Screenshot/text slide | Not used directly | Readable at 960x720; no visual image | Preserve as reference, replace with structured slide data after PPTX extraction | Derived from source deck; do not publish as final asset without source permission clarity |
| `tmp/drive-reference-biomes-ppt/Slide2.PNG` | PPT export 2 / Tundra | Screenshot/text slide | Not used directly | Readable at 960x720 | Preserve as reference, extract text into source manifest | Derived from source deck |
| `tmp/drive-reference-biomes-ppt/Slide3.PNG` | PPT export 3 / Desert | Screenshot/text slide | Not used directly | Readable at 960x720 | Preserve as reference, extract text into source manifest | Derived from source deck |
| `tmp/drive-reference-biomes-ppt/Slide4.PNG` | PPT export 4 / Taiga | Screenshot/text slide | Not used directly | Readable at 960x720 | Preserve as reference, extract text into source manifest | Derived from source deck |
| `tmp/drive-reference-biomes-ppt/Slide5.PNG` | PPT export 5 / Temperate Forest | Screenshot/text slide | Not used directly | Readable at 960x720 | Preserve as reference, extract text into source manifest | Derived from source deck |
| `tmp/drive-reference-biomes-ppt/Slide6.PNG` | PPT export 6 / Grasslands | Screenshot/text slide | Not used directly | Readable at 960x720 | Preserve as reference, extract text into source manifest | Derived from source deck |
| `tmp/drive-reference-pdf-samples/2026-03-10-biomes-student-notes-p01.png` | Student notes p.1 | PDF page render | Not used directly | Readable | Preserve as audit reference; extract notes text from original PDF when available | Derived from Drive PDF |
| `tmp/drive-reference-pdf-samples/2026-03-10-biomes-student-notes-p02.png` | Student notes p.2 | PDF page render | Not used directly | Readable | Preserve as audit reference; extract notes text from original PDF when available | Derived from Drive PDF |
| `public/science-lessons/biomes/earth-blue-marble.jpg` | Current slide 1 | Map/photo | Yes | Good classroom quality | Keep as generated/replacement support if final attribution passes | NASA/Wikimedia; public-domain note in registry |
| `public/science-lessons/biomes/rainforest-canopy.jpg` | Current slide 5 | Photo | Yes | Good classroom quality | Keep unless original deck has required image | Wikimedia attribution needs final verification |
| `public/science-lessons/biomes/desert-sahara.jpg` | Current slide 6 | Photo | Yes | Good classroom quality | Keep unless original deck has required image | Wikimedia attribution needs final verification |
| `public/science-lessons/biomes/grassland-savanna.jpg` | Current slides 4, 7 | Photo | Yes | Good classroom quality | Keep unless original deck has required image | Wikimedia attribution needs final verification |
| `public/science-lessons/biomes/deciduous-autumn.jpg` | Current slide 8 | Photo | Yes | Good classroom quality | Keep unless original deck has required image | Wikimedia attribution needs final verification |
| `public/science-lessons/biomes/boreal-taiga.jpg` | Current slide 9 | Photo | Yes | Good classroom quality | Keep unless original deck has required image | Wikimedia attribution needs final verification |
| `public/science-lessons/biomes/tundra-alpine.jpg` | Current slide 10 | Photo | Yes | Good classroom quality | Keep unless original deck has required image | Wikimedia attribution needs final verification |
| `public/science-lessons/biomes/mountains-ice.jpg` | Current slide 11 | Photo | Yes | Good classroom quality | Keep unless original deck has required image | Wikimedia attribution needs final verification |
| `public/science-lessons/biomes/permafrost-pattern.jpg` | Current tundra support asset | Photo | Registered; secondary | Useful but not explanatory alone | Keep as secondary context; keep generated cross-section as main explanation | Wikimedia attribution needs final verification |
| V2 biome equation | Current V2 scene | Diagram/code visual | Yes | Good explanatory quality | Preserve as generated pedagogical diagram; label source-derived | Generated from source definition |
| V2 climate axes | Current V2 scene | Diagram/code visual | Yes | Good explanatory quality | Preserve as generated pedagogical diagram; label source-derived | Generated from source climate factors |
| V2 rainforest layers | Current V2 scene | Diagram/photo composition | Yes | Good explanatory quality | Preserve if source wording canopy/understory remains | Generated from source notes |
| V2 rainfall bars | Current V2 scene | Graph/code visual | Yes | Good explanatory quality | Preserve after resolving rainfall-value conflicts | Generated from source values |

## 6. Proposed Teachable Lesson Structure

This section is a proposal, not a claim that these lessons already exist in the source.

### Lesson 1: What Is A Biome? Climate Evidence And Major Examples

- Approximate duration: 50 minutes.
- Original source range covered: notes p.1 definition/list through grasslands; PPT exports for Tropical Rainforest, Desert, Grasslands.
- Learning objectives:
  - Define biome as land ecosystems with similar climates and organisms.
  - Identify temperature and precipitation as biome-determining climate factors.
  - Name the six major biomes.
  - Compare rain forest, desert, and grassland using precipitation and organism evidence.
- Major concepts: biome, climate, precipitation, rain forest, desert, grassland, canopy, understory, evaporation, prairie, savanna.
- Key visuals: Blue Marble/global opener if retained; concept equation; climate axes; rainforest canopy/layers; desert photo or water-balance diagram; grassland comparison; rainfall values.
- Activities/questions: question of the day; call-and-repeat six-biome list; compare desert vs grassland rainfall; explain why animals may be active at night in deserts.
- Likely presentation slide count: 9-12 teaching slides/states.
- Resources needed: source PPT section; notes p.1; homework/quiz questions if they assess these concepts.
- Current 13-slide pilot fit: slides 1-7 and slide 12 belong primarily here; slide 13 may be split into a mini-check.

### Lesson 2: Forest/Tundra Exceptions, Evidence Review, And Assessment Readiness

- Approximate duration: 50 minutes.
- Original source range covered: notes p.1-p.2 deciduous forest through mountains and ice; PPT exports for Temperate Forest, Taiga/Boreal Forest, Tundra; homework and quiz once located.
- Learning objectives:
  - Distinguish deciduous, boreal, and tundra biomes using climate, plants, soil, and animal evidence.
  - Explain permafrost and why summer rainwater can form marshes in tundra.
  - Explain why mountains and ice-covered land are outside the six major biome list.
  - Use source evidence to answer homework/quiz-style questions.
- Major concepts: deciduous trees, coniferous trees, cones, needle-shaped leaves, permafrost, marsh formation, elevation and biome change.
- Key visuals: deciduous forest seasonal photo; boreal conifer photo; tundra/permafrost diagram; mountains and ice photo; rainfall/evidence review graph.
- Activities/questions: identify tree/leaf adaptations; explain permafrost; compare desert and tundra precipitation; answer exit questions with evidence; begin or review homework/quiz.
- Likely presentation slide count: 8-11 teaching slides/states.
- Resources needed: source PPT section; notes p.2; homework PDF; quiz PDF; any answer key/teacher note if available.
- Current 13-slide pilot fit: slides 8-13 belong primarily here; slide 12 can be reused as retrieval/review.

## 7. Content Pipeline Recommendation

Use the existing pipeline, but do not scale from screenshots if the original files can be obtained.

1. Obtain local copies of the authoritative PPTX/PDF files named in `src/science-lessons/curriculum/j1/ch2-4-biomes.ts`.
2. Run `npm.cmd run science:extract-pptx -- <path-to-Copy-of-J1-PPT.pptx> <output-directory>` to generate ordered slide text and media references.
3. Keep the generated `manifest.json` as source-order evidence and use slide numbers as persistent `originalSlideRef` values.
4. Extract or OCR the student notes, homework, and quiz into text manifests, but retain links to the original Drive files and rendered page previews for review.
5. Resolve source conflicts explicitly in a curriculum notes table before writing final slides. Do not silently choose one rainfall value when PPT and notes differ.
6. Represent each original source block as a source slide or source content block, then split into progressive teaching states only where needed for classroom pacing.
7. Store translations beside the slide/reveal/student-note fields they support, but mark whether each Traditional Chinese string is source translation, vocabulary support, or teacher-authored scaffold.
8. Keep teacher notes in private `teacherNote`/teacher-only resource fields. Keep student notes separate from teacher notes.
9. Let Presentation Mode consume the same `ScienceLesson` content plus an enhanced renderer registry keyed by source slide ID.
10. Extend `science:validate-assets` or a future science validation script to check:
    - source references are present
    - every local visual path exists
    - every replacement/generated visual has provenance
    - every source block maps to at least one implemented slide/state
    - every student-facing English string has appropriate Traditional Chinese support where required
    - reveal counts and presentation screenshot targets remain captureable

What can be automatic:

- PPTX slide order, text, and embedded image file references.
- Local asset existence.
- Resource link/Drive ID presence.
- Basic slide/source mapping completeness once `originalSlideRef` exists.
- Screenshot generation for public review routes.

What needs human/Codex interpretation:

- Whether dense source slides should split into multiple teaching states.
- How to preserve exact instructional meaning when notes and PPT exports differ.
- Which original visuals should be preserved, cleaned, redrawn, or replaced.
- Translation quality and whether Chinese is support or full selected-language content.
- Teacher pacing and lesson boundary decisions.

## 8. Definition Of Done For Full Biomes Unit

- Authoritative source PPTX, student notes, homework, and quiz are either local/extracted or explicitly documented as unavailable.
- Original Ch.2.4 slide/page order is preserved in a source manifest.
- Every original content block is mapped to an implemented slide, reveal, note, activity, resource, or documented omission.
- Rainfall/location/organism/soil conflicts between PPT exports and notes are resolved by source decision.
- All six major biomes and mountains/ice are fully represented.
- Homework and quiz question expectations are represented in checks, practice, or resources.
- Every significant visual has provenance and a local asset path if used in class.
- Generated diagrams/graphs state their source facts.
- Teacher-only guidance is separated from student presentation content.
- English mode is complete and source-faithful.
- Bilingual mode keeps English primary and uses Traditional Chinese for clear scaffolding.
- Traditional Chinese mode covers all student-facing instructional headings/body/reveals used in that mode.
- Progressive reveals match natural teaching steps rather than arbitrary animation.
- Presentation Mode works for title, intermediate reveals, diagram/concept, image/content, graph/data, and 1366x768 projector review.
- Projector readability passes at 1366x768 and 1440x900.
- Content QA confirms no invented curriculum claims are presented as source facts.
- Visual QA confirms slides teach science clearly and do not look like generic dashboard cards.
- Automated tests pass.
- `npm.cmd run science:validate-assets` passes.
- `npm.cmd run build` passes.
- GitHub visual-review workflow captures current public-safe screens and publishes artifacts.
- Stuart approves the classroom sequence and source-fidelity choices.

## Validation Notes

Local checks performed during this audit:

- `git status --short --branch` confirmed branch `science-lessons-pilot` with only existing untracked `tmp/`.
- `rg --files` and recursive file search found no local original Biomes `.pptx`, `.ppt`, `.pdf`, or `.docx` files. Only unrelated `dist/EEPWebPlan.pdf` and `public/EEPWebPlan.pdf` were found.
- The six local PPT slide PNG exports and two Biomes student-notes PNG samples were opened and visually inspected.
- PNG dimensions were verified: PPT exports are 960x720; student-notes renders are 953x1348.
- `scripts/science-lessons/extract-pptx.mjs`, `scripts/science-lessons/validate-assets.mjs`, `SCIENCE_LESSON_PIPELINE.md`, and `SCIENCE_LESSONS_PRODUCT_BLUEPRINT.md` were read.

## Audit Counts

- Source files found in the local audit inventory: 26.
- Approximate locally inspectable original Biomes source slides/pages: 8, made of 6 PPT slide exports and 2 student-notes page renders.
- Current pilot slides mapped: 13.
- Major gaps found: 11.
- Proposed teachable lessons: 2.
- Source files/assets not located locally: original `Copy of J1 PPT.pptx`, original `2026_03_10_biomes_student_notes.pdf`, `J1 Sci Ch.2.4 HW` PDF, `J1 Sci Ch.2.4 Quiz` PDF, original PPT embedded media/assets, teacher-only notes/answer keys, and any source videos/hyperlinks.
