// E5 · Daniel as a weekly regular. Run: cd /home/claude/review-tools && node /home/claude/review-out/e2e/E5.js [chromium|webkit]
// Taps only from Home (no #NN jumps, no page functions). Writes E5.json (results) and shots/E5-n.png on failure.
const path = require('path');
const pw = require(path.join('/home/claude/review-tools/node_modules', 'playwright'));
const fs = require('fs');
const OUT = '/home/claude/review-out/e2e/';
const J = 'E5', PERSONA = 'Daniel Lim (weekly regular)';
const ENGINE = process.argv[2] || 'chromium';
const R = []; let nshot = 0;

(async () => {
  const b = await pw[ENGINE].launch();
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 1, hasTouch: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  await p.goto('http://localhost:8081/index.html', { waitUntil: 'networkidle' });

  const on = () => p.evaluate(() => [...document.querySelectorAll('.screen.on')].map((s) => s.id).join(','));
  const waitOn = async (id, t = 15000) => { try { await p.waitForFunction((id) => { const a = [...document.querySelectorAll('.screen.on')].map((s) => s.id); return a.length === 1 && a[0] === id && getComputedStyle(document.querySelector('#skip')).visibility !== 'visible'; }, id, { timeout: t }); } catch (e) {} await p.waitForTimeout(700); return on(); };
  const txt = (sel) => p.evaluate((sel) => { const e = document.querySelector(sel); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null; }, sel);
  const scr = async () => txt('.screen.on');
  const clock = () => txt('#clock');
  const toastNow = () => p.evaluate(() => { const t = document.querySelector('#toast'); return t && t.classList.contains('on') ? t.textContent.trim() : null; });
  const rec = async (step, action, expected, actual, pass, sev = 0, known = null, fix = '') => {
    let shot = null;
    if (!pass) { nshot++; shot = `e2e/shots/${J}-${nshot}.png`; await p.screenshot({ path: '/home/claude/review-out/' + shot }).catch(() => {}); }
    R.push({ journey: J, persona: PERSONA, step, action, expected, actual: String(actual).slice(0, 400), pass: !!pass, severity: pass ? 0 : sev, known, shot, fix: pass ? '' : fix });
    console.log(pass ? 'PASS' : 'FAIL', step, '|', String(actual).slice(0, 160));
  };
  const tap = async (loc, wait = 900) => { await loc.scrollIntoViewIfNeeded({ timeout: 4000 }).catch(() => {}); await loc.click({ timeout: 4000 }); await p.waitForTimeout(wait); };
  const byText = (t, exact = false) => p.locator('.screen.on').getByText(t, { exact }).first();
  const has = (s, ...parts) => parts.every((x) => s && s.toLowerCase().includes(x.toLowerCase()));

  // ---------- 01 → 08: the first rental ----------
  let id = await waitOn('s01');
  let t = await scr();
  await rec('E5-01', 'Open the app', 's01 Home, Wed 22 Oct', `${id} · ${t.slice(0, 80)}`, id === 's01' && has(t, 'Wed 22 Oct'));
  await tap(p.locator('#kitcard')); id = await waitOn('s02');
  await rec('E5-02', 'Tap the coach post', 's02', id, id === 's02');
  await p.waitForTimeout(900);
  await tap(p.locator('#s02 [data-rent]').first()); id = await waitOn('s03');
  await rec('E5-03', 'Tap "Rent a hardtail for Sat 25 Oct"', 's03 Fit profile (first time)', id, id === 's03');
  t = await scr();
  await rec('E5-03b', 'Read fit values', 'saddle 72 cm, frame M (176/81)', t.match(/72 cm|frame M|\bM\b/g)?.join(',') || t.slice(0, 120), has(t, '72') );
  await tap(p.locator('#save'), 1800); id = await waitOn('s04');
  await rec('E5-04', 'Save fit', 's04 Search', id, id === 's04');
  await tap(p.locator('#res-m7'), 1200); id = await waitOn('s05');
  await rec('E5-05', 'Tap Trek Marlin 7 result', 's05 Listing', id, id === 's05');
  await tap(p.locator('#choose')); id = await waitOn('s06');
  await rec('E5-06', 'Choose delivery', 's06', id, id === 's06');
  await tap(p.locator('#s06 .slot[data-kind="d"][data-t="7:40"]'), 500);
  await tap(p.locator('#s06 .slot[data-kind="c"][data-t="13:30"]'), 500);
  const pl = await txt('#pl-d'), plc = await txt('#pl-c'), fee = await txt('#fee06');
  await rec('E5-06b', 'Pick 7:40 delivery and 13:30 collection', 'Chestnut trailhead carpark both ways, S$12', `${pl} / ${plc} / ${fee}`, has(pl, 'Chestnut') && has(plc, 'Chestnut') && fee === 'S$12');
  await tap(p.locator('#go07'), 1200); id = await waitOn('s07');
  await rec('E5-07', 'See the fees', 's07', id, id === 's07');
  await p.locator('#ack07').check({ force: true }); await p.waitForTimeout(400);
  const payT = await txt('#pay07');
  await rec('E5-07b', 'Tick the terms', 'Pay S$50 with PayNow', payT, payT === 'Pay S$50 with PayNow');
  await tap(p.locator('#pay07'), 2500); id = await waitOn('s08');
  t = await scr();
  await rec('E5-08', 'Pay', 's08, OR-10482, S$50', `${id} · ${t.slice(0, 160)}`, id === 's08' && has(t, 'OR-10482', 'S$50'));
  await p.waitForTimeout(3000);

  // ---------- 08 → 09 → 10 → 11 → 12 ----------
  await tap(byText('See it in Bookings'), 500); id = await waitOn('s09', 12000);
  t = await txt('#s09');
  await rec('E5-09', 'See it in Bookings', 's09 Fri 24 Oct · 19:00, OR-10482, 12 h 40 min, weekly offer row', `${id} · ${t.slice(0, 200)}`, id === 's09' && has(t, 'Fri 24 Oct · 19:00', 'OR-10482', 'Make this every Saturday'));
  await tap(p.locator('#track09'), 500); id = await waitOn('s10', 15000);
  await rec('E5-10', 'Track delivery (time skip)', 's10', id, id === 's10');
  await p.waitForFunction(() => !document.querySelector('#go11').disabled, null, { timeout: 20000 }).catch(() => {});
  await tap(p.locator('#go11'), 500); id = await waitOn('s11');
  await rec('E5-11', 'Start the hand-over check', 's11', id, id === 's11');
  for (const k of ['crank', 'saddle', 'drive']) await tap(p.locator(`#s11 .shot[data-shot="${k}"]`), 700);
  for (const k of ['crank', 'saddle']) await tap(p.locator(`#s11 .markbtn[data-mark="${k}"]`), 500);
  await tap(p.locator('#save11'), 4500);
  const sv = await txt('#save11');
  await rec('E5-11b', 'Take 3 photos, circle 2 marks, save the record', 'button reads "Ride · collected at 13:30"', sv, sv === 'Ride · collected at 13:30');
  await tap(p.locator('#save11'), 500); id = await waitOn('s12', 15000);
  t = await txt('#s12');
  await rec('E5-12', 'Ride · collected (time skip)', 's12 closed OR-10482, S$150 released, S$50 paid, 25 Oct · 14:05', `${id} · ${t.slice(0, 200)}`, id === 's12' && has(t, 'OR-10482', 'S$150', 'S$50', '25 Oct · 14:05'));
  await rec('E5-12b', 'Read the weekly offer on 12', 'S$45, from 1 Nov, 7:40 / 13:30, Chestnut, charged Thu · 20:00', t.slice(t.indexOf('Ride again'), t.indexOf('Ride again') + 260), has(t, 'S$45', '1 Nov', '7:40 delivery · 13:30 collection', 'Chestnut trailhead carpark', 'Thu · 20:00'));
  await rec('E5-12c', 'Read the secondary action on 12', 'one primary (weekly) and one exit ("Back to Home")', await txt('#s12 .again .link'), (await txt('#s12 .again .link')) !== 'Book a different bike', 1, 'FIXES 1', '12: replace "Book a different bike" (a toast) with "Back to Home".');
  await tap(p.locator('#s12 [data-go]'), 500); id = await waitOn(await on());
  const back12 = id, ck12 = await clock(), t11 = await txt('#save11');
  await rec('E5-12d', 'Tap back (label "Back") on the closed summary', 'a page that still makes sense after the ride (Bookings), not the 7:40 hand-over', `${back12} · clock ${ck12} · button "${t11}"`, back12 === 's09', 2, null, '12 reached by the time skip from 11: back should land on 09 Bookings (clear the 10/11 stack when the rental closes), not on the 7:40 hand-over.');
  if (back12 === 's11') { await tap(p.locator('#save11'), 500); id = await waitOn('s12', 15000); }
  await rec('E5-12e', 'Forward again from 11 to 12', 's12 again, time skip replays, nothing duplicated', `${id} · ${(await txt('#s12')).slice(0, 60)}`, id === 's12');
  // ---------- 12 → 13 set up ----------
  await tap(p.locator('#weekly'), 500); id = await waitOn('s13');
  t = await txt('#s13');
  await rec('E5-13', 'Set up every Saturday', 's13: From 1 Nov, 7:40 / 13:30, Chestnut trailhead carpark by the park entrance sign, S$45 per ride, Thu 20:00 + S$150 hold', `${id} · ${t.slice(0, 260)}`, id === 's13' && has(t, 'From 1 Nov', '7:40', '13:30', 'by the park entrance sign', 'S$45 per ride', 'S$150'));
  const wk13 = await p.evaluate(() => document.querySelector('#week13 svg')?.textContent || '');
  await rec('E5-13b', 'Read the week ruler', 'THU 20:00 · S$45 + HOLD, RIDE 7:40–13:30', wk13, has(wk13, 'THU 20:00 · S$45', 'RIDE 7:40–13:30'));
  await rec('E5-13c', 'Check the clock on 13', '14:06 (Sat, after the ride)', await clock(), (await clock()) === '14:06');
  await tap(p.locator('#go13'), 2200);
  const h13 = await txt('#h13'), go13 = await txt('#go13'), ctlHidden = await p.locator('#ctl13').isHidden();
  await rec('E5-13d', 'Start every Saturday', 'heading "Every Saturday, from 1 Nov", controls Skip 1 Nov / Pause / Stop shown, button "See it in Bookings", nothing charged', `${h13} | ${go13} | ctl hidden=${ctlHidden}`, h13 === 'Every Saturday, from 1 Nov' && go13 === 'See it in Bookings' && !ctlHidden);
  // skip / pause / stop
  for (const [lbl, k] of [['Skip 1 Nov', 'skip'], ['Pause', 'pause'], ['Stop', 'stop']]) {
    await tap(p.locator('#ctl13 button', { hasText: lbl }), 300);
    const to = await toastNow(); id = await on(); const after = await txt('#ctl13');
    await rec(`E5-13-${k}`, `Tap ${lbl}`, `${lbl} acts per FD-RECURRING (skip 1 Nov free before Thu 30 Oct · 20:00; pause/stop from Sat 1 Nov, nothing charged)`, `toast: "${to}" · screen ${id} · controls unchanged: ${after}`, false, 2, 'FIXES 12', '13: build the skip / pause / stop states (E6-3): skip marks 1 Nov skipped and moves "next ride" to 8 Nov; pause and stop confirm "from Sat 1 Nov, nothing charged", and 09 reflects it.');
    await rec(`E5-13-${k}-safe`, `After ${lbl}: nothing broke`, 'still on s13, heading and button unchanged', `${id} · ${await txt('#h13')} · ${await txt('#go13')}`, id === 's13' && (await txt('#go13')) === 'See it in Bookings');
    await p.waitForTimeout(2300);
  }
  // back from 13 to 12: does 12 still sell the offer?
  await tap(p.locator('#s13 [data-go]'), 500); id = await waitOn('s12');
  t = await txt('#s12');
  await rec('E5-13e', 'Back from 13 (label "Back to the summary")', 's12, and its weekly block now shows it is set up', `${id} · ${t.slice(t.indexOf('Ride again'), t.indexOf('Ride again') + 120)}`, id === 's12' && !has(t, 'Set up every Saturday'), 2, null, '12: once S.weekly is true, replace "Ride again every Saturday / Set up every Saturday" with a set-up line ("Every Saturday from 1 Nov · set up") and "See it in Bookings".');
  await tap(p.locator('#weekly'), 500); id = await waitOn('s13');
  await rec('E5-13f', 'Tap "Set up every Saturday" again', 's13 keeps the started state (no second series)', `${id} · ${await txt('#h13')} · ${await txt('#go13')}`, id === 's13' && (await txt('#go13')) === 'See it in Bookings');
  await tap(p.locator('#go13'), 500); id = await waitOn('s09');

  // ---------- 09 after setup ----------
  t = await txt('#s09');
  await rec('E5-14', 'See it in Bookings', 's09 Sat 25 Oct · 14:07', `${id} · ${t.slice(0, 40)}`, id === 's09' && has(t, 'Sat 25 Oct · 14:07'));
  await rec('E5-14b', 'Check the weekly ride in Up next', 'Trek Marlin 7 · size M, every Saturday, from 1 Nov, deliver 7:40, collect 13:30, Chestnut trailhead carpark, by the park entrance sign', t.slice(0, 300), has(t, 'Up next', 'Trek Marlin 7 · size M', 'every Saturday', 'From 1 Nov', 'Deliver 7:40, collect 13:30', 'by the park entrance sign'));
  await rec('E5-14c', 'Check next ride date and countdown', 'Next ride, Sat 1 Nov, in 6 days 17 h (25 Oct 14:07 → 1 Nov 7:40)', (t.match(/Next ride[^·]*?h/) || [t])[0], has(t, 'Next ride, Sat 1 Nov, in') && /6\s*days\s*1\s*7\s*h/i.test(t));
  const wk9 = await p.evaluate(() => { const s = document.querySelector('#wk9 svg'); return s ? s.textContent + ' | aria: ' + s.getAttribute('aria-label') : ''; });
  await rec('E5-14d', 'Check the charge date and amount', 'Thu 30 Oct · 20:00 · S$45 (skip deadline Thu 30 Oct · 20:00)', wk9, has(wk9, 'THU 30 OCT · 20:00', 'S$45'));
  await rec('E5-14e', 'Check the charge wording at 25 Oct', 'the 30 Oct charge reads as upcoming (it has not happened yet)', wk9.split('|')[0], !/CHARGED/.test(wk9), 2, null, '09 wk9 ruler: "S$45 CHARGED" on 30 Oct is in the past tense while "now" is 25 Oct; use "S$45 CHARGED THEN" or "CHARGE S$45 · SKIP BEFORE".');
  await rec('E5-14f', 'Look for skip deadline / deposit on 09', 'card says skip before Thu 30 Oct · 20:00 and the S$150 deposit is held then', t.slice(0, 400), has(t, 'S$150') || /skip/i.test(t), 1, null, '09 weekly card: add one line "Skip or pause before Thu 30 Oct · 20:00 · S$45 + S$150 deposit held then" (only the SVG carries the charge).');
  await rec('E5-14g', 'Check Past', 'Past: Trek Marlin 7 · 25 Oct, S$150 back, S$50 paid, closed 25 Oct · 14:05', t.slice(t.indexOf('Past')), has(t, 'Past', 'Trek Marlin 7 · 25 Oct', 'S$150 back', 'S$50 paid', 'closed 25 Oct · 14:05'));
  await rec('E5-14h', 'Weekly offer row gone', 'no "Ride the Marlin 7 every Saturday" offer once set up', has(t, 'Ride the Marlin 7 every Saturday') ? 'offer still shown' : 'offer gone', !has(t, 'Ride the Marlin 7 every Saturday'));
  // open Past → 12
  await tap(p.locator('#past09'), 500); id = await waitOn('s12');
  t = await txt('#s12');
  await rec('E5-15', 'Open the closed OR-10482 from Past', 's12 closed record: S$150 released, S$50 paid, 25 Oct · 14:05', `${id} · ${t.slice(0, 100)}`, id === 's12' && has(t, 'S$150', 'S$50', '25 Oct · 14:05'));
  await rec('E5-15a', 'Weekly block on 12 opened from Past', 'shows the series is set up, not the offer', (t.match(/Ride again every Saturday.*?Set up every Saturday/) || ['(no offer)'])[0].slice(0, 120), !has(t, 'Set up every Saturday'), 2, null, '12: when S.weekly, the "again" block should read "Every Saturday from 1 Nov · set up" with "Open the weekly ride".');
  await tap(p.locator('#s12 [data-go]'), 500); id = await waitOn('s09');
  await rec('E5-15b', 'Back from 12 to Bookings', 'back on s09 with state intact', `${id} · ${(await txt('#s09')).slice(0, 80)}`, id === 's09' && has(await txt('#s09'), 'Next ride, Sat 1 Nov'));
  // open the weekly ride again
  await tap(p.locator('#open13'), 500); id = await waitOn('s13');
  t = await txt('#s13');
  const goTxt = await txt('#go13'), ctlv = !(await p.locator('#ctl13').isHidden());
  await rec('E5-16', 'Open the weekly ride from Bookings', 's13 reads as the set-up series (heading "from 1 Nov", Skip/Pause/Stop shown), not the offer', `${await txt('#h13')} | lede: ${await txt('#s13 .lede')} | ctl shown=${ctlv} | button: ${goTxt}`, has(t, 'Every Saturday, from 1 Nov') && ctlv && !has(t, 'Start every Saturday'));
  await rec('E5-16b', 'Read 13 when opened from Bookings', 'no set-up offer copy ("Nothing is charged today") once the series exists', (t.match(/Nothing is charged today[^.]*\./) || ['(none)'])[0], !has(t, 'Nothing is charged today'), 2, null, '13 (set-up state): replace "Nothing is charged today." with the series facts: "Next charge Thu 30 Oct · 20:00 · S$45, then S$150 deposit held"; the lede "This bike … at the trailhead each week" is fine.');
  await rec('E5-16c', 'Button on 13 when opened from Bookings', 'a way back that matches where Daniel came from (Back to Bookings), not "See it in Bookings"', goTxt, goTxt !== 'See it in Bookings', 1, null, '13 opened from 09: the dock button should read "Back to Bookings" (or be hidden); "See it in Bookings" while coming from Bookings reads like the offer flow.');
  const bl = await p.locator('#s13 [data-go]').getAttribute('aria-label');
  await tap(p.locator('#s13 [data-go]'), 500); id = await waitOn('s09');
  await rec('E5-16d', `Tap back on 13 (label "${bl}")`, 'label matches the landing page (09 Bookings)', `label "${bl}" → ${id}`, id === 's09' && !/summary/i.test(bl), 1, null, '13 back button: set aria-label from the stack ("Back to Bookings" when the previous screen is s09).');
  // tabs mid-flow: My gear and back
  await tap(p.locator('#s09 .tabbar [data-tab="s14"]'), 500); id = await waitOn('s14');
  await tap(p.locator('#s14 .tabbar [data-tab="s09"]'), 500); id = await waitOn('s09');
  t = await txt('#s09');
  await rec('E5-17', 'Tab to My gear and back to Bookings', 'weekly ride and Past still there', `${id} · ${t.slice(0, 120)}`, id === 's09' && has(t, 'Next ride, Sat 1 Nov', 'Past'));

  // ---------- Home ----------
  await tap(p.locator('#s09 .tabbar [data-tab="s01"]'), 500); id = await waitOn('s01');
  t = await txt('#s01');
  const ck = await clock();
  await rec('E5-18', 'Tab to Home', 's01', id, id === 's01');
  await rec('E5-18b', 'Home date and clock after the ride', 'Home shows Sat 25 Oct (14:07) like Bookings, not Wed 22 Oct 9:01', `${(t.match(/^[^G]*/) || [''])[0].trim()} · clock ${ck} · "${(t.match(/Good \w+, Daniel/) || [''])[0]}"`, !has(t, 'Wed 22 Oct') && ck !== '9:01', 2, null, '01 Home: after S.closed, show "Sat 25 Oct", "Good afternoon, Daniel" and the 14:07 clock (CLOCK.s01 is fixed at 9:01); time runs backwards when tabbing from Bookings 14:07 to Home 9:01.');
  await rec('E5-18c', 'Home shows the weekly ride', 'Home surfaces "Next ride Sat 1 Nov · 7:40" (or similar) once the series exists', has(t, '1 Nov') ? 'shown' : 'Home has no trace of the weekly ride or the closed rental', has(t, '1 Nov'), 2, null, '01 Home: when S.weekly, add an "Up next" card (Every Saturday · next ride Sat 1 Nov · 7:40 · Chestnut) linking to 09 / 13.');
  await rec('E5-18d', 'Home "This weekend" card', 'no longer promotes the ride that is over (Sat 25 Oct · 8:00–12:30)', (t.match(/This weekend.*?what to bring/) || ['(none)'])[0], !has(t, 'Sat 25 Oct · 8:00–12:30'), 1, null, '01 Home: after the ride closes, retire or relabel the Chestnut post ("Done · 25 Oct").');
  await tap(p.locator('#s01 .promo.weekly'), 300);
  const wto = await toastNow();
  await rec('E5-18e', 'Tap the Weekly rides promo on Home', 'opens the set-up weekly ride (13) or Bookings, since one exists', `toast: "${wto}" · screen ${await on()}`, (await on()) !== 's01', 2, null, '01 Home weekly promo: when S.weekly, open 13 (set-up state) or 09; the toast "Weekly rides are set up after a first rental." contradicts the series Daniel just set up.');
  await p.waitForTimeout(2300);
  // Home → Bookings: state survives
  await tap(p.locator('#s01 .tabbar [data-tab="s09"]'), 500); id = await waitOn('s09');
  t = await txt('#s09');
  await rec('E5-19', 'Home → Bookings tab', 'weekly ride and Past survive', `${id} · ${t.slice(0, 80)}`, id === 's09' && has(t, 'Next ride, Sat 1 Nov', 'Past'));
  // try the coach post again: can Daniel re-enter the booking flow without breaking state?
  await tap(p.locator('#s09 .tabbar [data-tab="s01"]'), 500); await waitOn('s01');
  await tap(p.locator('#kitcard'), 500); id = await waitOn('s02');
  await tap(p.locator('#s02 [data-rent]').first(), 500); id = await waitOn('s04');
  await rec('E5-20', 'Re-open the coach post and Rent again', 's04 (fit saved, skips 03), no error', id, id === 's04');
  await tap(p.locator('#s04 [data-go]').first(), 500); id = await waitOn('s02');
  await tap(p.locator('#s02 [data-go]').first(), 500); id = await waitOn('s01');
  await rec('E5-20b', 'Back, back', 'Home', id, id === 's01');

  await rec('E5-99', 'Console and page errors over the whole run', 'none', errs.length ? errs.join(' || ') : 'none', errs.length === 0, 3, null, 'Fix the listed errors.');
  if (ENGINE === 'chromium') fs.writeFileSync(OUT + J + '.json', JSON.stringify(R, null, 1));
  else fs.writeFileSync('/tmp/claude-0/-home-claude/68b24517-6428-5d76-af73-4b726260d887/scratchpad/' + J + '-' + ENGINE + '.json', JSON.stringify(R, null, 1));
  const f = R.filter((r) => !r.pass);
  console.log(`done ${J} ${R.length - f.length}/${R.length}, ${f.length} failures`);
  await b.close();
})().catch((e) => { console.error('CRASH', e); process.exit(1); });
