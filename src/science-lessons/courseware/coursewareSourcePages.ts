export type CoursewareSourcePage = {
  sourceSlide: number
  heading: string
  subheading?: string
  prompt?: string
  paragraphs: string[]
  byline?: string
}

export const coursewareSourcePages: Record<string, CoursewareSourcePage> = {
  'j1-ch1-1-title': {
    sourceSlide: 1,
    heading: 'Chapter 1: Section 1',
    subheading: 'Living Things and the Environment',
    paragraphs: [],
    byline: 'BY: XG LAWRENCE',
  },
  'j1-ch1-1-question-needs': {
    sourceSlide: 2,
    heading: 'QUESTION OF THE DAY!!',
    prompt: 'What needs are met by an organism’s environment?',
    paragraphs: [],
  },
  'j1-ch1-1-habitats': {
    sourceSlide: 3,
    heading: 'Habitats',
    paragraphs: [
      'An organism obtains food, water, shelter, and other things it needs to live, grow, and reproduce from its environment.',
      'An environment that provides the things the organism needs to live, grow, and reproduce is called its habitat.',
    ],
  },
  'j1-ch1-1-question-parts': {
    sourceSlide: 4,
    heading: 'QUESTION OF THE DAY!!',
    prompt: 'What are the two parts of an organism’s habitat with which it interacts?',
    paragraphs: [],
  },
  'j1-ch1-1-abiotic-overview': {
    sourceSlide: 5,
    heading: 'Abiotic Factors',
    paragraphs: [
      'Abiotic factors are the nonliving parts of an organism’s habitat.',
      'These factors are: water, sunlight, oxygen. Temperature and soil.',
    ],
  },
  'j1-ch1-1-biotic-factors': {
    sourceSlide: 6,
    heading: 'Biotic Factors',
    paragraphs: [
      'An organism interacts with both the living and nonliving parts of its habitat.',
      'The living parts of a habitat are called biotic factors.',
      'Animals and plants in the habitat are the biotic factors.',
      'Example: Wolves, birds, plants, seeds and fish.',
    ],
  },
  'j1-ch1-1-water': {
    sourceSlide: 7,
    heading: 'Abiotic Factors',
    subheading: 'WATER',
    paragraphs: [
      'Plants and algae need water, along with sunlight and carbon dioxide, to make their own food in a process called photosynthesis.',
      'Water makes up a large part of the bodies of most organisms.',
      'All things need water to live.',
    ],
  },
  'j1-ch1-1-sunlight': {
    sourceSlide: 8,
    heading: 'Abiotic Factors',
    subheading: 'Sunlight',
    paragraphs: [
      'Is needed for photosynthesis in plants.',
      'Places that don’t get sunlight, plants and algae cannot grow.',
      'Few organisms can live where sunlight cannot reach.',
    ],
  },
  'j1-ch1-1-oxygen': {
    sourceSlide: 9,
    heading: 'Abiotic Factors',
    subheading: 'Oxygen',
    paragraphs: [
      'Most living things need oxygen to live.',
      'Organisms on land get oxygen from the air.',
      'Fish and water organisms get oxygen from the water around them.',
    ],
  },
  'j1-ch1-1-temperature': {
    sourceSlide: 10,
    heading: 'Abiotic Factors',
    subheading: 'Temperature',
    paragraphs: [
      'Temperatures of an area determine the organisms that will live there.',
      'Some animals can change their way of living to adapt to the temperatures of that environment. HOT or COLD.',
    ],
  },
  'j1-ch1-1-soil': {
    sourceSlide: 11,
    heading: 'Abiotic Factors',
    subheading: 'Soil',
    paragraphs: [
      'Is a mixture of rock pieces, nutrients, air, water, and the decaying remains of living things.',
      'Soil in different areas contain different amounts of these materials.',
      'The type of soil in an area influences the type of organisms living there.',
    ],
  },
  'j1-ch1-1-question-levels': {
    sourceSlide: 12,
    heading: 'QUESTION OF THE DAY!!',
    prompt: 'What are the levels of organization within an ecosystem?',
    paragraphs: [],
  },
  'j1-ch1-1-populations': {
    sourceSlide: 13,
    heading: 'Levels of Organization',
    subheading: 'Populations',
    paragraphs: [
      'A species is a group of organisms that are physically similar and can mate with each other and produce offspring.',
      'All the members of one species in a area are called the population.',
    ],
  },
  'j1-ch1-1-communities': {
    sourceSlide: 14,
    heading: 'Levels of Organization',
    subheading: 'Communities',
    paragraphs: [
      'A particular area contains more than one species of organisms.',
      'All the different populations that live together in an area make up a community.',
      'The different populations must live close together to interact.',
    ],
  },
  'j1-ch1-1-ecosystems': {
    sourceSlide: 15,
    heading: 'Levels of Organization',
    subheading: 'Ecosystems',
    paragraphs: [
      'Is a community of organisms that live in a particular area, along with their nonliving surroundings.',
      'The study of how living things interact with each other and with their environment is called ecology.',
    ],
  },

  'j2-ch1-title': {
    sourceSlide: 1,
    heading: 'Chapter 1:',
    subheading: 'ATOMS AND BONDING',
    paragraphs: [],
    byline: 'BY: XG LAWRENCE',
  },
  'j2-ch1-1-title': {
    sourceSlide: 2,
    heading: 'Chapter 1: Section 1',
    subheading: 'Elements and Atoms',
    paragraphs: [],
    byline: 'BY: XG LAWRENCE',
  },
  'j2-ch1-1-question-building-blocks': {
    sourceSlide: 3,
    heading: 'QUESTION OF THE DAY!!',
    prompt: 'Why are elements sometimes called the building blocks of matter?',
    paragraphs: [],
  },
  'j2-ch1-1-building-blocks-matter': {
    sourceSlide: 4,
    heading: 'The Building Blocks of Matter',
    paragraphs: [
      'Matter is anything that has mass and takes up space.',
      'Elements are the simplest pure substances.',
      'Elements are called the building blocks of matter because all matter is composed of one element or a combination of elements.',
    ],
  },
  'j2-ch1-1-elements-compounds-mixtures': {
    sourceSlide: 5,
    heading: 'The Building Blocks of Matter',
    subheading: 'ELEMENTS, COMPOUNDS, AND MIXTURES',
    paragraphs: [
      'A pure substance made of two or more elements that are combined chemically in a specific ratio is called a compound.',
      'Two or more substances that are in the same place but are not chemically combined is a mixture.',
    ],
  },
  'j2-ch1-1-particles-elements': {
    sourceSlide: 6,
    heading: 'The Building Blocks of Matter',
    subheading: 'PARTICLES OF ELEMENTS',
    paragraphs: [
      'An atom is the smallest particle of an element.',
      'Democritus proposed the idea that matter is formed of small pieces that could not be cut into smaller parts, it was called atomos.',
    ],
  },
  'j2-ch1-1-question-theory': {
    sourceSlide: 7,
    heading: 'QUESTION OF THE DAY!!',
    prompt: 'How did the atomic theory develop and change?',
    paragraphs: [],
  },
  'j2-ch1-1-theory-models': {
    sourceSlide: 8,
    heading: 'Atomic Theory and Models',
    paragraphs: [
      'A scientific theory is a well-tested idea that explains and connects a wide range of observations.',
      'Models are physical, mental, visual, and other representations of an idea to help people understand what they cannot see.',
    ],
  },
  'j2-ch1-1-dalton': {
    sourceSlide: 9,
    heading: 'Atomic Theory and Models',
    subheading: 'DALTON’S ATOMIC THEORY',
    paragraphs: [
      'Dalton proposed the atomic theory and models for the atom.',
      'This theory is still accepted today.',
    ],
  },
  'j2-ch1-1-thomson': {
    sourceSlide: 10,
    heading: 'Atomic Theory and Models',
    subheading: 'THOMSON AND SMALLER PARTS OF ATOMS',
    paragraphs: [
      'Thomson proposed that atoms are made up of smaller parts.',
      'He found that atoms contain negatively charged particles.',
      'These negatively charged particles in atoms became known as electrons.',
    ],
  },
  'j2-ch1-1-rutherford': {
    sourceSlide: 11,
    heading: 'Atomic Theory and Models',
    subheading: 'RUTHERFORD AND THE NUCLEUS',
    paragraphs: [
      'Rutherford proposed that an atom’s positive charge must be clustered in a tiny region in the center called the nucleus.',
      'He named the positively charged particles in the nucleus the protons.',
    ],
  },
  'j2-ch1-1-bohr': {
    sourceSlide: 12,
    heading: 'Atomic Theory and Models',
    subheading: 'BOHR’S MODEL',
    paragraphs: [
      'Bohr proposed that electrons could have only specific amounts of energy, which causes them to move in certain orbits.',
    ],
  },
  'j2-ch1-1-electron-cloud': {
    sourceSlide: 13,
    heading: 'Atomic Theory and Models',
    subheading: 'A CLOUD OF ELECTRONS',
    paragraphs: [
      'Scientists later determined that electrons don’t orbit the nucleus, but they can be anywhere in a “cloud” around the nucleus.',
      'An electron’s movement is related to its energy level, or the amount of energy it has.',
    ],
  },
  'j2-ch1-1-modern-model': {
    sourceSlide: 14,
    heading: 'Atomic Theory and Models',
    subheading: 'THE MODERN ATOMIC MODEL',
    paragraphs: [
      'Chadwick discovered another particle in the nucleus of atoms.',
      'This discovery completed the modern atomic model.',
      'The particle is electrically neutral so it was called a neutron.',
    ],
  },
  'j2-ch1-1-models-summary': {
    sourceSlide: 15,
    heading: 'Atomic Theory and Models',
    paragraphs: [],
  },
}
