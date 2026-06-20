import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'
import { PNG } from 'pngjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')
const outputRoot = path.join(root, 'audit-results/final-review')

const defaultRoutes = [
  '/',
  '/ied',
  '/eep',
  '/eep/showcase',
  '/eep/showcase/submit',
  '/submit',
  '/esl',
  '/esl/science',
  '/esl/language-arts',
  '/esl/performance-arts',
  '/esl/social-studies',
  '/about',
  '/login',
  '/this-page-does-not-exist',
]

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'small-mobile', width: 360, height: 800 },
]

const suspiciousPatterns = [
  /\btest(?:er|y)?\b/i,
  /\bsmell\b/i,
  /\blorem\b/i,
  /\bplaceholder\b/i,
  /\bsample\b/i,
  /\bdemo\b/i,
  /\bTODO\b/,
  /\bFIXME\b/,
  /\bfootball\b/i,
  /youtu\.?be/i,
]

const args = parseArgs(process.argv.slice(2))
const report = {
  generatedAt: new Date().toISOString(),
  mode: args.mode ?? 'preview',
  baseUrl: args.baseUrl,
  routes: [],
  blackLine: [],
  links: [],
  placeholders: [],
  axe: [],
  lighthouse: [],
  errors: [],
  summary: {},
}

let localServer

try {
  await rm(outputRoot, { recursive: true, force: true })
  await mkdir(outputRoot, { recursive: true })
  await mkdir(path.join(outputRoot, 'screenshots'), { recursive: true })
  await mkdir(path.join(outputRoot, 'black-line'), { recursive: true })
  await mkdir(path.join(outputRoot, 'axe'), { recursive: true })

  if (!args.baseUrl && args.mode === 'local') {
    localServer = await startStaticDistServer()
    args.baseUrl = localServer.baseUrl
  }

  if (!args.baseUrl && args.mode === 'vite') {
    localServer = await startViteServer()
    args.baseUrl = localServer.baseUrl
  }

  if (!args.baseUrl) {
    throw new Error('Pass --base-url or use --mode local.')
  }
  report.baseUrl = args.baseUrl

  if (args.onlyLighthouse) {
    await runLighthouseIfPossible()
    summarize()
    await writeOutputs()
    throw new Error('__AUDIT_COMPLETE__')
  }

  const browser = await chromium.launch()
  const discoveredRoutes = new Set(defaultRoutes)

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: 'no-preference',
    })
    const page = await context.newPage()
    await attachObservers(page, viewport.name)

    for (const route of defaultRoutes) {
      const routeResult = await auditRoute(page, route, viewport)
      report.routes.push(routeResult)
      for (const href of routeResult.internalLinks) {
        discoveredRoutes.add(href)
      }
    }

    await context.close()
  }

  const reducedContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  })
  const reducedPage = await reducedContext.newPage()
  await attachObservers(reducedPage, 'mobile-reduced-motion')
  report.routes.push(await auditRoute(reducedPage, '/', { name: 'mobile-reduced-motion', width: 390, height: 844 }))
  await reducedContext.close()

  for (const viewport of [viewports[0], viewports[3]]) {
    report.blackLine.push(await auditBlackLine(browser, '/', viewport, 'normal'))
    report.blackLine.push(await auditBlackLine(browser, '/', viewport, 'slow-network'))
    report.blackLine.push(await auditBlackLine(browser, '/eep', viewport, 'route-entry'))
  }

  await auditLinks(browser, [...discoveredRoutes])
  await auditPlaceholders()
  if (args.lighthouse) {
    await runLighthouseIfPossible()
  } else {
    report.lighthouse.push({ skipped: 'Pass --lighthouse to run Lighthouse reports.' })
  }
  await browser.close()

  summarize()
  await writeOutputs()

  if (report.summary.launchBlockers > 0 && !args.allowFindings) {
    process.exitCode = 1
  }
} catch (error) {
  if (error?.message === '__AUDIT_COMPLETE__') {
    process.exitCode = 0
  } else {
  report.errors.push(String(error?.stack ?? error))
  summarize()
  await writeOutputs().catch(() => undefined)
  throw error
  }
} finally {
  if (localServer) {
    await localServer.close()
  }
}

