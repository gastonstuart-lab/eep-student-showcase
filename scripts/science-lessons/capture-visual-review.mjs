import { chromium } from 'playwright'
import { PNG } from 'pngjs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const args = new Map()
for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index]
  if (!arg.startsWith('--')) continue
  const key = arg.slice(2)
  const value = process.argv[index + 1]?.startsWith('--') ? 'true' : process.argv[index + 1] ?? 'true'
  args.set(key, value)
  if (value !== 'true') index += 1
}

const baseUrl = args.get('base-url') ?? 'http://127.0.0.1:4173'
const outDir = resolve(args.get('out-dir') ?? 'tmp/science-visual-review')
const screenshotsDir = resolve(outDir, 'screenshots')
const manifest = {
  generatedAt: new Date().toISOString(),
  source: {
    baseUrl,
    branch: process.env.GITHUB_REF_NAME ?? process.env.BRANCH_NAME ?? 'local',
    commit: process.env.GITHUB_SHA ?? 'local',
  },
  safety: {
    authenticatedContent: false,
    credentialsIncluded: false,
    environmentValuesIncluded: false,
    note: 'Capture script only visits public, unauthenticated routes and avoids admin/login surfaces.',
  },
  viewports: {
    standard: { width: 1440, height: 900 },
    presentation: { width: 1366, height: 768 },
  },
  screenshots: [],
}

await mkdir(screenshotsDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const consoleErrors = []
let shotNumber = 1

async function createPage(width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(`${width}x${height}: ${message.text()}`)
  })
  page.on('pageerror', (error) => consoleErrors.push(`${width}x${height}: ${error.message}`))
  return page
}

async function waitReady(page) {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await page.waitForTimeout(650)
}

async function screenshot(page, slug, description, options = {}) {
  await waitReady(page)
  const filename = `${String(shotNumber).padStart(2, '0')}-${slug}.png`
  const path = resolve(screenshotsDir, filename)
  await page.screenshot({ path, fullPage: options.fullPage ?? true })
  manifest.screenshots.push({
    filename: `screenshots/${filename}`,
    url: page.url(),
    viewport: page.viewportSize(),
    description,
    publicOnly: true,
  })
  shotNumber += 1
}

async function clickFirst(page, role, name) {
  await page.getByRole(role, { name }).first().click()
  await waitReady(page)
}

async function chooseSlide(page, index) {
  await page.locator('.viewer-thumbnails > button').nth(index).click()
  await waitReady(page)
}

async function openBiomesTeacherWorkspace(page, lessonIndex = 0) {
  await page.goto(`${baseUrl}/science-lessons.html`)
  await waitReady(page)
  await page.getByLabel('Year level').getByRole('button', { name: /J1/ }).click()
  await page.getByLabel('Semester').getByRole('button', { name: /Fall/ }).click()
  await clickFirst(page, 'button', /Open J1/)
  await page.getByRole('button', { name: 'Present lesson' }).nth(lessonIndex).click()
  await waitReady(page)
}

async function setPresentationLanguage(page, language) {
  await clickFirst(page, 'button', language)
}

async function setTraditionalChinese(page) {
  await page.locator('.viewer-language > button').nth(2).click()
  await waitReady(page)
}

async function enterPresentation(page) {
  await clickFirst(page, 'button', 'Present')
  await page.locator('.classroom-presentation-overlay').waitFor({ state: 'visible' })
  await waitReady(page)
}

async function exitPresentation(page) {
  await page.keyboard.press('Escape')
  await page.locator('.classroom-presentation-overlay').waitFor({ state: 'hidden' })
  await waitReady(page)
}

