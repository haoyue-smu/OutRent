// E2 · Daniel makes different choices (fit 170/78, home delivery 7:20, collection 17:30 then 14:30, Visa). Run: cd /home/claude/review-tools && node /home/claude/review-out/e2e/E2.js
// Taps only from Home (no #hash jumps, no page functions). Asserts that every later page shows HIS choices, not the MOCK-DATA defaults.
const path = require('path');
const pw = require(path.join('/home/claude/review-tools/node_modules', 'playwright'));
const fs = require('fs');
const J = 'E2', PERSONA = 'Daniel Lim · different choices (fit 170/78, home delivery 7:20, collect 14:30, Visa)';
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

  // E2 choices
  const H = 170, L = 78, SAD = String(Math.round(L * 0.883)), FRAME = 'M'; // 69 cm, frame M (Fit rules on 03)
  const HOME = 'Blk 325C Sengkang East Way #11-42', PARK = 'Chestnut trailhead carpark';
  const FB = 'Carry-through: the page is static HTML. Render it on enter from the state 03/06/07 already keep (fit.height, fit.leg, book.d, book.c, book.place.d/.c, the pay method).';
  const board = () => p.$eval('#bk09 .board', (b) => [...b.children].map((c) => c.dataset.d || c.textContent).join(' ').replace(/(\d) (\d)/g, '$1$2')).catch(() => '(no board)');
  async function dragTape(sel, readSel, target) {
    await p.locator(sel).scrollIntoViewIfNeeded();
    const box = await p.locator(sel).boundingBox();
    const cur = +(await txt(readSel)); const dx = (cur - target) * 11; // 11 px per cm; dragging right lowers the value
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    await p.mouse.move(cx, cy); await p.mouse.down();
    for (let i = 1; i <= 12; i++) await p.mouse.move(cx + dx * i / 12, cy);
    await p.mouse.up(); await p.waitForTimeout(600);
    return +(await txt(readSel));
  }

  // ---------- 01 → 02 → 03 ----------
  await p.goto('http://localhost:8081/index.html', { waitUntil: 'networkidle' });
  await waitScreen('s01');
  let s = S();
  await rec(s + ' 01', 'open prototype with no hash', 'screen s01', 'screen ' + (await onId()), (await onId()) === 's01');
  await goTo(s + ' 01→02', 'tap the coach card', '#kitcard', 's02');
  await p.waitForTimeout(900);
  await goTo(s + ' 02→03', 'tap "Rent a hardtail for Sat 25 Oct"', '#s02 [data-rent]', 's03');
  await p.waitForTimeout(1200);

  // ---------- 03: change the fit ----------
  s = S();
  const gotH = await dragTape('#tape-height', '#v-height', H);
  await chk(s + ' 03', `drag the height tape to ${H}`, String(H), String(gotH), { exact: true, sev: 2, fix: 'Height tape does not land on the dragged value.' });
  const gotL = await dragTape('#tape-leg', '#v-leg', L);
  await chk(s + ' 03', `drag the inside-leg tape to ${L}`, String(L), String(gotL), { exact: true, sev: 2, fix: 'Inside-leg tape does not land on the dragged value.' });
  await chk(s + ' 03', 'derived saddle / frame update live', `Saddle ${SAD}cm Frame ${FRAME} Fork sag 25% Bars +1cm`, await txt('#fitgrid'));
  await chk(s + ' 03', 'Save button back to idle after edit', 'Save fit', await txt('#save'), { exact: true });
  await goTo(s + ' 03→04', 'tap "Save fit"', '#save', 's04', { timeout: 6000 });

  // ---------- 04 ----------
  s = S();
  await chk(s + ' 04', 'query uses his frame', `Hardtail ${FRAME} · Chestnut · Sat 25 Oct`, await txt('#s04 .query .q'), { exact: true });
  await chk(s + ' 04', 'results: frame size on each card', `Trek Marlin 7 · ${FRAME}`, await txt('#res-m7 .top'));
  await chk(s + ' 04', 'results say set to his fit', 'Set to your fit before delivery', await txt('#res-m7 .fit'));

  // ---------- 05 ----------
  s = S(); await goTo(s + ' 04→05', 'tap the Trek Marlin 7 result', '#res-m7', 's05');
  await chk(s + ' 05', 'fit numbers on the listing follow 03', `Saddle ${SAD}cm Frame ${FRAME} Fork sag 25% Bars +1cm`, await txt('#fitgrid5'), { sev: 3, fix: `05 "Set to your fit before delivery" grid is hard-coded to saddle 72. Fill #fitgrid5 from fit (saddle = round(leg × 0.883), frame = Fit.frame(height)) on enter. ${FB}` });
  await chk(s + ' 05', 'fit source line follows 03', `From your height ${H} cm and inside leg ${L} cm`, await txt('#setfor'), { sev: 3, fix: '05 source line is hard-coded "From your height 176 cm and inside leg 81 cm". Write fit.height and fit.leg into it on enter.' });
  s = S(); await goTo(s + ' 05→03', 'tap "Edit fit" on the listing', '#s05 a[data-push="s03"]', 's03');
  await p.waitForTimeout(1200);
  await chk(s + ' 03', 'profile kept his values on re-entry', `${H} ${L} ${SAD}`, `${await txt('#v-height')} ${await txt('#v-leg')} ${await txt('#g-saddle')}`, { exact: true });
  await goTo(s + ' 03→05', 'tap "Save fit": returns to the listing', '#save', 's05', { timeout: 6000 });
  await chk(s + ' 05', 'listing after the edit round trip', `Saddle ${SAD}cm`, await txt('#fitgrid5'), { sev: 3, fix: 'Same as above: 05 must re-render its fit grid when coming back from 03.' });

  // ---------- 06: home delivery, other times ----------
  s = S(); await goTo(s + ' 05→06', 'tap "Choose delivery"', '#choose', 's06');
  await tap('#s06 [data-place="d"]', { wait: 500 });
  await chk(s + ' 06', 'tap "Change" on delivery: home address', `${HOME} Your home address`, await txt('#s06 [data-place="d"] .pl'), { exact: true });
  await chk(s + ' 06', 'collection place stays the carpark (chosen separately)', `${PARK} By the park entrance sign`, await txt('#s06 [data-place="c"] .pl'), { exact: true });
  await tap('#s06 .slot[data-kind="d"][data-t="8:00"]');
  await chk(s + ' 06', 'tap 8:00: clash note shows', 'shown', await p.$eval('#clash', (c) => c.hidden ? 'hidden' : 'shown'), { exact: true });
  await tap('#s06 .slot[data-kind="d"][data-t="7:20"]');
  await chk(s + ' 06', 'tap 7:20: clash note hides', 'hidden', await p.$eval('#clash', (c) => c.hidden ? 'hidden' : 'shown'), { exact: true });
  await tap('#s06 .slot[data-kind="c"][data-t="17:30"]');
  await chk(s + ' 06', 'leg headings', 'Arrives 7:20 Collected 17:30', (await txt('#q-d')) + ' ' + (await txt('#q-c')), { exact: true });
  await chk(s + ' 06', 'only the tapped slots pressed', '7:20 17:30', await p.$$eval('#s06 .slot[aria-pressed="true"]', (b) => b.map((x) => x.dataset.t).join(' ')), { exact: true });
  await chk(s + ' 06', 'day line shows his picks', '7:20 17:30', await p.$$eval('#ov06 .ovm text', (t) => t.map((x) => x.textContent).join(' ')), { exact: true });
  await chk(s + ' 06', 'fee (MOCK-DATA has no separate home fee; S$12 stands)', 'S$12', await txt('#fee06'), { exact: true });
  await chk(s + ' 06', 'hand-over spot photo matches the delivery place', HOME, await txt('#s06 .spot figcaption'), { sev: 1, fix: 'With delivery at home, the "Hand-over spot" photo still shows only the carpark sign. Label it as the collection spot, or show both hand-over points (home door for delivery, sign for collection).' });

  // ---------- 07: switch to Visa ----------
  s = S(); await goTo(s + ' 06→07', 'tap "See the fees"', '#go07', 's07');
  await chk(s + ' 07', 'total', 'S$50 today, all in', await txt('#s07 .bill-h'));
  await chk(s + ' 07', 'charges', 'This bike, 1 day S$38 Delivery and collection S$12 Setting it to your fit S$0', await txt('#s07 .stmt'));
  await p.$eval('#sc07', (sc) => sc.scrollTop = sc.scrollHeight); await p.waitForTimeout(500);
  await tap('#pmchg');
  await chk(s + ' 07', 'tap "Change" on payment: Visa', 'Visa ·4821 VISA', (await txt('#pm07')) + ' ' + (await txt('#s07 .pm-ic')), { exact: true });
  await tap('#s07 label.ack');
  await chk(s + ' 07', 'pay button names Visa', 'Pay S$50 with Visa ·4821', await txt('#pay07'), { exact: true });
  await chk(s + ' 07', 'full terms: his hand-over time', 'your own photos at 25 Oct · 7:20', await p.$eval('#ft07', (f) => f.textContent.replace(/\s+/g, ' ')), { sev: 3, fix: '07 full terms say "your own photos at 25 Oct · 7:40" whatever delivery time was chosen. Use book.d (the hand-over happens at delivery).' });
  await chk(s + ' 07', 'deposit return date', 'return check on 25 Oct', await txt('#s07 .dep2'));
  await chk(s + ' 07', 'back button label', 'Back to delivery', await p.$eval('#s07 .back', (b) => b.getAttribute('aria-label')), { exact: true });

  // ---------- back to 06, change collection ----------
  s = S(); await goTo(s + ' 07→06', 'tap back on 07', '#s07 .back', 's06');
  await chk(s + ' 06', 'choices kept on coming back', `${HOME} | 7:20 17:30 | See the fees`, `${await txt('#pl-d')} | ${await p.$$eval('#s06 .slot[aria-pressed="true"]', (b) => b.map((x) => x.dataset.t).join(' '))} | ${await txt('#go07')}`, { exact: true });
  await tap('#s06 .slot[data-kind="c"][data-t="14:30"]');
  await chk(s + ' 06', 'change collection to 14:30', 'Collected 14:30', await txt('#q-c'), { exact: true });
  await chk(s + ' 06', 'day line updates', '7:20 14:30', await p.$$eval('#ov06 .ovm text', (t) => t.map((x) => x.textContent).join(' ')), { exact: true });
  await goTo(s + ' 06→07', 'tap "See the fees" again', '#go07', 's07');
  await chk(s + ' 07', 'total still S$50', 'S$50', await txt('#s07 .bill-h .big b'), { exact: true });
  await chk(s + ' 07', 'payment choice kept (Visa)', 'Visa ·4821', await txt('#pm07'), { exact: true });
  await chk(s + ' 07', 'terms tick kept, pay button consistent', 'Pay S$50 with Visa ·4821', `${await txt('#pay07')}${await p.$eval('#ack07', (a) => a.checked ? '' : ' (tick cleared)')}`, { exact: true });

  // ---------- 08 ----------
  s = S(); await goTo(s + ' 07→08', 'tap "Pay S$50 with Visa ·4821"', '#pay07', 's08', { timeout: 8000 });
  await p.waitForTimeout(2200);
  await chk(s + ' 08', 'tag fit follows 03', `Saddle ${SAD}cm`, await txt('#tag08 .tg-set'), { sev: 3, fix: `08 job tag saddle is hard-coded 72. ${FB}` });
  await chk(s + ' 08', 'tag deliver time', 'Deliver 25 Oct · 7:20', await txt('#tag08 .tg-go'), { sev: 3, fix: '08 tag "Deliver 25 Oct · 7:40" is hard-coded; use book.d.' });
  await chk(s + ' 08', 'tag collect time', 'Collect 25 Oct · 14:30', await txt('#tag08 .tg-go'), { sev: 3, fix: '08 tag "Collect 25 Oct · 13:30" is hard-coded; use book.c (E4-2 AC2: the confirmation reflects the same collection).' });
  await chk(s + ' 08', 'tag place: delivery at home', HOME, await txt('#tag08 .tg-at'), { sev: 3, fix: '08 tag place is hard-coded to the carpark; when the two places differ show both ("Deliver to Blk 325C …, collect at Chestnut trailhead carpark").' });
  await chk(s + ' 08', 'paid amount', 'Paid S$50', await txt('#stamp08'));
  await chk(s + ' 08', 'banner time', 'Trek Marlin 7 · 25 Oct · 7:20', await txt('#banner08'), { sev: 3, fix: '08 notification banner "25 Oct · 7:40" is hard-coded; use book.d.' });
  const visa08 = /visa/i.test(await txt('#s08'));
  await rec(s + ' 08', 'payment method after paying (info: no page after 07 shows the method, so it cannot fall back)', 'Visa ·4821 if shown', visa08 ? 'Visa shown' : 'method not shown on 08 (stamp shows only "Paid S$50")', true);

  // ---------- 09 ----------
  s = S(); await goTo(s + ' 08→09', 'tap "See it in Bookings"', '#track08', 's09', { timeout: 12000 });
  await p.waitForTimeout(1500);
  await chk(s + ' 09', 'countdown to his 7:20 delivery (19:00 → 7:20)', '12 h 20 min', await board(), { sev: 3, fix: '09 countdown is hard-coded "12 h 40 min" (to 7:40); compute from book.d. Also its label "Arrives at the trailhead in" should follow the delivery place.' });
  await chk(s + ' 09', 'countdown label names his delivery place', 'Arrives at home in', await txt('#bk09 .board-k'), { sev: 3, fix: '09 "Arrives at the trailhead in" is hard-coded; with home delivery it should read e.g. "Arrives at your home in".' });
  await chk(s + ' 09', 'set-up proof follows 03', `Saddle ${SAD} cm`, await txt('#bk09 .proof9s'), { sev: 3, fix: `09 proof row "Saddle 72 cm" is hard-coded. ${FB}` });
  await chk(s + ' 09', 'place line', HOME, await txt('#bk09 .where9'), { sev: 3, fix: '09 place line is hard-coded to the carpark; show delivery and collection places from book.place.' });
  await chk(s + ' 09', 'money line', 'S$50 paid · S$150 deposit held', await txt('#bk09 p.small'));

  // ---------- 10 ----------
  s = S(); await goTo(s + ' 09→10', 'tap "Track delivery"', '#track09', 's10', { timeout: 12000 });
  await chk(s + ' 10', 'ETA is his time', '7:20', await txt('#eta-t'), { exact: true, sev: 3, fix: '10 ETA "7:40" is hard-coded and the clock runs 7:22 → 7:40; with a 7:20 slot the run must end at 7:20 (start it earlier, e.g. 7:02, or scale the run to book.d). The van leaves the shop 7:05 in MOCK-DATA, so 7:20 needs its own stage times (gap for the PO).' });
  await chk(s + ' 10', 'destination is his home', 'home', await txt('#eta-k'), { sev: 3, fix: '10 "Arriving · park entrance sign", the map end pin "PARK ENTRANCE SIGN" and the courier line "Bringing your bike to the sign" are hard-coded; with home delivery they must name Blk 325C (needs a home-route map or at least the destination label).' });
  await chk(s + ' 10', 'set-up row follows 03', `Saddle ${SAD} cm`, await txt('#s10 .fitrow'), { sev: 3, fix: `10 set-up row "Saddle 72 cm" is hard-coded. ${FB}` });
  try { await p.waitForFunction(() => !document.querySelector('#go11').disabled, null, { timeout: 15000 }); } catch (_) {}
  await chk(s + ' 10', 'clock at arrival equals his slot', '7:20', await clock(), { exact: true, sev: 3, fix: 'Clock at arrival should be book.d (7:20), not 7:40.' });
  await chk(s + ' 10', 'arrived label names his place', 'home', (await txt('#eta-k')) + ' | ' + (await txt('#s10 .courier')), { sev: 3, fix: 'Arrived state "At the park entrance sign · Waiting by the sign with your bike" is hard-coded; name the chosen delivery place.' });

  // ---------- 11 ----------
  s = S(); await goTo(s + ' 10→11', 'tap "Start the hand-over check"', '#go11', 's11');
  await chk(s + ' 11', 'status clock is his hand-over time', '7:20', await clock(), { exact: true, sev: 3, fix: 'CLOCK.s11 is fixed at 7:40; use book.d.' });
  for (const k of ['crank', 'saddle', 'drive']) await tap(`#s11 [data-shot="${k}"]`, { wait: 500 });
  await tap('#s11 [data-mark="crank"]'); await tap('#s11 [data-mark="saddle"]');
  await chk(s + ' 11', 'photo times are his hand-over time', '25 Oct · 7:20', await txt('#w-crank'), { exact: true, sev: 3, fix: '11 photo/record times "25 Oct · 7:40" are hard-coded in build11 and the HTML (#w-*, #you-when, #mk-*, alt texts); use book.d (MOCK-DATA §4: Daniel\'s record time is the hand-over time).' });
  await chk(s + ' 11', 'marks carry the record time', 'Scratch recorded · 25 Oct · 7:20', await txt('#mk-crank'), { exact: true, sev: 3, fix: 'Mark times hard-coded 7:40; use the record time (book.d).' });
  await tap('#save11', { wait: 3500 });
  await chk(s + ' 11', 'record slip time', 'Recorded · 25 Oct · 7:20', await txt('#filed11'), { sev: 3, fix: '"Recorded · 25 Oct · 7:40" hard-coded; use book.d.' });
  await chk(s + ' 11', 'next button names his collection', 'Ride · collected at 14:30', await txt('#save11'), { exact: true, sev: 3, fix: '11 button "Ride · collected at 13:30" is hard-coded; use book.c.' });

  // ---------- 12 ----------
  s = S();
  await tap('#save11', { wait: 700 });
  const cap12 = await txt('#skcap');
  await chk(s + ' 11→12', 'time-skip caption names his collection', 'Collected at 14:30', cap12, { sev: 2, fix: 'skipTo caption "Collected at 13:30" and the skip marks (7:40, 13:30) are hard-coded; build them from book.d / book.c.' });
  const ok12 = await waitScreen('s12', 12000);
  await rec(s + ' 11→12', 'land on the summary', 'screen s12', 'screen ' + (await onId()), ok12);
  await p.waitForTimeout(3200);
  const evl = await p.$$eval('#day .evl', (e) => e.map((x) => x.innerText.replace(/\s+/g, ' ')));
  await chk(s + ' 12', 'delivered line time', '7:20 Delivered', evl[0], { sev: 3, fix: '12 day line "7:40 Delivered" is hard-coded (text and data-t); use book.d.' });
  await chk(s + ' 12', 'delivered line place + saddle', `${HOME} · saddle ${SAD} cm`, evl[0], { sev: 3, fix: '12 "Chestnut trailhead carpark · saddle 72 cm" hard-coded; use the delivery place and fit.' });
  await chk(s + ' 12', 'collected line time', '14:30 Collected', evl[2], { sev: 3, fix: '12 "13:30 Collected" hard-coded; use book.c and place it on the drawn scale accordingly.' });
  const hero12 = await txt('#s12 .hero12'), rel = (hero12.match(/(\d{1,2}):(\d\d)\s*$/) || []).slice(1).map(Number), relH = rel.length ? rel[0] + rel[1] / 60 : 0;
  await rec(s + ' 12', 'deposit release comes after his 14:30 collection', 'release time later than 14:30', hero12 + ' | ' + evl[3], relH > 14.5, { sev: 3, fix: 'Hero and day line say the deposit was released 25 Oct · 14:05, which is before his 14:30 collection: impossible. The release must follow the return check at collection (MOCK-DATA has 35 min after 13:30; PO to set the rule, e.g. collection + 35 min = 15:05). The 12 status clock (14:05) and 09 "closed 25 Oct · 14:05" follow from it.' });
  await chk(s + ' 12', 'photos heading names his hand-over time', 'Checked against the 7:20 photos', await txt('#s12'), { sev: 3, fix: '"Checked against the 7:40 photos" hard-coded; use book.d.' });
  await chk(s + ' 12', 'weekly offer copies his times', '7:20 delivery · 14:30 collection', await txt('#s12 .again .terms'), { sev: 3, fix: 'Weekly offer terms "7:40 delivery · 13:30 collection" hard-coded. FD-RECURRING is created from the closed booking, so copy book.d / book.c (or let Daniel pick weekly times).' });
  await chk(s + ' 12', 'weekly offer copies his place', HOME, await txt('#s12 .again .terms'), { sev: 3, fix: 'Weekly offer place hard-coded "Chestnut trailhead carpark"; copy the booking\'s places.' });

  // ---------- 13 ----------
  s = S(); await goTo(s + ' 12→13', 'tap "Set up every Saturday"', '#weekly', 's13');
  await chk(s + ' 13', 'tag times', 'Deliver 7:20 Collect 14:30', await txt('#stack13 .front .tg-go'), { sev: 3, fix: '13 tag "Deliver 7:40 / Collect 13:30" hard-coded; use the booking\'s times.' });
  await chk(s + ' 13', 'tag place', HOME, await txt('#stack13 .front .tg-at'), { sev: 3, fix: '13 tag place hard-coded to the carpark; also the lede "at the trailhead each week".' });
  await chk(s + ' 13', 'week ruler ride window', 'RIDE 7:20–14:30', await p.$eval('#week13', (w) => w.textContent), { sev: 3, fix: '13 week ruler "RIDE 7:40–13:30" hard-coded in build13; use the booking\'s times.' });
  await chk(s + ' 13', 'price', 'S$45 per ride', await txt('#s13 .money13'));
  await tap('#go13', { wait: 2200 });
  s = S(); await goTo(s + ' 13→09', 'tap "See it in Bookings"', '#go13', 's09');
  await chk(s + ' 09', 'weekly card times/place', `Deliver 7:20, collect 14:30 · ${HOME}`, await txt('#bk09 .where9'), { sev: 3, fix: '09 weekly card "Deliver 7:40, collect 13:30 · Chestnut trailhead carpark…" hard-coded in render09; use the weekly series\' times/places.' });
  await chk(s + ' 09', 'next ride countdown (Sat 14:07 → Sat 1 Nov 7:20)', '6 days 17 h', await board());
  await chk(s + ' 09', 'past entry closed time follows the release', 'closed 25 Oct · 14:05', await txt('#past09'), { sev: 3, not: true, show: await txt('#past09'), fix: 'Past entry "closed 25 Oct · 14:05" precedes his 14:30 collection; derive from the release time.' });
  await chk(s + ' 09', 'past entry amounts', 'S$150 back · S$50 paid', await txt('#past09'));

  // ---------- console ----------
  await rec('ERR', 'console errors and page errors over the whole journey', 'none', errs.join(' | ') || 'none', errs.length === 0, { sev: 2, fix: 'Fix the errors listed.' });

  const file = OUT + J + (ENGINE === 'webkit' ? '-webkit' : '') + '.json';
  fs.writeFileSync(file, JSON.stringify(R, null, 1));
  const passed = R.filter((r) => r.pass).length;
  console.log(`done ${J} ${passed}/${R.length}, ${R.length - passed} failures (${ENGINE})`);
  await browser.close();
})();
