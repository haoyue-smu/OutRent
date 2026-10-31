// The four injected behaviours (spec §5b). The runner uses the DOM here; the model never sees it. Values are placeholders until the human pilot.
export const misTapP = (p) => (p.time.includes('hurry') ? 0.1 : 0.03)
const MS_PER_WORD = (p) => (p.reading.startsWith('reads') ? 250 : 80)

// What is at a point. The tap-accuracy measure, read just before the tap, because a tap can replace the screen.
export const hitAt = (page, x, y) => page.evaluate(([x, y]) => {
  const el = document.elementFromPoint(x, y)
  if (!el) return null
  const c = el.closest('button, a, label, textarea, input')
  const t = c ?? el
  const name = (t.getAttribute('aria-label') || t.getAttribute('placeholder') || t.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 80)
  return { tag: el.tagName.toLowerCase(), control: c ? c.tagName.toLowerCase() : null, disabled: !!c?.disabled, name, log: t.getAttribute('data-log') ?? el.closest('[data-log]')?.getAttribute('data-log') ?? null }
}, [x, y])

// Where a mis-tap lands: the middle of the nearest other tappable thing on screen.
export const nearestOther = (page, x, y) => page.evaluate(([x, y]) => {
  const here = document.elementFromPoint(x, y)?.closest('button, a, label, textarea')
  const list = [...document.querySelectorAll('button:not([disabled]), a, label, textarea')].filter((e) => e !== here).map((e) => {
    const r = e.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const top = document.elementFromPoint(cx, cy)
    return { cx, cy, on: r.width > 0 && cy >= 0 && cy < innerHeight && cx >= 0 && cx < innerWidth && !!top && (e === top || e.contains(top)), d: Math.hypot(cx - x, cy - y) }
  }).filter((c) => c.on).sort((a, b) => a.d - b.d)
  return list[0] ? { x: Math.round(list[0].cx), y: Math.round(list[0].cy) } : null
}, [x, y])

// A touch swipe, so the site's own scroll logging sees what a thumb would produce.
export async function swipe(page, cdp, dy) {
  const { width: w, height: h } = page.viewportSize()
  await cdp.send('Input.synthesizeScrollGesture', { x: w / 2, y: h / 2, yDistance: -dy, gestureSourceType: 'touch', speed: 1600 })
}
const scrollRoom = (page) => page.evaluate(() => {
  const s = document.querySelector('.ab-viewer.is-tall figure') ?? document.querySelector('.ab-screen, .ab-ps')
  return s ? s.scrollHeight - s.clientHeight - s.scrollTop : 0
})

// Look around first: to the bottom and back, before the first decision on a new screen. Reads-everything only.
export async function lookAround(page, cdp) {
  const room = await scrollRoom(page)
  if (room < 8) return false
  await swipe(page, cdp, room + 40)
  await page.waitForTimeout(500)
  await swipe(page, cdp, -(room + 40))
  await page.waitForTimeout(300)
  return true
}

// Reading pause: 400 ms + the words now on screen.
export async function readingPause(page, p) {
  const words = await page.evaluate(() => {
    let n = 0
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const range = document.createRange()
    while (w.nextNode()) {
      const t = w.currentNode.textContent.trim()
      if (!t) continue
      range.selectNodeContents(w.currentNode)
      const r = range.getBoundingClientRect()
      if (r.width && r.bottom > 0 && r.top < innerHeight) n += t.split(/\s+/).length
    }
    return n
  })
  const ms = 400 + words * MS_PER_WORD(p)
  await page.waitForTimeout(ms)
  return ms
}

// The participant's photos now in their slots.
export const takenPhotos = (page) => page.$$eval('button.ph.shot.taken', (x) => x.map((b) => b.getAttribute('aria-label')))

// Re-check: tap the photo just taken to view it full size. Worried only, probability 0.2, the caller rolls.
export async function recheck(page, label) {
  const b = page.locator(`button[aria-label="${label}"]`)
  await b.scrollIntoViewIfNeeded()
  const r = await b.boundingBox()
  if (!r) return null
  const at = { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }
  await page.touchscreen.tap(at.x, at.y)
  return at
}
