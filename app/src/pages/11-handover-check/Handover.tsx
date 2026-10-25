import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useBack } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import { BackButton, Mono, TimeSkip, haptic, still, useToast } from '../../shell/direction'
import { routeFor } from '../../pages'
import { lock } from '../../shell/PageFrame'
import { SAT, collectAt, dateTime, deliverAt, set, setClock, useStore } from '../../shell/store'
import { collectH, deliverH, releaseH } from '../../shell/rental'
import sCrank from '@photos/11-handover-check/assets/11-direction-s-crank.webp'
import sSaddle from '@photos/11-handover-check/assets/11-direction-s-saddle.webp'
import sDrive from '@photos/11-handover-check/assets/11-direction-s-drive.webp'
import rCrank from '@photos/12-rental-summary/assets/12-direction-r-crank.webp'
import rSaddle from '@photos/12-rental-summary/assets/12-direction-r-saddle.webp'
import rDrive from '@photos/12-rental-summary/assets/12-direction-r-drive.webp'
import './handover.css'

// 11 Handover check · the fitter's line. One record card: the shop's photo and Daniel's, side by side, for the
// same three parts; on save each part is ticked and the record folds shut into a filed slip.
// Source: the Creative Director's prototype v52 (#11). Real state: the photos, marks and the saved record are
// kept in the story store (Back, re-entry and a reload show them); the record carries the delivery time.

type PartId = 'crank' | 'saddle' | 'drive'
type Part = { id: PartId; name: string; note: string; shop: string; mine: string; shopRing?: [number, number]; mineRing?: [number, number]; mark?: string; short: string }
const PARTS: Part[] = [
  { id: 'crank', name: 'Crank arm', note: 'Known scratch', shop: sCrank, mine: rCrank, shopRing: [57, 66], mineRing: [50, 61], mark: 'scratch', short: 'Crank arm · scratch' },
  { id: 'saddle', name: 'Saddle edge', note: 'Known scuff', shop: sSaddle, mine: rSaddle, shopRing: [28, 45], mineRing: [68, 50], mark: 'scuff', short: 'Saddle · scuff' },
  { id: 'drive', name: 'Drivetrain', note: 'Part most at risk', shop: sDrive, mine: rDrive, short: 'Drivetrain' },
]

