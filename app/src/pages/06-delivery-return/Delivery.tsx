import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useBack } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { BackButton, Mono, haptic, still } from '../../shell/direction'
import { routeFor } from '../../pages'
import './delivery.css'

// 06 Delivery & return · the fitter's line. The Saturday on one line; pick both ends around the ride.
// Source: the Creative Director's prototype "OutRent · direction" (#06), approved 25 Oct 01:40.

type Kind = 'd' | 'c'
const PLACES = [
  ['Chestnut trailhead carpark', 'By the park entrance sign'],
  ['Blk 325C Sengkang East Way #11-42', 'Your home address'],
]
// Each scale: its stretch of the day, the ride edge, and four time buttons spaced evenly (the line above keeps true time).
const LEGS: Record<Kind, { q: string; done: string; edge: number; edgeLabel: string; slots: { t: string; off?: boolean }[] }> = {
  d: { q: 'When should it arrive?', done: 'Arrives', edge: 8, edgeLabel: 'RIDE STARTS 8:00', slots: [{ t: '7:00', off: true }, { t: '7:20' }, { t: '7:40' }, { t: '8:00' }] },
  c: { q: 'When should it be collected?', done: 'Collected', edge: 12.5, edgeLabel: 'RIDE ENDS 12:30', slots: [{ t: '13:00' }, { t: '13:30' }, { t: '14:30' }, { t: '17:30' }] },
}
const hm = (t: string) => { const [h, m] = t.split(':').map(Number); return h + m / 60 }

export default function Delivery() {
  const navigate = useNavigate()
  const back = useBack(() => navigate(routeFor('05-listing-detail')))
  const [pick, setPick] = useState<Record<Kind, string | null>>({ d: null, c: null })
  const [place, setPlace] = useState<Record<Kind, number>>({ d: 0, c: 0 })
  const [last, setLast] = useState<Kind | null>(null)
  const root = useRef<HTMLElement>(null)
  const both = pick.d && pick.c

  // On arrival, the time buttons of each step nudge in turn, to show they are the thing to tap.
  useLayoutEffect(() => {
    if (still() || !root.current) return
    const slots = [...root.current.querySelectorAll<HTMLElement>('.slot:not(:disabled)')]
    const timers = slots.map((b, i) => window.setTimeout(() => b.classList.add('hint'), 500 + i * 120))
    return () => timers.forEach(clearTimeout)
  }, [])

  const choose = (k: Kind, t: string) => {
    setPick((p) => ({ ...p, [k]: t }))
    setLast(k)
    haptic()
  }
  const swapPlace = (k: Kind, el: HTMLElement) => {
    setPlace((p) => ({ ...p, [k]: 1 - p[k] }))
    if (!still()) gsap.fromTo(el.querySelector('.pl'), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3 })
  }

  return (
    <>
      <main className="screen d-screen s6-screen" ref={root}>
        <div className="bar-top">
          <BackButton label="Back to the listing" onClick={back} />
          <Mono className="mid">Delivery &amp; return</Mono>
          <span />
        </div>
        <div className="pad">
          <div className="s6-head">
            <h1 className="t-h1">Saturday, both ways</h1>
            <p className="lede">Pick when the bike reaches you and when it is collected. Coach Aisyah’s ride runs 8:00–12:30.</p>
          </div>
          <div className="loop">
            <Overview d={pick.d} c={pick.c} last={last} />
            {(['d', 'c'] as Kind[]).map((k) => (
              <div key={k}>
                <section className={`leg${pick[k] ? ' done' : ''}`} aria-labelledby={`q-${k}`}>
                  <div className="leg-h">
                    <span className="q"><span className="n" aria-hidden="true">{k === 'd' ? 1 : 2}</span><b id={`q-${k}`}>{pick[k] ? `${LEGS[k].done} ${pick[k]}` : LEGS[k].q}</b></span>
                    <span className="small">Tap a time</span>
                  </div>
                  <button type="button" className="place" onClick={(e) => swapPlace(k, e.currentTarget)} aria-label={`Place: ${PLACES[place[k]][0]}. Change`}>
                    <Icon name="map-pin" />
                    <span className="pl"><b>{PLACES[place[k]][0]}</b><span>{PLACES[place[k]][1]}</span></span>
                    <span className="chg">Change</span>
                  </button>
                  <Scale k={k} picked={pick[k]} onPick={(t) => choose(k, t)} />
                </section>
                {k === 'd' && pick.d === '8:00' && (
                  <div className="clash" role="status"><Icon name="info" small /><span>8:00 arrives as the ride starts. 7:40 leaves time to set off.</span></div>
                )}
              </div>
            ))}
            <div className="loop-f"><span>Delivery and collection</span><b className={both ? undefined : 'wait'}>{both ? 'S$12' : 'Choose both times'}</b></div>
          </div>
          <figure className="spot">
            <div className="ph"><div className="todo"><Mono>Image to come</Mono><span className="w">The hand-over spot: Chestnut trailhead carpark, by the park entrance sign</span></div></div>
            <figcaption><Mono>Hand-over spot</Mono><span className="small">By the park entrance sign, Chestnut trailhead carpark</span></figcaption>
          </figure>
        </div>
      </main>
      <div className="dock">
        <button type="button" className="cta s6-go" disabled={!both} onClick={() => navigate(routeFor('07-fees-liability'))}>
          {both ? 'See the fees' : 'Choose both times'}
        </button>
      </div>
    </>
  )
}

