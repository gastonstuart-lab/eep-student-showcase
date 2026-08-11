#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const assetPaths = [
  '/science-lessons/biomes/earth-blue-marble.jpg',
  '/science-lessons/biomes/rainforest-canopy.jpg',
  '/science-lessons/biomes/desert-sahara.jpg',
  '/science-lessons/biomes/grassland-savanna.jpg',
  '/science-lessons/biomes/deciduous-autumn.jpg',
  '/science-lessons/biomes/boreal-taiga.jpg',
  '/science-lessons/biomes/tundra-alpine.jpg',
  '/science-lessons/biomes/mountains-ice.jpg',
  '/science-lessons/biomes/permafrost-pattern.jpg',
]

const missing = assetPaths.filter((assetPath) => !existsSync(join(process.cwd(), 'public', assetPath.replace(/^\//, ''))))

if (missing.length > 0) {
  console.error('Missing Science lesson assets:')
  for (const asset of missing) console.error(`- ${asset}`)
  process.exit(1)
}

console.log(`Verified ${assetPaths.length} Science lesson assets.`)
