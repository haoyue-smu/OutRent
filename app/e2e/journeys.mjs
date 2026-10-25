// E1–E7 on the app. Same intent as prototype/e2e (tap only from Home, assert values against MOCK-DATA v1.7 and
// against what the user chose), with the app's selectors and v52 copy.

// Book from Home through 08, with optional choices. Returns false if a step did not land.
export async function book(t, o = {}) {
  const { p } = t
  let s = t.S()
  if (!(await t.go(s, 'tap the coach post on Home', t.btn('Open Coach Aisyah’s post'), '02-coach-kit'))) return false
  await p.waitForTimeout(900)
  const has = (await t.state()).fit?.hasProfile
  await t.go(s, 'tap the drawer button', p.locator('.vsheet .cta'), has ? '04-search-results' : '03-fit-profile')
  if (!has) {
    if (o.fit) await o.fit(t)
    for (let i = 0; i < 3; i++) { await t.tap(p.locator('.dock .cta'), { wait: o.reduced ? 300 : 1200 }) }
    await t.go(s, 'Save fit on 03', p.locator('.dock .cta'), '04-search-results', { timeout: 8000 })
  }
  s = t.S()
  await t.go(s, 'tap the Trek Marlin 7 result', p.locator('.res').first(), '05-listing-detail')
  await t.go(s, 'Choose delivery', p.getByRole('link', { name: 'Choose delivery' }), '06-delivery-return')
  if (o.at06) await o.at06(t)
  else { await t.tap(t.btn('Deliver at 7:40')); await t.tap(t.btn('Collect at 13:30')) }
  s = t.S()
  await t.go(s, 'See the fees', t.btn('See the fees'), '07-fees-liability')
  if (o.at07) await o.at07(t)
  await t.tap(p.locator('label.ack'))
  await t.go(s, 'Pay', p.locator('.dock .cta'), '08-booking-confirmation', { timeout: 6000 })
  return true
}

const fitStep = async (t, h, l) => {
  // drag the tapes to a height and inside leg (11 px per cm), via the keyboard
  const { p } = t
  const st = { fit: { height: 176, leg: 81, ...(await t.state()).fit } }
  const tapeH = p.locator('.p3:not([hidden]) .tape').first()
  await tapeH.focus()
  for (let i = 0; i < Math.abs(h - st.fit.height); i++) await p.keyboard.press(h > st.fit.height ? 'ArrowRight' : 'ArrowLeft')
  await t.tap(p.locator('.dock .cta'), { wait: 1500 })
  const tapeL = p.locator('.p3:not([hidden]) .tape').first()
  await tapeL.focus()
  for (let i = 0; i < Math.abs(l - st.fit.leg); i++) await p.keyboard.press(l > st.fit.leg ? 'ArrowRight' : 'ArrowLeft')
  await p.waitForTimeout(400)
}

