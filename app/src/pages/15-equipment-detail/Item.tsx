import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { Photo } from '../../shell/Photo'
import { useBack } from '../../shell/Link'
import { BackButton, Chev, LineIcon, Mono, Sheet, haptic, still, useSheet, useToast } from '../../shell/direction'
import { routeFor } from '../../pages'
import { clockOf, dateLabel, dayOf, offRouteNow, set, setClock, useStore, type Return } from '../../shell/store'
import { dayLong, dm, hubNow, intakeAt, nextDayBack, pickDay, poolBack } from '../../shell/storage'
import corridor from '@photos/15-equipment-detail/assets/15-direction-15-giant-corridor.webp'
import hubPhoto from '@photos/15-equipment-detail/assets/15-direction-15-giant-hub.webp'
import drive from '@photos/15-equipment-detail/assets/15-direction-15-intake-drive.webp'
import left from '@photos/15-equipment-detail/assets/15-direction-15-intake-left.webp'
import right from '@photos/15-equipment-detail/assets/15-direction-15-intake-right.webp'
import './item.css'

// 15 Giant Escape 3 · the fitter's line. Two states from the story: at home (how long it has stood unused on a
// months ruler, the space it takes as a drawn box, what it could earn; "Store it at the Hub" opens 16) and at
// the Hub after 17's pickup (the forest intake dot, the running cost, the intake record, rent-out and the way back).
// Source: the Creative Director's prototype v52 (#15). Rent-out and the return booking are kept in the story state.

const HOME_ADDR = 'Blk 325C Sengkang East Way'
// the two ways back, dated from the pickup day (Tue 28: Fri 31 Oct pooled, 30 Oct next day, as VS-6 seeds)
const retOf = (pool: number, next: number): Record<Exclude<Return, ''>, { b: string; s: string; cta: string; when: string }> => ({
  pool: { b: 'Coming home on the shared courier run', s: `${dayLong(pool)}, morning · free · to ${HOME_ADDR}`, cta: 'Schedule return · free', when: `${dayLong(pool)}, morning · 2 days’ notice` },
  next: { b: 'Coming home next day', s: `${dm(next)} · 17:00–19:00 · S$8 · to ${HOME_ADDR}`, cta: 'Schedule return · S$8', when: `${dm(next)} · 17:00–19:00` },
})

