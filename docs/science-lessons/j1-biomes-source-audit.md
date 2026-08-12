# J1 Chapter 2.4 Biomes Source Audit

Audit date: 2026-08-12
Branch: `science-lessons-pilot`
Frozen shell baseline: `6451472`

This document corrects the earlier screenshot-only audit. The authoritative files were supplied in `j1-biomes-authoritative-sources.zip`, extracted under `tmp/source-material/j1-biomes-authoritative/`, and are intentionally kept out of Git.

## Corrected Source Status

Facts from the authoritative source package:

- `tmp/source-material/j1-biomes-authoritative/j1-biomes-authoritative-sources/Copy of J1 PPT.pptx` is available locally under `tmp/`.
- `tmp/source-material/j1-biomes-authoritative/j1-biomes-authoritative-sources/2026_03_10_biomes_student_notes.pdf` is available locally under `tmp/`.
- `tmp/source-material/j1-biomes-authoritative/j1-biomes-authoritative-sources/J1 Sci Ch.2.4 HW.pdf` is available locally under `tmp/`.
- `tmp/source-material/j1-biomes-authoritative/j1-biomes-authoritative-sources/J1 Sci Ch.2.4 Quiz.pdf` is available locally under `tmp/`.
- `npm.cmd run science:extract-pptx` extracted 147 total PowerPoint slides into `tmp/source-material/j1-biomes-authoritative/pptx-extract/`.
- The authoritative Biomes PowerPoint range is slides 99-116 inclusive: 18 original Biomes slides.
- Slide 117 begins Chapter 2 Section 5, confirming the end boundary.
- The extracted manifest records 40 embedded image references across Biomes slides 99-116.
- The student notes PDF has 2 pages. The homework PDF has 1 page and 10 questions. The quiz PDF has 1 page and 10 questions.

The original school PPTX/PDF files must remain under `tmp/` and must not be committed.

## Source File Inventory

| Source | Type | Contains | Count | Authority | Git status |
| --- | --- | --- | ---: | --- | --- |
| `tmp/source-material/j1-biomes-authoritative/j1-biomes-authoritative-sources/Copy of J1 PPT.pptx` | PPTX | Full J1 source deck; Biomes is slides 99-116 | 147 deck slides, 18 Biomes slides | Authoritative | Do not commit |
| `tmp/source-material/j1-biomes-authoritative/pptx-extract/manifest.json` | Extracted JSON | Ordered text and image references for all 147 slides | 147 slide records | Derived from authoritative PPTX | Do not commit |
| `tmp/source-material/j1-biomes-authoritative/pptx-extract/media/` | Extracted media | Embedded PPT images copied from deck | 40 image references used in slides 99-116 | Derived from authoritative PPTX | Do not commit |
| `tmp/source-material/j1-biomes-authoritative/j1-biomes-authoritative-sources/2026_03_10_biomes_student_notes.pdf` | PDF | Student notes: definition, six biomes, examples, tundra, mountains/ice | 2 pages | Authoritative | Do not commit |
| `tmp/source-material/j1-biomes-authoritative/j1-biomes-authoritative-sources/J1 Sci Ch.2.4 HW.pdf` | PDF | Original homework | 10 questions | Authoritative | Do not commit |
| `tmp/source-material/j1-biomes-authoritative/j1-biomes-authoritative-sources/J1 Sci Ch.2.4 Quiz.pdf` | PDF | Original quiz | 10 questions | Authoritative | Do not commit |
| `src/science-lessons/curriculum/j1/ch2-4-biomes.ts` | TypeScript data | Two canonical production lessons generated from the source range | 21 slides total | Implemented curriculum | Commit |
| `src/science-lessons/curriculum/j1/ch2-4-biomes-assessment.ts` | TypeScript data | Internal homework/quiz coverage map | 20 coverage records | Implemented validation data | Commit |
| `src/science-lessons/presentation-v2/biomesV2Scenes.tsx` | React scene registry | Enhanced concept, climate, rain forest, and rainfall scenes | 4 scenes | Redesigned presentation treatment | Existing source |
| `src/science-lessons/curriculum/visualAssets.ts` | TypeScript registry | Local support imagery and provenance | 9 assets | Redesigned/replacement visuals | Existing source |

## PowerPoint Slide Sequence

| Slide | Source content | Embedded images | Production treatment |
| ---: | --- | ---: | --- |
| 99 | Chapter 2 Section 4: Biomes title | 1 | Lesson 1 title/opening |
| 100 | Question of the Day: factors determining biome type | 0 | Lesson 1 question slide |
| 101 | Definition of biome; climate means temperature and precipitation; six major biomes list | 1 | Split into definition, climate, and vocabulary slides |
| 102 | Question of the Day: six major biomes | 0 | Reinforced in six-biome slide |
| 103 | Rain forest biomes: temperate and tropical rain forests | 2 | Rain forest comparison slide; V2 image/content treatment retained |
| 104 | Rain forest canopy, understory, habitat value | 2 | Separate canopy/understory slide |
| 105 | Desert: less than 25 cm rain; evaporation greater than precipitation | 2 | Desert water-balance slide |
| 106 | Desert cooling at night; animals active at night | 3 | Desert night adaptation slide |
| 107 | Grasslands: prairie/savanna and rainfall differences | 2 | Prairie/savanna comparison slide |
| 108 | Grassland temperatures, rich soil, tall grasses, limited big trees | 2 | Grassland soil/vegetation check slide |
| 109 | Deciduous forest: trees shed leaves; oaks and maples | 2 | Lesson 2 deciduous meaning slide |
| 110 | Deciduous forest rainfall, temperature variation, growing season, animals | 4 | Deciduous climate/animals slide |
| 111 | Boreal forest plants: coniferous trees, cones, needle leaves, climate | 3 | Boreal plants slide |
| 112 | Boreal forest animals; herbivores and carnivores | 3 | Boreal animals slide |
| 113 | Tundra: cold/dry, low precipitation, frozen soil/permafrost, marsh | 3 | Tundra/permafrost diagram slide |
| 114 | Tundra plants, short summer growth, long daylight | 4 | Tundra plants/short summer slide |
| 115 | Tundra animals, insects, birds, migration, thick fur, animal examples | 3 | Tundra animals slide |
| 116 | Mountains and ice not part of major biomes | 3 | Mountains and ice slide |