function parseArgs(argv) {
  const parsed = { mode: 'preview', allowFindings: false, lighthouse: false, fullAxe: false, onlyLighthouse: false }
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index]
    if (item === '--mode') parsed.mode = argv[++index]
    else if (item === '--base-url') parsed.baseUrl = argv[++index]?.replace(/\/$/, '')
    else if (item === '--allow-findings') parsed.allowFindings = true
    else if (item === '--lighthouse') parsed.lighthouse = true
    else if (item === '--only-lighthouse') parsed.onlyLighthouse = true
    else if (item === '--full-axe') parsed.fullAxe = true
  }
  return parsed
}

async function startStaticDistServer() {
  const dist = path.join(root, 'dist')
  const indexPath = path.join(dist, 'index.html')

  if (!existsSync(indexPath)) {
    throw new Error('dist/index.html was not found. Run npm run build before --mode local.')
  }

  const mimeTypes = new Map([
    ['.css', 'text/css; charset=utf-8'],
    ['.html', 'text/html; charset=utf-8'],
    ['.ico', 'image/x-icon'],
    ['.js', 'text/javascript; charset=utf-8'],
    ['.json', 'application/json; charset=utf-8'],
    ['.png', 'image/png'],
    ['.svg', 'image/svg+xml'],
    ['.webp', 'image/webp'],
  ])

  const server = createServer(async (request, response) => {
    const requestPath = new URL(request.url ?? '/', 'http://127.0.0.1').pathname
    const requested = path.resolve(dist, decodeURIComponent(requestPath).replace(/^\/+/, ''))
    const target = requested.startsWith(dist) && existsSync(requested) && !requestPath.endsWith('/') ? requested : indexPath
    const body = await readFile(target)
    response.writeHead(200, {
      'content-type': mimeTypes.get(path.extname(target)) ?? 'application/octet-stream',
      'cache-control': 'no-store',
    })
    response.end(body)
  })

  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((done) => server.close(done)),
      })
    })
  })
}

async function startViteServer() {
  const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5176'], {
    cwd: root,
    env: { ...process.env, BROWSER: 'none' },
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let output = ''
  child.stdout.on('data', (chunk) => {
    output += chunk.toString()
  })
  child.stderr.on('data', (chunk) => {
    output += chunk.toString()
  })

  const deadline = Date.now() + 30000
  let plainOutput = stripAnsi(output)
  while (!/http:\/\/127\.0\.0\.1:\d+\//.test(plainOutput)) {
    if (Date.now() > deadline) {
      child.kill()
      throw new Error(`Timed out waiting for local Vite server.\n${output}`)
    }
    await delay(250)
    plainOutput = stripAnsi(output)
  }

  const port = plainOutput.match(/127\.0\.0\.1:(\d+)/)?.[1]

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise((resolve) => {
        child.once('exit', resolve)
        child.kill()
      }),
  }
}

function stripAnsi(text) {
  return text.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '')
}

async function attachObservers(page, viewportName) {
  page.on('console', (message) => {
    if (message.type() === 'error') {
      report.errors.push({ viewport: viewportName, type: 'console', text: message.text() })
    }
  })
  page.on('pageerror', (error) => {
    report.errors.push({ viewport: viewportName, type: 'pageerror', text: error.message })
  })
  page.on('requestfailed', (request) => {
    const url = request.url()
    if (!url.startsWith('chrome-extension://')) {
      report.errors.push({ viewport: viewportName, type: 'requestfailed', url, failure: request.failure()?.errorText })
    }
  })
}

