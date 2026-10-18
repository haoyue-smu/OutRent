# RECIPES.md — small patterns you can copy

Each recipe uses only classes from `components.css` and tokens from `tokens.css`, so it passes `npm run check`. Copy the HTML into your page and the script into one `<script>` at the end of `<body>`.

Live examples: `npm run dev` → **Recipes** at http://localhost:5173/design/recipes.html

Contents: 1 Bottom sheet · 2 Show more (disclosure) · 3 Segmented switch · 4 Step progress · 5 Agree before paying · 6 Count-up number · 7 Ruler input · 8 Showing states · 9 Reduced motion

---

## 1. Bottom sheet

For a short task on top of the page: add an item, pick a time, see details. Not for a whole flow.

```html
<button class="btn is-secondary" data-open-sheet="add-item">Add item</button>

<div class="sheet-scrim" data-sheet-scrim="add-item"></div>
<section class="bottom-sheet" id="add-item" role="dialog" aria-modal="true" aria-labelledby="add-item-title">
  <span class="grabber" aria-hidden="true"></span>
  <div class="sheet-head">
    <h2 class="t-title" id="add-item-title">Add an item</h2>
    <button class="icon-btn" aria-label="Close" data-close-sheet>
      <svg class="icon" aria-hidden="true"><use href="../../../../design/icons.svg#i-x"/></svg>
    </button>
  </div>
  <!-- fields here -->
  <button class="btn is-block" data-close-sheet>Save item</button>
</section>
```

```js
document.querySelectorAll("[data-open-sheet]").forEach((btn) => btn.addEventListener("click", () => openSheet(btn.dataset.openSheet, btn)));
let lastOpener = null;
function openSheet(id, opener) {
  lastOpener = opener;
  document.getElementById(id).classList.add("is-open");
  document.querySelector(`[data-sheet-scrim="${id}"]`).classList.add("is-open");
  document.getElementById(id).querySelector("button, input, select, textarea")?.focus();
}
function closeSheets() {
  document.querySelectorAll(".bottom-sheet.is-open, .sheet-scrim.is-open").forEach((el) => el.classList.remove("is-open"));
  lastOpener?.focus();
}
document.querySelectorAll("[data-close-sheet], .sheet-scrim").forEach((el) => el.addEventListener("click", closeSheets));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheets(); });
```

## 2. Show more (disclosure)

For detail most people skip: damage terms, how the deposit works. No script needed.

```html
<details class="card">
  <summary>What counts as damage
    <svg class="icon is-sm" aria-hidden="true"><use href="../../../../design/icons.svg#i-caret-right"/></svg>
  </summary>
  <p class="t-body">Scratches from normal riding are fine. You pay for bent parts or a cracked frame.</p>
</details>
```

## 3. Segmented switch

Two or three views of the same thing (e.g. Home collection / Drop at a rack).

```html
<div class="segmented" role="radiogroup" aria-label="How it gets there">
  <button role="radio" aria-checked="true" data-panel="p-home">Home collection</button>
  <button role="radio" aria-checked="false" data-panel="p-rack">Drop at a rack</button>
</div>
<div id="p-home"> … </div>
<div id="p-rack" hidden> … </div>
```

```js
document.querySelectorAll(".segmented").forEach((group) => {
  const buttons = [...group.querySelectorAll("[role=radio]")];
  buttons.forEach((b) => b.addEventListener("click", () => {
    buttons.forEach((x) => { x.setAttribute("aria-checked", x === b); document.getElementById(x.dataset.panel).hidden = x !== b; });
  }));
});
```

## 4. Step progress

Flow pages only (06, 07). Mark finished steps `is-done` and the current one `aria-current="step"`.

```html
<ol class="steps" aria-label="Booking progress">
  <li class="is-done">Pick</li><li class="is-done">Fit</li><li aria-current="step">Deliver</li><li>Ride</li><li>Return</li>
</ol>
```

## 5. Agree before paying

The box starts unticked. The button stays disabled until it is ticked; tapping it early shows how to fix it.

```html
<label class="row" style="min-height: var(--touch)">
  <input type="checkbox" id="agree"> <span class="t-body">I agree to the damage and cancellation terms</span>
</label>
<p class="field-error" id="agree-error" hidden>Tick the box above to agree before paying.</p>
<div class="actionbar glass">
  <div class="price"><b>S$53</b><small>S$150 deposit held</small></div>
  <button class="btn" id="pay" aria-disabled="true" data-goes-to="08-booking-confirmation">Pay S$53</button>
</div>
```

```js
const agree = document.getElementById("agree"), pay = document.getElementById("pay"), err = document.getElementById("agree-error");
agree.addEventListener("change", () => { pay.setAttribute("aria-disabled", !agree.checked); if (agree.checked) err.hidden = true; });
pay.addEventListener("click", (e) => { if (!agree.checked) { e.preventDefault(); err.hidden = false; agree.focus(); } });
```

Use `aria-disabled` (not `disabled`) so the tap still reaches the button and can explain itself.

## 6. Count-up number

