// The A/B test site, acceptance runs. The built site must be up (vite preview --config vite.abtest.config.ts --port 5193).
//   node app/e2e/abtest.mjs layouts            pictures for screen 7 (whole page after the photos, link outlined), saved as work/haoyue/_abtest/assets/layout-{a,b}.webp
//   node app/e2e/abtest.mjs flows              whole flow: WebKit iPhone 13 and Chromium Pixel 7, A and B, report and save only
//   node app/e2e/abtest.mjs diff               acceptance 1: the four screenshots, the DOM and the pixel diff
//   node app/e2e/abtest.mjs assign             acceptance 5: ten Starts in a row, a reload, a forced row
//   node app/e2e/abtest.mjs drop               the keepalive write on pagehide
//   node app/e2e/abtest.mjs slow               the damaged photo on a slow connection
//   node app/e2e/abtest.mjs grep               the built bundle holds no old copy
//   node app/e2e/abtest.mjs screens            every screen around the task at 390 x 844 and 375 x 667: what must fit does, screenshots
// Every run opens rows with pilot=1. Output goes to app/e2e/out/abtest/ (git ignores it).
import { createRequire } from 'module'
import fs from 'fs'
const require = createRequire(process.env.PW_FROM || 'D:/YUE/c_project/outrent/node_modules/')
const { chromium, webkit, devices } = require('playwright-core')

const BASE = process.env.BASE || 'http://localhost:5193'
const OUT = new URL('./out/abtest/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
fs.mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const VIEW = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }
const fails = []
const check = (name, ok, got = '') => { console.log(ok ? 'PASS' : 'FAIL', name, got === '' ? '' : `=> ${got}`); if (!ok) fails.push(name) }

// Every call to the server and its answer. The public key cannot read the table, by design, so this is what a run can see.
function watch(ctx) {
  const calls = []
  // Recorded as it is sent: the browser stops reporting answers for a page that has gone, however the server replied.
  const sent = new Map()
  ctx.on('request', (r) => {
    const m = r.url().match(/\/rpc\/(ab_\w+)/)
    if (!m || r.method() !== 'POST') return
    const call = { fn: m[1], status: null, body: JSON.parse(r.postData() ?? '{}') }
    sent.set(r, call)
    calls.push(call)
  })
  ctx.on('response', async (r) => {
    const call = sent.get(r.request())
    if (!call) return
    call.status = r.status()
    if (call.fn === 'ab_start') call.row = await r.json().catch(() => null)
  })
  ctx.on('requestfailed', (r) => { const call = sent.get(r); if (call) { call.status = 0; call.why = r.failure()?.errorText } })
  return calls
}
// The row as the server should hold it, rebuilt from the accepted writes with schema.sql's rules. For the replay until the export.
function rowFromCalls(calls) {
  const start = calls.find((c) => c.fn === 'ab_start'), b = start.body, first = start.row[0]
  const row = { id: first.id, variant: first.variant, forced: !!b.p_forced, pilot: b.p_pilot, t0: b.p_t0, viewport_h: b.p_viewport_h, viewport_w: b.p_viewport_w, dpr: b.p_dpr, device: b.p_device, order: 'neither', events: [], scroll_depth: [], photo_taken: [], hidden: [], scroll_up_after_photos: false }
  const once = new Set(['page_open', 'link_visible_on_load', 'link_in_view_at_damage', 't_damage_visible', 'first_tap_after_photos', 't_report_tap', 'report_opened', 'report_sent', 'record_saved', 't_end', 't_questions_done', 'preference_left', 't_finish', 't_q1_done', 't_q2_done', 't_q3_done', 't_q4_done', 't_q5_done'])
  for (const c of calls.filter((x) => x.fn === 'ab_log' && (x.status === null || x.status < 300))) {
    for (const [k, v] of Object.entries(c.body.p_patch.set ?? {})) if (!once.has(k) || row[k] == null) row[k] = v
    for (const k of ['events', 'scroll_depth', 'photo_taken', 'hidden']) row[k].push(...(c.body.p_patch[k] ?? []))
  }
  return row
}
const refused = (calls) => calls.filter((c) => c.status !== null && (c.status === 0 || c.status >= 300))