async function auditRoute(page, route, viewport) {
  const safeRoute = fileSafe(route)
  const initialPath = path.join(outputRoot, 'screenshots', `${viewport.name}-${safeRoute}-initial.png`)
  const fullPath = path.join(outputRoot, 'screenshots', `${viewport.name}-${safeRoute}-full.png`)
  const startedAt = Date.now()
  const response = await page.goto(`${args.baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.screenshot({ path: initialPath })
  await settle(page)
  await page.screenshot({ path: fullPath, fullPage: true })

  const shouldRunAxe = args.fullAxe || viewport.name === 'desktop' || viewport.name === 'mobile'
  if (shouldRunAxe) {
    const axe = await new AxeBuilder({ page }).exclude('iframe').analyze()
    const axePath = path.join(outputRoot, 'axe', `${viewport.name}-${safeRoute}.json`)
    await writeFile(axePath, JSON.stringify(axe, null, 2))
    report.axe.push({
      route,
      viewport: viewport.name,
      critical: axe.violations.filter((violation) => violation.impact === 'critical').length,
      serious: axe.violations.filter((violation) => violation.impact === 'serious').length,
      moderate: axe.violations.filter((violation) => violation.impact === 'moderate').length,
      total: axe.violations.length,
    })
  }

  const data = await page.evaluate(() => {
    const heading = document.querySelector('main h1, main h2')
    const footer = document.querySelector('footer')
    const bodyText = document.body.innerText.trim()
    const links = [...document.querySelectorAll('a[href]')].map((link) => ({
      href: link.getAttribute('href'),
      text: link.textContent?.trim() ?? '',
      target: link.getAttribute('target') ?? '',
    }))
    const images = [...document.images].map((image) => ({
      src: image.currentSrc || image.src,
      alt: image.getAttribute('alt') ?? '',
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      rect: image.getBoundingClientRect().toJSON(),
    }))
    const interactives = [...document.querySelectorAll('a, button, input, select, textarea')].map((element) => {
      const rect = element.getBoundingClientRect()
      return {
        tag: element.tagName,
        text: element.textContent?.trim() ?? element.getAttribute('aria-label') ?? '',
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0,
      }
    })

    return {
      finalPath: location.pathname,
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
      heading: heading?.textContent?.trim() ?? '',
      bodyChars: bodyText.length,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      footerReachable: Boolean(footer),
      links,
      images,
      smallTapTargets: interactives.filter((item) => item.visible && (item.width < 40 || item.height < 40)),
      suspiciousText: bodyText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => /(test(?:er|y)?|smell|lorem|placeholder|sample|demo|TODO|FIXME|football|youtu\.?be)/i.test(line))
        .slice(0, 20),
    }
  })

  const result = {
    route,
    viewport: viewport.name,
    status: response?.status() ?? null,
    redirected: data.finalPath !== route && route !== '/ied',
    finalPath: data.finalPath,
    title: data.title,
    description: data.description,
    heading: data.heading,
    bodyChars: data.bodyChars,
    durationMs: Date.now() - startedAt,
    horizontalOverflow: data.scrollWidth > data.clientWidth + 1,
    excessiveHeight: data.scrollHeight > data.clientHeight * 12,
    footerReachable: data.footerReachable,
    failedImages: data.images.filter((image) => image.naturalWidth === 0),
    stretchedImages: data.images.filter((image) => {
      const rendered = image.rect.width / Math.max(1, image.rect.height)
      const natural = image.naturalWidth / Math.max(1, image.naturalHeight)
      return image.naturalWidth > 0 && Math.abs(rendered - natural) > 1.2
    }),
    smallTapTargets: data.smallTapTargets.slice(0, 20),
    suspiciousText: data.suspiciousText,
    internalLinks: normalizeInternalLinks(data.links),
    links: data.links,
    screenshots: { initial: relative(initialPath), full: relative(fullPath) },
  }

  return result
}

async function auditBlackLine(browser, route, viewport, scenario) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    serviceWorkers: 'block',
  })

  if (scenario === 'slow-network') {
    await context.route('**/*', async (routeRequest) => {
      const request = routeRequest.request()
      if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet' || request.resourceType() === 'script') {
        await delay(120)
      }
      await routeRequest.continue()
    })
  }

  const page = await context.newPage()
  const frames = []
  await page.goto(`${args.baseUrl}${route}`, { waitUntil: 'commit', timeout: 45000 })

  for (const timestamp of [0, 50, 100, 250, 500, 1000]) {
    if (timestamp > 0) await page.waitForTimeout(timestamp - (frames.at(-1)?.timestamp ?? 0))
    const screenshotPath = path.join(outputRoot, 'black-line', `${viewport.name}-${fileSafe(route)}-${scenario}-${timestamp}ms.png`)
    const buffer = await page.screenshot({ path: screenshotPath })
    const darkRows = findDarkRows(buffer)
    const styles = await page.evaluate(() => {
      const selectors = ['html', 'body', '#root', '.app-shell', '.topbar', '.page-transition', 'main']
      return selectors.map((selector) => {
        const element = document.querySelector(selector)
        const style = element ? window.getComputedStyle(element) : null
        const rect = element?.getBoundingClientRect()
        return {
          selector,
          exists: Boolean(element),
          backgroundColor: style?.backgroundColor ?? '',
          borderTopColor: style?.borderTopColor ?? '',
          borderBottomColor: style?.borderBottomColor ?? '',
          color: style?.color ?? '',
          position: style?.position ?? '',
          rect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null,
        }
      })
    })
    frames.push({ timestamp, screenshot: relative(screenshotPath), darkRows, styles })
  }

  await context.close()
  return { route, viewport: viewport.name, scenario, frames, hasBlackStrip: frames.some((frame) => frame.darkRows.length > 0) }
}

function findDarkRows(buffer) {
  const png = PNG.sync.read(buffer)
  const rows = []
  for (let y = 0; y < Math.min(png.height, 180); y += 1) {
    let dark = 0
    for (let x = 0; x < png.width; x += 1) {
      const index = (png.width * y + x) << 2
      const r = png.data[index]
      const g = png.data[index + 1]
      const b = png.data[index + 2]
      const a = png.data[index + 3]
      if (a > 245 && r < 32 && g < 32 && b < 32) {
        dark += 1
      }
    }
    if (dark / png.width > 0.55) {
      rows.push({ y, darkRatio: Number((dark / png.width).toFixed(3)) })
    }
  }
  return compactRows(rows)
}

function compactRows(rows) {
  const ranges = []
  for (const row of rows) {
    const last = ranges.at(-1)
    if (last && row.y === last.end + 1) {
      last.end = row.y
      last.maxDarkRatio = Math.max(last.maxDarkRatio, row.darkRatio)
    } else {
      ranges.push({ start: row.y, end: row.y, maxDarkRatio: row.darkRatio })
    }
  }
  return ranges
}

async function auditLinks(browser, routes) {
  const context = await browser.newContext()
  const page = await context.newPage()
  const seen = new Set()

  for (const route of routes) {
    if (seen.has(route)) continue
    seen.add(route)
    const isStaticDocument = /\.[a-z0-9]{2,5}(?:$|\?)/i.test(route) && !/\.html?(?:$|\?)/i.test(route)
    const response = isStaticDocument
      ? await context.request.get(`${args.baseUrl}${route}`, { timeout: 15000 }).catch((error) => ({ error }))
      : await page.goto(`${args.baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch((error) => ({ error }))
    report.links.push({
      href: route,
      internal: true,
      status: typeof response?.status === 'function' ? response.status() : null,
      error: response?.error ? String(response.error) : '',
    })
  }

  await context.close()
}

async function auditPlaceholders() {
  const sourceFiles = await listFiles(root, ['src', 'public', 'functions', 'scripts', '.github'])
  for (const file of sourceFiles) {
    if (/\.(png|webp|jpg|jpeg|zip|pdf)$/i.test(file)) continue
    const content = await readFile(file, 'utf8').catch(() => '')
    for (const pattern of suspiciousPatterns) {
      const matches = content.match(new RegExp(pattern.source, `${pattern.flags.includes('i') ? 'i' : ''}g`))
      if (matches) {
        report.placeholders.push({ source: relative(file), pattern: String(pattern), count: matches.length })
      }
    }
  }
}

async function runLighthouseIfPossible() {
  const routes = ['/', '/eep', '/esl', '/eep/showcase', '/esl/science', '/login']
  try {
    const lighthouse = (await import('lighthouse')).default
    const chromeLauncher = await import('chrome-launcher')
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] })

    for (const route of routes) {
      const result = await lighthouse(`${args.baseUrl}${route}`, {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      })
      const jsonPath = path.join(outputRoot, `lighthouse-${fileSafe(route)}.json`)
      await writeFile(jsonPath, result.report)
      report.lighthouse.push({
        route,
        performance: score(result.lhr.categories.performance.score),
        accessibility: score(result.lhr.categories.accessibility.score),
        bestPractices: score(result.lhr.categories['best-practices'].score),
        seo: score(result.lhr.categories.seo.score),
        lcp: result.lhr.audits['largest-contentful-paint']?.displayValue ?? '',
        cls: result.lhr.audits['cumulative-layout-shift']?.displayValue ?? '',
        tbt: result.lhr.audits['total-blocking-time']?.displayValue ?? '',
        fcp: result.lhr.audits['first-contentful-paint']?.displayValue ?? '',
        report: relative(jsonPath),
      })
    }

    await chrome.kill()
  } catch (error) {
    report.lighthouse.push({ error: String(error?.message ?? error) })
  }
}