For a total or a refund that just changed. Runs once, skips the animation for reduced motion.

```html
<b class="t-large" data-count-to="150" data-prefix="S$">S$150</b>
```

```js
document.querySelectorAll("[data-count-to]").forEach((el) => {
  const end = Number(el.dataset.countTo), pre = el.dataset.prefix || "";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const t0 = performance.now(), dur = 560;
  const tick = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = pre + Math.round(end * e); if (k < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
```

## 7. Ruler input

Only for a length the person sets (height, inside leg). Drag or use arrow keys; snaps to whole cm.

```html
<figure class="explainer has-ruler" style="margin: 0">
  <svg class="ruler" viewBox="0 0 353 64" data-min="60" data-max="95" data-value="81" data-unit="cm" aria-label="Inside leg"></svg>
  <div class="placeholder">Explainer figure · supplied by Haoyue</div>
  <span class="corner hint">Drag the ruler</span><span class="corner readout" id="leg-readout">81 cm</span>
</figure>
```

```js
document.querySelectorAll("svg.ruler[data-min]").forEach((svg) => {
  const NS = "http://www.w3.org/2000/svg", min = +svg.dataset.min, max = +svg.dataset.max, unit = svg.dataset.unit || "";
  const L = 22, R = 331, step = (R - L) / (max - min), x = (v) => L + (v - min) * step;
  const el = (tag, attrs, text) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (text != null) n.textContent = text; svg.appendChild(n); return n; };
  const labels = {};
  for (let v = min; v <= max; v++) {
    const major = v % 5 === 0;
    el("line", { class: major ? "major" : "minor", x1: x(v), x2: x(v), y1: 40, y2: major ? 52 : 47 });
    if (major) labels[v] = el("text", { x: x(v), y: 62, "text-anchor": "middle" }, v);
  }
  const needle = el("line", { class: "needle", y1: 30, y2: 54 });
  const bubble = el("rect", { class: "bubble", y: 8, width: 52, height: 22, rx: 11 });
  const bubbleT = el("text", { class: "bubble-t", y: 23, "text-anchor": "middle" });
  Object.assign(svg, { tabIndex: 0 }); svg.setAttribute("role", "slider");
  svg.setAttribute("aria-valuemin", min); svg.setAttribute("aria-valuemax", max);
  let value = +svg.dataset.value;
  function set(v, snap = true) {
    v = Math.max(min, Math.min(max, v)); const shown = snap ? Math.round(v) : v;
    if (Math.round(shown) !== value && navigator.vibrate) navigator.vibrate(4);
    value = Math.round(shown);
    const px = x(shown); needle.setAttribute("x1", px); needle.setAttribute("x2", px);
    bubble.setAttribute("x", px - 26); bubbleT.setAttribute("x", px); bubbleT.textContent = `${value} ${unit}`;
    for (const k in labels) labels[k].classList.toggle("on", Math.abs(k - value) < 3);
    svg.setAttribute("aria-valuenow", value); svg.setAttribute("aria-valuetext", `${value} ${unit}`);
    svg.dispatchEvent(new CustomEvent("change", { detail: value }));
  }
  const toValue = (e) => { const r = svg.getBoundingClientRect(); return min + ((e.clientX - r.left) * (353 / r.width) - L) / step; };
  svg.addEventListener("pointerdown", (e) => { svg.setPointerCapture(e.pointerId); set(toValue(e), false); });
  svg.addEventListener("pointermove", (e) => { if (svg.hasPointerCapture(e.pointerId)) set(toValue(e), false); });
  svg.addEventListener("pointerup", (e) => set(toValue(e)));
  svg.addEventListener("keydown", (e) => { const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]; if (d) { e.preventDefault(); set(value + d); } });
  set(value);
});
// Listen for the value:
document.querySelector("svg.ruler")?.addEventListener("change", (e) => {
  document.getElementById("leg-readout").textContent = `${e.detail} cm`;
});
```

## 8. Showing states

Specs list states (empty, error, loading…). Build them all in one file and switch with the address bar: `…/direction-a/#empty`.

```html
<section data-state="default"> … </section>
<section data-state="empty" hidden> … </section>
<section data-state="error" hidden> … </section>
```

```js
function showState() {
  const want = location.hash.slice(1) || "default";
  document.querySelectorAll("[data-state]").forEach((s) => (s.hidden = s.dataset.state !== want));
}
addEventListener("hashchange", showState); showState();
```

List the state names in DECISIONS.md so reviewers know which `#…` to open.

## 9. Reduced motion

Durations in `tokens.css` already shrink for people who turn motion off. For anything that moves across the screen, also wrap it:

```css
@media (prefers-reduced-motion: no-preference) {
  .card { transition: transform var(--t-base) var(--ease-glide); }
}
```

Keep motion to these: press 120 ms (`--t-press`), small change 200 ms (`--t-quick`), sheet or panel 320 ms (`--t-base`), big moment 560 ms (`--t-slow`). Ease with `var(--ease-glide)` going in and `var(--ease-exit)` going out.
