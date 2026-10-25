import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import '@photos/_shared/bike-figure.js'
import { useBack } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { BackButton, Mono, haptic, still } from '../../shell/direction'
import { set } from '../../shell/store'
import { routeFor } from '../../pages'
import './fit.css'

// 03 Fit profile · the fitter's line. An instrument: drag the scales and the bike answers.
// Source: the Creative Director's prototype "OutRent · direction" (screen s03), approved 24 Oct 22:18.

declare global { interface Window { LeadFigures: { bike: string } } }

// ---------- fit rules (03 working values) ----------
export const Fit = {
  saddleRaw: (leg: number) => leg * 0.883,
  frame: (h: number) => (h < 165 ? 'S' : h <= 177 ? 'M' : 'L'),
  scale: { S: 0.92, M: 1, L: 1.08 } as Record<string, number>,
  chart: { S: [155, 165], M: [165, 177], L: [177, 188] } as Record<string, [number, number]>,
}

// ---------- the Anatomy bike (Haoyue's figure), its saddle on a spring ----------
const D = { EX: [2.0907, 0.5558], EY: [-1.1116, 1.0453], EZ: [0, -2.0506], saddle: 71.523, move: 24 }
const proj = (v: number[]): [number, number] => [D.EX[0] * v[0] + D.EY[0] * v[1] + D.EZ[0] * v[2], D.EX[1] * v[0] + D.EY[1] * v[1] + D.EZ[1] * v[2]]
const ORIGIN: [number, number] = [450, 306]
const NS = 'http://www.w3.org/2000/svg'
const mk = (tag: string, attrs: Record<string, string | number>, parent?: Element) => {
  const e = document.createElementNS(NS, tag)
  for (const k in attrs) e.setAttribute(k, String(attrs[k]))
  parent?.appendChild(e)
  return e
}

