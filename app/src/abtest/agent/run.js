// One simulated participant per persona, walking the live test site from screenshots only. Spec: ops inbox/AGENT-PILOT.md.
//   MODEL=<id> RUN=<name> node src/abtest/agent/run.js [personas/pilot.json]
// Config: MODEL, RUN, COORDS (grid: the model answers on 0 to 1000, the runner scales; pixels: spec §2 as written), OPENROUTER_API_KEY (.env.local), VARIANT, VIEWPORT_H, TEMPERATURE (0.8), ONLY=p01,p02, CONCURRENCY (5), MAX_COST (2), BASE.
// Every row opens with pilot=1, so none can enter a dataset. Traces: trace/<run>/<persona>.jsonl, screenshots beside them (git ignores those).
import fs from 'fs'
import { createRequire } from 'module'
import { chat, rng } from './openrouter.js'
import { assertClean, parseReply, stepMessage, systemPrompt } from './prompt.js'
import { hitAt, lookAround, misTapP, nearestOther, readingPause, recheck, swipe, takenPhotos } from './noise.js'

const require = createRequire(process.env.PW_FROM || 'D:/YUE/c_project/outrent/node_modules/')
const { chromium } = require('playwright-core')

const here = (p) => new URL(p, import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const MODEL = process.env.MODEL
const RUN = process.env.RUN
if (!MODEL || !RUN) throw new Error('Set MODEL and RUN')
const TEMPERATURE = +(process.env.TEMPERATURE ?? 0.8)
const COORDS = process.env.COORDS ?? 'grid'
const BASE = process.env.BASE ?? 'https://outrent-abtest.vercel.app'
const CAP = 45
const MAX_COST = +(process.env.MAX_COST ?? 2)
const file = process.argv[2] ?? here('./personas/pilot.json')
const { personas } = JSON.parse(fs.readFileSync(file, 'utf8'))
const only = process.env.ONLY?.split(',')
const queue = personas.filter((p) => !only || only.includes(p.persona_id))
const dir = here(`./trace/${RUN}/`)
fs.mkdirSync(dir, { recursive: true })
let spent = 0

// The screen as the runner knows it; never shown to the model.
const screenOf = (page) => page.evaluate(() => {
  const d = [...document.querySelectorAll('[role="dialog"]')].pop()
  if (d) return `${d.classList.contains('ab-camera') ? 'camera' : 'viewer'}: ${d.getAttribute('aria-label')}`
  return document.querySelector('main')?.getAttribute('aria-label') ?? '?'
})
const isDrivePreview = (page) => page.evaluate(() => /drivetrain/i.test(document.querySelector('.ab-camera img')?.alt ?? ''))
const OPTIONAL = { '#ab-details': 'details', '#ab-find-where': 'find_where', '#ab-why': 'preference_why' }

// Same rules as schema.sql, as in e2e/abtest.mjs: the row the server should now hold.
function rowFrom(calls) {
  const start = calls.find((c) => c.fn === 'ab_start')
  if (!start?.row?.[0]) return null
  const b = start.body, first = start.row[0]
  const row = { id: first.id, variant: first.variant, forced: !!b.p_forced, pilot: b.p_pilot, t0: b.p_t0, viewport_h: b.p_viewport_h, viewport_w: b.p_viewport_w, dpr: b.p_dpr, device: b.p_device, order: 'neither', events: [], scroll_depth: [], photo_taken: [], hidden: [], scroll_up_after_photos: false }
  const once = new Set(['page_open', 'link_visible_on_load', 'link_in_view_at_damage', 't_damage_visible', 'first_tap_after_photos', 't_report_tap', 'report_opened', 'report_sent', 'record_saved', 't_end', 't_questions_done', 'preference_left', 't_finish', 't_q1_done', 't_q2_done', 't_q3_done', 't_q4_done', 't_q5_done'])
  for (const c of calls.filter((x) => x.fn === 'ab_log' && (x.status === null || x.status < 300))) {
    for (const [k, v] of Object.entries(c.body.p_patch.set ?? {})) if (!once.has(k) || row[k] == null) row[k] = v
    for (const k of ['events', 'scroll_depth', 'photo_taken', 'hidden']) row[k].push(...(c.body.p_patch[k] ?? []))
  }
  return row
}

async function runAgent(browser, p) {
  const variant = process.env.VARIANT ?? p.variant
  const h = +(process.env.VIEWPORT_H ?? p.viewport_h), w = h === 667 ? 375 : 390
  const R = rng(p.seed)
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })
  const calls = [], sent = new Map(), errs = []
  ctx.on('request', (r) => {
    const m = r.url().match(/\/rpc\/(ab_\w+)/)
    if (!m || r.method() !== 'POST') return
    const call = { fn: m[1], status: null, body: JSON.parse(r.postData() ?? '{}') }
    sent.set(r, call); calls.push(call)
  })
  ctx.on('response', async (r) => {
    const call = sent.get(r.request())
    if (!call) return
    call.status = r.status()
    if (call.fn === 'ab_start') call.row = await r.json().catch(() => null)
  })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errs.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  const cdp = await ctx.newCDPSession(page)
  const shots = `${dir}${p.persona_id}/`
  fs.mkdirSync(shots, { recursive: true })
  const log = fs.createWriteStream(`${dir}${p.persona_id}.jsonl`)
  const trace = (o) => log.write(JSON.stringify(o) + '\n')

  const system = systemPrompt(p, COORDS)
  const history = [], seen = new Set(), skips = {}
  let cost = 0, tokensIn = 0, tokensOut = 0, bad = 0, status = 'capped', step = 0, photos = [], note = '', injected = 0

  await page.goto(`${BASE}/?v=${variant}&new=1&pilot=1`, { waitUntil: 'networkidle' })
  await readingPause(page, p)

  while (step < CAP) {
    if (spent > MAX_COST) { status = 'budget'; break }
    step++
    const screen = await screenOf(page)
    if (!seen.has(screen)) {
      seen.add(screen)
      if (p.reading.startsWith('reads') && !screen.startsWith('camera') && await lookAround(page, cdp)) { injected++; trace({ step, screen, injected: true, kind: 'look-around' }) }
    }
    for (const [sel, name] of Object.entries(OPTIONAL)) {
      if (skips[name] === undefined && await page.locator(sel).count()) skips[name] = R() < p.skip_rate
    }
    const skip = Object.entries(OPTIONAL).some(([sel, name]) => skips[name] && document_has(sel, screen))
    const shot = `${shots}${String(step).padStart(2, '0')}.png`
    const png = await page.screenshot({ path: shot, scale: 'css' })
    const drive = await isDrivePreview(page)
    const msg = stepMessage({ w, h, coords: COORDS, history: history.slice(-6), skip, note })
    assertClean(msg.own, 'step message')
    note = ''
    const r = await chat({ model: MODEL, temperature: TEMPERATURE, seed: p.seed + step, messages: [
      { role: 'system', content: system },
      { role: 'user', content: [{ type: 'text', text: msg.text }, { type: 'image_url', image_url: { url: `data:image/png;base64,${png.toString('base64')}` } }] },
    ] })
    cost += r.usage.cost; spent += r.usage.cost; tokensIn += r.usage.in; tokensOut += r.usage.out
    const reply = parseReply(r.text)
    const entry = { step, screen, shot: `${p.persona_id}/${String(step).padStart(2, '0')}.png`, drive_preview: drive || undefined, latency_ms: r.latency, usage: r.usage, provider: r.provider, skip_note: skip || undefined }
    if (!reply) {
      trace({ ...entry, unparseable: r.text.slice(0, 800) })
      if (++bad >= 3) { status = 'unparseable'; break }
      note = 'Reply with one JSON object only.'
      continue
    }
    bad = 0
    const { thought, action } = reply
    const rec = { thought, action }
    const out = { ...entry, thought, action, injected: false }

    if (action.type === 'done') {
      trace(out)
      status = /Thank you/.test(screen) ? 'finished' : 'quit'
      break
    }
    if (action.type === 'tap') {
      const x = Math.round(COORDS === 'grid' ? +action.x * w / 1000 : +action.x), y = Math.round(COORDS === 'grid' ? +action.y * h / 1000 : +action.y)
      out.tap_px = { x, y }
      out.hit = await hitAt(page, x, y)
      const before = await takenPhotos(page)
      let at = { x, y }
      if (R() < misTapP(p)) {
        const other = await nearestOther(page, x, y)
        if (other) { injected++; at = other; trace({ step, screen, injected: true, kind: 'mis-tap', meant: { x, y }, tapped: other, hit: await hitAt(page, other.x, other.y) }); out.mis_tapped = true }
      }
      await page.touchscreen.tap(at.x, at.y)
      trace(out)
      await readingPause(page, p)
      const after = await takenPhotos(page)
      const fresh = after.filter((l) => !before.includes(l))
      if (fresh.length && p.deposit.startsWith('worried') && R() < 0.2) {
        const tapped = await recheck(page, fresh[0])
        if (tapped) { injected++; trace({ step, screen: await screenOf(page), injected: true, kind: 're-check', tapped, photo: fresh[0] }); await readingPause(page, p) }
      }
    } else if (action.type === 'scroll') {
      const by = (action.amount === 'large' ? 0.8 : 0.3) * h * (action.direction === 'up' ? -1 : 1)
      await swipe(page, cdp, by)
      trace(out)
      await readingPause(page, p)
    } else if (action.type === 'type') {
      const ok = await page.evaluate(() => /^(TEXTAREA|INPUT)$/.test(document.activeElement?.tagName ?? ''))
      if (ok) await page.keyboard.type(action.text, { delay: 30 })
      else rec.result = 'no text box had the cursor, nothing was typed'
      out.typed = ok
      trace(out)
      await readingPause(page, p)
    }
    history.push(rec)
  }

  await page.waitForTimeout(2000)
  const row = rowFrom(calls)
  const bad_writes = calls.filter((c) => c.status !== null && c.status >= 300).map((c) => [c.fn, c.status])
  const mismatch = row ? ['cycling', 'rented_before', 'age_band'].filter((k) => row[k] !== p[k]).map((k) => ({ field: k, persona: p[k], answered: row[k] ?? null })) : []
  const summary = { persona_id: p.persona_id, model: MODEL, temperature: TEMPERATURE, coords: COORDS, run_id: RUN, variant, viewport: [w, h], status, aborted: status !== 'finished', steps: step, injected, cost, tokens_in: tokensIn, tokens_out: tokensOut, skips, mismatch, bad_writes, console_errors: errs }
  fs.writeFileSync(`${dir}${p.persona_id}.summary.json`, JSON.stringify(summary, null, 2) + '\n')
  fs.writeFileSync(`${dir}${p.persona_id}.row.json`, JSON.stringify(row, null, 2) + '\n')
  await new Promise((r) => log.end(r))
  await ctx.close()
  console.log(`${p.persona_id} ${variant} ${h}: ${status}, ${step} steps, ${injected} injected, id ${row?.id ?? '-'}, $${cost.toFixed(4)}, finish ${row?.t_finish != null}, sent ${row?.report_sent != null}, noticed ${row?.noticed ?? '-'}`)
  return summary

  // Which optional box a screen holds, from the screen's own name.
  function document_has(sel, s) {
    return (sel === '#ab-details' && s === 'Report a problem') || (sel === '#ab-find-where' && s === 'Question 3 of 5') || (sel === '#ab-why' && s === 'Question 4 of 5')
  }
}

const browser = await chromium.launch()
const conc = +(process.env.CONCURRENCY ?? 5)
const todo = [...queue], all = []
await Promise.all(Array.from({ length: conc }, async () => {
  while (todo.length) {
    const p = todo.shift()
    try { all.push(await runAgent(browser, p)) }
    catch (e) { console.log(`${p.persona_id} FAILED: ${e.message}`); all.push({ persona_id: p.persona_id, status: 'crashed', aborted: true, error: e.message }) }
  }
}))
await browser.close()
fs.writeFileSync(`${dir}run.json`, JSON.stringify({ run_id: RUN, model: MODEL, temperature: TEMPERATURE, coords: COORDS, base: BASE, cost: spent, agents: all.sort((a, b) => a.persona_id.localeCompare(b.persona_id)) }, null, 2) + '\n')
console.log(`${RUN}: $${spent.toFixed(4)}`)
