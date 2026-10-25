import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useBack } from '../../shell/Link'
import { BackButton, Mono, haptic, still, useToast } from '../../shell/direction'
import { routeFor } from '../../pages'
import { lock } from '../../shell/PageFrame'
import { clockOf, collectAt, deliverAt, fitNow, hm, isClosed, offRouteNow, set, setClock, useStore } from '../../shell/store'
import { legsShort, releaseH } from '../../shell/rental'
import './weekly.css'

// 13 Weekly ride · the fitter's line. A stack of tags, one for each Saturday; the week ruler runs Mon -> Sun with
// the Thursday charge and the ride; "Set up every Saturday" threads one ring through every hole, then skip /
// pause / stop show, the bottom button goes and Back (to Bookings) is the one way out. Reopened, it shows the
// running series. Source: the Creative Director's prototype v52 (#13). Real state: the series takes the bike
// size, times and places of OR-10482 and is kept in the store (09, 12 and Home show it).

const BACKS = [{ cls: 'back3', date: 'Sat 22 Nov' }, { cls: 'back2', date: 'Sat 15 Nov' }, { cls: 'back1', date: 'Sat 8 Nov' }]
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function Weekly() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const back = useBack(() => navigate(routeFor('09-trips')))
  const [toastNode, toast] = useToast()
  const s = useStore((x) => x)
  const on = s.weekly
  const closed = isClosed(s)
  const f = fitNow(s)
  const d = deliverAt(s), c = collectAt(s)
  const root = useRef<HTMLElement>(null)
  const stack = useRef<HTMLDivElement>(null)
  const ctl = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const [fresh, setFresh] = useState(false)

  // Seen right after the ride it is 14:06 (14:07 once set up, FD-RECURRING); before the ride, the off-route clock.
  useEffect(() => {
    setClock(clockOf(closed ? Math.max(s.now, releaseH(s) + (on ? 2 : 1) / 60) : offRouteNow(s)))
  }, [s, on, closed])

  // The tags drop in one after another (only before the series is set up).
  useLayoutEffect(() => {
    if (still() || on || !root.current) return
    const ctx = gsap.context(() => {
      gsap.from('.tag2', { y: -60, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'back.out(1.3)' })
    }, root)
    return () => ctx.revert()
  }, [])

  // Set up: the ring is drawn through the holes, the string after it, the stack sways once; then the controls.
  useLayoutEffect(() => {
    if (!fresh || still() || !stack.current) return
    const st = stack.current
    const ctx = gsap.context(() => {
      st.querySelectorAll<SVGPathElement>('.cord path').forEach((p, i) => {
        const L = p.getTotalLength()
        gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.5, delay: 0.15 + i * 0.35, ease: 'power2.inOut', onComplete: i ? haptic : undefined })
      })
      gsap.fromTo('.tag2', { rotation: 0 }, { rotation: (i: number) => [2, -2, 2, -1.5][i], transformOrigin: '50% 16px', duration: 0.22, delay: 0.85, yoyo: true, repeat: 1, ease: 'power1.inOut' })
      if (ctl.current) gsap.from(ctl.current.children, { opacity: 0, y: 10, duration: 0.35, stagger: 0.06, delay: 1.1 })
    }, root)
    return () => ctx.revert()
  }, [fresh])

  const setUp = () => {
    if (on) return
    lock(btn.current)
    set((x) => ({ ...x, weekly: true, now: isClosed(x) ? Math.max(x.now, releaseH(x) + 2 / 60) : x.now }))
    setFresh(true)
  }
  // After set-up, Back is the only way out, and it goes to Bookings.
  const goBack = on ? () => navigate(routeFor('09-trips'), { replace: true, state: { how: 'back' } }) : back
  const backTo = on ? 'Bookings' : from ?? 'Bookings'

  return (
    <>
      <main className={`screen d-screen s13-screen${on ? ' is-on' : ''}`} ref={root}>
        <div className="bar-top">
          <BackButton label={`Back to ${backTo}`} onClick={goBack} />
          <Mono className="mid">Weekly ride</Mono>
          <span />
        </div>
        <div className="pad">
          <div className="s13-head">
            <h1 className="t-h1" aria-live="polite">{on ? 'Every Saturday, from 1 Nov' : 'Every Saturday, the same bike'}</h1>
            <p className="lede">This bike, set to your fit, at {s.book.place.d === 0 ? 'the trailhead' : 'Blk 325C'} each week.{on ? '' : ' 10% off each ride.'}</p>
          </div>
        </div>
        <div className={`tagstack${on ? ' tied' : ''}`} ref={stack}>
          {BACKS.map((t) => <div key={t.cls} className={`tag2 ${t.cls}`} aria-hidden="true"><span className="date">{t.date}</span></div>)}
          <section className="tag2 front" aria-label="Weekly job tag">
            <span className="hole" aria-hidden="true" />
            <div className="tg-top"><Mono>Timah Cycles</Mono><Mono>From 1 Nov</Mono></div>
            <div className="tg-name">Every Saturday</div>
            <div className="tg-bike">Trek Marlin 7 · size&nbsp;{f.frame} · set to your fit</div>
            <dl className="tg-go">
              <div><dt className="mono">Deliver</dt><dd>{d}</dd></div>
              <div><dt className="mono">Collect</dt><dd>{c}</dd></div>
            </dl>
            <div className="tg-at">{legsShort(s)}</div>
          </section>
          {on && <Cord />}
        </div>
        <div className="pad">
          <section className="money13">
            <div className="m13-h"><Mono>Payment, each week</Mono><b>S$45 per ride</b></div>
            <Week d={d} c={c} />
            <p className="small">{on
              ? 'Next charge 30 Oct · 20:00: S$45, and the S$150 deposit held for that ride. It is released after that ride’s return check. Skip 1 Nov free before then.'
              : 'Nothing is charged today. Each ride is charged on the Thursday before, at 20:00, when its S$150 deposit is also held. The deposit is released after that ride’s return check.'}</p>
          </section>
          {on && (
            <div className="ctl13" ref={ctl}>
              <button type="button" onClick={() => toast('Skipping is not in this demo yet.')}><b>Skip 1 Nov</b><span>Free before <span className="nb">30 Oct · 20:00</span></span></button>
              <button type="button" onClick={() => toast('Pausing is not in this demo yet.')}><b>Pause</b><span>Until you resume</span></button>
              <button type="button" onClick={() => toast('Stopping is not in this demo yet.')}><b>Stop</b><span>From the next Saturday</span></button>
            </div>
          )}
        </div>
      </main>
      {!on && (
        <div className="dock">
          <button type="button" ref={btn} className="cta s13-go" onClick={setUp}>Set up every Saturday · S$45 a ride</button>
        </div>
      )}
      {toastNode}
    </>
  )
}

