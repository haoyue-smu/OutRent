// node app/e2e/crawl.mjs [route-prefix ...] (existing playwright-core)
// A bounded, local-only control crawl. Every discovered enabled control is tried from a fresh state;
// newly opened same-page surfaces are followed one level deeper. Reports include every cap/skip.
import fs from 'node:fs'
import { BASE, OUT, launch } from './lib.mjs'
import { HANDOVER, REPORTED, seededUrl } from './reports.mjs'

const origin = new URL(BASE).origin
if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(BASE).hostname)) throw new Error('Crawl requires a local prototype URL')
const { pages } = JSON.parse(fs.readFileSync(new URL('../../pages.json', import.meta.url), 'utf8'))
const SHOTS = { ...HANDOVER, record: { shots: ['crank', 'saddle', 'drive'], marks: [], saved: false } }
const cases = [
  ...pages.map(({ id }) => ({ name: id, page: id, seed: {} })),
  { name: 'components', page: 'components', seed: {} },
  { name: 'components-reference', page: 'components', seed: {}, suffix: '#reference' },
  { name: 'reset', page: 'reset', seed: {} },
  { name: '09-booked', page: '09-trips', seed: { ...HANDOVER, arrived: false, now: 67 } },
  { name: '11-three-photos', page: '11-handover-check', seed: SHOTS },
  { name: '11-report-form', page: '11-handover-check', seed: SHOTS, suffix: '&report=form' },
  { name: '11-report-sent', page: '11-handover-check', seed: REPORTED, suffix: '&report=sent' },
  { name: '11-filed-no-report', page: '11-handover-check', seed: { ...REPORTED, report: HANDOVER.report } },
  { name: '11-filed-report', page: '11-handover-check', seed: REPORTED },
  { name: '09-report-replied', page: '09-trips', seed: REPORTED },
  { name: '12-returned-report', page: '12-rental-summary', seed: { ...REPORTED, closed: true, now: 86 + 5 / 60 } },
  { name: '13-weekly', page: '13-weekly-ride', seed: { ...REPORTED, closed: true, weekly: true, now: 86 + 7 / 60 } },
  { name: '15-hub', page: '15-equipment-detail', seed: { ...REPORTED, closed: true, now: 178, storage: { way: 'home', booked: true, hub: true, rentOn: false, ret: '' } } },
  { name: '17-pickup-booked', page: '17-hub-pickup', seed: { ...REPORTED, storage: { way: 'home', booked: true, hub: false, rentOn: false, ret: '', day: 28 } } },
]
const wanted = process.argv.slice(2)
const selected = cases.filter((c) => !wanted.length || wanted.some((prefix) => c.name.startsWith(prefix)))
console.log(`Starting local crawl: ${selected.length} routes/states at ${BASE}`)
const browser = await launch()
// Prefix reruns retain the other routes in this output directory. An explicit resume skips completed rows.
const report = fs.existsSync(OUT + 'crawl.json') ? JSON.parse(fs.readFileSync(OUT + 'crawl.json', 'utf8')) : []
const saveRow = (row) => {
  const i = report.findIndex((r) => r.route === row.route)
  if (i < 0) report.push(row); else report[i] = row
  fs.writeFileSync(OUT + 'crawl.json', JSON.stringify(report, null, 2))
}
const selector = 'a, button, [role="button"], input:not([type="hidden"]), textarea, select, [role="slider"]'
const MAX_CONTROLS = 240

async function controls(p) {
  return p.locator(selector).evaluateAll((elements) => {
    const visible = (e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden], [inert], [aria-hidden="true"]')
    return elements.flatMap((e, index) => visible(e) && !e.disabled && e.getAttribute('aria-disabled') !== 'true' ? [{
      index, label: (e.getAttribute('aria-label') || e.labels?.[0]?.textContent || e.innerText || e.getAttribute('title') || e.name || '(unlabelled)').replace(/\s+/g, ' ').trim().slice(0, 180),
      tag: e.tagName.toLowerCase(), href: e.getAttribute('href') || '',
      type: e.type || '', role: e.getAttribute('role'),
      idempotent: e.getAttribute('aria-pressed') === 'true' || e.getAttribute('aria-selected') === 'true' || e.getAttribute('aria-current') === 'page' || (e.type === 'radio' && e.checked) || e.matches('.shot.taken'),
    }] : [])
  })
}

async function activate(target, d) {
  if (d.type === 'checkbox') await target.setChecked(!(await target.isChecked()), { timeout: 3500 })
  else if (d.type === 'radio') await target.check({ timeout: 3500 })
  else if (d.tag === 'select') {
    const value = await target.evaluate((e) => [...e.options].find((o) => !o.disabled && o.value !== e.value)?.value)
    if (value != null) await target.selectOption(value)
  } else if (d.role === 'slider' || d.type === 'range') {
    const atMax = await target.evaluate((e) => Number(e.getAttribute('aria-valuenow') ?? e.value) >= Number(e.getAttribute('aria-valuemax') ?? e.max))
    await target.focus(); await target.press(atMax ? 'ArrowLeft' : 'ArrowRight')
  } else if (d.tag === 'textarea' || (d.tag === 'input' && !['button', 'submit', 'reset', 'file'].includes(d.type))) {
    await target.fill(d.type === 'number' ? '176' : 'Local prototype review')
  } else await target.click({ timeout: 3500 })
}