async function open(browserType, device, query) {
  const browser = await browserType.launch()
  const ctx = await browser.newContext(device)
  const calls = watch(ctx)
  const p = await ctx.newPage()
  const errs = []
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
  await p.goto(`${BASE}/?pilot=1&new=1${query ? '&' + query : ''}`)
  await p.waitForSelector('text=Thanks for helping us out!')
  return { browser, ctx, p, errs, calls }
}
const start = async (p) => {
  await p.tap('button:has-text("Continue")')
  await p.waitForSelector('text=You’re Daniel')
  await p.tap('button:has-text("Start")')
  await p.waitForSelector('text=Check it before you ride')
}
const settled = (p) => p.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0))
const scrollTo = (p, sel) => p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel)
async function takePhoto(p, name) {
  const sel = `section.part[aria-label="${name}"] .shot`
  await scrollTo(p, sel)
  await p.tap(sel)
  await p.waitForSelector('.ab-camera')
  if (name === 'Drivetrain') {
    check('the preview shows the chain on the ground', /mine-drive/.test(await p.getAttribute('.ab-camera img', 'src')))
    await sleep(1300)
    check('the preview waits for a tap', await p.isVisible('.ab-camera'))
    await p.tap('[data-log="camera-retake"]')
    await sleep(300)
    check('Retake shows the same photo', await p.isVisible('.ab-camera') && /mine-drive/.test(await p.getAttribute('.ab-camera img', 'src')))
  }
  const box = await p.$$eval('.ab-camera-bar button', (x) => x.map((b) => b.getBoundingClientRect().height))
  if (box.some((h) => h < 44)) check('camera buttons are 44 px', false, box.join(' '))
  await p.tap('[data-log="camera-use"]')
  await p.waitForSelector('.ab-camera', { state: 'detached', timeout: 15000 })
}
const takeAll = async (p) => { for (const n of ['Crank arm', 'Saddle edge', 'Drivetrain']) await takePhoto(p, n) }
const rowId = (p) => p.evaluate(() => JSON.parse(decodeURIComponent(document.cookie.match(/outrent_ab=([^;]*)/)[1])).id)

async function report(p, photos = ['drive']) {
  await scrollTo(p, '.reportrow')
  await p.tap('.reportrow')
  await p.waitForSelector("text=What’s wrong?")
  check('no reason preselected', await p.$$eval('input[name=reason]:checked', (x) => x.length) === 0)
  check('send disabled until a reason', await p.isDisabled('button:has-text("Send to Timah Cycles")'))
  check('no photo selected at open', await p.$$eval('.ab-thumb[aria-pressed=true]', (x) => x.length) === 0)
  await p.tap('label:has-text("Damaged")')
  for (const id of photos) await p.tap(`[data-log="thumb:${id}"]`)
  await p.tap('[data-log="add-photo"]')
  if (photos.includes('drive')) check('the report thumbnail shows the chain on the ground', /mine-drive/.test(await p.getAttribute('[data-log="thumb:drive"] img', 'src')))
  await p.fill('#ab-details', 'The rear part looks bent')
  await p.tap('button:has-text("Send to Timah Cycles")')
  await p.waitForSelector('text=Report sent')
  check('sent rows', (await p.textContent('.ab-card')).includes(`${photos.length} from your record`))
  await p.tap('button:has-text("Back to hand-over")')
  await p.waitForSelector('text=Report sent · 7:46')
  await scrollTo(p, '.reportrow')
  await p.tap('.reportrow', { force: true })
  await sleep(100)
  check('second report refused', await p.isVisible('text=Check it before you ride'))
}
const next = async (p, n) => { await p.tap(`[data-log="next:${n}"]`); await p.waitForSelector(`text=${n + 1} of 5`) }
async function finishSurvey(p, notLooked) {
  await scrollTo(p, '.ab-main')
  await p.tap('button:has-text("Save record")')
  await p.waitForSelector('text=1 of 5')
  check('Q1: next disabled until an answer', await p.isDisabled('[data-log="next:1"]'))
  await p.tap('[data-log="noticed:Yes"]')
  await next(p, 1)
  check('Q2: next disabled until an answer', await p.isDisabled('[data-log="next:2"]'))
  await p.tap('[data-log="seq:6"]')
  await next(p, 2)
  check('Q3: next disabled until an answer', await p.isDisabled('[data-log="next:3"]'))
  if (notLooked) {
    await p.tap('[data-log="find:6"]')
    await p.tap('[data-log="find:not-looked"]')
    check('Q3: the row clears the tile', await p.getAttribute('[data-log="find:6"]', 'aria-pressed') === 'false')
  } else await p.tap('[data-log="find:5"]')
  await p.fill('#ab-find-where', 'Near the photos')
  await next(p, 3)
  await settled(p)
  check('Q4: next disabled until a pick', await p.isDisabled('[data-log="next:4"]'))
  check('neither picture is cropped', await p.$$eval('.ab-pick-img img', (x) => x.every((i) => { const r = i.getBoundingClientRect(); return Math.abs(r.width / r.height - i.naturalWidth / i.naturalHeight) < 0.01 })))
  await p.tap('.ab-pick-img >> nth=1')
  await p.waitForSelector('.ab-viewer')
  check('a picture opens full size and scrolls', await p.$eval('.ab-viewer figure', (f) => f.scrollHeight > f.clientHeight), await p.textContent('.ab-viewer figcaption'))
  check('its opening did not pick it', await p.$$eval('.ab-pick.is-on', (x) => x.length) === 0)
  await p.$eval('.ab-viewer figure', (f) => { f.scrollTop = f.scrollHeight })
  check('close stays on screen when scrolled', await p.isVisible('.ab-viewer-x'))
  await p.tap('.ab-viewer-x')
  await p.waitForSelector('.ab-viewer', { state: 'detached' })
  const caps = await p.$$eval('.ab-pick .opt b', (x) => x.map((e) => e.textContent))
  check('both captions', caps.includes('Report link at the top') && caps.includes('Report link at the bottom'), caps.join(' | '))
  await p.tap('.ab-pick .opt >> nth=0')
  check('a tap on the row picks, with a forest border', await p.$eval('.ab-pick >> nth=0', (e) => e.classList.contains('is-on')) && !(await p.isDisabled('[data-log="next:4"]')))
  await p.fill('#ab-why', 'Easier to find')
  await next(p, 4)
  check('Q5: finish disabled until all three', await p.isDisabled('[data-log="next:5"]'))
  await p.tap('[data-log="cycling:Never"]'); await p.tap('[data-log="rented:No"]')
  check('Q5: still disabled with two', await p.isDisabled('[data-log="next:5"]'))
  await p.tap('[data-log="age:Prefer not to say"]')
  await p.tap('button:has-text("Finish")')
  await p.waitForSelector('text=Done, thank you!')
}

