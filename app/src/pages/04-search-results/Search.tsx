import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { GoTo, useBack } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import { BackButton, Mono, still, useToast } from '../../shell/direction'
import { routeFor } from '../../pages'
import m7 from '@photos/04-search-results/assets/04-direction-marlin-7.webp'
import m6 from '@photos/04-search-results/assets/04-direction-marlin-6.webp'
import scott from '@photos/04-search-results/assets/04-direction-scott-aspect-950.webp'
import './search.css'

// 04 Search results · the fitter's line. Each result is one object: photo, price, and its own time scale
// against the 8:00 start. Source: the Creative Director's prototype "OutRent · direction" (#04), approved 25 Oct 00:25.

type Result = { id: string; src: string; alt: string; name: string; price: string; who: string; rating: string; reviews: string; at: number; fits: boolean; open?: boolean }
const RESULTS: Result[] = [
  { id: 'm7', src: m7, alt: 'This Trek Marlin 7 on the Timah Cycles stand', name: 'Trek Marlin 7 · M', price: 'S$50', who: 'Timah Cycles · shop', rating: '4.9', reviews: '23', at: 7 + 40 / 60, fits: true, open: true },
  { id: 'm6', src: m6, alt: 'This Trek Marlin 6 at Rodalink', name: 'Trek Marlin 6 · M', price: 'S$46', who: 'Rodalink · shop', rating: '4.7', reviews: '58', at: 7 + 40 / 60, fits: true },
  { id: 'scott', src: scott, alt: 'This Scott Aspect 950 at the owner’s void deck', name: 'Scott Aspect 950 · M', price: 'S$45', who: 'Marcus T. · owner', rating: '4.6', reviews: '9', at: 8.5, fits: false },
]

export default function Search() {
  const navigate = useNavigate()
  const back = useBack(() => navigate(routeFor('01-home')))
  const [toastNode, toast] = useToast()
  const list = useRef<HTMLDivElement>(null)

  // Results rise in; each arrival marker slides along its scale from 7:00 to its time.
  useLayoutEffect(() => {
    if (still() || !list.current) return
    // fromTo and revert, so a second run (React StrictMode) starts from the real end state, not a half-hidden one.
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.fromTo(list.current!.querySelectorAll('.res'), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }, 0.1)
      list.current!.querySelectorAll<SVGCircleElement>('.dotm').forEach((d, i) => {
        tl.fromTo(d, { attr: { cx: 2 } }, { attr: { cx: Number(d.getAttribute('cx')) }, duration: 0.8, ease: 'power3.out' }, 0.35 + i * 0.12)
      })
    })
    return () => ctx.revert()
  }, [])

  // 04 -> 05: the result's photo grows into the listing's photo strip (05 runs it from this rectangle).
  const open = (el: HTMLElement) => {
    const ph = el.querySelector('.ph')?.getBoundingClientRect()
    const frame = el.closest('.frame')?.getBoundingClientRect()
    const rect = ph && frame ? { top: ph.top - frame.top, left: ph.left - frame.left, width: ph.width, height: ph.height } : null
    navigate(routeFor('05-listing-detail'), { state: { from: 'search', rect } })
  }

  return (
    <>
      <main className="screen d-screen s4-screen">
        <div className="bar-top">
          <BackButton label="Back" onClick={back} />
          <Mono className="mid">Search</Mono>
          <span />
        </div>
        <div className="pad">
          <button type="button" className="query" onClick={() => toast('Editing the search is not in this demo yet.')}>
            <Icon name="magnifying-glass" small />
            <span className="q">Hardtail M · Chestnut · Sat 25 Oct</span>
            <span className="e">Edit</span>
          </button>
          <div className="s4-head">
            <h1 className="t-h1">3 hardtails for Saturday</h1>
            <p className="lede">All-in prices: the bike, delivery and collection.</p>
          </div>
          <div className="results" ref={list}>
            {RESULTS.map((r) => {
              const body = <>
                <span className="ph"><Photo src={r.src} alt={r.alt} width={353} height={177} first={r.id === 'm7'} /></span>
                <span className="body">
                  <span className="top">
                    <b>{r.name}</b>
                    <span className="pr">{r.price}</span>
                    <span className="sub">{r.who} · <b>{r.rating}</b> ({r.reviews})</span>
                    <span className="al">all-in</span>
                  </span>
                  <Ruler at={r.at} />
                  <span className={`fit${r.fits ? '' : ' no'}`}>
                    <Icon name={r.fits ? 'check' : 'x'} small />
                    {r.fits ? 'Set to your fit before delivery' : 'No set-up for your fit'}
                  </span>
                </span>
              </>
              // The listing that exists is a real link (opens in a new tab too); a plain click runs the photo morph.
              return r.open
                ? <GoTo key={r.id} page="05-listing-detail" className="res" onClick={(e) => { e.preventDefault(); open(e.currentTarget) }}>{body}</GoTo>
                : <button key={r.id} type="button" className={`res${r.fits ? '' : ' dim'}`} onClick={() => toast('Only the Trek Marlin 7 listing is in this demo.')}>{body}</button>
            })}
          </div>
        </div>
      </main>
      {toastNode}
    </>
  )
}

// Each result's own scale, 7:00-9:00: the 8:00 start and when this bike reaches the trailhead.
function Ruler({ at }: { at: number }) {
  const box = useRef<HTMLSpanElement>(null)
  const [W, setW] = useState(321)
  useLayoutEffect(() => { if (box.current?.clientWidth) setW(box.current.clientWidth) }, [])
  const x = (t: number) => 2 + ((t - 7) / 2) * (W - 4)
  const ok = at < 8
  const label = ok ? `ARRIVES ${Math.abs(at - (7 + 40 / 60)) < 0.01 ? '7:40' : ''} · BEFORE THE 8:00 START` : 'ARRIVES 8:30 · AFTER THE 8:00 START'
  const ticks = []
  for (let t = 7; t <= 9.001; t += 0.25) ticks.push(<line key={t} x1={x(t)} x2={x(t)} y1={Math.abs(t % 1) < 0.01 ? 18 : 21} y2={24} className="tk" />)
  return (
    <span className="ruler" ref={box}>
      <svg viewBox={`0 0 ${W} 40`} aria-hidden="true">
        <line x1={x(7)} x2={x(9)} y1={24} y2={24} className="base" />
        {ticks}
        <rect x={x(8)} y={22.5} width={x(9) - x(8)} height={3} rx={1.5} className="ride" />
        <circle className={`dotm${ok ? ' is-ok' : ''}`} cx={x(at)} cy={24} r={5} />
        <text className={ok ? 'on' : undefined} x={0} y={9}>{label}</text>
        <text x={x(7)} y={38}>7:00</text>
        <text x={x(8)} y={38} textAnchor="middle">8:00</text>
        <text x={x(9)} y={38} textAnchor="end">9:00</text>
      </svg>
      <span className="sr-only">{ok ? `Arrives ${at === 7 + 40 / 60 ? '7:40' : ''}, before the 8:00 start` : 'Arrives 8:30, after the 8:00 start'}</span>
    </span>
  )
}
