// Progress is kept on the device until a reset: /reset, /?reset, or holding the Home logo for 3 s (mouse and touch).
// node app/e2e/reset.mjs   (BASE=http://localhost:5191 by default)
import { chromium, BASE } from './lib.mjs'

const results = []
const ok = (name, pass, got = '') => { results.push(pass); console.log(pass ? 'PASS' : 'FAIL', name, got ? '| ' + got : '') }
const KEY = 'outrent.state.v52'
const booked = { fit: { height: 170, leg: 78, hasProfile: true }, book: { d: '7:20', c: '14:30', place: { d: 0, c: 0 }, pay: 'PayNow', ack: false }, paid: true, now: 9.2, storage: { way: 'home', booked: true, hub: false, rentOn: false, ret: '', day: 28 } }
const b = await chromium.launch()

async function seeded(ctx) {
  const p = await ctx.newPage()
  await p.goto(BASE + '/01-home')
  await p.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, JSON.stringify(booked)])
  return p
}
async function isSeed(p, label) {
  await p.waitForTimeout(1200)
  ok(`${label}: URL is Home`, /\/01-home$/.test(p.url()), p.url())
  const home = await p.locator('.frame-stage').innerText()
  ok(`${label}: Home in the seed state (Wed 22 Oct, no Up next)`, home.includes('WED 22 OCT') && !home.includes('Up next'))
  ok(`${label}: toast "Demo restarted"`, (await p.locator('.toast.on').textContent().catch(() => '')) === 'Demo restarted')
  ok(`${label}: nothing stored`, (await p.evaluate((k) => localStorage.getItem(k), KEY)) === null)
  await p.goto(BASE + '/03-fit-profile'); await p.waitForTimeout(1500)
  ok(`${label}: 03 opens on step 01`, (await p.locator('.steps3 [aria-selected="true"]').innerText()).includes('Height'))
  await p.goto(BASE + '/06-delivery-return'); await p.waitForTimeout(800)
  ok(`${label}: 06 has no times`, (await p.locator('.bill6').innerText()).includes('Pick a time'))
  await p.goto(BASE + '/09-trips'); await p.waitForTimeout(800)
  ok(`${label}: 09 nothing booked`, (await p.locator('.frame-stage').innerText()).includes('Nothing booked'))
  await p.goto(BASE + '/14-my-equipment'); await p.waitForTimeout(800)
  ok(`${label}: 14 at home, no pickup`, (await p.locator('.idlecard').innerText()).toLowerCase().includes('not used since 24 may'))
}

// 1 · kept: close and reopen, new tab
{
  const ctx = await b.newContext({ viewport: { width: 1100, height: 940 } })
  let p = await seeded(ctx); await p.close()
  p = await ctx.newPage(); await p.goto(BASE + '/'); await p.waitForTimeout(1500)
  ok('reopened: Home still shows the booking', (await p.locator('.frame-stage').innerText()).includes('Up next'))
  await p.goto(BASE + '/04-search-results'); await p.waitForTimeout(800)
  ok('reopened: fit kept (size M from 170 cm)', (await p.locator('.query').innerText()).includes('size M'))
  // 2 · /reset
  await p.goto(BASE + '/reset'); await isSeed(p, '/reset')
  // 3 · /?reset
  await p.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, JSON.stringify(booked)])
  await p.goto(BASE + '/?reset'); await isSeed(p, '/?reset')
  await ctx.close()
}
// 4 · the hold with a mouse on the desktop frame; a short click does nothing
{
  const ctx = await b.newContext({ viewport: { width: 1100, height: 940 } })
  const p = await seeded(ctx)
  await p.goto(BASE + '/01-home'); await p.waitForTimeout(1500)
  const box = await p.locator('.lockup').boundingBox()
  await p.mouse.move(box.x + 20, box.y + 10); await p.mouse.down(); await p.waitForTimeout(300); await p.mouse.up(); await p.waitForTimeout(500)
  ok('short click keeps the story', (await p.evaluate((k) => localStorage.getItem(k), KEY)) !== null)
  await p.mouse.down(); await p.waitForTimeout(1500); await p.mouse.move(box.x + 60, box.y + 10); await p.waitForTimeout(2000); await p.mouse.up()
  ok('moving away cancels the hold', (await p.evaluate((k) => localStorage.getItem(k), KEY)) !== null)
  await p.mouse.move(box.x + 20, box.y + 10); await p.mouse.down(); await p.waitForTimeout(3300); await p.mouse.up()
  await p.waitForLoadState(); await isSeed(p, 'mouse hold')
  await ctx.close()
}
// 5 · the hold with a finger at 393 × 852 (real touch events through the browser's input pipeline)
{
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  const p = await seeded(ctx)
  await p.goto(BASE + '/01-home'); await p.waitForTimeout(1500)
  const box = await p.locator('.lockup').boundingBox()
  const cdp = await ctx.newCDPSession(p)
  const pt = [{ x: box.x + 20, y: box.y + 10 }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt })
  await p.waitForTimeout(3300)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }).catch(() => {})
  await p.waitForLoadState(); await isSeed(p, 'touch hold')
  await ctx.close()
}
await b.close()
console.log(`done reset ${results.filter(Boolean).length}/${results.length}`)
