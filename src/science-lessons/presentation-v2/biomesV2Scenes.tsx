import type { ReactNode } from 'react'
import { BiomeConceptScene, ClimateScene, RainfallScene, RainforestScene } from './BiomesV2SceneComponents'

export type BiomesV2SceneId = 'biome' | 'climate' | 'rainforest' | 'rainfall'

export interface BiomesV2Scene {
  id: BiomesV2SceneId
  label: string
  title: string
  support: string
  zh: string
  maxStep: number
  supportTerms: SupportTerm[]
  notes: StudentNotes
  render: (step: number) => ReactNode
}

export interface SupportTerm {
  id: string
  label: string
  zh: string
  x: number
  y: number
}

export interface StudentNotes {
  heading: string
  source: string
  keyLine: string
  bullets: string[]
  vocabulary: Array<{ term: string; meaning: string }>
  diagram?: 'biome-equation' | 'climate-axes' | 'rainforest-layers' | 'rainfall-bars'
}

export const biomesV2Scenes: BiomesV2Scene[] = [
  {
    id: 'biome',
    label: '01 Concept',
    title: 'What is a biome?',
    support: 'A biome is a group of land ecosystems with similar climates and organisms.',
    zh: '\u751f\u7269\u7fa4\u7cfb\u662f\u4e00\u7d44\u5177\u6709\u76f8\u4f3c\u6c23\u5019\u548c\u751f\u7269\u7684\u9678\u5730\u751f\u614b\u7cfb\u3002',
    maxStep: 3,
    supportTerms: [
      { id: 'climate', label: 'climate', zh: '\u6c23\u5019', x: 60, y: 29 },
      { id: 'organisms', label: 'organisms', zh: '\u751f\u7269', x: 60, y: 42 },
      { id: 'biome', label: 'biome', zh: '\u751f\u7269\u7fa4\u7cfb', x: 60, y: 55 },
    ],
    notes: {
      heading: 'What is a biome?',
      source: 'Source slide: j1-ch2-4-biome-definition',
      keyLine: 'A biome is a group of land ecosystems with similar climates and organisms.',
      bullets: [
        'Climate means temperature and precipitation in an area.',
        'Organisms means the plants and animals that live there.',
        'Similar climate + similar organisms can identify a biome.',
      ],
      vocabulary: [
        { term: 'biome', meaning: 'a group of land ecosystems with similar climates and organisms' },
        { term: 'climate', meaning: 'the usual weather conditions of a place' },
        { term: 'organism', meaning: 'a living thing' },
      ],
      diagram: 'biome-equation',
    },
    render: (step) => <BiomeConceptScene step={step} />,
  },
  {
    id: 'climate',
    label: '02 Diagram',
    title: 'Climate determines the biome',
    support: 'Temperature and precipitation are the two climate clues students should track.',
    zh: '\u6eab\u5ea6\u548c\u964d\u6c34\u91cf\u662f\u5224\u65b7\u751f\u7269\u7fa4\u7cfb\u7684\u5169\u500b\u91cd\u8981\u6c23\u5019\u7dda\u7d22\u3002',
    maxStep: 4,
    supportTerms: [
      { id: 'temperature', label: 'temperature', zh: '\u6eab\u5ea6', x: 34, y: 82 },
      { id: 'precipitation', label: 'precipitation', zh: '\u964d\u6c34\u91cf', x: 33, y: 34 },
      { id: 'rain-forest', label: 'rain forest', zh: '\u96e8\u6797', x: 80, y: 25 },
    ],
    notes: {
      heading: 'Climate determines the biome',
      source: 'Source slide: j1-ch2-4-climate-drivers',
      keyLine: 'Temperature and precipitation help determine which biome can form.',
      bullets: [
        'First ask how warm or cold the area is.',
        'Then ask how much precipitation falls there.',
        'Organisms must survive those climate conditions.',
      ],
      vocabulary: [
        { term: 'temperature', meaning: 'how hot or cold something is' },
        { term: 'precipitation', meaning: 'water that falls from the atmosphere, such as rain or snow' },
      ],
      diagram: 'climate-axes',
    },
    render: (step) => <ClimateScene step={step} />,
  },
  {
    id: 'rainforest',
    label: '03 Photo',
    title: 'Rain forest',
    support: 'Canopy, understory, heavy rainfall, and many organisms are the note-worthy ideas.',
    zh: '\u6a39\u51a0\u5c64\u3001\u6797\u4e0b\u5c64\u3001\u5927\u91cf\u964d\u96e8\u548c\u8c50\u5bcc\u751f\u7269\u662f\u7b46\u8a18\u91cd\u9ede\u3002',
    maxStep: 4,
    supportTerms: [
      { id: 'canopy', label: 'canopy', zh: '\u6a39\u51a0\u5c64', x: 57, y: 21 },
      { id: 'understory', label: 'understory', zh: '\u6797\u4e0b\u5c64', x: 41, y: 58 },
      { id: 'rainfall', label: '300 cm/year', zh: '\u6bcf\u5e74 300 \u516c\u5206', x: 73, y: 71 },
    ],
    notes: {
      heading: 'Rain forest biomes',
      source: 'Source slide: j1-ch2-4-rain-forest',
      keyLine: 'Rain forests receive a lot of rain and have many organisms.',
      bullets: [
        'Tropical rain forests are warm and humid all year long.',
        'Tall trees form a leafy roof called the canopy.',
        'A second layer of shorter trees and vines forms an understory.',
        'Rain forests provide a habitat for many species.',
      ],
      vocabulary: [
        { term: 'canopy', meaning: 'the leafy roof formed by tall trees' },
        { term: 'understory', meaning: 'shorter trees and vines under the canopy' },
        { term: 'habitat', meaning: 'the place where an organism lives' },
      ],
      diagram: 'rainforest-layers',
    },
    render: (step) => <RainforestScene step={step} />,
  },
  {
    id: 'rainfall',
    label: '04 Graph',
    title: 'Rainfall changes the ecosystem',
    support: 'Use the curriculum values as evidence: less rain to more rain changes ecosystem conditions.',
    zh: '\u7528\u8ab2\u7a0b\u6578\u64da\u4f5c\u8b49\u64da\uff1a\u964d\u96e8\u91cf\u7531\u5c11\u5230\u591a\uff0c\u751f\u614b\u7cfb\u689d\u4ef6\u4e5f\u6703\u6539\u8b8a\u3002',
    maxStep: 4,
    supportTerms: [
      { id: 'desert', label: '<25 cm', zh: '\u5c11\u65bc 25 \u516c\u5206', x: 50, y: 67 },
      { id: 'savanna', label: '120 cm', zh: '120 \u516c\u5206', x: 75, y: 66 },
      { id: 'rain-forest', label: '300 cm', zh: '300 \u516c\u5206', x: 88, y: 64 },
    ],
    notes: {
      heading: 'Rainfall changes the ecosystem',
      source: 'Source slide: j1-ch2-4-rainfall-spectrum',
      keyLine: 'From desert to rain forest, precipitation is one of the clearest clues for identifying a biome.',
      bullets: [
        'Desert: less than 25 cm of rain per year.',
        'Prairie: 25-75 cm of rain per year.',
        'Savanna: 120 cm of rain per year.',
        'Rain forest: about 300 cm of rain per year.',
      ],
      vocabulary: [
        { term: 'precipitation', meaning: 'rain, snow, or other water that falls from the sky' },
        { term: 'ecosystem', meaning: 'living and nonliving things interacting in an area' },
      ],
      diagram: 'rainfall-bars',
    },
    render: (step) => <RainfallScene step={step} />,
  },
]

export const biomesV2SceneBySlideId: Record<string, BiomesV2Scene> = {
  'j1-ch2-4-biome-definition': biomesV2Scenes[0],
  'j1-ch2-4-climate-drivers': biomesV2Scenes[1],
  'j1-ch2-4-rain-forest': biomesV2Scenes[2],
  'j1-ch2-4-rainfall-spectrum': biomesV2Scenes[3],
}
