import { readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const sourcePath = path.join(scriptsDir, 'route-scroll-test.mjs')
const generatedPath = path.join(scriptsDir, '.route-scroll-test.generated.mjs')

const source = await readFile(sourcePath, 'utf8')
const updated = source
  .replaceAll('Manage Learning Hubs', 'Manage Hubs')
  .replaceAll('Teacher Content Studio', 'Content Library')
  .replaceAll("document.querySelector('.topbar')?.getBoundingClientRect().bottom", "document.querySelector('.topbar, .workspace-topbar')?.getBoundingClientRect().bottom")

if (updated === source) {
  throw new Error('The route-scroll compatibility replacements no longer match the source test. Update the test runner intentionally.')
}

await writeFile(generatedPath, updated, 'utf8')
try {
  await import(`${pathToFileURL(generatedPath).href}?run=${Date.now()}`)
} finally {
  await unlink(generatedPath).catch(() => undefined)
}
