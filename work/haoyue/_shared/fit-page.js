/* 03 Fit Profile · everything except the input control, shared by direction A (typed fields) and B (ruler).
   03 is an A/B test candidate: the two directions differ only in how height and inside leg are entered.
   This file renders the page and runs the figure; each direction plugs in one input control.
   Needs lead.js, bike-figure.js and gsap.min.js.

   The page maps his body onto the bike, one setting at a time:
     1 · Height      → size (the frame grows or shrinks; Trek Marlin 7 chart)
     2 · Inside leg  → saddle height (inside leg × 0.883: the 81 cm line shrinks and moves onto the seat tube)
     3 · Experience  → fork sag and bar height (not his body: how much he has ridden on dirt)
   The camera moves to the part being set. It moves only when he switches setting, never while he drags. */
(() => {
  const { Fit, BikeFigure, roll, crossFade, haptic, still } = window.Lead;
  const ICONS = "../../../../design/icons.svg";
  const icon = (name, cls = "icon") => `<svg class="${cls}" aria-hidden="true"><use href="${ICONS}#i-${name}"/></svg>`;
  const $ = (id) => document.getElementById(id);
  const NS = "http://www.w3.org/2000/svg";

  const DANIEL = { height: 176, leg: 81, exp: "first" };
  const ORDER = ["height", "leg"];                       // both controls ask in this order
  const RANGE = Fit.range;
  const CHART = { S: [155, 165], M: [165, 177], L: [177, 188] }; // Trek Marlin 7, cm
  const COPY = {
    tip: "Height: standing, without shoes. Inside leg: in socks, floor to crotch.",
    saveError: "Add your height and inside leg to save your fit.",
    saved: "<b>Fit saved.</b> Every bike now shows whether it fits you, and arrives set up.",
  };
  const ORIGIN = "450 306"; // rear-tyre contact point in the figure's 600 × 380 viewBox
  const [OX, OY] = ORIGIN.split(" ").map(Number);
  const proj = (x, z) => [2.0907 * x, 0.5558 * x - 2.0506 * z]; // figure axes, cm → SVG units
  const U = proj(7.02 / 24, 22.95 / 24);   // 1 cm up the seat tube
  const STEER = proj(0.3746, 0.9272);      // 1 cm up the steerer
  const STEM = [227, 77];                   // top of the head tube, where spacers sit
  const LEG_CM = 2.0506;                    // SVG units per cm, straight up

  const model = { height: null, leg: null, exp: "first", tried: null, adj: 0, saved: false };
  const saddleCm = () => (model.leg != null ? Fit.saddleRaw(model.leg) + model.adj : null); // recommended + his change
  const ADJ = 3; // he can move the saddle up to 3 cm either way
  let fig, input, shownSize = "M", ready = false, saving = false, mode = "height", tour = null;

  const complete = () => model.height != null && model.leg != null;
  const fitSize = () => (model.height != null ? Fit.frame(model.height) : null);
  const next = (key) => ORDER.find((k) => k !== key && model[k] == null) || null;

  function shell({ ruler }) {
    const corners = ruler ? "" : `<span class="corner fig">Fig 1</span><span class="corner title">Your set-up</span>`;
    const row = (n, m, inner) => `<li><div class="map-row" data-mode="${m}" aria-current="false"><span class="n" aria-hidden="true">${n}</span>${inner}</div></li>`;
    return `
      <div class="topbar">
        <a class="icon-btn" href="#" aria-label="Back" data-goes-to="previous">${icon("arrow-left")}</a>
        <span class="name">Fit profile</span>
        <span></span>
      </div>
      <div class="content" style="padding-top: var(--s-4)">
        <ol class="steps" id="flow-steps" aria-label="Booking progress" hidden>
          <li class="is-done">Pick</li><li aria-current="step">Fit</li><li>Deliver</li><li>Ride</li><li>Return</li>
        </ol>
        <div class="card is-filled verdict" data-state="saved" role="status" hidden>${icon("check-circle")}<span>${COPY.saved}</span></div>
        <div>
          <p class="t-label" style="margin: 0 0 var(--s-1)">Fit profile · 1 minute</p>
          <h1 class="t-large">We set the bike to your body.</h1>
        </div>
        <div class="group">
          <div id="input-before"></div>
          <figure class="explainer${ruler ? " has-ruler" : ""}" id="plate" style="margin: 0">
            ${corners}
            <div class="fig-bike" id="fig"></div>
            <span class="corner readout" id="fig-readout" aria-live="polite"></span>
          </figure>
        </div>
        <section class="group" aria-labelledby="map-title">
          <div class="stack">
            <h2 class="t-title" id="map-title">Your bike set-up</h2>
            <span class="t-foot">Suggested from your height, inside leg and riding experience. You can change any of it.</span>
          </div>
          <ol class="map">
            ${row(1, "height", `
              <span class="in"><span class="k">Height</span><b id="in-height">—</b></span>
              ${icon("caret-right", "icon is-sm arrow")}
              <span class="out"><b id="out-size">—</b><span class="band" id="band" aria-hidden="true"></span></span>
              <span class="adj"><span class="opts" role="radiogroup" aria-label="Bike size" id="try">${["S", "M", "L"].map((z) => `<button type="button" role="radio" aria-checked="false" data-size="${z}">${z}</button>`).join("")}</span><span class="rec" id="rec-size"></span></span>`)}
            ${row(2, "leg", `
              <span class="in"><span class="k">Inside leg</span><b id="in-leg">—</b></span>
              ${icon("caret-right", "icon is-sm arrow")}
              <span class="out"><b id="out-saddle">—</b><span class="k" id="out-saddle-k">Saddle height</span></span>
              <span class="adj"><span class="opts"><button type="button" id="sad-down" aria-label="Saddle 1 cm lower">−1 cm</button><button type="button" id="sad-up" aria-label="Saddle 1 cm higher">+1 cm</button></span><span class="rec" id="rec-saddle"></span></span>`)}
            <li><div class="map-row is-exp" data-mode="exp" aria-current="false">
              <span class="n" aria-hidden="true">3</span>
              <span class="in"><span class="k">Trail experience</span><b id="in-exp">First time</b></span>
              ${icon("caret-right", "icon is-sm arrow")}
              <span class="out"><b>Bars <span id="out-bars">+1</span> cm</b><span class="k">Fork <span id="out-sag">25</span>% sag</span></span>
              <span class="adj"><span class="opts" role="radiogroup" aria-label="Trail experience" id="exp">
                <button type="button" role="radio" aria-checked="true" data-exp="first">First time</button>
                <button type="button" role="radio" aria-checked="false" data-exp="some">A few rides</button>
                <button type="button" role="radio" aria-checked="false" data-exp="regular">Regular</button>
              </span></span>
            </div></li>
          </ol>
          <ul class="verdicts" id="verdict" aria-live="polite"></ul>
          <p class="field-hint t-foot" id="input-hint" style="margin: 0"></p>
        </section>
        <p class="field-error" id="save-error" hidden>${COPY.saveError}</p>
      </div>`;
  }

  // input: { ruler, before, instruction, mount(api), sync(model, { reset }), show?(key) }
  function init(control) {
    input = control;
    const screen = document.querySelector(".screen");
    screen.innerHTML = `<div class="scroll">${shell(input)}</div>
      <div class="actionbar glass is-single"><a class="btn is-block" href="#" id="save">Save fit</a></div>`;
    if (input.before) $("input-before").innerHTML = input.before; else $("input-before").remove();
    $("input-hint").textContent = `${input.instruction} ${COPY.tip}`;
    fig = new BikeFigure($("fig"), { origin: ORIGIN });
    build();

    const from = new URLSearchParams(location.search).get("from");
    if (from === "04-search-results" || from === "05-listing-detail") $("flow-steps").hidden = false;

    document.querySelectorAll(".map-row").forEach((r) => r.addEventListener("click", (e) => {
      if (e.target.closest(".adj")) return;
      show(r.dataset.mode, { from: "row" });
    }));
    $("exp").querySelectorAll("[role=radio]").forEach((b) => b.addEventListener("click", () => { set({ exp: b.dataset.exp }); show("exp", { replay: true }); }));
    $("try").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      if (!complete()) return;
      const z = b.dataset.size;
      set({ tried: z === fitSize() ? null : z });
      show("height");
    }));
    const nudge = (d) => { if (model.leg == null) return; set({ adj: Math.max(-ADJ, Math.min(ADJ, model.adj + d)) }); show("leg"); };
    $("sad-down").addEventListener("click", () => nudge(-1));
    $("sad-up").addEventListener("click", () => nudge(1));
    document.addEventListener("click", (e) => {
      const r = e.target.closest("[data-reset]"); if (!r) return;
      set(r.dataset.reset === "size" ? { tried: null } : { adj: 0 });
    });
    $("save").addEventListener("click", (e) => {
      if (model.saved) return; // "Done": goes back
      e.preventDefault();
      if (!complete()) { $("save-error").hidden = false; return; }
      saving = true;
      location.hash = "saved";
    });
    // Any touch ends the opening tour and leaves the figure where it is.
    $("plate").addEventListener("pointerdown", stopTour, true);
    document.querySelector(".scroll").addEventListener("pointerdown", stopTour, { passive: true });

    input.mount({ set, model, RANGE, ORDER, next, plate: $("plate"), show: (k) => show(k) });

    Lead.states((state) => {
      const kept = saving;
      if (saving) Object.assign(model, { tried: null, saved: true });
      else if (state === "empty") Object.assign(model, { height: null, leg: null, exp: "first", tried: null, adj: 0, saved: false });
      else Object.assign(model, DANIEL, { tried: null, adj: 0, saved: state === "saved" });
      saving = false;
      $("save-error").hidden = true;
      render({ instant: !ready });
      input.sync(model, { reset: !kept });
      if (kept) loadMoment();
      else if (!ready && complete() && state === "default") openingTour();
      else show("height", { instant: !ready });
      ready = true;
    });
  }

  // ---------- figure overlay: inside leg, saddle height, spacer, callouts ----------
  let fx, legLine, dim, sizeDim, spacer, badges, BB, TOP0, FRONT;
  const k = () => Fit.sizes[shownSize].scale;                         // current frame scale
  const onFrame = ([x, y], s = k()) => [OX + s * (x - OX), OY + s * (y - OY)]; // parts coords → SVG coords

  function build() {
    const svg = fig.svg;
    // Saddle top at the drawing's own height (71.5 cm): the crank centre sits 71.5 cm down the seat tube from it.
    const sb = fig.nodes.filter((o) => o.part === "saddle").map((o) => o.el.getBBox())
      .reduce((a, b) => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), X: Math.max(a.X, b.x + b.width) }), { x: 1e9, y: 1e9, X: -1e9 });
    TOP0 = [(sb.x + sb.X) / 2, sb.y];
    // Front tyre contact: where the front wheel meets the plate, on the bike's own length axis through the rear contact.
    const fb = fig.nodes.filter((o) => o.part === "front").map((o) => o.el.getBBox()).reduce((a, b) => ({ x: Math.min(a.x, b.x), X: Math.max(a.X, b.x + b.width) }), { x: 1e9, X: -1e9 });
    const fx0 = (fb.x + fb.X) / 2; FRONT = [fx0, OY + (fx0 - OX) * (0.5558 / 2.0907)];
    BB = [TOP0[0] - U[0] * 71.523, TOP0[1] - U[1] * 71.523];

    // Spacer and callouts ride on the frame: same transform as the parts, mirrored as it changes.
    fx = document.createElementNS(NS, "g");
    fx.setAttribute("class", "fx");
    fig.parts.after(fx);
    spacer = mk("polygon", { class: "fx-spacer" }, fx);
    const mirror = () => { const t = fig.parts.getAttribute("transform"); if (t) fx.setAttribute("transform", t); else fx.removeAttribute("transform"); if (sizeDim) sizeDim.draw(); placeBadges(); };
    new MutationObserver(mirror).observe(fig.parts, { attributes: true, attributeFilter: ["transform"] });

    legLine = insideLeg(svg);
    sizeDim = wholeBike(svg);
    dim = saddleDim(svg);
    badges = mk("g", { class: "fx-badges" }, svg);
    badges.innerHTML = [1, 2, 3].map((n) => `<g class="badge" data-n="${n}"><circle r="11"/><text text-anchor="middle" y="4.5">${n}</text></g>`).join("");
    badges.addEventListener("click", (e) => { const b = e.target.closest(".badge"); if (b) show(["height", "leg", "exp"][b.dataset.n - 1], { from: "row" }); });
    camera.vb = { x: 0, y: 0, w: 600, h: 380 };
  }

  function mk(tag, attrs, parent) { const el = document.createElementNS(NS, tag); for (const a in attrs) el.setAttribute(a, attrs[a]); parent.appendChild(el); return el; }

  // Callouts: 1 on the top tube, 2 on the seat tube, 3 at the head tube. They keep their size when the camera zooms.
  function placeBadges() {
    if (!badges) return;
    const z = 600 / camera.vb.w;
    const sg = saddleCm() != null ? saddleGeom(saddleCm()) : null;
    const pts = {
      1: sizeDim.mid(),                                                         // on the whole-bike dimension
      2: sg ? [(sg.A[0] + sg.T[0]) / 2 + sg.n[0] * 15, (sg.A[1] + sg.T[1]) / 2 + sg.n[1] * 15] : onFrame(BB), // on the saddle dimension
      3: onFrame([STEM[0] - 18, STEM[1] - 6]),                                  // at the stem
    };
    badges.querySelectorAll(".badge").forEach((b) => {
      const [x, y] = pts[b.dataset.n];
      b.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(1 / z).toFixed(3)})`);
      b.classList.toggle("is-on", ["height", "leg", "exp"][b.dataset.n - 1] === mode);
    });
  }

  // Inside leg: a vertical dimension from the plate, behind the rear wheel. It is his, so it does not scale with the frame.
  const LX = OX + 2.0907 * 30, LY0 = OY + 0.5558 * 30;
  function insideLeg(svg) {
    const g = mk("g", { class: "leg-dim" }, svg);
    g.innerHTML = `<line class="leg-line" x1="${LX}" y1="${LY0}" x2="${LX}" y2="${LY0}"/><path class="leg-tick" d=""/><text class="leg-label" x="0" y="0" text-anchor="middle"></text>`;
    const line = g.querySelector(".leg-line"), tick = g.querySelector(".leg-tick"), label = g.querySelector(".leg-label");
    const state = { cm: 0 };
    const draw = (cm) => {
      const y = LY0 - cm * LEG_CM;
      line.setAttribute("y2", y);
      tick.setAttribute("d", `M${LX - 6} ${LY0}H${LX + 6}M${LX - 6} ${y}H${LX + 6}`);
      label.setAttribute("transform", `translate(${LX + 15} ${(LY0 + y) / 2}) rotate(-90)`); // reads along the line, like a drawing
      label.textContent = cm ? `${Math.round(cm)} cm` : "";
    };
    return {
      el: g,
      set(cm, instant) {
        g.style.opacity = cm == null ? 0 : 1;
        if (cm == null) return;
        if (instant || still.matches || !window.gsap) { state.cm = cm; draw(cm); return; }
        gsap.to(state, { cm, duration: 0.32, ease: "back.out(1.4)", onUpdate: () => draw(state.cm) });
      },
    };
  }

  // Saddle height: crank centre to saddle top, drawn beside the seat tube. Scales with the frame, follows the saddle.
  function saddleGeom(cm) {
    const a = onFrame(BB), t = onFrame([BB[0] + U[0] * cm, BB[1] + U[1] * cm]);
    const v = [t[0] - a[0], t[1] - a[1]], len = Math.hypot(...v), n = [-v[1] / len, v[0] / len], off = 22;
    return { a, t, n, A: [a[0] + n[0] * off, a[1] + n[1] * off], T: [t[0] + n[0] * off, t[1] + n[1] * off] };
  }
  function saddleDim(svg) {
    const g = mk("g", { class: "saddle-dim" }, svg);
    g.innerHTML = `<path class="sd-ext"/><path class="sd-tick"/><line class="sd-line"/><text class="sd-label" text-anchor="start"></text>`;
    const [ext, tick, line, label] = g.children;
    return {
      el: g,
      draw(cm, text) {
        if (cm == null) { g.style.opacity = 0; return; }
        const { a, t, n, A, T } = saddleGeom(cm), d = 6;
        ext.setAttribute("d", `M${a}L${A[0] + n[0] * 4},${A[1] + n[1] * 4}M${t}L${T[0] + n[0] * 4},${T[1] + n[1] * 4}`);
        tick.setAttribute("d", `M${A[0] - n[0] * d},${A[1] - n[1] * d}L${A[0] + n[0] * d},${A[1] + n[1] * d}M${T[0] - n[0] * d},${T[1] - n[1] * d}L${T[0] + n[0] * d},${T[1] + n[1] * d}`);
        line.setAttribute("x1", A[0]); line.setAttribute("y1", A[1]); line.setAttribute("x2", T[0]); line.setAttribute("y2", T[1]);
        label.setAttribute("x", (A[0] + T[0]) / 2 + n[0] * 30); label.setAttribute("y", (A[1] + T[1]) / 2 + n[1] * 30 + 5);
        label.textContent = text || `${Math.round(cm)} cm`;
      },
    };
  }

  // Size: the whole bike, front tyre to rear tyre, measured along the plate beside it. Grows and shrinks with the frame.
  function wholeBike(svg) {
    const g = mk("g", { class: "size-dim" }, svg);
    g.innerHTML = `<path class="zd-tick"/><line class="zd-line"/>`;
    const [tick, line] = g.children, off = proj(0, 0).map((v, i) => [-1.1116, 1.0453][i] * 16); // 16 cm out, beside the bike
    const ends = () => [onFrame(FRONT), onFrame([OX, OY])].map(([x, y]) => [x + off[0], y + off[1]]);
    const draw = () => {
      const [f, r] = ends(), d = [-1.1116 * 4, 1.0453 * 4];
      line.setAttribute("x1", f[0]); line.setAttribute("y1", f[1]); line.setAttribute("x2", r[0]); line.setAttribute("y2", r[1]);
      tick.setAttribute("d", `M${f[0] - d[0]},${f[1] - d[1]}L${f[0] + d[0]},${f[1] + d[1]}M${r[0] - d[0]},${r[1] - d[1]}L${r[0] + d[0]},${r[1] + d[1]}`);
    };
    return { el: g, draw, mid: () => { const [f, r] = ends(); return [(f[0] + r[0]) / 2, (f[1] + r[1]) / 2]; } };
  }

  function setSpacer(cmUp) {
    const p = (() => { const l = Math.hypot(...STEER); return [-STEER[1] / l, STEER[0] / l]; })(), hw = 3.6;
    const a = [STEM[0] - p[0] * hw, STEM[1] - p[1] * hw], b = [STEM[0] + p[0] * hw, STEM[1] + p[1] * hw];
    const c = [b[0] + STEER[0] * cmUp, b[1] + STEER[1] * cmUp], d = [a[0] + STEER[0] * cmUp, a[1] + STEER[1] * cmUp];
    spacer.setAttribute("points", [a, b, c, d].map((q) => q.join(",")).join(" "));
    spacer.style.opacity = cmUp > 0.02 ? 1 : 0;
    fig.sp.cockpit.x = fig.sp.cockpit.want = cmUp / 16; // the cockpit part moves 16 cm per unit
    fig.place();
  }
  const setup = { bars: 0, sag: 0 }; // what the figure shows now
  function applySetup({ instant = false } = {}) {
    const e = Fit.experience[model.exp];
    const go = { bars: e.bars, sag: e.sag };
    const paint = () => { setSpacer(setup.bars); fig.sp.travel.want = setup.sag / 25; if (instant) fig.sp.travel.x = fig.sp.travel.want; fig.run(); };
    if (instant || still.matches || !window.gsap) { Object.assign(setup, go); paint(); return null; }
    gsap.killTweensOf(setup);
    setup.sag = go.sag; paint();                                         // the O-ring springs on its own
    return gsap.to(setup, { bars: go.bars, duration: 0.36, delay: 0.28, ease: "back.out(1.7)", onUpdate: paint });
  }

  // ---------- camera ----------
  const camera = { vb: null, tween: null };
  function setVB() { const v = camera.vb; fig.root.toggleAttribute("data-zoom", v.w < 599); fig.svg.setAttribute("viewBox", `${v.x.toFixed(2)} ${v.y.toFixed(2)} ${v.w.toFixed(2)} ${v.h.toFixed(2)}`); placeBadges(); }
  function frameBox(m) {
    if (m === "height" || !complete()) return { x: 0, y: 0, w: 600, h: 380 };
    let box;
    if (m === "leg") {
      const lo = saddleGeom(Fit.saddleRaw(RANGE.leg.min)), hi = saddleGeom(saddleCm() + 4);
      const xs = [lo.a[0], hi.t[0], hi.T[0], LX + 74, onFrame(TOP0)[0] - 30], ys = [hi.t[1] - 26, LY0 - model.leg * LEG_CM - 18, LY0 + 10, lo.a[1] + 30];
      box = { x: Math.min(...xs), y: Math.min(...ys), X: Math.max(...xs), Y: Math.max(...ys) };
    } else {
      const s = onFrame(STEM), f = onFrame([197, 122]);
      box = { x: Math.min(s[0], f[0]) - 54, y: s[1] - 56, X: Math.max(s[0], f[0]) + 58, Y: f[1] + 40 };
    }
    let w = box.X - box.x, h = box.Y - box.y;
    const r = 600 / 380;
    if (w / h < r) w = h * r; else h = w / r;
    w = Math.max(w, 600 / (m === "exp" ? 1.9 : 2.2)); h = w / r;
    const cx = (box.x + box.X) / 2, cy = (box.y + box.Y) / 2;
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  }
  function moveCamera(m, { instant = false, duration = 0.9 } = {}) {
    const to = frameBox(m);
    if (camera.tween) camera.tween.kill();
    if (instant || still.matches || !window.gsap) {
      if (!instant && still.matches) { crossFade(fig.root, () => { Object.assign(camera.vb, to); setVB(); }); return null; }
      Object.assign(camera.vb, to); setVB(); return null;
    }
    camera.tween = gsap.to(camera.vb, { ...to, duration, ease: "power3.inOut", onUpdate: setVB });
    return camera.tween;
  }

  // ---------- one setting at a time ----------
  function show(m, { instant = false, replay = false, from = "" } = {}) {
    const changed = m !== mode;
    mode = m;
    document.querySelectorAll(".map-row").forEach((r) => {
      const on = r.dataset.mode === m;
      r.classList.toggle("is-on", on);
      r.setAttribute("aria-current", String(on));
    });
    if (from === "row" && input.show && m !== "exp") input.show(m);
    fig.focus(m === "leg" ? "saddle" : m === "exp" ? "cockpit" : null);
    fig.root.querySelector(".size-dim")?.classList.toggle("is-on", m === "height");
    readout();
    placeBadges();
    if (!complete()) { moveCamera("height", { instant }); return; }
    if (changed || replay || instant) {
      const cam = moveCamera(m, { instant });
      if (m === "leg" && !instant) transfer(cam ? 0.55 : 0);
      if (m === "exp" && !instant) applySetup();
    }
  }

  function readout() {
    const fit = fitSize(), size = model.tried || fit, e = Fit.experience[model.exp];
    $("fig-readout").textContent =
      !complete() ? "Add height and inside leg"
      : mode === "leg" ? `Saddle ${Math.round(saddleCm())} cm`
      : mode === "exp" ? `+${e.bars} cm · ${e.sag}% sag`
      : `Size ${size}`;
  }

  // Hero moment: the saddle height draws itself up the seat tube from the crank, and the saddle rides up on its tip. ≈1 s.
  // The label shows where the number comes from (his inside leg × 0.883) while it counts.
  function transfer(delay = 0) {
    const cm = saddleCm();
    if (cm == null) return;
    if (still.matches || !window.gsap) { dim.draw(cm); dim.el.style.opacity = 1; return; }
    const s = { cm: 0 }, saddle = fig.sp.saddle, from = saddle.want - 0.5; // the saddle starts 12 cm low
    gsap.killTweensOf([s, dim.el]);
    return gsap.timeline({ delay })
      .call(() => { saddle.locked = true; saddle.x = from; fig.place(); dim.draw(0.1, `${model.leg} × 0.883`); dim.el.style.opacity = 1; })
      .to(s, { cm, duration: 0.8, ease: "power2.inOut", onUpdate: () => {
        dim.draw(s.cm, s.cm < cm - 0.5 ? `${model.leg} × 0.883` : null);
        const reach = (s.cm - (cm - 12)) / 12;                           // the last 12 cm push the saddle up
        if (reach > 0) { saddle.x = from + 0.5 * Math.min(1, reach); fig.place(); }
      } }, 0.1)
      .call(() => { saddle.locked = false; fig.run(); haptic(); dim.draw(cm); placeBadges(); }, null, 0.95);
  }

  // Opening tour: whole bike → saddle → front end → whole bike. ≈3.4 s; any touch skips to the end.
  function openingTour() {
    if (still.matches || !window.gsap) { show("height", { instant: true }); return; }
    setup.bars = 0; setup.sag = 0; setSpacer(0); fig.sp.travel.x = fig.sp.travel.want = 0; fig.place();
    show("height", { instant: true });
    tour = gsap.timeline()
      .call(() => show("leg"), null, 0.5)
      .call(() => show("exp"), null, 2.6)
      .call(() => show("height"), null, 3.8)
      .call(() => { tour = null; pulseBadges(); }, null, 4.7);
  }
  function stopTour() {
    if (!tour) return;
    tour.kill(); tour = null;
    gsap.killTweensOf(dim.el);
    fig.sp.saddle.locked = false;
    applySetup({ instant: true });
    dim.draw(saddleCm()); dim.el.style.opacity = 1;
    fig.run();
  }
  function pulseBadges() {
    if (still.matches || !window.gsap) return;
    gsap.fromTo(badges.querySelectorAll("circle"), { attr: { r: 11 } }, { attr: { r: 13 }, duration: 0.18, yoyo: true, repeat: 1, stagger: 0.09, ease: "power1.out" });
  }

  // Save: the bike takes his weight. The fork sinks through its travel and settles at his sag. ≈700 ms.
  function loadMoment() {
    show("height", { instant: false });
    if (still.matches || !window.gsap) return;
    const t = fig.sp.travel, rest = Fit.experience[model.exp].sag / 25;
    gsap.timeline({ delay: 0.5 })
      .call(() => { t.locked = true; })
      .to(t, { x: 1.4, duration: 0.18, ease: "power2.in", onUpdate: () => fig.place() }, 0)
      .to(fig.parts, { y: 3, duration: 0.18, ease: "power2.in" }, 0)
      .to(t, { x: rest, duration: 0.5, ease: "elastic.out(1, 0.5)", onUpdate: () => fig.place() }, 0.18)
      .to(fig.parts, { y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" }, 0.18)
      .call(() => { t.locked = false; t.want = rest; haptic(); }, null, 0.2);
  }

  // Controls call this. Editing after saving puts the page back into "edited, not saved yet".
  function set(patch) {
    const was = complete();
    Object.assign(model, patch);
    if (model.saved) { model.saved = false; history.replaceState(null, "", location.pathname + location.search); }
    if (complete()) $("save-error").hidden = true;
    render();
    if (!was && complete() && ready) show(mode, { replay: true }); // both measurements in: the camera can go to work
  }

  function render({ instant = false } = {}) {
    const fit = fitSize();
    const size = model.tried || fit || "M";

    if (model.leg != null) fig.setSaddle(saddleCm(), { instant });
    legLine.set(model.leg, instant);
    if (size !== shownSize) {
      shownSize = size;
      if (instant) { fig.scale = Fit.sizes[size].scale; fig.parts.setAttribute("transform", fig.about(fig.scale)); }
      else { fig.swap(Fit.sizes[size].scale); haptic(); flip($("out-size"), `Size ${size}`); }
    }
    if (!fig.sp.saddle.locked) { dim.draw(saddleCm()); if (model.leg != null) dim.el.style.opacity = 1; }
    sizeDim.draw(); sizeDim.el.style.opacity = complete() ? 1 : 0;
    if (instant || !ready) applySetup({ instant: true });

    // Table.
    $("in-height").textContent = model.height != null ? `${model.height} cm` : "—";
    $("in-leg").textContent = model.leg != null ? `${model.leg} cm` : "—";
    if (!$("out-size").dataset.flipping) $("out-size").textContent = complete() ? `Size ${size}` : "—";
    band(fit);
    const sad = $("out-saddle");
    if (model.leg != null) roll(sad, Math.round(saddleCm()), (v) => `${Math.round(v)} cm`); else { sad.textContent = "—"; sad.dataset.v = ""; }
    $("out-saddle-k").textContent = model.leg != null ? `Saddle · ${model.leg} × 0.883` : "Saddle height";
    // Recommended, or his own choice with the way back.
    const rec = (id, own, text, what) => { $(id).innerHTML = own ? `${text} <button type="button" class="reset" data-reset="${what}">Reset</button>` : complete() ? "Recommended" : ""; $(id).classList.toggle("is-own", !!own); };
    rec("rec-size", !!model.tried, `Recommended ${fit}`, "size");
    rec("rec-saddle", model.adj !== 0, `Recommended ${model.leg != null ? Fit.saddle(model.leg) : "—"} cm`, "saddle");
    $("sad-down").disabled = model.leg == null || model.adj <= -ADJ;
    $("sad-up").disabled = model.leg == null || model.adj >= ADJ;
    const e = Fit.experience[model.exp];
    $("exp").querySelectorAll("[role=radio]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.exp === model.exp)));
    $("in-exp").textContent = { first: "First time", some: "A few rides", regular: "Regular" }[model.exp];
    roll($("out-sag"), e.sag);
    roll($("out-bars"), e.bars, (v) => (Math.round(v) > 0 ? "+" : "") + Math.round(v));

    // Trying another size.
    $("try").querySelectorAll("button").forEach((b) => {
      b.setAttribute("aria-checked", String(complete() && b.dataset.size === size));
      b.disabled = !complete();
    });
    const list = $("verdict");
    if (model.tried && complete()) {
      const r = Fit.check(model.tried, model.height, model.leg);
      list.innerHTML = r.lines.filter((l) => !l.ok).map((l) => `<li class="verdict is-off">${icon("warning-circle", "icon is-sm")}<span>${l.text}</span></li>`).join("");
    } else list.innerHTML = "";
    readout();

    // Save.
    const btn = $("save");
    btn.textContent = model.saved ? "Done" : "Save fit";
    btn.setAttribute("aria-disabled", String(!complete()));
    if (model.saved) btn.setAttribute("data-goes-to", "previous"); else btn.removeAttribute("data-goes-to");
  }

  // Size letter flips when he crosses a size boundary.
  function flip(el, text) {
    if (still.matches || !el.animate) { el.textContent = text; return; }
    el.dataset.flipping = "1";
    const a = el.animate([{ transform: "rotateX(0)" }, { transform: "rotateX(90deg)" }], { duration: 110, easing: "ease-in" });
    a.onfinish = () => { el.textContent = text; el.animate([{ transform: "rotateX(-90deg)" }, { transform: "rotateX(0)" }], { duration: 140, easing: "ease-out" }); delete el.dataset.flipping; };
  }

  // Where his height sits on the size chart: S · M · L bands, his size filled, a dot for him.
  function band(fit) {
    const el = $("band"), lo = 150, hi = 200, pct = (v) => ((v - lo) / (hi - lo)) * 100;
    el.innerHTML = Object.entries(CHART).map(([s, [a, b]]) => `<i class="${s === fit ? "on" : ""}" style="left:${pct(a)}%;width:${pct(b) - pct(a)}%"></i>`).join("") +
      (model.height != null ? `<em style="left:${pct(model.height)}%"></em>` : "");
    el.title = fit ? `Size ${fit} fits ${CHART[fit][0]}–${CHART[fit][1]} cm` : "";
  }

  window.FitPage = { init, CHART };
})();
