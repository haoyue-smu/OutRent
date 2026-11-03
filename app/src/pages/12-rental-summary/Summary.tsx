import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import { BackButton, MeasuredGrid, Mono, still } from '../../shell/direction'
import { routeFor } from '../../pages'
import { clockOf, collectAt, dateTime, deliverAt, fitNow, getState, set, setClock, useStore } from '../../shell/store'
import { collectH, payWith, releaseH } from '../../shell/rental'
import { REPORT, hasReportReply, isScratchReport, reportReply, reportTimes } from '../../shell/report'
import rCrank from '@photos/12-rental-summary/assets/12-direction-r-crank.webp'
import rSaddle from '@photos/12-rental-summary/assets/12-direction-r-saddle.webp'
import rDrive from '@photos/12-rental-summary/assets/12-direction-r-drive.webp'
import marlin from '@photos/12-rental-summary/assets/12-direction-backdrop-marlin7.webp'
import './summary.css'

// 12 Rental summary · the fitter's line (v50). The record first: the deposit back as the page's one figure,
// "Your Saturday" as four evenly spaced steps, the return check; then the offer, a forest block with this
// Marlin 7 (Weekly ride · 10% off, S$45 against S$50, four Saturdays) -> 13; then Back to Home.
// Source: the Creative Director's prototype v52 (#12). Real state: the times, places, fit and payment Daniel
// chose; opening it closes the rental (as v52 does); once the weekly ride is set up the block says so.

const BACKS = [{ src: rCrank, part: 'Crank arm' }, { src: rSaddle, part: 'Saddle edge' }, { src: rDrive, part: 'Drivetrain' }]

