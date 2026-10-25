// Shared helpers for the E1–E7 journeys on the app (adapted from prototype/e2e, which drove the v27 prototype).
// Taps only, from Home; the page is read from the frame's data-page and the drawn status bar clock.
// Run with the dev server up: node app/e2e/run.mjs [E1 E2 …]   (BASE=http://localhost:5191 by default)
import { createRequire } from 'module'
import fs from 'fs'

const require = createRequire(process.env.PW_FROM || 'D:/YUE/c_project/outrent/node_modules/')
export const { chromium } = require('playwright-core')
export const BASE = process.env.BASE || 'http://localhost:5191'
export const OUT = process.env.E2E_OUT || new URL('./out/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
fs.mkdirSync(OUT + 'shots', { recursive: true })

export const norm = (s) => (s == null ? '' : String(s)).replace(/\s+/g, ' ').trim()

export async function journey(J, persona, fn, opts = {}) {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, hasTouch: true, reducedMotion: opts.reduced ? 'reduce' : 'no-preference', ...(opts.desk ? { viewport: { width: 1100, height: 940 } } : {}) })
  const p = await ctx.newPage()
  const errs = []
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
  const R = []
  let nshot = 0, stepNo = 0
  const t = {
    p, J,
    S: () => 'S' + String(++stepNo).padStart(2, '0'),
    async rec(step, action, expected, actual, pass, o = {}) {
      let shot = null
      if (!pass) { nshot++; shot = `shots/${J}-${nshot}.png`; try { await p.screenshot({ path: OUT + shot }) } catch { /* page gone */ } }
      R.push({ journey: J, persona, step, action, expected: norm(expected), actual: norm(actual).slice(0, 300), pass, severity: pass ? 0 : (o.sev ?? 3), shot })
      console.log(pass ? 'PASS' : 'FAIL', J, step, '|', action, '|', norm(expected), '=>', norm(actual).slice(0, 160))
      return pass
    },
    async chk(step, action, expected, actual, o = {}) {
      const a = norm(actual), e = norm(expected), al = a.toLowerCase(), el = e.toLowerCase()
      const pass = o.not ? !al.includes(el) : o.exact ? al === el : al.includes(el)
      return t.rec(step, action, (o.not ? 'not: ' : '') + e, a, pass, o)
    },
    page: () => p.evaluate(() => document.querySelector('.frame')?.getAttribute('data-page') ?? ''),
    clock: () => p.evaluate(() => document.querySelector('.status .num')?.textContent ?? ''),
    text: (sel = '.frame-stage') => p.evaluate((s) => document.querySelector(s)?.innerText ?? '(missing ' + s + ')', sel),
    async waitPage(id, timeout = 15000) {
      try {
        await p.waitForFunction((id) => document.querySelector('.frame')?.getAttribute('data-page') === id && !document.querySelector('.skip'), id, { timeout })
        await p.waitForTimeout(opts.reduced ? 500 : 650)   // past the 450 ms double-tap guard
        return true
      } catch { return false }
    },
    async tap(target, o = {}) {
      const loc = typeof target === 'string' ? p.locator(target).first() : target
      await loc.scrollIntoViewIfNeeded({ timeout: 4000 }).catch(() => {})
      await loc.tap({ timeout: 5000, force: !!o.force })
      await p.waitForTimeout(o.wait ?? 350)
    },
    btn: (name, exact = false) => p.getByRole('button', { name, exact }).first(),
    async go(step, action, target, want, o = {}) {
      let err = ''
      try { await t.tap(target, o) } catch (e) { err = ' (tap failed: ' + e.message.split('\n')[0] + ')' }
      const ok = await t.waitPage(want, o.timeout || 15000)
      return t.rec(step, action, 'page ' + want, 'page ' + (await t.page()) + err, ok, o)
    },
    async start(path = '01-home') {
      await p.goto(BASE + '/' + path)
      await p.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
      await p.goto(BASE + '/' + path)
      await t.waitPage(path)
    },
    state: () => p.evaluate(() => JSON.parse(localStorage.getItem('outrent.state.v52') || '{}')),
    toast: () => p.evaluate(() => document.querySelector('.toast.on')?.textContent ?? ''),
  }
  try { await fn(t) } catch (e) { await t.rec('CRASH', 'journey threw', 'no exception', e.message.split('\n')[0], false, { sev: 4 }) }
  await t.rec('END', 'console and page errors', 'none', errs.join(' | ') || 'none', errs.length === 0)
  fs.writeFileSync(OUT + J + '.json', JSON.stringify(R, null, 1))
  await browser.close()
  const passed = R.filter((r) => r.pass).length
  console.log(`done ${J} ${passed}/${R.length}, ${R.length - passed} failures`)
  return { J, passed, total: R.length, R }
}
