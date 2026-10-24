import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { GoTo, useBack } from '../../shell/Link'
import { BackButton, Mono, haptic, still, useToast } from '../../shell/direction'
import { routeFor } from '../../pages'
import './tracking.css'

// 10 Delivery tracking · the fitter's line. A map with the van as the moving pin, the details in a drawer.
// The clock runs 7:22 -> 7:40 while the van rides the route; the map leans in as it arrives.
// Source: the Creative Director's prototype "OutRent · direction" (#10, v20), approved 25 Oct 02:22.

const ROUTE = 'M266 470 C 268 420, 270 400, 268 360 C 266 300, 252 240, 244 190 C 240 160, 238 130, 236 110 C 210 110, 190 104, 170 96'
const UBT = 'M262 560 C 262 470, 270 420, 268 360 C 266 300, 252 240, 244 190 C 238 150, 236 110, 230 70 C 226 40, 226 20, 228 -10'
let arrived = false // the van stays arrived if Daniel comes back to this page

export default function Tracking() {
  const navigate = useNavigate()
  const back = useBack(() => navigate(routeFor('08-booking-confirmation')))
  const [toastNode, toast] = useToast()
  const [here, setHere] = useState(arrived)
  const [left, setLeft] = useState(arrived ? 0 : 18)
  const screen = useRef<HTMLElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const map = useRef<SVGSVGElement>(null)
  const route = useRef<SVGPathElement>(null)
  const pin = useRef<SVGGElement>(null)
  const go = useRef<HTMLAnchorElement>(null)

  useLayoutEffect(() => {
    const r = route.current, p = pin.current, m = map.current, sh = sheet.current, sc = screen.current
    if (!r || !p || !m || !sh || !sc) return
    // The map fills the space above the drawer.
    sc.style.setProperty('--sh10', (sh.offsetHeight - 26) + 'px')
    const L = r.getTotalLength()
    r.style.strokeDasharray = String(L)
    // minutes past 7:00; the route runs from the shop (7:05) to the sign (7:40)
    const set = (min: number) => {
      const k = Math.min(1, Math.max(0, (min - 5) / 35)), pt = r.getPointAtLength(L * k)
      r.style.strokeDashoffset = String(L * (1 - k))
      p.setAttribute('transform', `translate(${pt.x} ${pt.y})`)
      m.style.transform = `scale(${(1 + k * 0.12).toFixed(3)})`
      m.style.transformOrigin = `${((pt.x / 393) * 100).toFixed(1)}% ${((pt.y / 560) * 100).toFixed(1)}%`
      setLeft(Math.max(0, Math.round(40 - min)))
    }
    const arrive = (animate: boolean) => {
      arrived = true
      setHere(true)
      haptic()
      if (animate && !still()) {
        if (go.current) gsap.fromTo(go.current, { scale: 0.96 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1,.4)' })
        gsap.fromTo(p.querySelector('.van'), { y: -3 }, { y: 0, duration: 0.9, ease: 'bounce.out' })
      }
    }
    if (arrived || still()) { set(40); arrive(false); return }
    set(22)
    const o = { m: 22 }
    const t = gsap.to(o, { m: 40, duration: 7, delay: 0.8, ease: 'none', onUpdate: () => set(o.m), onComplete: () => arrive(true) })
    return () => { t.kill() }
  }, [])

  return (
    <>
      <main className={`screen s10-screen${here ? ' here' : ''}`} ref={screen}>
        <div className="mapwrap">
          <svg className="map10" ref={map} viewBox="0 0 393 560" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map from Timah Cycles in Bukit Timah to the Chestnut trailhead carpark">
            <rect width="393" height="560" className="m-ground" />
            <g className="m-block">
              <rect x="236" y="410" width="60" height="38" rx="4" /><rect x="300" y="420" width="70" height="44" rx="4" /><rect x="250" y="456" width="44" height="60" rx="4" />
              <rect x="300" y="472" width="56" height="40" rx="4" /><rect x="214" y="472" width="30" height="46" rx="4" /><rect x="300" y="300" width="60" height="44" rx="4" />
              <rect x="306" y="350" width="50" height="40" rx="4" />
            </g>
            <path className="m-park" d="M-10 250 C 40 200, 60 140, 120 120 C 170 100, 210 130, 228 180 C 244 228, 214 300, 170 330 C 120 360, 40 340, -10 320 Z" />
            <path className="m-park-2" d="M60 0 L 250 0 C 262 30, 250 70, 214 86 C 170 104, 104 92, 72 60 C 52 40, 50 18, 60 0 Z" />
            <g className="m-tree">
              {[[90, 230, 3], [120, 190, 2.5], [160, 260, 3], [70, 290, 2.5], [190, 210, 2.5], [140, 300, 3], [110, 40, 3], [160, 62, 2.5], [200, 34, 3], [130, 74, 2.5]].map(([x, y, rr]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={rr} />)}
            </g>
            <g className="m-roads">
              <path className="cas" d="M40 560 L 70 0" strokeWidth="16" /><path className="rd" d="M40 560 L 70 0" strokeWidth="12" />
              <path className="cas" d={UBT} strokeWidth="13" /><path className="rd" d={UBT} strokeWidth="9" />
              <path className="cas" d="M268 360 C 300 350, 340 352, 400 344" strokeWidth="10" /><path className="rd" d="M268 360 C 300 350, 340 352, 400 344" strokeWidth="6" />
              <path className="cas" d="M236 110 C 210 110, 190 104, 170 96" strokeWidth="10" /><path className="rd" d="M236 110 C 210 110, 190 104, 170 96" strokeWidth="6" />
              <path className="pathway" d="M170 96 C 150 82, 130 66, 120 48" strokeWidth="2" />
            </g>
            <path className="route-todo" d={ROUTE} />
            <path className="route-on" d={ROUTE} ref={route} />
            <g className="maplab">
              <text x="282" y="250" transform="rotate(-80 282 250)">UPPER BUKIT TIMAH RD</text>
              <text x="46" y="470" transform="rotate(-87 46 470)">BKE</text>
              <text x="88" y="250">BUKIT TIMAH</text><text x="88" y="262">NATURE RESERVE</text>
              <text x="96" y="22">CHESTNUT NATURE PARK</text><text x="186" y="128">CHESTNUT AVE</text>
            </g>
            <g className="pin-shop" transform="translate(266 470)"><rect x="-7" y="-7" width="14" height="14" rx="3" /><text x="12" y="4">TIMAH CYCLES</text></g>
            <g className="pin-end" transform="translate(170 96)"><circle r="16" className="glow" /><circle r="7" className="dot" /><circle r="2.5" className="eye" /><text x="-14" y="22" textAnchor="end">PARK ENTRANCE SIGN</text></g>
            <g className="north" transform="translate(360 40)"><circle r="14" /><path d="M0 -8 L4 4 L0 1 L-4 4 Z" /><text y="24" textAnchor="middle">N</text></g>
            <g className="tagpin" ref={pin}>
              <circle className="halo" r="20" />
              <circle className="body" r="13" />
              <g className="van"><Van /></g>
            </g>
          </svg>
        </div>
        <div className="bar-top s10-bar">
          <BackButton label="Back" onClick={back} onPhoto />
          <span /><span />
        </div>
        <div className="sheet10" ref={sheet}>
          <span className="grab07" aria-hidden="true" />
          <div className="eta2" aria-live="polite">
            <div><Mono>{here ? 'At the park entrance sign' : 'Arriving · park entrance sign'}</Mono><b className="num">7:40</b></div>
            <span className="in">{left > 0 ? `in ${left} min` : 'here now'}</span>
          </div>
          <div className="prog">
            <i className="pf" style={{ width: here ? '100%' : '66.6%' }} />
            <span className="p done" style={{ left: '0%' }}><i /><b>Set to fit</b></span>
            <span className="p done" style={{ left: '33.3%' }}><i /><b>Left shop</b></span>
            <span className={`p ${here ? 'done' : 'now'}`} style={{ left: '66.6%' }}><i /><b>On the way</b></span>
            <span className={`p${here ? ' done' : ''}`} style={{ left: '100%' }}><i /><b>There</b></span>
          </div>
          <div className="courier">
            <span className="cav" aria-hidden="true"><svg viewBox="-10 -10 20 20"><Van tone="mint" /></svg></span>
            <span><b>Timah Cycles’ courier</b><span>{here ? 'Waiting by the sign with your bike' : 'Bringing your bike to the sign'}</span></span>
            <button type="button" className="chat10" aria-label="Message the courier" onClick={() => toast('Messaging the courier is not in this demo yet.')}>
              <svg viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M128 24a104 104 0 0 0-91.8 152.9l-11.4 34a16 16 0 0 0 20.3 20.3l34-11.4A104 104 0 1 0 128 24Zm0 192a87.9 87.9 0 0 1-44.1-11.8 8 8 0 0 0-6.5-.7L40 216l12.5-37.4a8 8 0 0 0-.7-6.5A88 88 0 1 1 128 216Z" /></svg>
            </button>
          </div>
          <div className="fitrow">
            <span className="th"><span className="todo"><Mono>Image to come</Mono><span className="w">Set-up proof</span></span></span>
            <span><b>Set to your fit · <span className="nb">24 Oct · 18:10</span></b><span>Saddle 72&nbsp;cm · frame M · fork 25%</span></span>
          </div>
          {here
            ? <GoTo page="11-handover-check" className="cta s10-go" ref={go}>Start the hand-over check</GoTo>
            : <button type="button" className="cta s10-go" disabled>Waiting for the bike</button>}
        </div>
      </main>
      {toastNode}
    </>
  )
}

// The courier's van, drawn in the map's own small strokes: white on the forest pin, forest on the mint avatar.
function Van({ tone }: { tone?: 'mint' }) {
  return (
    <g className={`van-shape${tone ? ' is-mint' : ''}`}>
      <path d="M-7 -4 h8 v8 h-8 z M1 -1 h3.5 l2.5 3 v2 h-6 z" />
      <circle cx="-4" cy="5" r="1.8" /><circle cx="4" cy="5" r="1.8" />
    </g>
  )
}
