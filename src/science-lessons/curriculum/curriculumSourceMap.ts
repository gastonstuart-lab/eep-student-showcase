import type { Semester, YearLevel } from '../types/lesson'

export type SourceHierarchyStatus = 'verified' | 'pending-source-range'

export type SourceSectionMapping = {
  id: string
  year: YearLevel
  semester: Semester
  unitId: string
  chapterNumber: string
  chapterTitle?: string
  sectionNumber?: string
  sectionTitle: string
  sourceTitle: string
  driveFileId?: string
  sourceSlideRange?: string
  status: SourceHierarchyStatus
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
    status: 'verified',
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
    status: 'verified',
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
    status: 'verified',
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
    status: 'verified',
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
    status: 'verified',
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
    status: 'verified',
  },
  {
    id: 'j1-ch2-reactions',
    year: 'J1',
    semester: 'Fall',
    unitId: 'j1-fall-reactions',
    chapterNumber: 'Chapter 2',
    sectionTitle: 'Chemical Reactions',
    sourceTitle: 'Copy of J1 PPT.pptx',
    driveFileId: '1STwllX6-z931Hsqst_A1FvN7xwLCVI0g',
    status: 'pending-source-range',
  },
  {
    id: 'j1-ch3-s1',
    year: 'J1',
    semester: 'Spring / Summer',
    unitId: 'j1-spring-solutions',
    chapterNumber: 'Chapter 3',
    sectionNumber: 'Section 1',
    sectionTitle: 'Solutions and Solubility',
    sourceTitle: 'Copy of J1 PPT.pptx',
    driveFileId: '1STwllX6-z931Hsqst_A1FvN7xwLCVI0g',
    status: 'pending-source-range',
  },
  {
    id: 'j2-ch2-s5',
    year: 'J2',
    semester: 'Fall',
    unitId: 'j2-fall-ecosystems',
    chapterNumber: 'Chapter 2',
    sectionNumber: 'Section 5',
    sectionTitle: 'Ecosystems',
    sourceTitle: 'J2 PPT (updated).pptx',
    driveFileId: '14AUxNBq96_rRR9exiieSsHBdvuth4ofh',
    status: 'pending-source-range',
  },
]

export const sourceSectionMappingByUnitId = Object.fromEntries(
  sourceSectionMappings.map((mapping) => [mapping.unitId, mapping]),
) as Record<string, SourceSectionMapping>
