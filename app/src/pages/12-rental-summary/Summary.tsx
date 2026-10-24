import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useBack } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import { BackButton, MeasuredGrid, Mono, still, useToast } from '../../shell/direction'
import { routeFor } from '../../pages'
import rCrank from '@photos/12-rental-summary/assets/12-direction-r-crank.webp'
import rSaddle from '@photos/12-rental-summary/assets/12-direction-r-saddle.webp'
import rDrive from '@photos/12-rental-summary/assets/12-direction-r-drive.webp'
import './summary.css'

// 12 Rental summary · the fitter's line. A record: Saturday drawn to scale, ending in S$150 back.
// Source: the Creative Director's prototype "OutRent · direction" (screen s12), approved 24 Oct 22:18.

// Saturday 7:00-14:30 on a vertical scale, 50 px an hour.
const Y0 = 7, PXH = 50, TOPPAD = 10
const yAt = (t: number) => TOPPAD + (t - Y0) * PXH
const EVENTS = [
  { t: 7 + 40 / 60, tm: '7:40', b: 'Delivered, set to your fit', s: 'Chestnut trailhead carpark · saddle 72 cm' },
  { t: 10.25, tm: '8:00–12:30', b: 'Coach Aisyah’s Saturday ride', s: 'Chestnut Nature Park' },
  { t: 13.5, tm: '13:30', b: 'Collected', s: 'As at hand-over, trail dirt only' },
  { t: 14 + 5 / 60, tm: '14:05', b: 'Deposit released', s: 'S$150 back · S$50 paid in total' },
]
const DOTS: [number, boolean][] = [[7 + 40 / 60, false], [8, false], [12.5, false], [13.5, false], [14 + 5 / 60, true]]
const HOURS: number[] = []
for (let h = 7; h <= 14.5; h += 0.5) HOURS.push(h)
const BACKS = [
  { src: rCrank, part: 'Crank arm' }, { src: rSaddle, part: 'Saddle edge' }, { src: rDrive, part: 'Drivetrain' },
]

