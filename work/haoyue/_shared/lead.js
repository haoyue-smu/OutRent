/* Lead pages · shared script. Plain JS. Pages that use the size swap load _shared/gsap.min.js first.
   Exposes window.Lead: still, crossFade, roll, states, haptic, Fit, BikeFigure. */
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const FADE = 160; // reduced-motion stand-in for every movement (DESIGN.md §9)

  // Fade out, change, fade in: 160 ms in total.
  function crossFade(el, update) {
    if (!el.animate) { update(); return; }
    const out = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE / 2, easing: "linear", fill: "forwards" });
    out.onfinish = () => { update(); out.cancel(); el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE / 2, easing: "linear" }); };
  }

  // Small moment: a number rolls to its new value.
  function roll(el, to, format = (v) => String(Math.round(v))) {
    const from = el.dataset.v === undefined || el.dataset.v === "" ? NaN : Number(el.dataset.v);
    el.dataset.v = to;
    cancelAnimationFrame(el._roll);
    if (!Number.isFinite(from) || from === to) { el.textContent = format(to); return; }
    if (still.matches) { crossFade(el, () => { el.textContent = format(to); }); return; }
    const t0 = performance.now(), dur = 320;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = format(from + (to - from) * e);
      if (k < 1) el._roll = requestAnimationFrame(tick);
    };
    el._roll = requestAnimationFrame(tick);
  }

  // States from the address bar (RECIPES §8): …/direction-a/#empty. [data-state] may list several names.
  function states(onShow) {
    const show = () => {
      const want = location.hash.slice(1) || "default";
      document.querySelectorAll("[data-state]").forEach((s) => { s.hidden = !s.dataset.state.split(" ").includes(want); });
      if (onShow) onShow(want);
    };
    addEventListener("hashchange", show);
    show();
  }

  function haptic() { try { if (navigator.vibrate && navigator.userActivation?.hasBeenActive) navigator.vibrate(4); } catch (_) {} }

  // ---------- fit rules (working values: see 03 DECISIONS.md) ----------
  const Fit = {
    saddleRaw: (leg) => leg * 0.883,                       // crank centre to saddle top
    saddle: (leg) => Math.round(leg * 0.883),
    frame: (height) => (height < 167 ? "S" : height <= 180 ? "M" : "L"),
    sizes: {
      S: { scale: 0.92, maxSaddle: 70, reach: 40 },
      M: { scale: 1, maxSaddle: 78, reach: 43 },
      L: { scale: 1.08, maxSaddle: 84, reach: 46 },
    },
    experience: {
      first: { sag: 25, bars: 1, note: "First time on dirt: we soften the fork to 25% sag and raise the bars 1 cm." },
      some: { sag: 22, bars: 0, note: "A few rides in: fork at 22% sag, bars at their usual height." },
      regular: { sag: 20, bars: 0, note: "You ride often: a firmer fork at 20% sag, bars at their usual height." },
    },
    // What happens if he rides frame `size`, given his own fit.
    check(size, height, leg) {
      const fit = Fit.frame(height), s = Fit.sizes[size], saddle = Fit.saddle(leg), own = Fit.sizes[fit];
      const lines = [];
      if (saddle > s.maxSaddle) lines.push({ ok: false, text: `Saddle ${saddle} cm is ${saddle - s.maxSaddle} cm past this frame's limit` });
      else lines.push({ ok: true, text: `Saddle ${saddle} cm is in range` });
      const d = s.reach - own.reach;
      if (d < 0) lines.push({ ok: false, text: `Reach ${s.reach} cm, ${-d} cm short: knees close to the bars` });
      else if (d > 0) lines.push({ ok: false, text: `Reach ${s.reach} cm, ${d} cm long: you stretch for the bars` });
      else lines.push({ ok: true, text: `Reach ${s.reach} cm, arms slightly bent` });
      return { fits: size === fit, fit, lines };
    },
  };

  // ---------- bike explainer figure ----------
  // Drawing axes of the figure (cm → SVG units). The saddle moves along the seat tube; 1 = 24 cm.
  const D = { EX: [2.0907, 0.5558], EY: [-1.1116, 1.0453], EZ: [0, -2.0506], STEER: [0.3746, 0, 0.9272], travelCm: 2.5, saddle: 71.523, move: 24 };
  const SPRING = { stiffness: 300, damping: 26, substeps: 4 }; // "Settle" (DESIGN.md §9)
  const proj = (v) => [D.EX[0] * v[0] + D.EY[0] * v[1] + D.EZ[0] * v[2], D.EX[1] * v[0] + D.EY[1] * v[1] + D.EZ[1] * v[2]];

  class BikeFigure {
    // root: an empty .fig-bike element; the figure from bike-figure.js is placed in it. origin: rear-tyre contact point in SVG units.
    constructor(root, { origin = "0 0" } = {}) {
      this.root = root;
      if (!root.querySelector(".bike")) root.innerHTML = window.LeadFigures.bike;
      this.svg = root.querySelector(".bike");
      this.parts = this.svg.querySelector(".b-parts");
      this.travelEl = this.svg.querySelector("[data-travel]");
      this.nodes = [...this.parts.children].map((el) => ({ el, part: el.dataset.part, with: el.dataset.with || el.dataset.part, z: +el.dataset.z, dz: +el.dataset.dz, move: el.dataset.move.split(",").map(Number) }));
      this.sp = Object.fromEntries(["saddle", "cockpit", "front", "frame", "stand", "travel"].map((id) => [id, { x: 0, v: 0, want: 0 }]));
      this.origin = origin;
      this.scale = 1;
      this.order = "";
      this.raf = 0;
      this.last = 0;
    }
    setSaddle(cm, { instant = false } = {}) {
      this.sp.saddle.want = (cm - D.saddle) / D.move;
      if (instant || still.matches) this.sp.saddle.x = this.sp.saddle.want;
      this.run();
    }
    focus(part) {
      this.root.toggleAttribute("data-focus", !!part);
      this.nodes.forEach((o) => o.el.toggleAttribute("data-on", !!part && o.part === part));
    }
    // Hero moment 2: parts lift apart along their own axis (1) or snap back (0); the frame never moves.
    // Tweened with GSAP so the timing follows the storyboard; reduced motion gets a 160 ms cross-fade.
    explode(on, { ids = ["saddle", "cockpit"], duration = 0.48, stagger = 0.08 } = {}) {
      const to = on ? 1 : 0, list = (on ? ids : [...ids].reverse()).map((id) => this.sp[id]);
      const gsap = window.gsap;
      if (still.matches || !gsap) {
        crossFade(this.root, () => { list.forEach((s) => { s.x = s.want = to; s.v = 0; }); this.place(); });
        return null;
      }
      gsap.killTweensOf(list);
      list.forEach((s) => { s.want = to; s.v = 0; s.locked = true; });
      return gsap.to(list, { x: to, duration, stagger, ease: "expo.out", onUpdate: () => this.place(), onComplete: () => list.forEach((s) => { s.locked = false; }) });
    }
    // Fork sag: the front end sinks by its travel (step 2 on the listing).
    travel(on) {
      this.sp.travel.want = on ? 1 : 0;
      this.run();
    }
    // Hero moment 1: the frame grows or shrinks from where the rear tyre touches the plate.
    swap(toScale) {
      const from = this.scale;
      if (from === toScale) return null;
      this.scale = toScale;
      const gsap = window.gsap;
      if (still.matches || !gsap) {
        crossFade(this.root, () => this.parts.setAttribute("transform", this.about(toScale)));
        return null;
      }
      if (!this.ghost) {
        this.ghost = this.parts.cloneNode(true);
        this.ghost.setAttribute("class", "b-ghost");
        this.ghost.setAttribute("aria-hidden", "true");
        this.parts.before(this.ghost);
      }
      gsap.killTweensOf([this.parts, this.ghost]);
      gsap.set(this.ghost, { scale: from, svgOrigin: this.origin, opacity: 0.9 });
      return gsap.timeline()
        .to(this.parts, { scale: toScale, svgOrigin: this.origin, duration: 0.32, ease: "back.out(1.6)" }, 0)
        .to(this.ghost, { opacity: 0, duration: 0.32, ease: "none" }, 0.08);
    }
    about(k) {
      const [x, y] = this.origin.split(" ").map(Number);
      return `translate(${x * (1 - k)} ${y * (1 - k)}) scale(${k})`;
    }
    run() { if (!this.raf) { this.last = 0; this.raf = requestAnimationFrame((t) => this.tick(t)); } }
    tick(now) {
      const dt = this.last ? Math.min((now - this.last) / 1000, 1 / 30) : 1 / 60;
      this.last = now;
      let moving = false;
      for (const s of Object.values(this.sp)) {
        if (s.locked) continue; // driven by a tween
        if (still.matches) { s.x = s.want; s.v = 0; continue; }
        for (let i = 0; i < SPRING.substeps; i++) { const h = dt / SPRING.substeps; s.v += ((s.want - s.x) * SPRING.stiffness - s.v * SPRING.damping) * h; s.x += s.v * h; }
        if (Math.abs(s.want - s.x) < 1e-3 && Math.abs(s.v) < 1e-3) { s.x = s.want; s.v = 0; }
        if (s.x !== s.want) moving = true;
      }
      this.place();
      this.raf = moving ? requestAnimationFrame((t) => this.tick(t)) : 0;
    }
    place() {
      const share = (id) => (this.sp[id] ? this.sp[id].x : 0);
      for (const o of this.nodes) {
        const sh = share(o.with);
        if (!sh) { o.el.removeAttribute("transform"); continue; }
        const [dx, dy] = proj(o.move.map((c) => c * sh));
        o.el.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
      }
      const sorted = [...this.nodes].sort((a, b) => (a.z + a.dz * share(a.with)) - (b.z + b.dz * share(b.with)));
      const sig = sorted.map((o) => this.nodes.indexOf(o)).join(",");
      if (sig !== this.order) { this.order = sig; const f = document.createDocumentFragment(); sorted.forEach((o) => f.appendChild(o.el)); this.parts.appendChild(f); }
      if (this.travelEl) {
        const s = this.sp.travel.x, [sx, sy] = proj(D.STEER.map((c) => c * D.travelCm * s));
        if (s) this.travelEl.setAttribute("transform", `translate(${sx.toFixed(2)} ${sy.toFixed(2)})`); else this.travelEl.removeAttribute("transform");
      }
    }
  }

  window.Lead = { still, crossFade, roll, states, haptic, Fit, BikeFigure };
})();
