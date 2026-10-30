import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useBack } from '../../shell/Link'
import { lock } from '../../shell/PageFrame'
import { BackButton, IC_PATHS, LineIcon, Mono, TimeSkip, haptic, still } from '../../shell/direction'
import { routeFor } from '../../pages'
import { clockOf, offRouteNow, set, setClock, useStore, type StoreWay } from '../../shell/store'
import { DOOR_DAYS, RACK_DAYS, dayLong, dm, hubNow, intakeAt, pickDay, wd } from '../../shell/storage'
import './pickup.css'

// 17 Hub pickup · the fitter's line. Choose first: door pickup (S$10, daily 17:00–19:00) or Rack S (S$5, leave it
// before 7:00, shared courier run 7:00–10:00 Tue and Fri). The pickup day is a choice (PO-ANSWERS v1.8: door any day
// Sat 25 – Fri 31 Oct, Rack S on Tue 28 or Fri 31; Tue 28 is the seeded one). A 24-hour dial shows when the courier comes;
// booking sends a bike token round the chosen window and the centre reads "Pickup booked". The booking is kept in
// the story state; "See it at the Hub" skips the clock to the morning after the intake (Wed 29 Oct 10:00 for Tue 28).
// Source: the Creative Director's prototype v52 (#17).

type Way = Exclude<StoreWay, ''>
const C = 140, R = 92
const ang = (h: number) => (h / 24) * Math.PI * 2 - Math.PI / 2
const pt = (h: number, r = R): [number, number] => [C + r * Math.cos(ang(h)), C + r * Math.sin(ang(h))]
const arc = (h1: number, h2: number, r = R) => { const [x1, y1] = pt(h1, r), [x2, y2] = pt(h2, r); return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${h2 - h1 > 12 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}` }
const WIN: Record<Way, [number, number]> = { home: [17, 19], rack: [7, 10] }
const T: Record<Way, { time: string; price: string; cta: string; centre: string; at: string; k: string; dd: string }> = {
  home: { time: '17:00–19:00', price: 'S$10', cta: 'Book door pickup · S$10', centre: 'Courier at your door', at: 'Courier at your door · S$10', k: 'Pickup', dd: 'At your door, Blk 325C Sengkang East Way #11-42' },
  rack: { time: '7:00–10:00', price: 'S$5', cta: 'Book rack drop-off · S$5', centre: 'Courier at Rack S', at: 'Courier at Rack S · S$5', k: 'Leave it', dd: 'At Rack S, Blk 325C void deck, before 7:00' },
}
const SKIP_MARKS: [number, string][] = [[72, 'SAT'], [96, 'SUN'], [120, 'MON'], [144, 'TUE'], [168, 'WED'], [192, 'THU'], [216, 'FRI'], [240, 'SAT']]

export default function Pickup() {
  const navigate = useNavigate()
  const back = useBack(() => navigate(routeFor('16-storage-options')))
  const root = useRef<HTMLElement>(null)
  const s = useStore((x) => x)
  const st = s.storage
  const now = offRouteNow(s)
  const [pick, setPick] = useState<Way | ''>(st.way || '')
  const [day, setDay] = useState(pickDay(s))
  const HUB = hubNow({ ...s, storage: { ...st, day } })
  const booked = st.booked && !!st.way
  const path = (booked ? st.way : pick) as Way | ''
  const [rolling, setRolling] = useState(false)   // the token is on its way round; the centre still shows the choice
  const [skipping, setSkipping] = useState(false)
  const tok = useRef<SVGGElement>(null)
  const go = useRef<HTMLButtonElement>(null)
  const card = useRef<HTMLDivElement>(null)

  useEffect(() => { setClock(clockOf(now)) }, [now])

  useLayoutEffect(() => {
    if (still() || !root.current || booked) return
    const ctx = gsap.context(() => {
      // fromTo, not from: the options fade their opacity in CSS, and a from() would read a half-run value as the end
      gsap.fromTo('.w17', { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.15, delay: 0.3, clearProps: 'opacity' })
      gsap.fromTo('.dsvg17 line', { opacity: 0 }, { opacity: 1, duration: 0.02, stagger: 0.015, delay: 0.1, clearProps: 'opacity' })
      gsap.fromTo('.opt', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.07, delay: 0.35, clearProps: 'opacity,transform' })
    }, root)
    return () => ctx.revert()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (w: Way) => {
    if (booked) return
    setPick(w); haptic()
    if (w === 'rack' && !RACK_DAYS.includes(day)) setDay(28)
    if (still()) return
    requestAnimationFrame(() => {
      const a = root.current?.querySelector<SVGPathElement>(w === 'home' ? '.a-eve' : '.a-run')
      if (a) { const L = a.getTotalLength(); gsap.fromTo(a, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }) }
      gsap.fromTo('.dc b', { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 })
    })
  }

  const book = () => {
    if (!pick) return
    if (booked) {
      // after the intake the clock has already moved on: open 15 at the Hub without running the days again
      if (st.hub) navigate(routeFor('15-equipment-detail'))
      else setSkipping(true)
      return
    }
    haptic(); lock(go.current)
    set((x) => ({ ...x, storage: { ...x.storage, way: pick, booked: true, day } }))
    if (still()) { requestAnimationFrame(() => card.current && centerIn(card.current)); return }
    // the bike token rides the chosen window on the dial, then the centre reads booked
    setRolling(true)
    requestAnimationFrame(() => {
      const a = root.current?.querySelector<SVGPathElement>(pick === 'home' ? '.a-eve' : '.a-run'), t = tok.current
      if (!a || !t) { setRolling(false); return }
      const L = a.getTotalLength(), o = { k: 0 }
      gsap.to(o, { k: 1, duration: 1.1, ease: 'power2.inOut', onUpdate: () => { const p = a.getPointAtLength(L * o.k); t.setAttribute('transform', `translate(${p.x} ${p.y})`) }, onComplete: () => setRolling(false) })
      if (card.current) gsap.from(card.current, { opacity: 0, y: 14, duration: 0.5, delay: 0.9, ease: 'back.out(1.4)' })
      window.setTimeout(() => card.current && centerIn(card.current), 1100)
    })
  }

  const t = path ? T[path] : null
  const end = path ? pt(WIN[path][rolling ? 0 : 1]) : [0, 0]
  const showBooked = booked && !rolling
  const [by1, by2] = [pt(7, R - 10), pt(7, R + 22)], [dx, dy] = pt(6.6, R + 26)
  const [rx, ry] = pt(8.8, R + 26), [ex, ey] = pt(18, R + 24)

  return (
    <>
      <main className="screen d-screen s17-screen" ref={root}>
        <div className="bar-top">
          <BackButton label="Back to storage" onClick={back} />
          <Mono className="mid">Hub pickup</Mono>
          <span />
        </div>
        <div className="pad">
          <h1 className="t-h1">Arrange the pickup</h1>
          <p className="lede s17-lede">A courier takes the Giant Escape 3 to the OutRent Hub. Choose where it is picked up.</p>
          <div className="paths" role="group" aria-label="Where it is picked up">
            <button type="button" className={`opt${booked && path !== 'home' ? ' is-off' : ''}`} aria-pressed={path === 'home'} onClick={() => choose('home')}>
              <span className="rad" /><b>Door pickup</b><span className="pr">S$10</span>
              <span className="s">The courier comes up to Blk 325C Sengkang East Way #11-42. Daily, 17:00–19:00 only.</span>
            </button>
            <button type="button" className={`opt${booked && path !== 'rack' ? ' is-off' : ''}`} aria-pressed={path === 'rack'} onClick={() => choose('rack')}>
              <span className="rad" /><b>Rack drop-off · Rack S</b><span className="pr">S$5</span>
              <span className="s">Leave it at the Blk 325C void deck rack, 60 m from home, before 7:00. The shared courier run collects it 7:00–10:00, Tue and Fri.</span>
            </button>
          </div>

          {path && (
            <div className="days17" role="group" aria-label="Pickup day">
              {(path === 'home' ? DOOR_DAYS : RACK_DAYS).map((d) => (
                <button key={d} type="button" className="d17" aria-pressed={day === d} disabled={booked && day !== d} aria-label={`Pickup on ${dayLong(d)}`}
                  onClick={() => { if (!booked) { setDay(d); haptic() } }}><span>{wd(d).toUpperCase()}</span><b>{d}</b></button>
              ))}
            </div>
          )}
          <div className={`dial17${booked ? ' booked' : ''}`} data-path={path || undefined}>
            <svg className="dsvg17" viewBox="0 0 280 280" aria-hidden="true">
              <circle className="d-ring" cx={C} cy={C} r={R} />
              {Array.from({ length: 24 }, (_, h) => { const [a, b] = [pt(h, R + 12), pt(h, R + (h % 6 ? 16 : 20))]; return <line key={h} className={h % 6 ? 'd-tk' : 'd-tk maj'} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} /> })}
              {([[0, '0:00'], [12, '12:00']] as [number, string][]).map(([h, l]) => { const [x, y] = pt(h, R + 32); return <text key={l} x={x} y={y + 3.5} textAnchor="middle" className="hl">{l}</text> })}
              <path className="w17 a-run" d={arc(7, 10)} />
              <path className="w17 a-eve" d={arc(17, 19)} />
              <g className="by7" opacity={path === 'rack' ? 1 : 0}><line x1={by1[0]} y1={by1[1]} x2={by2[0]} y2={by2[1]} /><text x={dx + 2} y={dy} textAnchor="start" className="wl">DROP BY 7:00</text></g>
              <text x={rx} y={ry + 6} textAnchor="start" className="wl l-run">7:00–10:00</text>
              <text x={ex} y={ey + 3} textAnchor="end" className="wl l-eve">17:00–19:00</text>
              <g ref={tok} className="tok17" opacity={booked ? 1 : 0} transform={booked ? `translate(${end[0]} ${end[1]})` : undefined}>
                <circle r={11} />
                <g transform="translate(-7 -7) scale(.58)" dangerouslySetInnerHTML={{ __html: IC_PATHS.bike }} />
              </g>
            </svg>
            <div className="dc" aria-live="polite">
              <Mono>{showBooked ? 'Pickup booked' : t ? dayLong(day) : 'Pickup day'}</Mono>
              <b>{showBooked && t ? <>{dm(day)}<br />{t.time}</> : t ? t.time : dayLong(day)}</b>
              <span>{showBooked && t ? t.centre : t ? t.at : 'Choose door or rack to see the time'}</span>
            </div>
          </div>

          <section className="back17 there17">
            <div className="k"><b>Getting it there</b><Mono>Your choice above</Mono></div>
            <div className="kv"><b>{path === 'home' ? 'Door pickup' : path === 'rack' ? 'Rack drop-off · Rack S' : 'Door or rack'}</b><span className="v">{t?.price ?? '—'}</span><span className="s">Then S$18 / month storage from the day it arrives.</span></div>
          </section>
          <section className="back17">
            <div className="k"><b>Getting it back</b><Mono>Pick when you want it</Mono></div>
            <div className="kv"><b>Shared courier run</b><span className="v">Free</span><span className="s">With 2 days’ notice</span></div>
            <div className="kv"><b>Next day, to your door</b><span className="v">S$8</span></div>
          </section>
          {booked && t && (
            <div className="booked17" ref={card} role="status">
              <span className="mono bk-k"><LineIcon name="check" />Pickup booked</span>
              <b className="bk-t">{dayLong(day)} · {t.time}</b>
              <dl className="bk-rows">
                <div><dt>{t.k}</dt><dd>{t.dd}</dd></div>
                <div><dt>Goes to</dt><dd>OutRent Hub, Sungei Kadut</dd></div>
                <div><dt>Cost</dt><dd>{t.price} now · then S$18 / month</dd></div>
              </dl>
            </div>
          )}
        </div>
      </main>
      <div className="dock">
        <button type="button" ref={go} className="cta s17-go" disabled={!path} onClick={book}>
          {booked ? (st.hub ? 'See it at the Hub' : `See it at the Hub · ${dm(day + 1)}`) : t ? t.cta : 'Choose door or rack'}
        </button>
      </div>
      {skipping && (
        <TimeSkip from={now} to={HUB} marks={SKIP_MARKS} caption={`The Giant Escape 3 is checked in at the Hub on ${intakeAt(s).replace(' · ', ' at ')}.`}
          onDone={() => {
            set((x) => ({ ...x, now: Math.max(x.now, HUB), storage: { ...x.storage, hub: true } }))
            navigate(routeFor('15-equipment-detail'), { replace: true, state: { how: 'skip', back: '14-my-equipment' } })
          }} />
      )}
    </>
  )
}

function centerIn(el: HTMLElement) {
  const sc = el.closest<HTMLElement>('.screen'); if (!sc) return
  const r = el.getBoundingClientRect(), b = sc.getBoundingClientRect()
  sc.scrollTo({ top: sc.scrollTop + (r.top + r.height / 2) - (b.top + b.height / 2), behavior: still() ? 'auto' : 'smooth' })
}