// A photo full size: its tag, one 44 px close button, a tap outside closes, and the page behind has not moved.
async function viewPhoto(p, name, opener, tag, how, src) {
  await scrollTo(p, opener)
  await sleep(150)
  const y = await p.evaluate(() => document.querySelector('.ab-screen').scrollTop)
  await p.tap(opener)
  await p.waitForSelector('.ab-viewer')
  check(`${name}: the tag`, (await p.textContent('.ab-viewer figcaption')) === tag, await p.textContent('.ab-viewer figcaption'))
  check(`${name}: the photo`, src.test(await p.getAttribute('.ab-viewer img', 'src')))
  const x = await p.$eval('.ab-viewer-x', (b) => { const r = b.getBoundingClientRect(); return [r.width, r.height, innerWidth - r.right] })
  check(`${name}: close is 44 px at the top right`, x[0] === 44 && x[1] === 44 && x[2] < 20, x.join(' '))
  const fit = await p.$eval('.ab-viewer img', (i) => { const r = i.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight && i.naturalWidth > 0 })
  check(`${name}: fitted to the screen`, fit)
  await p.tap('.ab-viewer img')
  check(`${name}: a tap on the photo keeps it open`, await p.isVisible('.ab-viewer'))
  if (how === 'x') await p.tap('.ab-viewer-x')
  else { const v = await p.viewportSize(); await p.touchscreen.tap(v.width / 2, 40) }
  await p.waitForSelector('.ab-viewer', { state: 'detached' })
  await sleep(100)
  const after = await p.evaluate(() => document.querySelector('.ab-screen').scrollTop)
  check(`${name}: the page has not moved`, after === y, `${y} / ${after}`)
}