export default function Handover() {
  const navigate = useNavigate()
  const back = useBack(() => navigate(routeFor('10-delivery-tracking')))
  const [toastNode, toast] = useToast()
  const s = useStore((x) => x)
  const rec = s.record
  const shots = rec.shots as PartId[], marks = rec.marks as PartId[], saved = rec.saved
  const [ticked, setTicked] = useState<PartId[]>(saved ? PARTS.map((p) => p.id) : [])
  const [showParts, setShowParts] = useState(!saved)
  const [filed, setFiled] = useState(saved)
  const [skipping, setSkipping] = useState(false)
  const screen = useRef<HTMLElement>(null)
  const card = useRef<HTMLElement>(null)
  const parts = useRef<HTMLDivElement>(null)
  const slip = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const WHEN = dateTime(deliverH(s))

  useEffect(() => { setClock(deliverAt(s)) }, [s])

  const marksOk = PARTS.every((p) => !p.mark || !shots.includes(p.id) || marks.includes(p.id))
  const left = 3 - shots.length
  const label = saved ? 'See the rental summary'
    : left === 3 ? 'Take 3 photos'
    : left > 0 ? `Take ${left} more photo${left === 1 ? '' : 's'}`
    : marksOk ? 'Save the hand-over record' : 'Mark the known marks'
  const keep = (patch: Partial<typeof rec>) => set((x) => ({ ...x, record: { ...x.record, ...patch } }))

  const take = (p: Part, el: HTMLElement) => {
    if (shots.includes(p.id)) return
    keep({ shots: [...shots, p.id] })
    haptic()
    if (!still()) gsap.fromTo(el.querySelector('.flash'), { opacity: 0.95 }, { opacity: 0, duration: 0.5, ease: 'power2.out' })
  }
  const mark = (p: Part) => { keep({ marks: [...marks, p.id] }); haptic() }

  // Each part is ticked, then the record folds shut into a slip.
  const save = () => {
    if (saved) { setSkipping(true); return }
    keep({ saved: true })
    lock(btn.current)
    if (still()) { setTicked(PARTS.map((p) => p.id)); setShowParts(false); setFiled(true); haptic(); return }
    const tl = gsap.timeline()
    PARTS.forEach((p, n) => tl.add(() => { setTicked((t) => [...t, p.id]); haptic() }, n * 0.28))
    // Scroll only this page's own list, never the phone frame.
    tl.add(() => { const sc = screen.current, c = card.current; if (sc && c) sc.scrollTo({ top: Math.max(0, c.offsetTop - 120), behavior: 'smooth' }) }, '+=.35')
    tl.to(parts.current, { height: 0, opacity: 0, duration: 0.6, ease: 'power3.inOut' }, '+=.15')
    tl.add(() => {
      setShowParts(false); setFiled(true)
      gsap.set(parts.current, { clearProps: 'height,opacity' })
      requestAnimationFrame(() => {
        const sl = slip.current
        if (!sl) return
        gsap.timeline()
          .fromTo(sl.querySelectorAll('.fp'), { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.45, ease: 'back.out(1.6)' })
          .fromTo(sl.querySelectorAll('.fsum, .reopen'), { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, onStart: haptic }, '-=.15')
      })
    })
  }

  // The time skip over the ride: delivery -> 8:00–12:30 ride -> collection -> deposit released.
  const marksSkip: [number, string][] = [[deliverH(s), deliverAt(s)], [SAT + 8, '8:00'], [SAT + 12.5, '12:30'], [collectH(s), collectAt(s)]]

  return (
    <>
      <main className="screen d-screen s11-screen" ref={screen}>
        <div className="bar-top">
          <BackButton label="Back to tracking" onClick={back} />
          <Mono className="mid">Hand-over</Mono>
          <span />
        </div>
        <div className="pad">
          <h1 className="t-h1 s11-h" aria-live="polite">{saved ? 'Hand-over recorded' : 'Check it before you ride'}</h1>
          <p className="lede s11-lede">Photograph the same three parts the shop did. What you record here is never charged to you.</p>
        </div>
        <article className={`record${filed ? ' closed' : ''}`} ref={card} aria-label="Hand-over record, OR-10482">
          <header className="rec-h"><Mono>Hand-over record · OR-10482</Mono></header>
          <div className="cols">
            <div><Mono>Timah Cycles</Mono><b>18 Oct · 16:20</b></div>
            <div><Mono>You</Mono><b>{shots.length ? WHEN : 'Not taken yet'}</b></div>
          </div>
          {showParts && (
            <div className="parts" ref={parts}>
              {PARTS.map((p) => {
                const shot = shots.includes(p.id), marked = marks.includes(p.id)
                return (
                  <section key={p.id} className={`part${ticked.includes(p.id) ? ' ok' : ''}`} aria-label={p.name}>
                    <div className="part-h"><b>{p.name}<span className="tick" aria-hidden="true"><Icon name="check" /></span></b><Mono>{p.note}</Mono></div>
                    <div className="pair">
                      <figure>
                        <div className="ph">
                          <Photo src={p.shop} alt={`The shop’s photo of the ${p.name.toLowerCase()}`} width={160} height={114} />
                          {p.shopRing && <span className="ring2 on" style={{ left: `${p.shopRing[0]}%`, top: `${p.shopRing[1]}%` }} aria-hidden="true" />}
                        </div>
                      </figure>
                      <figure>
                        <button type="button" className={`ph shot${shot ? ' taken' : ''}`} onClick={(e) => take(p, e.currentTarget)}
                          aria-label={shot ? `Your photo of the ${p.name.toLowerCase()}, ${WHEN}` : `Take your photo of the ${p.name.toLowerCase()}`}>
                          {shot
                            ? <Photo src={p.mine} alt="" width={160} height={114} className="mine" />
                            : <span className="cam"><Icon name="camera" /><span>Take photo</span></span>}
                          {p.mineRing && <span className={`ring2${marked ? ' on' : ''}`} style={{ left: `${p.mineRing[0]}%`, top: `${p.mineRing[1]}%` }} aria-hidden="true" />}
                          <span className="flash" aria-hidden="true" />
                        </button>
                      </figure>
                    </div>
                    {shot && p.mark && !marked && <button type="button" className="markbtn" onClick={() => mark(p)}>Circle the {p.mark} on your photo</button>}
                    {shot && p.mark && marked && <span className="marked"><Icon name="check" small />{p.mark[0].toUpperCase() + p.mark.slice(1)} recorded · {WHEN}</span>}
                    {shot && !p.mark && <span className="nomark">No marks to record</span>}
                  </section>
                )
              })}
            </div>
          )}
          {filed && (
            <div className="filed" ref={slip}>
              <div className="fps">
                {PARTS.map((p) => (
                  <div key={p.id} className="fp">
                    <span className="fpp"><Photo src={p.shop} alt="" width={54} height={40} /><Photo src={p.mine} alt="" width={54} height={40} /></span>
                    <span>{p.short}</span>
                  </div>
                ))}
              </div>
              <div className="fsum"><b>Recorded · <span className="nb">{WHEN}</span></b><span>3 parts checked · 2 known marks · nothing new.</span><span className="fsum-l">Timah Cycles has the same record.</span></div>
              <button type="button" className="reopen" onClick={() => setShowParts((v) => !v)} aria-expanded={showParts}>{showParts ? 'Close the record' : 'See all photos'}</button>
            </div>
          )}
        </article>
        <div className="pad">
          <button type="button" className="reportrow" onClick={() => toast('Reporting a problem is not in this demo yet.')}>
            <Icon name="flag" />
            <span><b>Something wrong with the bike?</b><span>Report a problem before you ride</span></span>
            <Icon name="caret-right" small />
          </button>
        </div>
      </main>
      <div className="dock">
        <button type="button" ref={btn} className="cta s11-save" disabled={!saved && (left > 0 || !marksOk)} onClick={save} aria-live="polite">{label}</button>
      </div>
      {toastNode}
      {skipping && <TimeSkip from={deliverH(s)} to={releaseH(s)} marks={marksSkip}
        caption={`The ride happens here: 8:00–12:30 at Chestnut. Collected at ${collectAt(s)}.`}
        onDone={() => { set((x) => ({ ...x, closed: true, now: Math.max(x.now, releaseH(x)) })); navigate(routeFor('12-rental-summary'), { state: { how: 'skip' } }) }} />}
    </>
  )
}

