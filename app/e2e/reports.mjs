// Local prototype only. The report is stored on this device; no test-site services are used.
import { BASE } from './lib.mjs'
import { book } from './journeys.mjs'
import { toHub } from './journeys2.mjs'

const KEY = 'outrent.state.v52'
export const HANDOVER = {
  fit: { height: 176, leg: 81, hasProfile: true },
  book: { d: '7:40', c: '13:30', place: { d: 0, c: 0 }, pay: 'PayNow', ack: true },
  paid: true, now: 79 + 40 / 60, arrived: true,
  record: { shots: [], marks: [], saved: false },
  report: { reason: '', photos: [], details: '', sent: false },
}
export const REPORTED = { ...HANDOVER, now: 79 + 49 / 60,
  record: { shots: ['crank', 'saddle', 'drive'], marks: [], saved: true },
  report: { reason: 'Damaged', photos: ['drive'], details: '', sent: true },
}
const REPLY = 'Thanks for the photo. The scratch is on our record for this bike now, not yours. Enjoy the ride.'
const GENERIC_REPLY = 'Thanks for the report. It’s on our record for this bike now, not yours.'
export const seededUrl = (page, seed, suffix = '') => `${BASE}/${page}?seed=${encodeURIComponent(Buffer.from(JSON.stringify(seed)).toString('base64'))}${suffix}`

async function health(t, label) {
  const result = await t.p.evaluate(() => {
    const visible = (e) => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden'
    return {
      overflow: [document.documentElement, ...document.querySelectorAll('.frame, .frame-stage, main.screen')]
        .filter((e) => visible(e) && e.scrollWidth > e.clientWidth + 1).map((e) => e.className || e.tagName),
      broken: [...document.images].filter((e) => visible(e) && e.complete && !e.naturalWidth).map((e) => e.currentSrc),
    }
  })
  await t.chk(t.S(), `${label}: no horizontal overflow or broken images`, '{"overflow":[],"broken":[]}', JSON.stringify(result), { exact: true })
}

async function takePhotos(t, screenshots = false) {
  const { p } = t, s = t.S()
  if (screenshots) await t.shot('report-01-before-photos')
  await t.chk(s, 'Save disabled with 0 photos', 'true', String(await p.locator('.s11-save').isDisabled()), { exact: true })
  const parts = ['crank arm', 'saddle edge', 'drivetrain']
  for (let i = 0; i < parts.length; i++) {
    await t.tap(t.btn(`Take your photo of the ${parts[i]}`))
    await t.chk(s, `Save is ${i < 2 ? 'disabled' : 'enabled'} with ${i + 1} photos`, String(i < 2), String(await p.locator('.s11-save').isDisabled()), { exact: true })
  }
  await t.chk(s, 'No marking step after taking photos', '0', String(await p.getByRole('button', { name: /^Circle the/ }).count()), { exact: true })
  await t.chk(s, 'Daniel photos have no rings', '0', String(await p.locator('.shot .ring2').count()), { exact: true })
  await t.chk(s, 'Shop retains its 2 known-mark rings', '2', String(await p.locator('.pair figure:first-child .ring2.on').count()), { exact: true })
  await t.chk(s, 'No misleading no-marks line', 'No marks to record', await t.text(), { not: true })
  await t.chk(s, 'Drivetrain photo is timed 7:41', '25 Oct · 7:41', await t.text())
  if (screenshots) await t.shot('report-02-after-photos', '.reportrow')
}

