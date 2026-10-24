import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { GoTo, useBack } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import { BackButton, MeasuredGrid, Measure, Mono, still, useToast } from '../../shell/direction'
import { routeFor } from '../../pages'
import u1 from '@photos/05-listing-detail/assets/05-direction-u1-stand.webp'
import u2 from '@photos/05-listing-detail/assets/05-direction-u2-cockpit.webp'
import u3 from '@photos/05-listing-detail/assets/05-direction-u3-drive.webp'
import u4 from '@photos/05-listing-detail/assets/05-direction-u4-crank.webp'
import u5 from '@photos/05-listing-detail/assets/05-direction-u5-saddle.webp'
import mCrank from '@photos/05-listing-detail/assets/05-direction-m-crank.webp'
import mSaddle from '@photos/05-listing-detail/assets/05-direction-m-saddle.webp'
import shop from '@photos/05-listing-detail/assets/05-direction-shop.webp'
import './listing.css'

// 05 Listing · the fitter's line. A proof: this exact bike, its marks circled, its price measured.
// Source: the Creative Director's prototype "OutRent · direction" (screen s05), approved 24 Oct 22:18.

type Mark = { x: number; y: number; label: string; lx: string; ly: string }
type Shot = { src: string; alt: string; date: string; mark?: Mark }
const SHOTS: Shot[] = [
  { src: u1, alt: 'This Trek Marlin 7 on the Timah Cycles stand', date: '12 Oct 2026' },
  { src: u2, alt: 'Cockpit and fork of this bike', date: '12 Oct 2026' },
  { src: u3, alt: 'Drivetrain of this bike', date: '18 Oct · 16:20' },
  { src: u4, alt: 'Left crank arm with a small scratch', date: '18 Oct · 16:20', mark: { x: 45, y: 49, label: 'Scratch', lx: 'calc(45% + 38px)', ly: 'calc(49% - 10px)' } },
  { src: u5, alt: 'Saddle with a scuff on its edge', date: '18 Oct · 16:20', mark: { x: 46, y: 49, label: 'Scuff', lx: 'calc(46% - 30px)', ly: 'calc(49% + 40px)' } },
]
const DAYS: { d: string; n: string; s?: 'you' | 'bk' }[] = [
  { d: 'F', n: '24' }, { d: 'S', n: '25', s: 'you' }, { d: 'S', n: '26', s: 'bk' }, { d: 'M', n: '27' }, { d: 'T', n: '28' },
  { d: 'W', n: '29' }, { d: 'T', n: '30', s: 'bk' }, { d: 'F', n: '31', s: 'bk' }, { d: 'S', n: '1' }, { d: 'S', n: '2' },
]
const SPECS = [
  ['Frame', 'M, aluminium'], ['Wheels', '29 in'], ['Front fork', '100 mm travel'], ['Gears', '1 × 10'],
  ['Brakes', 'Hydraulic disc'], ['Weight', '13.9 kg'],
]
const DIST = [[5, 91, 21], [4, 9, 2], [3, 0, 0], [2, 0, 0], [1, 0, 0]]

type Rect = { top: number; left: number; width: number; height: number }