async function flow(name, browserType, device, variant, withReport, viewFirst, notLooked) {
  console.log(`\n--- ${name} · ${variant.toUpperCase()} · ${viewFirst ? 'open the drivetrain photo, close it, then report' : notLooked ? 'save only, did not look' : withReport ? 'report' : 'save only'}`)
  const { browser, p, errs, calls } = await open(browserType, device, `v=${variant}`)
  await settled(p)
  await start(p)
  const id = await rowId(p)
  await settled(p)
  check('main button starts disabled', await p.isDisabled('.ab-main'))
  check('no condition text at start', !/No marks|Circle the|nothing new/i.test(await p.textContent('body')))
  await p.tap('.back')
  await takePhoto(p, 'Crank arm')
  check('button counts down', (await p.textContent('.ab-main')) === 'Take 2 more photos')
  check('you column', (await p.textContent('.cols')).includes('25 Oct · 7:40'))
  if (viewFirst) await viewPhoto(p, 'shop crank, before the third photo', 'section.part[aria-label="Crank arm"] .ab-view', 'Crank arm · 18 Oct · Timah', 'outside', /shop-crank/)
  await takePhoto(p, 'Saddle edge')
  await takePhoto(p, 'Drivetrain')
  const drive = await p.$$eval('section.part[aria-label="Drivetrain"] img', (x) => x.map((i) => i.getAttribute('src')))
  check('the slot shows the new pair', drive.length === 2 && /mine-drive/.test(drive[1]) && /shop-drive/.test(drive[0]), drive.join(' | '))
  check('save enabled after three', !(await p.isDisabled('button:has-text("Save record")')))
  check('note above save', await p.isVisible('text=Both records are kept with booking OR-10482'))
  check('no condition text after photos', !/No marks|Circle the|nothing new/i.test(await p.textContent('body')))
  await p.screenshot({ path: `${OUT}flow-${name}-${variant}-${viewFirst ? 'view' : notLooked ? 'notlooked' : withReport ? 'report' : 'save'}.png` })
  if (viewFirst) {
    const sel = 'section.part[aria-label="Drivetrain"] .shot'
    await scrollTo(p, sel); await sleep(800)
    const before = await p.screenshot()
    await viewPhoto(p, 'your drivetrain', sel, 'Drivetrain · 25 Oct · 7:41 · you', 'x', /mine-drive/)
    await p.evaluate(() => document.activeElement?.blur()); await sleep(300)
    check('the page looks the same after closing', before.equals(await p.screenshot()))
    await viewPhoto(p, 'shop drivetrain', 'section.part[aria-label="Drivetrain"] .ab-view', 'Drivetrain · 18 Oct · Timah', 'outside', /shop-drive/)
  }
  if (withReport) await report(p)
  await finishSurvey(p, notLooked)
  await sleep(1200)
  await p.reload()
  await p.waitForSelector('text=You can close this tab now.')
  check('reopening shows only thanks', (await p.textContent('body')).trim() === 'Done, thank you!You can close this tab now.')
  check('no console errors', errs.length === 0, errs.join(' | '))
  await sleep(800)
  check('server accepted every write', refused(calls).length === 0, `${calls.length} calls, refused: ${JSON.stringify(refused(calls).map((c) => [c.fn, c.status, c.why, Object.keys(c.body.p_patch?.set ?? {}), (c.body.p_patch?.events ?? []).map((e) => e.type)]))}`)
  const row = rowFromCalls(calls)
  check('final answers went out', row.t_finish != null && row.preference != null, `finish ${row.t_finish}, preference ${row.preference}`)
  const views = viewFirst ? 3 : 0, kinds = (t) => row.events.filter((e) => e.type === t)
  check('photo_views counts them', (row.photo_views ?? 0) === views, row.photo_views)
  check('every open has its close, with part and who', kinds('photo_view_open').length === views && kinds('photo_view_close').length === views && kinds('photo_view_open').every((e) => e.data.part && e.data.who), JSON.stringify(kinds('photo_view_open').map((e) => e.data)))
  const uses = kinds('photo_use_tap')
  check('photo_use_tap for each photo', uses.length === 3 && uses.map((e) => e.target).sort().join() === 'crank,drive,saddle', uses.map((e) => `${e.target} ${e.t}`).join(' '))
  check('the damage clock starts at the preview, before Use photo', row.t_damage_visible < uses.find((e) => e.target === 'drive').t && uses.find((e) => e.target === 'drive').t - row.t_damage_visible >= 1300, `${uses.find((e) => e.target === 'drive').t - row.t_damage_visible} ms`)
  check('the Retake tap is logged', row.events.some((e) => e.type === 'tap' && e.target === 'camera-retake'))
  check('the enlarged picture is logged', kinds('pref_view_open').length === 1 && /^[AB]$/.test(kinds('pref_view_open')[0].data.version), JSON.stringify(kinds('pref_view_open').map((e) => e.data)))
  check('Q3 is stored as answered', notLooked ? row.find_ease === null && row.find_not_looked === true : row.find_ease === 5 && row.find_not_looked === false, `${row.find_ease} ${row.find_not_looked}`)
  check('the other answers went out', row.noticed === 'Yes' && row.seq === 6 && row.find_where === 'Near the photos' && row.preference_why === 'Easier to find' && row.cycling === 'Never' && row.rented_before === 'No' && row.age_band === 'Prefer not to say')
  const ts = [row.t_q1_done, row.t_q2_done, row.t_q3_done, row.t_q4_done, row.t_q5_done]
  check('each screen logs its time, in order', ts.every((t, i) => t != null && (i === 0 || t >= ts[i - 1])), ts.join(' '))
  check('t_questions_done is Q3, t_finish is Q5', row.t_questions_done === row.t_q3_done && row.t_finish === row.t_q5_done)
  check('open_text stays empty', row.open_text == null)
  check('first tap after the photos', row.first_tap_after_photos === (viewFirst ? 'photo_view' : withReport ? 'link' : 'save'), row.first_tap_after_photos)
  if (viewFirst) check('the report tap is still the metric, after the views', row.t_report_tap > kinds('photo_view_close').at(-1).t && row.t_report_tap > row.t_damage_visible, `${row.t_report_tap - row.t_damage_visible} ms`)
  await browser.close()
  return { id, name, variant, withReport, row }
}

async function flows() {
  const out = []
  for (const [name, type, device] of [['iphone13-webkit', webkit, devices['iPhone 13']], ['pixel7-chromium', chromium, devices['Pixel 7']]]) {
    for (const v of ['a', 'b']) {
      for (const r of [true, false]) out.push(await flow(name, type, device, v, r))
      out.push(await flow(name, type, device, v, true, true))
      out.push(await flow(name, type, device, v, false, false, true))
    }
  }
  fs.writeFileSync(OUT + 'flows.json', JSON.stringify(out.map(({ row, ...o }) => o), null, 1))
  fs.writeFileSync(OUT + 'rows-from-writes.json', JSON.stringify(out.map((o) => o.row), null, 1))
  console.log('\nrows', out.map((o) => o.id).join(' '))
}

// Screen 7's two pictures: 390 wide, the whole page after the three photos, the link outlined in both the same way.
// The outline is only in the picture. Saved as WebP through the browser, so no image tool is needed.
async function layouts() {
  for (const v of ['a', 'b']) {
    const { browser, p } = await open(chromium, VIEW, `v=${v}`)
    await start(p); await settled(p)
    await takeAll(p)
    await sleep(800)
    await p.addStyleTag({ content: '.reportrow { outline: 3px solid #E6B800; outline-offset: 3px }' })
    await p.evaluate(() => { document.querySelector('.ab-screen').scrollTop = 0; document.activeElement?.blur() })
    const h = await p.evaluate(() => document.querySelector('.ab-screen').scrollHeight)
    await p.setViewportSize({ width: 390, height: h })
    await sleep(400); await settled(p)
    console.log('height', v, h)
    const png = await p.screenshot({ type: 'png' })
    const webp = await p.evaluate(async (b64) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
      c.getContext('2d').drawImage(img, 0, 0)
      return c.toDataURL('image/webp', 0.86).split(',')[1]
    }, png.toString('base64'))
    const to = new URL(`../../work/haoyue/_abtest/assets/layout-${v}.webp`, import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
    fs.writeFileSync(to, Buffer.from(webp, 'base64'))
    console.log('saved', to, Buffer.from(webp, 'base64').length)
    await browser.close()
  }
}