async function reportAndSave(t, screenshots = false) {
  const { p } = t, s = t.S()
  await takePhotos(t, screenshots)
  await t.tap(p.locator('.reportrow'), { wait: 700 })
  await t.chk(s, 'Report form has its own URL state', 'form', new URL(p.url()).searchParams.get('report'), { exact: true })
  await t.chk(s, 'Four report reasons', 'Wrong item|Damaged|Not adjusted to my fit|Something else',
    (await p.getByRole('radio').evaluateAll((radios) => radios.map((r) => r.labels?.[0]?.textContent?.trim() || r.getAttribute('aria-label') || r.value))).join('|'), { exact: true })
  await t.tap(t.btn('Send to Timah Cycles', true), { wait: 600 })
  await t.chk(s, 'Missing reason gives an inline correction', 'Choose a reason before sending.', await p.getByRole('alert').innerText(), { exact: true })
  await t.chk(s, 'Missing reason focuses the first radio', 'Wrong item', await p.evaluate(() => document.activeElement?.value), { exact: true })
  await t.chk(s, 'Invalid submit is not stored as sent', 'false', String((await t.state()).report?.sent), { exact: true })
  // Native controls must be operable without a pointer.
  await p.getByRole('radio', { name: 'Damaged', exact: true }).focus()
  await p.keyboard.press('Space')
  await p.getByRole('checkbox', { name: 'Attach Drivetrain photo', exact: true }).check()
  if (screenshots) await t.shot('report-03-form')
  await t.tap(t.btn('Send to Timah Cycles', true), { wait: 700 })
  const sent = await t.text('.report-sent')
  await t.chk(s, 'Sent reference', 'R-10482-1', sent)
  await t.chk(s, 'Sent timestamp', '25 Oct · 7:46', sent)
  await t.chk(s, 'Reply destination is the booking', 'Timah Cycles replies to your booking', sent)
  await t.chk(s, 'Sent URL', 'sent', new URL(p.url()).searchParams.get('report'), { exact: true })
  await t.chk(s, 'Report stored once', 'true', String((await t.state()).report?.sent), { exact: true })
  if (screenshots) await t.shot('report-04-sent', '.report-sent')
  await t.tap(t.btn('Back to the hand-over record', true), { wait: 700 })
  await t.chk(s, 'Report link reflects the sent report', 'Report sent · 7:46', await t.text('.reportrow'))
  if (screenshots) await t.shot('report-05-link-sent', '.reportrow')
  await t.tap(p.locator('.s11-save'), { wait: t.reduced ? 600 : 2600 })
  await t.chk(s, 'Filed record mentions the report', '3 parts checked · 2 known marks · 1 problem reported', await t.text('.filed'))
  await t.chk(s, 'Record saved at 7:47', '25 Oct · 7:47', await t.text('.filed'))
  if (screenshots) await t.shot('report-06-filed-slip', '.filed')
  await t.go(s, 'Saved record returns to tracking', t.btn('Back to tracking', true), '10-delivery-tracking')
  await t.go(s, 'Tracking returns to the live booking', t.btn('Back', true), '09-trips')
  await t.chk(s, 'Saved booking remains visible before the ride', '1', String(await p.locator('article[aria-label="Booking OR-10482"]').count()), { exact: true })
  await t.chk(s, 'Viewing the booking preserves 7:47', '7:47', await t.text('.roothead'))
  await t.chk(s, 'Shop reply is not shown early', '0', String(await p.locator('.report9-reply').count()), { exact: true })
  await t.tap(t.btn('Wait until 7:49', true), { wait: 700 })
  await p.locator('.skip').waitFor({ state: 'detached', timeout: 10000 })
  await t.chk(s, 'Waiting reaches 7:49', '7:49', await t.text('.roothead'))
  await t.chk(s, 'Normal journey reaches the shop reply before riding', REPLY, await t.text('#handover-report'))
  await t.go(s, 'Reopen the filed record', t.btn('Open the hand-over record', true), '11-handover-check')
  await t.go(s, 'Ride and return', p.locator('.s11-save'), '12-rental-summary', { timeout: 10000 })
  await t.chk(s, 'Return names the scratch', 'scratch reported at hand-over', await t.text())
  await t.chk(s, 'Return carries the report reference', 'R-10482-1', await t.text())
  await t.chk(s, 'Return has no repair claim', 'fixed at hand-over', await t.text(), { not: true })
  await t.chk(s, 'Nothing charged for the scratch', 'nothing chargeable', await t.text())
  if (screenshots) await t.shot('report-08-return-check', '.backs')
  await t.go(s, 'Back to booking after the return', t.btn('Back to Bookings', true), '09-trips')
  await t.chk(s, 'Booking retains report reference', 'R-10482-1', await t.text('#handover-report'))
  await t.chk(s, 'Booking shows the 7:49 shop reply', '25 Oct · 7:49', await t.text('#handover-report'))
  await t.chk(s, 'Booking uses the approved reply', REPLY, await t.text('#handover-report'))
  if (screenshots) await t.shot('report-07-booking-report', '#handover-report')
  await health(t, 'Completed report journey')
}

