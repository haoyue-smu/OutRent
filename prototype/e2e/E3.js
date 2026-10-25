// E3 · A beginner who starts from Home without the coach's post.
// Run: cd /home/claude/review-tools && node /home/claude/review-out/e2e/E3.js
const pw = require(require.resolve('playwright', { paths: ['/home/claude/review-tools'] }));
const fs = require('fs');
const URL = 'http://localhost:8081/index.html';
const OUT = '/home/claude/review-out/e2e/';
const J = 'E3', PERSONA = 'Beginner who opens the app on Home without having seen the coach post; tries every way in, then fills the fit profile with very different bodies';
fs.mkdirSync(OUT + 'shots', { recursive: true });
const R = []; let shotN = 0; const errs = []; let p;

async function check(step, action, expected, actual, pass, sev = 0, fix = '', known = null) {
  let shot = null;
  if (!pass) { shotN++; shot = `e2e/shots/${J}-${shotN}.png`; try { await p.screenshot({ path: OUT + 'shots/' + `${J}-${shotN}.png` }); } catch (e) {} }
  R.push({ journey: J, persona: PERSONA, step, action, expected, actual: String(actual), pass: !!pass, severity: pass ? 0 : sev, known, shot, fix: pass ? '' : fix });
  console.log(pass ? 'PASS' : 'FAIL', step, '|', String(actual).slice(0, 160));
}
const onIds = () => p.evaluate(() => [...document.querySelectorAll('.screen.on')].map((s) => s.id));
async function settle(timeout = 12000) { // wait until exactly one screen is on
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) { const ids = await onIds(); const sk = await p.evaluate(() => getComputedStyle(document.getElementById('skip')).visibility); if (ids.length === 1 && sk === 'hidden') { await p.waitForTimeout(250); return ids[0]; } await p.waitForTimeout(150); }
  return (await onIds()).join('+');
}
async function waitScreen(id, timeout = 12000) { const t0 = Date.now(); let s; while (Date.now() - t0 < timeout) { s = await settle(timeout); if (s === id) return s; await p.waitForTimeout(150); } return s; }
const cur = () => settle();
const txt = (sel) => p.evaluate((sel) => { const e = document.querySelector(sel); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null; }, sel);
const screenText = () => p.evaluate(() => document.querySelector('.screen.on').innerText.replace(/\s+/g, ' '));
async function tap(sel, opts = {}) {
  const id = await cur();
  const loc = opts.text ? p.locator(`#${id}`).getByText(sel, { exact: !!opts.exact }).first() : p.locator(`#${id} ${sel}`).first();
  try { await loc.scrollIntoViewIfNeeded({ timeout: 3000 }); await loc.click({ timeout: 4000 }); } catch (e) { console.log('!! tap failed', sel, e.message.split('\n')[0]); return false; }
  await p.waitForTimeout(opts.wait || 150); return true;
}
const toastNow = () => p.evaluate(() => { const t = document.getElementById('toast'); return t.classList.contains('on') ? t.textContent.trim() : null; });
async function clearToast() { await p.waitForTimeout(2400); }

// drag the measuring tape like a finger until it reads `target`
async function setTape(id, target) {
  const tape = p.locator('#' + id);
  await tape.scrollIntoViewIfNeeded();
  for (let i = 0; i < 25; i++) {
    const v = +(await tape.getAttribute('aria-valuenow'));
    if (v === target) break;
    const bb = await tape.boundingBox(); const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
    const dx = Math.max(-150, Math.min(150, (v - target) * 11));
    await p.mouse.move(cx, cy); await p.mouse.down();
    for (let k = 1; k <= 6; k++) await p.mouse.move(cx + dx * k / 6, cy);
    await p.mouse.up(); await p.waitForTimeout(450);
    const v2 = +(await tape.getAttribute('aria-valuenow'));
    if (v2 === v && (v === 60 || v === 95 || v === 150 || v === 200)) break; // at a hard limit
  }
  await p.waitForTimeout(500);
  return +(await tape.getAttribute('aria-valuenow'));
}
const fitState = () => p.evaluate(() => ({ h: document.getElementById('v-height').textContent, leg: document.getElementById('v-leg').textContent, frame: document.getElementById('g-frame').textContent, saddle: document.getElementById('g-saddle').textContent, dim: (document.querySelector('#fig .dim text') || {}).textContent, band: [...document.querySelectorAll('#tape-height rect.band.on')].map((b) => b.dataset.b).join(','), save: document.getElementById('save').innerText.trim() }));
const hint03 = () => p.evaluate(() => /looks (long|short)|check your|outside the|unusual|measure again/i.test(document.getElementById('s03').innerText));
const saddleOf = (leg) => Math.round(leg * 0.883);
const frameOf = (h) => (h < 165 ? 'S' : h <= 177 ? 'M' : 'L');