function score(value) {
  return Math.round((value ?? 0) * 100)
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForFunction(() => document.fonts?.ready ?? true, null, { timeout: 10000 }).catch(() => undefined)
  await page.waitForTimeout(1200)
}

function normalizeInternalLinks(links) {
  return [
    ...new Set(
      links
        .map((link) => link.href)
        .filter(Boolean)
        .filter((href) => href.startsWith('/') && !href.startsWith('//'))
        .map((href) => href.split('#')[0])
        .filter(Boolean),
    ),
  ]
}

async function listFiles(base, folders) {
  const files = []
  for (const folder of folders) {
    const absolute = path.join(base, folder)
    if (existsSync(absolute)) {
      await walk(absolute, files)
    }
  }
  return files
}

async function walk(current, files) {
  for (const entry of await readdir(current, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'lib') continue
    const absolute = path.join(current, entry.name)
    if (entry.isDirectory()) await walk(absolute, files)
    else files.push(absolute)
  }
}

function summarize() {
  const routeIssues = report.routes.filter(
    (route) =>
      (route.status && route.status >= 400) ||
      route.bodyChars < 20 ||
      !route.heading ||
      route.horizontalOverflow ||
      route.failedImages?.length ||
      route.excessiveHeight,
  )
  const seriousAxe = report.axe.reduce((total, item) => total + (item.critical ?? 0) + (item.serious ?? 0), 0)
  const blackStrips = report.blackLine.filter((item) => item.hasBlackStrip)
  const failedLinks = report.links.filter((link) => link.status && link.status >= 400)
  report.summary = {
    routeCount: report.routes.length,
    routeIssues: routeIssues.length,
    seriousAxe,
    blackStripFindings: blackStrips.length,
    failedLinks: failedLinks.length,
    placeholderFindings: report.placeholders.length,
    consoleOrRequestErrors: report.errors.length,
    launchBlockers: routeIssues.length + seriousAxe + blackStrips.length + failedLinks.length,
  }
}

