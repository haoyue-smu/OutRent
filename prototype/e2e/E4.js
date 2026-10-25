// E4 · A careful renter who goes back and forth on 04–08.
// Run: cd /home/claude/review-tools && node /home/claude/review-out/e2e/E4.js
const pw = require(require.resolve('playwright', { paths: ['/home/claude/review-tools'] }));
const fs = require('fs');
const URL = 'http://localhost:8081/index.html';
const OUT = '/home/claude/review-out/e2e/';
const J = 'E4', PERSONA = 'Careful renter: taps Back on every page from 04 to 08 and goes forward again, opens and closes every sheet, ticks and unticks the terms, switches payment method';
fs.mkdirSync(OUT + 'shots', { recursive: true });
const R = []; let shotN = 0; const errs = []; let p;

async function check(step, action, expected, actual, pass, sev = 0, fix = '', known = null) {
  let shot = null;
  if (!pass) { shotN++; shot = `e2e/shots/${J}-${shotN}.png`; try { await p.screenshot({ path: OUT + 'shots/' + `${J}-${shotN}.png` }); } catch (e) {} }
  R.push({ journey: J, persona: PERSONA, step, action, expected, actual: String(actual), pass: !!pass, severity: pass ? 0 : sev, known, shot, fix: pass ? '' : fix });
  console.log(pass ? 'PASS' : 'FAIL', step, '|', String(actual).slice(0, 200));
}
const onIds = () => p.evaluate(() => [...document.querySelectorAll('.screen.on')].map((s) => s.id));
async function settle(timeout = 12000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) { const ids = await onIds(); const sk = await p.evaluate(() => getComputedStyle(document.getElementById('skip')).visibility); if (ids.length === 1 && sk === 'hidden') { await p.waitForTimeout(250); return ids[0]; } await p.waitForTimeout(150); }
  return (await onIds()).join('+');
}
async function waitScreen(id, timeout = 12000) { const t0 = Date.now(); let s; while (Date.now() - t0 < timeout) { s = await settle(timeout); if (s === id) return s; await p.waitForTimeout(150); } return s; }
const cur = () => settle();
const txt = (sel) => p.evaluate((sel) => { const e = document.querySelector(sel); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null; }, sel);
async function tap(sel, opts = {}) {
  const id = await cur();
  const loc = p.locator(`#${id} ${sel}`).first();
  try { await loc.scrollIntoViewIfNeeded({ timeout: 3000 }); await loc.click({ timeout: 4000 }); } catch (e) { console.log('!! tap failed', sel, e.message.split('\n')[0]); return false; }
  await p.waitForTimeout(opts.wait || 200); return true;
}
async function back(expect, label) {
  const from = await cur();
  const lab = await p.getAttribute(`#${from} [data-go="back"]`, 'aria-label').catch(() => null);
  await tap('[data-go="back"]'); const s = await waitScreen(expect, 5000);
  await check(`${from} Back`, `Tap Back ("${lab}") on ${from}`, `Lands on ${expect}${label ? ' (' + label + ')' : ''}`, s, s === expect, 3, `Back on ${from} must return to ${expect}.`);
  return s;
}
const st06 = () => p.evaluate(() => ({ pressed: [...document.querySelectorAll('#s06 .slot[aria-pressed="true"]')].map((b) => b.dataset.kind + b.dataset.t).join(','), qd: document.getElementById('q-d').textContent, qc: document.getElementById('q-c').textContent, marks: document.querySelectorAll('#ov06 .ovm').length, markT: [...document.querySelectorAll('#ov06 .ovm text')].map((t) => t.textContent).join(','), fee: document.getElementById('fee06').textContent, go: document.getElementById('go07').textContent.trim(), goDis: document.getElementById('go07').disabled, pld: document.getElementById('pl-d').textContent, plc: document.getElementById('pl-c').textContent, clash: !document.getElementById('clash').hidden }));
const st07 = () => p.evaluate(() => ({ lines: [...document.querySelectorAll('#s07 .stmt .ln')].map((l) => l.innerText.replace(/\s+/g, ' ').trim()).join(' | '), big: document.querySelector('#s07 .bill-h .big b').textContent, dep: document.querySelector('#s07 .dep2 b').textContent, pay: document.getElementById('pay07').innerText.trim(), payDis: document.getElementById('pay07').disabled, pm: document.getElementById('pm07').textContent, ic: document.querySelector('#s07 .pm-ic').textContent, ack: document.getElementById('ack07').checked, ft: document.getElementById('ft07').hidden }));
const LINES = 'This bike, 1 day S$38 | Delivery and collection S$12 | Setting it to your fit S$0';
const ok07 = (x) => x.lines === LINES && x.big === 'S$50' && /S\$150/.test(x.dep);
async function tick() { await p.locator('#ack07').evaluate((e) => e.closest('label').scrollIntoView({ block: 'center' })); await p.locator('label[for="ack07"]').click(); await p.waitForTimeout(250); }
async function pmChange() { await p.locator('#pmchg').scrollIntoViewIfNeeded(); await p.locator('#pmchg').click(); await p.waitForTimeout(250); }

