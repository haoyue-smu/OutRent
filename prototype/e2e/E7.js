// E7 · Chaos: tabs mid-flow, double taps, taps during time skips and the van ride, reloads, reduced motion.
// Run: cd /home/claude/review-tools && node /home/claude/review-out/e2e/E7.js
const pw = require(require.resolve('playwright', { paths: ['/home/claude/review-tools'] }));
const fs = require('fs');
const URL = 'http://localhost:8081/index.html';
const OUT = '/home/claude/review-out/e2e/';
const J = 'E7', PERSONA = 'Impatient, distracted user: switches tabs mid-flow, double-taps, taps while animations run, reloads, and also uses the phone with reduced motion on';
fs.mkdirSync(OUT + 'shots', { recursive: true });
const R = []; let shotN = 0; const errs = []; let p, browser, ctx;

async function check(step, action, expected, actual, pass, sev = 0, fix = '', known = null) {
  let shot = null;
  if (!pass) { shotN++; shot = `e2e/shots/${J}-${shotN}.png`; try { await p.screenshot({ path: OUT + 'shots/' + `${J}-${shotN}.png` }); } catch (e) {} }
  R.push({ journey: J, persona: PERSONA, step, action, expected, actual: String(actual), pass: !!pass, severity: pass ? 0 : sev, known, shot, fix: pass ? '' : fix });
  console.log(pass ? 'PASS' : 'FAIL', step, '|', String(actual).slice(0, 220));
}
const onIds = () => p.evaluate(() => [...document.querySelectorAll('.screen.on')].map((s) => s.id));
const skipVis = () => p.evaluate(() => getComputedStyle(document.getElementById('skip')).visibility);
async function settle(timeout = 14000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) { const ids = await onIds(); if (ids.length === 1 && (await skipVis()) === 'hidden') { await p.waitForTimeout(300); const ids2 = await onIds(); if (ids2.length === 1 && ids2[0] === ids[0]) return ids[0]; } await p.waitForTimeout(150); }
  return (await onIds()).join('+') + ((await skipVis()) === 'visible' ? ' (skip overlay stuck)' : '');
}
async function waitScreen(id, timeout = 14000) { const t0 = Date.now(); let s; while (Date.now() - t0 < timeout) { s = await settle(timeout); if (s === id) return s; await p.waitForTimeout(150); } return s; }
const cur = () => settle();
const txt = (sel) => p.evaluate((sel) => { const e = document.querySelector(sel); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null; }, sel);
async function tap(sel, wait = 250) {
  const id = (await onIds()).slice(-1)[0];
  const loc = p.locator(`#${id} ${sel}`).first();
  try { await loc.scrollIntoViewIfNeeded({ timeout: 3000 }); await loc.click({ timeout: 4000 }); } catch (e) { console.log('!! tap failed', sel, e.message.split('\n')[0]); return false; }
  await p.waitForTimeout(wait); return true;
}
async function dbl(sel, gap = 90) { // a real double tap with a finger on the same spot
  const id = (await onIds()).slice(-1)[0];
  const loc = p.locator(`#${id} ${sel}`).first(); await loc.scrollIntoViewIfNeeded(); const bb = await loc.boundingBox();
  const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
  await p.touchscreen.tap(x, y); await p.waitForTimeout(gap); await p.touchscreen.tap(x, y);
}
const tapAt = (x, y) => p.touchscreen.tap(x, y);
async function fresh(opts = {}) {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, hasTouch: true, deviceScaleFactor: 2, ...opts });
  p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  await p.goto(URL, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
}
const waitArrive = () => p.waitForFunction(() => !document.getElementById('go11').disabled, null, { timeout: 20000 }).catch(() => {});
// the normal route, tap by tap; each step names the state it leaves the app in
const STEPS = [
  ['s02', async () => { await p.locator('#kitcard').click(); await waitScreen('s02'); await p.waitForTimeout(1000); }],
  ['s03', async () => { await tap('[data-rent]'); await waitScreen('s03'); await p.waitForTimeout(1300); }],
  ['s04', async () => { await tap('#save'); await waitScreen('s04'); }],
  ['s05', async () => { await tap('#res-m7'); await waitScreen('s05'); }],
  ['s06', async () => { await tap('#choose'); await waitScreen('s06'); }],
  ['s06b', async () => { await tap('.slot[data-kind="d"][data-t="7:40"]'); await tap('.slot[data-kind="c"][data-t="13:30"]'); }],
  ['s07', async () => { await tap('#go07'); await waitScreen('s07'); await p.waitForTimeout(900); }],
  ['s07b', async () => { await p.locator('#ack07').evaluate((e) => e.closest('label').scrollIntoView({ block: 'center' })); await p.locator('label[for="ack07"]').click(); await p.waitForTimeout(250); }],
  ['s08', async () => { await tap('#pay07'); await waitScreen('s08'); await p.waitForTimeout(1500); }],
  ['s09', async () => { await tap('#track08'); await waitScreen('s09'); }],
  ['s10', async () => { await tap('#track09'); await waitScreen('s10'); await waitArrive(); }],
  ['s11', async () => { await tap('#go11'); await waitScreen('s11'); }],
  ['s11b', async () => { for (const k of ['crank', 'saddle', 'drive']) await tap(`.shot[data-shot="${k}"]`, 400); for (const k of ['crank', 'saddle']) await tap(`.markbtn[data-mark="${k}"]`, 300); }],
  ['s11c', async () => { await tap('#save11'); await p.waitForTimeout(3200); }],
  ['s12', async () => { await tap('#save11'); await waitScreen('s12'); await p.waitForTimeout(3500); }],
  ['s13', async () => { await tap('#weekly'); await waitScreen('s13'); await p.waitForTimeout(1200); }],
  ['s13b', async () => { await tap('#go13'); await p.waitForTimeout(2200); }],
  ['s09w', async () => { await tap('#go13'); await waitScreen('s09'); }],
  ['s14', async () => { await p.locator('#s09 .tabbar [data-tab="s14"]').click(); await waitScreen('s14'); }],
  ['s15', async () => { await tap('#open15'); await waitScreen('s15'); }],
  ['s16', async () => { await tap('#go15'); await waitScreen('s16'); }],
  ['s17', async () => { await tap('#go16'); await waitScreen('s17'); }],
  ['s17b', async () => { await tap('.opt[data-path="home"]'); await p.waitForTimeout(700); }],
  ['s17c', async () => { await tap('#go17'); await p.waitForTimeout(2000); }],
  ['s15h', async () => { await tap('#go17'); await waitScreen('s15'); }],
];
async function walkTo(label, opts) { await fresh(opts); for (const [l, f] of STEPS) { await f(); if (l === label) break; } }

