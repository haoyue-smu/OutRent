// The A/B test site, acceptance runs. The built site must be up (vite preview --config vite.abtest.config.ts --port 5193).
//   node app/e2e/abtest.mjs layouts            pictures for screen 7 (whole page after the photos, link outlined), saved as work/haoyue/_abtest/assets/layout-{a,b}.webp
//   node app/e2e/abtest.mjs flows              whole flow: WebKit iPhone 13 and Chromium Pixel 7, A and B, report and save only
//   node app/e2e/abtest.mjs diff               acceptance 1: the four screenshots, the DOM and the pixel diff
//   node app/e2e/abtest.mjs assign             acceptance 5: ten Starts in a row, a reload, a forced row
//   node app/e2e/abtest.mjs drop               the keepalive write on pagehide
//   node app/e2e/abtest.mjs slow               the damaged photo on a slow connection
//   node app/e2e/abtest.mjs grep               the built bundle holds no old copy
//   node app/e2e/abtest.mjs entry              the entry and thank-you screens: the sheet fits a small phone, screenshots
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
  const once = new Set(['page_open', 'link_visible_on_load', 'link_in_view_at_damage', 't_damage_visible', 'first_tap_after_photos', 't_report_tap', 'report_opened', 'report_sent', 'record_saved', 't_end', 't_questions_done', 'preference_left', 't_finish'])
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
  await p.waitForSelector('text=Your bike’s here')
  return { browser, ctx, p, errs, calls }
}
const start = async (p) => { await p.tap('button:has-text("Start")'); await p.waitForSelector('text=Check it before you ride') }
const settled = (p) => p.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0))
const scrollTo = (p, sel) => p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel)
async function takePhoto(p, name) {
  const sel = `section.part[aria-label="${name}"] .shot`
  await scrollTo(p, sel)
  await p.tap(sel)
  await p.waitForSelector('.ab-camera')
  if (name === 'Drivetrain') check('the preview shows the damaged photo', /11-mine-drive-bent/.test(await p.getAttribute('.ab-camera img', 'src')))
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
  if (photos.includes('drive')) check('the report thumbnail shows the damaged photo', /11-mine-drive-bent/.test(await p.getAttribute('[data-log="thumb:drive"] img', 'src')))
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
async function finishSurvey(p) {
  await scrollTo(p, '.ab-main')
  await p.tap('button:has-text("Save record")')
  await p.waitForSelector('text=3 quick questions')
  check('next disabled until answers', await p.isDisabled('button:has-text("Next")'))
  await p.tap('label:has-text("Yes")')
  await p.tap('[data-log="seq:6"]')
  await p.fill('#ab-seq-why', 'Clear steps')
  await p.fill('#ab-open', 'Near the photos')
  await p.tap('button:has-text("Next")')
  await p.waitForSelector('text=Which version of that page do you prefer?')
  await settled(p)
  check('submit disabled until a pick', await p.isDisabled('button:has-text("Submit")'))
  check('neither picture is cropped', await p.$$eval('.ab-pick-img img', (x) => x.every((i) => { const r = i.getBoundingClientRect(); return Math.abs(r.width / r.height - i.naturalWidth / i.naturalHeight) < 0.01 })))
  await p.tap('.ab-pick-img >> nth=1')
  await p.waitForSelector('.ab-viewer')
  check('a picture opens full size and scrolls', await p.$eval('.ab-viewer figure', (f) => f.scrollHeight > f.clientHeight), await p.textContent('.ab-viewer figcaption'))
  check('its opening did not pick it', await p.$$eval('input[name=pick]:checked', (x) => x.length) === 0)
  await p.$eval('.ab-viewer figure', (f) => { f.scrollTop = f.scrollHeight })
  check('close stays on screen when scrolled', await p.isVisible('.ab-viewer-x'))
  await p.tap('.ab-viewer-x')
  await p.waitForSelector('.ab-viewer', { state: 'detached' })
  const caps = await p.$$eval('.ab-pick-cap', (x) => x.map((e) => e.textContent))
  check('both captions', caps.includes('Link at the top') && caps.includes('Link at the bottom'), caps.join(' | '))
  await p.tap('.ab-pick-cap >> nth=0')
  check('a tap on the caption picks, with a forest border', await p.$eval('.ab-pick >> nth=0', (e) => e.classList.contains('is-on')) && !(await p.isDisabled('button:has-text("Submit")')))
  await p.fill('#ab-why', 'Easier to find')
  await p.tap('button:has-text("Submit")')
  await p.waitForSelector('text=Done, thanks a lot! You can close this tab.')
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

async function flow(name, browserType, device, variant, withReport, viewFirst) {
  console.log(`\n--- ${name} · ${variant.toUpperCase()} · ${viewFirst ? 'open the drivetrain photo, close it, then report' : withReport ? 'report' : 'save only'}`)
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
  if (viewFirst) await viewPhoto(p, 'shop crank, before the third photo', 'section.part[aria-label="Crank arm"] .ab-view', 'Crank arm · 18 Oct · Timah', 'outside', /11-direction-s-crank/)
  await takePhoto(p, 'Saddle edge')
  await takePhoto(p, 'Drivetrain')
  const drive = await p.$$eval('section.part[aria-label="Drivetrain"] img', (x) => x.map((i) => i.getAttribute('src')))
  check('the slot shows the damaged photo', drive.length === 2 && /11-mine-drive-bent/.test(drive[1]) && /11-direction-s-drive/.test(drive[0]), drive.join(' | '))
  check('save enabled after three', !(await p.isDisabled('button:has-text("Save record")')))
  check('note above save', await p.isVisible('text=Both records are kept with booking OR-10482'))
  check('no condition text after photos', !/No marks|Circle the|nothing new/i.test(await p.textContent('body')))
  await p.screenshot({ path: `${OUT}flow-${name}-${variant}-${viewFirst ? 'view' : withReport ? 'report' : 'save'}.png` })
  if (viewFirst) {
    const sel = 'section.part[aria-label="Drivetrain"] .shot'
    await scrollTo(p, sel); await sleep(800)
    const before = await p.screenshot()
    await viewPhoto(p, 'your drivetrain', sel, 'Drivetrain · 25 Oct · 7:41 · you', 'x', /11-mine-drive-bent/)
    await p.evaluate(() => document.activeElement?.blur()); await sleep(300)
    check('the page looks the same after closing', before.equals(await p.screenshot()))
    await viewPhoto(p, 'shop drivetrain', 'section.part[aria-label="Drivetrain"] .ab-view', 'Drivetrain · 18 Oct · Timah', 'outside', /11-direction-s-drive/)
  }
  if (withReport) await report(p)
  await finishSurvey(p)
  await sleep(1200)
  await p.reload()
  await p.waitForSelector('text=Done, thanks a lot! You can close this tab.')
  check('reopening shows only thanks', (await p.textContent('body')).trim() === 'Done, thanks a lot! You can close this tab.')
  check('no console errors', errs.length === 0, errs.join(' | '))
  await sleep(800)
  check('server accepted every write', refused(calls).length === 0, `${calls.length} calls, refused: ${JSON.stringify(refused(calls).map((c) => [c.fn, c.status, c.why]))}`)
  const row = rowFromCalls(calls)
  check('final answers went out', row.t_finish != null && row.preference != null, `finish ${row.t_finish}, preference ${row.preference}`)
  const views = viewFirst ? 3 : 0, kinds = (t) => row.events.filter((e) => e.type === t)
  check('photo_views counts them', (row.photo_views ?? 0) === views, row.photo_views)
  check('every open has its close, with part and who', kinds('photo_view_open').length === views && kinds('photo_view_close').length === views && kinds('photo_view_open').every((e) => e.data.part && e.data.who), JSON.stringify(kinds('photo_view_open').map((e) => e.data)))
  check('the enlarged picture is logged', kinds('pref_view_open').length === 1 && /^[AB]$/.test(kinds('pref_view_open')[0].data.version), JSON.stringify(kinds('pref_view_open').map((e) => e.data)))
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

// A slow connection: the damaged photo takes 4 s. The damage's clock must start when it can be seen, and the preview must
// then still show for its full second.
async function slow() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext(VIEW)
  const calls = watch(ctx)
  await ctx.route('**/*11-mine-drive-bent*', async (route) => { await sleep(4000); await route.continue() })
  const p = await ctx.newPage()
  await p.goto(`${BASE}/?pilot=1&new=1&v=a`)
  await p.waitForSelector('text=Your bike’s here')
  await start(p); await settled(p)
  const at = Date.now()
  await takePhoto(p, 'Drivetrain')
  await sleep(1000)
  const events = calls.flatMap((c) => c.body.p_patch?.events ?? [])
  const shown = events.find((e) => e.target === 'preview:drive'), taken = events.find((e) => e.target === 'taken:drive')
  check('the clock starts with the photo loaded', shown?.data?.loaded === true, JSON.stringify(shown))
  check('the preview then shows for its second', taken.t - shown.t >= 1000 && taken.t - shown.t < 1300, `${taken.t - shown.t} ms, ${Date.now() - at} ms in all`)
  await browser.close()
}

// The built bundle: no placeholder, no old copy, nothing that judges a part's condition.
async function grep() {
  const dir = new URL('../dist-abtest/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
  const files = fs.readdirSync(dir, { recursive: true }).filter((f) => /\.(js|css|html)$/.test(f))
  const text = files.map((f) => fs.readFileSync(dir + f, 'utf8')).join('\n')
  for (const w of ['PLACEHOLDER', 'There are no right answers', 'testing the app, not you', 'Your rental bike just arrived', 'Report link on top', 'Thanks. You can close this page', 'No marks to record', 'Circle the', 'nothing new']) check(`bundle has no "${w}"`, !text.includes(w))
  for (const w of ['SMU IS211', 'Your bike', 'Link at the bottom', 'thanks a lot', 'photo_view_open']) check(`bundle has "${w}"`, text.includes(w))
}

// The whole sheet, button included, fits without scrolling, and the whole bike shows above it.
async function entry() {
  const browser = await chromium.launch()
  for (const [w, h] of [[390, 844], [375, 667], [375, 553], [320, 568]]) {
    const ctx = await browser.newContext({ ...VIEW, viewport: { width: w, height: h } })
    const p = await ctx.newPage()
    await p.goto(`${BASE}/?pilot=1&new=1&v=a`)
    await p.waitForSelector('text=Your bike’s here'); await settled(p); await sleep(600)
    const m = await p.evaluate(() => {
      const s = document.querySelector('.ab-ps-sheet'), b = document.querySelector('.cta').getBoundingClientRect(), i = document.querySelector('.ab-ps-photo img'), r = i.getBoundingClientRect()
      const sr = s.getBoundingClientRect(), scale = Math.max(r.width / i.naturalWidth, r.height / i.naturalHeight)
      // The bike in the photo, as parts of its height: from the top of the bar to the bottom of the tyres.
      const crop = r.height - i.naturalHeight * scale, parts = parseFloat(getComputedStyle(i).objectPosition.split(' ')[1]) / 100
      const y = (f) => r.top + crop * parts + f * i.naturalHeight * scale
      return { sheet: Math.round(sr.height), sheetTop: Math.round(sr.top), scrolls: s.scrollHeight > s.clientHeight, button: b.bottom <= innerHeight, bikeTop: Math.round(y(0.387)), bikeBottom: Math.round(y(0.661)), page: document.documentElement.scrollHeight <= innerHeight }
    })
    const main = h >= 667
    if (main) {
      check(`${w} × ${h}: the sheet needs no scrolling and the button shows`, !m.scrolls && m.button && m.page, JSON.stringify(m))
      check(`${w} × ${h}: the whole bike shows above the sheet`, m.bikeTop >= 0 && m.bikeBottom <= m.sheetTop, JSON.stringify(m))
    } else console.log(`INFO ${w} × ${h}: ${JSON.stringify(m)}`)
    await p.screenshot({ path: `${OUT}entry-${w}x${h}.png` })
    await ctx.close()
  }
  await browser.close()
}

// Screen 7 for the hand-back, at 390 × 844 and on a small phone: nothing overflows, and both pictures show whole.
async function pref() {
  const browser = await chromium.launch()
  for (const [w, h] of [[390, 844], [375, 667]]) {
    const ctx = await browser.newContext({ ...VIEW, viewport: { width: w, height: h } })
    const p = await ctx.newPage()
    await p.goto(`${BASE}/?pilot=1&new=1&v=a`)
    await p.waitForSelector('text=Your bike’s here')
    await start(p); await settled(p)
    await takeAll(p)
    await scrollTo(p, '.ab-main')
    await p.tap('button:has-text("Save record")')
    await p.waitForSelector('text=3 quick questions')
    await p.tap('label:has-text("Yes")'); await p.tap('[data-log="seq:6"]'); await p.tap('button:has-text("Next")')
    await p.waitForSelector('text=Which version of that page do you prefer?')
    await settled(p); await sleep(400)
    await p.tap('.ab-pick-cap >> nth=0'); await sleep(200)
    await p.evaluate(() => document.activeElement?.blur()); await sleep(100)
    const m = await p.evaluate(() => ({ over: document.querySelector('.ab-screen').scrollWidth > innerWidth, pics: [...document.querySelectorAll('.ab-pick-img')].map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), Math.round(r.bottom)] }) }))
    check(`${w} × ${h}: no sideways overflow, the pictures fit the screen`, !m.over && m.pics.every((x) => x[2] <= h), JSON.stringify(m))
    await p.screenshot({ path: `${OUT}pref-${w}x${h}.png` })
    if (w === 390) {
      await p.tap('.ab-pick-img >> nth=0'); await p.waitForSelector('.ab-viewer'); await sleep(400)
      await p.screenshot({ path: `${OUT}pref-viewer.png` })
    }
    await ctx.close()
  }
  await browser.close()
}

// One screenshot for the hand-back: the slot right after the drivetrain photo drops in, at 390 × 844.
async function slot() {
  const { browser, p } = await open(chromium, VIEW, 'v=a')
  await start(p); await settled(p)
  await takePhoto(p, 'Crank arm'); await takePhoto(p, 'Saddle edge'); await takePhoto(p, 'Drivetrain')
  await sleep(700)
  await p.screenshot({ path: `${OUT}slot-drivetrain.png` })
  await p.tap('section.part[aria-label="Drivetrain"] .shot')
  await p.waitForSelector('.ab-viewer'); await sleep(300)
  await p.screenshot({ path: `${OUT}viewer-drivetrain.png` })
  await browser.close()
}

const mode = process.argv[2]
await ({ flows, layouts, diff, assign, drop, slow, grep, slot, entry, pref })[mode]()
console.log(fails.length ? `\n${fails.length} FAILED:\n` + fails.join('\n') : '\nALL PASS')
process.exit(fails.length ? 1 : 0)