// Acceptance 1. Each version at 390 × 844 for the record, then the whole page at full length; cut the link block and its
// gap out of each, close the gap, compare every pixel. The DOM is compared with the link block taken out.
const fullDom = (p) => p.evaluate(() => {
  const root = document.querySelector('.ab-session').cloneNode(true)
  root.querySelector('.ab-link').remove()
  return root.innerHTML
})
async function capture(browser, v, photos, control) {
  const ctx = await browser.newContext(VIEW)
  const p = await ctx.newPage()
  await p.goto(`${BASE}/?pilot=1&new=1&v=${v}`)
  await start(p); await settled(p)
  if (photos) await takeAll(p)
  await sleep(800)
  await p.evaluate(() => { document.querySelector('.ab-screen').scrollTop = 0 })
  await p.mouse.move(0, 0)
  const name = `${v}-${photos ? 'after' : 'before'}${control ? '-control' : ''}`
  await p.screenshot({ path: `${OUT}${name}.png` })
  // Control pass: the two paint effects that a cut cannot carry. The card's shadow falls under B's link, and the rings
  // sit on their own layer, so their antialiasing shifts with the page offset. Geometry is compared in both passes.
  if (control) await p.addStyleTag({ content: '.record { box-shadow: none !important } .ring2 { transform: none !important; transition: none !important }' })
  const dom = await fullDom(p)
  // Full length: the page grows to its content, so nothing is left to scroll; the dock stays at the bottom in both.
  const h = await p.evaluate(() => document.querySelector('.ab-screen').scrollHeight)
  await p.setViewportSize({ width: 390, height: h })
  await sleep(300); await settled(p)
  const png = await p.screenshot({ path: `${OUT}${name}-full.png` })
  const box = await p.evaluate(() => {
    const b = document.querySelector('.ab-link').getBoundingClientRect()
    const row = document.querySelector('.reportrow').getBoundingClientRect()
    return { y: Math.min(b.top, row.top - parseFloat(getComputedStyle(document.querySelector('.reportrow')).marginTop)), bottom: b.bottom, h: b.bottom - Math.min(b.top, row.top - parseFloat(getComputedStyle(document.querySelector('.reportrow')).marginTop)) }
  })
  const link = await p.evaluate(() => { const c = document.querySelector('.ab-link').cloneNode(true); return c.outerHTML })
  box.cardBottom = await p.evaluate(() => document.querySelector('.record').getBoundingClientRect().bottom) - (v === 'a' ? box.h : 0)
  box.rings = await p.evaluate(() => { const c = document.querySelector('.record').getBoundingClientRect().top; return [...document.querySelectorAll('.ring2')].map((r) => r.getBoundingClientRect().top - c) })
  await ctx.close()
  return { png: png.toString('base64'), box, dom, h, link }
}
async function diff() {
  const browser = await chromium.launch()
  const tool = await (await browser.newContext()).newPage()
  const results = {}
  for (const [photos, control] of [[false, false], [true, false], [false, true], [true, true]]) {
    const A = await capture(browser, 'a', photos, control), B = await capture(browser, 'b', photos, control)
    const label = (photos ? 'after photos' : 'before photos') + (control ? ' (control)' : ' (raw)')
    check(`${label}: DOM identical without the link block`, A.dom === B.dom)
    check(`${label}: the link block itself is identical`, A.link === B.link)
    check(`${label}: same full height`, A.h === B.h, `${A.h} / ${B.h}`)
    check(`${label}: link block height the same`, A.box.h === B.box.h, `${A.box.h} / ${B.box.h}`)
    const r = await tool.evaluate(async ({ a, b, boxA, boxB, name }) => {
      const load = async (b64) => { const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); return i }
      const [ia, ib] = await Promise.all([load(a), load(b)])
      const S = ia.width / 390
      const cut = (img, box) => {
        const y = Math.round(box.y * S), h = Math.round(box.h * S)
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height - h
        const x = c.getContext('2d', { willReadFrequently: true })
        x.drawImage(img, 0, 0, img.width, y, 0, 0, img.width, y)
        x.drawImage(img, 0, y + h, img.width, img.height - y - h, 0, y, img.width, img.height - y - h)
        return x.getImageData(0, 0, c.width, c.height)
      }
      const da = cut(ia, boxA), db = cut(ib, boxB)
      if (da.width !== db.width || da.height !== db.height) return { size: [da.width, da.height, db.width, db.height] }
      let differ = 0, firstY = -1, inCard = 0, maxCard = 0, maxBelow = 0
      const cardEnd = Math.round(boxA.cardBottom * S)
      const out = document.createElement('canvas'); out.width = da.width; out.height = da.height
      const ox = out.getContext('2d'); const od = ox.createImageData(da.width, da.height)
      for (let i = 0; i < da.data.length; i += 4) {
        const same = da.data[i] === db.data[i] && da.data[i + 1] === db.data[i + 1] && da.data[i + 2] === db.data[i + 2]
        if (!same) {
          differ++
          const row = Math.floor(i / 4 / da.width)
          if (firstY < 0) firstY = row
          const delta = Math.max(Math.abs(da.data[i] - db.data[i]), Math.abs(da.data[i + 1] - db.data[i + 1]), Math.abs(da.data[i + 2] - db.data[i + 2]))
          if (row < cardEnd) { inCard++; maxCard = Math.max(maxCard, delta) } else maxBelow = Math.max(maxBelow, delta)
        }
        od.data[i] = same ? da.data[i] : 255; od.data[i + 1] = same ? da.data[i + 1] : 0; od.data[i + 2] = same ? da.data[i + 2] : 0; od.data[i + 3] = 255
      }
      ox.putImageData(od, 0, 0)
      return { name, differ, firstY, inCard, maxCard, maxBelow, cardEnd, ringsA: boxA.rings, ringsB: boxB.rings, total: da.width * da.height, png: out.toDataURL('image/png').split(',')[1] }
    }, { a: A.png, b: B.png, boxA: A.box, boxB: B.box, name: label })
    if (r.png) { fs.writeFileSync(`${OUT}diff-${photos ? 'after' : 'before'}${control ? '-control' : ''}.png`, Buffer.from(r.png, 'base64')); delete r.png }
    console.log(`INFO ${label}: ${JSON.stringify(r)}`)
    results[label] = r
  }
  // Offset control: one version against itself, with nothing changed except that the card sits 85 px lower. Whatever
  // differs here cannot come from A or B; it is how the browser paints the same thing at another offset.
  for (const photos of [false, true]) {
    const shot = async (shift) => {
      const ctx = await browser.newContext(VIEW)
      const p = await ctx.newPage()
      await p.goto(`${BASE}/?pilot=1&new=1&v=b`)
      await start(p); await settled(p)
      if (photos) await takeAll(p)
      await sleep(800)
      await p.addStyleTag({ content: `.ab-link { visibility: hidden } ${shift ? '.record { margin-top: 105px !important }' : ''}` })
      const h = await p.evaluate(() => document.querySelector('.ab-screen').scrollHeight)
      await p.setViewportSize({ width: 390, height: 1100 })
      await sleep(300); await settled(p)
      const png = await p.screenshot()
      const y = await p.evaluate(() => document.querySelector('.s11-lede').getBoundingClientRect().bottom)
      await ctx.close()
      return { png: png.toString('base64'), y, h }
    }
    const [plain, moved] = [await shot(false), await shot(true)]
    const r = await tool.evaluate(async ({ a, b, y }) => {
      const load = async (d) => { const i = new Image(); i.src = 'data:image/png;base64,' + d; await i.decode(); return i }
      const [ia, ib] = await Promise.all([load(a), load(b)])
      const S = ia.width / 390, Y = Math.round(y * S), H = Math.round(85 * S), rows = ia.height - Y - H - 400
      const data = (img, top) => { const c = document.createElement('canvas'); c.width = img.width; c.height = rows; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, top, img.width, rows, 0, 0, img.width, rows); return x.getImageData(0, 0, c.width, rows).data }
      const d0 = data(ia, Y), d1 = data(ib, Y + H)
      let differ = 0, max = 0
      for (let i = 0; i < d0.length; i += 4) { const m = Math.max(Math.abs(d0[i] - d1[i]), Math.abs(d0[i + 1] - d1[i + 1]), Math.abs(d0[i + 2] - d1[i + 2])); if (m) { differ++; max = Math.max(max, m) } }
      return { differ, max }
    }, { a: plain.png, b: moved.png, y: plain.y })
    console.log(`INFO offset control, ${photos ? 'after' : 'before'} photos: ${JSON.stringify(r)}`)
    results[`offset ${photos ? 'after' : 'before'}`] = r
    const raw = results[`${photos ? 'after' : 'before'} photos (raw)`]
    check(`${photos ? 'after' : 'before'} photos: A against B inside the card differs no more than B against itself moved 85 px`, raw.inCard <= r.differ && raw.maxCard <= r.max, `${raw.inCard} px, max ${raw.maxCard} / ${r.differ} px, max ${r.max}`)
  }
  fs.writeFileSync(OUT + 'diff.json', JSON.stringify(results, null, 1))
  await browser.close()
}

