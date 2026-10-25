import { gsap } from 'gsap'
import '@photos/_shared/bike-figure.js'
import { haptic, still } from '../../shell/direction'
import { Fit } from '../../shell/store'

// 03 · the fitting session, ported from the v52 prototype (its script, unchanged in behaviour).
// The Anatomy bike (Haoyue's figure) stays in a tall stage; each step moves the camera to the part it sets and
// shows the hand work there at full size: the frame swap, the seat-clamp key, the fork dial and O-ring, the stem
// key and the spacer. It works on the page's own DOM (the stage, the step panels, the tapes, the dock button).

declare global { interface Window { LeadFigures: { bike: string } } }

type V2 = [number, number]
type V3 = [number, number, number]
const D = { EX: [2.0907, 0.5558], EY: [-1.1116, 1.0453], EZ: [0, -2.0506], saddle: 71.523, move: 24 }
const proj = (v: number[]): V2 => [D.EX[0] * v[0] + D.EY[0] * v[1] + D.EZ[0] * v[2], D.EX[1] * v[0] + D.EY[1] * v[1] + D.EZ[1] * v[2]]
const ORIGIN: V2 = [450, 306]
const NS = 'http://www.w3.org/2000/svg'
type SvgEl = SVGGraphicsElement & { [k: string]: any } // eslint-disable-line @typescript-eslint/no-explicit-any
const mk = (tag: string, attrs: Record<string, string | number>, parent?: Element): SvgEl => {
  const e = document.createElementNS(NS, tag) as SvgEl
  for (const k in attrs) e.setAttribute(k, String(attrs[k]))
  parent?.appendChild(e)
  return e
}
const P = (q: number[]) => q[0].toFixed(2) + ' ' + q[1].toFixed(2)

