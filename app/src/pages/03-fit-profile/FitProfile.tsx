import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useBack } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { BackButton, Mono } from '../../shell/direction'
import { lock } from '../../shell/PageFrame'
import { Fit, getState, set, setClock } from '../../shell/store'
import { routeFor } from '../../pages'
import { Tape, createSession } from './session'
import './fit.css'

// 03 Fit profile · the fitter's line (v52, the fitting session of v44). Four steps, no scrolling: 01 Height,
// 02 Inside leg, 03 Riding, 04 Check. The bike stays in a tall stage; each step moves the camera to the part it
// sets (session.ts). The dock names the next step; on 04 it saves the fit. A returning rider opens on 04.
// The numbers go straight into the story state, so every later page shows this fit.

const NEXT: Record<number, string> = { 1: 'Next: inside leg', 2: 'Next: how you ride', 3: 'Next: check the set-up' }
const STEPS = ['Height', 'Inside leg', 'Riding', 'Check']

export default function FitProfile() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromPost = (location.state as { from?: string } | null)?.from === 'post'
  const back = useBack(() => navigate(routeFor('02-coach-kit')))
  const fig = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const tapeH = useRef<HTMLDivElement>(null)
  const tapeL = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDListElement>(null)
  const frameEl = useRef<HTMLElement>(null)
  const save = useRef<HTMLButtonElement>(null)
  const ses = useRef<ReturnType<typeof createSession> | null>(null)
  const tapes = useRef<{ h?: ReturnType<typeof Tape>; l?: ReturnType<typeof Tape> }>({})
  const [fit, setFitState] = useState(() => ({ height: getState().fit.height, leg: getState().fit.leg }))
  const [step, setStep] = useState(() => (getState().fit.hasProfile ? 4 : 1))
  const [saved, setSaved] = useState(false)
  const frame = Fit.frame(fit.height)
  const saddle = Math.round(Fit.saddleRaw(fit.leg))

  useEffect(() => { setClock(getState().paid ? '19:00' : '9:03') }, [])

  // Build the figure, the session and the two tapes once the fonts are in (the figure measures its own text).
  useEffect(() => {
    let cancelled = false
    const start = getState().fit
    document.fonts.ready.then(() => {
      if (cancelled || !fig.current || !stage.current || !tapeH.current || !tapeL.current) return
      ses.current = createSession({ fig: fig.current, stage: stage.current, height: start.height, leg: start.leg, hasProfile: start.hasProfile, onStep: setStep })
      const change = (patch: { height?: number; leg?: number }) => {
        ses.current?.setFit(patch)
        setFitState((f) => ({ ...f, ...patch }))
        set((s) => ({ ...s, fit: { ...s.fit, ...patch } }))
        setSaved(false)
      }
      tapes.current.h = Tape(tapeH.current, { min: 150, max: 200, value: start.height, bands: Fit.chart, onChange: (v) => change({ height: v }), focus: () => ses.current?.heightFocus() })
      tapes.current.l = Tape(tapeL.current, { min: 60, max: 95, value: start.leg, sub: 0.883, onChange: (v) => change({ leg: v }), focus: (on) => ses.current?.legFocus(on) })
    })
    return () => { cancelled = true; ses.current?.destroy(); tapes.current.h?.destroy(); tapes.current.l?.destroy() }
  }, [])

  // A tape inside a hidden panel has no width: place it again when its step shows.
  useEffect(() => { if (step === 1) tapes.current.h?.place(); if (step === 2) tapes.current.l?.place() }, [step])

  // The frame letter flashes forest when the height crosses into another size.
  const lastFrame = useRef(frame)
  useEffect(() => { if (frame !== lastFrame.current) { lastFrame.current = frame; flash(frameEl.current) } }, [frame])

  const onDock = () => {
    if (step < 4) { ses.current?.goStep(step + 1); return }
    if (saved) return
    setSaved(true); lock(save.current)
    set((s) => ({ ...s, fit: { ...s.fit, ...fit, hasProfile: true } }))
    grid.current?.querySelectorAll('dd').forEach((d) => flash(d))
    // From the coach's post the fit was the missing step: go on to the bikes (Back from there returns to the post).
    window.setTimeout(() => {
      if (fromPost) navigate(routeFor('04-search-results'), { replace: true })
      else back()
    }, 900)
  }

  return (
    <>
      <main className="screen d-screen fit-screen">
        <div className="bar-top">
          <BackButton label="Back" onClick={back} />
          <Mono className="mid">Fit profile</Mono>
          <span />
        </div>
        <div className="stage s3" ref={stage}><div className="fig" ref={fig} /></div>
        <div className="pad">
          <div className="steps3" role="tablist" aria-label="Fit steps">
            {STEPS.map((l, i) => {
              const n = i + 1
              return (
                <button key={l} type="button" role="tab" aria-selected={step === n} className={n < step || (n === 1 && step > 1) ? 'done' : undefined}
                  onClick={() => ses.current?.goStep(n)}><b>{String(n).padStart(2, '0')}</b>{l}</button>
              )
            })}
          </div>
          <section className="p3" hidden={step !== 1}>
            <div className="rd3">
              <div><Mono id="lab-h">Height</Mono><b><span className="num">{fit.height}</span><small>cm</small></b></div>
              <i className="fr-to" aria-hidden="true" />
              <div className="o"><Mono>Frame</Mono><b ref={frameEl}>{frame}</b></div>
            </div>
            <div className="tape" ref={tapeH} role="slider" tabIndex={0} aria-labelledby="lab-h" aria-valuemin={150} aria-valuemax={200} aria-valuenow={fit.height}><svg aria-hidden="true" /><span className="needle" /></div>
            <p className="fr-note">Your height picks the frame size. Drag the scale to change it.</p>
          </section>
          <section className="p3" hidden={step !== 2}>
            <div className="rd3">
              <div><Mono id="lab-l">Inside leg</Mono><b><span className="num">{fit.leg}</span><small>cm</small></b></div>
              <i className="fr-to" aria-hidden="true" />
              <div className="o"><Mono>Saddle</Mono><b><span className="num">{saddle}</span><small>cm</small></b></div>
            </div>
            <div className="tape dual" ref={tapeL} role="slider" tabIndex={0} aria-labelledby="lab-l" aria-valuemin={60} aria-valuemax={95} aria-valuenow={fit.leg}><svg aria-hidden="true" /><span className="needle" /></div>
            <p className="fr-note">In socks, floor to crotch. The green scale is the saddle: 88.3% of your inside leg.</p>
          </section>
          <section className="p3" hidden={step !== 3}>
            <div className="rd3 ride">
              <div><Mono>Riding</Mono><b className="txt">Weekly on park connectors, first time on trails</b></div>
              <i className="fr-to" aria-hidden="true" />
              <div className="o two">
                <div><Mono>Fork sag</Mono><b>25<small>%</small></b></div>
                <div><Mono>Handlebar</Mono><b>+1<small>cm</small></b></div>
              </div>
            </div>
            <p className="fr-note">Softer suspension and a higher bar for a first time on trails. <button className="link inl" type="button" onClick={() => ses.current?.replay()}>Play the set-up again</button></p>
          </section>
          <section className="p3" hidden={step !== 4}>
            <dl className="mgrid" ref={grid}>
              <div><dt className="mono">Saddle</dt><dd><span className="num">{saddle}</span><small>cm</small></dd></div>
              <div><dt className="mono">Frame</dt><dd>{frame}</dd></div>
              <div><dt className="mono">Fork sag</dt><dd>25<small>%</small></dd></div>
              <div><dt className="mono">Handlebar</dt><dd>+1<small>cm</small></dd></div>
            </dl>
            <p className="fr-note">From your height {fit.height} cm and inside leg {fit.leg} cm. Any bike marked ‘Set to your fit’ is adjusted to these numbers before delivery.</p>
          </section>
        </div>
      </main>
      <div className="dock">
        <button type="button" className="cta" ref={save} style={{ width: '100%' }} onClick={onDock} aria-live="polite">
          {step < 4 ? <>{NEXT[step]}<Icon name="arrow-right" /></> : saved ? <span className="saved-mark"><Icon name="check" />Fit saved</span> : 'Save fit'}
        </button>
      </div>
    </>
  )
}

function flash(el: Element | null) {
  if (!el) return
  el.classList.remove('flash'); void (el as HTMLElement).offsetWidth; el.classList.add('flash')
}