// Acceptance 5.
async function assign() {
  const browser = await chromium.launch()
  const seen = []
  for (let i = 0; i < 10; i++) {
    const ctx = await browser.newContext(VIEW)
    const p = await ctx.newPage()
    await p.goto(`${BASE}/?pilot=1`)
    await start(p)
    const c = await p.evaluate(() => JSON.parse(decodeURIComponent(document.cookie.match(/outrent_ab=([^;]*)/)[1])))
    seen.push({ id: c.id, variant: c.variant })
    if (i === 0) {
      await takePhoto(p, 'Crank arm')
      await sleep(700)
      await p.reload()
      await p.waitForSelector('text=Check it before you ride')
      const again = await p.evaluate(() => JSON.parse(decodeURIComponent(document.cookie.match(/outrent_ab=([^;]*)/)[1])))
      check('reload keeps the row and the version', again.id === c.id && again.variant === c.variant, `${again.id} ${again.variant}`)
      check('reload resumes with the photo taken', (await p.textContent('.ab-main')) === 'Take 2 more photos')
    }
    await ctx.close()
  }
  console.log(seen.map((s) => `${s.id}:${s.variant.toUpperCase()}`).join(' '))
  const pairs = []
  for (let i = 0; i < 10; i += 2) pairs.push(seen[i].variant + seen[i + 1].variant)
  check('every pair has one A and one B', pairs.every((x) => x === 'ab' || x === 'ba'), pairs.join(' '))
  // A forced row between two Starts must not take a place: the two around it are still a pair.
  const startOne = async (q) => { const c = await browser.newContext(VIEW); const pg = await c.newPage(); await pg.goto(`${BASE}/?${q}`); await start(pg); const v = await pg.evaluate(() => JSON.parse(decodeURIComponent(document.cookie.match(/outrent_ab=([^;]*)/)[1]))); await c.close(); return v }
  const one = await startOne('pilot=1'), forcedSame = await startOne(`pilot=1&v=${one.variant}`), two = await startOne('pilot=1')
  check('a forced row is not the partner of the next row', one.variant !== two.variant, `${one.id}:${one.variant} forced ${forcedSame.id}:${forcedSame.variant} ${two.id}:${two.variant}`)
  const ctx = await browser.newContext(VIEW)
  const p = await ctx.newPage()
  await p.goto(`${BASE}/?pilot=1&v=b`)
  await start(p)
  const f = await p.evaluate(() => JSON.parse(decodeURIComponent(document.cookie.match(/outrent_ab=([^;]*)/)[1])))
  check('?v=b gives B', f.variant === 'b', `row ${f.id}`)
  console.log('forced row', f.id)
  // A dropout: leave mid-task right after a tap; the row must still have it.
  await p.tap('section.part[aria-label="Crank arm"] .ph:not(.shot)')
  await p.goto('about:blank')
  console.log('dropout row', f.id)
  await browser.close()
}