type Node = { el: SVGGraphicsElement; part: string; with: string; move: number[] }
class Bike {
  svg: SVGSVGElement
  parts: SVGGElement
  nodes: Node[]
  s = { x: 0, v: 0, want: 0 }
  scale = 1
  raf = 0
  last = 0
  ghost?: SVGGElement
  listeners: (() => void)[] = []
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
  setSaddle(cm: number, instant?: boolean) {
    this.s.want = (cm - D.saddle) / D.move
    if (instant || still()) { this.s.x = this.s.want; this.s.v = 0; this.place() } else this.run()
  }
  run() { if (!this.raf) { this.last = 0; this.raf = requestAnimationFrame((t) => this.tick(t)) } }
  tick(now: number) {
    const dt = this.last ? Math.min((now - this.last) / 1000, 1 / 30) : 1 / 60
    this.last = now
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
  // A size change scales the bike on a spring, with a dashed ghost of the old size fading out.
  swap(k: number) {
    if (k === this.scale) return
    const from = this.scale
    this.scale = k
    if (still()) {
      this.parts.setAttribute('transform', `translate(${ORIGIN[0] * (1 - k)} ${ORIGIN[1] * (1 - k)}) scale(${k})`)
      this.listeners.forEach((f) => f())
      return
    }
    if (!this.ghost) { this.ghost = this.parts.cloneNode(true) as SVGGElement; this.ghost.setAttribute('class', 'b-ghost'); this.parts.before(this.ghost) }
    gsap.killTweensOf([this.parts, this.ghost])
    gsap.set(this.ghost, { scale: from, svgOrigin: ORIGIN.join(' '), opacity: 0.9 })
    gsap.to(this.parts, { scale: k, svgOrigin: ORIGIN.join(' '), duration: 0.34, ease: 'back.out(1.6)', onUpdate: () => this.listeners.forEach((f) => f()) })
    gsap.to(this.ghost, { opacity: 0, duration: 0.34, delay: 0.08, ease: 'none' })
  }
  stop() { cancelAnimationFrame(this.raf); this.raf = 0 }
}

// The saddle-height dimension line drawn beside the seat tube: two ticks, a forest pill with the value.
function dimension(bike: Bike) {
  const svg = bike.svg
  const sb = bike.nodes.filter((o) => o.part === 'saddle').map((o) => o.el.getBBox())
    .reduce((a, b) => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), X: Math.max(a.X, b.x + b.width) }), { x: 1e9, y: 1e9, X: -1e9 })
  const TOP0 = [(sb.x + sb.X) / 2, sb.y]
  const U = proj([7.02 / 24, 0, 22.95 / 24])
  const BB = [TOP0[0] - U[0] * D.saddle, TOP0[1] - U[1] * D.saddle]
  const len = Math.hypot(U[0], U[1]); const dir = [U[0] / len, U[1] / len]
  let n = [-dir[1], dir[0]]; if (n[0] < 0) n = [-n[0], -n[1]]
  const off = 26
  const g = mk('g', { class: 'dim' }, svg) as SVGGElement
  const ext1 = mk('line', { class: 'ext' }, g), ext2 = mk('line', { class: 'ext' }, g), main = mk('line', {}, g)
  const t1 = mk('line', {}, g), t2 = mk('line', {}, g)
  const pill = mk('rect', { rx: 8, width: 48, height: 17 }, g), lab = mk('text', { 'text-anchor': 'middle' }, g)
  const sc = ([x, y]: number[]) => [ORIGIN[0] + bike.scale * (x - ORIGIN[0]), ORIGIN[1] + bike.scale * (y - ORIGIN[1])]
  let shown = 1
  const set = (el: Element, p: number[], q: number[]) => { el.setAttribute('x1', String(p[0])); el.setAttribute('y1', String(p[1])); el.setAttribute('x2', String(q[0])); el.setAttribute('y2', String(q[1])) }
  const draw = () => {
    const cm = bike.saddleCm()
    const a = sc(BB), t = sc([BB[0] + U[0] * cm, BB[1] + U[1] * cm])
    const A = [a[0] + n[0] * off, a[1] + n[1] * off], T = [t[0] + n[0] * off, t[1] + n[1] * off]
    const Tp = [A[0] + (T[0] - A[0]) * shown, A[1] + (T[1] - A[1]) * shown]
    set(ext1, a, [A[0] + n[0] * 5, A[1] + n[1] * 5]); set(ext2, t, [T[0] + n[0] * 5, T[1] + n[1] * 5])
    set(main, A, Tp)
    const tk = (p: number[]) => [[p[0] - n[0] * 5, p[1] - n[1] * 5], [p[0] + n[0] * 5, p[1] + n[1] * 5]]
    set(t1, ...(tk(A) as [number[], number[]])); set(t2, ...(tk(Tp) as [number[], number[]]))
    ;(ext2 as SVGElement).style.opacity = (t2 as SVGElement).style.opacity = shown > 0.98 ? '1' : '0'
    const mx = (A[0] + T[0]) / 2 + n[0] * 30, my = (A[1] + T[1]) / 2 + n[1] * 30
    pill.setAttribute('x', String(mx - 24)); pill.setAttribute('y', String(my - 9)); lab.setAttribute('x', String(mx)); lab.setAttribute('y', String(my + 3.6))
    lab.textContent = Math.round(cm) + ' cm'
    g.style.opacity = shown > 0 ? '1' : '0'
  }
  bike.listeners.push(draw)
  const bb = svg.getBBox()
  svg.setAttribute('viewBox', `${bb.x - 4} ${bb.y - 22} ${bb.width + 8} ${bb.height + 26}`)
  return { draw, setShown: (v: number) => { shown = v; draw() } }
}

