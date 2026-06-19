import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dist = path.join(root, 'dist')
const indexPath = path.join(dist, 'index.html')

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

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

if (!existsSync(indexPath)) {
  throw new Error('dist/index.html was not found. Run npm run build before npm run test:route-scroll.')
}

function safeStaticPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0])
  const withoutLeadingSlash = decoded.replace(/^\/+/, '')
  const target = path.resolve(dist, withoutLeadingSlash)

  return target.startsWith(dist) ? target : indexPath
}

function startServer() {
  const server = createServer(async (request, response) => {
    const requestPath = new URL(request.url ?? '/', 'http://127.0.0.1').pathname
    const target = safeStaticPath(requestPath)
    const filePath = existsSync(target) && !target.endsWith(path.sep) ? target : indexPath
    const ext = path.extname(filePath)

    try {
      const body = await readFile(filePath)
      response.writeHead(200, {
        'content-type': mimeTypes.get(ext) ?? 'application/octet-stream',
        'cache-control': 'no-store',
      })
      response.end(body)
    } catch {
      const body = await readFile(indexPath)
      response.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      })
      response.end(body)
    }
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

async function scrollDown(page) {
  const target = await page.evaluate(() => {
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const requestedScroll = Math.max(900, document.documentElement.scrollHeight * 0.65)
    const nextScroll = Math.min(maxScroll, requestedScroll)

    window.scrollTo({ top: nextScroll, left: 0, behavior: 'auto' })
    return nextScroll
  })

  if (target > 0) {
    await page.waitForTimeout(150)
  }
}

async function clickVisibleInternalLink(page, href) {
  const link = page.locator(`a[href="${href}"]:visible`).first()

  if (await link.count()) {
    await link.click()
    return
  }

  const menuButton = page.locator('.mobile-menu-button')
  if (await menuButton.isVisible()) {
    await menuButton.click()
  }

  await page.locator(`a[href="${href}"]:visible`).first().click()
}

async function expectRouteAtTop(page, expectedPath, label, expectedText) {
  await page.waitForURL((url) => url.pathname === expectedPath)
  if (expectedText) {
    await page.waitForFunction((text) => document.querySelector('main')?.textContent?.includes(text), expectedText)
  }
  await page.waitForFunction(() => document.querySelector('main h1, main h2'))
  await page.waitForTimeout(750)
  await page.waitForFunction(() => window.scrollY <= 4)
  await page.waitForFunction(() => document.activeElement?.tagName === 'MAIN' || document.activeElement?.id === 'main-content')

  const result = await page.evaluate(() => {
    const heading = document.querySelector('main h1, main h2')
    const main = document.querySelector('main')
    const topbarBottom = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
    const rect = heading?.getBoundingClientRect()
    const mainStyle = main ? window.getComputedStyle(main) : null

    return {
      scrollY: window.scrollY,
      headingText: heading?.textContent?.trim() ?? '',
      headingVisible:
        Boolean(rect) &&
        rect.bottom > topbarBottom &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth,
      topbarBottom,
      headingTop: rect?.top ?? null,
      mainFocused: document.activeElement === main,
      mainOutline: mainStyle?.outlineStyle ?? '',
      mainOutlineWidth: mainStyle?.outlineWidth ?? '',
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    }
  })

  if (result.scrollY > 4) {
    throw new Error(`${label}: expected ${expectedPath} to open at top, got scrollY ${result.scrollY}.`)
  }

  if (!result.headingVisible) {
    throw new Error(
      `${label}: expected first heading to be visible below sticky nav. Heading "${result.headingText}" top=${result.headingTop}, topbar=${result.topbarBottom}.`,
    )
  }

  if (!result.mainFocused) {
    throw new Error(`${label}: expected the route main element to be focused after navigation.`)
  }

  if (result.mainOutline !== 'none' && result.mainOutlineWidth !== '0px') {
    throw new Error(`${label}: expected the focused route main to have no visible outline, got ${result.mainOutline} / ${result.mainOutlineWidth}.`)
  }

  if (result.hasHorizontalOverflow) {
    throw new Error(`${label}: expected no horizontal overflow on the route.`)
  }
}

async function expectKeyboardFocusVisible(page, baseUrl, label) {
  await page.goto(`${baseUrl}/`)
  await page.waitForFunction(() => document.querySelector('main h1, main h2'))
  await page.waitForTimeout(500)
  await page.keyboard.press('Tab')
  await page.waitForTimeout(100)

  const result = await page.evaluate(() => {
    const active = document.activeElement
    const style = active ? window.getComputedStyle(active) : null

    return {
      activeTag: active?.tagName ?? '',
      activeText: active?.textContent?.trim() ?? '',
      outlineStyle: style?.outlineStyle ?? '',
      outlineWidth: style?.outlineWidth ?? '',
      outlineOffset: style?.outlineOffset ?? '',
    }
  })

  if (result.outlineStyle === 'none' || result.outlineWidth === '0px') {
    throw new Error(`${label}: expected keyboard focus to remain visible on the first interactive control.`)
  }
}

async function runNormalRouteCase(page, baseUrl, fromPath, href, expectedPath, expectedText, label) {
  await page.goto(`${baseUrl}${fromPath}`)
  await page.waitForFunction(() => document.querySelector('main h1, main h2'))
  await page.waitForTimeout(800)
  await scrollDown(page)
  await clickVisibleInternalLink(page, href)
  await expectRouteAtTop(page, expectedPath, label, expectedText)
}

async function runHashCase(page, baseUrl, label) {
  await page.goto(`${baseUrl}/eep/showcase/submit#submission-permission`)
  await page.waitForFunction(() => document.querySelector('#submission-permission'))
  await page.waitForTimeout(750)

  const result = await page.evaluate(() => {
    const target = document.querySelector('#submission-permission')
    const topbarBottom = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
    const rect = target?.getBoundingClientRect()

    return {
      scrollY: window.scrollY,
      hash: window.location.hash,
      maxScroll: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
      targetVisible: Boolean(rect) && rect.bottom > topbarBottom && rect.top < window.innerHeight,
      targetTop: rect?.top ?? null,
      topbarBottom,
    }
  })

  if (result.scrollY < 50) {
    throw new Error(`${label}: expected hash target to scroll below page top, got scrollY ${result.scrollY}, hash ${result.hash}, maxScroll ${result.maxScroll}, targetTop ${result.targetTop}.`)
  }

  if (!result.targetVisible) {
    throw new Error(`${label}: expected #submission-permission to be visible. targetTop=${result.targetTop}, topbar=${result.topbarBottom}.`)
  }
}

async function loginForAdminIfConfigured(page, baseUrl) {
  const username = process.env.ROUTE_SCROLL_ADMIN_USERNAME
  const password = process.env.ROUTE_SCROLL_ADMIN_PASSWORD

  if (!username || !password) {
    return false
  }

  await page.goto(`${baseUrl}/login`)
  await page.locator('input[autocomplete="username"]').fill(username)
  await page.locator('input[autocomplete="current-password"]').fill(password)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((url) => url.pathname === '/admin', { timeout: 15000 })
  return true
}

async function runAdminCases(page, baseUrl, label) {
  const loggedIn = await loginForAdminIfConfigured(page, baseUrl)

  if (!loggedIn) {
    console.log(`${label}: skipped protected admin link cases; set ROUTE_SCROLL_ADMIN_USERNAME and ROUTE_SCROLL_ADMIN_PASSWORD to run them.`)
    return
  }

  await scrollDown(page)
  await clickVisibleInternalLink(page, '/admin/hubs')
  await expectRouteAtTop(page, '/admin/hubs', `${label} admin dashboard -> hub editor list`, 'Manage Learning Hubs')

  await scrollDown(page)
  const firstHubLink = page.locator('main a[href^="/admin/hubs/"]:visible').first()
  await firstHubLink.click()
  await page.waitForURL((url) => url.pathname.startsWith('/admin/hubs/'))
  await expectRouteAtTop(page, new URL(page.url()).pathname, `${label} hub editor opens at top`, 'Teacher Content Studio')

  await scrollDown(page)
  await page.locator('main a:has-text("View public hub"):visible').click()
  await expectRouteAtTop(page, new URL(page.url()).pathname, `${label} hub editor -> public hub page`, 'Learning Hub')
}

async function runViewport(serverInfo, viewport) {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } })
  const page = await context.newPage()
  const consoleErrors = []

  page.on('console', (message) => {
    if (message.type() === 'error') {
      const text = message.text()

      if (
        text.includes('Could not reach Cloud Firestore backend') ||
        text.includes('FirebaseError: [code=unavailable]') ||
        text.includes('The operation could not be completed')
      ) {
        return
      }

      consoleErrors.push(text)
    }
  })
  page.on('pageerror', (error) => consoleErrors.push(error.message))

  try {
    await expectKeyboardFocusVisible(page, serverInfo.baseUrl, `${viewport.name} keyboard focus`)
    await runNormalRouteCase(page, serverInfo.baseUrl, '/', '/eep', '/eep', 'EEP Learning Hub', `${viewport.name} home -> EEP`)
    await runNormalRouteCase(page, serverInfo.baseUrl, '/', '/esl', '/esl', 'ESL Learning Hub', `${viewport.name} home -> ESL`)
    await runNormalRouteCase(page, serverInfo.baseUrl, '/esl', '/esl/science', '/esl/science', 'Science Hub', `${viewport.name} ESL -> Science`)
    await runNormalRouteCase(page, serverInfo.baseUrl, '/esl/science', '/about', '/about', 'International Education at THUHS', `${viewport.name} Science -> About`)
    await runNormalRouteCase(page, serverInfo.baseUrl, '/about', '/login', '/login', 'Login', `${viewport.name} public -> Login`)
    await runHashCase(page, serverInfo.baseUrl, `${viewport.name} valid hash`)
    await runAdminCases(page, serverInfo.baseUrl, viewport.name)

    if (consoleErrors.length > 0) {
      throw new Error(`${viewport.name}: browser console errors:\n${consoleErrors.join('\n')}`)
    }
  } finally {
    await context.close()
    await browser.close()
  }
}

const serverInfo = await startServer()

try {
  for (const viewport of viewports) {
    await runViewport(serverInfo, viewport)
    console.log(`${viewport.name}: route scroll checks passed at ${viewport.width}x${viewport.height}.`)
  }
} finally {
  await serverInfo.close()
}