export async function ER(t) {
  await t.start()
  if (!(await book(t))) return
  const s = t.S()
  await t.go(s, 'Confirmed booking', t.btn('See it in Bookings'), '09-trips', { timeout: 10000 })
  await t.go(s, 'Track the delivery', t.btn('Track delivery'), '10-delivery-tracking', { timeout: 10000 })
  await t.p.waitForFunction(() => !document.querySelector('.s10-go')?.disabled, null, { timeout: 16000 })
  await t.go(s, 'Start hand-over from tracking', t.btn('Start the hand-over check'), '11-handover-check')
  await reportAndSave(t, true)
  // Continue the same story through the weekly ride and the complete storage route.
  await t.go(s, 'Past rental', t.p.getByRole('button', { name: /Trek Marlin 7 · 25 Oct/ }), '12-rental-summary')
  await t.go(s, 'Weekly ride', t.btn('See the weekly ride'), '13-weekly-ride')
  await t.tap(t.btn('Set up every Saturday · S$45 a ride'), { wait: 2600 })
  await t.go(s, 'Back to Bookings', t.p.locator('.bar-top .back'), '09-trips')
  await toHub(t, 'home')
  await t.chk(s, 'Original report survives the storage route', 'true', String((await t.state()).report?.sent), { exact: true })
}

export async function ERr(t) {
  await t.start('10-delivery-tracking')
  await t.p.evaluate(([key, state]) => localStorage.setItem(key, JSON.stringify(state)), [KEY, HANDOVER])
  await t.p.reload(); await t.waitPage('10-delivery-tracking')
  await t.go(t.S(), 'Reduced-motion hand-over', t.btn('Start the hand-over check'), '11-handover-check')
  await reportAndSave(t)
}

// Explicitly selectable for refreshing the eight review images without repeating the storage route.
export async function ERshots(t) {
  await t.start('10-delivery-tracking')
  await t.p.evaluate(([key, state]) => localStorage.setItem(key, JSON.stringify(state)), [KEY, HANDOVER])
  await t.p.reload(); await t.waitPage('10-delivery-tracking')
  await t.go(t.S(), 'Open hand-over for review images', t.btn('Start the hand-over check'), '11-handover-check')
  await reportAndSave(t, true)
}