export default function Summary() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromSkip = (location.state as { from?: string } | null)?.from === 'skip'
  const back = useBack(() => navigate(routeFor('05-listing-detail')))
  const [toastNode, toast] = useToast()
  const [end, setEnd] = useState(false)
  const day = useRef<HTMLDivElement>(null)
  const cover = useRef<HTMLDivElement>(null)
  const [tops, setTops] = useState<number[]>([])
  const [links, setLinks] = useState<string[]>([])
  const [height, setHeight] = useState(440)

  // Labels sit at their time; where two would overlap, the later one moves down with a dashed leader.
  useLayoutEffect(() => {
    const labels = [...(day.current?.querySelectorAll<HTMLElement>('.evl') ?? [])]
    let bottom = -1e9
    const t: number[] = [], l: string[] = []
    labels.forEach((e, i) => {
      const want = yAt(EVENTS[i].t) - 10
      const top = Math.max(want, bottom + 10)
      t.push(top + 10)
      bottom = top + e.offsetHeight
      if (top > want + 2) l.push(`M62 ${want + 10} C78 ${want + 10}, 74 ${top + 18}, 92 ${top + 18}`)
    })
    setTops(t); setLinks(l)
    // The drawing grows to hold its last label (the prototype let it run into the next section).
    setHeight(Math.max(440, Math.ceil(bottom + 14)))
  }, [])

  // The intro: the trail draws down the day, each event lights as the head passes it, the ride band grows.
  useLayoutEffect(() => {
    if (!tops.length || !day.current) return
    const root = day.current
    const trail = root.querySelector<SVGPathElement>('#trail')!
    const head = root.querySelector<SVGCircleElement>('#head')!
    const halo = root.querySelector<SVGCircleElement>('#halo')!
    const band = root.querySelector<SVGRectElement>('#rideband')!
    const labels = [...root.querySelectorAll<HTMLElement>('.evl')]
    const coverOut = () => cover.current && gsap.to(cover.current, { opacity: 0, duration: 0.4, delay: 0.25, onComplete: () => { if (cover.current) cover.current.style.visibility = 'hidden' } })
    if (still()) {
      trail.style.strokeDasharray = 'none'; head.style.opacity = halo.style.opacity = '0'
      if (cover.current) cover.current.style.visibility = 'hidden'
      return
    }
    coverOut()
    const L = trail.getTotalLength(), y0 = yAt(7.667), y1 = yAt(14.083)
    trail.style.strokeDasharray = String(L); trail.style.strokeDashoffset = String(L)
    gsap.set(labels, { opacity: 0.15 }); gsap.set(band, { scaleY: 0, transformOrigin: '50% 0%' })
    gsap.set([head, halo], { opacity: 1 })
    const lit = new Set<number>()
    const o = { p: 0 }
    const tl = gsap.timeline({ delay: fromSkip ? 0.6 : 0.35 })
    tl.to(o, {
      p: 1, duration: 2.6, ease: 'power1.inOut', onUpdate: () => {
        trail.style.strokeDashoffset = String(L * (1 - o.p))
        const y = y0 + (y1 - y0) * o.p
        head.setAttribute('cy', String(y)); halo.setAttribute('cy', String(y))
        labels.forEach((lab, i) => { if (!lit.has(i) && tops[i] <= y + 14) { lit.add(i); gsap.to(lab, { opacity: 1, duration: 0.35 }) } })
      },
    })
    tl.to(band, { scaleY: 1, duration: 1.6, ease: 'power1.inOut' }, 0.2)
    tl.to(halo, { attr: { r: 26 }, opacity: 0, duration: 0.8, ease: 'power2.out' })
    tl.to(head, { opacity: 0, duration: 0.3 }, '<')
    tl.to(labels, { opacity: 1, duration: 0.35 }, '<')
    tl.fromTo('#amt', { color: 'var(--forest-2)' }, { color: 'var(--forest)', duration: 0.6 }, '<')
    return () => { tl.kill() }
  }, [tops, fromSkip])

  return (
    <>
      <main className="screen d-screen s-screen">
        <div className="bar-top">
          <BackButton label="Back" onClick={back} />
          <Mono className="mid">OR-10482 · closed</Mono>
          <span />
        </div>
        <div className="pad">
          <div className="hero12">
            <Mono>Trek Marlin 7 · Sat 25 Oct</Mono>
            <span className="hero-num amt" id="amt">S$150</span>
            <h1 className="what">deposit released</h1>
            <span className="small">Nothing kept · 25 Oct · 14:05</span>
          </div>

          <section className="sec">
            <div className="sec-h"><h2 className="t-h2">Your Saturday</h2><Mono>Drawn to scale</Mono></div>
            <div className="day" ref={day} style={{ height }}>
              <svg aria-hidden="true">
                <g className="hr">
                  {HOURS.map((h) => {
                    const full = h % 1 === 0
                    return (
                      <g key={h}>
                        <line className={full ? 'h' : undefined} x1={full ? 34 : 40} x2={48} y1={yAt(h)} y2={yAt(h)} />
                        {full && <text x={0} y={yAt(h) + 3.5}>{h}:00</text>}
                      </g>
                    )
                  })}
                </g>
                <line className="axis" x1={56} x2={56} y1={yAt(7)} y2={yAt(14.5)} />
                <rect className="ride" id="rideband" x={52} y={yAt(8)} width={8} height={yAt(12.5) - yAt(8)} rx={4} />
                <path className="trail" id="trail" d={`M56 ${yAt(7 + 40 / 60)} L56 ${yAt(14 + 5 / 60)}`} />
                {DOTS.map(([t, endDot]) => <g key={t} className={`ev${endDot ? ' end' : ''}`}><circle cx={56} cy={yAt(t)} r={endDot ? 6 : 4.5} /></g>)}
                <circle className="halo" id="halo" cx={56} cy={yAt(7.667)} r={12} />
                <circle className="head" id="head" cx={56} cy={yAt(7.667)} r={4} />
                {links.map((d) => <path key={d} className="leader" d={d} />)}
              </svg>
              {EVENTS.map((e, i) => (
                <div key={e.tm} className="evl" style={tops.length ? { top: tops[i] } : undefined}>
                  <span className="tm">{e.tm}</span><b>{e.b}</b><span>{e.s}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="sec s-backs">
            <h2 className="t-h2">Checked against the 7:40 photos</h2>
            <div className="backs">
              {BACKS.map((b) => (
                <figure key={b.part}>
                  <Photo src={b.src} alt={`${b.part} at return, 13:30`} width={113} height={81} />
                  <b>{b.part}</b>
                  <span><Icon name="check" small />No change</span>
                </figure>
              ))}
            </div>
            <MeasuredGrid className="s-grid" items={[
              { k: 'Paid', v: 'S$50' }, { k: 'Deposit', v: 'Released', tone: 'forest' }, { k: 'Kept', v: 'S$0' },
            ]} />
          </section>
        </div>

        <section className="again">
          <h2 className="t-h2 again-h">Ride again every Saturday</h2>
          <div className="weeks">
            <div><b>1 Nov</b><small>First</small></div><div><b>8 Nov</b></div><div><b>15 Nov</b></div><div><b>22 Nov</b></div>
          </div>
          <dl className="terms">
            <dt>Bike</dt><dd>This Trek Marlin 7, set to your fit</dd>
            <dt>Times</dt><dd>7:40 delivery · 13:30 collection</dd>
            <dt>Place</dt><dd>Chestnut trailhead carpark</dd>
          </dl>
          <div className="price"><b>S$45</b><span>per ride, S$5 less than today</span></div>
          <p className="small s-charged">Charged each Thu · 20:00. Skip any week before then.</p>
          <button type="button" className="cta" onClick={() => setEnd(true)}>Set up every Saturday</button>
          <button type="button" className="link s-other" onClick={() => toast('Search is not in this slice.')}>Book a different bike</button>
        </section>
      </main>

      {/* Arriving from the 05 time skip: the paper cover lifts once the summary is in place. */}
      <div className="s-cover" ref={cover} aria-hidden="true" style={fromSkip && !still() ? undefined : { visibility: 'hidden' }} />
      {end && <EndCard onRestart={() => navigate(routeFor('01-home'))} onClose={() => setEnd(false)} />}
      {toastNode}
    </>
  )
}

// The end of the prototype slice: what comes next, and a way back to 03.
function EndCard({ onRestart, onClose }: { onRestart: () => void; onClose: () => void }) {
  const el = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!still() && el.current) gsap.fromTo(el.current, { y: 852 }, { y: 0, duration: 0.5, ease: 'expo.out' })
  }, [])
  return (
    <div className="end" ref={el} role="dialog" aria-modal="true" aria-labelledby="end-h" onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}>
      <Mono>End of the built route</Mono>
      <h2 className="t-h1" id="end-h">13 Weekly Ride opens here, filled in from this rental.</h2>
      <p className="lede">The idea of the whole app: OutRent sets a bike to your body before it arrives, so every screen reads like a fitting sheet. Daniel’s numbers are the biggest things on it, marked with a fitter’s line. Photos are dated evidence. Motion is a measurement being taken.</p>
      <div>
        <div className="pg"><b>01</b><span>Home. A docket: what, to where, when.</span></div>
        <div className="pg"><b>02</b><span>Coach’s post. Her photo, her note, her list.</span></div>
        <div className="pg"><b>03</b><span>Fit profile. An instrument: drag the scales and the bike answers.</span></div>
        <div className="pg"><b>04</b><span>Search. Three bikes, each timed against the 8:00 start.</span></div>
        <div className="pg"><b>05</b><span>Listing. A proof: this exact bike, its marks circled, its price measured.</span></div>
        <div className="pg"><b>12</b><span>Rental summary. A record: Saturday drawn to scale, ending in S$150 back.</span></div>
      </div>
      <button type="button" className="cta" onClick={onRestart} autoFocus>Start again at Home</button>
    </div>
  )
}