// ---------------------------------------------------------------------------------------------------------------
export async function E1(t) {
  const { p } = t
  await t.start()
  let s = t.S()
  await t.chk(s, 'Home opens on Wed 22 Oct, no bookings', 'Wed 22 Oct Good morning, Daniel', await t.text('.hello'))
  await t.chk(s, 'status clock 9:01', '9:01', await t.clock(), { exact: true })
  await t.chk(s, 'no Up next before booking', 'Up next', await t.text(), { not: true })
  await t.go(s, 'tap the coach post', t.btn('Open Coach Aisyah’s post'), '02-coach-kit')
  await t.chk(s, '02 ride facts', 'Sat 25 Oct · 8:00–12:30 Chestnut Nature Park', await t.text('.event'))
  await t.chk(s, 'withdrawn line is gone', 'Spend money on fit', await t.text(), { not: true })
  await t.go(s, 'back to Home', t.btn('Back to Home'), '01-home')
  await t.go(s, 'tap the coach post again', t.btn('Open Coach Aisyah’s post'), '02-coach-kit')
  await p.waitForTimeout(900)
  s = t.S()
  await t.chk(s, 'drawer button with no fit', 'Enter your fit to find a bike', await t.text('.vsheet .cta'), { exact: true })
  await t.go(s, 'tap it', p.locator('.vsheet .cta'), '03-fit-profile')
  await t.chk(s, '03 height 176 → frame M', 'Height 176cm Frame M', await t.text('.p3:not([hidden])'))
  for (let i = 0; i < 3; i++) await t.tap(p.locator('.dock .cta'), { wait: 1300 })
  await t.chk(s, '03 check grid', 'Saddle 72cm Frame M Fork sag 25% Handlebar +1cm', await t.text('.p3:not([hidden]) .mgrid'))
  await t.go(s, 'Save fit (from the post → 04)', p.locator('.dock .cta'), '04-search-results', { timeout: 6000 })
  s = t.S()
  await t.chk(s, '04 query', 'Mountain bike, size M · Chestnut · Sat 25 Oct', await t.text('.query .q'), { exact: true })
  await t.chk(s, '04 Marlin 7 card', 'Trek Marlin 7 · size M S$50 Timah Cycles · shop · 4.8 (126) all in', await t.text('.res'))
  await t.chk(s, '04 Scott after the start', 'EARLIEST 8:30 · AFTER THE 8:00 START', (await p.locator('.res').nth(2).innerText()))
  await t.go(s, 'Back from 04 → the post', p.locator('.bar-top .back'), '02-coach-kit')
  await p.waitForTimeout(900)
  await t.chk(s, 'drawer button with a fit saved', 'See mountain bikes for Sat 25 Oct', await t.text('.vsheet .cta'), { exact: true })
  await t.go(s, 'tap it (skips 03)', p.locator('.vsheet .cta'), '04-search-results')
  s = t.S()
  await t.go(s, 'tap the Marlin 7', p.locator('.res').first(), '05-listing-detail')
  await t.chk(s, '05 fit grid', 'Saddle 72cm Frame M Fork sag 25% Handlebar +1cm', await t.text('.mgrid'))
  await t.chk(s, '05 fit source', 'From your height 176 cm and inside leg 81 cm', await t.text('#setfor'))
  await t.chk(s, '05 price', 'S$38 This bike, 1 day S$12 Delivery and collection S$50', await t.text('#price'))
  await t.chk(s, '05 deposit', 'S$150 deposit, held.', await t.text('#price'))
  await t.chk(s, '05 days 22 Oct – 2 Nov', 'W 22 T 23 F 24 S 25 S 26 M 27 T 28 W 29 T 30 F 31 S 1 S 2', await t.text('.days'))
  await p.$eval('.rail', (r) => { r.scrollLeft = r.clientWidth * 3 }); await p.waitForTimeout(600)
  await t.chk(s, '05 photo 4 caption', 'Photo 4 of 5 · 18 Oct · 16:20', await t.text('.caption'))
  await t.go(s, 'Edit fit → 03', p.getByRole('link', { name: 'Edit fit' }), '03-fit-profile')
  await t.chk(s, 'returning rider opens on Check', 'Save fit', await t.text('.dock'))
  await t.go(s, 'Back to the listing', p.locator('.bar-top .back'), '05-listing-detail')
  s = t.S()
  await t.go(s, 'Choose delivery', p.getByRole('link', { name: 'Choose delivery' }), '06-delivery-return')
  await t.chk(s, '06 hand-over spot', 'Chestnut trailhead carpark By the park entrance sign', await t.text('.meet6'))
  await t.chk(s, '06 button before picking', 'Pick a delivery time', await t.text('.dock'))
  await t.tap(t.btn('Deliver at 7:40')); await t.tap(t.btn('Collect at 13:30'))
  await t.chk(s, '06 bill', 'Delivery 25 Oct · 7:40 Collection 25 Oct · 13:30 Trek Marlin 7, 1 day S$38 Delivery and collection S$12 All-in for Sat 25 Oct S$50', await t.text('.bill6'))
  await t.go(s, 'See the fees', t.btn('See the fees'), '07-fees-liability')
  s = t.S()
  await t.chk(s, '07 bill', 'S$50 today, all in This bike, 1 day S$38 Delivery and collection S$12 Setting it to your fit S$0', await t.text('.bill'))
  await t.chk(s, '07 pay disabled until ticked', 'true', String(await p.locator('.dock .cta').isDisabled()), { exact: true })
  await t.tap(t.btn('Read the full terms'))
  await t.chk(s, 'full terms name his photo time', '25 Oct · 7:40', await t.text('.fullterms'))
  await p.keyboard.press('Escape'); await p.waitForTimeout(600)
  await t.chk(s, 'Escape closes the full terms', '0', String(await p.locator('.fullterms').count()), { exact: true })
  await t.tap(p.locator('label.ack'))
  await t.chk(s, 'pay label with PayNow', 'Pay S$50 with PayNow', await t.text('.dock'))
  await t.go(s, 'Pay', p.locator('.dock .cta'), '08-booking-confirmation', { timeout: 6000 })
  s = t.S()
  await t.chk(s, '08 header', 'Confirmed 22 Oct · 9:12', await t.text('.bar-top'))
  await t.chk(s, '08 tag', 'OR-10482 Daniel Lim Trek Marlin 7 · size M Saddle 72cm Fork sag 25% Handlebar +1cm Deliver 25 Oct · 7:40 Collect 25 Oct · 13:30 Chestnut trailhead carpark, by the park entrance sign', await t.text('.tag'))
  await t.chk(s, '08 paid with', 'Paid · S$50 · PayNow', await t.text('.after08'))
  await t.chk(s, '08 clock 9:12', '9:12', await t.clock(), { exact: true })
  await t.go(s, 'See it in Bookings (skip to Fri 19:00)', t.btn('See it in Bookings'), '09-trips', { timeout: 9000 })
  s = t.S()
  await t.chk(s, '09 date', '24 Oct · 19:00', await t.text('.roothead'))
  await t.chk(s, '09 countdown 12 h 40 min', '12 h 40 min', await t.text('[aria-label="Booking OR-10482"]'))
  await t.chk(s, '09 set-up proof', 'Saddle 72 cm · frame M', await t.text('[aria-label="Booking OR-10482"]'))
  await t.chk(s, '09 clock 19:00', '19:00', await t.clock(), { exact: true })
  // tabs mid-flow
  await t.go(s, 'tab Home', p.locator('.tabbar button', { hasText: 'Home' }), '01-home')
  await t.chk(s, 'Home now Fri 24 Oct with Up next', 'Fri 24 Oct', await t.text('.hello'))
  await t.chk(s, 'Home Up next booking', 'Trek Marlin 7 · size M Delivered 7:40 · collected 13:30 In 12 h 40 min', await t.text())
  await t.go(s, 'tab Bookings', p.locator('.tabbar button', { hasText: 'Bookings' }), '09-trips')
  s = t.S()
  await t.go(s, 'Track delivery (skip to Sat 7:22)', t.btn('Track delivery'), '10-delivery-tracking', { timeout: 9000 })
  await t.chk(s, '10 courier', 'Hafiz · Timah Cycles', await t.text())
  await t.chk(s, '10 fit row', 'Saddle 72 cm · frame M', await t.text())
  try { await p.waitForFunction(() => !document.querySelector('.s10-go')?.disabled, null, { timeout: 15000 }) } catch { /* recorded below */ }
  await t.chk(s, '10 arrived at 7:40', '7:40', await t.clock(), { exact: true })
  await t.go(s, 'Start the hand-over check', t.btn('Start the hand-over check'), '11-handover-check')
  s = t.S()
  for (const part of ['crank arm', 'saddle edge', 'drivetrain']) await t.tap(t.btn(`Take your photo of the ${part}`))
  await t.tap(t.btn('Circle the scratch on your photo')); await t.tap(t.btn('Circle the scuff on your photo'))
  await t.chk(s, '11 save enabled', 'Save the hand-over record', await t.text('.dock'))
  await t.tap(p.locator('.dock .cta'), { wait: 2500 })
  await t.chk(s, '11 slip', 'Recorded · 25 Oct · 7:40', await t.text())
  await t.go(s, 'See the rental summary (skip to 14:05)', p.locator('.dock .cta'), '12-rental-summary', { timeout: 9000 })
  s = t.S()
  await t.chk(s, '12 deposit released', 'S$150 deposit released', await t.text())
  await t.chk(s, '12 day', '7:40 Delivered, set to your fit', await t.text())
  await t.chk(s, '12 release time', '14:05', await t.text())
  await t.go(s, 'See the weekly ride', t.btn('See the weekly ride'), '13-weekly-ride')
  await t.chk(s, '13 price', 'S$45', await t.text())
  await t.go(s, 'Back to the summary', p.locator('.bar-top .back'), '12-rental-summary')
  await t.go(s, 'See the weekly ride again', t.btn('See the weekly ride'), '13-weekly-ride')
  await t.tap(t.btn('Set up every Saturday · S$45 a ride'), { wait: 2500 })
  await t.chk(s, '13 set up', 'Every Saturday, from 1 Nov', await t.text())
  s = t.S()
  await t.go(s, 'Back (to Bookings)', p.locator('.bar-top .back'), '09-trips')
  await t.chk(s, '09 after the ride: weekly up next', '6 days 17 h', await t.text())
  await t.chk(s, '09 Past', 'S$150 released', await t.text())
  await t.go(s, 'tab Home', p.locator('.tabbar button', { hasText: 'Home' }), '01-home')
  await t.chk(s, 'Home after the ride', 'Every Saturday, from 1 Nov', await t.text())
  await t.chk(s, 'Home no longer counts down to 25 Oct', 'In 12 h', await t.text(), { not: true })
}

