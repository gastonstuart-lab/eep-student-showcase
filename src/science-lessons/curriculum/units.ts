import type { ScienceUnit } from '../types/lesson'

export const scienceUnits: ScienceUnit[] = [
  {
    id: 'j1-ch2-biomes',
    number: 'Chapter 2.4',
    title: 'Biomes',
    description: 'Real pilot unit: climate factors, major land biomes, adaptations and ecosystem conditions.',
    year: 'J1',
    semester: 'Fall',
    accent: 'cyan',
    sourceReferences: [
      {
        id: 'src-j1-ppt',
        type: 'presentation',
        title: 'Copy of J1 PPT.pptx',
        location: 'Google Drive / J1Science',
      },
    ],
  },
  {
    id: 'j1-fall-reactions',
    number: 'Demo Unit',
    title: 'Chemical Reactions',
    description: 'Demo content kept functional while real J1 curriculum is imported.',
    year: 'J1',
    semester: 'Fall',
    accent: 'violet',
  },
  {
    id: 'j1-spring-solutions',
    number: 'Unit 3',
    title: 'Solutions and Solubility',
    description: 'Volume, concentration, dissolving, saturation and solubility curves.',
    year: 'J1',
    semester: 'Spring / Summer',
    accent: 'violet',
    sourceReferences: [
      {
        id: 'src-j1-ppt',
        type: 'presentation',
        title: 'Copy of J1 PPT.pptx',
        location: 'Google Drive / J1Science',
      },
    ],
  },
  {
    id: 'j2-fall-ecosystems',
    number: 'Unit 2',
    title: 'Ecosystems',
    description: 'Habitats, food webs, adaptation and interactions within ecosystems.',
    year: 'J2',
    semester: 'Fall',
    accent: 'green',
    sourceReferences: [
      {
        id: 'src-j2-ppt',
        type: 'presentation',
        title: 'J2 PPT (updated).pptx',
        location: 'Google Drive / J2Science',
      },
    ],
  },
  {
    id: 'j2-spring-earth',
    number: 'Unit 3',
    title: 'Earth Systems',
    description: 'Water, weather, human impact and evidence-based environmental decisions.',
    year: 'J2',
    semester: 'Spring / Summer',
    accent: 'amber',
    sourceReferences: [
      {
        id: 'src-j2-ppt',
        type: 'presentation',
        title: 'J2 PPT (updated).pptx',
        location: 'Google Drive / J2Science',
      },
    ],
  },
]