(async () => {
  browser = await pw.chromium.launch();

  // ================= A. tabs in the middle of every flow =================
  await fresh();
  const flowNoTabs = [];
  for (const [l, f] of STEPS) {
    await f();
    const id = (await onIds()).slice(-1)[0];
    const hasTab = await p.locator(`#${id} nav.tabbar`).count(), hasWayBack = await p.locator(`#${id} [data-go="back"], #${id} #close08, #${id} #go13`).count();
    if (!['s09', 's09w', 's14'].includes(l)) flowNoTabs.push(`${id}:${hasTab ? 'TABS' : 'no tabs'}${hasWayBack ? '+back' : ' NO WAY BACK'}`);
    if (l === 's15h') break;
  }
  await check('A tabs on flow pages', 'Look for the tab bar on every flow page 02–08, 10–13, 15–17', 'Flow pages leave root navigation behind and each has a way back (E0-2 AC3)', [...new Set(flowNoTabs)].join(' · '), flowNoTabs.every((x) => /no tabs\+back/.test(x)), 2, 'Give every flow page a Back or Close.');

  // A1 · leave the booking at 06 for the tabs, then return
  await walkTo('s06b');
  for (let i = 0; i < 4; i++) await tap('[data-go="back"]', 600);
  let s = await cur();
  await check('A1 back to Home', 'From 06 (times chosen) tap Back until Home', 's01 after 4 Backs (06→05→04→02→01)', s, s === 's01', 3, '');
  await p.locator('#s01 .tabbar [data-tab="s09"]').click(); s = await waitScreen('s09');
  const b09 = await txt('#body09');
  await check('A1 Bookings mid-booking', 'Tap Bookings in the middle of a booking that is not paid', 'Bookings shows nothing booked (the booking is not paid)', b09.slice(0, 140), /Nothing booked/.test(b09), 3, 'Drive 09 from a "paid" flag set by pay07; before it, show the no-bookings state.');
  await p.locator('#s09 .tabbar [data-tab="s14"]').click(); s = await waitScreen('s14');
  await p.locator('#s14 .tabbar button').nth(3).click(); await p.waitForTimeout(300); s = await cur();
  await p.locator('#s14 .tabbar [data-tab="s01"]').click(); s = await waitScreen('s01');
  await check('A1 tab round trip', 'Bookings → My gear → Profile → Home', 'Each tab lands; Profile toasts; ends on Home', s, s === 's01', 3, '');
  await p.locator('#kitcard').click(); await waitScreen('s02'); await p.waitForTimeout(1000); await tap('[data-rent]'); s = await waitScreen('s04');
  await tap('#res-m7'); await waitScreen('s05'); await tap('#choose'); await waitScreen('s06');
  const kept = await p.evaluate(() => [...document.querySelectorAll('#s06 .slot[aria-pressed="true"]')].map((b) => b.dataset.t).join(','));
  await check('A1 return to booking', 'Back into the booking from Home', 'Fit not asked again; 06 keeps 7:40 / 13:30', `via ${s}; 06 pressed ${kept}`, s === 's04' && kept === '7:40,13:30', 2, '');

  // A2 · leave the tracking flow mid-ride for the tabs
  await walkTo('s09');
  await tap('#track09'); await waitScreen('s10'); await p.waitForTimeout(2500);
  await tap('[data-go="back"]'); s = await waitScreen('s09');
  await p.locator('#s09 .tabbar [data-tab="s14"]').click(); await waitScreen('s14');
  await p.locator('#s14 .tabbar [data-tab="s01"]').click(); await waitScreen('s01');
  await p.locator('#s01 .tabbar [data-tab="s09"]').click(); s = await waitScreen('s09');
  const b09b = await txt('#body09');
  await check('A2 Bookings after tabs', 'Leave tracking mid-ride, visit My gear and Home, come back to Bookings', 'Same OR-10482 Up next, countdown 12 h 40 min, S$50 paid, S$150 held', b09b.slice(0, 160), /OR-10482/.test(b09b) && /S\$50 paid/.test(b09b) && /S\$150 deposit held/.test(b09b), 3, '');
  await tap('#track09'); s = await waitScreen('s10');
  const samples = [];
  for (let k = 0; k < 6; k++) { samples.push(await p.evaluate(() => ({ clock: document.getElementById('clock').textContent, in: document.getElementById('eta-in').textContent, k: document.getElementById('eta-k').textContent, btn: document.getElementById('go11').textContent.trim(), dis: document.getElementById('go11').disabled }))); await p.waitForTimeout(1200); }
  const incons = samples.filter((x) => (!x.dis && x.in !== 'here now') || (x.dis && /At the park/.test(x.k)));
  await check('A2 tracking re-entry', 'Track delivery again after leaving mid-ride', 'The ride either restarts cleanly or shows "here now"; button, ETA and clock agree', samples.map((x) => `${x.clock} ${x.in} [${x.dis ? 'wait' : 'go'}]`).join(' · '), incons.length === 0, 2, 'In intro10 kill the previous tween (gsap.killTweensOf(o) / keep the tween in a variable and .kill() it on leave) and reset s10 ("here" class, eta-k, courier line) before a new run; never let the old onComplete fire arrive() under a new run.');
  // A2b · same, but come straight back while the first van is still driving (race between two rides)
  await walkTo('s09');
  await tap('#track09'); await waitScreen('s10'); await p.waitForTimeout(1500);
  await tap('[data-go="back"]'); await waitScreen('s09'); await tap('#track09'); await waitScreen('s10');
  const samples2 = [];
  for (let k = 0; k < 8; k++) { samples2.push(await p.evaluate(() => ({ clock: document.getElementById('clock').textContent, in: document.getElementById('eta-in').textContent, k: document.getElementById('eta-k').textContent, dis: document.getElementById('go11').disabled }))); await p.waitForTimeout(1000); }
  const inc2 = samples2.filter((x) => (!x.dis && x.in !== 'here now') || (x.dis && /At the park/.test(x.k)) || (/At the park/.test(x.k) && x.in !== 'here now'));
  await check('A2b tracking quick re-entry', 'Back out of tracking 1.5 s into the ride and Track again at once', 'One ride: clock, ETA, label and button agree throughout', samples2.map((x) => `${x.clock} ${x.in} "${x.k}" [${x.dis ? 'wait' : 'go'}]`).join(' · '), inc2.length === 0, 2, 'In intro10 keep the ride tween in a variable and kill it before starting a new one (and on leaving 10); reset the "here" class, eta-k and courier line at the start of each run so the old onComplete cannot call arrive() mid-ride.');
  const back10 = await (async () => { await waitArrive(); await tap('#go11'); await waitScreen('s11'); await tap('[data-go="back"]'); return cur(); })();
  await check('A2 back from 11', 'Open hand-over and tap Back', 's10 ("Back to tracking")', back10, back10 === 's10', 3, '');

  // A3 · storage flow, tab away from 17 and return
  await walkTo('s17b');
  for (let i = 0; i < 3; i++) await tap('[data-go="back"]', 700);
  s = await cur();
  await p.locator(`#${s} .tabbar [data-tab="s01"]`).click().catch(() => {}); await waitScreen('s01');
  await p.locator('#s01 .tabbar [data-tab="s14"]').click(); await waitScreen('s14');
  await tap('#open15'); await waitScreen('s15'); await tap('#go15'); await waitScreen('s16'); await tap('#go16'); s = await waitScreen('s17');
  const st17 = await p.evaluate(() => ({ pressed: [...document.querySelectorAll('#s17 .opt[aria-pressed="true"]')].map((o) => o.dataset.path).join(','), go: document.getElementById('go17').textContent.trim(), dis: document.getElementById('go17').disabled }));
  await check('A3 storage return', 'From 17 (door chosen) Back to My gear, tab Home, tab My gear, back into 17', 'Choice kept and button matches it ("Book door pickup · S$10"), or cleanly reset', JSON.stringify(st17), (st17.pressed === 'home' && /door pickup · S\$10/.test(st17.go)) || (st17.pressed === '' && st17.dis), 2, '');

  // ================= B. double taps on primary buttons =================
  const D = [
    ['s01', '#kitcard', 's02', 's01'], ['s02', '[data-rent]', 's03', 's02'], ['s03', '#save', 's04', 's02'], ['s04', '#res-m7', 's05', 's04'],
    ['s05', '#choose', 's06', 's05'], ['s06b', '#go07', 's07', 's06'], ['s07b', '#pay07', 's08', null], ['s08', '#track08', 's09', null],
    ['s09', '#track09', 's10', 's09'], ['s10', '#go11', 's11', 's10'], ['s11b', '#save11', 's11', null], ['s12', '#weekly', 's13', 's12'],
    ['s13', '#go13', 's13', null], ['s14', '#open15', 's15', 's14'], ['s15', '#go15', 's16', 's15'], ['s16', '#go16', 's17', 's16'], ['s17b', '#go17', 's17', null],
  ];
  const fixFor = {
    '[data-rent]': 'The second tap lands on the incoming 03 "Save fit" (same spot at the bottom) and saves the seeded fit unseen, so 03 is skipped. Ignore pointer events on the incoming screen while a push transition runs (pointer-events:none on .screen until the tween completes) and lock push() for ~500 ms.',
    '#go15': 'The second tap on "Store it at the Hub" lands on 16\'s "Send the Giant Escape 3" (same dock spot), so 16 (price, what is included, there-and-back) is skipped. Same fix: no taps on the incoming screen during the push.',
    '#save11': 'The second tap on "Save the hand-over record" (button already reads "Ride · collected at 13:30") fires the 11→12 time skip; ignore taps on #save11 until the fold timeline has finished (set a busy flag, clear it in the last tween\'s onComplete).',
    '#go13': 'The second tap on "Start every Saturday" (now "See it in Bookings") leaves 13 before the ring is tied; ignore taps until tie13\'s animation completes.',
    '#go17': 'The second tap on "Book door pickup" (now "See it at the Hub · 29 Oct") fires the skip to Wed 29 Oct before the booked card shows; ignore taps until the token finishes its ride.',
  };
  for (const [pre, sel, land, backTo] of D) {
    if (pre === 's01') await fresh(); else await walkTo(pre);
    if (pre === 's10') await waitArrive();
    if (pre === 's02') await p.waitForTimeout(400);
    await dbl(sel);
    await p.waitForTimeout(1600); // let a guarded action (pay bar, Save delay) finish before judging
    s = await settle();
    let extra = '';
    if (sel === '#save11') extra = ` · slip shown=${await p.evaluate(() => !document.getElementById('filed11').hidden)}`;
    if (sel === '#go13') extra = ` · controls shown=${await p.evaluate(() => !document.getElementById('ctl13').hidden)}`;
    if (sel === '#go17') extra = ` · booked card=${await p.evaluate(() => !!document.querySelector('#booked17 .booked17'))}`;
    if (sel === '#pay07') extra = ` · ${await txt('#tag08 .tg-top')} · stamp ${await txt('#stamp08')}`;
    if (sel === '#save') extra = ` · save button "${await txt('#save')}"`;
    await check(`B dbl ${sel} on ${pre}`, `Double-tap ${sel} on ${pre.slice(0, 3)}`, `Lands once on ${land}${land === pre.slice(0, 3) ? ' and shows its done state' : ''}`, s + extra, s === land && !(sel === '#save11' && /false/.test(extra)) && !(sel === '#go13' && /false/.test(extra)) && !(sel === '#go17' && /false/.test(extra)), sel in fixFor ? 2 : 3, fixFor[sel] || `Guard ${sel}: ignore a second tap while the transition runs (e.g. in push(), return if id === current or a transition is in flight).`);
    if (backTo && s === land) {
      await tap('[data-go="back"]'); const bk = await settle();
      await check(`B back after dbl ${sel}`, `Then tap Back once on ${land}`, `${backTo} (no duplicated history)`, bk, bk === backTo, 3, 'push() must not push the same page twice: `if (id === current) return;` at the top of push(); also lock taps during a push transition.');
    }
  }
  // home storage promo double tap
  await fresh(); await dbl('#store01'); s = await settle();
  await check('B dbl #store01', 'Double-tap the storage promo on Home', 'Lands once on s16', s, s === 's16', 3, 'Guard push().');
  if (s === 's16') { await tap('[data-go="back"]'); const bk = await settle(); await check('B back after dbl #store01', 'Then tap Back once', 's01', bk, bk === 's01', 3, 'Guard push() against pushing the page already shown.'); }

  // ================= C. taps during time skips and the van ride =================
  await walkTo('s08');
  await tap('#track08', 0);
  for (const [x, y] of [[196, 426], [30, 70], [196, 820], [196, 790]]) { await p.waitForTimeout(350); await tapAt(x, y); }
  s = await settle();
  await check('C taps during 08→09 skip', 'Tap centre, top-left (Back spot), bottom (tab / button spot) while "Friday evening" skip runs', 'Lands on 09 once; overlay gone; nothing behind it fired', `${s}; skip=${await skipVis()}`, s === 's09', 3, 'Keep #skip at pointer-events:auto while visible (it is) and make sure the landing page ignores taps for the first 300 ms.');
  await tap('#track09', 0);
  for (const [x, y] of [[196, 426], [30, 70], [196, 800]]) { await p.waitForTimeout(400); await tapAt(x, y); }
  s = await waitScreen('s10');
  await check('C taps during 09→10 skip', 'Tap around while "Saturday morning" skip runs', 'Lands on 10, van ride starts', s, s === 's10', 3, '');
  await p.waitForTimeout(1500);
  const dis1 = await p.evaluate(() => document.getElementById('go11').disabled);
  await p.locator('#go11').click({ force: true }).catch(() => {}); await p.waitForTimeout(300);
  s = await cur();
  await check('C tap disabled button in ride', 'Tap "Waiting for the bike" while the van is driving', 'Nothing happens; stays on 10', `${s}, disabled=${dis1}`, s === 's10' && dis1, 3, '');
  await tapAt(196, 300); await tapAt(196, 300); await p.waitForTimeout(200);
  await p.locator('#s10 .chat10').click(); await p.waitForTimeout(300);
  const t10 = await p.evaluate(() => document.getElementById('toast').textContent);
  await check('C tap map and courier in ride', 'Double-tap the map, tap the courier chat while driving', 'Ride keeps running; chat explains itself', `toast "${t10}"`, true, 0, '');
  await waitArrive();
  const arr = await p.evaluate(() => ({ clock: document.getElementById('clock').textContent, in: document.getElementById('eta-in').textContent, btn: document.getElementById('go11').textContent.trim() }));
  await check('C ride ends', 'Wait for the van after the taps', 'Clock 7:40, "here now", "Start the hand-over check"', JSON.stringify(arr), arr.clock === '7:40' && arr.in === 'here now' && /hand-over/.test(arr.btn), 3, '');
  // taps during 11→12 and the hub skips
  await tap('#go11'); await waitScreen('s11'); await STEPS.find((x) => x[0] === 's11b')[1](); await STEPS.find((x) => x[0] === 's11c')[1]();
  await tap('#save11', 0); for (const [x, y] of [[196, 426], [30, 70], [196, 800]]) { await p.waitForTimeout(400); await tapAt(x, y); }
  s = await settle();
  await check('C taps during 11→12 skip', 'Tap around while the ride-day skip runs', 'Lands on 12 once', s, s === 's12', 3, '');
  await walkTo('s17c');
  await tap('#go17', 0); for (const [x, y] of [[196, 426], [30, 70], [196, 800]]) { await p.waitForTimeout(400); await tapAt(x, y); }
  s = await settle();
  const hub = await txt('#st15');
  await check('C taps during 17→15 skip', 'Tap around while the skip to Wed 29 Oct runs', 'Lands on 15 at the Hub', `${s} · ${hub}`, s === 's15' && /Hub since 28 Oct/i.test(hub || ''), 3, '');
  await tap('[data-go="back"]'); s = await settle();
  await check('C back from hub 15', 'Tap Back on 15 after the skip', 's14 My gear', s, s === 's14', 3, '');

  // ================= D. reload in the middle =================
  await walkTo('s07b');
  await p.locator('#pmchg').scrollIntoViewIfNeeded(); await p.locator('#pmchg').click(); await p.waitForTimeout(200);
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  s = await cur();
  await p.locator('#kitcard').click(); await waitScreen('s02'); await p.waitForTimeout(1000); await tap('[data-rent]'); const after = await settle();
  await check('D reload at 07', 'Reload on 07 (terms ticked, Visa chosen)', 'Prototype may reset; say what is lost', `Opens on ${s}; fit profile lost (Rent now opens ${after} = the fit page again); 06 times, tick and Visa lost`, s === 's01', 1, 'Acceptable for a prototype. Optional: keep fit/book/S in sessionStorage so a reload resumes on the same page.');
  await walkTo('s13b');
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1500); s = await cur();
  await p.locator('#s01 .tabbar [data-tab="s09"]').click(); await waitScreen('s09'); const r09 = await txt('#body09');
  await check('D reload after weekly set-up', 'Reload after "Start every Saturday", open Bookings', 'Reset is acceptable; say what is lost', `Opens on ${s}; Bookings: ${r09.slice(0, 90)} — closed rental, weekly series and Past are gone; Bookings again shows the not-yet-delivered OR-10482`, s === 's01', 1, 'Acceptable for a prototype; same sessionStorage option.');

  // ================= E. reduced motion, main path =================
  await fresh({ reducedMotion: 'reduce' });
  const seen = []; let stuck = '';
  for (const [l, f] of STEPS) {
    const t0 = Date.now(); await f(); const id = await settle(6000); seen.push(`${l}:${id}`);
    if ((await skipVis()) !== 'hidden') stuck += ` skip overlay visible at ${l};`;
    if (l === 's15h') break;
  }
  const want = 's02 s03 s04 s05 s06 s06 s07 s07 s08 s09 s10 s11 s11 s11 s12 s13 s13 s09 s14 s15 s16 s17 s17 s17 s15'.split(' ');
  const got = seen.map((x) => x.split(':')[1]);
  const mism = got.map((g, i) => (g === want[i] ? null : `${seen[i]} (want ${want[i]})`)).filter(Boolean);
  await check('E reduced motion route', 'Run 01 → 13 → 09 → 14 → 17 → Hub with prefers-reduced-motion: reduce', 'Every page reached with taps only, no overlay left, no transition stuck', mism.length ? mism.join(', ') + stuck : 'all ' + got.length + ' steps landed' + stuck, mism.length === 0 && !stuck, 3, 'Check the still branches of the step that failed.');
  const rm = await p.evaluate(() => ({ st15: document.getElementById('st15').textContent, ago: document.getElementById('ago15').textContent, dark: document.getElementById('phone').hasAttribute('data-dark-top') }));
  await check('E reduced motion end state', 'Read 15 at the Hub (reduced motion)', '"At the OutRent Hub since 28 Oct", "1 day ago"', JSON.stringify(rm), /Hub since 28 Oct/.test(rm.st15) && rm.ago === '1 day ago', 3, '');
  // spot checks that the motion-free version still shows the "done" moments
  await fresh({ reducedMotion: 'reduce' });
  for (const [l, f] of STEPS) { await f(); if (l === 's08') break; }
  const stamp = await p.evaluate(() => { const e = document.getElementById('stamp08'); return getComputedStyle(e).opacity; });
  await check('E reduced motion 08 stamp', 'Look at the Paid stamp on 08 with reduced motion', 'Stamp visible without the animation', `stamp opacity ${stamp}`, +stamp > 0.5, 2, 'Give #stamp08 its final opacity/rotation in CSS so the still path shows it.');
  for (const [l, f] of STEPS.slice(STEPS.findIndex((x) => x[0] === 's09'))) { await f(); if (l === 's10') break; }
  const rm10 = await p.evaluate(() => ({ clock: document.getElementById('clock').textContent, in: document.getElementById('eta-in').textContent, dis: document.getElementById('go11').disabled }));
  await check('E reduced motion 10', 'Open tracking with reduced motion', 'Arrives at once: 7:40, here now, button enabled', JSON.stringify(rm10), rm10.clock === '7:40' && rm10.in === 'here now' && !rm10.dis, 2, '');

  // WebKit
  let wk = 'skipped: WebKit not installed in /opt/pw-browsers (only chromium); not installed per brief';
  try { const w = await pw.webkit.launch(); await w.close(); wk = 'available (not run)'; } catch (e) { }
  await check('WebKit', 'Try WebKit once', 'Run main path in WebKit if installed', wk, true, 0, '');

  await check('console', 'Collect console and page errors over all runs', 'No errors', errs.length ? [...new Set(errs)].join(' || ') : 'none', errs.length === 0, 2, 'Fix the logged errors.');
  fs.writeFileSync(OUT + J + '.json', JSON.stringify(R, null, 1));
  const passed = R.filter((r) => r.pass).length;
  console.log(`done ${J} ${passed}/${R.length}, ${R.length - passed} failures`);
  await browser.close();
})();
