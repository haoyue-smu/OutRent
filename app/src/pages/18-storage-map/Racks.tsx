import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useBack } from '../../shell/Link'
import { lock } from '../../shell/PageFrame'
import { BackButton, LineIcon, Mono, haptic, still, useToast } from '../../shell/direction'
import { routeFor } from '../../pages'
import { set, setClock, useStore } from '../../shell/store'
import './racks.css'

// 18 Public racks · the fitter's line. The rain day (VS-5): Sat 25 Oct, rain, the ride ended at 11:05 far from
// the 13:30 trailhead collection. Rack A, 200 m away, is full; Rack C, 650 m, has 4 of 10 free. Choosing C draws
// the way there and holds a spot; Daniel rides it in the rain (11:05 -> 11:20) and leaves the Marlin 7 for Hafiz.
// Source: the Creative Director's prototype v52 (#18). Out of the demo scope (Haoyue 25 Oct 10:26), built last.
// Leaving it at Rack C is kept in the story state (rackLeft); the rack counts and times are the prototype's.

const RAIN = Array.from({ length: 46 }, (_, i) => ({
  left: `${((i * 37) % 120) - 5}%`, animationDuration: `${(0.7 + (i % 7) * 0.09).toFixed(2)}s`,
  animationDelay: `-${((i * 13) % 10) / 10}s`, opacity: 0.4 + (i % 5) * 0.12,
}))