Slide 117 text begins "Chapter 2: Section 5", so it is outside Ch.2.4 Biomes.

## Student Notes Sequence

The two-page student notes match the PPT section closely:

- Page 1: Question of the Day, biome definition, climate definition, six major biomes, rain forest, desert, grassland, and beginning of deciduous forest.
- Page 2: Deciduous forest continuation, boreal forest plants and animals, tundra climate/plants/animals, and mountains and ice.

The notes provide the clearest assessment-facing wording for: 300 cm rain forest rainfall, less than 25 cm desert rainfall, prairie 25-75 cm, savanna 120 cm, 50 cm deciduous forest rainfall, permafrost, migration, thick fur, and mountains/ice exceptions.

## Assessment Coverage

Homework is aligned in `src/science-lessons/curriculum/j1/ch2-4-biomes-assessment.ts`:

- Homework coverage: 10/10.
- Quiz coverage: 10/10.

Every homework and quiz question maps to at least one canonical lesson and at least one production slide ID. The original homework and quiz were not rewritten.

## Current Production Mapping

| Production lesson | Source basis | Slide count | Role |
| --- | --- | ---: | --- |
| `j1-ch2-4-biomes-lesson-1` / What Is a Biome? Climate and Major Examples | PPT slides 99-108, student notes p.1, homework questions 1-7, quiz questions 3-5 and 7/10 | 11 | Introduction, definition, climate, six biomes, rain forest, desert, grassland |
| `j1-ch2-4-biomes-lesson-2` / Forests, Tundra, Mountains and Ice | PPT slides 109-116, student notes p.1-p.2, homework questions 8-10, quiz questions 1-2, 6, 8-9 | 10 | Deciduous forest, boreal forest, tundra, mountains/ice, assessment review |

The old 13-slide pilot is not left as a duplicate library lesson. Useful pilot pieces were migrated into the two canonical lessons.

## Original, Redesigned, And Generated Content

Original source content:

- The lesson sequence and all assessed vocabulary/concepts come from PPT slides 99-116, the student notes, homework, and quiz.
- Resource links continue to use existing Google Drive IDs instead of local Windows paths.
- Teacher notes identify source slide usage and assessment links.

Redesigned presentation treatment:

- The app uses the frozen Science Lessons shell, teacher workspace, thumbnails, resources, language controls, and Presentation Mode.
- Existing public images in `public/science-lessons/biomes/` are used as clearer classroom support where source imagery is small or decorative.
- V2 scene renderers are retained only where they support source concepts: biome definition, climate factors, rain forest, and rainfall comparison.

Generated pedagogical scaffolding:

- Progressive reveals.
- Climate-factor diagram.
- Rainfall comparison/review.
- Teacher prompts and checks for understanding.
- Traditional Chinese and bilingual support.

These generated elements should be treated as teaching scaffolds derived from source facts, not as new source curriculum.

## Visual Findings

- The PPTX contains meaningful embedded imagery on most Biomes slides and text-only question slides at 100 and 102.
- The extracted media should remain traceable through `manifest.json` and source slide number.
- The current classroom build does not publish the extracted school media directly. It uses registered local public support images with provenance.
- Remaining visual QA should compare the extracted source images against the redesigned/replacement visuals to decide whether any original image must be preserved exactly.

## Remaining Ambiguities And Problems

- The extracted PPT media confirms image references, but this pass does not create a committed source-media registry because original school media must remain out of Git.
- Some source values appear in different forms across PPT/notes. The production lessons follow the assessment-facing notes where needed: rain forest about 300 cm, desert less than 25 cm, prairie 25-75 cm, savanna 120 cm, deciduous forest about 50 cm.
- The quiz asks "Taiwan is part of this biome"; TEACHER CONFIRMATION REQUIRED - the expected source answer is currently interpreted as Tropical Rain Forest. This is an assessment-alignment assumption, not a newly verified scientific claim.
- Original answer keys or teacher-only notes were not present in the supplied ZIP.

## Definition Of Done For Full Biomes Unit

- Authoritative PPTX, notes, homework, and quiz verified under `tmp/`.
- PPT slides 99-116 processed and slide 117 boundary confirmed.
- Two canonical production lessons present in the Biomes unit.
- No duplicate old Biomes pilot remains in the lesson library.
- Homework coverage is 10/10.
- Quiz coverage is 10/10.
- English, bilingual, and Traditional Chinese student-facing content present.
- Resources point to Drive references, not local Windows paths.
- Presentation Mode works for both lessons.
- Visual-review automation captures both canonical lessons.
- `npm.cmd test`, `npm.cmd run science:validate-assets`, and `npm.cmd run build` pass.