export default function Listing() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state as { from?: string; rect?: Rect | null } | null
  const back = useBack(() => navigate(routeFor('03-fit-profile')))
  const [toastNode, toast] = useToast()
  const [cur, setCur] = useState(0)
  const [seen, setSeen] = useState<number[]>([])
  const [skipping, setSkipping] = useState(false)
  const rail = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  const screen = useRef<HTMLElement>(null)
  const price = useRef<HTMLElement>(null)
  const lenses = useRef<(HTMLDivElement | null)[]>([])

  // 03 -> 05: the drawn bike becomes the photographed one. The strip opens from the figure's rectangle.
  useLayoutEffect(() => {
    if (from?.from !== 'fit' || still() || !strip.current || !screen.current) return
    const r = from.rect, s = strip.current.getBoundingClientRect(), w = screen.current.clientWidth
    const tl = gsap.timeline()
    if (r) tl.fromTo(strip.current,
      { clipPath: `inset(${r.top}px ${w - r.left - r.width}px ${s.height - r.top - r.height}px ${r.left}px round 18px)` },
      { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 0.62, ease: 'expo.inOut' }, 0)
    tl.fromTo(screen.current.querySelectorAll('.caption, .l-head, #setfor'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' }, 0.32)
    tl.fromTo('.l-dock-wrap', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.4)
    return () => { tl.kill() }
  }, [from])

  // The marks loupes zoom in when they come into view; the price bar measures itself.
  useEffect(() => {
    const root = screen.current
    if (!root) return
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return
      const t = e.target as HTMLElement
      if (t.classList.contains('lens')) t.classList.add('is-in')
      if (t === price.current && !still()) gsap.fromTo(t.querySelectorAll('.pb span'), { scaleX: 0 }, { scaleX: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' })
      io.unobserve(t)
    }), { root, threshold: 0.5 })
    lenses.current.forEach((l) => l && io.observe(l))
    if (price.current) io.observe(price.current)
    return () => io.disconnect()
  }, [])

  const onRail = () => {
    const el = rail.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i === cur) return
    setCur(i)
    setSeen((s) => (s.includes(i) ? s : [...s, i]))
  }

  return (
    <>
      <main className="screen d-screen l-screen" ref={screen}>
        <div className="strip" ref={strip}>
          <span className="strip-back"><BackButton label="Back to fit profile" onClick={back} onPhoto /></span>
          <div className="rail" ref={rail} onScroll={onRail} tabIndex={0} role="region" aria-label="Photos of this bike, swipe for more">
            {SHOTS.map((s, i) => (
              <figure key={s.src} className={seen.includes(i) ? 'seen' : undefined}>
                <Photo src={s.src} alt={s.alt} width={393} height={330} first={i === 0} />
                {s.mark && <>
                  <span className="ring" style={{ left: `${s.mark.x}%`, top: `${s.mark.y}%` }} aria-hidden="true" />
                  <span className="rlab" style={{ left: s.mark.lx, top: s.mark.ly }} aria-hidden="true">{s.mark.label}</span>
                </>}
              </figure>
            ))}
          </div>
        </div>
        <div className="caption">
          <Mono>Photo {cur + 1} of 5 · {SHOTS[cur].date}</Mono>
          <span className="ticks5" aria-hidden="true">{SHOTS.map((s, i) => <i key={s.src} className={i === cur ? 'on' : undefined} />)}</span>
        </div>

        <div className="pad">
          <div className="l-head">
            <h1 className="t-h1">Trek Marlin 7</h1>
            <div className="l-meta"><span>Size M hardtail</span><span>Timah Cycles</span><span><b>4.9</b> · 23 reviews</span></div>
            <p className="small l-flat">Every photo shows this exact bike.</p>
          </div>

          <section className="sec" id="setfor">
            <div className="sec-h"><h2 className="t-h2">Set to your fit before delivery</h2></div>
            <MeasuredGrid items={[
              { k: 'Saddle', v: '72', unit: 'cm' }, { k: 'Frame', v: 'M' }, { k: 'Fork sag', v: '25', unit: '%' }, { k: 'Bars', v: '+1', unit: 'cm' },
            ]} />
            <div className="sec-h is-center">
              <span className="small">From your height 176&nbsp;cm and inside leg 81&nbsp;cm</span>
              <GoTo page="03-fit-profile" className="link">Edit fit</GoTo>
            </div>
          </section>

          <section className="sec">
            <h2 className="t-h2">Marks already on this bike</h2>
            <div className="loupes">
              {[{ src: mCrank, pos: '45% 49%', t: 'Scratch, left crank arm' }, { src: mSaddle, pos: '46% 49%', t: 'Scuff, saddle edge' }].map((m, i) => (
                <div key={m.t} className="loupe">
                  <div className="lens" ref={(el) => { lenses.current[i] = el }}>
                    <Photo src={m.src} alt={`Close-up: ${m.t}`} width={170} height={170} className="lens-img" />
                    <span className="c" aria-hidden="true" />
                  </div>
                  <span className="t1">{m.t}</span>
                  <Mono>18 Oct · 16:20</Mono>
                </div>
              ))}
            </div>
            <p className="small l-flat">Recorded by the shop before your rental, so neither is charged to you.</p>
          </section>

          <section className="sec" id="price" ref={price}>
            <h2 className="t-h2">All-in for Sat 25 Oct</h2>
            <div className="price-bar">
              <div className="pb" aria-hidden="true"><span style={{ flex: 38 }} /><span className="b" style={{ flex: 12 }} /></div>
              <div className="pb-legend">
                <div><span className="v">S$38</span><span className="k">This bike, 1 day</span></div>
                <div><span className="v">S$12</span><span className="k">Delivery and collection</span></div>
              </div>
              <Measure>S$50</Measure>
              <div className="fitfree"><span>Setting it to your fit</span><b>S$0, included</b></div>
              <div className="deposit"><Icon name="lock-simple" /><span><b>S$150 deposit, held, not charged.</b> Released after the return check.</span></div>
            </div>
          </section>

          <section className="sec">
            <div className="sec-h"><h2 className="t-h2">Free on your ride day</h2><Mono>24 Oct – 2 Nov</Mono></div>
            <div className="days">
              {DAYS.map((d) => (
                <div key={d.n} className={d.s}>
                  <small>{d.d}</small>
                  <b className={d.s === 'bk' ? 'hatch' : undefined} aria-label={d.s === 'you' ? `${d.n}, your ride` : d.s === 'bk' ? `${d.n}, booked` : undefined}>{d.n}</b>
                </div>
              ))}
            </div>
            <div className="legend"><span><i className="is-you" />Your ride</span><span><i className="hatch is-booked" />Booked</span></div>
          </section>

          <section className="sec">
            <h2 className="t-h2">Who rents it out</h2>
            <div className="supplier">
              <Photo src={shop} alt="Timah Cycles shopfront" width={56} height={56} />
              <div className="l-min">
                <div className="n">Timah Cycles</div>
                <div className="small">Bike shop · Bukit Timah</div>
                <div className="small"><b className="l-ink">4.8</b> · 126 reviews</div>
              </div>
              <button type="button" className="link" onClick={() => toast('Messages with Timah Cycles are not in this slice.')}>Message</button>
            </div>
          </section>

          <section className="sec">
            <h2 className="t-h2">Specifications</h2>
            <div className="specs">
              {SPECS.map(([k, v]) => <div key={k}><Mono>{k}</Mono><span className="v">{v}</span></div>)}
              <div className="wide"><Mono>Assembled size</Mono><span className="v">180 × 110 × 78&nbsp;cm</span></div>
            </div>
          </section>

          <section className="sec">
            <div className="sec-h"><h2 className="t-h2">Reviews of this bike</h2><button type="button" className="link" onClick={() => toast('The full review list is not in this slice.')}>All 23</button></div>
            <div className="rev">
              <span className="big num">4.9</span>
              <div className="dist">
                {DIST.map(([s, w, n]) => <div key={s}><span>{s}</span><i><b style={{ width: `${w}%` }} /></i><span>{n}</span></div>)}
              </div>
            </div>
            <blockquote className="quote">
              <p>“Saddle was already at my height when it arrived. Rode straight off.”</p>
              <Mono>Wei Lin · Sep 2026 · 5 stars</Mono>
            </blockquote>
          </section>
        </div>
      </main>

      <div className="dock l-dock-wrap">
        <div className="l-dock">
          <div className="p"><b>S$50 <span>all-in</span></b><small>+ S$150 deposit, held</small></div>
          <button type="button" className="cta" onClick={() => setSkipping(true)}>Choose delivery</button>
        </div>
      </div>
      {skipping && <TimeSkip onDone={() => navigate(routeFor('12-rental-summary'), { state: { from: 'skip' } })} />}
      {toastNode}
    </>
  )
}