async function snapshot(p, index) {
  return p.evaluate(({ selector, index }) => {
    const e = document.querySelectorAll(selector)[index]
    const visible = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
    return {
      url: location.href,
      text: (document.querySelector('.frame-stage') || document.body).innerText.replace(/\s+/g, ' ').trim(),
      control: e ? [e.className, e.getAttribute('aria-pressed'), e.getAttribute('aria-selected'), e.getAttribute('aria-expanded'), e.disabled, e.checked].join('|') : 'removed',
      fields: [...document.querySelectorAll('input, textarea, select')].filter(visible).map((el) => [el.name, el.value, el.checked]),
      scroll: [...document.querySelectorAll('main.screen, .gallery-page')].map((el) => [el.scrollTop, el.scrollLeft]),
      surfaces: [...document.querySelectorAll('.vsheet, .sheetx, .fullterms, [role="dialog"], [role="tabpanel"], .rail')].map((el) => {
        const r = el.getBoundingClientRect()
        return [el.className, el.getAttribute('aria-hidden'), getComputedStyle(el).transform, Math.round(r.left), Math.round(r.top), el.scrollLeft]
      }),
    }
  }, { selector, index })
}

async function inspect(p) {
  // Load lazy images throughout the route before checking, then restore the starting scroll positions.
  await p.locator('img').evaluateAll((imgs) => imgs.forEach((img) => { img.loading = 'eager' }))
  await p.waitForTimeout(150)
  return p.evaluate(() => {
    const visible = (e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden'
    return {
      broken: [...document.images].filter((e) => visible(e) && e.complete && !e.naturalWidth).map((e) => e.currentSrc || e.src),
      overflow: [document.documentElement, ...document.querySelectorAll('.frame, .frame-stage, main.screen, .gallery-page')]
        .filter((e) => visible(e) && e.scrollWidth > e.clientWidth + 1).map((e) => `${e.className || e.tagName}: ${e.scrollWidth}/${e.clientWidth}`),
      placeholders: (document.body.innerText.match(/[^\n]*(?:not in this demo|not built yet|only .{0,70} opens)[^\n]*/gi) || []),
    }
  })
}

for (const c of selected) {
  if (process.env.CRAWL_RESUME === '1' && report.some((r) => r.route === c.name && r.completed)) {
    console.log(`${c.name}: retained completed result`); continue
  }
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, hasTouch: true, reducedMotion: 'reduce' })
  const p = await ctx.newPage()
  let currentErrors = [], currentBlocked = [], currentPopups = []
  const monitor = (page) => {
    page.on('console', (m) => { if (m.type() === 'error') currentErrors.push(m.text()) })
    page.on('pageerror', (e) => currentErrors.push('pageerror: ' + e.message))
    page.on('requestfailed', (r) => { if (!r.failure()?.errorText.includes('ERR_ABORTED')) currentErrors.push('request: ' + r.url() + ' ' + r.failure()?.errorText) })
    page.on('response', (r) => { if (r.status() >= 400) currentErrors.push('HTTP ' + r.status() + ': ' + r.url()) })
  }
  monitor(p)
  p.on('popup', (popup) => { currentPopups.push(popup); monitor(popup) })
  // Asset reads may load fonts; all writes and external navigations are blocked before they leave the browser.
  await ctx.route('**/*', async (route) => {
    const req = route.request(), u = new URL(req.url())
    if (!['GET', 'HEAD'].includes(req.method()) || (req.isNavigationRequest() && u.origin !== origin)) {
      currentBlocked.push(`${req.method()} ${req.url()}`); await route.abort(); return
    }
    await route.continue()
  })
  const url = seededUrl(c.page, c.seed, c.suffix || '')
  const row = { route: c.name, completed: false, found: 0, tried: 0, working: 0, controls: [], expectedNoChange: [], problems: [], placeholders: [], errors: [], limits: [] }
  const open = async () => {
    await p.goto(url, { waitUntil: 'domcontentloaded' })
    await p.waitForSelector(c.page === 'components' ? '.gallery-page' : '.frame')
    await p.waitForTimeout(550)
  }
  try {
    await open()
    const initial = await controls(p)
    console.log(`${c.name}: ${initial.length} initial controls`)
    const queue = initial.map((control) => ({ path: [], control }))
    const seen = new Set(initial.map((d) => `${d.tag}|${d.label}|${d.href}`))
    row.found = initial.length
    const baseline = await inspect(p)
    row.problems.push(...baseline.broken.map((x) => 'Broken image: ' + x), ...baseline.overflow.map((x) => 'Overflow: ' + x))
    row.placeholders.push(...baseline.placeholders)
    row.errors.push(...currentErrors)
    row.limits.push(...currentBlocked)
    await p.screenshot({ path: OUT + 'shots/crawl-' + c.name + '.png' })
    while (queue.length && row.tried < MAX_CONTROLS) {
      const item = queue.shift()
      currentErrors = []; currentBlocked = []; currentPopups = []
      await open()
      for (const ancestor of item.path) {
        await activate(p.locator(selector).nth(ancestor.index), ancestor)
        await p.waitForTimeout(650)
      }
      const d = item.control
      const target = p.locator(selector).nth(d.index)
      const entry = { label: d.label, depth: item.path.length, result: '', evidence: [] }
      if (d.href && !d.href.startsWith('#') && new URL(d.href, p.url()).origin !== origin) {
        entry.result = 'external navigation skipped'; row.limits.push(d.label + ': external destination'); row.controls.push(entry); continue
      }
      try {
        await target.scrollIntoViewIfNeeded({ timeout: 3500 })
        const before = await snapshot(p, d.index)
        await activate(target, d)
        await p.waitForTimeout(700)
        const after = await snapshot(p, d.index)
        entry.evidence = Object.keys(before).filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
        if (currentPopups.length) {
          entry.popups = []
          for (const popup of currentPopups) {
            await popup.waitForLoadState('domcontentloaded', { timeout: 10000 })
            const loaded = await popup.locator('body').innerText()
            entry.popups.push({ url: popup.url(), loaded: loaded.trim().length > 0 })
            if (!loaded.trim()) row.problems.push(`${d.label}: popup has no visible content`)
            await popup.close()
          }
          entry.evidence.push('popup')
        }
        entry.result = entry.evidence.length ? 'changed' : 'no visible effect'
        if (entry.evidence.length) row.working++
        else if (d.idempotent) { entry.result = 'already selected / photo already taken'; row.expectedNoChange.push(d.label) }
        else row.problems.push(`${d.label}: no visible effect`)
        const health = await inspect(p)
        row.problems.push(...health.broken.map((x) => `${d.label}: broken image ${x}`), ...health.overflow.map((x) => `${d.label}: overflow ${x}`))
        row.placeholders.push(...health.placeholders.map((x) => `${d.label}: ${x}`))
        // Explore controls revealed by a sheet/expanded panel without crawling a second route redundantly.
        if (item.path.length === 0 && new URL(after.url).pathname === new URL(before.url).pathname) {
          for (const child of await controls(p)) {
            const key = `${child.tag}|${child.label}|${child.href}`
            if (!seen.has(key)) { seen.add(key); queue.push({ path: [d], control: child }); row.found++ }
          }
        }
      } catch (e) {
        entry.result = 'failed'; row.problems.push(`${d.label}: ${e.message.split('\n')[0]}`)
      } finally {
        for (const popup of currentPopups) if (!popup.isClosed()) await popup.close().catch(() => {})
      }
      row.tried++
      row.errors.push(...currentErrors.map((e) => `${d.label}: ${e}`))
      row.limits.push(...currentBlocked.map((e) => 'Blocked external or write request: ' + e))
      row.controls.push(entry)
      if (row.tried % 5 === 0) {
        saveRow(row)
        console.log(`${c.name}: ${row.tried} tried, ${queue.length} queued; last ${d.label}: ${entry.result}`)
      }
    }
    if (queue.length) row.limits.push(`${queue.length} controls remain after the ${MAX_CONTROLS}-control cap`)
    row.completed = queue.length === 0
  } catch (e) {
    row.problems.push(e.message.split('\n')[0]); row.errors.push(...currentErrors); row.limits.push(...currentBlocked)
    await p.screenshot({ path: OUT + 'shots/crawl-' + c.name + '-error.png' }).catch(() => {})
  }
  row.problems = [...new Set(row.problems)]; row.errors = [...new Set(row.errors)]; row.placeholders = [...new Set(row.placeholders)]
  saveRow(row)
  console.log(`${row.route}: ${row.working}/${row.tried} respond, ${row.found} found; ${row.expectedNoChange.length} already-selected/photo controls, ${row.problems.length} problems, ${row.errors.length} errors, ${row.placeholders.length} placeholders, ${row.limits.length} limits`)
  await ctx.close()
}
await browser.close()
const escape = (s) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ')
const lines = ['# Local control crawl', '', '393 × 852; reduced motion; local prototype only. Native fields are exercised as well as buttons. Same-page revealed controls explored one level deep. Already-selected controls and previously taken photos are recorded separately, not called regressions. Every cap or blocked action is listed in crawl.json.', '', '| Route / state | Found | Tried | Responded | Already selected / taken | Problems |', '|---|---:|---:|---:|---:|---|',
  ...report.map((r) => `| ${r.route} | ${r.found} | ${r.tried} | ${r.working} | ${r.expectedNoChange.length} | ${escape([...r.problems, ...r.errors, ...r.placeholders, ...r.limits].join('; ')) || 'None'} |`)]
fs.writeFileSync(OUT + 'crawl.md', lines.join('\n') + '\n')
if (report.some((r) => r.problems.length || r.errors.length || r.placeholders.length || r.limits.length)) process.exitCode = 1