async function captureStandardScreens() {
  const page = await createPage(1440, 900)

  await page.goto(`${baseUrl}/`)
  await screenshot(page, 'ied-entry-point', 'IED public entry point')

  await page.goto(`${baseUrl}/esl/science`)
  await screenshot(page, 'science-hub-entry', 'Public ESL Science Hub entry point')

  await page.goto(`${baseUrl}/science-lessons.html`)
  await screenshot(page, 'science-lessons-home', 'Science Lessons homepage')

  await page.getByLabel('Year level').getByRole('button', { name: /J1/ }).click()
  await page.getByLabel('Semester').getByRole('button', { name: /Fall/ }).click()
  await waitReady(page)
  await screenshot(page, 'j1-home-selected', 'J1 Fall selected on Science Lessons homepage')

  await clickFirst(page, 'button', /Open J1/)
  await screenshot(page, 'j1-fall-library-units', 'J1 Fall unit and lesson library')

  await page.getByRole('button', { name: 'Present lesson' }).nth(0).click()
  await waitReady(page)
  await screenshot(page, 'lesson-1-teacher-workspace', 'Lesson 1 Teacher Workspace: What Is a Biome? Climate and Major Examples')

  await clickFirst(page, 'button', 'English')
  await screenshot(page, 'j1-teacher-workspace-english', 'Teacher Workspace in English mode')

  await clickFirst(page, 'button', 'Bilingual')
  await screenshot(page, 'j1-teacher-workspace-bilingual', 'Teacher Workspace in Bilingual mode')

  await clickFirst(page, 'button', '繁體中文')
  await screenshot(page, 'j1-teacher-workspace-traditional-chinese', 'Teacher Workspace in Traditional Chinese mode')

  await clickFirst(page, 'button', 'Return to lesson library')
  await page.getByRole('button', { name: 'Present lesson' }).nth(1).click()
  await waitReady(page)
  await screenshot(page, 'lesson-2-teacher-workspace', 'Lesson 2 Teacher Workspace: Forests, Tundra, Mountains and Ice')

  await clickFirst(page, 'button', 'Return to lesson library')
  await clickFirst(page, 'button', 'J2')
  await screenshot(page, 'j2-fall-library-units', 'J2 Fall unit and lesson library')

  await clickFirst(page, 'button', 'Spring / Summer')
  await screenshot(page, 'j2-spring-summer-empty-state', 'J2 Spring / Summer curriculum-aware empty state')

  await page.goto(`${baseUrl}/science-lessons.html?v2=biomes`)
  await screenshot(page, 'biomes-v2-public-prototype-route', 'Public Biomes V2 prototype route for comparison')

  await page.close()
}

async function capturePresentationScreens() {
  const page = await createPage(1366, 768)

  await openBiomesTeacherWorkspace(page, 0)

  await setPresentationLanguage(page, 'English')
  await chooseSlide(page, 0)
  await enterPresentation(page)
  await screenshot(page, 'lesson-1-presentation-english-title-1366x768', 'Lesson 1 English Presentation Mode at 1366x768: title / first state', { fullPage: false })
  await page.keyboard.press('ArrowRight')
  await waitReady(page)
  await screenshot(page, 'lesson-1-presentation-english-reveal-1366x768', 'Lesson 1 English Presentation Mode at 1366x768: intermediate progressive reveal', { fullPage: false })
  await exitPresentation(page)

  await setPresentationLanguage(page, 'Bilingual')
  await chooseSlide(page, 1)
  await enterPresentation(page)
  await page.keyboard.press('ArrowRight')
  await waitReady(page)
  await screenshot(page, 'lesson-1-presentation-bilingual-question-1366x768', 'Lesson 1 Bilingual Presentation Mode at 1366x768: question slide with Chinese support', { fullPage: false })
  await exitPresentation(page)

  await chooseSlide(page, 3)
  await enterPresentation(page)
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await waitReady(page)
  await screenshot(page, 'lesson-1-presentation-bilingual-diagram-1366x768', 'Lesson 1 Bilingual Presentation Mode at 1366x768: climate diagram slide', { fullPage: false })
  await exitPresentation(page)

  await chooseSlide(page, 4)
  await enterPresentation(page)
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await waitReady(page)
  await screenshot(page, 'lesson-1-presentation-bilingual-six-biomes-1366x768', 'Lesson 1 Bilingual Presentation Mode at 1366x768: six biomes content slide', { fullPage: false })
  await exitPresentation(page)

  await chooseSlide(page, 9)
  await enterPresentation(page)
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await waitReady(page)
  await screenshot(page, 'lesson-1-presentation-bilingual-data-1366x768', 'Lesson 1 Bilingual Presentation Mode at 1366x768: grassland rainfall data slide', { fullPage: false })
  await exitPresentation(page)

  await setTraditionalChinese(page)
  await chooseSlide(page, 7)
  await enterPresentation(page)
  await screenshot(page, 'lesson-1-presentation-traditional-chinese-desert-1366x768', 'Lesson 1 Traditional Chinese Presentation Mode at 1366x768: desert representative slide', { fullPage: false })
  await page.keyboard.press('ArrowRight')
  await waitReady(page)
  await screenshot(page, 'lesson-1-presentation-traditional-chinese-desert-reveal-1366x768', 'Lesson 1 Traditional Chinese Presentation Mode at 1366x768: desert reveal state', { fullPage: false })
  await exitPresentation(page)

  await clickFirst(page, 'button', 'Return to lesson library')
  await page.getByRole('button', { name: 'Present lesson' }).nth(1).click()
  await waitReady(page)

  await setPresentationLanguage(page, 'English')
  await chooseSlide(page, 0)
  await enterPresentation(page)
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await waitReady(page)
  await screenshot(page, 'lesson-2-presentation-forest-content-1366x768', 'Lesson 2 Presentation Mode at 1366x768: forest content slide', { fullPage: false })
  await exitPresentation(page)

  await chooseSlide(page, 4)
  await enterPresentation(page)
  await page.keyboard.press('Space')
  await page.keyboard.press('Space')
  await waitReady(page)
  await screenshot(page, 'lesson-2-presentation-tundra-permafrost-1366x768', 'Lesson 2 Presentation Mode at 1366x768: tundra/permafrost content slide', { fullPage: false })
  await exitPresentation(page)

  await setTraditionalChinese(page)
  await chooseSlide(page, 6)
  await enterPresentation(page)
  await page.keyboard.press('ArrowRight')
  await waitReady(page)
  await screenshot(page, 'lesson-2-presentation-traditional-chinese-tundra-animals-1366x768', 'Lesson 2 Traditional Chinese Presentation Mode at 1366x768: tundra animals representative slide', { fullPage: false })

  await page.close()
}

