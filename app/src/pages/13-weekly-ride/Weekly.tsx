import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useBack } from '../../shell/Link'
import { BackButton, Mono, haptic, still, useToast } from '../../shell/direction'
import { routeFor } from '../../pages'
import './weekly.css'

// 13 Weekly ride · the fitter's line. Every Saturday, the same job tag: a stack of next weeks' tags behind this
// one, and the week drawn as a line showing when money moves. Filled in from this rental.
// Source: the Creative Director's prototype "OutRent · direction" (#13, v20), approved 25 Oct 02:22.
// The paid stamp on starting is left out for now: it is being redesigned (inbox, 25 Oct 02:28).

const BACKS = [{ cls: 'back3', date: '22 Nov' }, { cls: 'back2', date: '15 Nov' }, { cls: 'back1', date: '8 Nov' }]
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function Weekly() {
  const navigate = useNavigate()
  const back = useBack(() => navigate(routeFor('12-rental-summary')))
  const [toastNode, toast] = useToast()
  const [started, setStarted] = useState(false)
  const root = useRef<HTMLElement>(null)
  const ctl = useRef<HTMLDivElement>(null)

  // The tags drop in one after another and settle into a fanned stack.
  useLayoutEffect(() => {
    if (still() || !root.current) return
    const ctx = gsap.context(() => {
      gsap.from('.tag2', { y: -60, opacity: 0, rotation: (i: number) => [16, 12, 8, -6][i], duration: 0.7, stagger: 0.12, ease: 'back.out(1.3)' })
    }, root)
    return () => ctx.revert()
  }, [])

  const start = () => {
    if (started) { navigate(routeFor('09-trips')); return }
    setStarted(true)
    haptic()
    requestAnimationFrame(() => {
      if (!still() && ctl.current) gsap.fromTo(ctl.current.children, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, delay: 0.3 })
    })
  }

  return (
    <>
      <main className="screen d-screen s13-screen" ref={root}>
        <div className="bar-top">
          <BackButton label="Back to the summary" onClick={back} />
          <Mono className="mid">Weekly ride</Mono>
          <span />
        </div>
        <div className="pad">
          <div className="s13-head">
            <h1 className="t-h1" aria-live="polite">{started ? 'Every Saturday, from 1 Nov' : 'Every Saturday, the same tag'}</h1>
            <p className="lede">This bike, set to your fit, at the trailhead each week.</p>
          </div>
        </div>
        <div className="tagstack">
          {BACKS.map((t) => <div key={t.cls} className={`tag2 ${t.cls}`} aria-hidden="true"><span className="date">{t.date}</span></div>)}
          <section className="tag2 front" aria-label="Weekly job tag">
            <span className="hole" aria-hidden="true" />
            <div className="tg-top"><Mono>Timah Cycles</Mono><Mono>From 1 Nov</Mono></div>
            <div className="tg-name">Every Saturday</div>
            <div className="tg-bike">Trek Marlin 7 · size&nbsp;M · set to your fit</div>
            <dl className="tg-go">
              <div><dt className="mono">Deliver</dt><dd>7:40</dd></div>
              <div><dt className="mono">Collect</dt><dd>13:30</dd></div>
            </dl>
            <div className="tg-at">Chestnut trailhead carpark, by the park entrance sign</div>
          </section>
        </div>
        <div className="pad">
          <section className="money13">
            <div className="m13-h"><Mono>When money moves, each week</Mono><b>S$45 per ride</b></div>
            <Week />
            <p className="small s13-flat">Nothing is charged today. Each ride is charged on the Thursday before, at 20:00, when its S$150 deposit is also held. The deposit is released after that ride’s return check.</p>
          </section>
          {started && (
            <div className="ctl13" ref={ctl}>
              <button type="button" onClick={() => toast('Skipping is not in this demo yet.')}><b>Skip 1 Nov</b><span>Free before <span className="nb">Thu · 20:00</span></span></button>
              <button type="button" onClick={() => toast('Pausing is not in this demo yet.')}><b>Pause</b><span>Until you resume</span></button>
              <button type="button" onClick={() => toast('Stopping is not in this demo yet.')}><b>Stop</b><span>From the next Saturday</span></button>
            </div>
          )}
        </div>
      </main>
      <div className="dock">
        <button type="button" className="cta s13-go" onClick={start}>{started ? 'Done' : 'Start every Saturday'}</button>
      </div>
      {toastNode}
    </>
  )
}

// The week as a line: Thursday 20:00 is when S$45 is charged and the deposit held; Saturday is the ride.
function Week() {
  const box = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(353)
  useLayoutEffect(() => { if (box.current?.clientWidth) setW(box.current.clientWidth) }, [])
  const x = (i: number) => 14 + (i * (W - 28)) / 6
  const th = x(3) + (x(4) - x(3)) * (20 / 24)
  return (
    <div className="week" ref={box}>
      <svg viewBox={`0 0 ${W} 62`} aria-hidden="true">
        <line x1={x(0)} x2={x(6)} y1={26} y2={26} className="base" />
        {DAYS.map((d, i) => <g key={d}><line x1={x(i)} x2={x(i)} y1={22} y2={26} className="tk" /><text x={x(i)} y={44} textAnchor="middle">{d}</text></g>)}
        <line x1={th} x2={th} y1={12} y2={26} className="charge" />
        <circle cx={th} cy={26} r={5} className="charge-dot" />
        <text x={th} y={8} textAnchor="middle" className="ink">THU 20:00 · S$45 + HOLD</text>
        <circle cx={x(5)} cy={26} r={6} className="ride" />
        <text x={x(5)} y={60} textAnchor="middle" className="forest">RIDE 7:40–13:30</text>
      </svg>
      <span className="sr-only">Each week: Thursday 20:00, S$45 charged and the deposit held; Saturday, the ride from 7:40 to 13:30.</span>
    </div>
  )
}
