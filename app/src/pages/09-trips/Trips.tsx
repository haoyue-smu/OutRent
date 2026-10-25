import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { Photo } from '../../shell/Photo'
import { Chev, LineIcon, Mono, TabBar, TimeSkip, still, useToast } from '../../shell/direction'
import { routeFor } from '../../pages'
import { dayLong, dm, nextDayBack, pickDay, poolBack, wd } from '../../shell/storage'
import { clockOf, collectAt, countdown, dateTime, deliverAt, fitNow, set, setClock, useStore } from '../../shell/store'
import {
  CANCEL_BY, bookingsNow, collectH, deliverH, leavesH, legsLine, nextRideH, payWith, placeFull, releaseH, spotWhere, stage, trackH,
} from '../../shell/rental'
import proof from '@photos/10-delivery-tracking/assets/10-direction-setup-proof.webp'
import stand from '@photos/05-listing-detail/assets/05-direction-u1-stand.webp'
import './trips.css'

// 09 Bookings · the fitter's line. Three shelves, always in this order: Up next (with tracking), Weekly ride,
// Past (the archive, once something has closed). Source: the Creative Director's prototype v52 (#09).
// Real state: the card follows the rental as it happens (booked, on its way, at the hand-over place, out on the
// ride, closed), with the times, places, fit and payment Daniel chose; the weekly ride and Past appear when made.

const nb = (t: string) => <span className="nb">{t}</span>

// A station board: each digit on its own flap, rolling through numbers before it settles.
function Board({ parts }: { parts: [string, string][] }) {
  return (
    <div className="board">
      <span className="sr-only">{parts.map(([n, u]) => `${n} ${u}`).join(' ').trim()}</span>
      {parts.map(([n, u], i) => (
        <span key={i} className="board-part" aria-hidden="true">
          {n.split('').map((c, j) => /\d/.test(c)
            ? <span key={j} className="flap" data-d={c}><span>{c}</span></span>
            : <span key={j} className="u">{c}</span>)}
          {u && <span className="u">{u}</span>}
        </span>
      ))}
    </div>
  )
}

// The weekly series on a line: four Saturdays, and the first charge on the Thursday before.
function WeekLine() {
  const box = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(317)
  useLayoutEffect(() => { if (box.current?.clientWidth) setW(box.current.clientWidth) }, [])
  const x = (i: number) => 8 + (i * (W - 16)) / 4
  const th = x(0) - ((W - 16) / 4) * (1 + 4 / 24) / 7
  return (
    <div className="wk9" ref={box}>
      <svg viewBox={`0 0 ${W} 66`} role="img" aria-label="Rides every Saturday from 1 Nov; each is charged S$45 on the Thursday before at 20:00">
        <line x1={x(0) - 30} x2={x(4)} y1={30} y2={30} className="base" />
        {['1 NOV', '8 NOV', '15 NOV', '22 NOV'].map((d, i) => (
          <g key={d}>
            <line x1={x(i)} x2={x(i)} y1={24} y2={36} className={i ? 'tk' : 'tk is-first'} />
            <text x={x(i)} y={52} textAnchor="middle" className={i ? undefined : 'ink'}>{d}</text>
          </g>
        ))}
        <text x={x(4)} y={52} textAnchor="end">…</text>
        <circle cx={x(0)} cy={30} r={5} className="ride" />
        <path d={`M${th} 30 v-14`} className="charge" />
        <circle cx={th} cy={30} r={3} className="charge-dot" />
        <text x={th - 4} y={11} textAnchor="start" className="ink">FIRST CHARGE 30 OCT · 20:00 · S$45</text>
      </svg>
    </div>
  )
}

