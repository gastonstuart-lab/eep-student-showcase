import type { Department, HubPage, HubPageInput } from './types'

export interface HubConfig {
  sectionId: string
  route: string
  adminRoute: string
  department: Department
  sectionName: string
  eyebrow: string
  kind: 'root' | 'program' | 'subject'
  children: string[]
  defaults: HubPageInput
}

export const hubConfigs: HubConfig[] = [
  {
    sectionId: 'ied',
    route: '/',
    adminRoute: '/admin/hubs/ied',
    department: 'IED',
    sectionName: 'IED',
    eyebrow: 'International Education Department',
    kind: 'root',
    children: ['eep', 'esl'],
    defaults: {
      sectionId: 'ied',
      title: 'IED Learning Showcase Hub',
      subtitle: 'Student learning, creative projects, and department updates in one public home.',
      intro: 'Explore IED learning across EEP publishing and ESL subject hubs.',
      description:
        'The International Education Department helps students use English to investigate ideas, create useful public work, and connect with real audiences.',
      heroImageUrl: '',
      accent: '#006bd6',
      parentSectionId: '',
      childSectionIds: ['eep', 'esl'],
      primaryButtonText: 'Enter EEP',
      primaryButtonUrl: '/eep',
      secondaryButtonText: 'Enter ESL',
      secondaryButtonUrl: '/esl',
      featured: true,
    },
  },
  {
    sectionId: 'eep',
    route: '/eep',
    adminRoute: '/admin/hubs/eep',
    department: 'EEP',
    sectionName: 'EEP',
    eyebrow: 'English Enrichment Program',
    kind: 'program',
    children: [],
    defaults: {
      sectionId: 'eep',
      title: 'EEP Student Website Showcase',
      subtitle: 'Student-built websites for real audiences, reviewed and published by teachers.',
      intro: 'Submit, review, approve, and browse student Google Sites projects.',
      description:
        'EEP students build public-facing websites that combine English communication, design choices, research, and audience awareness.',
      heroImageUrl: '',
      accent: '#008f5d',
      parentSectionId: 'ied',
      childSectionIds: [],
      primaryButtonText: 'Browse Showcase',
      primaryButtonUrl: '/eep/showcase',
      secondaryButtonText: 'Submit Project',
      secondaryButtonUrl: '/submit',
      featured: true,
    },
  },
  {
    sectionId: 'esl',
    route: '/esl',
    adminRoute: '/admin/hubs/esl',
    department: 'ESL',
    sectionName: 'ESL',
    eyebrow: 'ESL Department',
    kind: 'program',
    children: ['esl-science', 'esl-language-arts', 'esl-performance-arts', 'esl-social-studies'],
    defaults: {
      sectionId: 'esl',
      title: 'ESL Subject Hubs',
      subtitle: 'Science, Language Arts, Performance Arts, and Social Studies learning spaces.',
      intro: 'Find subject updates, resources, featured work, performances, and learning links.',
      description:
        'ESL subject hubs support classroom learning with public updates, student work, events, media links, and reusable resources.',
      heroImageUrl: '',
      accent: '#10a878',
      parentSectionId: 'ied',
      childSectionIds: ['esl-science', 'esl-language-arts', 'esl-performance-arts', 'esl-social-studies'],
      primaryButtonText: 'Performance Arts',
      primaryButtonUrl: '/esl/performance-arts',
      secondaryButtonText: 'EEP Showcase',
      secondaryButtonUrl: '/eep',
      featured: true,
    },
  },
  {
    sectionId: 'esl-science',
    route: '/esl/science',
    adminRoute: '/admin/hubs/esl-science',
    department: 'ESL',
    sectionName: 'Science',
    eyebrow: 'ESL Science',
    kind: 'subject',
    children: [],
    defaults: {
      sectionId: 'esl-science',
      title: 'Science Hub',
      subtitle: 'Inquiry, experiments, vocabulary, and student explanations.',
      intro: 'A home for science updates, resources, investigations, and student thinking.',
      description:
        'Students use English to ask questions, explain evidence, describe processes, and connect science learning to everyday life.',
      heroImageUrl: '',
      accent: '#00a2c7',
      parentSectionId: 'esl',
      childSectionIds: [],
      primaryButtonText: 'Back to ESL',
      primaryButtonUrl: '/esl',
      secondaryButtonText: 'Manage Hub',
      secondaryButtonUrl: '/admin/hubs/esl-science',
      featured: false,
    },
  },
  {
    sectionId: 'esl-language-arts',
    route: '/esl/language-arts',
    adminRoute: '/admin/hubs/esl-language-arts',
    department: 'ESL',
    sectionName: 'Language Arts',
    eyebrow: 'ESL Language Arts',
    kind: 'subject',
    children: [],
    defaults: {
      sectionId: 'esl-language-arts',
      title: 'Language Arts Hub',
      subtitle: 'Reading, writing, speaking, and published student responses.',
      intro: 'A home for classroom texts, writing craft, discussion, and student publication.',
      description:
        'Students build confidence through purposeful reading, writing, speaking, reflection, and feedback.',
      heroImageUrl: '',
      accent: '#5975d9',
      parentSectionId: 'esl',
      childSectionIds: [],
      primaryButtonText: 'Back to ESL',
      primaryButtonUrl: '/esl',
      secondaryButtonText: 'Manage Hub',
      secondaryButtonUrl: '/admin/hubs/esl-language-arts',
      featured: false,
    },
  },
  {
    sectionId: 'esl-performance-arts',
    route: '/esl/performance-arts',
    adminRoute: '/admin/hubs/esl-performance-arts',
    department: 'ESL',
    sectionName: 'Performance Arts',
    eyebrow: 'ESL Performance Arts',
    kind: 'subject',
    children: [],
    defaults: {
      sectionId: 'esl-performance-arts',
      title: 'Performance Arts Hub',
      subtitle: 'Announcements, showcases, student work, video links, resources, and updates.',
      intro: 'A bright home for voice, movement, story, rehearsal, and performance reflection.',
      description:
        'Students develop expressive English through theatre, movement, spoken word, performance choices, and audience awareness.',
      heroImageUrl: '',
      accent: '#f9a23a',
      parentSectionId: 'esl',
      childSectionIds: [],
      primaryButtonText: 'Back to ESL',
      primaryButtonUrl: '/esl',
      secondaryButtonText: 'Manage Hub',
      secondaryButtonUrl: '/admin/hubs/esl-performance-arts',
      featured: true,
    },
  },
  {
    sectionId: 'esl-social-studies',
    route: '/esl/social-studies',
    adminRoute: '/admin/hubs/esl-social-studies',
    department: 'ESL',
    sectionName: 'Social Studies',
    eyebrow: 'ESL Social Studies',
    kind: 'subject',
    children: [],
    defaults: {
      sectionId: 'esl-social-studies',
      title: 'Social Studies Hub',
      subtitle: 'Culture, geography, history, discussion, and civic learning.',
      intro: 'A home for social studies questions, class resources, projects, and public updates.',
      description:
        'Students use English to compare perspectives, explain places and events, discuss communities, and connect learning to the world.',
      heroImageUrl: '',
      accent: '#c86d2d',
      parentSectionId: 'esl',
      childSectionIds: [],
      primaryButtonText: 'Back to ESL',
      primaryButtonUrl: '/esl',
      secondaryButtonText: 'Manage Hub',
      secondaryButtonUrl: '/admin/hubs/esl-social-studies',
      featured: false,
    },
  },
]

export const hubConfigById = Object.fromEntries(hubConfigs.map((hub) => [hub.sectionId, hub])) as Record<
  string,
  HubConfig
>

export const hubPageFromConfig = (config: HubConfig): HubPage => ({
  id: config.sectionId,
  ...config.defaults,
})

export const subjectHubIds = ['esl-science', 'esl-language-arts', 'esl-performance-arts', 'esl-social-studies']