// One ring through every hole, and the string it hangs from.
function Cord() {
  const box = useRef<SVGSVGElement>(null)
  const [W, setW] = useState(393)
  useLayoutEffect(() => { const w = box.current?.parentElement?.clientWidth; if (w) setW(w) }, [])
  const cx = W / 2, cy = 16 + 9 + 7.5
  return (
    <svg className="cord" ref={box} viewBox={`0 0 ${W} 390`} aria-hidden="true">
      <path d={`M${cx} ${cy - 22} a12 12 0 1 1 -0.01 0`} />
      <path d={`M${cx} ${cy - 22} C ${cx + 3} ${cy - 30}, ${cx - 2} ${cy - 34}, ${cx} ${cy - 38}`} />
    </svg>
  )
}

// The week as a ruler, Mon -> Sun: the charge on Thursday at 20:00 and the ride on Saturday at the booked times.
function Week({ d, c }: { d: string; c: string }) {
  const box = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(353)
  useLayoutEffect(() => { if (box.current?.clientWidth) setW(box.current.clientWidth) }, [])
  const dw = (W - 16) / 7, x = (t: number) => 8 + t * dw   // t in days from Mon 0:00
  const th = x(3 + 20 / 24), r0 = x(5 + hm(d) / 24), r1 = x(5 + hm(c) / 24)
  return (
    <div className="week" ref={box}>
      <svg viewBox={`0 0 ${W} 62`} aria-hidden="true">
        <line x1={x(0)} x2={x(7)} y1={26} y2={26} className="base" />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={x(i)} x2={x(i)} y1={22} y2={30} className="tk" />)}
        {DAYS.map((dd, i) => <text key={dd} x={x(i + 0.5)} y={46} textAnchor="middle">{dd}</text>)}
        <line x1={th} x2={th} y1={12} y2={26} className="charge" />
        <circle cx={th} cy={26} r={5} className="charge-dot" />
        <text x={th + 4} y={9} textAnchor="end" className="ink">THU · 20:00 · S$45 + S$150 HOLD</text>
        <rect x={r0} y={23} width={r1 - r0} height={6} rx={3} className="ride" />
        <text x={(r0 + r1) / 2} y={60} textAnchor="middle" className="forest">RIDE {d}–{c}</text>
      </svg>
      <span className="sr-only">Each week: Thursday 20:00, S$45 charged and the S$150 deposit held; Saturday, the ride from {d} to {c}.</span>
    </div>
  )
}