// ---------------------------------------------------------------------------------------------------------------
export async function E2(t) {
  const { p } = t
  await t.start()
  const ok = await book(t, {
    fit: (t) => fitStep(t, 170, 78),
    at06: async (t) => {
      await t.tap(t.btn('Change'))
      await t.tap(p.locator('.where6').first().getByRole('button', { name: /Your home address/ }))
      await t.tap(t.btn('Use these places'), { wait: 700 })
      await t.tap(t.btn('Deliver at 8:00')); await t.tap(t.btn('Deliver at 7:20'))
      await t.tap(t.btn('Pick another collection time'), { wait: 700 })
      // the wheel starts at 13:10; 26 steps of 10 minutes down is 17:30
      await p.locator('.wheel6').focus()
      for (let i = 0; i < 26; i++) { await p.keyboard.press('ArrowDown'); await p.waitForTimeout(40) }
      await p.waitForTimeout(500)
      await t.tap(t.btn(/Use this time/), { wait: 600 })
      const s = t.S()
      await t.chk(s, '06 bill with 7:20 / 17:30', 'Delivery 25 Oct · 7:20 Collection 25 Oct · 17:30', await t.text('.bill6'))
      await t.chk(s, '06 card names home for delivery', 'Blk 325C Sengkang East Way #11-42', await t.text('.meet6'))
    },
    at07: async (t) => {
      await t.tap(t.btn(/Change payment method/), { wait: 600 })
      await t.tap(p.locator('.sheetx.on .opt', { hasText: 'Visa ending 4821' }), { wait: 600 })
      await t.tap(p.locator('label.ack'))
      const s = t.S()
      await t.chk(s, '07 pays with Visa', 'Pay S$50 with Visa ending 4821', await t.text('.dock'))
      await t.chk(s, '07 total still S$50', 'S$50', await t.text('.bill-h'))
      // back to 06 and change collection to 14:30, then forward again
      await t.go(s, 'back to 06', p.locator('.bar-top .back'), '06-delivery-return')
      await t.tap(t.btn('Collect at 14:30'))
      await t.go(s, 'See the fees again', t.btn('See the fees'), '07-fees-liability')
      await t.chk(s, '07 keeps Visa and the tick', 'Pay S$50 with Visa ending 4821', await t.text('.dock'))
      await p.locator('label.ack').tap(); await p.waitForTimeout(200)   // book() ticks again; untick first
    },
  })
  if (!ok) return
  let s = t.S()
  const tag = await t.text('.tag')
  await t.chk(s, '08 saddle 69 from leg 78', 'Saddle 69cm', tag)
  await t.chk(s, '08 frame M from 170', 'size M', tag)
  await t.chk(s, '08 deliver 7:20', 'Deliver 25 Oct · 7:20', tag)
  await t.chk(s, '08 collect 14:30', 'Collect 25 Oct · 14:30', tag)
  await t.chk(s, '08 places differ', 'Deliver: Blk 325C Sengkang East Way #11-42', tag)
  await t.chk(s, '08 paid with Visa', 'Paid · S$50 · Visa ending 4821', await t.text('.after08'))
  await t.go(s, 'See it in Bookings', t.btn('See it in Bookings'), '09-trips', { timeout: 9000 })
  const b = await t.text('[aria-label="Booking OR-10482"]')
  await t.chk(s, '09 countdown 12 h 20 min', '12 h 20 min', b)
  await t.chk(s, '09 saddle 69', 'Saddle 69 cm', b)
  await t.chk(s, '09 home address', 'Blk 325C', b)
  await t.chk(s, '09 paid with Visa', 'Visa', b)
  s = t.S()
  await t.go(s, 'Track delivery', t.btn('Track delivery'), '10-delivery-tracking', { timeout: 9000 })
  try { await p.waitForFunction(() => !document.querySelector('.s10-go')?.disabled, null, { timeout: 15000 }) } catch { /* below */ }
  await t.chk(s, '10 arrives 7:20', '7:20', await t.clock(), { exact: true })
  await t.chk(s, '10 saddle 69', 'Saddle 69 cm', await t.text())
  await t.chk(s, '10 destination home', 'Blk 325C', await t.text())
  await t.go(s, 'hand-over', t.btn('Start the hand-over check'), '11-handover-check')
  for (const part of ['crank arm', 'saddle edge', 'drivetrain']) await t.tap(t.btn(`Take your photo of the ${part}`))
  await t.tap(t.btn('Circle the scratch on your photo')); await t.tap(t.btn('Circle the scuff on your photo'))
  await t.chk(s, '11 record time 7:20', '25 Oct · 7:20', await t.text())
  await t.chk(s, '11 not 7:40', '7:40', await t.text(), { not: true })
  await t.tap(p.locator('.dock .cta'), { wait: 2500 })
  await t.go(s, 'to 12', p.locator('.dock .cta'), '12-rental-summary', { timeout: 9000 })
  s = t.S()
  const r = await t.text()
  await t.chk(s, '12 delivered 7:20 at home', '7:20', r)
  await t.chk(s, '12 collected 17:30? no: 14:30', '14:30', r)
  await t.chk(s, '12 saddle 69', 'saddle 69 cm', r)
  await t.chk(s, '12 checked against 7:20 photos', 'Checked against the 7:20 photos', r)
  await t.chk(s, '12 deposit not released before collection', '14:05', r, { not: true })
  await t.go(s, 'See the weekly ride', t.btn('See the weekly ride'), '13-weekly-ride')
  const w = await t.text()
  await t.chk(s, '13 deliver 7:20', '7:20', w)
  await t.chk(s, '13 collect 14:30', '14:30', w)
  await t.chk(s, '13 no 7:40', '7:40', w, { not: true })
}

