/* 03 Fit Profile · everything except the input control, shared by direction A (typed fields) and B (ruler).
   03 is an A/B test candidate: the two directions must differ only in how height and inside leg are entered.
   So this file renders the whole page (copy, order, buttons, states, size swap) and each direction plugs in
   one input control. Needs lead.js, bike-figure.js and gsap.min.js. */
(() => {
  const { Fit, BikeFigure, roll, crossFade, haptic, still } = window.Lead;
  const ICONS = "../../../../design/icons.svg";
  const icon = (name, cls = "icon") => `<svg class="${cls}" aria-hidden="true"><use href="${ICONS}#i-${name}"/></svg>`;
  const $ = (id) => document.getElementById(id);

  const DANIEL = { height: 176, leg: 81, exp: "first" };
  const ORDER = ["height", "leg"];                       // both controls ask in this order
  const RANGE = Fit.range;
  const COPY = {
    tip: "Height: standing, without shoes. Inside leg: in socks, floor to crotch.",
    saveError: "Add your height and inside leg to save your fit.",
    saved: "<b>Fit saved.</b> Every bike now shows whether it fits you, and arrives set up.",
  };
  const ORIGIN = "450 306"; // rear-tyre contact point in the figure's 600 × 380 viewBox

  const model = { height: null, leg: null, exp: "first", tried: null, saved: false };
  let fig, shownSize = "M", ready = false, saving = false;

  const complete = () => model.height != null && model.leg != null;
  const fitSize = () => (model.height != null ? Fit.frame(model.height) : null);
  const next = (key) => ORDER.find((k) => k !== key && model[k] == null) || null;

  function shell({ ruler }) {
    const corners = ruler ? "" : `<span class="corner fig">Fig 1</span><span class="corner title">Saddle height</span>`;
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
            <div class="placeholder is-slim">Rider figure (coming)</div>
            <span class="corner hint" id="fig-hint"></span><span class="corner readout" id="fig-readout" aria-live="polite"></span>
          </figure>
          <p class="field-hint" id="input-hint"></p>
        </div>
        <div class="group">
          <div class="head">
            <h2 class="t-title">Frame size</h2>
            <span class="chip" id="size-chip" aria-live="polite"></span>
          </div>
          <div class="segmented" role="radiogroup" aria-label="Try a frame size" id="size">
            ${["S", "M", "L"].map((s) => `<button type="button" role="radio" aria-checked="false" data-size="${s}">${s}</button>`).join("")}
          </div>
          <ul class="verdicts" id="verdict" aria-live="polite"></ul>
        </div>
        <div class="stack">
          <p class="t-hero"><span id="saddle-n">72</span><span class="unit"> cm</span></p>
          <span class="t-foot">Saddle height, from the crank centre: your inside leg × 0.883.</span>
        </div>
        <div class="group">
          <h2 class="t-title">Trail experience</h2>
          <div class="segmented" role="radiogroup" aria-label="Trail experience" id="exp">
            <button type="button" role="radio" aria-checked="true" data-exp="first">First time</button>
            <button type="button" role="radio" aria-checked="false" data-exp="some">A few rides</button>
            <button type="button" role="radio" aria-checked="false" data-exp="regular">Regular</button>
          </div>
          <p class="t-foot" id="exp-note" style="margin: 0"></p>
        </div>
        <div class="group">
          <h2 class="t-title">Set on every bike for you</h2>
          <div class="stats">
            <div class="stat"><span class="v"><span id="stat-frame">M</span></span><span class="k">Frame</span></div>
            <div class="stat"><span class="v"><span id="stat-sag">25</span><small>%</small></span><span class="k">Fork sag</span></div>
            <div class="stat"><span class="v"><span id="stat-bars">+1</span><small> cm</small></span><span class="k">Bars</span></div>
          </div>
        </div>
        <p class="field-error" id="save-error" hidden>${COPY.saveError}</p>
      </div>`;
  }

  // input: { ruler: bool, before: html above the plate, instruction: one line, mount(api), sync(model, { reset }) }
  // reset is false right after Save, so the control keeps where he was.
  function init(input) {
    const screen = document.querySelector(".screen");
    screen.innerHTML = `<div class="scroll">${shell(input)}</div>
      <div class="actionbar glass is-single"><a class="btn is-block" href="#" id="save">Save fit</a></div>`;
    if (input.before) $("input-before").innerHTML = input.before; else $("input-before").remove();
    $("input-hint").textContent = `${input.instruction} ${COPY.tip}`;
    fig = new BikeFigure($("fig"), { origin: ORIGIN });

    // Flow pages only: show the step progress when he came from search or a listing.
    const from = new URLSearchParams(location.search).get("from");
    if (from === "04-search-results" || from === "05-listing-detail") $("flow-steps").hidden = false;

    $("size").querySelectorAll("[role=radio]").forEach((b) => b.addEventListener("click", () => {
      if (!complete()) return;
      const s = b.dataset.size;
      model.tried = s === fitSize() ? null : s;
      render();
    }));
    $("exp").querySelectorAll("[role=radio]").forEach((b) => b.addEventListener("click", () => set({ exp: b.dataset.exp })));
    $("save").addEventListener("click", (e) => {
      if (model.saved) return; // "Done": goes back
      e.preventDefault();
      if (!complete()) { $("save-error").hidden = false; return; }
      saving = true;
      location.hash = "saved";
    });

    input.mount({ set, model, RANGE, ORDER, next, plate: $("plate") });

    Lead.states((state) => {
      // Saving keeps what he entered; opening a state from the address bar loads that state's data.
      const kept = saving;
      if (saving) Object.assign(model, { tried: null, saved: true });
      else if (state === "empty") Object.assign(model, { height: null, leg: null, exp: "first", tried: null, saved: false });
      else Object.assign(model, DANIEL, { tried: null, saved: state === "saved" });
      saving = false;
      $("save-error").hidden = true;
      render({ instant: !ready });
      input.sync(model, { reset: !kept });
      ready = true;
    });
  }

  // Controls call this. Editing after saving puts the page back into "edited, not saved yet".
  function set(patch) {
    Object.assign(model, patch);
    if (model.saved) { model.saved = false; history.replaceState(null, "", location.pathname + location.search); }
    if (complete()) $("save-error").hidden = true;
    render();
  }

  function render({ instant = false } = {}) {
    const fit = fitSize();
    const size = model.tried || fit || "M";

    // Figure: saddle follows the inside leg; the frame follows the size being shown.
    if (model.leg != null) fig.setSaddle(Fit.saddleRaw(model.leg), { instant });
    if (size !== shownSize) {
      shownSize = size;
      if (instant) { fig.scale = Fit.sizes[size].scale; fig.parts.setAttribute("transform", fig.about(fig.scale)); }
      else swapMoment(size);
    }
    fig.focus(model.leg != null ? "saddle" : null);
    $("fig-readout").textContent = fit ? `Frame ${size}` : "Frame —";
    $("fig-hint").textContent = complete() ? "Try S · M · L" : "Add height and inside leg";

    // Size control and verdict.
    $("size").querySelectorAll("[role=radio]").forEach((b) => {
      b.setAttribute("aria-checked", String(b.dataset.size === size && complete()));
      b.setAttribute("aria-disabled", String(!complete()));
    });
    renderVerdict(size, fit);

    // Saddle height and set-up values.
    const saddle = $("saddle-n");
    if (model.leg != null) roll(saddle, Fit.saddle(model.leg)); else { saddle.textContent = "—"; saddle.dataset.v = ""; }
    const e = Fit.experience[model.exp];
    $("exp").querySelectorAll("[role=radio]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.exp === model.exp)));
    $("exp-note").textContent = e.note;
    $("stat-frame").textContent = fit || "—";
    roll($("stat-sag"), e.sag);
    roll($("stat-bars"), e.bars, (v) => (Math.round(v) > 0 ? "+" : "") + Math.round(v));

    // Save.
    const btn = $("save");
    btn.textContent = model.saved ? "Done" : "Save fit";
    btn.setAttribute("aria-disabled", String(!complete()));
    if (model.saved) btn.setAttribute("data-goes-to", "previous"); else btn.removeAttribute("data-goes-to");
  }

  function renderVerdict(size, fit) {
    const chip = $("size-chip"), list = $("verdict");
    if (!fit || !complete()) { chip.hidden = true; list.innerHTML = ""; return; }
    const r = Fit.check(size, model.height, model.leg);
    chip.hidden = false;
    chip.className = r.fits ? "chip is-pop" : "chip is-quiet is-pop";
    chip.innerHTML = r.fits ? `${icon("check-circle", "icon is-sm")}Fits you · ${size}` : `Size ${size} · yours is ${fit}`;
    list.innerHTML = r.lines.map((l) => `<li class="verdict${l.ok ? "" : " is-off"}">${icon(l.ok ? "check-circle" : "warning-circle", "icon is-sm")}<span>${l.text}</span></li>`).join("");
  }

  // Hero moment 1 (≈720 ms): frame scales from the rear tyre (0–320), readouts settle (200–520), chip pops (520–720).
  function swapMoment(to) {
    const chip = $("size-chip"), list = $("verdict");
    fig.swap(Fit.sizes[to].scale);
    if (still.matches || !window.gsap) { crossFade(list, () => {}); return; }
    gsap.fromTo(list, { opacity: 0.4 }, { opacity: 1, duration: 0.32, delay: 0.2, ease: "none" });
    gsap.fromTo(chip, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, delay: 0.52, ease: "back.out(2)", onStart: haptic });
  }

  window.FitPage = { init };
})();