export default function Item() {
  const navigate = useNavigate()
  const location = useLocation()
  const [toastNode, toast] = useToast()
  const root = useRef<HTMLElement>(null)
  const s = useStore((x) => x)
  const st = s.storage
  const hub = st.hub
  const now = hub ? Math.max(s.now, hubNow(s)) : offRouteNow(s)
  const pd = pickDay(s), RET = retOf(poolBack(s), nextDayBack(s))
  const fromSkip = (location.state as { back?: string } | null)?.back === '14-my-equipment'
  const toGear = () => navigate(routeFor('14-my-equipment'), { replace: true, state: { how: 'back' } })
  const back = useBack(() => navigate(routeFor('14-my-equipment')))
  const goBack = fromSkip ? toGear : back

  useEffect(() => { setClock(clockOf(now)) }, [now])

  useLayoutEffect(() => {
    if (still() || !root.current) return
    const ctx = gsap.context(() => {
      gsap.from('.gap15', { opacity: 0, duration: 0.5, delay: 0.5 })
      gsap.from('.in15', { scale: 0, transformOrigin: '50% 50%', opacity: 0, duration: 0.5, delay: 0.9, ease: 'back.out(2)' })
      gsap.from('.space15, .earn15, .costrun, .intake, .rent15', { opacity: 0, y: 14, duration: 0.45, stagger: 0.08, delay: 0.2, ease: 'power3.out' })
    }, root)
    return () => ctx.revert()
  }, [hub])

  const rent = useSheet()
  const bring = useSheet()
  const [ack, setAck] = useState(false)
  const [ret, setRet] = useState<Exclude<Return, ''>>('pool')
  const rentBtn = useRef<HTMLButtonElement>(null)
  const retCard = useRef<HTMLDivElement>(null)

  const optIn = () => {
    if (!ack) return
    set((x) => ({ ...x, storage: { ...x.storage, rentOn: true } }))
    rent.hide(); haptic()
    if (!still() && rentBtn.current) gsap.fromTo(rentBtn.current, { scale: 0.96 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1,.45)' })
  }
  const schedule = () => {
    set((x) => ({ ...x, storage: { ...x.storage, ret } }))
    bring.hide(); haptic()
    requestAnimationFrame(() => {
      const el = retCard.current; if (!el) return
      if (!still()) gsap.from(el, { opacity: 0, y: 12, duration: 0.45, ease: 'back.out(1.6)' })
      window.setTimeout(() => centerIn(el), 300)
    })
  }
  const dock = () => {
    if (!hub) { navigate(routeFor(st.booked ? '17-hub-pickup' : '16-storage-options')); return }
    if (st.ret) { goBack(); return }
    bring.show()
  }

  return (
    <>
      <main className="screen d-screen s15-screen" ref={root}>
        <div className="photo-top top15">
          {hub
            ? <Photo key="hub" src={hubPhoto} alt="The Giant Escape 3 hanging on a rack at the OutRent Hub" width={393} height={290} first className="p15-hub" />
            : <Photo key="home" src={corridor} alt="The Giant Escape 3 standing across the flat’s corridor" width={393} height={290} first className="p15-home" />}
          <span className="shade" />
          <BackButton label={fromSkip ? 'Back to My gear' : 'Back'} onClick={goBack} onPhoto />
          <div className="cap"><Mono className="state15"><i />{hub ? `At the OutRent Hub since ${dm(pd)}` : 'At home · corridor'}</Mono><Mono>{dateLabel(now)}</Mono></div>
        </div>
        <div className="over pad">
          <h1 className="t-h1">Giant Escape 3</h1>
          <p className="lede s15-lede">2021 · bike · yours</p>

          <section className="idle15">
            <Mono>Last used</Mono>
            <div className="big"><b>{hub ? '1 day ago' : '5 months ago'}</b><span>{hub ? `${dm(pd)} · updated by the intake` : '24 May 2026'}</span></div>
            <Ruler hub={hub} now={now} pd={pd} />
            <div className="auto15"><LineIcon name="auto" /><span>Dates update on their own when this item moves through OutRent.</span></div>
          </section>

          {!hub ? (
            <div>
              <div className="space15">
                <svg viewBox="0 0 150 112" aria-hidden="true">
                  <g strokeLinejoin="round">
                    <path className="bx-top" d="M20 44 L84 26 L134 40 L70 58 Z" />
                    <path className="bx-l" d="M20 44 L70 58 L70 100 L20 86 Z" />
                    <path className="bx-r" d="M70 58 L134 40 L134 82 L70 100 Z" />
                  </g>
                  <g className="bx-dim"><path d="M70 106 L134 88" /><path d="M14 46 L14 88" /><path d="M14 92 L64 106" /></g>
                  <text x="108" y="108">175</text><text x="0" y="70">105</text><text x="28" y="108" transform="rotate(16 28 108)">60</text>
                </svg>
                <div className="tx"><Mono>Space taken</Mono><b>175 × 105 × 60 cm</b><span className="w">In the corridor. It blocks it.</span></div>
              </div>
              <div className="earn15"><b>Could earn while stored</b><span className="v">S$8.40 / day rented</span><span className="s">What you keep each day it is rented out: 70% of S$12. Only if you opt in.</span></div>
              {st.booked && (
                <div className="done15" role="status">
                  <b>Pickup booked</b>
                  <span>{st.way === 'rack' ? `${dayLong(pd)} · leave it at Rack S before 7:00 · S$5` : `${dayLong(pd)} · 17:00–19:00 at your door · S$10`}</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="costrun"><span><Mono>Storage</Mono><br /><span className="small">Running since {dm(pd)} · OutRent Hub, Sungei Kadut</span></span><b>S$18 / month</b></div>
              {st.way && <div className="kv"><b>Got there</b><span className="v">{st.way === 'home' ? 'S$10' : 'S$5'}</span><span className="s">{st.way === 'home' ? `Door pickup · ${dm(pd)} · 17:00–19:00` : `Rack S drop-off · ${dm(pd)} · shared courier run 7:00–10:00`}</span></div>}
              <article className="intake">
                <header className="intake-h"><Mono>Intake record</Mono><Mono>{intakeAt(s)} · OutRent Hub</Mono></header>
                <div className="intake-ph">
                  <figure><div className="ph"><Photo src={drive} alt="Intake photo: the drivetrain, chain worn" width={106} height={106} /></div><figcaption><b>Drivetrain</b><span className="intake-note">Chain worn</span></figcaption></figure>
                  <figure><div className="ph"><Photo src={left} alt="Intake photo: the frame, left side" width={106} height={106} /></div><figcaption><b>Frame</b>Left side</figcaption></figure>
                  <figure><div className="ph"><Photo src={right} alt="Intake photo: the frame, right side" width={106} height={106} /></div><figcaption><b>Frame</b>Right side</figcaption></figure>
                </div>
                <div className="intake-f"><span>Overall: <b>good, chain worn</b></span><span>This is the condition everything after is measured against, including any rental of this bike.</span></div>
              </article>
              <button type="button" ref={rentBtn} className={`rent15${st.rentOn ? ' on' : ''}`}
                onClick={() => (st.rentOn ? toast('Earnings show here after the first rental.') : rent.show())}>
                <LineIcon name="coins" />
                <span><b>{st.rentOn ? 'Available to rent' : 'Rent it out while stored'}</b><span>{st.rentOn ? 'Earned so far: S$0 · nothing rented yet' : 'Not opted in · see the terms first'}</span></span>
                <Chev />
              </button>
              {st.ret && <div className="done15" ref={retCard} role="status"><b>{RET[st.ret].b}</b><span>{RET[st.ret].s}</span></div>}
            </div>
          )}
        </div>
      </main>
      <div className="dock">
        <button type="button" className="cta s15-go" onClick={dock}>
          {hub ? (st.ret ? 'Back to My gear' : 'Bring it back') : st.booked ? `See the pickup · ${dayLong(pd)}` : 'Store it at the Hub'}
        </button>
      </div>

      <Sheet sheet={rent} label="Rent-out terms" title="Rent it out while stored" closeLabel="Close, back to the Giant Escape 3">
        <Split />
        <div className="terms18 s15-terms">
          <div><LineIcon name="check" /><span>Its condition is <b>re-checked after every rental</b> against the intake record of {dm(pd)}.</span></div>
          <div><LineIcon name="check" /><span>You opt in yourself and can see earnings to date on this page.</span></div>
        </div>
        <label className="ack15"><input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} tabIndex={rent.open ? 0 : -1} /><span>I agree to the rent-out terms.</span></label>
        <button type="button" className="cta s15-optin" disabled={!ack} onClick={optIn}>{ack ? 'Opt in · rent it out' : 'Tick the terms to opt in'}</button>
      </Sheet>

      <Sheet sheet={bring} label="Bring it back" title="Bring it back" closeLabel="Close, back to the Giant Escape 3">
        <div className="fromto"><Mono>From</Mono><span>OutRent Hub, Sungei Kadut</span><Mono>To</Mono><span>Blk 325C Sengkang East Way #11-42</span></div>
        <button type="button" className="opt" aria-pressed={ret === 'pool'} onClick={() => { setRet('pool'); haptic() }}><span className="rad" /><b>Shared courier run</b><span className="pr">Free</span><span className="s">{RET.pool.when}</span></button>
        <button type="button" className="opt" aria-pressed={ret === 'next'} onClick={() => { setRet('next'); haptic() }}><span className="rad" /><b>Next day, to your door</b><span className="pr">S$8</span><span className="s">{RET.next.when}</span></button>
        <button type="button" className="cta s15-ret" onClick={schedule}>{RET[ret].cta}</button>
      </Sheet>
      {toastNode}
    </>
  )
}

// The rent-out split: Daniel keeps 70% of the S$12 day rate (15 and 16 show the same bar).
function Split() {
  return (
    <div className="split">
      <div className="bar"><span style={{ flex: 70 }} /><span className="b" style={{ flex: 30 }} /></div>
      <div className="lg"><div><b>S$8.40</b><span>You keep 70%, per day rented</span></div><div><b>S$12 / day</b><span>Suggested rate</span></div></div>
    </div>
  )
}

// May to October on one line: the last ride on 24 May, the gap since, and today (or the Hub intake on 28 Oct).
function Ruler({ hub, now, pd }: { hub: boolean; now: number; pd: number }) {
  const box = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(353)
  useLayoutEffect(() => { if (box.current?.clientWidth) setW(box.current.clientWidth) }, [])
  const t0 = Date.UTC(2026, 4, 1), t1 = Date.UTC(2026, 10, 1)
  const day = (m: number, d: number) => Date.UTC(2026, m, d)
  const x = (t: number) => 6 + ((t - t0) / (t1 - t0)) * (W - 12)
  const today = dayOf(now)
  const a = x(day(4, 24)), nowX = x(day(today.m === 'Nov' ? 10 : 9, today.d)), intake = x(day(9, pd))
  const end = hub ? intake : nowX
  return (
    <div className="ruler15" ref={box}>
      <svg viewBox={`0 0 ${W} 78`} aria-hidden="true">
        <line className="r-base" x1={6} x2={W - 6} y1={40} y2={40} />
        {['MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'].map((m, i) => {
          const xx = x(day(4 + i, 1))
          return (
            <g key={m}>
              <line className="r-maj" x1={xx} x2={xx} y1={35} y2={45} /><text x={xx + 4} y={58}>{m}</text>
              {[1, 2, 3].map((w) => { const xw = x(day(4 + i, 1 + w * 7.6)); return <line key={w} className="r-min" x1={xw} x2={xw} y1={38} y2={42} /> })}
            </g>
          )
        })}
        <g className="gap15"><path className="r-gap" d={`M${a} 26 H${end}`} /><text x={(a + end) / 2} y={21} textAnchor="middle">{hub ? 'IDLE 5 MONTHS' : '5 MONTHS UNUSED'}</text></g>
        <circle className="r-a" cx={a} cy={40} r={5} /><text className="k" x={a} y={74} textAnchor="middle">24 MAY</text>
        {hub && <g className="in15"><circle className="r-in" cx={intake} cy={40} r={6} /><text className="f" x={intake} y={74} textAnchor="end">{pd} OCT · HUB INTAKE</text></g>}
        <line className="r-now" x1={nowX} x2={nowX} y1={26} y2={50} />
        {!hub && <text className="f" x={nowX} y={20} textAnchor="end">NOW</text>}
      </svg>
      <span className="sr-only">{hub ? `Last used 24 May; checked in at the Hub on ${dm(pd)} after five months idle.` : 'Last used 24 May; five months unused until today.'}</span>
    </div>
  )
}

function centerIn(el: HTMLElement) {
  const sc = el.closest<HTMLElement>('.screen'); if (!sc) return
  const r = el.getBoundingClientRect(), b = sc.getBoundingClientRect()
  sc.scrollTo({ top: sc.scrollTop + (r.top + r.height / 2) - (b.top + b.height / 2), behavior: still() ? 'auto' : 'smooth' })
}