(async () => {
  const b = await pw.chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, hasTouch: true, deviceScaleFactor: 2 });
  p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  await p.goto(URL, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);

  // ---- to 04 the normal way ----
  await p.locator('#kitcard').click(); await waitScreen('s02'); await p.waitForTimeout(900);
  await tap('[data-rent]'); await waitScreen('s03'); await p.waitForTimeout(1200);
  await tap('#save'); let s = await waitScreen('s04', 6000);
  await check('03 → 04', 'Save the seeded fit', 's04', s, s === 's04', 4, '');
  const res04 = async () => (await p.locator('#s04 .res .top').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ')).join(' | ');
  const r04a = await res04();
  await check('04 values', 'Read results', 'Marlin 7 S$50, Marlin 6 S$46, Aspect 950 S$45 all-in (MOCK §4, VS-1)', r04a, /Marlin 7 · M S\$50/.test(r04a) && /Marlin 6 · M S\$46/.test(r04a) && /Aspect 950 · M S\$45/.test(r04a), 3, '');

  // ---- 04: back and forward ----
  await back('s02', 'the coach post the search came from');
  await p.waitForTimeout(900); await tap('[data-rent]'); s = await waitScreen('s04', 6000);
  await check('02 → 04 again', 'Tap "Rent a hardtail" again (fit already saved)', 'Straight to 04, fit not asked again (E1-4)', s, s === 's04', 3, '');
  const r04b = await res04();
  await check('04 unchanged', 'Compare results after back/forward', 'Identical results, no duplicates', `${(await p.locator('#s04 .res').count())} results`, r04b === r04a && (await p.locator('#s04 .res').count()) === 3, 3, '');

  // ---- 05 ----
  await tap('#res-m7'); s = await waitScreen('s05');
  const v05 = async () => p.evaluate(() => ({ legend: document.querySelector('#s05 .pb-legend').innerText.replace(/\s+/g, ' '), total: document.querySelector('#s05 .pb-dim').innerText, fitfree: document.querySelector('#s05 .fitfree').innerText.replace(/\s+/g, ' '), dep: document.querySelector('#s05 .deposit b').innerText, dock: document.querySelector('#s05 .l-dock .p').innerText.replace(/\s+/g, ' '), cap: document.getElementById('cap').textContent }));
  let a05 = await v05();
  await check('05 values', 'Open the Marlin 7', 'S$38 + S$12 = S$50, set-up S$0, deposit S$150 (MOCK §4)', JSON.stringify(a05), /S\$38/.test(a05.legend) && /S\$12/.test(a05.legend) && a05.total === 'S$50' && /S\$0/.test(a05.fitfree) && /S\$150/.test(a05.dep) && /S\$50 all-in/.test(a05.dock), 3, '');
  // swipe the photo rail to photo 3 so we can see whether it is kept or reset
  await p.evaluate(() => { const r = document.getElementById('rail'); r.scrollLeft = r.clientWidth * 2; }); await p.waitForTimeout(500);
  await back('s04', '"Back to search"');
  await tap('#res-m7'); s = await waitScreen('s05');
  const b05 = await v05();
  await check('05 again', 'Forward to 05 again', 'Same values; photo caption back on photo 1 (rail reset) and consistent with the rail', JSON.stringify(b05), JSON.stringify({ ...b05, cap: '' }) === JSON.stringify({ ...a05, cap: '' }) && /Photo 1 of 5/.test(b05.cap), 2, 'When 05 resets rail.scrollLeft on entry, also reset the caption and tick (#cap, #t5) to photo 1.');

  // ---- 06 ----
  await tap('#choose'); s = await waitScreen('s06');
  let a06 = await st06();
  await check('06 empty', 'Arrive at 06', 'No times chosen, button disabled "Choose both times", fee "Choose both times"', JSON.stringify(a06), a06.pressed === '' && a06.goDis && a06.marks === 0, 3, '');
  await tap('.slot[data-kind="d"][data-t="8:00"]'); a06 = await st06();
  await check('06 8:00 clash', 'Pick delivery 8:00', 'Clash note shows (arrives as ride starts)', JSON.stringify(a06), a06.clash && a06.pressed === 'd8:00', 2, '');
  await tap('.slot[data-kind="d"][data-t="7:40"]'); await tap('.slot[data-kind="d"][data-t="7:40"]');
  await tap('.slot[data-kind="c"][data-t="13:30"]'); a06 = await st06();
  await check('06 chosen', 'Pick 7:40 (twice) and 13:30', 'Exactly d7:40,c13:30 pressed; 2 marks on the day line; fee S$12; button "See the fees" enabled; clash gone', JSON.stringify(a06), a06.pressed === 'd7:40,c13:30' && a06.marks === 2 && a06.fee === 'S$12' && !a06.goDis && !a06.clash, 3, '');
  // place: change twice = back to carpark
  await tap('.place[data-place="d"]'); const pl1 = (await st06()).pld; await tap('.place[data-place="d"]'); const pl2 = (await st06()).pld;
  await check('06 place twice', 'Tap delivery place "Change" twice', 'Home address then back to Chestnut trailhead carpark', `${pl1} → ${pl2}`, /325C/.test(pl1) && pl2 === 'Chestnut trailhead carpark', 2, '');
  await check('06 place control', 'Look at how a place is changed', '"Change" opens a choice of the two places (MOCK §4)', '"Change" silently toggles between the two places with no list; a careful user cannot see the options before tapping', false, 1, 'Make "Change" open a two-row sheet (carpark / home address) with the current one ticked.');
  await back('s05', '"Back to the listing"');
  await tap('#choose'); s = await waitScreen('s06'); const b06 = await st06();
  await check('06 kept', 'Forward to 06 again', 'Choices kept: 7:40 / 13:30 / carpark, 2 marks (no duplicate marks), fee S$12', JSON.stringify(b06), b06.pressed === 'd7:40,c13:30' && b06.marks === 2 && b06.fee === 'S$12' && !b06.goDis && b06.pld === 'Chestnut trailhead carpark', 3, '');

  // ---- 07 ----
  await tap('#go07'); s = await waitScreen('s07'); await p.waitForTimeout(800);
  let a07 = await st07();
  await check('07 arrive', 'Arrive at 07', 'S$38 + S$12 + S$0 = S$50, deposit S$150, pay disabled "Tick the terms to pay", PayNow', JSON.stringify(a07), ok07(a07) && a07.payDis && a07.pm === 'PayNow' && !a07.ack, 3, '');
  await back('s06', '"Back to delivery"');
  const c06 = await st06();
  await check('06 kept after 07', 'Read 06 after coming back from 07', 'Still 7:40 / 13:30, 2 marks', JSON.stringify(c06), c06.pressed === 'd7:40,c13:30' && c06.marks === 2, 3, '');
  await tap('#go07'); await waitScreen('s07'); await p.waitForTimeout(800);
  a07 = await st07();
  await check('07 again', 'Forward to 07 again', 'Same totals, pay still disabled', JSON.stringify(a07), ok07(a07) && a07.payDis, 3, '');

  // full terms: open, check covering, close; twice
  for (let k = 1; k <= 2; k++) {
    await tap('#readall07', { wait: 700 });
    const ft = await p.evaluate(() => { const f = document.getElementById('ft07'); const r = document.getElementById('pay07').getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { hidden: f.hidden, covers: !!(top && top.closest('#ft07')), text: f.innerText.replace(/\s+/g, ' ') }; });
    await check(`07 full terms open ${k}`, `Tap "Read the full terms" (${k})`, 'Full-screen terms; S$150 deposit, S$38 kept after 24 Oct · 20:00; pay button covered while open', `hidden=${ft.hidden}, covers pay=${ft.covers}`, !ft.hidden && ft.covers && /S\$150/.test(ft.text) && /S\$38/.test(ft.text) && /24 Oct · 20:00/.test(ft.text), 3, '');
    await p.locator('#ftclose').click(); await p.waitForTimeout(700);
    const fh = await p.evaluate(() => document.getElementById('ft07').hidden);
    await check(`07 full terms close ${k}`, `Tap X on the terms (${k})`, 'Terms closed, 07 as before', `hidden=${fh}`, fh, 3, '');
  }
  const ftEsc = await (async () => { await tap('#readall07', { wait: 700 }); await p.keyboard.press('Escape'); await p.waitForTimeout(600); const h = await p.evaluate(() => document.getElementById('ft07').hidden); if (!h) { await p.locator('#ftclose').click(); await p.waitForTimeout(700); } return h; })();
  await check('07 full terms Escape', 'Open the terms and press Escape (keyboard / hardware back)', 'Dialog (aria-modal) closes', `closed=${ftEsc}`, ftEsc, 1, 'Close #ft07 on Escape like the other sheets.');
  a07 = await st07();
  await check('07 after sheets', 'Read 07 after opening/closing sheets', 'Totals unchanged, pay still disabled, ack unticked', JSON.stringify(a07), ok07(a07) && a07.payDis && !a07.ack, 3, '');

  // tick / untick
  await tick(); a07 = await st07();
  await check('07 tick', 'Tick the terms', 'Pay enabled "Pay S$50 with PayNow"', a07.pay + ' disabled=' + a07.payDis, !a07.payDis && a07.pay === 'Pay S$50 with PayNow', 4, '');
  await tick(); a07 = await st07();
  await check('07 untick', 'Untick the terms', 'Pay disabled "Tick the terms to pay"', a07.pay + ' disabled=' + a07.payDis, a07.payDis && a07.pay === 'Tick the terms to pay', 4, '');
  // force-tap the disabled pay button
  await p.locator('#pay07').click({ force: true }).catch(() => {}); await p.waitForTimeout(800); s = await cur();
  await check('07 pay disabled tap', 'Tap Pay while terms unticked', 'Nothing happens (stays on 07)', s, s === 's07', 4, '');
  // payment method: PayNow → Visa → PayNow → Visa
  const seq = [];
  for (let k = 0; k < 3; k++) { await pmChange(); const x = await st07(); seq.push(`${x.pm}/${x.ic}/${x.pay}`); }
  await check('07 payment switch', 'Change payment method three times (unticked)', 'Visa ·4821 → PayNow → Visa ·4821; icon follows; pay stays disabled', seq.join(' → '), /^Visa ·4821\/VISA\/Tick/.test(seq[0]) && /^PayNow\/PN\/Tick/.test(seq[1]) && /^Visa ·4821\/VISA\/Tick/.test(seq[2]), 3, '');
  await check('07 payment control', 'Look at how the method is changed', 'A choice of the methods on file (E1-1 AC2: PayNow default, Visa ·4821 appear where payment is chosen)', '"Change" silently toggles; the other method on file is never listed', false, 1, 'Open a small sheet listing PayNow (default) and Visa ·4821.');
  await tick(); a07 = await st07();
  await check('07 tick with Visa', 'Tick the terms with Visa chosen', 'Pay enabled "Pay S$50 with Visa ·4821"', a07.pay, !a07.payDis && a07.pay === 'Pay S$50 with Visa ·4821', 3, '');
  await pmChange(); await pmChange(); a07 = await st07();
  await check('07 switch while ticked', 'Switch method twice while ticked', 'Button follows (PayNow then Visa), stays enabled, ack stays ticked', `${a07.pay}, ack=${a07.ack}`, a07.pay === 'Pay S$50 with Visa ·4821' && a07.ack && !a07.payDis, 3, '');
  // back to 06 and forward with ticked + Visa
  await back('s06', '"Back to delivery"');
  await tap('#go07'); await waitScreen('s07'); await p.waitForTimeout(800); a07 = await st07();
  await check('07 kept after back', 'Back to 06 and forward to 07 again', 'Ack and Visa kept, totals unchanged, pay enabled', JSON.stringify(a07), ok07(a07) && a07.ack && a07.pm === 'Visa ·4821' && !a07.payDis, 2, '');
  // stack integrity: walk Back all the way, then forward again
  const trail = [];
  for (const exp of ['s06', 's05', 's04', 's02', 's01']) { await tap('[data-go="back"]'); trail.push(await settle(5000)); }
  await check('stack 07→01', 'From 07 tap Back five times', 's06 → s05 → s04 → s02 → s01 (no page twice, no loop)', trail.join(' → '), trail.join(',') === 's06,s05,s04,s02,s01', 3, 'Back history duplicated somewhere; guard push() against pushing the current page.');
  await p.locator('#kitcard').click(); await waitScreen('s02'); await p.waitForTimeout(900); await tap('[data-rent]'); await waitScreen('s04'); await tap('#res-m7'); await waitScreen('s05'); await tap('#choose'); await waitScreen('s06');
  const d06 = await st06();
  await check('06 kept after Home', 'Back to Home and forward to 06 again', 'Choices kept (7:40 / 13:30) — state survives', JSON.stringify(d06), d06.pressed === 'd7:40,c13:30' && d06.marks === 2, 2, '');
  await tap('#go07'); await waitScreen('s07'); await p.waitForTimeout(800);

  // ---- pay ----
  await tap('#pay07', { wait: 50 }); s = await waitScreen('s08', 8000);
  await check('07 → 08', 'Tap "Pay S$50 with Visa ·4821"', 's08', s, s === 's08', 4, '');
  await p.waitForTimeout(2200);
  const t08 = await p.evaluate(() => document.getElementById('s08').innerText.replace(/\s+/g, ' '));
  const go08 = await txt('#tag08 .tg-go'), at08 = await txt('#tag08 .tg-at'), stamp = await txt('#stamp08');
  await check('08 values', 'Read the confirmation', 'OR-10482, deliver 25 Oct · 7:40, collect 25 Oct · 13:30, Chestnut carpark, Paid S$50 22 Oct, deposit S$150 held, cancel free until 24 Oct · 20:00', `${go08} · ${at08} · ${stamp}`, /OR-10482/.test(t08) && /25 Oct · 7:40/.test(go08) && /25 Oct · 13:30/.test(go08) && /Chestnut trailhead carpark/.test(at08) && /S\$50/.test(stamp) && /S\$150 deposit held/.test(t08) && /24 Oct · 20:00/.test(t08), 3, '');
  await check('08 payment method', 'Look for the method just paid with (Visa ·4821)', 'The confirmation says how it was paid ("Paid with Visa ·4821")', /Visa|4821|PayNow/.test(t08) ? 'shown' : 'Not shown anywhere on 08 (nor on 09)', /Visa ·4821|4821/.test(t08), 2, 'Add "Paid with Visa ·4821" (or PayNow) under the stamp / in the 08 small print and on 09\'s money line, filled from #pm07.');
  await check('08 back', 'Look for Back on 08', 'No Back into a paid checkout; Close goes Home', (await p.locator('#s08 [data-go="back"]').count()) ? 'Back present' : 'Only Close (X)', !(await p.locator('#s08 [data-go="back"]').count()), 3, '');
  await p.locator('#close08').click(); s = await waitScreen('s01');
  await check('08 close', 'Tap Close on 08', 's01 Home', s, s === 's01', 3, '');
  await check('01 after paying', 'Look at Home after paying', 'Home shows the upcoming rental (E0-1 AC1)', (await txt('#s01 .pad')).slice(0, 120), /OR-10482|Marlin 7|25 Oct · 7:40/.test(await txt('#s01')), 2, 'After 08, show the upcoming booking card at the top of Home (Trek Marlin 7 · Sat 25 Oct · 7:40 → 09).');

  // ---- go through again: is a fresh checkout clean? are new choices carried? ----
  await p.locator('#kitcard').click(); await waitScreen('s02'); await p.waitForTimeout(900); await tap('[data-rent]'); await waitScreen('s04'); await tap('#res-m7'); await waitScreen('s05'); await tap('#choose'); await waitScreen('s06');
  await tap('.slot[data-kind="d"][data-t="7:20"]'); await tap('.slot[data-kind="c"][data-t="14:30"]'); await tap('.place[data-place="d"]');
  const e06 = await st06();
  await check('06 second booking choices', 'Second time through: pick 7:20, 14:30, delivery to home', 'd7:20,c14:30 and home address shown', JSON.stringify(e06), e06.pressed === 'd7:20,c14:30' && /325C/.test(e06.pld) && e06.marks === 2, 3, '');
  await tap('#go07'); await waitScreen('s07'); await p.waitForTimeout(800); a07 = await st07();
  await check('07 fresh checkout', 'Arrive at 07 for a new checkout after the first was paid', 'Terms unticked, pay disabled (a new acknowledgement per booking)', `ack=${a07.ack}, pay="${a07.pay}"`, !a07.ack && a07.payDis, 2, 'Reset #ack07 (and the method to the default) when a booking is completed, or when 07 is entered from 06 for a new booking.');
  await check('07 times shown', 'Look for the chosen times before paying', '07 restates the chosen delivery/collection (7:20 · 14:30, home) so the careful renter can check them', (await txt('#bill07')).slice(0, 80), /7:20/.test(await txt('#bill07')), 2, 'Add one line under "Trek Marlin 7 · Sat 25 Oct": "Deliver 7:20 · Blk 325C … · collect 14:30 · carpark".');
  if (!a07.ack) await tick();
  await tap('#pay07', { wait: 50 }); s = await waitScreen('s08', 8000); await p.waitForTimeout(800);
  const go08b = await txt('#tag08 .tg-go'), at08b = await txt('#tag08 .tg-at'), id08b = await txt('#tag08 .tg-top');
  await check('08 carries times', 'Read 08 after paying for 7:20 / 14:30', 'Deliver 25 Oct · 7:20, collect 25 Oct · 14:30', go08b, /7:20/.test(go08b) && /14:30/.test(go08b), 3, 'Fill the 08 tag (Deliver/Collect) from book.d / book.c instead of fixed 7:40 / 13:30; same for 09, 10 ETA, 12 day line, 13 tag.');
  await check('08 carries place', 'Read 08 delivery place after choosing home', 'Blk 325C Sengkang East Way #11-42 for delivery, carpark for collection', at08b, /325C/.test(at08b), 3, 'Fill tg-at from book.place (show both places when they differ).');
  await check('08 second booking ID', 'Read the booking ID of the second booking', 'A second booking gets its own ID, or the app prevents booking the same bike/day twice', id08b, !/OR-10482/.test(id08b), 2, 'Either block a second checkout for the same unit and day ("Already booked: OR-10482") or give it a new ID.');
  await tap('#track08'); s = await waitScreen('s09', 9000);
  const w09 = await txt('#s09 .where9'), n09 = await p.locator('#s09 .bk').count();
  await check('09 carries choices', 'Read Bookings after the second payment', 'Up next shows 7:20 / home address; one card per booking, no silent overwrite', `${n09} card(s); ${w09}`, /325C/.test(w09 || ''), 3, 'Render 09 from book.*.');

  // ---- hardware / browser back ----
  await p.locator('#s09 .tabbar [data-tab="s01"]').click(); await waitScreen('s01'); await p.locator('#kitcard').click(); await waitScreen('s02');
  await p.goBack({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(1000);
  const urlAfter = p.url();
  await check('browser back', 'Use the phone / browser Back gesture on 02', 'Goes back one page inside the app (01)', `URL after: ${urlAfter}`, /localhost:8081/.test(urlAfter), 2, 'Push a history entry per screen (location.hash = #NN on push) and call back() on popstate, so system Back stays inside the app.');

  await check('console', 'Collect console and page errors', 'No errors', errs.length ? errs.join(' || ') : 'none', errs.length === 0, 2, 'Fix the logged errors.');
  fs.writeFileSync(OUT + J + '.json', JSON.stringify(R, null, 1));
  const passed = R.filter((r) => r.pass).length;
  console.log(`done ${J} ${passed}/${R.length}, ${R.length - passed} failures`);
  await b.close();
})();
