import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { gsap } from 'gsap'
import { useBack } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import { BackButton, Mono, TimeSkip, haptic, still } from '../../shell/direction'
import { routeFor } from '../../pages'
import { lock } from '../../shell/PageFrame'
import { SAT, clockOf, collectAt, dateTime, isClosed, set, setClock, useStore, type HandoverReport } from '../../shell/store'
import { collectH, deliverH, releaseH } from '../../shell/rental'
import { REPORT, hasReportReply, reportTimes } from '../../shell/report'
import { RecordPart, ReportPhoto } from './pieces'
import { PARTS, type Part, type PartId } from './data'
import { ReportForm, ReportSent } from './Report'
import './handover.css'

// 11 Handover check · the fitter's line. One record card: the shop's photo and Daniel's, side by side, for the
// same three parts; on save each part is ticked and the record folds shut into a filed slip.
// Source: the Creative Director's prototype v52 (#11), with the PO v1.11 report. Daniel takes three photos;
// known-mark rings stay on shop photos; submitted drivetrain evidence gets the approved scratch ring.

export default function Handover() {
  const navigate = useNavigate()
  const back = useBack(() => navigate(routeFor('10-delivery-tracking')))
  const [query, setQuery] = useSearchParams()
  const s = useStore((x) => x)
  const rec = s.record
  const shots = rec.shots as PartId[], saved = rec.saved
  const report = s.report
  const reportView = query.get('report')
  const canReport = !isClosed(s)
  const reporting = (reportView === 'form' || reportView === 'sent') && (report.sent || canReport)
  const [ticked, setTicked] = useState<PartId[]>(saved ? PARTS.map((p) => p.id) : [])
  const [showParts, setShowParts] = useState(!saved)
  const [filed, setFiled] = useState(saved)
  const [skipping, setSkipping] = useState(false)
  const screen = useRef<HTMLElement>(null)
  const card = useRef<HTMLElement>(null)
  const parts = useRef<HTMLDivElement>(null)
  const slip = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const reportButton = useRef<HTMLButtonElement>(null)
  const wasReporting = useRef(false)
  const WHEN = dateTime(deliverH(s))
  const times = reportTimes(s)
  const { savedAt, sentShort } = times

  useEffect(() => { setClock(clockOf(Math.max(s.now, saved ? times.savedH : report.sent ? times.sentH : deliverH(s)))) }, [s, saved, report.sent, times.savedH, times.sentH])
  useEffect(() => {
    if (reporting) document.querySelector<HTMLElement>('.report-screen h1')?.focus({ preventScroll: true })
    else if (wasReporting.current) reportButton.current?.focus()
    wasReporting.current = reporting
  }, [reporting, reportView])

  const left = PARTS.filter((p) => !shots.includes(p.id)).length
  const label = saved ? 'See the rental summary'
    : left === 3 ? 'Take 3 photos'
    : left > 0 ? `Take ${left} more photo${left === 1 ? '' : 's'}`
    : 'Save the hand-over record'
  const keep = (patch: Partial<typeof rec>) => set((x) => ({ ...x, record: { ...x.record, ...patch } }))
  const updateReport = (patch: Partial<HandoverReport>) => set((x) => ({ ...x, report: { ...x.report, ...patch } }))
  const showReport = (view: 'form' | 'sent' | null, replace = false) => {
    if (!view && window.history.state?.usr?.handoverReport) { navigate(-1); return }
    const next = new URLSearchParams(query)
    if (view) next.set('report', view); else next.delete('report')
    setQuery(next, { replace, state: view ? { handoverReport: !reporting || !!window.history.state?.usr?.handoverReport } : null })
  }
  const send = () => {
    if (!report.reason || report.sent || !canReport) return
    set((x) => ({ ...x, now: Math.max(x.now, reportTimes(x).sentH), report: { ...x.report, sent: true } }))
    haptic()
    showReport('sent', true)
  }

  const take = (p: Part, el: HTMLElement) => {
    if (shots.includes(p.id)) return
    keep({ shots: [...shots, p.id] })
    haptic()
    if (!still()) gsap.fromTo(el.querySelector('.flash'), { opacity: 0.95 }, { opacity: 0, duration: 0.5, ease: 'power2.out' })
  }

  // Each part is ticked, then the record folds shut into a slip.
  const save = () => {
    if (saved) {
      if (s.closed || s.now >= releaseH(s)) navigate(routeFor('12-rental-summary'))
      else setSkipping(true)
      return
    }
    if (left) return
    set((x) => ({ ...x, now: Math.max(x.now, deliverH(x) + 7 / 60), record: { ...x.record, saved: true } }))
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
  const skipFrom = Math.max(deliverH(s), s.now)
  const marksSkip: [number, string][] = [[SAT + 8, '8:00'], [SAT + 12.5, '12:30'], [collectH(s), collectAt(s)]]

  if (reporting) return report.sent
    ? <ReportSent report={report} sentAt={times.sentAt} onBack={() => showReport(null, true)} />
    : <ReportForm shots={shots} report={report} onChange={updateReport} onBack={() => showReport(null, true)} onSend={send} />

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
              {PARTS.map((p) => <RecordPart key={p.id} p={p} shot={shots.includes(p.id)} ticked={ticked.includes(p.id)} when={dateTime(deliverH(s) + (p.id === 'drive' ? 1 / 60 : 0))} report={report} sentShort={sentShort} onTake={(el) => take(p, el)} />)}
            </div>
          )}
          {filed && (
            <div className="filed" ref={slip}>
              <div className="fps">
                {PARTS.map((p) => (
                  <div key={p.id} className="fp">
                    <span className="fpp"><Photo src={p.shop} alt="" width={54} height={40} /><ReportPhoto part={p} report={report} width={54} height={40} /></span>
                    <span>{p.short}</span>
                  </div>
                ))}
              </div>
              <div className="fsum"><b>Recorded · <span className="nb">{savedAt}</span></b><span>3 parts checked · 2 known marks · {report.sent ? '1 problem reported' : 'nothing new'}.</span><span className="fsum-l">Timah Cycles has the same record.</span>{hasReportReply(s) && <span className="fsum-l">{REPORT.outcome}</span>}</div>
              <button type="button" className="reopen" onClick={() => setShowParts((v) => !v)} aria-expanded={showParts}>{showParts ? 'Close the record' : 'See all photos'}</button>
            </div>
          )}
        </article>
        {(report.sent || canReport) && <div className="pad">
          <button type="button" ref={reportButton} className="reportrow" onClick={() => showReport(report.sent ? 'sent' : 'form')}>
            <Icon name="flag" />
            <span><b>{report.sent ? `Report sent · ${sentShort}` : 'Something wrong with the bike?'}</b><span>{report.sent ? 'View your report' : 'Report a problem before you ride'}</span></span>
            <Icon name="caret-right" small />
          </button>
        </div>}
      </main>
      <div className="dock">
        <button type="button" ref={btn} className="cta s11-save" disabled={!saved && left > 0} onClick={save} aria-live="polite">{label}</button>
      </div>
      {skipping && <TimeSkip from={skipFrom} to={releaseH(s)} marks={marksSkip.filter(([time]) => time > skipFrom)}
        caption={`The ride happens here: 8:00–12:30 at Chestnut. Collected at ${collectAt(s)}.`}
        onDone={() => { set((x) => ({ ...x, closed: true, now: Math.max(x.now, releaseH(x)) })); navigate(routeFor('12-rental-summary'), { state: { how: 'skip' } }) }} />}
    </>
  )
}