// The final write as the page goes: a tap, then away at once, before the usual 400 ms send. WebKit only: Chromium stops
// reporting a page's requests once it navigates, so there the same write was checked through a logging proxy.
async function drop() {
  for (const [name, type, device] of [['iphone13-webkit', webkit, devices['iPhone 13']]]) {
    const { browser, p, errs, calls } = await open(type, device, 'v=a')
    await start(p); await settled(p); await sleep(900)
    const before = calls.length
    await p.tap('section.part[aria-label="Crank arm"] .ph:not(.shot)')
    await p.goto('about:blank')
    await sleep(2500)
    const last = calls.slice(before)
    const carried = last.filter((c) => (c.body.p_patch?.events ?? []).some((e) => e.type === 'hide') || (c.body.p_patch?.hidden ?? []).length)
    const tapped = last.some((c) => (c.body.p_patch?.events ?? []).some((e) => e.target === 'shop-photo:crank'))
    check(`${name}: the tap and the leaving went out as the page closed`, carried.length > 0 && tapped, JSON.stringify(last.map((c) => [c.fn, c.status, c.why])))
    check(`${name}: not refused`, !refused(carried).length, JSON.stringify(carried.map((c) => c.status)))
    check(`${name}: no console errors`, errs.length === 0, errs.join(' | '))
    await browser.close()
  }
}

// A slow connection: Daniel's drivetrain takes 4 s. The damage's clock must start when it can be seen.
async function slow() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext(VIEW)
  const calls = watch(ctx)
  await ctx.route('**/*mine-drive*', async (route) => { await sleep(4000); await route.continue() })
  const p = await ctx.newPage()
  await p.goto(`${BASE}/?pilot=1&new=1&v=a`)
  await p.waitForSelector('text=Thanks for helping us out!')
  await start(p); await settled(p)
  const at = Date.now()
  await takePhoto(p, 'Drivetrain')
  await sleep(1000)
  const events = calls.flatMap((c) => c.body.p_patch?.events ?? [])
  const shown = events.find((e) => e.target === 'preview:drive'), taken = events.find((e) => e.target === 'taken:drive')
  check('the clock starts with the photo loaded', shown?.data?.loaded === true, JSON.stringify(shown))
  check('Use photo comes after it', taken.t > shown.t, `${taken.t - shown.t} ms, ${Date.now() - at} ms in all`)
  await browser.close()
}