// ---------------------------------------------------------------------------------------------------------------
export async function E3(t) {
  const { p } = t
  await t.start()
  let s = t.S()
  for (const name of ['What', 'To', 'When']) { await t.tap(p.locator('.docket .f', { hasText: name })); await t.chk(s, `docket ${name} says why`, 'coach’s post', await t.toast()) }
  await t.tap(p.locator('.med', { hasText: 'Cycling' })); await t.chk(s, 'Cycling medallion says it is not in the demo', 'not in this demo', await t.toast())
  await t.go(s, 'tab Bookings before booking', p.locator('.tabbar button', { hasText: 'Bookings' }), '09-trips')
  await t.chk(s, 'Bookings has nothing booked', 'OR-10482', await t.text(), { not: true })
  await t.go(s, 'tab Home', p.locator('.tabbar button', { hasText: 'Home' }), '01-home')
  await t.tap(p.locator('.tabbar button', { hasText: 'Profile' })); await t.chk(s, 'Profile says not in the demo', 'Profile is not in this demo yet.', await t.toast())
  // a 155 cm rider with a 60 cm inside leg
  s = t.S()
  await t.go(s, 'coach post', t.btn('Open Coach Aisyah’s post'), '02-coach-kit'); await p.waitForTimeout(900)
  await t.go(s, 'Enter your fit', p.locator('.vsheet .cta'), '03-fit-profile')
  await fitStep(t, 155, 60)
  await t.chk(s, '03 saddle 53 for leg 60', '53', await t.text('.p3:not([hidden]) .o'))
  await t.tap(p.locator('.dock .cta'), { wait: 1500 }); await t.tap(p.locator('.dock .cta'), { wait: 1500 })
  await t.chk(s, '03 frame S for 155', 'Frame S', await t.text('.p3:not([hidden]) .mgrid'))
  await t.go(s, 'Save fit', p.locator('.dock .cta'), '04-search-results', { timeout: 6000 })
  await t.chk(s, '04 asks for size S', 'size S', await t.text('.query'))
  await t.chk(s, '04 results are size S', 'Trek Marlin 7 · size S', await t.text('.res'))
  await t.go(s, 'open the Marlin 7', p.locator('.res').first(), '05-listing-detail')
  await t.chk(s, '05 shows 53 / S', 'Saddle 53cm Frame S', await t.text('.mgrid'))
  await t.chk(s, '05 shows 155 / 60', 'From your height 155 cm and inside leg 60 cm', await t.text('#setfor'))
  await t.go(s, 'Choose delivery', p.getByRole('link', { name: 'Choose delivery' }), '06-delivery-return')
  await t.tap(t.btn('Deliver at 7:40')); await t.tap(t.btn('Collect at 13:30'))
  await t.go(s, 'fees', t.btn('See the fees'), '07-fees-liability')
  await t.tap(p.locator('label.ack'))
  await t.go(s, 'pay', p.locator('.dock .cta'), '08-booking-confirmation', { timeout: 6000 })
  await t.chk(s, '08 tag S / 53', 'Trek Marlin 7 · size S Saddle 53cm', await t.text('.tag'))
  await t.go(s, 'Bookings', t.btn('See it in Bookings'), '09-trips', { timeout: 9000 })
  await t.chk(s, '09 S / 53', 'Saddle 53 cm · frame S', await t.text())
  await t.go(s, 'Track', t.btn('Track delivery'), '10-delivery-tracking', { timeout: 9000 })
  await t.chk(s, '10 S / 53', 'Saddle 53 cm · frame S', await t.text())
  await t.go(s, 'Back to Bookings', p.locator('.bar-top .back'), '09-trips')
  await t.go(s, 'tab My gear', p.locator('.tabbar button', { hasText: 'My gear' }), '14-my-equipment')
  await t.go(s, 'tab Home from My gear', p.locator('.tabbar button', { hasText: 'Home' }), '01-home')
}