async function makeContactSheet() {
  const maxThumbWidth = 360
  const gap = 24
  const columns = 3
  const thumbs = []

  for (const entry of manifest.screenshots) {
    const source = PNG.sync.read(await readFile(resolve(outDir, entry.filename)))
    const scale = Math.min(1, maxThumbWidth / source.width)
    const width = Math.max(1, Math.round(source.width * scale))
    const height = Math.max(1, Math.round(source.height * scale))
    const thumb = new PNG({ width, height })

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const srcX = Math.min(source.width - 1, Math.floor(x / scale))
        const srcY = Math.min(source.height - 1, Math.floor(y / scale))
        const sourceIndex = (srcY * source.width + srcX) * 4
        const targetIndex = (y * width + x) * 4
        thumb.data[targetIndex] = source.data[sourceIndex]
        thumb.data[targetIndex + 1] = source.data[sourceIndex + 1]
        thumb.data[targetIndex + 2] = source.data[sourceIndex + 2]
        thumb.data[targetIndex + 3] = 255
      }
    }

    thumbs.push(thumb)
  }

  const rows = Math.ceil(thumbs.length / columns)
  const cellWidth = maxThumbWidth
  const cellHeight = Math.max(...thumbs.map((thumb) => thumb.height))
  const sheet = new PNG({
    width: columns * cellWidth + (columns + 1) * gap,
    height: rows * cellHeight + (rows + 1) * gap,
    colorType: 6,
  })

  sheet.data.fill(255)

  thumbs.forEach((thumb, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    const offsetX = gap + column * (cellWidth + gap)
    const offsetY = gap + row * (cellHeight + gap)
    PNG.bitblt(thumb, sheet, 0, 0, thumb.width, thumb.height, offsetX, offsetY)
  })

  await writeFile(resolve(outDir, 'contact-sheet.png'), PNG.sync.write(sheet))
}

try {
  await captureStandardScreens()
  await capturePresentationScreens()
  await makeContactSheet()

  manifest.consoleErrors = consoleErrors
  await writeFile(resolve(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  await writeFile(
    resolve(outDir, 'README.md'),
    [
      '# Science Lessons Visual Review',
      '',
      'Generated by GitHub Actions from the `science-lessons-pilot` branch.',
      '',
      'This branch is review-only. Do not merge it into production.',
      '',
      'Artifacts contain public, unauthenticated Science Lessons screenshots only. Admin, login, credentials, environment values, and secrets are intentionally excluded.',
      '',
      '- `manifest.json`: capture metadata',
      '- `contact-sheet.png`: overview sheet',
      '- `screenshots/`: individual captures',
      '',
    ].join('\n'),
    'utf8',
  )

  if (consoleErrors.length > 0) {
    console.warn(`Captured with ${consoleErrors.length} console error(s). See manifest.json.`)
  }
} finally {
  await browser.close()
}