async function writeOutputs() {
  await writeFile(path.join(outputRoot, 'summary.json'), JSON.stringify(report, null, 2))
  await writeFile(path.join(outputRoot, 'report.md'), markdownReport())
}

function markdownReport() {
  const lines = [
    '# IED Hub Automated Audit',
    '',
    `Generated: ${report.generatedAt}`,
    `Base URL: ${report.baseUrl}`,
    `Mode: ${report.mode}`,
    '',
    '## Summary',
    '',
    `- Routes checked: ${report.summary.routeCount ?? 0}`,
    `- Route/layout issues: ${report.summary.routeIssues ?? 0}`,
    `- Serious/Critical Axe violations: ${report.summary.seriousAxe ?? 0}`,
    `- Black-strip findings: ${report.summary.blackStripFindings ?? 0}`,
    `- Failed internal links: ${report.summary.failedLinks ?? 0}`,
    `- Placeholder/source findings: ${report.summary.placeholderFindings ?? 0}`,
    `- Console/request errors: ${report.summary.consoleOrRequestErrors ?? 0}`,
    '',
    '## Black-Line Timing',
    '',
    ...report.blackLine.map(
      (item) =>
        `- ${item.viewport} ${item.route} ${item.scenario}: ${item.hasBlackStrip ? 'dark strip detected' : 'clear'} (${item.frames
          .map((frame) => `${frame.timestamp}ms=${frame.darkRows.length}`)
          .join(', ')})`,
    ),
    '',
    '## Axe Summary',
    '',
    ...report.axe.map(
      (item) => `- ${item.viewport} ${item.route}: critical ${item.critical}, serious ${item.serious}, moderate ${item.moderate}`,
    ),
    '',
    '## Lighthouse Summary',
    '',
    ...report.lighthouse.map((item) =>
      item.skipped
        ? `- ${item.skipped}`
        : item.error
          ? `- Lighthouse unavailable: ${item.error}`
          : `- ${item.route}: Performance ${item.performance}, Accessibility ${item.accessibility}, Best Practices ${item.bestPractices}, SEO ${item.seo}; LCP ${item.lcp}; CLS ${item.cls}; TBT ${item.tbt}; FCP ${item.fcp}`,
    ),
    '',
    '## Placeholder Findings',
    '',
    ...report.placeholders.slice(0, 80).map((item) => `- ${item.source}: ${item.pattern} (${item.count})`),
  ]
  return `${lines.join('\n')}\n`
}

function fileSafe(route) {
  return route === '/' ? 'home' : route.replace(/^\/+/, '').replace(/[^a-z0-9]+/gi, '-').replace(/-$/, '')
}

function relative(file) {
  return path.relative(root, file).replaceAll(path.sep, '/')
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