export async function ERstates(t) {
  const { p } = t
  await t.start('11-handover-check')
  // A draft must survive leaving the form and a full reload without becoming a sent report.
  const draft = { ...REPORTED, report: { reason: '', photos: [], details: '', sent: false }, record: { ...REPORTED.record, saved: false } }
  await p.evaluate(([key, state]) => localStorage.setItem(key, JSON.stringify(state)), [KEY, draft])
  await p.reload(); await t.waitPage('11-handover-check')
  await t.tap(p.locator('.reportrow'), { wait: 700 })
  await p.getByRole('radio', { name: 'Damaged', exact: true }).check()
  await p.getByRole('checkbox', { name: 'Attach Drivetrain photo', exact: true }).check()
  const longDetails = 'Fresh cosmetic scratch beside the chain. ' + 'chainstay'.repeat(45)
  await p.locator('textarea').fill(longDetails)
  await p.reload(); await t.waitPage('11-handover-check')
  await t.chk(t.S(), 'Draft reason survives reload', 'true', String(await p.getByRole('radio', { name: 'Damaged', exact: true }).isChecked()), { exact: true })
  await t.chk(t.S(), 'Draft photo survives reload', 'true', String(await p.getByRole('checkbox', { name: 'Attach Drivetrain photo', exact: true }).isChecked()), { exact: true })
  await t.chk(t.S(), 'Long optional details survive reload', longDetails, await p.locator('textarea').inputValue(), { exact: true })
  await t.chk(t.S(), 'Draft is not submitted by reload', 'false', String((await t.state()).report?.sent), { exact: true })
  await t.tap(t.btn('Back to the hand-over record', true), { wait: 700 })
  await t.chk(t.S(), 'Draft does not label the record as sent', 'Report sent', await t.text('.reportrow'), { not: true })
  await t.tap(p.locator('.reportrow'), { wait: 700 })
  await t.chk(t.S(), 'Reopening retains optional draft details', longDetails, await p.locator('textarea').inputValue(), { exact: true })
  await p.setViewportSize({ width: 375, height: 852 }); await health(t, '375px long draft')
  await t.tap(t.btn('Send to Timah Cycles', true), { wait: 700 })
  await p.reload(); await t.waitPage('11-handover-check')
  await t.chk(t.S(), 'Sent screen survives reload', 'R-10482-1', await t.text('.report-sent'))
  await t.chk(t.S(), 'Sent report retains attached evidence', 'drive', (await t.state()).report?.photos?.join(','), { exact: true })

  for (const width of [375, 393]) {
    await p.setViewportSize({ width, height: 852 })
    for (const page of ['11-handover-check', '09-trips', '12-rental-summary']) {
      await p.goto(seededUrl(page, { ...REPORTED, report: { ...REPORTED.report, details: longDetails } }))
      await t.waitPage(page)
      const content = await t.text()
      await t.chk(t.S(), `${width}px ${page} seeded report`, page === '11-handover-check' ? 'Report sent · 7:46' : 'R-10482-1', content)
      await health(t, `${width}px ${page}`)
      await t.chk(t.S(), `${page} never claims the chain was repaired`, '7:52', content, { not: true })
    }
    await p.goto(seededUrl('11-handover-check', { ...REPORTED, report: HANDOVER.report }))
    await t.waitPage('11-handover-check')
    await t.chk(t.S(), `${width}px no-report filed variant`, '3 parts checked · 2 known marks · nothing new', await t.text('.filed'))
    await health(t, `${width}px no-report slip`)
  }
  await p.goto(seededUrl('09-trips', { ...REPORTED, report: HANDOVER.report }))
  await t.waitPage('09-trips')
  await t.chk(t.S(), 'No-report booking invents no report', '0', String(await p.locator('#handover-report').count()), { exact: true })
  await p.goto(seededUrl('12-rental-summary', { ...REPORTED, report: HANDOVER.report }))
  await t.waitPage('12-rental-summary')
  await t.chk(t.S(), 'No-report return invents no report reference', 'R-10482-1', await t.text(), { not: true })
}