// One leg's scale: the ride edge, a shaded band on the ride side, and the four time buttons.
function Scale({ k, picked, onPick }: { k: Kind; picked: string | null; onPick: (t: string) => void }) {
  const leg = LEGS[k]
  const ex = k === 'd' ? 87.5 : 0
  return (
    <div className="scale">
      <span className="axis" />
      <span className={`band ${k === 'd' ? 'is-d' : 'is-c'}`} style={{ left: `${ex}%` }} />
      <span className={`edge ${k === 'd' ? 'is-d' : 'is-c'}`} style={{ left: `${ex}%` }}><span>{leg.edgeLabel}</span></span>
      {leg.slots.map((s, i) => (
        <button
          key={s.t} type="button" className="slot" style={{ left: `${12.5 + i * 25}%` }} disabled={s.off}
          aria-pressed={picked === s.t}
          aria-label={s.off ? `${s.t}, before the first courier run` : `${k === 'd' ? 'Deliver at' : 'Collect at'} ${s.t}`}
          onClick={() => onPick(s.t)}
        >
          <b>{s.t}</b><i aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

// The whole Saturday on one line: the ride in ink, the two chosen times as forest ticks.
function Overview({ d, c, last }: { d: string | null; c: string | null; last: Kind | null }) {
  const box = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(321)
  useLayoutEffect(() => { if (box.current?.clientWidth) setW(box.current.clientWidth) }, [])
  const lo = 7, hi = 18, x = (t: number) => 2 + ((t - lo) / (hi - lo)) * (W - 4)
  const hours = []
  for (let t = lo; t <= hi; t++) hours.push(<line key={t} x1={x(t)} x2={x(t)} y1={21} y2={24} className="tk" />)
  // The newest marker pops in.
  const marker = useRef<SVGGElement>(null)
  useLayoutEffect(() => {
    if (!last || still() || !marker.current) return
    const t = gsap.fromTo(marker.current, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.35, ease: 'back.out(2)' })
    return () => { t.kill() }
  }, [d, c, last])
  const marks = ([['d', d], ['c', c]] as const).filter(([, t]) => t)
  return (
    <div className="ov" ref={box}>
      <svg viewBox={`0 0 ${W} 46`} aria-hidden="true">
        <line x1={x(lo)} x2={x(hi)} y1={24} y2={24} className="base" />
        {hours}
        {[7, 10, 13, 16, 18].map((t) => <text key={t} x={x(t)} y={42} textAnchor={t === lo ? 'start' : t === hi ? 'end' : 'middle'}>{t}:00</text>)}
        <rect x={x(8)} y={21.5} width={x(12.5) - x(8)} height={5} rx={2.5} className="ride" />
        <text x={(x(8) + x(12.5)) / 2} y={12} textAnchor="middle" className="ride-t">RIDE</text>
        {marks.map(([k, t]) => {
          const X = x(hm(t!))
          return (
            <g key={k} className="ovm" ref={k === last ? marker : undefined}>
              <line x1={X} x2={X} y1={14} y2={24} />
              <circle cx={X} cy={24} r={4.5} />
              <text x={X} y={12} textAnchor={k === 'd' ? 'end' : 'start'}>{t}</text>
            </g>
          )
        })}
      </svg>
      <span className="sr-only">{d || c ? `Chosen: ${d ? `arrives ${d}` : ''}${d && c ? ', ' : ''}${c ? `collected ${c}` : ''}` : 'No times chosen yet'}</span>
    </div>
  )
}