(async () => {
  const b = await pw.chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, hasTouch: true, deviceScaleFactor: 2 });
  p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  await p.goto(URL, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);

  // ---------- 1. Home as a beginner sees it ----------
  let s = await cur();
  const hello = await txt('#s01 .hello .mono');
  await check('01 open', 'Open the app', 's01 Home, Wed 22 Oct (demo-route clock)', `${s}, ${hello}, clock ${await txt('#clock')}`, s === 's01' && /wed 22 oct/i.test(hello || ''));

  // docket rows + Search button
  const docket = [['What', '#s01 .docket button.f >> nth=0'], ['To', '#s01 .docket button.f >> nth=1'], ['When', '#s01 .docket button.f >> nth=2'], ['Search', '#s01 .docket .cta']];
  for (const [name, sel] of docket) {
    await p.locator(sel).scrollIntoViewIfNeeded(); await p.locator(sel).click(); await p.waitForTimeout(200);
    const t = await toastNow(); s = await cur();
    const isSearch = name === 'Search';
    await check(`01 docket ${name}`, `Tap the docket ${isSearch ? 'Search button' : 'row "' + name + '"'}`, isSearch ? 'Leads to search results (E2-1 Must: search reachable from main surface), or at least to a search form' : `Opens a picker for "${name}" (E2-1 search accepts type, date, place)`, `Stays on ${s}; toast "${t}"`, s !== 's01', isSearch ? 3 : 2,
      isSearch ? 'Make the docket Search lead to 04 with the default query (Hardtail M · Chestnut · Sat 25 Oct), or to a filled docket the way the coach post does; never a dead end on the Must path.' : `Let "${name}" open a simple sheet with the seeded options (What: Bikes/Kayaks/Paddleboards/Camping · To: Chestnut Nature Park · When: Sat 25 Oct) that fills the docket; Search then opens 04.`);
    await clearToast();
  }
  // categories
  const cats = ['Bikes', 'Kayaks', 'Paddleboards', 'Camping'];
  for (let i = 0; i < 4; i++) {
    const sel = `#s01 .cats .cat >> nth=${i}`; await p.locator(sel).scrollIntoViewIfNeeded(); await p.locator(sel).click(); await p.waitForTimeout(200);
    const t = await toastNow(); s = await cur();
    await check(`01 category ${cats[i]}`, `Tap category tile "${cats[i]}"`, 'Category search with the seeded item(s) (MOCK-DATA §12: "These two items exist so the Home tiles lead to real data (a category search shows them)")', `Stays on ${s}; toast "${t}"`, s !== 's01', i === 0 ? 3 : 2,
      i === 0 ? 'Bikes tile → 04 showing the three seeded bikes (it is the only way a beginner without the post can reach renting).' : `${cats[i]} tile → a category result list with the §12 item${i === 1 ? ' (or the VS-4 empty state for kayaks)' : ''}.`, i >= 2 ? 'FIXES 3' : null);
    await clearToast();
  }
  // promos
  await p.locator('#s01 .promo.weekly').scrollIntoViewIfNeeded(); await p.locator('#s01 .promo.weekly').click(); await p.waitForTimeout(200);
  let t = await toastNow(); s = await cur();
  await check('01 promo weekly', 'Tap "Weekly rides" promo', 'Explains it, or leads somewhere useful; not a trap', `Stays on ${s}; toast "${t}"`, s === 's01' && /after a first rental/.test(t || ''), 1, 'Fine as an explanation; optionally lead to the coach post / search so the beginner has a next step.');
  await clearToast();
  await p.locator('#store01').click(); s = await waitScreen('s16');
  await check('01 promo storage', 'Tap "Make room at home" storage promo', 's16 Storage (E0-3)', s, s === 's16', 3, 'Wire #store01 → s16.');
  await tap('[data-go="back"]'); s = await waitScreen('s01');
  await check('16 back', 'Tap Back on 16', 'Back on 01 Home', s, s === 's01', 3, 'Back on 16 must return to the page it came from.');
  // bell
  await p.locator('#s01 .home-top .ibtn').click(); await p.waitForTimeout(200); t = await toastNow(); s = await cur();
  await check('01 bell', 'Tap the bell (1 unseen)', 'Notification centre with the unseen idle prompt "Giant Escape 3 not used since 24 May" (MOCK §8, E0-1 AC3)', `Stays on ${s}; toast "${t}"`, s !== 's01', 2, 'Open a minimal notification list (the one unseen idle prompt at 19 Oct · 10:00 → 15) or remove the unseen dot so the badge does not promise something.');
  await clearToast();

  // tabs
  await p.locator('#s01 .tabbar [data-tab="s09"]').click(); s = await waitScreen('s09');
  const t09 = await screenText();
  await check('01 tab Bookings', 'Tap Bookings tab (nothing booked yet, Wed 22 Oct 9:01)', 's09 with "Nothing booked" (Home is the no-bookings variant, MOCK §1 demo-route clock)', `${s}: ${t09.slice(0, 200)}`, s === 's09' && /Nothing booked/.test(t09), 3,
    'render09 must know whether OR-10482 has been paid: before pay07 has run, show the no-bookings state ("Nothing booked." + the coach post / search as the way in); only after 08 show Up next. Also the date header jumps to Fri 24 Oct 19:00 while Home says Wed 22 Oct.');
  // can the beginner jump straight to tracking a bike he never rented?
  const trackable = await p.locator('#s09 #track09').count();
  await check('09 track before booking', 'Look for Track delivery before having rented', 'No tracking of a booking that does not exist', trackable ? 'A "Track delivery" button for OR-10482 is offered' : 'none', !trackable, 3, 'Hide Up next / Track delivery until the booking is paid (same flag as above).');
  await p.locator('#s09 .tabbar [data-tab="s14"]').click(); s = await waitScreen('s14');
  await check('09 tab My gear', 'Tap My gear tab', 's14', s, s === 's14', 3, 'Wire tab.');
  await p.locator('#s14 .tabbar button').nth(3).click(); await p.waitForTimeout(200); t = await toastNow(); s = await cur();
  await check('14 tab Profile', 'Tap Profile tab', 'Profile area with the fit profile entry (E1-2; MOCK §3 "Saved under Profile")', `Stays on ${s}; toast "${t}"`, s !== 's14', 2, 'Let Profile open at least a thin page: Daniel Lim, member since Aug 2026, "Fit profile" row → 03, payment methods. Without it a beginner has no way to set his fit except through the coach post.');
  await clearToast();
  await p.locator('#s14 .tabbar [data-tab="s01"]').click(); s = await waitScreen('s01');
  await check('14 tab Home', 'Tap Home tab', 's01', s, s === 's01', 3, 'Wire tab.');
  await check('01 summary', 'Count the ways from Home into renting', 'At least one way into renting that is not the coach post', 'Only the coach post card leads to 04; docket (4 controls), 4 category tiles, bell, Profile tab are toasts; weekly promo is a toast; storage goes to 16; Bookings shows a booking that does not exist yet', false, 3, 'Wire the docket Search (and the Bikes tile) to 04. That alone gives the beginner a real way in.');

  // ---------- 2. In via the only path that works, fit profile with extreme numbers ----------
  await p.locator('#kitcard').click(); s = await waitScreen('s02');
  await p.waitForTimeout(900);
  await tap('[data-rent]'); s = await waitScreen('s03');
  await check('02 → 03', 'Tap "Rent a hardtail for Sat 25 Oct" (no fit profile yet)', 's03 Fit profile', s, s === 's03', 4, '');
  await p.waitForTimeout(1500);
  let f = await fitState();
  await check('03 default', 'Read the fit page before touching it', 'Height 176, leg 81, saddle 72, frame M (SEED-FIT); "empty (first entry)" state per E1-3', JSON.stringify(f), f.h === '176' && f.leg === '81' && f.saddle === '72' && f.frame === 'M', 2, '');
  await check('03 first-entry state', 'Arrive with no profile', 'Empty first-entry state, or values clearly marked as an example to replace (E1-3 states: empty)', 'Daniel\'s seeded 176 / 81 is pre-filled; nothing says "example" — a beginner can save without measuring anything', false, 1, 'Mark the starting values as a starting point ("Drag to your height") or start at an empty needle; keep 176/81 for the demo route.');

  // A · 155 cm, inside leg at the minimum (60)
  let h = await setTape('tape-height', 155); let l = await setTape('tape-leg', 60); f = await fitState();
  await check('03 A 155/60', 'Drag height to 155 cm and inside leg to its minimum', `Frame ${frameOf(155)}, saddle ${saddleOf(60)} cm (0.883 × leg), dim label on the bike equals saddle, S band lit`, JSON.stringify(f), f.h === '155' && f.leg === '60' && f.frame === 'S' && f.saddle === String(saddleOf(60)) && f.dim === saddleOf(60) + ' cm' && f.band === 'S', 2, 'Keep the derived values and the bike label in step.');
  const legMin = await p.getAttribute('#tape-leg', 'aria-valuemin');
  await check('03 leg min', 'Read the inside-leg minimum', 'A minimum that fits the smallest rider in the chart', `aria-valuemin ${legMin}; reached ${l}`, l === 60, 1, '');
  await check('03 leg optional', 'Try to leave inside leg out', 'Inside leg is optional (MOCK §3, E1-3 AC2: height-only state shows frame and says adding leg makes saddle exact)', 'The tape always has a value; there is no way to clear it, and no height-only state', false, 1, 'Add a "Skip, I don\'t know it" link under the leg tape that hides the saddle value and shows "Add inside leg for an exact saddle height".');
  // save → 04
  await tap('#save'); s = await waitScreen('s04', 6000);
  await check('03 save → 04', 'Tap Save fit', 's04 Search results', s, s === 's04', 4, '');
  const q04 = await txt('#s04 .query .q'), h04 = await txt('#s04 h1'), names04 = await p.locator('#s04 .res .top b').allInnerTexts();
  await check('04 A query', 'Read the search line after saving 155 cm', 'Query uses frame S ("Hardtail S · Chestnut · Sat 25 Oct") (E1-4)', q04, /Hardtail S\b/.test(q04 || ''), 3, 'Build the query line from fit.frame: `Hardtail ${Fit.frame(fit.height)} · Chestnut · Sat 25 Oct`.');
  await check('04 A results', 'Read the results for a 155 cm rider', 'Results in size S, or a clear "no size S free on Sat 25 Oct" state; none marked "Set to your fit" if the frame does not fit', `${h04} · ${names04.join(' | ')} · each says "Set to your fit before delivery"`, !names04.some((n) => /· M$/.test(n)), 3,
    'When the frame is not M, either swap the result titles to the rider\'s frame (needs PO data) or show the three M bikes with "Frame M is too big for you (S)" instead of the green fit tick; raise the S/L inventory as a PO gap.');
  await tap('#res-m7'); s = await waitScreen('s05');
  const fit05 = await p.locator('#fitgrid5 dd').allInnerTexts(), from05 = await txt('#setfor .sec-h .small');
  await check('05 A set-up', 'Open the Marlin 7 listing as a 155/60 rider', `Set-up shows saddle ${saddleOf(60)} cm, frame S, "From your height 155 cm and inside leg 60 cm"`, `${fit05.join(' / ')} · "${from05}"`, fit05[0].startsWith(String(saddleOf(60))) && /155/.test(from05 || ''), 3,
    'Fill #fitgrid5 and the "From your height … and inside leg …" line from the fit object on every entry to 05 (same for 08 tag, 09 proof row, 10 fit row, 12 day line).');
  await check('05 A title', 'Read listing size for a 155 cm rider', 'Listing does not promise a fit it cannot give (M frame for an S rider)', `${await txt('#s05 .l-meta')} + "Set to your fit before delivery"`, false, 3, 'If fit.frame ≠ M, replace "Set to your fit before delivery" with "Frame M · you need S" and do not offer the fit set-up.');

  // Edit fit from 05 → B · 195 cm, inside leg at the maximum (95)
  await tap('[data-push="s03"]'); s = await waitScreen('s03');
  await p.waitForTimeout(1500);
  f = await fitState();
  await check('05 → 03 edit', 'Tap "Edit fit" on 05', '03 opens with the saved 155 / 60', JSON.stringify(f), s === 's03' && f.h === '155' && f.leg === '60', 3, 'Keep the fit object as the single source.');
  h = await setTape('tape-height', 195); l = await setTape('tape-leg', 95); f = await fitState();
  await check('03 B 195/95', 'Drag height to 195 cm and inside leg to its maximum', `Frame L, saddle ${saddleOf(95)} cm, dim label equal, L band lit`, JSON.stringify(f), f.h === '195' && f.leg === '95' && f.frame === 'L' && f.saddle === String(saddleOf(95)) && f.dim === saddleOf(95) + ' cm', 2, '');
  await check('03 B out of chart', 'Read the frame for 195 cm', 'The size chart ends at 188 cm (L 177–188); 195 cm should say it is outside the chart / XL, not a plain L', `Frame ${f.frame}, lit band "${f.band}", no note`, f.band !== 'L' || false, 2, 'Above 188 cm (and below 155 cm) show "Outside the size chart — the shop will confirm" beside the frame, and grey the band.');
  await check('03 B leg 95 limit', 'Try a longer inside leg for a 195 cm rider', 'Inside leg max lets a 195 cm rider enter a realistic leg (~90–98 cm)', `max ${await p.getAttribute('#tape-leg', 'aria-valuemax')} (reached ${l})`, true, 0, '');
  await tap('#save'); s = await waitScreen('s05', 6000);
  await check('03 save → back to 05', 'Tap Save fit after editing from 05', 'Returns to 05 (E1-4 AC2 "returns to where he was")', s, s === 's05', 3, '');
  const fit05b = await p.locator('#fitgrid5 dd').allInnerTexts(), from05b = await txt('#setfor .sec-h .small');
  await check('05 B set-up', 'Read 05 after saving 195 / 95', `Saddle ${saddleOf(95)} cm, frame L, "From your height 195 cm and inside leg 95 cm"`, `${fit05b.join(' / ')} · "${from05b}"`, fit05b[0].startsWith(String(saddleOf(95))) && /195/.test(from05b || ''), 3, 'Same fix as 05 A: render 05 from fit on entry and after Save.', null);
  await tap('[data-go="back"]'); s = await waitScreen('s04');
  const q04b = await txt('#s04 .query .q');
  await check('04 B query', 'Back to 04 after saving 195 cm', 'Query "Hardtail L · …", results in L', `${s}: ${q04b} · ${(await p.locator('#s04 .res .top b').allInnerTexts()).join(' | ')}`, /Hardtail L\b/.test(q04b || ''), 3, 'As 04 A.');

  // C · mixed extremes: 155 cm with the maximum inside leg, 195 cm with the minimum
  await tap('#res-m7'); await waitScreen('s05'); await tap('[data-push="s03"]'); await waitScreen('s03'); await p.waitForTimeout(1500);
  await setTape('tape-height', 155); await setTape('tape-leg', 95); f = await fitState();
  await check('03 C 155/95', 'Enter 155 cm with a 95 cm inside leg (impossible body: leg 61% of height)', 'A plausibility hint ("check your inside leg") instead of a confident saddle 84 cm on an S frame', `frame ${f.frame}, saddle ${f.saddle} cm, hint shown: ${await hint03()}`, await hint03(), 2, 'Warn when leg/height is outside ~0.40–0.52: "That inside leg looks long for 155 cm — measure in socks, floor to crotch." Do not block Save.');
  await setTape('tape-height', 195); await setTape('tape-leg', 60); f = await fitState();
  await check('03 C 195/60', 'Enter 195 cm with a 60 cm inside leg', 'Same plausibility hint', `frame ${f.frame}, saddle ${f.saddle} cm, hint shown: ${await hint03()}`, await hint03(), 2, 'Same hint for implausibly short legs.');
  await setTape('tape-height', 155); await setTape('tape-leg', 60);
  await tap('#save'); s = await waitScreen('s05', 6000);

  // ---------- 3. Does the 155/60 fit reach the later pages? ----------
  await tap('#choose'); await waitScreen('s06');
  await tap('.slot[data-t="7:40"]'); await tap('.slot[data-t="13:30"]');
  await tap('#go07'); await waitScreen('s07');
  await p.locator('#ack07').evaluate((e) => e.scrollIntoView({ block: 'center' })); await p.locator('label[for="ack07"]').click(); await p.waitForTimeout(200);
  await tap('#pay07'); s = await waitScreen('s08', 8000);
  const tag = await p.locator('#tag08 .tg-set b').allInnerTexts(), tagBike = await txt('#tag08 .tg-bike');
  await check('08 tag fit', 'Pay and read the job tag as a 155/60 rider', `Tag: size S, saddle ${saddleOf(60)} cm`, `${tagBike} · ${tag.join(' / ')}`, tag[0].startsWith(String(saddleOf(60))) && / S$/.test(tagBike || ''), 3, 'Fill the 08 tag (tg-bike, tg-set) from fit; the job tag is what the shop sets the bike to.');
  await tap('#track08'); s = await waitScreen('s09', 9000);
  const proof = await txt('#s09 .proof9s');
  await check('09 proof row fit', 'Read the "Set to your fit" row on Bookings', `Saddle ${saddleOf(60)} cm · frame S`, proof, new RegExp(`Saddle ${saddleOf(60)} cm`).test(proof || ''), 3, 'Fill from fit.');
  await tap('#track09'); s = await waitScreen('s10', 9000);
  const fr10 = await txt('#s10 .fitrow');
  await check('10 fit row', 'Read the set-up row on tracking', `Saddle ${saddleOf(60)} cm · frame S`, fr10, new RegExp(`Saddle ${saddleOf(60)} cm`).test(fr10 || ''), 3, 'Fill from fit.');

  // WebKit once
  let wk = 'skipped: WebKit is not installed in /opt/pw-browsers (only chromium); not installed, per brief';
  try { const w = await pw.webkit.launch(); await w.close(); wk = 'available'; } catch (e) { }
  await check('WebKit', 'Try WebKit once', 'Run main path in WebKit if installed', wk, true, 0, '');

  await check('console', 'Collect console and page errors over the whole run', 'No errors', errs.length ? errs.join(' || ') : 'none', errs.length === 0, 2, 'Fix the logged errors.');
  fs.writeFileSync(OUT + J + '.json', JSON.stringify(R, null, 1));
  const passed = R.filter((r) => r.pass).length;
  console.log(`done ${J} ${passed}/${R.length}, ${R.length - passed} failures`);
  await b.close();
})();