export default function Summary() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromSkip = (location.state as { how?: string } | null)?.how === 'skip'
  const s = useStore((x) => x)
  const root = useRef<HTMLElement>(null)
  const cover = useRef<HTMLDivElement>(null)
  const f = fitNow(s)
  const d = deliverAt(s), c = collectAt(s), pd = s.book.place.d
  const rel = releaseH(s)
  const weekly = s.weekly
  const replied = hasReportReply(s)
  const { replyAt } = reportTimes(s)
  const scratchReported = isScratchReport(s.report)

  // The summary is the rental closed: arriving here (from the skip, from Past or directly) records it.
  useEffect(() => {
    const x = getState()
    if (x.paid && !x.closed) set({ closed: true, now: Math.max(x.now, releaseH(x)) })
  }, [])
  useEffect(() => { setClock(clockOf(rel)) }, [rel])

  // The day is told in four steps; the figure settles from the lighter green to forest.
  useLayoutEffect(() => {
    const cv = cover.current
    if (still() || !root.current) { if (cv) cv.style.visibility = 'hidden'; return }
    if (cv) gsap.to(cv, { opacity: 0, duration: 0.4, delay: 0.25, onComplete: () => { cv.style.visibility = 'hidden' } })
    const ctx = gsap.context(() => {
      gsap.fromTo('.tl12 li', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.14, delay: 0.3, ease: 'power2.out' })
      gsap.fromTo('.amt', { color: 'var(--forest-2)' }, { color: 'var(--forest)', duration: 0.6, delay: 0.9 })
    }, root)
    return () => ctx.revert()
  }, [])

  const toBookings = () => navigate(routeFor('09-trips'), { replace: true, state: { how: 'back' } })
  const toHome = () => navigate(routeFor('01-home'), { replace: true, state: { how: 'back' } })
  const at = pd === 0 ? 'at the trailhead' : 'at Blk 325C'

  return (
    <>
      <main className="screen d-screen s12-screen" ref={root}>
        <div className="bar-top">
          <BackButton label="Back to Bookings" onClick={toBookings} />
          <Mono className="mid">OR-10482 · closed</Mono>
          <span />
        </div>
        <div className="pad">
          <div className="hero12">
            <Mono>Trek Marlin 7 · Sat 25 Oct</Mono>
            <span className="amt">S$150</span>
            <h1 className="what">deposit released</h1>
            <span className="small">Nothing kept · {dateTime(rel)}</span>
          </div>

          <section className="sec12">
            <h2 className="t-h2">Your Saturday</h2>
            <ol className="tl12">
              <li><time>{d}</time><i /><div><b>Delivered, set to your fit</b><span>{pd === 0 ? 'Chestnut trailhead carpark' : 'Blk 325C'} · saddle {f.saddle} cm</span></div></li>
              <li className="ride"><time>8:00<br />12:30</time><i /><div><b>Coach Aisyah’s Saturday ride</b><span>Chestnut Nature Park · 4 h 30 min</span></div></li>
              <li><time>{c}</time><i /><div><b>Collected</b><span>As at hand-over, trail dirt only</span></div></li>
              <li className="last"><time>{clockOf(rel)}</time><i /><div><b>Deposit released</b><span>S$150 released · S$50 paid by {payWith(s)}</span></div></li>
            </ol>
          </section>

          <section className="sec12">
            <h2 className="t-h2">Checked against the {d} photos</h2>
            {replied && scratchReported && <p className="return12">Checked {s.book.place.c === 0 ? 'at the carpark' : 'at Blk 325C'}, {dateTime(collectH(s))}, against the hand-over record: 2 known marks and the scratch reported at hand-over ({REPORT.reference}), all on the shop’s record. Trail dirt only. Nothing new, nothing chargeable. Deposit S$150 released {clockOf(rel)}.</p>}
            {replied && !scratchReported && <div className="return12-reply">
              <p className="return12">Report {REPORT.reference}: {s.report.reason}.</p>
              <p className="return12"><b>Timah Cycles</b> · {replyAt}</p>
              <blockquote className="return12">{reportReply(s.report)}</blockquote>
              <p className="return12">{REPORT.outcome}.</p>
            </div>}
            {s.report.sent && !replied && <p className="return12">Report {REPORT.reference}: {s.report.reason}. Timah Cycles replies to your booking.</p>}
            <div className="backs">
              {BACKS.map((b) => (
                <figure key={b.part}>
                  <Photo src={b.src} alt={`${b.part} at return, ${c}`} width={113} height={81} />
                  <b>{b.part}</b>
                  <span><Icon name="check" small />No change</span>
                </figure>
              ))}
            </div>
            <MeasuredGrid className="g12" items={[
              { k: 'Paid', v: 'S$50' }, { k: 'Deposit', v: 'Released', tone: 'forest' }, { k: 'Kept', v: 'S$0' },
            ]} />
          </section>
        </div>

        <section className={`ad12${weekly ? ' set' : ''}`} aria-label="Weekly ride">
          <div className="adph"><Photo src={marlin} alt="This Trek Marlin 7" width={393} height={200} /><span className="adk">Weekly ride · 10% off</span></div>
          <div className="adb">
            <h2 className="t-h2">{weekly ? 'Riding again every Saturday' : 'Same bike. Same Saturday.'}</h2>
            <p className="adl">This Trek Marlin 7, set to your fit, {at} every Saturday: delivered {d}, collected {c}.</p>
            <div className="adp"><b>S$45</b><span>a ride</span><s>S$50</s></div>
            <div className="weeks"><div><b>1 Nov</b><small>First</small></div><div><b>8 Nov</b></div><div><b>15 Nov</b></div><div><b>22 Nov</b></div></div>
            <button className="cta" type="button" onClick={() => navigate(routeFor('13-weekly-ride'), { state: { from: 'the rental summary' } })}>{weekly ? 'Open the weekly ride' : 'See the weekly ride'}</button>
            <p className="small adn">{weekly
              ? 'Next charge 30 Oct · 20:00: S$45. Skip 1 Nov free before then.'
              : 'Nothing is charged today. Each ride is charged the Thursday before, at 20:00. Skip any week before then.'}</p>
          </div>
        </section>
        <div className="home12"><button className="ghostbtn" type="button" onClick={toHome}>Back to Home</button></div>
      </main>
      {/* Arriving from the time skip: the paper cover lifts once the summary is in place. */}
      <div className="s-cover" ref={cover} aria-hidden="true" style={fromSkip && !still() ? undefined : { visibility: 'hidden' }} />
    </>
  )
}