// ---------- the measuring tape: drag the scale under a fixed needle ----------
const PX = 11, PAD = 240
function Tape({ id, label, min, max, value, bands, onChange, onFocus }: {
  id: string; label: string; min: number; max: number; value: number; bands?: Record<string, [number, number]>
  onChange: (v: number) => void; onFocus: (on: boolean) => void
}) {
  const el = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const st = useRef({ v: value, raw: value, drag: null as null | { x: number; from: number } })
  const total = (max - min) * PX

  const place = () => {
    const w = el.current?.clientWidth ?? 393
    const raw = st.current.raw
    if (svg.current) svg.current.style.transform = `translateX(${w / 2 - PAD - (raw - min) * PX}px)`
    if (bands && svg.current) {
      const z = Fit.frame(Math.round(raw))
      svg.current.querySelectorAll<SVGElement>('[data-b]').forEach((b) => b.classList.toggle('on', b.dataset.b === z))
    }
  }
  const setV = (nv: number) => {
    nv = Math.max(min, Math.min(max, nv))
    st.current.raw = nv
    const r = Math.round(nv)
    if (r !== st.current.v) { st.current.v = r; haptic(); onChange(r) }
    place()
  }
  useEffect(() => { place(); const r = () => place(); addEventListener('resize', r); return () => removeEventListener('resize', r) })

  const ticks = []
  if (bands) for (const [k, [a, b]] of Object.entries(bands)) {
    ticks.push(<rect key={`b${k}`} className="band" data-b={k} x={PAD + (a - min) * PX + 1} y={0} width={(b - a) * PX - 2} height={3} rx={1.5} />)
    ticks.push(<text key={`t${k}`} className="bandt" data-b={k} x={PAD + ((a + b) / 2 - min) * PX} y={14} textAnchor="middle">{k}</text>)
  }
  for (let c = min; c <= max; c++) {
    const x = PAD + (c - min) * PX, maj = c % 5 === 0
    ticks.push(<line key={c} className={`tk${maj ? ' maj' : ''}`} x1={x} x2={x} y1={maj ? 18 : 22} y2={32} />)
    if (maj) ticks.push(<text key={`n${c}`} x={x} y={44} textAnchor="middle">{c}</text>)
  }
  const end = () => {
    if (!st.current.drag) return
    st.current.drag = null
    onFocus(false)
    const to = Math.round(st.current.raw)
    if (still()) { st.current.raw = to; place(); return }
    const o = { r: st.current.raw }
    gsap.to(o, { r: to, duration: 0.25, ease: 'power2.out', onUpdate: () => { st.current.raw = o.r; place() } })
  }
  return (
    <div
      ref={el} id={id} className="tape" role="slider" tabIndex={0} aria-label={label}
      aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={`${value} cm`}
      onPointerDown={(e) => { st.current.drag = { x: e.clientX, from: st.current.raw }; e.currentTarget.setPointerCapture(e.pointerId); onFocus(true) }}
      onPointerMove={(e) => { const d = st.current.drag; if (d) setV(d.from - (e.clientX - d.x) / PX) }}
      onPointerUp={end} onPointerCancel={end}
      onKeyDown={(e) => {
        const d = ({ ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 } as Record<string, number>)[e.key]
        if (!d) return
        e.preventDefault(); setV(st.current.v + d); st.current.raw = st.current.v; place()
      }}
    >
      <svg ref={svg} width={total + PAD * 2} viewBox={`0 0 ${total + PAD * 2} 46`} aria-hidden="true">{ticks}</svg>
      <span className="needle" aria-hidden="true" />
    </div>
  )
}

// ---------- the page ----------
type Save = 'idle' | 'saved'