// The built bundle: no placeholder, no old copy, nothing that judges a part's condition.
async function grep() {
  const dir = new URL('../dist-abtest/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
  const files = fs.readdirSync(dir, { recursive: true }).filter((f) => /\.(js|css|html)$/.test(f))
  const text = files.map((f) => fs.readFileSync(dir + f, 'utf8')).join('\n')
  for (const w of ['Your bike’s here', 'Compare what you see', 'it’s a prototype', 'Hi! We’re SMU', 'Use the app like', 'We don’t collect', 'where would you go to tell the shop', 'Which version of that page', 'Link at the top', 'Done, thanks a lot', 'Why did you give']) check(`bundle has no "${w}"`, !text.includes(w))
  for (const w of ['PLACEHOLDER', 'mine-drive-bent', 'There are no right answers', 'testing the app, not you', 'Your rental bike just arrived', 'Report link on top', 'Thanks. You can close this page', 'No marks to record', 'Circle the', 'nothing new']) check(`bundle has no "${w}"`, !text.includes(w))
  for (const w of ['Thanks for helping us out', 'You’re Daniel', 'I didn’t look for it', 'Report link at the bottom', 'About you', 'Done, thank you', 'photo_view_open', 'photo_use_tap', 't_q5_done', 'find_not_looked']) check(`bundle has "${w}"`, text.includes(w))
}

// Every screen around the task. S0, S1, Q1, Q2, Q3 and S9 must fit without scrolling, the button included, at both sizes;
// Q4 and Q5 may scroll. Nothing may overflow sideways. Screenshots for the hand-back.
async function screens() {
  const browser = await chromium.launch()
  for (const [w, h] of [[390, 844], [375, 667]]) {
    const ctx = await browser.newContext({ ...VIEW, viewport: { width: w, height: h } })
    const p = await ctx.newPage()
    const errs = []
    p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) }); p.on('pageerror', (e) => errs.push(e.message))
    const look = async (name, mustFit) => {
      await settled(p); await sleep(500)
      await p.evaluate(() => document.activeElement?.blur())
      const m = await p.evaluate(() => {
        const sc = document.querySelector('.ab-ps-sheet') ?? document.querySelector('.ab-screen')
        const dock = document.querySelector('.ab-root .dock')?.getBoundingClientRect()
        const last = document.querySelector('.ab-qs-in')?.getBoundingClientRect()
        const btn = document.querySelector('.cta')?.getBoundingClientRect()
        const sheet = document.querySelector('.ab-ps-sheet')?.getBoundingClientRect()
        return { scrolls: sc.scrollHeight > sc.clientHeight, sideways: sc.scrollWidth > innerWidth || document.documentElement.scrollWidth > innerWidth, contentBottom: last && Math.round(last.bottom), dockTop: dock && Math.round(dock.top), buttonIn: !btn || btn.bottom <= innerHeight, photo: sheet && Math.round(sheet.top) }
      })
      check(`${w} × ${h} ${name}: nothing sideways`, !m.sideways, JSON.stringify(m))
      if (mustFit) check(`${w} × ${h} ${name}: fits without scrolling`, !m.scrolls && m.buttonIn && (m.contentBottom == null || m.contentBottom <= m.dockTop), JSON.stringify(m))
      await p.screenshot({ path: `${OUT}screen-${name}-${w}x${h}.png` })
    }
    await p.goto(`${BASE}/?pilot=1&new=1&v=a`)
    await p.waitForSelector('text=Thanks for helping us out!')
    await look('s0', true)
    await p.tap('button:has-text("Continue")'); await p.waitForSelector('text=You’re Daniel')
    await look('s1', true)
    await p.tap('button:has-text("Start")'); await p.waitForSelector('text=Check it before you ride')
    await settled(p); await takeAll(p)
    await scrollTo(p, '.ab-main'); await p.tap('button:has-text("Save record")'); await p.waitForSelector('text=1 of 5')
    await p.tap('[data-log="noticed:Yes"]'); await look('q1', true)
    await next(p, 1); await p.tap('[data-log="seq:6"]'); await look('q2', true)
    await next(p, 2); await p.tap('[data-log="find:5"]'); await look('q3', true)
    await next(p, 3); await p.tap('.ab-pick .opt >> nth=0'); await p.evaluate(() => { document.querySelector('.ab-screen').scrollTop = 0 }); await look('q4', false)
    await next(p, 4); await look('q5', false)
    await p.tap('[data-log="cycling:Never"]'); await p.tap('[data-log="rented:No"]'); await p.tap('[data-log="age:Prefer not to say"]')
    await p.tap('button:has-text("Finish")'); await p.waitForSelector('text=Done, thank you!')
    await look('s9', true)
    check(`${w} × ${h}: no console errors`, errs.length === 0, errs.join(' | '))
    await ctx.close()
  }
  await browser.close()
}

// One screenshot for the hand-back: the slot right after the drivetrain photo drops in, at 390 × 844.
async function slot() {
  const { browser, p } = await open(chromium, VIEW, 'v=a')
  await start(p); await settled(p)
  await takePhoto(p, 'Crank arm'); await takePhoto(p, 'Saddle edge'); await takePhoto(p, 'Drivetrain')
  await sleep(900)
  await p.evaluate(() => { const s = document.querySelector('.ab-screen'); s.scrollTop += document.querySelector('.record').getBoundingClientRect().top - 12 })
  await sleep(200)
  await p.screenshot({ path: `${OUT}slot-drivetrain.png` })
  await p.tap('section.part[aria-label="Drivetrain"] .shot')
  await p.waitForSelector('.ab-viewer'); await sleep(300)
  await p.screenshot({ path: `${OUT}viewer-drivetrain.png` })
  await browser.close()
}

const mode = process.argv[2]
await ({ flows, layouts, diff, assign, drop, slow, grep, slot, screens })[mode]()
console.log(fails.length ? `\n${fails.length} FAILED:\n` + fails.join('\n') : '\nALL PASS')
process.exit(fails.length ? 1 : 0)
