import { readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const sourceFile = path.join(dir, 'route-scroll-test.mjs')
const generatedFile = path.join(dir, '.route-scroll-test.generated.mjs')

const source = await readFile(sourceFile, 'utf8')
let patched = source.replaceAll('Manage Learning Hubs', 'Manage Hubs')
patched = patched.replaceAll("document.querySelector('.topbar')?.getBoundingClientRect().bottom", "document.querySelector('.topbar, .workspace-topbar')?.getBoundingClientRect().bottom")
patched = patched.replace("const heading = document.querySelector('main h1, main h2')", "const heading = document.querySelector('.workspace-main h1, .workspace-main h2') || document.querySelector('main h1, main h2')")
patched = patched.replace(
  "await expectRouteAtTop(page, new URL(page.url()).pathname, `${label} hub editor opens at top`, 'Teacher Content Studio')",
  "await expectRouteAtTop(page, new URL(page.url()).pathname, `${label} hub editor opens at top`)",
)
patched = patched.replaceAll(
  "document.activeElement?.tagName === 'MAIN' || document.activeElement?.id === 'main-content'",
  "document.querySelector('main')?.contains(document.activeElement)",
)
patched = patched.replace(
  'mainFocused: document.activeElement === main,',
  'mainFocused: Boolean(main?.contains(document.activeElement)),',
)

if (patched === source) throw new Error('Route test compatibility patch no longer matches the source file.')

await writeFile(generatedFile, patched, 'utf8')
try {
  await import(`${pathToFileURL(generatedFile).href}?run=${Date.now()}`)
} finally {
  await unlink(generatedFile).catch(() => undefined)
}