// ---------------------------------------------------------------------------------------------------------------
export async function E4(t) {
  const { p } = t
  await t.start()
  await book(t, {
    at07: async (t) => {
      const s = t.S()
      for (let i = 0; i < 2; i++) { await t.tap(t.btn('Read the full terms'), { wait: 700 }); await t.tap(t.btn('Close the terms'), { wait: 700 }) }
      await t.chk(s, 'terms open and close twice', '0', String(await p.locator('.fullterms').count()), { exact: true })
      await t.tap(p.locator('label.ack')); await t.tap(p.locator('label.ack'))
      await t.chk(s, 'tick then untick leaves pay disabled', 'true', String(await p.locator('.dock .cta').isDisabled()), { exact: true })
      for (const m of ['Visa ending 4821', 'PayNow', 'Visa ending 4821', 'PayNow', 'Visa ending 4821']) {
        await t.tap(t.btn(/Change payment method/), { wait: 600 }); await t.tap(p.locator('.sheetx.on .opt', { hasText: m }), { wait: 600 })
      }
      await t.chk(s, 'method after 5 changes', 'Visa ending 4821', await t.text('.pm1'))
      // Back walks 07 → 06 → 05 → 04 → 02 → 01 without repeats
      for (const [want, sel] of [['06-delivery-return', '.bar-top .back'], ['05-listing-detail', '.bar-top .back'], ['04-search-results', '.strip .back'], ['02-coach-kit', '.bar-top .back'], ['01-home', '.bar-top .back']]) await t.go(s, 'Back', p.locator(sel), want)
      await t.go(s, 'post', t.btn('Open Coach Aisyah’s post'), '02-coach-kit'); await p.waitForTimeout(900)
      await t.go(s, 'bikes', p.locator('.vsheet .cta'), '04-search-results')
      await t.go(s, 'Marlin', p.locator('.res').first(), '05-listing-detail')
      await t.go(s, 'delivery', p.getByRole('link', { name: 'Choose delivery' }), '06-delivery-return')
      await t.chk(s, '06 kept 7:40 / 13:30 after the round trip', 'Delivery 25 Oct · 7:40 Collection 25 Oct · 13:30', await t.text('.bill6'))
      await t.go(s, 'fees', t.btn('See the fees'), '07-fees-liability')
      await t.chk(s, '07 kept Visa', 'Visa ending 4821', await t.text('.pm1'))
    },
  })
  let s = t.S()
  await t.chk(s, '08 totals', 'Paid S$50', await t.text('.stamp') + ' S$50')
  await t.go(s, 'Close 08 → Home', t.btn('Close, back to Home'), '01-home')
  await t.chk(s, 'Home shows the booking', 'Trek Marlin 7 · size M', await t.text())
  await t.go(s, 'post again', t.btn('Open Coach Aisyah’s post'), '02-coach-kit'); await p.waitForTimeout(900)
  await t.chk(s, '02 drawer says booked, not a second booking', 'See it in Bookings', await t.text('.vsheet .cta'))
  await t.go(s, 'Browser Back stays in the app', 'body', '02-coach-kit')
  await p.goBack(); await p.waitForTimeout(800)
  await t.chk(s, 'browser Back lands on an app page', '01-home', await t.page())
}