export default function Trips() {
  const navigate = useNavigate()
  const [toastNode, toast] = useToast()
  const root = useRef<HTMLElement>(null)
  const s = useStore((x) => x)
  const [skip, setSkip] = useState(false)
  const now = bookingsNow(s)
  const st = stage(s)
  const f = fitNow(s)
  const d = deliverAt(s), c = collectAt(s), pd = s.book.place.d, pc = s.book.place.c
  const closed = st === 'closed', weekly = s.weekly
  const cd = (to: number): [string, string][] => { const k = countdown(now, to); return [[k.a, k.au], [k.b, k.bu]] }
  const firstIn = (() => { const k = countdown(now, nextRideH(s)); return `${k.a} ${k.au} ${k.b} ${k.bu}` })()

  useEffect(() => { setClock(clockOf(now)) }, [now])

  // The shelves rise in turn; the board rolls through digits and settles on the time left.
  useLayoutEffect(() => {
    if (still() || !root.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.lbl, .bk, .none9, .row9', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'power3.out' })
      document.querySelectorAll<HTMLElement>('.s9-screen .flap').forEach((fl, n) => {
        const sp = fl.firstElementChild as HTMLElement, dg = fl.dataset.d ?? '0', o = { k: 0 }, steps = 6 + n * 2
        gsap.to(o, { k: steps, duration: 0.5 + n * 0.14, delay: 0.25, ease: 'power2.out', onUpdate: () => { const k = Math.floor(o.k); sp.textContent = k >= steps ? dg : String((+dg + steps - k) % 10) } })
        gsap.fromTo(sp, { rotationX: -70 }, { rotationX: 0, duration: 0.18, repeat: Math.max(1, Math.floor(steps / 2)), delay: 0.25, ease: 'none' })
      })
      gsap.from('.wk9 svg > *', { opacity: 0, duration: 0.3, stagger: 0.03, delay: 0.5 })
    }, root)
    return () => ctx.revert()
  }, [])

  const go = (page: string) => navigate(routeFor(page))
  // Track: on Friday the clock runs on to Saturday morning first; on the day it opens the map straight away.
  const track = () => { if (st === 'booked') setSkip(true); else go('10-delivery-tracking') }

  // ---------- Up next: the one-off rental while it runs ----------
  const upcoming = st !== 'none' && !closed
  let board: { k: string; parts: [string, string][] } = { k: '', parts: [] }
  let action = { label: 'Track delivery', run: track }
  let where = placeFull(pd)
  if (st === 'booked' || st === 'onway') board = { k: `Arrives at ${spotWhere(pd)} in`, parts: cd(deliverH(s)) }
  if (st === 'here') {
    board = { k: `${pd === 0 ? 'At the park entrance sign' : 'At Blk 325C'} since`, parts: [[d, '']] }
    action = { label: 'Start the hand-over check', run: () => go('11-handover-check') }
  }
  if (st === 'riding') {
    board = { k: `Collected at ${spotWhere(pc)} in`, parts: cd(collectH(s)) }
    action = { label: 'Open the hand-over record', run: () => go('11-handover-check') }
    where = placeFull(pc)
  }
  const day = Math.floor(now / 24) === 3 ? 'Today' : 'Tomorrow'

  return (
    <>
      <main className="screen d-screen s9-screen" ref={root}>
        <header className="roothead"><div><Mono>{dateTime(now)}</Mono><h1 className="t-h1">Bookings</h1></div></header>
        <div className="pad">
          {upcoming && (
            <>
              <div className="lbl"><b>Up next</b><Mono>{day}</Mono></div>
              <article className="bk" aria-label="Booking OR-10482">
                <div className="bk-h"><Mono>OR-10482 · Timah Cycles</Mono><Mono>Sat 25 Oct</Mono></div>
                <div className="bk-t"><b>Trek Marlin 7 · size {f.frame}</b><span className="small">For Coach Aisyah’s Saturday ride</span></div>
                <Mono className="board-k">{board.k}</Mono>
                <Board parts={board.parts} />
                <div className="bk-f">
                  <div className="proof9s">
                    <span className="th"><Photo src={proof} alt="A mechanic at Timah Cycles measures the Trek Marlin 7 on the stand" width={56} height={56} /></span>
                    <span><b>Set to your fit</b><span>Saddle {f.saddle} cm · frame {f.frame} · fork sag 25%</span><Mono>Timah Cycles · 24 Oct · 18:10</Mono></span>
                  </div>
                  <div className="where9"><LineIcon name="pin" /><span>{where}</span></div>
                  <p className="small bk-pay">S$50 paid by {payWith(s)} · S$150 deposit held{st === 'booked' && now < CANCEL_BY ? <> · free to cancel until {nb('24 Oct · 20:00')}</> : null}</p>
                  <button className="cta" type="button" onClick={action.run}>{action.label}</button>
                </div>
              </article>
            </>
          )}
          {closed && weekly && (
            <>
              <div className="lbl"><b>Up next</b><Mono>Weekly ride</Mono></div>
              <article className="bk" aria-label="Weekly ride, every Saturday">
                <div className="bk-h"><Mono>Timah Cycles · every Saturday</Mono><Mono>From 1 Nov</Mono></div>
                <div className="bk-t"><b>Trek Marlin 7 · size {f.frame}</b><span className="small">Set to your fit, each week</span></div>
                <Mono className="board-k is-wk">Next ride, Sat 1 Nov, in</Mono>
                <Board parts={cd(nextRideH(s))} />
                <WeekLine />
                <div className="bk-f">
                  <div className="where9"><LineIcon name="pin" /><span>Deliver {d}, collect {c} · {legsLine(s)}</span></div>
                  <button className="cta" type="button" onClick={() => go('13-weekly-ride')}>Open the weekly ride</button>
                </div>
              </article>
            </>
          )}
          {!upcoming && !(closed && weekly) && (
            <><div className="lbl"><b>Up next</b></div><p className="none9">Nothing booked.</p></>
          )}

          {weekly && !closed && (
            <>
              <div className="lbl"><b>Weekly ride</b><Mono>Set up</Mono></div>
              <button className="row9 wk" type="button" onClick={() => go('13-weekly-ride')}>
                <span className="th cream" aria-hidden="true"><span>SAT</span><span>SAT</span><span>SAT</span></span>
                <span><b>Every Saturday, from 1 Nov</b><span>Trek Marlin 7 · {d} to {c} · S$45 per ride · first ride in {firstIn}</span></span>
                <Chev />
              </button>
            </>
          )}
          {!weekly && st !== 'none' && (
            <>
              <div className="lbl"><b>Weekly ride</b><Mono>10% off each ride</Mono></div>
              <button className="row9 wk" type="button" onClick={() => go('13-weekly-ride')}>
                <span className="th cream" aria-hidden="true"><span>SAT</span><span>SAT</span><span>SAT</span></span>
                <span><b>{closed ? 'Ride the Marlin 7 every Saturday' : 'This bike, every Saturday'}</b><span>S$45 per ride instead of S$50 · from {nb('Sat 1 Nov')} · skip or pause any week</span></span>
                <Chev />
              </button>
            </>
          )}

          {s.storage.booked && (
            <>
              <div className="lbl"><b>Storage</b><Mono>Giant Escape 3</Mono></div>
              {!s.storage.hub && (
                <button className="row9" type="button" onClick={() => go('17-hub-pickup')}>
                  <span className="th g-dt" aria-hidden="true"><b>{pickDay(s)}</b><span>{wd(pickDay(s)).toUpperCase()}</span></span>
                  <span><b>To the OutRent Hub · {dayLong(pickDay(s))}</b><span>{s.storage.way === 'home' ? 'Door pickup · 17:00–19:00 · S$10' : 'Rack S drop-off · before 7:00 · S$5'}</span></span>
                  <Chev />
                </button>
              )}
              {s.storage.hub && (
                <button className="row9" type="button" onClick={() => go('15-equipment-detail')}>
                  <span className="th g-dt" aria-hidden="true"><b>{s.storage.ret === 'next' ? nextDayBack(s) % 31 || 31 : s.storage.ret ? poolBack(s) % 31 || 31 : pickDay(s)}</b><span>{s.storage.ret === 'next' ? wd(nextDayBack(s)).toUpperCase() : s.storage.ret ? wd(poolBack(s)).toUpperCase() : 'OCT'}</span></span>
                  <span><b>{s.storage.ret ? 'Coming home' : 'At the OutRent Hub'}</b><span>{s.storage.ret === 'next' ? `${dm(nextDayBack(s))} · 17:00–19:00 · S$8 · to Blk 325C` : s.storage.ret ? `${dayLong(poolBack(s))}, morning · shared run · free` : `Since ${dm(pickDay(s))} · S$18 / month`}</span></span>
                  <Chev />
                </button>
              )}
            </>
          )}

          {closed && (
            <>
              <div className="lbl"><b>Past</b><Mono>1 rental</Mono></div>
              <button className="row9" type="button" onClick={() => go('12-rental-summary')}>
                <span className="th"><Photo src={stand} alt="" width={52} height={52} /></span>
                <span><b>Trek Marlin 7 · 25 Oct</b><span><span className="ok">S$150 released</span> · S$50 paid · closed {nb(dateTime(releaseH(s)))}</span></span>
                <Chev />
              </button>
            </>
          )}
        </div>
      </main>
      <TabBar current="09-trips" onToast={toast} />
      {toastNode}
      {skip && (
        <TimeSkip from={now} to={trackH(s)} marks={[[72, 'SAT']]} caption={`Saturday morning. It leaves the shop at ${clockOf(leavesH(s))}.`}
          onDone={() => { set((x) => ({ ...x, now: Math.max(x.now, trackH(x)) })); navigate(routeFor('10-delivery-tracking'), { state: { how: 'skip' } }) }} />
      )}
    </>
  )
}