export default function Racks() {
  const navigate = useNavigate()
  const back = useBack(() => navigate(routeFor('14-my-equipment')))
  const [toastNode, toast] = useToast()
  const left = useStore((x) => x.rackLeft)
  const [chosen, setChosen] = useState(left)
  const [riding, setRiding] = useState(false)
  const [clock, setClk] = useState(left ? '11:20' : '11:05')
  const root = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const route = useRef<SVGPathElement>(null)
  const you = useRef<SVGGElement>(null)
  const go = useRef<HTMLButtonElement>(null)
  const [sh, setSh] = useState(360)
  const done = left && !riding

  useEffect(() => { setClock(clock) }, [clock])

  // The map ends where the sheet begins, whatever the sheet holds.
  useLayoutEffect(() => { if (sheet.current) setSh(sheet.current.offsetHeight - 26) }, [chosen, done])

  // Arriving, the racks drop onto the map and the list rises.
  useLayoutEffect(() => {
    if (still() || !root.current || left) return
    const ctx = gsap.context(() => {
      gsap.from('.rk', { scale: 0, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.15, delay: 0.3, ease: 'back.out(2)' })
      gsap.from('.rkc', { opacity: 0, y: 10, duration: 0.35, stagger: 0.08, delay: 0.2 })
    }, root)
    return () => ctx.revert()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Where "you" stands once the Marlin 7 is at the rack: nine tenths of the way, by the badge.
  useLayoutEffect(() => {
    const r = route.current, y = you.current
    if (!left || riding || !r || !y) return
    const p = r.getPointAtLength(r.getTotalLength() * 0.9)
    y.setAttribute('transform', `translate(${p.x} ${p.y})`)
  }, [left, riding])

  const choose = (k: 'A' | 'C') => {
    if (riding || left) return
    if (k === 'A') {
      toast('Rack A is full: 12 of 12, updated 25 Oct · 10:50.')
      if (!still() && root.current) gsap.fromTo(root.current.querySelectorAll('.rkc.full, .rk-a .badge'), { x: -5 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.4,.3)' })
      return
    }
    if (chosen) return
    setChosen(true); haptic()
    requestAnimationFrame(() => {
      if (still() || !route.current || !root.current) return
      const L = route.current.getTotalLength()
      gsap.fromTo(route.current, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1, ease: 'power2.out' })
      gsap.from(root.current.querySelectorAll('.terms-pane > *'), { opacity: 0, y: 8, duration: 0.35, stagger: 0.06 })
    })
  }

  const ride = () => {
    if (done) { back(); return }
    if (!chosen || riding) return
    lock(go.current)
    const r = route.current, y = you.current
    const fin = () => {
      set({ rackLeft: true }); setRiding(false); setClk('11:20'); haptic()
      requestAnimationFrame(() => { if (!still() && root.current) gsap.from(root.current.querySelectorAll('.st18 > *'), { opacity: 0, y: 8, duration: 0.35, stagger: 0.07 }) })
    }
    if (still() || !r || !y) { fin(); return }
    // Daniel rides the 650 m in the rain; the clock runs 11:05 -> 11:20; the bike is left at the rack
    setRiding(true)
    const L = r.getTotalLength(), o = { k: 0 }
    gsap.to(o, {
      k: 1, duration: 2.4, ease: 'power1.inOut',
      onUpdate: () => { const p = r.getPointAtLength(L * 0.9 * o.k); y.setAttribute('transform', `translate(${p.x} ${p.y})`); setClk(`11:${String(5 + Math.round(o.k * 15)).padStart(2, '0')}`) },
      onComplete: fin,
    })
  }

  const label = done ? 'Back to My gear' : riding ? 'Riding to Rack C…' : chosen ? 'Hold a spot at Rack C' : 'Choose a rack'

  return (
    <div className="s18" ref={root} style={{ ['--sh18' as string]: `${sh}px` }}>
      <div className="mapwrap18">
        <svg className="map18" viewBox="0 0 393 560" preserveAspectRatio="xMidYMid slice" role="img"
          aria-label="Map of the Zhenghua Park side: you, Rack A 200 m away and full, Rack C 650 m away with 4 of 10 free">
          <rect className="m-ground" width="393" height="560" />
          <path className="m-park" d="M-10 330 C 60 300, 120 330, 150 380 C 180 430, 160 500, 120 570 L -10 570 Z" />
          <path className="m-park" d="M250 -10 C 260 40, 300 80, 400 90 L 400 -10 Z" />
          <g className="m-block"><rect x="200" y="140" width="56" height="40" rx="4" /><rect x="264" y="146" width="48" height="52" rx="4" /><rect x="320" y="150" width="60" height="40" rx="4" /><rect x="214" y="196" width="40" height="44" rx="4" /><rect x="270" y="214" width="66" height="36" rx="4" /><rect x="40" y="150" width="70" height="44" rx="4" /><rect x="118" y="160" width="46" height="60" rx="4" /><rect x="50" y="210" width="56" height="40" rx="4" /></g>
          <g className="m-roads">
            <path className="cas" strokeWidth="16" d="M-10 290 C 120 280, 260 270, 400 262" /><path className="rd" strokeWidth="12" d="M-10 290 C 120 280, 260 270, 400 262" />
            <path className="cas" strokeWidth="12" d="M184 570 C 184 460, 180 380, 186 290 C 190 220, 186 120, 196 -10" /><path className="rd" strokeWidth="8" d="M184 570 C 184 460, 180 380, 186 290 C 190 220, 186 120, 196 -10" />
            <path className="cas" strokeWidth="9" d="M186 200 C 240 196, 300 120, 340 70" /><path className="rd" strokeWidth="5" d="M186 200 C 240 196, 300 120, 340 70" />
          </g>
          <path ref={route} className="route18" opacity={chosen ? 1 : 0} d="M150 392 C 170 360, 184 330, 186 292 C 188 250, 188 220, 186 200 C 205 198, 222 194, 244 184" />
          <text className="lab" x="44" y="300">BUKIT PANJANG RD</text>
          <text className="lab" x="196" y="470" transform="rotate(-90 196 470)">JELEBU RD</text>
          <text className="lab" x="250" y="132" transform="rotate(-48 250 132)">SEGAR RD</text>
          <text className="lab" x="44" y="420">ZHENGHUA PARK</text>
          <g className="rk rk-a" transform="translate(206 340)" onClick={() => choose('A')}>
            <circle className="ring18" r="22" />
            <g className="badge"><rect className="b-full" x="-28" y="-14" width="56" height="28" rx="14" /><text className="bl" x="-17" y="4.5">A</text><text className="bm" x="-6" y="4">FULL</text></g>
            <path className="stem" d="M0 14 v8" />
          </g>
          <g className={`rk rk-c${chosen ? ' sel' : ''}`} transform="translate(244 184)" onClick={() => choose('C')}>
            <circle className="ring18" r="24" />
            <g className="badge"><rect className="b-free" x="-32" y="-14" width="64" height="28" rx="14" /><text className="bl" x="-21" y="4.5">C</text><text className="bm" x="-9" y="4">{left && !riding ? '3 FREE' : '4 FREE'}</text></g>
          </g>
          <g ref={you} className="youdot" transform="translate(150 392)">
            <circle className="halo" r="20" /><circle className="dot" r="8" />
            <text x="14" y="4" className="lab you" style={{ opacity: done ? 0 : 1 }}>YOU · MARLIN 7</text>
          </g>
        </svg>
        <div className="rain" aria-hidden="true">{RAIN.map((r, i) => <i key={i} style={r} />)}</div>
      </div>
      <div className="bar-top s18-top">
        <BackButton label="Back to My gear" onClick={back} onPhoto />
        <span /><span />
      </div>
      <span className="pill18"><LineIcon name="rain" />Sat 25 Oct · rain · ride ended 11:05</span>

      <div className="sheet18" ref={sheet}>
        <span className="grab07" aria-hidden="true" />
        {!chosen && (
          <div>
            <div className="hd"><b>Return the Marlin 7 at a rack</b><Mono>OR-10482</Mono></div>
            <p className="small s18-far">Far from the 13:30 collection at the trailhead. Racks near you:</p>
            <div className="rk-list">
              <button type="button" className="rkc full" aria-pressed="false" onClick={() => choose('A')}><span className="lt">A</span><b>Zhenghua Park entrance</b><span className="cnt"><b>12 / 12 full</b><span>updated 25 Oct · 10:50</span></span><span className="s">200 m</span></button>
              <button type="button" className="rkc free" aria-pressed="false" onClick={() => choose('C')}><span className="lt">C</span><b>Segar Road</b><span className="cnt"><b>4 of 10 free</b><span>updated 25 Oct · 10:55</span></span><span className="s">650 m · choosing it holds a spot for 2 h</span></button>
            </div>
          </div>
        )}
        {chosen && !done && (
          <div className="terms-pane">
            <div className="hd"><b>Rack C · Segar Road</b><Mono>650 m</Mono></div>
            <div className="hold18"><span>Spot held for you until</span><b>13:20</b></div>
            <div className="terms18">
              <div><LineIcon name="check" /><span><b>No extra charge.</b> The S$12 delivery and collection already covers it.</span></div>
              <div><LineIcon name="check" /><span>It <b>replaces the 13:30 collection</b> at the trailhead.</span></div>
              <div><LineIcon name="check" /><span><b>Hafiz · Timah Cycles</b> collects it at 12:30 and checks it against the hand-over record.</span></div>
            </div>
          </div>
        )}
        {done && (
          <div role="status">
            <div className="st18"><Mono>25 Oct · 11:20</Mono><b>At Rack C, waiting for Hafiz</b><span>Collected 25 Oct · 12:30, checked there against your hand-over record. <s>13:30 trailhead collection</s> replaced.</span></div>
          </div>
        )}
        <button type="button" ref={go} className="cta s18-go" disabled={!chosen || riding} onClick={ride}>{label}</button>
      </div>
      {toastNode}
    </div>
  )
}