// 05 -> 12: the clock runs from Fri 19:02 to Sat 14:05 with the day's marks on a line, then the summary.
// Pages 06 to 11 sit inside this jump in the prototype slice.
const T0 = 19 + 2 / 60, T1 = 24 + 14 + 5 / 60
const xAt = (t: number) => ((t - T0) / (T1 - T0)) * 100
const fmt = (t: number) => [t >= 24 ? 'SAT 25 OCT' : 'FRI 24 OCT', `${Math.floor(t % 24)}:${String(Math.floor((t * 60) % 60)).padStart(2, '0')}`]
function TimeSkip({ onDone }: { onDone: () => void }) {
  const done = useRef(onDone)
  const root = useRef<HTMLDivElement>(null)
  const day = useRef<HTMLSpanElement>(null)
  const clock = useRef<HTMLSpanElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    if (still()) { done.current(); return }
    const o = { t: T0 }
    const tl = gsap.timeline({ onComplete: () => done.current() })
      .fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      .to(o, {
        t: T1, duration: 2.1, ease: 'power2.inOut', onUpdate: () => {
          const [d, c] = fmt(o.t)
          if (day.current) day.current.textContent = d
          if (clock.current) clock.current.textContent = c
          if (fill.current) fill.current.style.width = xAt(o.t) + '%'
        },
      })
    return () => { tl.kill() }
  }, [])
  return (
    <div className="skip" ref={root} aria-live="polite">
      <span className="day-l" ref={day}>FRI 24 OCT</span>
      <span className="clock num" ref={clock}>19:02</span>
      <div className="run" aria-hidden="true">
        <span className="base" /><span className="fill" ref={fill} />
        {[[24, '0:00'], [24 + 7 + 40 / 60, '7:40'], [24 + 13.5, '13:30']].map(([t, l]) => (
          <span key={l}><i style={{ left: `${xAt(t as number)}%` }} /><em style={{ left: `${xAt(t as number)}%` }}>{l}</em></span>
        ))}
      </div>
      <p className="small">Delivery, hand-over and the ride happen here. Pages 06 to 11 are not in this slice.</p>
    </div>
  )
}