export async function ERoffset(t) {
  const { p } = t, s = t.S()
  const early = { ...HANDOVER, now: 79 + 20 / 60, book: { ...HANDOVER.book, d: '7:20' } }
  await t.start('10-delivery-tracking')
  await p.evaluate(([key, state]) => localStorage.setItem(key, JSON.stringify(state)), [KEY, early])
  await p.reload(); await t.waitPage('10-delivery-tracking')
  await t.go(s, 'Enter 11 from tracking', t.btn('Start the hand-over check'), '11-handover-check')
  await t.tap(p.locator('.reportrow'), { wait: 700 })
  await t.tap(t.btn('Back to the hand-over record', true), { wait: 700 })
  await t.chk(s, 'Back from draft returns to record URL', 'null', String(new URL(p.url()).searchParams.get('report')), { exact: true })
  await t.go(s, 'Record Back returns directly to tracking', t.btn('Back to tracking', true), '10-delivery-tracking')
  await t.go(s, 'Re-enter early hand-over', t.btn('Start the hand-over check'), '11-handover-check')
  for (const part of ['crank arm', 'saddle edge', 'drivetrain']) await t.tap(t.btn(`Take your photo of the ${part}`))
  await t.chk(s, 'Early drivetrain photo keeps the one-minute offset', '25 Oct · 7:21', await t.text())
  await t.tap(p.locator('.reportrow'), { wait: 700 })
  await p.getByRole('radio', { name: 'Damaged', exact: true }).check()
  await p.getByRole('checkbox', { name: 'Attach Drivetrain photo', exact: true }).check()
  await t.tap(t.btn('Send to Timah Cycles', true), { wait: 700 })
  await t.chk(s, 'Early report uses 7:26', '25 Oct · 7:26', await t.text('.report-sent'))
  await t.tap(t.btn('Back to the hand-over record', true), { wait: 700 })
  await t.chk(s, 'Early report link uses 7:26', 'Report sent · 7:26', await t.text('.reportrow'))
  await t.tap(p.locator('.s11-save'), { wait: 600 })
  await t.chk(s, 'Early record uses 7:27', '25 Oct · 7:27', await t.text('.filed'))
  await t.go(s, 'Early rental summary', p.locator('.s11-save'), '12-rental-summary', { timeout: 6000 })
  await t.go(s, 'Booking keeps the early timeline', t.btn('Back to Bookings', true), '09-trips')
  await t.chk(s, 'Early booking report uses 7:26', '25 Oct · 7:26', await t.text('#handover-report'))
  await t.chk(s, 'Early booking reply uses 7:29', '25 Oct · 7:29', await t.text('#handover-report'))
  await t.chk(s, 'No default reply time on the early booking', '7:49', await t.text('#handover-report'), { not: true })
  const closed = { ...REPORTED, closed: true, now: 86 + 5 / 60, report: HANDOVER.report }
  await p.goto(seededUrl('11-handover-check', closed, '&report=form')); await t.waitPage('11-handover-check')
  await t.chk(s, 'Closed no-report record cannot open a retroactive report form', '0', String(await p.locator('#handover-report-form').count()), { exact: true })
  await t.chk(s, 'Closed no-report record hides the reporting link', '0', String(await p.locator('.reportrow').count()), { exact: true })
  await p.locator('.s11-save').click(); await p.waitForTimeout(100)
  await t.chk(s, 'Closed record opens summary without replaying the ride', '0', String(await p.locator('.skip').count()), { exact: true })
  await t.waitPage('12-rental-summary')
  await t.chk(s, 'Closed record lands on summary', '12-rental-summary', await t.page(), { exact: true })
}

export async function ERalternate(t) {
  const { p } = t, s = t.S()
  const wrongItem = { ...REPORTED, report: { ...REPORTED.report, reason: 'Wrong item' } }
  await p.goto(seededUrl('09-trips', wrongItem)); await t.waitPage('09-trips')
  await t.chk(s, 'Other reasons receive the general booking reply', GENERIC_REPLY, await t.text('#handover-report'))
  await t.chk(s, 'Wrong item gets no fabricated scratch reply', 'Thanks for the photo. The scratch', await t.text('#handover-report'), { not: true })
  await p.goto(seededUrl('12-rental-summary', wrongItem)); await t.waitPage('12-rental-summary')
  await t.chk(s, 'Other reasons keep the general reply at return', GENERIC_REPLY, await t.text())
  await t.chk(s, 'Wrong item gets no scratch liability outcome', 'scratch reported at hand-over', await t.text(), { not: true })
}
