// E6 · Daniel as owner of the unused Giant Escape 3. Run: cd /home/claude/review-tools && node /home/claude/review-out/e2e/E6.js
// Taps only from Home (no #NN jumps, no page functions). Two passes: A = door pickup (full journey), B = rack drop (fresh session).
const path = require('path');
const pw = require(path.join('/home/claude/review-tools/node_modules', 'playwright'));
const fs = require('fs');
const OUT = '/home/claude/review-out/e2e/';
const J = 'E6', PERSONA = 'Daniel Lim (owner of the idle Giant Escape 3)';
const R = []; let nshot = 0;

async function pass(browser, mode) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 1, hasTouch: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  await p.goto('http://localhost:8081/index.html', { waitUntil: 'networkidle' });
  const P = mode === 'door' ? 'A' : 'B';

  const on = () => p.evaluate(() => [...document.querySelectorAll('.screen.on')].map((s) => s.id).join(','));
  const waitOn = async (id, t = 15000) => { try { await p.waitForFunction((id) => { const a = [...document.querySelectorAll('.screen.on')].map((s) => s.id); return a.length === 1 && a[0] === id && getComputedStyle(document.querySelector('#skip')).visibility !== 'visible'; }, id, { timeout: t }); } catch (e) {} await p.waitForTimeout(700); return on(); };
  const txt = (sel) => p.evaluate((sel) => { const e = document.querySelector(sel); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null; }, sel);
  const clock = () => txt('#clock');
  const toastNow = () => p.evaluate(() => { const t = document.querySelector('#toast'); return t && t.classList.contains('on') ? t.textContent.trim() : null; });
  const isOn = (sel) => p.evaluate((sel) => !!document.querySelector(sel)?.classList.contains('on'), sel);
  const rec = async (step, action, expected, actual, ok, sev = 0, known = null, fix = '') => {
    let shot = null;
    if (!ok) { nshot++; shot = `e2e/shots/${J}-${nshot}.png`; await p.screenshot({ path: '/home/claude/review-out/' + shot }).catch(() => {}); }
    R.push({ journey: J, persona: PERSONA, step: `E6${P}-${step}`, action, expected, actual: String(actual).slice(0, 400), pass: !!ok, severity: ok ? 0 : sev, known, shot, fix: ok ? '' : fix });
    console.log(ok ? 'PASS' : 'FAIL', `E6${P}-${step}`, '|', String(actual).slice(0, 170));
  };
  const tap = async (loc, wait = 900) => { await loc.scrollIntoViewIfNeeded({ timeout: 4000 }).catch(() => {}); await loc.click({ timeout: 4000 }); await p.waitForTimeout(wait); };
  const has = (s, ...parts) => parts.every((x) => s && s.toLowerCase().includes(x.toLowerCase()));
  const hasnt = (s, ...parts) => parts.every((x) => !s || !s.toLowerCase().includes(x.toLowerCase()));
  const sel = (q) => p.locator(q).first();

  let id = await waitOn('s01');
  await rec('01', 'Open the app', 's01 Home', id, id === 's01');
  // ---------- My gear ----------
  await tap(sel('#s01 .tabbar [data-tab="s14"]')); id = await waitOn('s14');
  let g = await txt('#s14');
  await rec('02', 'Tap the My gear tab', 's14 · Fri 24 Oct · 4 items', `${id} · ${g.slice(0, 40)}`, id === 's14' && has(g, 'Fri 24 Oct · 4 items'));
  await rec('02b', 'Read the Giant card at home', 'Not used since 24 May · 5 months ago · corridor · blocks the corridor · 175 × 105 × 60 cm', await txt('#open15'), has(await txt('#open15'), 'Not used since 24 May', '5 months ago', 'corridor', 'blocks the corridor', '175 × 105 × 60 cm'));
  await rec('02c', 'Read the other items', 'Canyon 2 days ago, helmet 2 days ago, bike box 1 year ago', await txt('#grid14'), has(await txt('#grid14'), 'Canyon Endurace', 'Road helmet', 'Hard-shell bike box', '1 year ago') && (await txt('#grid14')).match(/2 days ago/gi)?.length === 2);

  if (mode === 'door') {
    for (const it of ['canyon', 'helmet', 'box']) {
      await tap(sel(`#grid14 [data-item="${it}"]`), 300);
      const to = await toastNow(); id = await on();
      await rec(`03-${it}`, `Tap the ${it} tile`, 'opens its item detail (E7-1 AC2)', `toast "${to}" · ${id}`, id !== 's14', 2, 'FIXES 17', '14: give the Canyon, helmet and bike box a detail page (15 in its at-home state with their own values) instead of a toast.');
      await p.waitForTimeout(2300);
    }
    // ---------- Add an item, twice ----------
    await tap(sel('#add14'), 1800);
    let nm = await txt('#nmt14'), sv = await txt('#save14'), dis = await p.locator('#save14').isDisabled();
    await rec('04', 'Tap "Add an item"', 'sheet opens, name "Track pump", save disabled until type and place', `sheet on=${await isOn('#sheet14')} · name "${nm}" · "${sv}" disabled=${dis}`, (await isOn('#sheet14')) && nm === 'Track pump' && dis);
    await tap(p.locator('#ty14 button', { hasText: 'Accessory' }), 300);
    dis = await p.locator('#save14').isDisabled();
    await rec('04b', 'Pick type Accessory only', 'save still disabled', `disabled=${dis} · "${await txt('#save14')}"`, dis);
    await tap(sel('#sheet14 [data-close]'), 600);
    await rec('04c', 'Close the sheet (X) before saving', 'sheet closes, nothing added, still 4 items', `sheet on=${await isOn('#sheet14')} · ${await txt('#cnt14')} · tiles ${await p.locator('#grid14 .gcard').count()}`, !(await isOn('#sheet14')) && has(await txt('#cnt14'), '4 items') && (await p.locator('#grid14 .gcard').count()) === 4);
    await tap(sel('#add14'), 1500);
    const press = await p.evaluate(() => [...document.querySelectorAll('#ty14 button,#wh14 button')].filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.textContent).join(','));
    await rec('04d', 'Re-open the sheet', 'the half-filled draft is kept (Accessory still picked, name kept)', `name "${await txt('#nmt14')}" · pressed: ${press}`, (await txt('#nmt14')) === 'Track pump' && press === 'Accessory');
    await tap(p.locator('#wh14 button', { hasText: 'Corridor' }), 300);
    sv = await txt('#save14');
    await rec('04e', 'Pick Corridor', 'button "Add to My gear" enabled', sv, sv === 'Add to My gear' && !(await p.locator('#save14').isDisabled()));
    await tap(sel('#save14'), 1500);
    const pump = await txt('#grid14 .gcard.new');
    await rec('04f', 'Add to My gear (FD-NEW-ITEM)', 'tile Track pump · Accessory · corridor · no photo · last used none; header 5 items', `${pump} · ${await txt('#cnt14')}`, has(pump, 'Track pump', 'Accessory · corridor', 'No photo yet') && has(await txt('#cnt14'), '5 items'));
    await tap(sel('#add14'), 300);
    let to = await toastNow();
    await rec('05', 'Tap "Add an item" a second time', 'either a fresh add sheet or a clear message; no duplicate pump', `toast "${to}" · sheet on=${await isOn('#sheet14')} · pumps ${await p.locator('#grid14 [data-item="pump"]').count()}`, (await p.locator('#grid14 [data-item="pump"]').count()) === 1);
    await rec('05b', '"Add an item" a second time is still an add', 'the "Add an item" tile adds any item (E7-2), not only the pump', `toast "${to}"`, (await isOn('#sheet14')), 1, null, '14: after the first add, the "Add an item" tile only toasts "Track pump is already in My gear." — either open an empty sheet or hide/disable the tile with a note; a tile labelled "Add an item" that refuses reads as broken.');
    await p.waitForTimeout(2300);
    await tap(sel('#grid14 [data-item="pump"]'), 300); to = await toastNow();
    await rec('05c', 'Tap the new Track pump tile', 'opens its detail, or at least shows its facts', `toast "${to}"`, false, 1, 'FIXES 17', '14: the added item should open the same item detail as the others (E7-1 AC2).');
    await p.waitForTimeout(2300);
    // tabs keep the pump
    await tap(sel('#s14 .tabbar [data-tab="s01"]')); await waitOn('s01');
    await tap(sel('#s01 .tabbar [data-tab="s14"]')); id = await waitOn('s14');
    await rec('05d', 'Home tab and back to My gear', 'pump and 5 items survive', `${await txt('#cnt14')} · pumps ${await p.locator('#grid14 [data-item="pump"]').count()}`, has(await txt('#cnt14'), '5 items') && (await p.locator('#grid14 [data-item="pump"]').count()) === 1);
  }

  // ---------- 15 at home ----------
  await tap(sel('#open15'), 500); id = await waitOn('s15');
  let d = await txt('#s15');
  await rec('06', 'Tap the Giant card', 's15 at home: At home · corridor, Fri 24 Oct, 5 months ago, 24 May 2026, 175 × 105 × 60 cm, S$8.40 / day (70% of S$12)', `${id} · ${d.slice(0, 300)}`, id === 's15' && has(d, 'At home · corridor', 'Fri 24 Oct', '5 months ago', '24 May 2026', '175 × 105 × 60 cm', 'S$8.40 / day', '70% of S$12'));
  await rec('06b', 'Dock button and clock', '"Store it at the Hub", 19:00', `${await txt('#go15')} · ${await clock()}`, (await txt('#go15')) === 'Store it at the Hub' && (await clock()) === '19:00');
  // ---------- 16 ----------
  await tap(sel('#go15'), 500); id = await waitOn('s16');
  d = await txt('#s16');
  await rec('07', 'Store it at the Hub', 's16: S$18 / month, home collection S$10, rack S$5, back free (2 days) / S$8, keep 70%', `${id} · ${d.slice(0, 260)}`, id === 's16' && has(d, 'S$18', '/ month', 'S$10', 'S$5', 'Free', "2 days' notice", 'S$8', '70%'));
  if (mode === 'door') {
    await tap(sel('#terms16'), 800);
    const sh = await p.evaluate(() => { const s = [...document.querySelectorAll('#s16 .sheetx')].pop(); return s ? s.classList.contains('on') + ' · ' + s.innerText.replace(/\s+/g, ' ') : 'none'; });
    await rec('07b', 'Open Rent-out terms on 16', 'sheet: S$8.40, 70%, S$12 / day, re-checked after every rental', sh, has(sh, 'true', 'S$8.40', '70%', 'S$12 / day', 're-checked after every rental'));
    await tap(p.locator('#s16 .sheetx .xbtn').last(), 700);
    let n = await p.locator('#s16 .sheetx').count();
    await rec('07c', 'Close it with X', 'sheet gone', `sheets left ${n}`, n === 0);
    await tap(sel('#terms16'), 800);
    await p.mouse.click(196, 120); await p.waitForTimeout(700);
    n = await p.locator('#s16 .sheetx').count();
    await rec('07d', 'Open again, close by tapping the scrim', 'sheet gone', `sheets left ${n}`, n === 0);
    await tap(sel('#terms16'), 800); await tap(p.locator('#s16 .sheetx .ghostbtn').last(), 700);
    n = await p.locator('#s16 .sheetx').count();
    await rec('07e', 'Open again, close with "Close"', 'sheet gone', `sheets left ${n}`, n === 0);
    // back and forward
    await tap(sel('#s16 [data-go]'), 500); id = await waitOn('s15');
    await rec('07f', 'Back from 16', 's15 (at home)', id, id === 's15');
    await tap(sel('#go15'), 500); id = await waitOn('s16');
  }
  // ---------- 17 ----------
  await tap(sel('#go16'), 500); id = await waitOn('s17');
  await rec('08', 'Send the Giant Escape 3', 's17, button disabled "Choose door or rack", Tue 28 Oct', `${id} · "${await txt('#go17')}" · ${await txt('#dc17')}`, id === 's17' && (await p.locator('#go17').isDisabled()) && has(await txt('#dc17'), 'Tue 28 Oct'));
  const other = mode === 'door' ? 'rack' : 'door';
  const DP = { door: 'home', rack: 'rack' };
  const pick = async (m) => { await tap(sel(`#s17 .opt[data-path="${DP[m]}"]`), 800); return { dc: await txt('#dc17'), c: await txt('#c17'), go: await txt('#go17') }; };
  const exp = { door: { t: '17:00–19:00', c: 'S$10', go: 'Book door pickup · S$10', where: 'Courier at your door' }, rack: { t: '7:00–10:00', c: 'S$5', go: 'Book rack pickup · S$5', where: 'Courier at Rack S' } };
  let r = await pick(other);
  await rec('08b', `Choose ${other} first`, `${exp[other].t} · ${exp[other].c} · "${exp[other].go}"`, `${r.dc} · ${r.c} · ${r.go}`, has(r.dc, 'Tue 28 Oct', exp[other].t, exp[other].where) && r.c === exp[other].c && r.go === exp[other].go);
  r = await pick(mode);
  await rec('08c', `Switch to ${mode}`, `${exp[mode].t} · ${exp[mode].c} · "${exp[mode].go}" (the other choice fully replaced)`, `${r.dc} · ${r.c} · ${r.go}`, has(r.dc, 'Tue 28 Oct', exp[mode].t, exp[mode].where) && r.c === exp[mode].c && r.go === exp[mode].go);
  const by7 = await p.evaluate(() => document.querySelector('#by7').getAttribute('opacity'));
  await rec('08d', 'Dial marks', mode === 'rack' ? '"DROP BY 7:00" shown' : '"DROP BY 7:00" hidden', `by7 opacity ${by7}`, mode === 'rack' ? by7 === '1' : by7 === '0');
  const bk = await txt('#s17 .back17');
  await rec('08e', 'Getting it back, shown before sending (E8-3)', 'Pooled run Free with 2 days\' notice · Next day to home S$8', bk, has(bk, 'Free', "2 days' notice", 'S$8'));
  if (mode === 'door') {
    await tap(sel('#s17 [data-go]'), 500); id = await waitOn('s16');
    await tap(sel('#go16'), 500); id = await waitOn('s17');
    const pr = await p.evaluate(() => document.querySelector('#s17 .opt[aria-pressed="true"]')?.dataset.path);
    await rec('08f', 'Back to 16 and forward to 17 again', 'door choice kept', `${id} · pressed ${pr} · ${await txt('#go17')}`, id === 's17' && pr === 'home' && (await txt('#go17')) === exp.door.go);
  }
  await tap(sel('#go17'), 2600);
  const bkd = await txt('#booked17'), dcb = await txt('#dc17');
  const expB = mode === 'door' ? ['28 Oct · 17:00–19:00 · S$10', 'Blk 325C Sengkang East Way #11-42'] : ['28 Oct · 7:00–10:00 · S$5', 'Rack S', 'before 7:00'];
  await rec('09', `Book ${mode} pickup`, `booked: ${expB.join(' · ')}; return terms restated; centre "Pickup booked"`, `${dcb} || ${bkd}`, has(bkd, ...expB, 'S$18 / month', 'free on a pooled run', 'S$8') && has(dcb, 'Pickup booked'));
  await rec('09b', 'Button after booking', '"See it at the Hub · 29 Oct"', await txt('#go17'), (await txt('#go17')) === 'See it at the Hub · 29 Oct');
  await tap(sel(`#s17 .opt[data-path="${DP[other]}"]`), 500);
  await rec('09c', `Tap ${other} after booking`, 'nothing changes', await txt('#booked17'), (await txt('#booked17')) === bkd);
  // before the skip: does the item know the pickup is booked?
  await tap(sel('#s17 [data-go]'), 500); await waitOn('s16');
  await tap(sel('#s16 [data-go]'), 500); id = await waitOn('s15');
  d = await txt('#s15');
  await rec('10', 'Back to the Giant before the pickup day', '15 shows "Pickup booked 28 Oct · …" and no longer offers "Store it at the Hub"', `${id} · ${await txt('#st15')} · button "${await txt('#go15')}"`, has(d, 'Pickup booked') || (await txt('#go15')) !== 'Store it at the Hub', 3, null, '15 at home: once booked17, show a "Pickup booked · 28 Oct · 17:00–19:00 · door" row (or rack 7:00–10:00) and change the dock to "See the pickup"; today it still says "Store it at the Hub" as if nothing was booked.');
  await tap(sel('#s15 [data-go]'), 500); id = await waitOn('s14');
  await rec('10b', 'Back to My gear before the pickup day', 'My gear shows the pickup is booked for the Giant', `${id} · ${await txt('#open15')}`, has(await txt('#open15'), 'pickup') , 2, null, '14 Giant card: add "Pickup booked · Tue 28 Oct" once booked17.');
  // forward again
  await tap(sel('#open15'), 500); await waitOn('s15');
  await tap(sel('#go15'), 500); await waitOn('s16');
  await tap(sel('#go16'), 500); id = await waitOn('s17');
  await rec('10c', 'Return to 17 through 15 → 16', '17 still booked with the same choice', `${id} · ${await txt('#go17')} · ${(await txt('#booked17')).slice(0, 40)}`, id === 's17' && (await txt('#booked17')) === bkd);
  await tap(sel('#go17'), 500); id = await waitOn('s15', 20000);
  // ---------- 15 at the Hub ----------
  d = await txt('#s15');
  await rec('11', 'See it at the Hub (time skip to Wed 29 Oct 10:00)', 's15 at the Hub: since 28 Oct, Wed 29 Oct, 1 day ago, 28 Oct updated by the intake, clock 10:00', `${id} · ${await txt('#st15')} · ${await txt('#when15')} · ${await txt('#ago15')} · ${await txt('#agod15')} · ${await clock()}`, id === 's15' && has(await txt('#st15'), 'OutRent Hub since 28 Oct') && has(await txt('#when15'), 'Wed 29 Oct') && has(await txt('#ago15'), '1 day ago') && has(await txt('#agod15'), '28 Oct') && (await clock()) === '10:00');
  await rec('11b', 'Storage cost and intake record (VS-6)', 'S$18 / month running since 28 Oct; intake 28 Oct · 19:45 · OutRent Hub; drivetrain chain worn; frame left; frame right; overall good, chain worn; 3 photos', `${await txt('#s15 .costrun')} || ${await txt('#s15 .intake')}`, has(d, 'S$18 / month', 'Running since 28 Oct', '28 Oct · 19:45 · OutRent Hub', 'Drivetrain', 'Chain worn', 'Left side', 'Right side', 'good, chain worn') && (await p.locator('#s15 .intake figure').count()) === 3);
  await rec('11c', 'Rent-out row and dock (E8-5)', 'Not opted in; "Bring it back"', `${await txt('#rent15')} · ${await txt('#go15')}`, has(await txt('#rent15'), 'Not opted in') && (await txt('#go15')) === 'Bring it back');
  const ruler = await p.evaluate(() => document.querySelector('#ruler15 svg')?.textContent);
  await rec('11d', 'Ruler', '24 MAY and 28 OCT · HUB INTAKE dot', ruler, has(ruler, '24 MAY', '28 OCT · HUB INTAKE'));
  await rec('11e', `Pickup way carried to the Hub page (${mode})`, `15 or its record says how it got there (${mode === 'door' ? 'door pickup S$10' : 'Rack S S$5'})`, d.match(/Rack S|door|S\$10|S\$5/i)?.[0] || 'no mention of the pickup way or its cost', has(d, mode === 'door' ? 'S$10' : 'S$5'), 1, null, '15 at the Hub: add one line under the storage cost, "Collected 28 Oct · door · S$10" (or "Rack S · S$5"), so the choice made on 17 carries through.');
  // ---------- rent-out sheet ----------
  await tap(sel('#rent15'), 700);
  let oi = await txt('#optin15');
  const rs = await txt('#sheet15r');
  await rec('12', 'Open "Rent it out while stored"', 'sheet: S$8.40 (70%), S$12 / day, re-checked vs intake of 28 Oct; button disabled "Tick the terms to opt in"', `on=${await isOn('#sheet15r')} · ${rs.slice(0, 200)} · "${oi}"`, (await isOn('#sheet15r')) && has(rs, 'S$8.40', '70%', 'S$12 / day', 'intake record of 28 Oct') && (await p.locator('#optin15').isDisabled()));
  await tap(sel('#sheet15r label.ack15'), 300);
  oi = await txt('#optin15');
  await rec('12b', 'Tick the terms', 'button enabled "Opt in · rent it out"', oi, oi === 'Opt in · rent it out' && !(await p.locator('#optin15').isDisabled()));
  await tap(sel('#sheet15r label.ack15'), 300);
  oi = await txt('#optin15');
  await rec('12c', 'Untick the terms', 'button disabled again', oi, oi === 'Tick the terms to opt in' && (await p.locator('#optin15').isDisabled()));
  await tap(sel('#sheet15r [data-close]'), 700);
  await rec('12d', 'Close with X', 'sheet closed, still not opted in', `on=${await isOn('#sheet15r')} · ${await txt('#rent15')}`, !(await isOn('#sheet15r')) && has(await txt('#rent15'), 'Not opted in'));
  await tap(sel('#rent15'), 700);
  await tap(sel('#sheet15r label.ack15'), 300);
  await p.mouse.click(196, 80); await p.waitForTimeout(700);
  await rec('12e', 'Re-open, tick, close by tapping the scrim', 'sheet closed, still not opted in', `on=${await isOn('#sheet15r')} · ${await txt('#rent15')}`, !(await isOn('#sheet15r')) && has(await txt('#rent15'), 'Not opted in'));
  await tap(sel('#rent15'), 700);
  const ack = await p.locator('#ack15').isChecked();
  oi = await txt('#optin15');
  await rec('12f', 'Re-open the sheet', 'tick and button agree (both ticked, or both reset)', `ticked=${ack} · "${oi}"`, (ack && oi === 'Opt in · rent it out') || (!ack && oi === 'Tick the terms to opt in'));
  if (!ack) await tap(sel('#sheet15r label.ack15'), 300);
  await tap(sel('#optin15'), 1000);
  await rec('12g', 'Opt in (FD-RENT-OUT)', 'row reads "Available to rent · Earned so far: S$0 · nothing rented yet"', `${await txt('#rent15')} · sheet on=${await isOn('#sheet15r')}`, has(await txt('#rent15'), 'Available to rent', 'S$0') && !(await isOn('#sheet15r')));
  await tap(sel('#rent15'), 300);
  await rec('12h', 'Tap the opted-in row', 'no sheet; a note about earnings', `toast "${await toastNow()}" · sheet on=${await isOn('#sheet15r')}`, !(await isOn('#sheet15r')));
  await p.waitForTimeout(2300);
  // ---------- bring it back ----------
  await tap(sel('#go15'), 700);
  const bs = await txt('#sheet15b');
  await rec('13', 'Bring it back', 'sheet: from OutRent Hub, Sungei Kadut to Blk 325C Sengkang East Way #11-42; pooled Free Fri 31 Oct morning (2 days\' notice); next day S$8 30 Oct · 17:00–19:00; button "Schedule return · free"', `${bs}`, (await isOn('#sheet15b')) && has(bs, 'OutRent Hub, Sungei Kadut', 'Blk 325C Sengkang East Way #11-42', 'Free', 'Fri 31 Oct, morning', "2 days' notice", 'S$8', '30 Oct · 17:00–19:00') && (await txt('#ret15go')) === 'Schedule return · free');
  const retMode = mode === 'door' ? 'next' : 'pool';
  await tap(sel('#sheet15b .opt[data-ret="next"]'), 300);
  await rec('13b', 'Choose next day to home', 'button "Schedule return · S$8"', await txt('#ret15go'), (await txt('#ret15go')) === 'Schedule return · S$8');
  if (mode === 'door') {
    await tap(sel('#sheet15b [data-close]'), 600);
    await tap(sel('#go15'), 700);
    const pr = await p.evaluate(() => document.querySelector('#sheet15b .opt[aria-pressed="true"]')?.dataset.ret);
    await rec('13c', 'Close and re-open the return sheet', 'choice and button agree', `pressed ${pr} · "${await txt('#ret15go')}"`, (pr === 'next') === ((await txt('#ret15go')) === 'Schedule return · S$8'));
    await tap(sel('#sheet15b .opt[data-ret="next"]'), 300);
  } else {
    await tap(sel('#sheet15b .opt[data-ret="pool"]'), 300);
  }
  await tap(sel('#ret15go'), 1200);
  const rt = await txt('#ret15');
  const expR = retMode === 'next' ? ['Coming home next day', '30 Oct · 17:00–19:00 · S$8', 'Blk 325C Sengkang East Way'] : ['Coming home on the pooled run', 'Fri 31 Oct, morning · free', 'Blk 325C Sengkang East Way'];
  await rec('13d', `Schedule return (${retMode})`, expR.join(' · ') + '; dock "Back to My gear"', `${rt} · ${await txt('#go15')}`, has(rt, ...expR) && (await txt('#go15')) === 'Back to My gear');
  await rec('13e', 'Rent-out vs scheduled return', 'opted-in row reflects that the bike is leaving the Hub (rent-out ends / last day shown)', await txt('#rent15'), hasnt(await txt('#rent15'), 'Available to rent'), 1, null, '15: after a return is scheduled, the rent-out row should read "Available to rent until 30 Oct" (or ask to stop rent-out); it still says "Available to rent".');
  // ---------- back to My gear ----------
  await tap(sel('#go15'), 500); id = await waitOn('s14');
  g = await txt('#s14'); const card = await txt('#open15');
  await rec('14', 'Back to My gear', 's14', id, id === 's14');
  await rec('14b', 'My gear agrees with the Giant page (at the Hub)', 'Giant card: at the OutRent Hub since 28 Oct, last used 28 Oct / 1 day ago, return scheduled; no "Not used since 24 May", no "corridor · blocks the corridor"', card, hasnt(card, 'Not used since 24 May', '5 months ago', 'blocks the corridor') && has(card, 'Hub'), 3, null, '14: render the Giant card from S (as 15 does): when S.hub, swap the corridor photo for the Hub photo, flag "At the OutRent Hub since 28 Oct", "1 day ago", "S$18 / month", the return line once S.ret, and "Available to rent" once S.rentOn.');
  await rec('14c', 'My gear header date after the skip', 'Wed 29 Oct', await txt('#cnt14'), has(await txt('#cnt14'), 'Wed 29 Oct'), 2, null, '14: header "#cnt14" is fixed to "Fri 24 Oct"; use Wed 29 Oct once S.hub (and keep the item count right).');
  await rec('14d', 'Clock on My gear after the skip', '10:00 (same as 15)', await clock(), (await clock()) === '10:00', 1, null, 'CLOCK.s14 is fixed 19:00; use 10:00 when S.hub so time does not jump from 10:00 on 15 to 19:00 on 14.');
  if (mode === 'door') await rec('14e', 'Pump survives the whole storage flow', 'Track pump tile still there, 5 items', `${await p.locator('#grid14 [data-item="pump"]').count()} pump · ${await txt('#cnt14')}`, (await p.locator('#grid14 [data-item="pump"]').count()) === 1 && has(await txt('#cnt14'), '5 items'));
  // re-enter 15
  await tap(sel('#open15'), 500); id = await waitOn('s15');
  await rec('15', 'Open the Giant again from My gear', '15 keeps Hub state, opt-in and scheduled return', `${await txt('#st15')} · ${await txt('#rent15')} · ${await txt('#ret15')} · ${await txt('#go15')}`, has(await txt('#st15'), 'Hub') && has(await txt('#rent15'), 'Available to rent') && has(await txt('#ret15'), ...expR.slice(0, 1)) && (await txt('#go15')) === 'Back to My gear');
  await tap(sel('#s15 [data-go]'), 500); id = await waitOn('s14');
  await rec('15b', 'Back from 15', 's14', id, id === 's14');
  if (mode === 'door') {
    // ---------- Home and Bookings after the skip ----------
    await tap(sel('#s14 .tabbar [data-tab="s01"]'), 500); id = await waitOn('s01');
    const h = await txt('#s01');
    await rec('16', 'Home tab after the Hub intake', 'Home date matches Wed 29 Oct; storage card knows the Giant is stored', `${(h.match(/^\S+ \S+ \S+/) || [''])[0]} · clock ${await clock()} · storage card: ${await txt('#store01')}`, !has(h, 'Wed 22 Oct') && hasnt(await txt('#store01'), 'Make room at home'), 2, null, '01 Home: after S.hub, show Wed 29 Oct and turn the storage card into "Giant Escape 3 at the Hub · return 30 Oct" linking to 15.');
    await tap(sel('#store01'), 500); id = await waitOn('s16');
    await tap(sel('#go16'), 500); id = await waitOn('s17');
    await rec('16b', 'Home storage card → 16 → "Send the Giant Escape 3" again', '17 says the Giant is already at the Hub (no second pickup offered)', `${id} · ${await txt('#go17')} · ${(await txt('#booked17')).slice(0, 50)}`, (await txt('#go17')) !== 'See it at the Hub · 29 Oct', 2, null, '16/17: when S.hub, 16\'s dock should read "See it at the Hub" (→15) instead of "Send the Giant Escape 3", and 17 must not replay the booking/time skip.');
    await sel('#go17').click(); await p.waitForTimeout(900);
    const skipVis = await p.evaluate(() => getComputedStyle(document.querySelector('#skip')).visibility === 'visible' ? document.querySelector('#skcap').textContent : '');
    id = await waitOn('s15', 20000);
    await rec('16c', 'Tap "See it at the Hub · 29 Oct" a second time', 'no second time skip (Sat→Wed replay); lands on 15 with state kept', `${skipVis ? 'time skip replayed: "' + skipVis + '"' : 'no skip'} · ${id} · ${await txt('#rent15')} · ${await txt('#go15')}`, !skipVis && id === 's15' && has(await txt('#rent15'), 'Available to rent'), 2, null, '17: when S.hub is already true, "See it at the Hub" should push 15 directly instead of replaying the 24 Oct → 29 Oct time skip.');
    await tap(sel('#s15 [data-go]'), 500); id = await waitOn(await on());
    await rec('16d', 'Back from 15 after that', 'My gear (stack reset by the skip) or Home', id, ['s14', 's01'].includes(id));
    await tap(sel(`#${id} .tabbar [data-tab="s09"]`), 500); id = await waitOn('s09');
    const bk9 = await txt('#s09');
    await rec('17', 'Bookings tab on Wed 29 Oct', 'Bookings shows Wed 29 Oct and does not show the 25 Oct rental as "Tomorrow"', bk9.slice(0, 160), !has(bk9, 'Fri 24 Oct · 19:00', 'Tomorrow'), 2, null, '09: the date and Up next ignore S.hub; after the Hub skip (Wed 29 Oct) 09 still reads "Fri 24 Oct · 19:00 · Tomorrow · Arrives in 12 h 40 min". Either keep the storage journey in its own clock (and say so) or render 09 at 29 Oct.');
    await rec('17b', 'Storage pickup / return in Bookings', 'the Hub pickup and the 30 Oct return appear as bookings (or Bookings links to them)', has(bk9, 'Hub') ? 'shown' : 'no storage entry in Bookings', has(bk9, 'Hub'), 1, null, '09: list the Giant\'s Hub return (30 Oct · 17:00–19:00 · S$8) under Up next, linking to 15.');
  }
  await rec('99', 'Console and page errors', 'none', errs.length ? errs.join(' || ') : 'none', errs.length === 0, 3, null, 'Fix the listed errors.');
  await ctx.close();
}

(async () => {
  const b = await pw.chromium.launch();
  await pass(b, 'door');
  await pass(b, 'rack');
  fs.writeFileSync(OUT + J + '.json', JSON.stringify(R, null, 1));
  const f = R.filter((r) => !r.pass);
  console.log(`done ${J} ${R.length - f.length}/${R.length}, ${f.length} failures`);
  await b.close();
})().catch((e) => { console.error('CRASH', e); process.exit(1); });