export default function FitProfile() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromPost = (location.state as { from?: string } | null)?.from === 'post'
  const back = useBack(() => navigate(routeFor('02-coach-kit')))
  const fig = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDListElement>(null)
  const bike = useRef<Bike | null>(null)
  const dim = useRef<ReturnType<typeof dimension> | null>(null)
  const [fit, setFitState] = useState({ height: 176, leg: 81 })
  const [save, setSave] = useState<Save>('idle')
  const frame = Fit.frame(fit.height)
  const saddle = Math.round(Fit.saddleRaw(fit.leg))

  // Build the figure once, then the intro: the figure settles, the grid steps in, the dimension line draws.
  useEffect(() => {
    if (!fig.current) return
    let cancelled = false
    let tl: gsap.core.Timeline | null = null
    document.fonts.ready.then(() => {
      if (cancelled || !fig.current) return
      const b = new Bike(fig.current)
      bike.current = b
      dim.current = dimension(b)
      b.setSaddle(Fit.saddleRaw(81), true)
      if (still()) { dim.current.setShown(1); return }
      b.setSaddle(60, true); dim.current.setShown(0)
      const o = { v: 0 }
      tl = gsap.timeline()
      tl.fromTo(fig.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0)
      if (grid.current) tl.fromTo(grid.current.children, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, 0.25)
      tl.to(o, {
        v: 1, duration: 0.7, ease: 'power2.inOut', onUpdate: () => dim.current?.setShown(o.v),
        onComplete: () => { b.focus('saddle'); b.setSaddle(Fit.saddleRaw(81)); setTimeout(() => b.focus(null), 900) },
      }, 0.45)
    })
    return () => { cancelled = true; tl?.kill(); bike.current?.stop() }
  }, [])

  // Keep the bike, the grid and the save button in step with the two measurements.
  const prevFrame = useRef(frame)
  const update = (patch: Partial<typeof fit>) => {
    const next = { ...fit, ...patch }
    setFitState(next)
    const sz = Fit.frame(next.height)
    bike.current?.swap(Fit.scale[sz])
    bike.current?.setSaddle(Fit.saddleRaw(next.leg))
    if (sz !== prevFrame.current) { prevFrame.current = sz; flash(document.getElementById('g-frame')) }
    if (save !== 'idle') setSave('idle')
  }
  // Saving marks the grid, then moves on: from the coach's post to the search (the fit was the missing step),
  // from anywhere else back to where Daniel came from.
  const onSave = () => {
    if (save === 'saved') return
    setSave('saved')
    set((st) => ({ ...st, fit: { ...st.fit, hasProfile: true } }))
    grid.current?.querySelectorAll('dd').forEach((d) => flash(d))
    setTimeout(() => {
      if (fromPost) navigate(routeFor('04-search-results'), { replace: true })
      else if ((window.history.state?.idx ?? 0) > 0) navigate(-1)
    }, 900)
  }

  return (
    <>
      <main className="screen d-screen fit-screen">
        <div className="bar-top">
          <BackButton label="Back" onClick={back} />
          <Mono className="mid">Fit profile</Mono>
          <span />
        </div>
        <div className="pad">
          <div className="fit-head">
            <h1 className="t-h1">Your fit</h1>
            <p className="lede">Shops set every rented bike to these numbers before delivery.</p>
          </div>
          <div className="stage"><div className="fig" ref={fig} /></div>
          <dl className="mgrid" ref={grid}>
            <div><dt className="mono">Saddle</dt><dd><span className="num">{saddle}</span><small>cm</small></dd></div>
            <div><dt className="mono">Frame</dt><dd id="g-frame">{frame}</dd></div>
            <div><dt className="mono">Fork sag</dt><dd>25<small>%</small></dd></div>
            <div><dt className="mono">Bars</dt><dd>+1<small>cm</small></dd></div>
          </dl>
          <div className="tapes">
            <div className="tape-row">
              <div className="lab"><Mono id="lab-h">Height</Mono><span className="val"><span className="num">{fit.height}</span><small>cm</small></span></div>
              <Tape id="tape-height" label="Height" min={150} max={200} value={fit.height} bands={Fit.chart}
                onChange={(v) => update({ height: v })} onFocus={(on) => bike.current?.focus(on ? 'frame' : null)} />
            </div>
            <div className="tape-row">
              <div className="lab"><Mono id="lab-l">Inside leg · in socks, floor to crotch</Mono><span className="val"><span className="num">{fit.leg}</span><small>cm</small></span></div>
              <Tape id="tape-leg" label="Inside leg" min={60} max={95} value={fit.leg}
                onChange={(v) => update({ leg: v })} onFocus={(on) => bike.current?.focus(on ? 'saddle' : null)} />
            </div>
          </div>
          <dl className="riding">
            <dt className="mono">Riding</dt>
            <dd className="v">Weekly on park connectors<br /><span>First time on trails, so a softer fork and bars up 1&nbsp;cm</span></dd>
          </dl>
        </div>
      </main>
      <div className="dock">
        <button type="button" className="cta fit-save" onClick={onSave} aria-live="polite">
          {save === 'idle' ? 'Save fit' : <span className="saved-mark"><Icon name="check" />Fit saved</span>}
        </button>
      </div>
    </>
  )
}

function flash(el: Element | null) {
  if (!el) return
  el.classList.remove('flash'); void (el as HTMLElement).offsetWidth; el.classList.add('flash')
}