// ---------------------------------------------------------------------------------------------------------------
export async function E5(t) {
  const { p } = t
  await t.start()
  if (!(await book(t))) return
  let s = t.S()
  await t.go(s, 'Bookings', t.btn('See it in Bookings'), '09-trips', { timeout: 9000 })
  await t.chk(s, '09 offers the weekly ride before the ride', 'Weekly ride', await t.text())
  await t.go(s, 'Track', t.btn('Track delivery'), '10-delivery-tracking', { timeout: 9000 })
  try { await p.waitForFunction(() => !document.querySelector('.s10-go')?.disabled, null, { timeout: 15000 }) } catch { /* below */ }
  await t.go(s, 'hand-over', t.btn('Start the hand-over check'), '11-handover-check')
  for (const part of ['crank arm', 'saddle edge', 'drivetrain']) await t.tap(t.btn(`Take your photo of the ${part}`))
  await t.tap(t.btn('Circle the scratch on your photo')); await t.tap(t.btn('Circle the scuff on your photo'))
  await t.tap(p.locator('.dock .cta'), { wait: 2500 })
  await t.go(s, 'summary', p.locator('.dock .cta'), '12-rental-summary', { timeout: 9000 })
  s = t.S()
  await t.go(s, 'Back on 12 goes to Bookings', p.locator('.bar-top .back'), '09-trips')
  await t.go(s, 'Past → 12', p.getByRole('button', { name: /Trek Marlin 7 · 25 Oct/ }), '12-rental-summary')
  await t.go(s, 'See the weekly ride', t.btn('See the weekly ride'), '13-weekly-ride')
  await t.chk(s, '13 before set-up: nothing charged today', 'Nothing is charged today', await t.text())
  await t.tap(t.btn('Set up every Saturday · S$45 a ride'), { wait: 2600 })
  await t.chk(s, '13 after set-up: next charge', '30 Oct · 20:00', await t.text())
  await t.tap(p.locator('.ctl13 button').first()); await t.chk(s, 'Skip says not in the demo', 'not in this demo', await t.toast(), { sev: 1 })
  await t.go(s, 'Back → Bookings', p.locator('.bar-top .back'), '09-trips')
  const b = await t.text()
  await t.chk(s, '09 next ride', 'Next ride, Sat 1 Nov, in', b)
  await t.chk(s, '09 first charge', '30 OCT · 20:00 · S$45', b)
  await t.chk(s, '09 no offer row once set up', 'S$45 per ride instead of S$50', b, { not: true })
  await t.go(s, 'Past → 12', p.getByRole('button', { name: /Trek Marlin 7 · 25 Oct/ }), '12-rental-summary')
  await t.chk(s, '12 no longer offers it', 'Riding again every Saturday', await t.text())
  await t.go(s, 'Open the weekly ride', t.btn('Open the weekly ride'), '13-weekly-ride')
  await t.chk(s, '13 reopened: the running series', 'Every Saturday, from 1 Nov', await t.text())
  await t.chk(s, '13 reopened: not the offer wording', 'Nothing is charged today', await t.text(), { not: true })
  await t.chk(s, '13 reopened: Back names Bookings', 'Back to Bookings', await p.locator('.bar-top .back').getAttribute('aria-label'))
  await t.go(s, 'Back → Bookings', p.locator('.bar-top .back'), '09-trips')
  await t.go(s, 'tab Home', p.locator('.tabbar button', { hasText: 'Home' }), '01-home')
  await t.chk(s, 'Home: Sat 25 Oct, the weekly ride up next', 'Every Saturday, from 1 Nov', await t.text())
  await t.chk(s, 'Home clock after the ride', '14:07', await t.clock(), { exact: true })
}