type Node = { el: SVGGraphicsElement; part: string; with: string; move: number[] }
class Bike {
  svg: SVGSVGElement; parts: SVGGElement; nodes: Node[]
  s = { x: 0, v: 0, want: 0 }; scale = 1; raf = 0; last = 0; ghost?: SVGGElement
  listeners: (() => void)[] = []; partsBase = ''
  constructor(root: HTMLElement) {
    root.innerHTML = window.LeadFigures.bike
    this.svg = root.querySelector('.bike') as SVGSVGElement
    this.parts = this.svg.querySelector('.b-parts') as SVGGElement
    this.nodes = [...this.parts.children].map((el) => {
      const d = (el as HTMLElement).dataset
      return { el: el as SVGGraphicsElement, part: d.part ?? '', with: d.with || d.part || '', move: (d.move ?? '0,0,0').split(',').map(Number) }
    })
  }
  saddleCm() { return D.saddle + this.s.x * D.move }
  setSaddle(cm: number, instant?: boolean) { this.s.want = (cm - D.saddle) / D.move; if (instant || still()) { this.s.x = this.s.want; this.s.v = 0; this.place() } else this.run() }
  run() { if (!this.raf) { this.last = 0; this.raf = requestAnimationFrame((t) => this.tick(t)) } }
  tick(now: number) {
    const dt = this.last ? Math.min((now - this.last) / 1000, 1 / 30) : 1 / 60; this.last = now
    const s = this.s
    for (let i = 0; i < 4; i++) { const h = dt / 4; s.v += ((s.want - s.x) * 300 - s.v * 26) * h; s.x += s.v * h }
    if (Math.abs(s.want - s.x) < 1e-3 && Math.abs(s.v) < 1e-3) { s.x = s.want; s.v = 0 }
    this.place()
    this.raf = s.x !== s.want ? requestAnimationFrame((t) => this.tick(t)) : 0
  }
  place() {
    const sh = this.s.x
    for (const o of this.nodes) {
      if (o.with !== 'saddle' || !sh) { if (o.with === 'saddle') o.el.removeAttribute('transform'); continue }
      const [dx, dy] = proj(o.move.map((c) => c * sh))
      o.el.setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`)
    }
    this.listeners.forEach((f) => f())
  }
  focus(part: string | null) { this.nodes.forEach((o) => o.el.toggleAttribute('data-on', !!part && o.part === part)) }
  swap(k: number) {
    if (k === this.scale) return
    const from = this.scale; this.scale = k
    if (still()) { this.parts.setAttribute('transform', `translate(${ORIGIN[0] * (1 - k)} ${ORIGIN[1] * (1 - k)}) scale(${k})`); this.listeners.forEach((f) => f()); return }
    if (!this.ghost) {
      this.ghost = this.parts.cloneNode(true) as SVGGElement; this.ghost.setAttribute('class', 'b-ghost'); this.ghost.removeAttribute('id')
      this.ghost.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id')); this.parts.before(this.ghost)
    }
    gsap.killTweensOf([this.parts, this.ghost])
    gsap.set(this.ghost, { scale: from, svgOrigin: ORIGIN.join(' '), opacity: 0.9 })
    gsap.to(this.parts, { scale: k, svgOrigin: ORIGIN.join(' '), duration: 0.34, ease: 'back.out(1.6)', onUpdate: () => this.listeners.forEach((f) => f()) })
    gsap.to(this.ghost, { opacity: 0, duration: 0.34, delay: 0.08, ease: 'none' })
  }
  swapNow(k: number) { this.scale = k; if (k === 1) this.parts.removeAttribute('transform'); else this.parts.setAttribute('transform', `translate(${ORIGIN[0] * (1 - k)} ${ORIGIN[1] * (1 - k)}) scale(${k})`) }
  stop() { cancelAnimationFrame(this.raf); this.raf = 0 }
}

// ---------- the measuring tape: drag the scale under a fixed needle (one scale, or two on one tape) ----------
export function Tape(el: HTMLElement, o: { min: number; max: number; value: number; onChange: (v: number) => void; bands?: Record<string, [number, number]>; focus?: (on: boolean) => void; sub?: number }) {
  const { min, max, onChange, bands, focus, sub } = o
  const PX = 11, svg = el.querySelector('svg') as SVGSVGElement, W = () => el.clientWidth, H = sub ? 66 : 46
  const total = (max - min) * PX, pad = 240
  svg.setAttribute('width', String(total + pad * 2)); svg.setAttribute('viewBox', `0 0 ${total + pad * 2} ${H}`)
  let s = ''
  if (sub) { // a slide rule: inside leg above, the saddle it gives below
    s += `<line class="mid" x1="0" x2="${total + pad * 2}" y1="33" y2="33"/>`
    for (let c = min; c <= max; c++) { const x = pad + (c - min) * PX, maj = c % 5 === 0
      s += `<line class="tk${maj ? ' maj' : ''}" x1="${x}" x2="${x}" y1="${maj ? 15 : 21}" y2="32"/>`; if (maj) s += `<text x="${x}" y="11" text-anchor="middle">${c}</text>` }
    for (let c = Math.ceil(min * sub); c <= Math.floor(max * sub); c++) { const x = pad + (c / sub - min) * PX, maj = c % 5 === 0
      s += `<line class="sub" x1="${x}" x2="${x}" y1="34" y2="${maj ? 49 : 43}"/>`; if (maj) s += `<text class="sub" x="${x}" y="61" text-anchor="middle">${c}</text>` }
  } else {
    if (bands) for (const [k, [a, b]] of Object.entries(bands)) {
      s += `<rect class="band" data-b="${k}" x="${pad + (a - min) * PX + 1}" y="0" width="${(b - a) * PX - 2}" height="3" rx="1.5"/>`
      s += `<text class="bandt" data-b="${k}" x="${pad + ((a + b) / 2 - min) * PX}" y="14" text-anchor="middle">${k}</text>`
    }
    for (let c = min; c <= max; c++) { const x = pad + (c - min) * PX, maj = c % 5 === 0
      s += `<line class="tk${maj ? ' maj' : ''}" x1="${x}" x2="${x}" y1="${maj ? 18 : 22}" y2="32"/>`; if (maj) s += `<text x="${x}" y="44" text-anchor="middle">${c}</text>` }
  }
  svg.innerHTML = s
  let v = o.value, raw = o.value, drag: null | { x: number; from: number } = null
  const place = () => {
    svg.style.transform = `translateX(${W() / 2 - pad - (raw - min) * PX}px)`
    if (bands) { const z = Fit.frame(Math.round(raw)); svg.querySelectorAll<SVGElement>('[data-b]').forEach((b) => b.classList.toggle('on', b.dataset.b === z)) }
  }
  const setV = (nv: number) => { nv = Math.max(min, Math.min(max, nv)); raw = nv; const r = Math.round(nv); if (r !== v) { v = r; haptic(); el.setAttribute('aria-valuenow', String(v)); el.setAttribute('aria-valuetext', `${v} cm`); onChange(v) } place() }
  const down = (e: PointerEvent) => { drag = { x: e.clientX, from: raw }; el.setPointerCapture(e.pointerId); focus?.(true) }
  const move = (e: PointerEvent) => { if (drag) setV(drag.from - (e.clientX - drag.x) / PX) }
  const end = () => {
    if (!drag) return; drag = null; focus?.(false)
    const to = Math.round(raw)
    if (!still()) { const q = { r: raw }; gsap.to(q, { r: to, duration: 0.25, ease: 'power2.out', onUpdate: () => { raw = q.r; place() } }) } else { raw = to; place() }
  }
  const key = (e: KeyboardEvent) => { const d = ({ ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 } as Record<string, number>)[e.key]; if (!d) return; e.preventDefault(); setV(v + d); raw = v; place() }
  el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); el.addEventListener('keydown', key)
  addEventListener('resize', place)
  place()
  return { place, destroy: () => removeEventListener('resize', place) }
}

// ---------- the session ----------
const AXS = proj([0.374, 0, 0.927])
const SEAL: V2 = [197, 132.5], HEAD: V2 = [226.6, 76.4]
const COLLAR: V2 = [366.6, 145.6], CAP: V2 = [229.2, 64.6]
const STEERAX: V3 = [0.374, 0, 0.927]
const add2 = (p: number[], q: number[]): V2 => [p[0] + q[0], p[1] + q[1]]
const v3 = (a: number[], b: number[], c: number[], ka: number, kb: number, kc: number): V3 => [a[0] * ka + b[0] * kb + c[0] * kc, a[1] * ka + b[1] * kb + c[1] * kc, a[2] * ka + b[2] * kb + c[2] * kc]
const onAxis = (base: number[], ax: number[], u: number[], w: number[], h: number, r: number, t: number) => add2(base, proj(v3(ax, u, w, h, r * Math.cos(t), r * Math.sin(t))))
const ringPts = (c: number[], r: number, h: number, n = 28) => {
  const pts: V2[] = []
  for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; const w = [0.927 * Math.sin(t) * r, Math.cos(t) * r, -0.374 * Math.sin(t) * r]; const q = proj(w); pts.push([c[0] + q[0] + AXS[0] * h, c[1] + q[1] + AXS[1] * h]) }
  return pts
}
const poly = (pts: number[][]) => 'M' + pts.map((q) => q[0].toFixed(2) + ' ' + q[1].toFixed(2)).join('L') + 'Z'
function bandPath(c: number[], r: number, h0: number, h1: number): Record<string, string> {
  const lo = ringPts(c, r, h0), hi = ringPts(c, r, h1)
  const nx = -AXS[1], ny = AXS[0], d = (q: number[]) => q[0] * nx + q[1] * ny
  let iMin = 0, iMax = 0; lo.forEach((q, i) => { if (d(q) < d(lo[iMin])) iMin = i; if (d(q) > d(lo[iMax])) iMax = i })
  const arc: V2[] = []; for (let i = iMin; ; i = (i + 1) % lo.length) { arc.push(lo[i]); if (i === iMax) break }
  const arc2: V2[] = []; for (let i = iMin; ; i = (i - 1 + lo.length) % lo.length) { arc2.push(lo[i]); if (i === iMax) break }
  const front = (arc.reduce((s, q) => s + q[1], 0) / arc.length) > (arc2.reduce((s, q) => s + q[1], 0) / arc2.length) ? arc : arc2
  const side = front.concat(front.slice().reverse().map((q): V2 => [q[0] + AXS[0] * (h1 - h0), q[1] + AXS[1] * (h1 - h0)]))
  return { side: poly(side), top: poly(hi), edge: 'M' + front.map((q) => q.join(' ')).join('L') }
}
const WHEEL_R = 36.8
function wheelMatrix(c: number[], th: number) {
  const a = D.EX[0], b = D.EZ[0], c2 = D.EX[1], d = D.EZ[1], det = a * d - b * c2
  const co = Math.cos(th), si = Math.sin(th)
  const AR = [[a * co + b * si, -a * si + b * co], [c2 * co + d * si, -c2 * si + d * co]]
  const M = [[(AR[0][0] * d - AR[0][1] * c2) / det, (-AR[0][0] * b + AR[0][1] * a) / det], [(AR[1][0] * d - AR[1][1] * c2) / det, (-AR[1][0] * b + AR[1][1] * a) / det]]
  const e = c[0] - (M[0][0] * c[0] + M[0][1] * c[1]), f = c[1] - (M[1][0] * c[0] + M[1][1] * c[1])
  return `matrix(${M[0][0].toFixed(5)} ${M[1][0].toFixed(5)} ${M[0][1].toFixed(5)} ${M[1][1].toFixed(5)} ${e.toFixed(3)} ${f.toFixed(3)})`
}
const ASP03 = 1.08
const VIEWS3: Record<string, { c: V2; w: number }> = { saddle: { c: [376, 130], w: 190 }, front: { c: [200, 120], w: 112 }, cockpit: { c: [236, 62], w: 118 } }
const STEPVIEW: Record<number, string> = { 1: 'full', 2: 'saddle', 3: 'cockpit', 4: 'full' }

export type SessionOpts = {
  fig: HTMLElement; stage: HTMLElement
  height: number; leg: number; hasProfile: boolean
  onStep: (n: number) => void
}
export function createSession(o: SessionOpts) {
  const fit = { height: o.height, leg: o.leg }
  const bike = new Bike(o.fig)
  if (!(bike.svg.getBBox().width > 0)) throw new Error('03 figure not laid out yet')
  const svg = bike.svg
  const st03 = { sag: 1, bar: 1 }
  const tool03: { at: string | null; phi: number } = { at: null, phi: 0 }
  const roll03 = { d: 0, chock: 1 }
  let walk03: gsap.core.Timeline | null = null
  let step3 = 1, set3 = { saddle: true, ride: true }
  const vbNow = { x: 0, y: 0, w: 1, h: 1 }
  let VBF = { x: 0, y: 0, w: 1, h: 1 }

  // the saddle dimension line beside the seat tube
  const sb = bike.nodes.filter((n) => n.part === 'saddle').map((n) => n.el.getBBox())
    .reduce((a, b) => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), X: Math.max(a.X, b.x + b.width) }), { x: 1e9, y: 1e9, X: -1e9 })
  const TOP0 = [(sb.x + sb.X) / 2, sb.y]
  const U = proj([7.02 / 24, 0, 22.95 / 24])
  const BB = [TOP0[0] - U[0] * D.saddle, TOP0[1] - U[1] * D.saddle]
  const len = Math.hypot(U[0], U[1]), dir = [U[0] / len, U[1] / len]
  let nrm = [-dir[1], dir[0]]; if (nrm[0] < 0) nrm = [-nrm[0], -nrm[1]]
  const off = 26
  const dimG = mk('g', { class: 'dim' }, svg)
  const ext1 = mk('line', { class: 'ext' }, dimG), ext2 = mk('line', { class: 'ext' }, dimG), main = mk('line', {}, dimG)
  const t1 = mk('line', {}, dimG), t2 = mk('line', {}, dimG)
  const pill = mk('rect', { rx: 8, width: 48, height: 17 }, dimG), lab = mk('text', { 'text-anchor': 'middle' }, dimG)
  const sc = ([x, y]: number[]) => [ORIGIN[0] + bike.scale * (x - ORIGIN[0]), ORIGIN[1] + bike.scale * (y - ORIGIN[1])]
  let shown = 1
  const setL = (el: Element, p: number[], q: number[]) => { el.setAttribute('x1', String(p[0])); el.setAttribute('y1', String(p[1])); el.setAttribute('x2', String(q[0])); el.setAttribute('y2', String(q[1])) }
  const drawDim = () => {
    const cm = bike.saddleCm()
    const a = sc(BB), t = sc([BB[0] + U[0] * cm, BB[1] + U[1] * cm])
    const A = [a[0] + nrm[0] * off, a[1] + nrm[1] * off], T = [t[0] + nrm[0] * off, t[1] + nrm[1] * off]
    const Tp = [A[0] + (T[0] - A[0]) * shown, A[1] + (T[1] - A[1]) * shown]
    setL(ext1, a, [A[0] + nrm[0] * 5, A[1] + nrm[1] * 5]); setL(ext2, t, [T[0] + nrm[0] * 5, T[1] + nrm[1] * 5])
    setL(main, A, Tp)
    const tk = (p: number[]) => [[p[0] - nrm[0] * 5, p[1] - nrm[1] * 5], [p[0] + nrm[0] * 5, p[1] + nrm[1] * 5]]
    const [a1, b1] = tk(A), [a2, b2] = tk(Tp); setL(t1, a1, b1); setL(t2, a2, b2)
    ext2.style.opacity = t2.style.opacity = shown > 0.98 ? '1' : '0'
    const mx = (A[0] + T[0]) / 2 + nrm[0] * 30, my = (A[1] + T[1]) / 2 + nrm[1] * 30
    pill.setAttribute('x', String(mx - 24)); pill.setAttribute('y', String(my - 9)); lab.setAttribute('x', String(mx)); lab.setAttribute('y', String(my + 3.6))
    lab.textContent = Math.round(cm) + ' cm'
    dimG.style.opacity = shown > 0 ? '1' : '0'
  }
  const dimShown = (v: number) => { shown = v; drawDim() }
  bike.listeners.push(drawDim)

  // frame the drawing on its own ink (the bike, the stand and its shadow)
  const ink = [...svg.children].filter((e) => e !== dimG && !(e.tagName === 'text' && !e.getAttribute('transform'))).map((e) => (e as SVGGraphicsElement).getBBox()).filter((b) => b.width > 12)
    .reduce((a, b) => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), X: Math.max(a.X, b.x + b.width), Y: Math.max(a.Y, b.y + b.height) }), { x: 1e9, y: 1e9, X: -1e9, Y: -1e9 })

  // the parts the session moves: the O-ring on the fork stanchion, the spacer under the stem, the tools
  bike.parts.id = 'bparts'
  const cock = bike.nodes.filter((n) => n.part === 'cockpit' && n.move.some((v) => v))
  const fronts = bike.nodes.filter((n) => n.part === 'front').map((n) => ({ n, b: n.el.getBBox() }))
  const nearStanchion = fronts.filter((f) => f.b.height > 25 && f.b.height < 35).sort((a, b) => b.b.y - a.b.y)[0].n.el
  const headset = bike.nodes.find((n) => n.part === 'cockpit' && !n.move.some((v) => v))!.el
  const oring = mk('g', { class: 'b-part b-ring', 'data-part': 'front' }); nearStanchion.after(oring)
  const spacer = mk('g', { class: 'b-part b-spacer', 'data-part': 'cockpit' }); headset.after(spacer)
  ;['side', 'top', 'edge'].forEach((k) => { mk('path', { class: 'k-' + k }, oring); mk('path', { class: 'k-' + k }, spacer) })
  bike.nodes.push({ el: oring, part: 'front', with: 'front', move: [0, 0, 0] }, { el: spacer, part: 'cockpit', with: 'cockpit', move: [0, 0, 0] })
  const rulG = mk('g', { class: 'rul' })
  const toolG = mk('g', { class: 'tool3' })
  toolG.key = [mk('path', { class: 'ko' }, toolG), mk('path', { class: 'ki' }, toolG), mk('path', { class: 'ks' }, toolG)]
  toolG.head = mk('path', { class: 'bh' }, toolG); toolG.sock = mk('path', { class: 'bs' }, toolG)
  toolG.dial = mk('path', { class: 'dl' }, toolG); toolG.dtop = mk('path', { class: 'dt' }, toolG); toolG.knurl = mk('path', { class: 'kn' }, toolG)
  const big = bike.nodes.filter((n) => n.part === 'frame' && n.el.querySelector('.b-line') && n.el.children.length === 1).map((n) => ({ el: n.el, b: n.el.getBBox() })).filter((x) => x.b.width > 100)
  const spokes = big.map((x) => ({ el: x.el, c: [x.b.x + x.b.width / 2, x.b.y + x.b.height / 2] }))
  const standN = bike.nodes.filter((n) => n.part === 'stand').map((n) => { const b = n.el.getBBox(); return { el: n.el, base: b.y + b.height } })
  // the sag scale beside the stanchion: 0 to 100 mm of travel, the set mark at 25 mm
  {
    const n = [AXS[1], -AXS[0]], L = Math.hypot(n[0], n[1]), nn = [n[0] / L, n[1] / L], o6 = 6.5
    const at = (h: number, oo: number) => [SEAL[0] + AXS[0] * h + nn[0] * oo, SEAL[1] + AXS[1] * h + nn[1] * oo]
    const ln = (p: number[], q: number[], c?: string) => mk('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], class: c || '' }, rulG)
    ln(at(0, o6), at(10, o6))
    for (let mm = 0; mm <= 100; mm += 5) { const maj = mm % 25 === 0; ln(at(mm / 10, o6), at(mm / 10, o6 + (maj ? 2.6 : 1.4)), maj ? 'maj' : '') }
    rulG.k = ln(at(2.5, o6 - 1.4), at(2.5, o6 + 3.6), 'k')
  }
  const overG = mk('g', { class: 'over3' }); svg.appendChild(overG); overG.appendChild(rulG); overG.appendChild(toolG)
  const labG = mk('g', { class: 'lab3', 'aria-hidden': 'true' }); svg.appendChild(labG); labG.style.opacity = '0'
  const labItems = ([['frame', [296, 100]], ['front', [170, 150]], ['cockpit', [262, 46]]] as [string, V2][]).map(([k, at]) => { const g = mk('g', {}, labG); return { k, at, g, r: mk('rect', { rx: 9, height: 19 }, g), t: mk('text', { y: 4.6 }, g) } })

  const drawTool = () => {
    const at = tool03.at, show = (el: SVGElement, on: boolean) => { el.style.display = on ? '' : 'none' }
    const keyOn = at === 'saddle' || at === 'cockpit'
    ;(toolG.key as SVGElement[]).forEach((e) => show(e, keyOn)); show(toolG.head, keyOn); show(toolG.sock, keyOn)
    ;[toolG.dial, toolG.dtop, toolG.knurl].forEach((e: SVGElement) => show(e, at === 'front'))
    if (!at) return
    const phi = tool03.phi
    if (at === 'front') { // the dial on the crown, on top of the near leg; its knurl turns
      const base = [SEAL[0] + AXS[0] * 16.2, SEAL[1] + AXS[1] * 16.2], u = [0, 1, 0], w = [0.927, 0, -0.374], R = 1.35, H = 0.9
      const ring = (h: number) => Array.from({ length: 36 }, (_, i) => onAxis(base, STEERAX, u, w, h, R, (i / 36) * Math.PI * 2))
      const lo = ring(0), hi = ring(H)
      toolG.dtop.setAttribute('d', 'M' + hi.map(P).join('L') + 'Z')
      const pts = lo.concat(hi)
      pts.sort((a, b) => a[0] - b[0] || a[1] - b[1])
      const cr = (o0: number[], a: number[], b: number[]) => (a[0] - o0[0]) * (b[1] - o0[1]) - (a[1] - o0[1]) * (b[0] - o0[0])
      const lower: V2[] = [], upper: V2[] = []
      for (const q of pts) { while (lower.length >= 2 && cr(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q) }
      for (const q of pts.slice().reverse()) { while (upper.length >= 2 && cr(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q) }
      const hull = lower.slice(0, -1).concat(upper.slice(0, -1))
      toolG.dial.setAttribute('d', 'M' + hull.map(P).join('L') + 'Z')
      let kn = ''; const cTop = onAxis(base, STEERAX, u, w, H, 0, 0)
      for (let i = 0; i < 28; i++) {
        const t = phi + (i / 28) * Math.PI * 2, a = onAxis(base, STEERAX, u, w, 0.12, R, t), b = onAxis(base, STEERAX, u, w, H - 0.12, R, t)
        const toward = proj(v3(u, w, [0, 0, 0], Math.cos(t), Math.sin(t), 0)); if (toward[1] > 0.15) kn += 'M' + P(a) + 'L' + P(b)
      }
      kn += 'M' + P(cTop) + 'L' + P(onAxis(base, STEERAX, u, w, H, R * 0.7, phi))
      toolG.knurl.setAttribute('d', kn)
      return
    }
    // hex key in a bolt: the short leg in the socket, the long leg sweeps round the bolt's axis
    let base: number[], ax: number[], u: number[], w: number[]
    if (at === 'saddle') { ax = [0, 1, 0]; u = [1, 0, 0]; w = [0, 0, 1]; base = add2(COLLAR, proj([0, 2.8, 0.2])) }
    else { ax = STEERAX; u = [0, 1, 0]; w = [0.927, 0, -0.374]; base = [CAP[0] + AXS[0] * st03.bar, CAP[1] + AXS[1] * st03.bar] }
    const hex = (h: number, r: number, of: number) => Array.from({ length: 6 }, (_, i) => onAxis(base, ax, u, w, h, r, of + i * Math.PI / 3))
    toolG.head.setAttribute('d', 'M' + hex(0.05, 0.62, 0.3).map(P).join('L') + 'Z')
    toolG.sock.setAttribute('d', 'M' + hex(0.06, 0.3, phi + 0.52).map(P).join('L') + 'Z')
    const a0 = onAxis(base, ax, u, w, 0, 0, 0), a1 = onAxis(base, ax, u, w, 2.4, 0, 0), a2 = onAxis(base, ax, u, w, 2.4, 8.5, phi + (at === 'saddle' ? 2.2 : -0.9))
    ;(toolG.key as SVGElement[]).forEach((e) => e.setAttribute('d', 'M' + P(a0) + 'L' + P(a1) + 'L' + P(a2)))
  }
  const drawOver = () => {
    const tr = bike.parts.getAttribute('transform') || ''
    overG.setAttribute('transform', tr); labG.setAttribute('transform', tr)
    rulG.style.display = tool03.at === 'front' ? '' : 'none'
    drawTool()
    const txt: Record<string, string> = { frame: 'Frame ' + Fit.frame(fit.height), front: 'Fork sag 25%', cockpit: 'Bar +1 cm' }
    labItems.forEach((it) => {
      const t = txt[it.k]
      if (it.t.textContent !== t) { it.t.textContent = t; const w = t.length * 7.9 + 16; it.r.setAttribute('width', String(w)); it.r.setAttribute('x', String(-w / 2)); it.r.setAttribute('y', '-9.5') }
      const y = it.k === 'cockpit' ? it.at[1] + AXS[1] * st03.bar : it.at[1], x = it.k === 'cockpit' ? it.at[0] + AXS[0] * st03.bar : it.at[0]
      it.g.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`)
    })
  }
  const draw03 = () => {
    const r1 = bandPath(SEAL, 1.75, 2.5 * st03.sag - 0.35, 2.5 * st03.sag + 0.15)
    ;[...oring.children].forEach((e) => e.setAttribute('d', r1[(e.getAttribute('class') ?? '').slice(2)]))
    const h = st03.bar, r2 = bandPath(HEAD, 1.85, 0, Math.max(h, 0.02))
    ;[...spacer.children].forEach((e) => e.setAttribute('d', r2[(e.getAttribute('class') ?? '').slice(2)]))
    spacer.style.opacity = h > 0.02 ? '1' : '0'
    const t = `translate(${(AXS[0] * h).toFixed(2)} ${(AXS[1] * h).toFixed(2)})`
    cock.forEach((n) => n.el.setAttribute('transform', t))
    rulG.k.style.opacity = st03.sag > 0.98 ? '1' : '0'
    drawOver()
  }
  bike.listeners.push(drawOver)

  // the bike rolls onto the stand: the frame slides along its own length, each spoke set turns in the wheel's
  // plane, and the chocks close after it stops
  const drawRoll = () => {
    const base = bike.partsBase || '', r = roll03, [dx, dy] = proj([r.d, 0, 0])
    if (r.d) bike.parts.setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)}) ${base}`)
    else if (base) bike.parts.setAttribute('transform', base); else bike.parts.removeAttribute('transform')
    spokes.forEach((sp) => r.d ? sp.el.setAttribute('transform', wheelMatrix(sp.c, -r.d / WHEEL_R)) : sp.el.removeAttribute('transform'))
    standN.forEach((n) => {
      const t = (r.d ? `translate(${(-dx).toFixed(2)} ${(-dy).toFixed(2)}) ` : '') + (r.chock < 1 ? `translate(0 ${(n.base * (1 - r.chock)).toFixed(2)}) scale(1 ${Math.max(r.chock, 0.001).toFixed(3)})` : '')
      if (t) n.el.setAttribute('transform', t); else n.el.removeAttribute('transform')
      ;(n.el as SVGElement).style.opacity = r.chock < 0.04 ? '0' : ''
    })
    drawOver()
  }
  const rollIn03 = (tl: gsap.core.Timeline) => {
    bike.partsBase = bike.parts.getAttribute('transform') || ''
    roll03.d = 110; roll03.chock = 0; drawRoll()
    tl.to(roll03, { d: 0, duration: 1.35, ease: 'power3.out', onUpdate: drawRoll }, 0)
    tl.to(roll03, { chock: 1, duration: 0.32, ease: 'back.out(2)', onUpdate: drawRoll }, 1.2)
  }

  // the camera: the svg viewBox eases between the whole bike and the part each step sets
  const setVB = () => svg.setAttribute('viewBox', `${vbNow.x.toFixed(2)} ${vbNow.y.toFixed(2)} ${vbNow.w.toFixed(2)} ${vbNow.h.toFixed(2)}`)
  {
    const w = ink.X - ink.x + 44, h = Math.max(ink.Y - ink.y + 30, w * ASP03), W = h / ASP03
    VBF = { x: (ink.x + ink.X) / 2 - W / 2, y: (ink.y + ink.Y) / 2 - h / 2 - 6, w: W, h }
    Object.assign(vbNow, VBF); setVB()
  }
  const viewBox3 = (name: string) => {
    if (name === 'full') return { ...VBF }
    const v = VIEWS3[name], k = bike.scale, c = [ORIGIN[0] + k * (v.c[0] - ORIGIN[0]), ORIGIN[1] + k * (v.c[1] - ORIGIN[1])], w = v.w * k, h = w * ASP03
    return { x: c[0] - w / 2, y: c[1] - h / 2, w, h }
  }
  const camTo = (name: string, tl?: gsap.core.Timeline, at = 0, dur = 0.85) => {
    const to = viewBox3(name)
    if (!tl || still()) { Object.assign(vbNow, to); setVB(); return }
    tl.to(vbNow, { ...to, duration: dur, ease: 'power2.inOut', onUpdate: setVB }, at)
  }
  const turn = (tl: gsap.core.Timeline, to: number, at: number, dur: number) => tl.to(tool03, { phi: to, duration: dur, ease: 'power2.inOut', onUpdate: drawTool }, at)

  const restStep = () => {
    const n = step3
    tool03.at = n === 2 ? 'saddle' : n === 3 ? 'cockpit' : null; tool03.phi = 0
    bike.focus(n === 1 ? 'frame' : n === 2 ? 'saddle' : n === 3 ? 'cockpit' : null)
    if (set3.saddle) { dimShown(1); bike.setSaddle(Fit.saddleRaw(fit.leg), true) }
    if (set3.ride) { st03.sag = 1; st03.bar = 1 }
    draw03(); camTo(STEPVIEW[n])
    labG.style.opacity = n === 4 ? '1' : '0'
  }
  const endWalk = () => {
    if (!walk03) return
    walk03.kill(); walk03 = null
    if (roll03.d || roll03.chock < 1) { roll03.d = 0; roll03.chock = 1; drawRoll() }
    if (step3 === 2) set3.saddle = true; if (step3 === 3) set3.ride = true
    restStep()
  }
  const play3 = (tl: gsap.core.Timeline, at: number) => {
    tl.call(() => { set3.ride = true; st03.sag = 0; st03.bar = 0; tool03.at = 'front'; tool03.phi = 0; bike.focus('front'); draw03() }, undefined, at)
    camTo('front', tl, at)
    turn(tl, -Math.PI * 3, at + 0.85, 1.3)                                                                           // the dial turns…
    tl.fromTo(st03, { sag: 0 }, { sag: 1, duration: 1.2, ease: 'power2.inOut', onUpdate: draw03 }, at + 0.95)        // …and the O-ring settles at 25 mm
    camTo('cockpit', tl, at + 2.7)
    tl.call(() => { tool03.at = 'cockpit'; tool03.phi = 0; bike.focus('cockpit'); drawOver() }, undefined, at + 2.9)
    turn(tl, -1.4, at + 3.6, 0.45)                                                                                   // loosen the stem cap
    tl.fromTo(st03, { bar: 0 }, { bar: 1, duration: 0.8, ease: 'power2.inOut', onUpdate: draw03 }, at + 4.1)          // bar up 1 cm, spacer in
    turn(tl, 0, at + 5, 0.45)                                                                                        // tighten
  }
  const goStep = (n: number, first?: boolean) => {
    if (walk03) { walk03.kill(); walk03 = null }
    if (roll03.d || roll03.chock < 1) { roll03.d = 0; roll03.chock = 1; drawRoll() }
    step3 = n
    o.onStep(n)
    if (n === 4) { set3.saddle = true; set3.ride = true }
    if (still()) { restStep(); return }
    const tl = gsap.timeline({ onComplete: () => { walk03 = null } }); walk03 = tl
    labG.style.opacity = '0'
    if (n === 1) {
      tool03.at = null; drawOver(); bike.focus('frame')
      if (first) { rollIn03(tl); camTo('full', tl, 0, 0.01) } else camTo('full', tl, 0)
    }
    if (n === 2) {
      bike.focus('saddle'); tool03.at = 'saddle'; tool03.phi = 0; drawOver()
      camTo('saddle', tl, 0)
      if (!set3.saddle) { // the first time here: loosen the clamp, raise the post to the leg's saddle, tighten
        const q = { v: 0 }
        turn(tl, -1.4, 0.9, 0.45)
        tl.call(() => { set3.saddle = true; bike.setSaddle(Fit.saddleRaw(fit.leg)) }, undefined, 1.4)
        tl.fromTo(q, { v: 0 }, { v: 1, duration: 0.8, ease: 'power2.inOut', onUpdate: () => dimShown(q.v) }, 1.4)
        turn(tl, 0, 2.3, 0.45)
      }
    }
    if (n === 3) play3(tl, 0)
    if (n === 4) {
      tool03.at = null; drawOver(); bike.focus(null); camTo('full', tl, 0); dimShown(1); bike.setSaddle(Fit.saddleRaw(fit.leg))
      tl.call(() => { st03.sag = 1; st03.bar = 1; draw03() }, undefined, 0)
      tl.fromTo(labG, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.7)
    }
  }
  const replay = () => {
    if (walk03) { walk03.kill(); walk03 = null }
    const tl = gsap.timeline({ onComplete: () => { walk03 = null } }); walk03 = tl
    if (still()) { restStep(); return }
    play3(tl, 0)
  }
  const setFit = (patch: Partial<typeof fit>) => {
    Object.assign(fit, patch)
    bike.swap(Fit.scale[Fit.frame(fit.height)])
    bike.setSaddle(Fit.saddleRaw(fit.leg))
    drawOver()
  }
  // dragging the leg tape loosens the key while the finger is down
  const legFocus = (on: boolean) => {
    endWalk(); bike.focus('saddle'); tool03.at = 'saddle'
    if (!still()) gsap.to(tool03, { phi: on ? -1.4 : 0, duration: 0.3, ease: 'power2.out', onUpdate: drawTool })
  }
  const heightFocus = () => { endWalk(); bike.focus('frame') }
  o.stage.addEventListener('pointerdown', endWalk)

  // start: a first visit sees the bike as the shop has it, nothing set yet; a returning rider opens on Check
  const start = () => {
    bike.swapNow(Fit.scale[Fit.frame(fit.height)])
    bike.setSaddle(Fit.saddleRaw(fit.leg), true)
    if (!o.hasProfile) {
      set3 = { saddle: false, ride: false }
      bike.setSaddle(60, true); dimShown(0); st03.sag = 0; st03.bar = 0; draw03()
    } else draw03()
    goStep(o.hasProfile ? 4 : 1, !o.hasProfile)
  }
  start()

  return {
    goStep, replay, setFit, legFocus, heightFocus, endWalk,
    destroy: () => { walk03?.kill(); bike.stop(); o.stage.removeEventListener('pointerdown', endWalk); gsap.killTweensOf([vbNow, st03, tool03, roll03]) },
  }
}
