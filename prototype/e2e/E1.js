// E1 · Daniel, first rental, default choices. Run: cd /home/claude/review-tools && node /home/claude/review-out/e2e/E1.js [webkit]
// Taps only from Home (no #hash jumps, no page functions). Asserts every value against MOCK-DATA v1.6.
const path = require('path');
const pw = require(path.join('/home/claude/review-tools/node_modules', 'playwright'));
const fs = require('fs');
const J = 'E1', PERSONA = 'Daniel Lim · first rental, default choices';
const OUT = '/home/claude/review-out/e2e/';
const ENGINE = process.argv[2] === 'webkit' ? 'webkit' : 'chromium';
fs.mkdirSync(OUT + 'shots', { recursive: true });

(async () => {
  let browser;
  try { browser = await pw[ENGINE].launch(); } catch (e) { console.log(`SKIP ${ENGINE}: ${e.message.split('\n')[0]}`); process.exit(0); }
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, hasTouch: true });
  const p = await ctx.newPage();
  const errs = []; p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  const R = []; let nshot = 0, stepNo = 0;
  const norm = (s) => (s == null ? '' : String(s)).replace(/\s+/g, ' ').trim();

  async function rec(step, action, expected, actual, pass, o = {}) {
    let shot = null;
    if (!pass) { nshot++; shot = `e2e/shots/${J}${ENGINE === 'webkit' ? '-wk' : ''}-${nshot}.png`; try { await p.screenshot({ path: '/home/claude/review-out/' + shot }); } catch (_) {} }
    R.push({ journey: J, persona: PERSONA, step, action, expected: norm(expected), actual: norm(actual), pass, severity: pass ? 0 : (o.sev ?? 3), known: o.known || null, shot, fix: pass ? '' : (o.fix || '') });
    console.log(pass ? 'PASS' : 'FAIL', step, '|', action, '|', norm(expected), '=>', norm(actual));
  }
  // value check: the expected string must appear in the actual text (or equal it with o.exact)
  async function chk(step, action, expected, actual, o = {}) {
    const a = norm(actual), e = norm(expected), al = a.toLowerCase(), el = e.toLowerCase(); // case-insensitive: CSS uppercases mono labels
    const pass = o.not ? !al.includes(el) : o.exact ? al === el : al.includes(el);
    await rec(step, action, (o.not ? 'not: ' : '') + e, o.show ? norm(o.show) : a.slice(0, 260), pass, o);
    return pass;
  }
  const txt = async (sel) => { try { return norm(await p.$eval(sel, (e) => e.innerText || e.textContent)); } catch (_) { return '(missing ' + sel + ')'; } };
  const onId = () => p.evaluate(() => [...document.querySelectorAll('.screen.on')].map((s) => s.id).join(','));
  const clock = () => txt('#clock');
  async function waitScreen(id, timeout = 15000) {
    try {
      await p.waitForFunction((id) => { const on = [...document.querySelectorAll('.screen.on')]; const sk = document.querySelector('#skip'); return on.length === 1 && on[0].id === id && (!sk || getComputedStyle(sk).visibility !== 'visible'); }, id, { timeout });
      await p.waitForTimeout(500); return true;
    } catch (_) { return false; }
  }
  async function tap(sel, opt = {}) {
    const loc = typeof sel === 'string' ? p.locator(sel).first() : sel;
    await loc.scrollIntoViewIfNeeded({ timeout: 4000 }).catch(() => {});
    await loc.tap({ timeout: 4000, force: !!opt.force });
    await p.waitForTimeout(opt.wait ?? 300);
  }
  async function goTo(step, action, sel, want, o = {}) {
    let err = '';
    try { await tap(sel, o); } catch (e) { err = ' (tap failed: ' + e.message.split('\n')[0] + ')'; }
    const ok = await waitScreen(want, o.timeout || 15000);
    await rec(step, action, 'screen ' + want, 'screen ' + (await onId()) + err, ok, o);
    return ok;
  }
  const toastText = async () => p.evaluate(() => { const t = document.querySelector('#toast'); return t && t.classList.contains('on') ? t.textContent.trim() : ''; });
  const S = () => 'S' + String(++stepNo).padStart(2, '0');

  // ---------- 01 Home ----------
  await p.goto('http://localhost:8081/index.html', { waitUntil: 'networkidle' });
  await waitScreen('s01');
  let s = S();
  await rec(s + ' 01', 'open prototype with no hash', 'screen s01', 'screen ' + (await onId()), (await onId()) === 's01');
  await chk(s + ' 01', 'Home date', 'Wed 22 Oct', await txt('#s01 .hello'));
  await chk(s + ' 01', 'status clock on 01', '9:01', await clock(), { exact: true });
  await chk(s + ' 01', 'coach card date and time', 'Sat 25 Oct · 8:00–12:30', await txt('#kitcard'));
  await chk(s + ' 01', 'four categories in order', 'Bikes Kayaks Paddleboards Camping', (await p.$$eval('#s01 .cat b', (b) => b.map((x) => x.textContent).join(' '))), { exact: true });

  // ---------- 02 Coach's post ----------
  s = S(); await goTo(s + ' 01→02', 'tap the coach card', '#kitcard', 's02');
  await chk(s + ' 02', 'ride date/time/place', 'Sat 25 Oct · 8:00–12:30 Chestnut Nature Park', await txt('#s02 .event'));
  await chk(s + ' 02', 'status clock', '9:02', await clock(), { exact: true });
  await chk(s + ' 02', 'withdrawn line is gone', 'Spend money on fit', await txt('#s02'), { not: true, known: 'FIXES 9', sev: 2 });
  // back to Home and in again (navigation)
  s = S(); await goTo(s + ' 02→01', 'tap back on 02 ("Back to Home")', '#s02 .back', 's01');
  await goTo(s + ' 01→02', 'tap the coach card again', '#kitcard', 's02');
  await p.waitForTimeout(900); // drawer pops up after 650 ms

  // ---------- 03 Fit ----------
  s = S(); await goTo(s + ' 02→03', 'tap "Rent a hardtail for Sat 25 Oct" (no profile yet)', '#s02 [data-rent]', 's03');
  await chk(s + ' 03', 'height', '176', await txt('#v-height'), { exact: true });
  await chk(s + ' 03', 'inside leg', '81', await txt('#v-leg'), { exact: true });
  await chk(s + ' 03', 'saddle / frame / fork sag / bars', 'Saddle 72cm Frame M Fork sag 25% Bars +1cm', await txt('#fitgrid'));
  await chk(s + ' 03', 'status clock', '9:03', await clock(), { exact: true });
  await chk(s + ' 03', 'skill level shown', 'Weekly on park connectors', await txt('#s03 .riding'));

  // ---------- 04 Search ----------
  s = S(); await goTo(s + ' 03→04', 'tap "Save fit"', '#save', 's04', { timeout: 6000 });
  await chk(s + ' 04', 'query line', 'Hardtail M · Chestnut · Sat 25 Oct', await txt('#s04 .query .q'), { exact: true });
  await chk(s + ' 04', 'status clock', '9:05', await clock(), { exact: true });
  const res = await p.$$eval('#s04 .res .top', (t) => t.map((x) => x.innerText.replace(/\s+/g, ' ')));
  await chk(s + ' 04', 'Trek Marlin 7 card', 'Trek Marlin 7 · M S$50 Timah Cycles · shop · 4.9 (23) all-in', res[0] || '');
  await chk(s + ' 04', 'Trek Marlin 6 card', 'Trek Marlin 6 · M S$46 Rodalink · shop · 4.7 (58) all-in', res[1] || '');
  await chk(s + ' 04', 'Scott Aspect 950 card', 'Scott Aspect 950 · M S$45 Marcus T. · owner · 4.6 (9) all-in', res[2] || '');
  await chk(s + ' 04', 'Marlin 7 arrival scale', '7:40', await p.$eval('#res-m7 .ruler', (r) => r.textContent), { known: 'FIXES 7', sev: 1 });
  await chk(s + ' 04', 'Scott arrival after the start', 'ARRIVES 8:30 · AFTER THE 8:00 START', await p.$$eval('#s04 .ruler', (r) => r[2].textContent));
  // back from 04 lands where? stack is [01,02]: 03 was not stacked
  await goTo(s + ' 04→02', 'tap back on 04 (label "Back"; 03 was the page before)', '#s04 .back', 's02', { sev: 2, fix: 'Decide whether back from 04 should land on 03 (the page Daniel just saw) or 02; today it skips 03. If 02 is intended, fine; otherwise push s03 on the stack before showing s04 in the Save handler.' });
  await p.waitForTimeout(900);
  await goTo(s + ' 02→04', 'tap "Rent a hardtail" again (profile now saved, skips 03)', '#s02 [data-rent]', 's04');

  // ---------- 05 Listing ----------
  s = S(); await goTo(s + ' 04→05', 'tap the Trek Marlin 7 result', '#res-m7', 's05');
  await chk(s + ' 05', 'status clock', '9:06', await clock(), { exact: true });
  await chk(s + ' 05', 'fit numbers on the listing', 'Saddle 72cm Frame M Fork sag 25% Bars +1cm', await txt('#fitgrid5'));
  await chk(s + ' 05', 'fit source line', 'From your height 176 cm and inside leg 81 cm', await txt('#setfor'));
  await chk(s + ' 05', 'first photo caption', 'Photo 1 of 5 · 12 Oct 2026', await txt('#cap'), { exact: true });
  await chk(s + ' 05', 'marks and their time', 'Scratch, left crank arm 18 Oct · 16:20 Scuff, saddle edge 18 Oct · 16:20', await txt('#s05 .loupes'));
  await chk(s + ' 05', 'price bar', 'S$38 This bike, 1 day S$12 Delivery and collection S$50 Setting it to your fit S$0, included S$150 deposit, held, not charged.', await txt('#price'));
  await chk(s + ' 05', 'item rating', '4.9 · 23 reviews', await txt('#s05 .l-meta'));
  await chk(s + ' 05', 'supplier', 'Timah Cycles Bike shop · Bukit Timah 4.8 · 126 reviews', await txt('#s05 .supplier'));
  await chk(s + ' 05', 'specs', 'Frame M, aluminium Wheels 29 in Front fork 100 mm travel Gears 1 × 10 Brakes Hydraulic disc Weight 13.9 kg Assembled size 180 × 110 × 78 cm', await txt('#s05 .specs'));
  const days = await p.$$eval('#s05 .days > div', (d) => d.map((x) => x.querySelector('b').textContent + (x.classList.contains('you') ? 'Y' : x.classList.contains('bk') ? 'B' : '')).join(' '));
  await chk(s + ' 05', 'availability 24 Oct–2 Nov (25 yours, 26/30/31 booked)', '24 25Y 26B 27 28 29 30B 31B 1 2', days, { exact: true });
  await chk(s + ' 05', 'dock price', 'S$50 all-in + S$150 deposit, held', await txt('#s05 .l-dock .p'));
  // swipe the photos: caption follows
  await p.$eval('#rail', (r) => { r.scrollLeft = r.clientWidth * 3; }); await p.waitForTimeout(600);
  await chk(s + ' 05', 'photo 4 caption after swiping', 'Photo 4 of 5 · 18 Oct · 16:20', await txt('#cap'), { exact: true });
  // back to search and in again
  await goTo(s + ' 05→04', 'tap back on 05 ("Back to search")', '#s05 .back', 's04');
  await goTo(s + ' 04→05', 'tap the Trek Marlin 7 result again', '#res-m7', 's05');
  // Edit fit from the listing and come back (E1-4 AC2)
  s = S(); await goTo(s + ' 05→03', 'tap "Edit fit" on the listing', '#s05 a[data-push="s03"]', 's03');
  await chk(s + ' 03', 'profile still 176 / 81', '176 81', (await txt('#v-height')) + ' ' + (await txt('#v-leg')), { exact: true });
  await goTo(s + ' 03→05', 'tap "Save fit" without changes: returns to the listing', '#save', 's05', { timeout: 6000 });

  // ---------- 06 Delivery ----------
  s = S(); await goTo(s + ' 05→06', 'tap "Choose delivery"', '#choose', 's06');
  await chk(s + ' 06', 'status clock', '9:07', await clock(), { exact: true });
  await chk(s + ' 06', 'delivery place default', 'Chestnut trailhead carpark By the park entrance sign', await txt('#s06 [data-place="d"] .pl'), { exact: true });
  await chk(s + ' 06', 'collection place default', 'Chestnut trailhead carpark By the park entrance sign', await txt('#s06 [data-place="c"] .pl'), { exact: true });
  const dslots = await p.$$eval('#s06 .slot[data-kind="d"]', (b) => b.map((x) => x.dataset.t + (x.disabled ? '(off)' : '')).join(' '));
  await chk(s + ' 06', 'delivery slots', '7:00(off) 7:20 7:40 8:00', dslots, { exact: true });
  await chk(s + ' 06', 'collection slots', '13:00 13:30 14:30 17:30', await p.$$eval('#s06 .slot[data-kind="c"]', (b) => b.map((x) => x.dataset.t).join(' ')), { exact: true });
  await chk(s + ' 06', 'button before choosing', 'Choose both times (disabled)', (await txt('#go07')) + (await p.$eval('#go07', (b) => b.disabled ? ' (disabled)' : '')), { exact: true });
  await tap('#s06 .slot[data-kind="d"][data-t="7:40"]');
  await tap('#s06 .slot[data-kind="c"][data-t="13:30"]');
  await chk(s + ' 06', 'delivery leg after tapping 7:40', 'Arrives 7:40', await txt('#q-d'), { exact: true });
  await chk(s + ' 06', 'collection leg after tapping 13:30', 'Collected 13:30', await txt('#q-c'), { exact: true });
  await chk(s + ' 06', 'fee', 'S$12', await txt('#fee06'), { exact: true });
  await chk(s + ' 06', 'day line shows both picks', '7:40 13:30', (await p.$$eval('#ov06 .ovm text', (t) => t.map((x) => x.textContent).join(' '))), { exact: true });
  await chk(s + ' 06', 'no clash note for 7:40', 'hidden', (await p.$eval('#clash', (c) => c.hidden ? 'hidden' : 'shown')), { exact: true });
  await chk(s + ' 06', 'button after both picks', 'See the fees', await txt('#go07'), { exact: true });

  // ---------- 07 Fees ----------
  s = S(); await goTo(s + ' 06→07', 'tap "See the fees"', '#go07', 's07');
  await chk(s + ' 07', 'status clock', '9:09', await clock(), { exact: true });
  await chk(s + ' 07', 'bill head', 'Trek Marlin 7 · Sat 25 Oct S$50 today, all in', await txt('#s07 .bill-h'));
  await chk(s + ' 07', 'charges', 'This bike, 1 day S$38 Delivery and collection S$12 Setting it to your fit S$0 Nothing else is charged.', await txt('#s07 .stmt'));
  await chk(s + ' 07', 'deposit', 'Plus a S$150 deposit, held', await txt('#s07 .dep2'));
  await chk(s + ' 07', 'cancel deadline', 'Free until 24 Oct · 20:00', await txt('#s07 .terms2'));
  await chk(s + ' 07', 'payment default', 'PayNow', await txt('#pm07'), { exact: true });
  await chk(s + ' 07', 'pay disabled until ticked', 'Tick the terms to pay (disabled)', (await txt('#pay07')) + (await p.$eval('#pay07', (b) => b.disabled ? ' (disabled)' : '')), { exact: true });
  await p.$eval('#sc07', (sc) => sc.scrollTop = sc.scrollHeight); await p.waitForTimeout(500);
  await tap('#readall07', { wait: 700 });
  await chk(s + ' 07', 'full terms open', 'Damage and liability terms', (await p.$eval('#ft07', (f) => f.hidden ? '' : f.innerText)));
  await chk(s + ' 07', 'full terms values', 'S$150 deposit', await txt('#ft07'));
  await tap('#ftclose', { wait: 700 });
  await chk(s + ' 07', 'full terms close', 'hidden', await p.$eval('#ft07', (f) => f.hidden ? 'hidden' : 'open'), { exact: true });
  await tap('#s07 label.ack');
  await chk(s + ' 07', 'tick the terms', 'Pay S$50 with PayNow', await txt('#pay07'), { exact: true });

  // ---------- 08 Confirmed ----------
  s = S(); await goTo(s + ' 07→08', 'tap "Pay S$50 with PayNow"', '#pay07', 's08', { timeout: 8000 });
  await p.waitForTimeout(2200);
  await chk(s + ' 08', 'status clock', '9:12', await clock(), { exact: true });
  await chk(s + ' 08', 'confirmed time', 'Confirmed 22 Oct · 9:12', await txt('#s08 .bar-top .mid'), { exact: true });
  await chk(s + ' 08', 'job tag head', 'Timah Cycles · job OR-10482', await txt('#tag08 .tg-top'));
  await chk(s + ' 08', 'renter and bike', 'Daniel Lim Trek Marlin 7 · size M', (await txt('#tag08 .tg-name')) + ' ' + (await txt('#tag08 .tg-bike')), { exact: true });
  await chk(s + ' 08', 'fit on the tag', 'Saddle 72cm Fork sag 25% Bars +1cm', await txt('#tag08 .tg-set'));
  await chk(s + ' 08', 'deliver / collect', 'Deliver 25 Oct · 7:40 Collect 25 Oct · 13:30', await txt('#tag08 .tg-go'));
  await chk(s + ' 08', 'place', 'Chestnut trailhead carpark, by the park entrance sign', await txt('#tag08 .tg-at'), { exact: true });
  await chk(s + ' 08', 'paid stamp', 'Paid S$50 22 Oct', await txt('#stamp08'));
  await chk(s + ' 08', 'deposit + cancel line', 'S$150 deposit held, not charged. Free to cancel until 24 Oct · 20:00.', await txt('#s08 .after08'));
  await chk(s + ' 08', 'next line', 'Set to your fit on 24 Oct · 17:30. Leaves the shop 25 Oct · 7:05.', await txt('#s08 .nextline'));
  await chk(s + ' 08', 'banner', 'Booking OR-10482 confirmed Trek Marlin 7 · 25 Oct · 7:40', await txt('#banner08'));

  // ---------- 09 Bookings ----------
  s = S(); await goTo(s + ' 08→09', 'tap "See it in Bookings" (skip to Fri 24 Oct 19:00)', '#track08', 's09', { timeout: 12000 });
  await p.waitForTimeout(1500);
  await chk(s + ' 09', 'date line', 'Fri 24 Oct · 19:00', await txt('#d09'), { exact: true });
  await chk(s + ' 09', 'status clock', '19:00', await clock(), { exact: true });
  await chk(s + ' 09', 'card head', 'OR-10482 · Timah Cycles Sat 25 Oct', await txt('#bk09 .bk-h'));
  await chk(s + ' 09', 'countdown', '12 h 40 min', await p.$eval('#bk09 .board', (b) => [...b.children].map((c) => c.dataset.d || c.textContent).join(' ').replace(/(\d) (\d)/g, '$1$2')));
  await chk(s + ' 09', 'set-up proof', 'Saddle 72 cm · frame M · fork 25% Timah Cycles · 24 Oct · 18:10', await txt('#bk09 .proof9s'));
  await chk(s + ' 09', 'place', 'Chestnut trailhead carpark, by the park entrance sign', await txt('#bk09 .where9'), { exact: true });
  await chk(s + ' 09', 'money line', 'S$50 paid · S$150 deposit held · free to cancel until 24 Oct · 20:00', await txt('#bk09 p.small'), { exact: true });
  await chk(s + ' 09', 'weekly offer before the ride', 'S$45 per ride instead of S$50 · from Sat 1 Nov', await txt('#offer09'));
  // tabs mid-flow: Home then back to Bookings
  s = S(); await goTo(s + ' 09→01', 'tap the Home tab', '#s09 .tabbar [data-tab="s01"]', 's01');
  await chk(s + ' 01', 'Home after booking (now Fri 24 Oct 19:00) shows the upcoming rental', 'OR-10482', (await txt('#s01 .scroll')), { sev: 2, show: 'clock ' + (await clock()) + ' | ' + (await txt('#s01 .hello')) + ' | ' + (await txt('#s01 .sec01')).slice(0, 80), fix: 'After 08, Home should leave its no-bookings variant: date Fri 24 Oct (MOCK-DATA §1 off-route clock) and a line or card for OR-10482 (Trek Marlin 7 · Sat 25 Oct · 7:40) leading to Bookings. At minimum change the date and clock: it still reads "Wed 22 Oct · Good morning" with the status clock at 9:01 after the booking was made and the story moved to Fri 19:00.' });
  // (clock on Home after booking is folded into the check above)
  await goTo(s + ' 01→09', 'tap the Bookings tab', '#s01 .tabbar [data-tab="s09"]', 's09');
  await chk(s + ' 09', 'Bookings unchanged after tab round trip', '12 h 40 min', await p.$eval('#bk09 .board', (b) => [...b.children].map((c) => c.dataset.d || c.textContent).join(' ').replace(/(\d) (\d)/g, '$1$2')));
  await goTo(s + ' 09→14', 'tap the My gear tab', '#s09 .tabbar [data-tab="s14"]', 's14');
  await goTo(s + ' 14→09', 'tap the Bookings tab', '#s14 .tabbar [data-tab="s09"]', 's09');

  // ---------- 10 Tracking ----------
  s = S(); await goTo(s + ' 09→10', 'tap "Track delivery" (skip to Sat 7:22)', '#track09', 's10', { timeout: 12000 });
  await chk(s + ' 10', 'clock starts 7:22', '7:2', await clock());
  await chk(s + ' 10', 'ETA', '7:40', await txt('#eta-t'), { exact: true });
  await chk(s + ' 10', 'hand-over button waits', 'Waiting for the bike', await txt('#go11'), { exact: true });
  await chk(s + ' 10', 'courier named', 'Hafiz · Timah Cycles', await txt('#s10 .courier'), { known: 'FIXES 15', sev: 1, fix: 'Name the courier "Hafiz · Timah Cycles".' });
  await chk(s + ' 10', 'set-up row', 'Set to your fit · 24 Oct · 18:10 Saddle 72 cm · frame M · fork 25%', await txt('#s10 .fitrow'));
  try { await p.waitForFunction(() => !document.querySelector('#go11').disabled, null, { timeout: 15000 }); } catch (_) {}
  await chk(s + ' 10', 'clock at arrival', '7:40', await clock(), { exact: true });
  await chk(s + ' 10', 'arrived state', 'At the park entrance sign here now', (await txt('#eta-k')) + ' ' + (await txt('#eta-in')));
  await chk(s + ' 10', 'button after arrival', 'Start the hand-over check', await txt('#go11'), { exact: true });
  // back from 10 and in again: should not replay or lose arrival
  await goTo(s + ' 10→09', 'tap back on 10', '#s10 .back', 's09');
  await chk(s + ' 09', 'status clock after coming back from 10 (Sat 7:40)', '7:40', await clock(), { exact: true, sev: 2, fix: 'Coming back from 10 shows 09 at "Fri 24 Oct · 19:00" (clock 19:00) and the countdown "12 h 40 min", although it is now Sat 7:40 and the bike is at the sign. Either give 09 a "Sat 25 Oct · 7:40, bike is here" state or make 10 the end of the back path (back from 10 to 09 only after the hand-over).' , show: (await clock()) + ' | ' + (await txt('#d09'))});
  await goTo(s + ' 09→10', 'tap "Track delivery" again', '#track09', 's10', { timeout: 12000 });
  await chk(s + ' 10', 'still arrived on re-entry', 'Start the hand-over check', await txt('#go11'), { exact: true });

  // ---------- 11 Hand-over ----------
  s = S(); await goTo(s + ' 10→11', 'tap "Start the hand-over check"', '#go11', 's11');
  await chk(s + ' 11', 'status clock', '7:40', await clock(), { exact: true });
  await chk(s + ' 11', 'record columns before photos', 'Timah Cycles 18 Oct · 16:20 You Not taken yet', await txt('#s11 .cols'));
  await chk(s + ' 11', 'save disabled', 'Take 3 more photos (disabled)', (await txt('#save11')) + (await p.$eval('#save11', (b) => b.disabled ? ' (disabled)' : '')), { exact: true });
  for (const k of ['crank', 'saddle', 'drive']) await tap(`#s11 [data-shot="${k}"]`, { wait: 500 });
  await chk(s + ' 11', 'photo times', '25 Oct · 7:40 25 Oct · 7:40 25 Oct · 7:40', [await txt('#w-crank'), await txt('#w-saddle'), await txt('#w-drive')].join(' '), { exact: true });
  await chk(s + ' 11', 'you column after photos', '25 Oct · 7:40', await txt('#you-when'), { exact: true });
  await chk(s + ' 11', 'save asks for the marks', 'Mark the known marks', await txt('#save11'), { exact: true });
  await tap('#s11 [data-mark="crank"]'); await tap('#s11 [data-mark="saddle"]');
  await chk(s + ' 11', 'marks recorded with record time', 'Scratch recorded · 25 Oct · 7:40 Scuff recorded · 25 Oct · 7:40', (await txt('#mk-crank')) + ' ' + (await txt('#mk-saddle')), { exact: true });
  await chk(s + ' 11', 'save enabled', 'Save the hand-over record', await txt('#save11'), { exact: true });
  await tap('#s11 .reportrow', { wait: 200 });
  await chk(s + ' 11', 'report a problem', 'report form', (await toastText()) || (await onId()), { known: 'FIXES 11', sev: 1, fix: 'State not built yet (E5-6).' });
  await tap('#save11', { wait: 3500 });
  await chk(s + ' 11', 'record folded', 'Recorded · 25 Oct · 7:40 3 parts checked · 2 known marks · nothing new.', await txt('#filed11'));
  await chk(s + ' 11', 'button after saving', 'Ride · collected at 13:30', await txt('#save11'), { exact: true });
  await tap('#reopen11', { wait: 500 });
  await chk(s + ' 11', '"See all photos" reopens', 'Close the record', await txt('#reopen11'), { exact: true });
  await tap('#reopen11', { wait: 500 });

  // ---------- 12 Summary ----------
  s = S(); await goTo(s + ' 11→12', 'tap "Ride · collected at 13:30" (skip to 14:05)', '#save11', 's12', { timeout: 12000 });
  await p.waitForTimeout(3200);
  await chk(s + ' 12', 'status clock', '14:05', await clock(), { exact: true });
  await chk(s + ' 12', 'head', 'OR-10482 · closed', await txt('#s12 .bar-top .mid'), { exact: true });
  await chk(s + ' 12', 'hero', 'Trek Marlin 7 · Sat 25 Oct S$150 deposit released Nothing kept · 25 Oct · 14:05', await txt('#s12 .hero12'));
  const evl = await p.$$eval('#day .evl', (e) => e.map((x) => x.innerText.replace(/\s+/g, ' ')));
  await chk(s + ' 12', 'delivered line', '7:40 Delivered, set to your fit Chestnut trailhead carpark · saddle 72 cm', evl[0]);
  await chk(s + ' 12', 'ride line', '8:00–12:30 Coach Aisyah\'s Saturday ride Chestnut Nature Park', evl[1]);
  await chk(s + ' 12', 'collected line', '13:30 Collected As at hand-over, trail dirt only', evl[2]);
  await chk(s + ' 12', 'deposit line', '14:05 Deposit released S$150 back · S$50 paid in total', evl[3]);
  await chk(s + ' 12', 'paid / deposit / kept', 'Paid S$50 Deposit Released Kept S$0', await txt('#s12 .backs + dl'));
  await chk(s + ' 12', 'weekly offer terms', '7:40 delivery · 13:30 collection Place Chestnut trailhead carpark', await txt('#s12 .again .terms'));
  await chk(s + ' 12', 'weekly price', 'S$45 per ride, S$5 less than today', await txt('#s12 .again .price'));
  await chk(s + ' 12', 'first weekly date', '1 Nov', await txt('#s12 .weeks'));
  await chk(s + ' 12', 'secondary action is a way out', 'Back to Home', await txt('#s12 .again .link'), { known: 'FIXES 1', sev: 1, fix: 'Replace "Book a different bike" (toast) with "Back to Home".' });

  // ---------- 13 Weekly ----------
  s = S(); await goTo(s + ' 12→13', 'tap "Set up every Saturday"', '#weekly', 's13');
  await chk(s + ' 13', 'status clock', '14:06', await clock(), { exact: true });
  await chk(s + ' 13', 'front tag', 'Timah Cycles From 1 Nov Every Saturday Trek Marlin 7 · size M · set to your fit Deliver 7:40 Collect 13:30 Chestnut trailhead carpark, by the park entrance sign', await txt('#stack13 .front'));
  await chk(s + ' 13', 'money', 'S$45 per ride', await txt('#s13 .money13'));
  await chk(s + ' 13', 'week ruler', 'THU 20:00 · S$45 + HOLD', await p.$eval('#week13', (w) => w.textContent));
  await chk(s + ' 13', 'nothing charged today', 'Nothing is charged today.', await txt('#s13 .money13'));
  await goTo(s + ' 13→12', 'tap back on 13 ("Back to the summary")', '#s13 .back', 's12');
  await goTo(s + ' 12→13', 'tap "Set up every Saturday" again', '#weekly', 's13');
  await tap('#go13', { wait: 2200 });
  await chk(s + ' 13', 'after "Start every Saturday"', 'Every Saturday, from 1 Nov See it in Bookings', (await txt('#h13')) + ' ' + (await txt('#go13')), { exact: true });
  await chk(s + ' 13', 'skip/pause/stop shown', 'Skip 1 Nov', await txt('#ctl13'));
  await tap('#ctl13 button', { wait: 200 });
  await chk(s + ' 13', 'skip control', 'skip state', await toastText(), { known: 'FIXES 12', sev: 1, fix: 'State not built yet (E6-3).' });

  // ---------- 09 after the ride ----------
  s = S(); await goTo(s + ' 13→09', 'tap "See it in Bookings"', '#go13', 's09');
  await chk(s + ' 09', 'date line after the ride', 'Sat 25 Oct · 14:07', await txt('#d09'), { exact: true });
  await chk(s + ' 09', 'weekly up next', 'Timah Cycles · every Saturday From 1 Nov', await txt('#bk09 .bk-h'));
  await chk(s + ' 09', 'next ride countdown', 'Next ride, Sat 1 Nov, in 6 days 17 h', (await txt('#bk09 .board-k')) + ' ' + (await p.$eval('#bk09 .board', (b) => [...b.children].map((c) => c.dataset.d || c.textContent).join(' ').replace(/(\d) (\d)/g, '$1$2'))));
  await chk(s + ' 09', 'weekly times/place', 'Deliver 7:40, collect 13:30 · Chestnut trailhead carpark, by the park entrance sign', await txt('#bk09 .where9'), { exact: true });
  await chk(s + ' 09', 'first charge', 'THU 30 OCT · 20:00 · S$45 CHARGED', await p.$eval('#wk9', (w) => w.textContent));
  await chk(s + ' 09', 'past entry', 'Trek Marlin 7 · 25 Oct S$150 back · S$50 paid · closed 25 Oct · 14:05', await txt('#past09'));
  await chk(s + ' 09', 'no stale weekly offer', 'Make this every Saturday', await txt('#body09'), { not: true });
  await goTo(s + ' 09→13', 'tap "Open the weekly ride"', '#open13', 's13');
  await chk(s + ' 13', 're-entry keeps the set-up state', 'See it in Bookings', await txt('#go13'), { exact: true });
  await chk(s + ' 13', 'back label matches where back goes (opened from 09)', 'Back to Bookings', await p.$eval('#s13 .back', (b) => b.getAttribute('aria-label')), { sev: 1, fix: 'When 13 is opened from 09 the back button is labelled "Back to the summary" but goes to Bookings. Set the label from the stack (e.g. "Back to Bookings").' });
  await goTo(s + ' 13→09', 'tap back on 13', '#s13 .back', 's09');
  await goTo(s + ' 09→12', 'tap the Past entry', '#past09', 's12');
  await chk(s + ' 12', 'summary reopens from Past', 'S$150', await txt('#amt'), { exact: true });
  await goTo(s + ' 12→09', 'tap back on 12', '#s12 .back', 's09');
  await goTo(s + ' 09→01', 'tap the Home tab at the end', '#s09 .tabbar [data-tab="s01"]', 's01');

  // ---------- console ----------
  await rec('ERR', 'console errors and page errors over the whole journey', 'none', errs.join(' | ') || 'none', errs.length === 0, { sev: 2, fix: 'Fix the errors listed.' });

  const file = OUT + J + (ENGINE === 'webkit' ? '-webkit' : '') + '.json';
  fs.writeFileSync(file, JSON.stringify(R, null, 1));
  const passed = R.filter((r) => r.pass).length;
  console.log(`done ${J} ${passed}/${R.length}, ${R.length - passed} failures (${ENGINE})`);
  await browser.close();
})();
