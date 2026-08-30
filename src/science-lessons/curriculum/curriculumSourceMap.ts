import type { Semester, YearLevel } from '../types/lesson'

export type SourceHierarchyStatus = 'verified-from-original-ppt' | 'source-incomplete'
export type SourceVerificationBasis = 'direct-original-ppt' | 'recovered-material'

export type SourceSectionMapping = {
  id: string
  year: YearLevel
  semester: Semester
  sourceYear?: YearLevel
  unitId: string
  chapterNumber: string
  chapterTitle?: string
  sectionNumber?: string
  sectionTitle: string
  sourceTitle: string
  driveFileId?: string
  sourceSlideRange?: string
  status: SourceHierarchyStatus
  verificationBasis: SourceVerificationBasis
  verificationNote: string
}

export const formatSourceSectionLabel = (mapping: SourceSectionMapping) => {
  const parts = [mapping.chapterNumber]
  if (mapping.sectionNumber) parts.push(mapping.sectionNumber)
  return parts.join(' · ')
}

export const sourceSectionMappings: SourceSectionMapping[] = [
  {
    id: 'j1-ch1-s1',
    year: 'J1',
    semester: 'Fall',
    unitId: 'j1-fall-life-ecosystems',
    chapterNumber: 'Chapter 1',
    sectionNumber: 'Section 1',
    sectionTitle: 'Living Things and the Environment',
    sourceTitle: 'Copy of J1 PPT.pptx',
    driveFileId: '1STwllX6-z931Hsqst_A1FvN7xwLCVI0g',
    sourceSlideRange: '1-15',
    status: 'verified-from-original-ppt',
    verificationBasis: 'direct-original-ppt',
    verificationNote: 'Directly inspected the original J1 PPTX slide XML: slide 1 is Chapter 1 Section 1 and slide 16 starts Section 2.',
  },
  {
    id: 'j1-ch1-s2',
    year: 'J1',
    semester: 'Fall',
    unitId: 'j1-ch1-s2-studying-populations',
    chapterNumber: 'Chapter 1',
    sectionNumber: 'Section 2',
    sectionTitle: 'Studying Populations',
    sourceTitle: 'Copy of J1 PPT.pptx',
    driveFileId: '1STwllX6-z931Hsqst_A1FvN7xwLCVI0g',
    sourceSlideRange: '16-34',
    status: 'verified-from-original-ppt',
    verificationBasis: 'direct-original-ppt',
    verificationNote: 'Directly inspected the original J1 PPTX slide XML: slide 16 starts Section 2 and slide 35 starts Section 3.',
  },
  {
    id: 'j1-ch1-s3',
    year: 'J1',
    semester: 'Fall',
    unitId: 'j1-ch1-s3-interactions',
    chapterNumber: 'Chapter 1',
    sectionNumber: 'Section 3',
    sectionTitle: 'Interactions Among Living Things',
    sourceTitle: 'Copy of J1 PPT.pptx',
    driveFileId: '1STwllX6-z931Hsqst_A1FvN7xwLCVI0g',
    sourceSlideRange: '35-44',
    status: 'verified-from-original-ppt',
    verificationBasis: 'direct-original-ppt',
    verificationNote: 'Directly inspected the original J1 PPTX slide XML: slide 35 starts Section 3 and slide 45 starts Section 4.',
  },
  {
    id: 'j1-ch1-s4',
    year: 'J1',
    semester: 'Fall',
    unitId: 'j1-ch1-s4-succession',
    chapterNumber: 'Chapter 1',
    sectionNumber: 'Section 4',
    sectionTitle: 'Changes in Communities: Ecological Succession',
    sourceTitle: 'Copy of J1 PPT.pptx',
    driveFileId: '1STwllX6-z931Hsqst_A1FvN7xwLCVI0g',
    sourceSlideRange: '45-53',
    status: 'verified-from-original-ppt',
    verificationBasis: 'direct-original-ppt',
    verificationNote: 'Directly inspected the original J1 PPTX slide XML: slide 45 starts Section 4 and slide 54 starts Chapter 2 Section 1.',
  },
  {
    id: 'j1-ch2-s4',
    year: 'J1',
    semester: 'Fall',
    unitId: 'j1-ch2-biomes',
    chapterNumber: 'Chapter 2',
    sectionNumber: 'Section 4',
    sectionTitle: 'Biomes',
    sourceTitle: 'Copy of J1 PPT.pptx',
    driveFileId: '1STwllX6-z931Hsqst_A1FvN7xwLCVI0g',
    sourceSlideRange: '99-116',
    status: 'verified-from-original-ppt',
    verificationBasis: 'direct-original-ppt',
    verificationNote: 'Directly inspected the original J1 PPTX slide XML: slide 99 is Chapter 2 Section 4 Biomes and slide 117 starts Section 5.',
  },
  {
    id: 'j2-ch1-s1',
    year: 'J2',
    semester: 'Fall',
    unitId: 'j2-fall-atoms-bonding',
    chapterNumber: 'Chapter 1',
    chapterTitle: 'Atoms and Bonding',
    sectionNumber: 'Section 1',
    sectionTitle: 'Elements and Atoms',
    sourceTitle: 'J2 PPT (updated).pptx',
    driveFileId: '14AUxNBq96_rRR9exiieSsHBdvuth4ofh',
    sourceSlideRange: '1-15',
    status: 'verified-from-original-ppt',
    verificationBasis: 'direct-original-ppt',
    verificationNote: 'Directly inspected the original J2 PPTX slide XML: slide 1 is the Chapter 1 opener, slide 2 is Section 1, and slide 16 starts Section 2.',
  },
  {
    id: 'j1-ch2-reactions',
    year: 'J1',
    semester: 'Fall',
    sourceYear: 'J2',
    unitId: 'j1-fall-reactions',
    chapterNumber: 'Chapter 2',
    sectionTitle: 'Chemical Reactions',
    sourceTitle: 'J2 PPT (updated).pptx',
    driveFileId: '14AUxNBq96_rRR9exiieSsHBdvuth4ofh',
    sourceSlideRange: '52-106',
    status: 'verified-from-original-ppt',
    verificationBasis: 'direct-original-ppt',
    verificationNote: 'Directly inspected the original J2 PPTX slide XML: slide 52 starts Chapter 2 Chemical Reactions and slide 107 starts Chapter 3 Section 2.',
  },
  {
    id: 'j1-ch3-s1',
    year: 'J1',
    semester: 'Spring / Summer',
    sourceYear: 'J2',
    unitId: 'j1-spring-solutions',
    chapterNumber: 'Chapter 3',
    sectionNumber: 'Section 2',
    sectionTitle: 'Concentration and Solubility',
    sourceTitle: 'J2 PPT (updated).pptx',
    driveFileId: '14AUxNBq96_rRR9exiieSsHBdvuth4ofh',
    sourceSlideRange: '107-130',
    status: 'verified-from-original-ppt',
    verificationBasis: 'direct-original-ppt',
    verificationNote: 'Directly inspected the original J2 PPTX slide XML: slide 107 starts Chapter 3 Section 2 Concentration and Solubility and slide 131 starts Section 3.',
  },
  {
    id: 'j2-ch2-s5',
    year: 'J2',
    semester: 'Fall',
    sourceYear: 'J1',
    unitId: 'j2-fall-ecosystems',
    chapterNumber: 'Chapter 2',
    sectionNumber: 'Section 5',
    sectionTitle: 'Aquatic Ecosystems',
    sourceTitle: 'Copy of J1 PPT.pptx',
    driveFileId: '1STwllX6-z931Hsqst_A1FvN7xwLCVI0g',
    sourceSlideRange: '117-132',
    status: 'verified-from-original-ppt',
    verificationBasis: 'direct-original-ppt',
    verificationNote: 'Directly inspected the original J1 PPTX slide XML: slide 117 starts Chapter 2 Section 5 and slides 118-132 cover Aquatic Ecosystems.',
  },
]

export const sourceSectionMappingByUnitId = Object.fromEntries(
  sourceSectionMappings.map((mapping) => [mapping.unitId, mapping]),
) as Record<string, SourceSectionMapping>
