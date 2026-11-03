// Focused local regression for the approved scratch photo, report evidence and reply timing.
// Run separately from the earlier journeys; old results are never written by this script.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = path.resolve(process.env.SCRATCH_REVIEW_OUT || fileURLToPath(new URL('./out/scratch-photo-review/', import.meta.url)))
if (!/^D:[/\\]/i.test(OUT)) throw new Error('Scratch review output must stay on D:')
fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true })
fs.mkdirSync(path.join(OUT, 'tmp'), { recursive: true })
process.env.E2E_OUT = OUT.replaceAll('\\', '/') + '/'
process.env.TEMP = process.env.TMP = path.join(OUT, 'tmp')
const { BASE, launch } = await import('./lib.mjs')
const { HANDOVER, REPORTED, seededUrl } = await import('./reports.mjs')
if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(BASE).hostname)) throw new Error('Use the local prototype only')

const SCRATCH = '/img/11-mine-drive-scratch.webp'
const SCRATCH_REPLY = 'Thanks for the photo. The scratch is on our record for this bike now, not yours. Enjoy the ride.'
const GENERIC_REPLY = 'Thanks for the report. It’s on our record for this bike now, not yours.'
const EMPTY_REPORT = { reason: '', photos: [], details: '', sent: false }
const SHOTS = { shots: ['crank', 'saddle', 'drive'], marks: [], saved: false }
const RESULTS = [], ERRORS = []
const casePrefixes = (process.env.SCRATCH_CASES || '').split(',').filter(Boolean)
const resultName = casePrefixes.length ? 'results-recheck.json' : 'results.json'
let currentCase = ''
const norm = (v) => String(v ?? '').replace(/\s+/g, ' ').trim()
const check = (name, pass, actual = '') => {
  RESULTS.push({ case: currentCase, name, pass: !!pass, actual: norm(actual).slice(0, 600) })
  console.log(pass ? 'PASS' : 'FAIL', currentCase, '|', name, '|', norm(actual).slice(0, 180))
}
const hm = (text) => { const [h, m] = text.split(':').map(Number); return h + m / 60 }
const at = (text) => 72 + hm(text)
const time = (hours) => { const minutes = Math.round((hours % 24) * 60); return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}` }
const stateAt = (now, report = REPORTED.report, delivery = '7:40') => ({
  ...REPORTED, now, closed: false, weekly: false,
  book: { ...HANDOVER.book, d: delivery },
  report: { ...report },
})

const browser = await launch()
try {
  for (const width of [375, 393]) {
    const context = await browser.newContext({ viewport: { width, height: 852 }, deviceScaleFactor: 1, hasTouch: true, reducedMotion: 'reduce' })
    const p = await context.newPage()
    p.on('console', (m) => { if (m.type() === 'error') ERRORS.push(`${currentCase}: ${m.text()}`) })
    p.on('pageerror', (e) => ERRORS.push(`${currentCase}: ${e.message}`))
    p.on('response', (r) => { if (r.status() >= 400) ERRORS.push(`${currentCase}: HTTP ${r.status()} ${r.url()}`) })
    p.on('requestfailed', (r) => { if (!r.failure()?.errorText.includes('ERR_ABORTED')) ERRORS.push(`${currentCase}: ${r.failure()?.errorText} ${r.url()}`) })

    const open = async (page, seed, suffix = '') => {
      await p.goto(seededUrl(page, seed, suffix), { waitUntil: 'domcontentloaded' })
      await p.waitForSelector(`.frame[data-page="${page}"]`)
      await p.waitForTimeout(550) // The app's existing navigation double-tap guard is 450 ms.
    }
    const click = async (locator) => { await locator.click(); await p.waitForTimeout(550) }
    const shot = async (name, selector) => {
      if (selector) await p.locator(selector).evaluate((element) => {
        const scroller = element.closest('main.screen')
        if (!scroller) return
        const box = element.getBoundingClientRect(), frame = scroller.getBoundingClientRect()
        // Keep the subject above the fixed action/tab bar; scrollIntoView cannot account for overlays.
        scroller.scrollTo({ top: scroller.scrollTop + box.top - frame.top - Math.max(20, (frame.height - 120 - box.height) / 2), behavior: 'instant' })
      })
      await p.waitForTimeout(150)
      await p.screenshot({ path: path.join(OUT, 'shots', `${width}-${name}.png`), scale: 'css' })
      if (name === '11-before-report' || name === '11-after-report') {
        await p.locator('section[aria-label="Drivetrain"] figure:last-child').screenshot({ path: path.join(OUT, 'shots', `${width}-${name}-slot.png`), scale: 'css' })
      }
    }
    const health = async () => {
      const issues = await p.evaluate(() => ({
        overflow: [document.documentElement, ...document.querySelectorAll('.frame, .frame-stage, main.screen')]
          .filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => `${e.className || e.tagName}: ${e.scrollWidth}/${e.clientWidth}`),
        broken: [...document.images].filter((e) => e.complete && !e.naturalWidth).map((e) => e.currentSrc),
      }))
      check('No horizontal overflow or broken images', !issues.overflow.length && !issues.broken.length, JSON.stringify(issues))
    }
    const run = async (name, fn) => {
      if (casePrefixes.length && !casePrefixes.some((prefix) => name.startsWith(prefix))) return
      currentCase = `${width}px ${name}`
      try { await fn(); await health() }
      catch (e) {
        check('Case completes without exception', false, e.message)
        await p.screenshot({ path: path.join(OUT, 'shots', `${width}-${name.replace(/[^a-z0-9]+/gi, '-')}-failure.png`), scale: 'css' }).catch(() => {})
      }
      fs.writeFileSync(path.join(OUT, resultName), JSON.stringify({ results: RESULTS, errors: ERRORS }, null, 2))
    }
    const evidence = async (scope, reported) => {
      const photo = scope.locator('[data-report-photo="drive"]')
      check('Exactly one drivetrain evidence photo', await photo.count() === 1, await photo.count())
      if (!(await photo.count())) return
      const image = photo.locator('img')
      check('Approved scratch photo is reused', (await image.getAttribute('src')).includes(SCRATCH), await image.getAttribute('src'))
      check('Evidence status follows the sent attachment', await photo.getAttribute('data-reported') === String(reported), await photo.getAttribute('data-reported'))
      const ring = photo.locator('.ring2.on')
      check(reported ? 'Reported evidence has one ring' : 'Unreported evidence has no ring', await ring.count() === (reported ? 1 : 0), await ring.count())
      if (reported && await ring.count()) {
        const mark = await ring.evaluate((e) => ({ left: e.style.left, top: e.style.top, border: getComputedStyle(e).borderTopColor }))
        check('White ring is at 34%, 52%', mark.left === '34%' && mark.top === '52%' && mark.border === 'rgb(255, 255, 255)', JSON.stringify(mark))
      }
    }
    const bookingPresent = async (expectedClock) => {
      const booking = p.locator('article[aria-label="Booking OR-10482"]')
      check('Saved booking remains visible', await booking.count() === 1, await booking.count())
      check('No false empty-booking message', !(await p.locator('.frame-stage').innerText()).includes('Nothing booked.'))
      check('Opening 09 preserves the supplied clock', norm(await p.locator('.status .num').textContent()) === expectedClock, await p.locator('.status .num').textContent())
      if (await booking.count()) {
        check('Booking has a stage description and primary action', !!norm(await booking.locator('.board-k').innerText()) && !!norm(await booking.locator('.cta').innerText()))
      }
    }
    const returnPhotos = async () => {
      const names = await p.locator('.backs img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')))
      check('12 keeps its three original return photos', names.length === 3 && ['crank', 'saddle', 'drive'].every((part, i) => names[i]?.includes(`12-direction-r-${part}`)), JSON.stringify(names))
      check('12 has no replacement scratch asset in the return photos', names.every((src) => !src.includes('11-mine-drive-scratch')))
    }

    await run('report-photo-flow', async () => {
      const draft = { ...HANDOVER, record: SHOTS, report: EMPTY_REPORT }
      await open('11-handover-check', draft)
      const drive = p.locator('section[aria-label="Drivetrain"]')
      const source = await drive.locator('.shot img').getAttribute('src')
      check('11 starts with the approved scratch photo', source.includes(SCRATCH), source)
      check('No Daniel-photo rings before a report', await p.locator('.shot .ring2').count() === 0)
      check('Shop retains its two known-mark rings', await p.locator('.pair figure:first-child .ring2.on').count() === 2)
      await shot('11-before-report', 'section[aria-label="Drivetrain"]')
      await click(p.locator('.reportrow'))
      const thumb = p.locator('.report-thumb').filter({ has: p.getByRole('checkbox', { name: 'Attach Drivetrain photo', exact: true }) })
      check('Attachment thumb uses the same approved photo', (await thumb.locator('img').getAttribute('src')).includes(SCRATCH))
      await p.getByRole('radio', { name: 'Damaged', exact: true }).check()
      await p.getByRole('checkbox', { name: 'Attach Drivetrain photo', exact: true }).check()
      check('Selecting a draft attachment does not create a report ring', await thumb.locator('.ring2.on').count() === 0)
      await click(p.getByRole('button', { name: 'Send to Timah Cycles', exact: true }))
      await evidence(p.locator('.report-sent'), true)
      await shot('11-sent-evidence', '.report-sent')
      await click(p.getByRole('button', { name: 'Back to the hand-over record', exact: true }).first())
      await evidence(drive.locator('.shot'), true)
      check('Drivetrain slot says Reported at 7:46', /Reported\s*·\s*7:46/.test(await drive.innerText()), await drive.innerText())
      check('Other Daniel photos remain unringed', await p.locator('section[aria-label="Crank arm"] .shot .ring2, section[aria-label="Saddle edge"] .shot .ring2').count() === 0)
      await shot('11-after-report', 'section[aria-label="Drivetrain"]')
      await click(p.locator('.s11-save'))
      await click(p.getByRole('button', { name: 'See all photos', exact: true }))
      await evidence(drive.locator('.shot'), true)
    })

    for (const delivery of ['7:40', '7:20']) {
      const start = at(delivery)
      for (const minute of [7, 9]) await run(`booking-${delivery}-plus-${minute}`, async () => {
        await open('09-trips', stateAt(start + minute / 60, REPORTED.report, delivery))
        await bookingPresent(time(start + minute / 60))
        const section = p.locator('#handover-report')
        check('Sent time follows the delivery slot', (await section.innerText()).includes(`25 Oct · ${time(start + 6 / 60)}`))
        if (minute === 7) {
          check('At +7 minutes the report is still pending', await section.locator('.report9-reply').count() === 0 && (await section.innerText()).includes('Timah Cycles replies to your booking'))
          await shot(`09-booking-${delivery.replace(':', '')}-saved`, 'article[aria-label="Booking OR-10482"]')
          await click(p.getByRole('button', { name: `Wait until ${time(start + 9 / 60)}`, exact: true }))
          await p.locator('.skip').waitFor({ state: 'detached', timeout: 10000 })
          await bookingPresent(time(start + 9 / 60))
          check('Waiting in the booking reveals the real report reply', norm(await section.locator('blockquote').innerText()) === SCRATCH_REPLY)
        } else {
          check('At +9 minutes the approved scratch reply appears', norm(await section.locator('blockquote').innerText()) === SCRATCH_REPLY)
          check('Reply time follows the delivery slot', (await section.innerText()).includes(`25 Oct · ${time(start + 9 / 60)}`))
          await evidence(section, true)
          await shot(`09-reply-${delivery.replace(':', '')}`, '#handover-report')
        }
      })
      for (const clock of ['7:59', '8:00', '8:01']) await run(`ride-boundary-${delivery}-${clock}`, async () => {
        await open('09-trips', stateAt(at(clock), REPORTED.report, delivery))
        await bookingPresent(clock)
        const board = await p.locator('article[aria-label="Booking OR-10482"] .board-k').innerText()
        check('The course changes stage at 8:00 for either delivery', clock === '7:59' ? board.toLowerCase().includes('ride starts in') : board.toLowerCase().includes('collected at'), board)
      })
      if (delivery === '7:20') await run('early-reported-photo-time', async () => {
        await open('11-handover-check', { ...stateAt(start + 6 / 60, REPORTED.report, delivery), record: SHOTS })
        const drive = p.locator('section[aria-label="Drivetrain"]')
        await evidence(drive.locator('.shot'), true)
        check('Early photo slot says Reported at 7:26', /Reported\s*·\s*7:26/.test(await drive.innerText()), await drive.innerText())
        await click(p.locator('.reportrow'))
        await evidence(p.locator('.report-sent'), true)
        check('Early sent receipt keeps 7:26', (await p.locator('.report-sent').innerText()).includes('25 Oct · 7:26'))
      })
    }

    for (const sent of [false, true]) await run(`saved-without-payment-${sent ? 'reported' : 'no-report'}`, async () => {
      const savedWithoutPayment = {
        ...stateAt(at('7:47'), sent ? REPORTED.report : EMPTY_REPORT),
        paid: false, arrived: false,
        record: { ...SHOTS, saved: true },
      }
      // Seed URLs intentionally never persist. Use the normal storage path here so this also catches
      // any attempt to fill in the missing payment flag while deriving the booking view.
      await p.evaluate((state) => localStorage.setItem('outrent.state.v52', JSON.stringify(state)), savedWithoutPayment)
      await p.goto(`${BASE}/09-trips`, { waitUntil: 'domcontentloaded' })
      await p.waitForSelector('.frame[data-page="09-trips"]')
      await p.waitForTimeout(550)
      await bookingPresent('7:47')
      const booking = p.locator('article[aria-label="Booking OR-10482"]')
      const content = await p.locator('.frame-stage').innerText()
      check('Saved evidence keeps the hand-over record accessible', await p.locator('.record9-link').count() === 1)
      check('Missing payment evidence never claims S$50 paid or a held deposit', !/S\$50 paid|S\$150 deposit held/.test(content))
      if (await booking.count()) {
        check('Booking states that payment details are unavailable', (await booking.locator('.bk-pay').innerText()).includes('Payment details unavailable'))
      }
      const stored = await p.evaluate(() => JSON.parse(localStorage.getItem('outrent.state.v52') || '{}'))
      check('Viewing the booking does not change paid:false', stored.paid === false, String(stored.paid))
      check('Viewing the booking preserves the saved record', stored.record?.saved === true, String(stored.record?.saved))
      if (!sent) await shot('09-saved-without-payment', 'article[aria-label="Booking OR-10482"]')
    })

    const alternatives = [
      { reason: 'Wrong item', photos: [] },
      { reason: 'Not adjusted to my fit', photos: ['crank'] },
      { reason: 'Something else', photos: ['drive'] },
      { reason: 'Damaged', photos: [] },
      { reason: 'Damaged', photos: ['saddle'] },
    ]
    for (const [i, choice] of alternatives.entries()) await run(`generic-${i + 1}`, async () => {
      const report = { ...choice, details: '', sent: true }
      await open('09-trips', stateAt(at('7:47'), report))
      await bookingPresent('7:47')
      check('Generic report is pending at +7', await p.locator('#handover-report .report9-reply').count() === 0)
      await open('09-trips', stateAt(at('7:49'), report))
      await bookingPresent('7:49')
      const section = p.locator('#handover-report')
      check('Every other sent report receives the generic reply', norm(await section.locator('blockquote').innerText()) === GENERIC_REPLY)
      check('Generic reply is timed +9', (await section.innerText()).includes('25 Oct · 7:49'))
      check('Generic reply invents no scratch', !/scratch/i.test(await section.locator('.report9-reply').innerText()))
      if (i === 0 || i === 2) await shot(`09-generic-reply-${i + 1}`, '#handover-report')
      const attached = await section.locator('[data-report-photo]').evaluateAll((photos) => photos.map((photo) => photo.getAttribute('data-report-photo')).sort())
      check('Only selected evidence is attached on 09', JSON.stringify(attached) === JSON.stringify([...choice.photos].sort()), attached.join(','))
      if (choice.photos.includes('drive')) await evidence(section, true)
      await open('11-handover-check', { ...stateAt(at('7:49'), report), record: SHOTS })
      check('Drivetrain ring requires a sent drivetrain attachment', await p.locator('section[aria-label="Drivetrain"] .shot .ring2.on').count() === (choice.photos.includes('drive') ? 1 : 0))
      await open('12-rental-summary', { ...stateAt(at('14:05'), report), closed: true })
      const returned = (await p.locator('.return12').allTextContents()).join(' ')
      check('12 uses the same generic reply', returned.includes(GENERIC_REPLY), returned)
      check('12 does not call the generic report a scratch', !/scratch/i.test(returned))
      await returnPhotos()
      if (i === 0 || i === 2) await shot(`12-generic-reply-${i + 1}`, '.backs')
    })

    await run('scratch-return', async () => {
      await open('12-rental-summary', { ...REPORTED, now: at('14:05'), closed: true })
      check('Approved scratch return wording remains', (await p.locator('.return12').innerText()).includes('scratch reported at hand-over'))
      await returnPhotos()
      await shot('12-original-return-photos', '.backs')
    })
    await context.close()
  }
} finally { await browser.close() }
currentCase = 'All focused cases'
check('No console, page, HTTP or request errors', ERRORS.length === 0, ERRORS.join(' | '))
const failed = RESULTS.filter((r) => !r.pass)
fs.writeFileSync(path.join(OUT, resultName), JSON.stringify({ results: RESULTS, errors: ERRORS }, null, 2))
fs.writeFileSync(path.join(OUT, 'SUMMARY.md'), `# Scratch photo regression\n\n${RESULTS.length - failed.length}/${RESULTS.length} checks passed at 375 and 393 × 852.\n\n${failed.length ? failed.map((r) => `- ${r.case}: ${r.name} — ${r.actual}`).join('\n') : 'No failures.'}\n\nScreenshots are in shots/. Existing report-journey and crawl results are unchanged.\n`)
console.log(`Scratch review: ${RESULTS.length - failed.length}/${RESULTS.length}; output ${OUT}`)
if (failed.length) process.exitCode = 1
