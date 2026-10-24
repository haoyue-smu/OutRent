import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GoTo } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { TabBar } from '../../shell/TabBar'
import './fit.css'

// Which frame of the board to show. Change this one value, or open the page with ?state=<frame>.
//   'profile'              E1-1 · E1-2 · profile area, Profile tab selected
//   'fit-empty'            E1-3 · empty (first entry)
//   'fit-height-only'      E1-3 · height only
//   'fit-filled'           E1-3 · filled
//   'fit-filled-scrolled'  E1-3 · filled · scrolled (opens scrolled to Measurements)
//   'fit-editing'          E1-3 · editing (inside leg chosen, ruler showing)
type Frame = 'profile' | 'fit-empty' | 'fit-height-only' | 'fit-filled' | 'fit-filled-scrolled' | 'fit-editing'
const FRAMES: Frame[] = ['profile', 'fit-empty', 'fit-height-only', 'fit-filled', 'fit-filled-scrolled', 'fit-editing']
const FRAME = 'profile' as Frame

// ---------- mock data (MOCK-DATA v1.3 §2 SEED-ACCOUNT, §3 SEED-FIT) ----------
type Fit = { height: number; leg: number | null }
type Riding = { level: string; trails: string }
const SEED_FIT: Fit = { height: 176, leg: 81 }
const SEED_RIDING: Riding = { level: 'Rides weekly on park connectors', trails: 'First time' }
const ACCOUNT = { name: 'Daniel Lim', initials: 'DL', since: 'Member since Aug 2026 · no renter rating yet' }

// Derived set-up. With height 176 and inside leg 81 these give the locked values: frame M, saddle 72 cm.
const HEIGHT = { min: 120, max: 220, ruler: [150, 200] as const }
const LEG = { min: 50, max: 110, ruler: [60, 95] as const }
const frameFor = (h: number) => (h < 165 ? 'S' : h < 180 ? 'M' : h < 190 ? 'L' : 'XL')
const saddleFor = (leg: number) => Math.round(leg * 0.883)
const SAG = 25
const BARS = '+1'

type Measure = 'height' | 'leg'
const parse = (text: string, r: { min: number; max: number }) => {
  if (text.trim() === '') return { value: null, bad: false }
  const n = Number(text)
  const ok = Number.isInteger(n) && n >= r.min && n <= r.max
  return { value: ok ? n : null, bad: !ok }
}

// A new ?state starts the page fresh, so each frame opens as drawn.
export default function FitProfilePage() {
  const state = useSearchParams()[0].get('state')
  return <FitProfile key={state ?? ''} />
}

function FitProfile() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const asked = params.get('state') as Frame | null
  const frame = asked && FRAMES.includes(asked) ? asked : FRAME
  const seeded = frame !== 'fit-empty' && frame !== 'fit-height-only'

  const [view, setView] = useState<'profile' | 'fit'>(frame === 'profile' ? 'profile' : 'fit')
  const [saved, setSaved] = useState<Fit | null>(seeded ? SEED_FIT : null)
  const [riding] = useState<Riding | null>(seeded ? SEED_RIDING : null)
  const [draft, setDraft] = useState({
    height: frame === 'fit-empty' ? '' : String(SEED_FIT.height),
    leg: seeded ? String(SEED_FIT.leg) : '',
  })
  const [editing, setEditing] = useState(frame === 'fit-editing')
  const [active, setActive] = useState<Measure>('leg')
  // Typing into the saved profile switches to the editing layout; the field being typed in keeps focus.
  const [keepFocus, setKeepFocus] = useState<Measure | null>(null)

  const openFit = () => {
    setDraft({ height: saved ? String(saved.height) : '', leg: saved?.leg ? String(saved.leg) : '' })
    setEditing(false)
    setView('fit')
  }
  // Opened from another page (?state=…): back returns there. Unsaved changes are dropped.
  const back = () => {
    if (asked && (window.history.state?.idx ?? 0) > 0) navigate(-1)
    else setView('profile')
  }
  const save = (fit: Fit) => {
    setSaved(fit)
    setEditing(false)
  }

  if (view === 'profile') return <Profile saved={saved} onOpenFit={openFit} />
  return (
    <FitEditor
      saved={saved} riding={riding} draft={draft} editing={editing} active={active} keepFocus={keepFocus}
      scrolled={frame === 'fit-filled-scrolled'}
      onChange={(m, text) => {
        setDraft((d) => ({ ...d, [m]: text.replace(/\D/g, '').slice(0, 3) }))
        setActive(m)
        if (saved && !editing) { setEditing(true); setKeepFocus(m) }
      }}
      onFocus={setActive}
      onBack={back}
      onSave={save}
    />
  )
}

// ---------- E1-1 · E1-2 profile area ----------
function Profile({ saved, onOpenFit }: { saved: Fit | null; onOpenFit: () => void }) {
  return (
    <>
      <main className="screen" key="profile">
        <div className="fit-profile">
          <h1 className="t-large">Profile</h1>
          <div className="fit-who">
            <span className="fit-avatar" aria-hidden="true">{ACCOUNT.initials}</span>
            <div className="fit-stack">
              <span className="t-title">{ACCOUNT.name}</span>
              <span className="t-foot">{ACCOUNT.since}</span>
            </div>
          </div>

          <button type="button" className="card fit-card" onClick={onOpenFit}>
            <span className="fit-card-head">
              <span className="t-callout fit-strong">Your fit</span>
              <Icon name="caret-right" small className="fit-chev" />
            </span>
            {saved ? (
              <span className="stats">
                <span className="stat"><span className="v">{saved.height} <small>cm</small></span><span className="k">Height</span></span>
                <span className="stat"><span className="v">{frameFor(saved.height)}</span><span className="k">Frame</span></span>
                <span className="stat">
                  <span className="v">{saved.leg ? <>{saddleFor(saved.leg)} <small>cm</small></> : '—'}</span>
                  <span className="k">Saddle</span>
                </span>
              </span>
            ) : (
              <span className="t-callout">Add your height to set the frame size</span>
            )}
            <span className="t-foot">Rented bikes are adjusted to this before delivery</span>
          </button>

          <Group title="Inbox">
            <GoTo page="01-home" state="notifications" className="fit-row">
              <Icon name="bell" className="fit-lead" />
              <span className="fit-stack">
                <span className="t-callout fit-strong">Notifications</span>
                <span className="t-foot">1 unseen</span>
              </span>
              <span className="p-dot" role="img" aria-label="Unseen" />
              <Icon name="caret-right" small className="fit-chev" />
            </GoTo>
            <GoTo page="01-home" state="messages" className="fit-row">
              <Icon name="chat-circle" className="fit-lead" />
              <span className="fit-stack">
                <span className="t-callout fit-strong">Messages</span>
                <span className="t-foot">Timah Cycles</span>
              </span>
              <Icon name="caret-right" small className="fit-chev" />
            </GoTo>
          </Group>

          {/* Payment methods are chosen at payment (07); here they are shown, not edited. */}
          <Group title="Payment methods">
            <div className="fit-row">
              <Icon name="device-mobile" className="fit-lead" />
              <span className="fit-stack">
                <span className="t-callout fit-strong">PayNow</span>
                <span className="t-foot">Default</span>
              </span>
            </div>
            <div className="fit-row">
              <Icon name="credit-card" className="fit-lead" />
              <span className="fit-stack"><span className="t-callout fit-strong">Visa ·4821</span></span>
            </div>
          </Group>

          {/* E1-2 AC2: beyond scope, shown as a quiet surface; nothing depends on it. */}
          <div className="card fit-list">
            <div className="fit-row is-quiet">
              <Icon name="gear" className="fit-lead" />
              <span className="fit-stack"><span className="t-callout">Account details and help</span></span>
            </div>
          </div>
        </div>
      </main>
      <TabBar current="03-fit-profile" />
    </>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="fit-section">
      <h2 className="t-title">{title}</h2>
      <div className="card fit-list">{children}</div>
    </section>
  )
}

// ---------- E1-3 create and edit the fit profile ----------
type EditorProps = {
  saved: Fit | null; riding: Riding | null; draft: { height: string; leg: string }; editing: boolean; active: Measure; keepFocus: Measure | null; scrolled: boolean
  onChange: (m: Measure, text: string) => void; onFocus: (m: Measure) => void; onBack: () => void; onSave: (fit: Fit) => void
}

function FitEditor({ saved, riding, draft, editing, active, keepFocus, scrolled, onChange, onFocus, onBack, onSave }: EditorProps) {
  const measurements = useRef<HTMLElement>(null)
  useEffect(() => { if (scrolled) measurements.current?.scrollIntoView({ block: 'start' }) }, [scrolled])

  const h = parse(draft.height, HEIGHT)
  const l = parse(draft.leg, LEG)
  const valid = h.value !== null && !l.bad
  const showSaved = saved !== null && !editing
  const fit = showSaved ? saved : { height: h.value ?? 0, leg: l.value }
  const hasHeight = showSaved || h.value !== null
  const frame = hasHeight ? frameFor(fit.height) : null
  const saddle = hasHeight && fit.leg ? saddleFor(fit.leg) : null

  const fields = (
    <>
      <div className="fit-fields">
        <MeasureField
          label={saved || draft.height ? 'Height' : 'Height · required'} name="height" text={draft.height}
          bad={h.bad} chosen={editing && active === 'height'} focus={editing && keepFocus === 'height'} onChange={onChange} onFocus={onFocus}
        />
        <MeasureField
          label={saved?.leg || draft.leg ? 'Inside leg' : 'Inside leg · optional'} name="leg" text={draft.leg}
          bad={l.bad} chosen={editing && active === 'leg'} focus={editing && keepFocus === 'leg'} onChange={onChange} onFocus={onFocus}
        />
      </div>
      {(h.bad || l.bad) && (
        <div className="field-error" role="alert">
          <Icon name="warning-circle" small />
          <span>{h.bad ? `Height between ${HEIGHT.min} and ${HEIGHT.max} cm` : `Inside leg between ${LEG.min} and ${LEG.max} cm, or leave it empty`}</span>
        </div>
      )}
    </>
  )

  const ridingCard = (
    <section className="fit-section">
      <h2 className="t-title">Riding</h2>
      <div className="card fit-list">
        <div className="p-kv">
          <div><span>Level</span>{riding ? <span>{riding.level}</span> : <span className="is-muted">Add</span>}</div>
          {riding && <div><span>Trails</span><span>{riding.trails}</span></div>}
        </div>
      </div>
    </section>
  )

  const footnote = (
    <div className="t-foot fit-note"><Icon name="info" small /><span>Suppliers set rented gear to these values before delivery</span></div>
  )

  const guide = hasHeight && !fit.leg && (
    <div className="field-error is-guide" aria-live="polite">
      <Icon name="ruler" small /><span>Add inside leg to make the saddle height exact</span>
    </div>
  )

  return (
    <>
      <main className="screen" key="fit">
        <div className="topbar fit-bar">
          <button type="button" className="icon-btn" aria-label="Back" onClick={onBack}><Icon name="arrow-left" /></button>
          <h1 className="name fit-bar-title">Your fit</h1>
          <span />
        </div>

        {showSaved ? (
          // E1-3 filled: the number a supplier sets first, then the rest of the set-up, then the inputs behind it.
          <div className="fit-page">
            {saddle !== null ? (
              <Hero k="Saddle height" sub={`From height ${fit.height} cm and inside leg ${fit.leg} cm`}>
                {saddle} <span className="unit">cm</span>
              </Hero>
            ) : (
              <Hero k="Frame size" sub={`From your height, ${fit.height} cm`}>{frame}</Hero>
            )}
            <Figure title="Set for you" text="Figure: bike side view, saddle, bars and fork marked · supplied by Haoyue" hint="Saddle · bars · fork" readout={`Frame ${frame}`} />
            {guide}
            <div className="card fit-tiles">
              <div className="stats">
                <div className="stat"><span className="v">{frame}</span><span className="k">Frame size</span></div>
                <div className="stat"><span className="v">{SAG} <small>%</small></span><span className="k">Suspension sag</span></div>
                <div className="stat"><span className="v">{BARS} <small>cm</small></span><span className="k">Bar height</span></div>
              </div>
            </div>
            <section className="fit-section is-anchor" ref={measurements}>
              <h2 className="t-title">Measurements</h2>
              {fields}
            </section>
            {ridingCard}
            {footnote}
          </div>
        ) : editing ? (
          // E1-3 editing: a ruler on the figure for the chosen length; the derived set-up follows as it changes.
          <div className="fit-page has-bar">
            <figure className="explainer has-ruler">
              <Ruler
                measure={active}
                value={active === 'height' ? h.value ?? HEIGHT.ruler[0] : l.value ?? LEG.ruler[0]}
                onChange={(v) => onChange(active, String(v))}
              />
              <div className="placeholder">
                {active === 'height'
                  ? 'Figure: rider standing, height measured floor to crown · supplied by Haoyue'
                  : 'Figure: rider standing, inside leg measured floor to crotch · supplied by Haoyue'}
              </div>
              <span className="corner hint">{active === 'height' ? 'Height' : 'Inside leg'}</span>
              <span className="corner readout">{(active === 'height' ? draft.height : draft.leg) || '—'} cm</span>
            </figure>
            {fields}
            <div className="card fit-live">
              <span className="t-foot">Updates as you change it</span>
              <div className="stats">
                <div className="stat"><span className="v">{saddle ?? '—'}{saddle !== null && <> <small>cm</small></>}</span><span className="k">Saddle</span></div>
                <div className="stat"><span className="v">{frame ?? '—'}</span><span className="k">Frame</span></div>
                <div className="stat"><span className="v">{BARS} <small>cm</small></span><span className="k">Bars</span></div>
              </div>
            </div>
          </div>
        ) : (
          // E1-3 first entry: empty, then height only (frame size and a hint), then both.
          <div className="fit-page has-bar">
            {hasHeight && (saddle !== null
              ? <Hero k="Saddle height" sub={`From height ${fit.height} cm and inside leg ${fit.leg} cm`}>{saddle} <span className="unit">cm</span></Hero>
              : <Hero k="Frame size" sub={`From your height, ${fit.height} cm`}>{frame}</Hero>)}
            {hasHeight
              ? <Figure title={`Set for ${fit.height} cm`} text="Figure: bike side view, frame size highlighted · supplied by Haoyue" hint="From height" readout={`Frame ${frame}`} />
              : <Figure title="Your bike" text="Figure: bike side view, frame and saddle height marked · supplied by Haoyue" hint="Height sets the frame size" readout="—" />}
            {guide}
            {fields}
            {ridingCard}
            {footnote}
          </div>
        )}
      </main>

      {!showSaved && (
        <div className="actionbar glass is-single">
          <button
            type="button" className="btn is-block" disabled={!valid}
            onClick={() => h.value !== null && onSave({ height: h.value, leg: l.value })}
          >
            Save fit
          </button>
        </div>
      )}
    </>
  )
}

function Hero({ k, sub, children }: { k: string; sub: string; children: ReactNode }) {
  return (
    <div className="p-hero">
      <span className="k">{k}</span>
      <span className="t-display">{children}</span>
      <span className="sub">{sub}</span>
    </div>
  )
}

function Figure({ title, text, hint, readout }: { title: string; text: string; hint: string; readout: string }) {
  return (
    <figure className="explainer">
      <span className="corner fig">Fig 1</span>
      <span className="corner title">{title}</span>
      <div className="placeholder">{text}</div>
      <span className="corner hint">{hint}</span>
      <span className="corner readout">{readout}</span>
    </figure>
  )
}

function MeasureField({ label, name, text, bad, chosen, focus, onChange, onFocus }: {
  label: string; name: Measure; text: string; bad: boolean; chosen: boolean; focus: boolean
  onChange: (m: Measure, text: string) => void; onFocus: (m: Measure) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const el = input.current
    if (focus && el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length) }
  }, [focus])
  const cls = ['field', chosen ? 'is-chosen' : '', bad ? 'is-error' : ''].filter(Boolean).join(' ')
  return (
    <label className={cls}>
      <span>{label}</span>
      <span className="value">
        <input
          ref={input} type="text" inputMode="numeric" name={name} autoComplete="off" placeholder="Add"
          className={text ? undefined : 'is-empty'} style={text ? { width: `${text.length + 0.6}ch` } : undefined}
          value={text} aria-label={name === 'height' ? 'Height in cm' : 'Inside leg in cm'} aria-invalid={bad || undefined}
          onChange={(e) => onChange(name, e.target.value)} onFocus={() => onFocus(name)}
        />
        <span className="unit">cm</span>
      </span>
    </label>
  )
}

// The library ruler edge (.explainer.has-ruler): drag along it, or use the arrow keys, to set the chosen length.
const RULER_W = 353, PAD = 22
function Ruler({ measure, value, onChange }: { measure: Measure; value: number; onChange: (v: number) => void }) {
  const [lo, hi] = measure === 'height' ? HEIGHT.ruler : LEG.ruler
  const span = RULER_W - PAD * 2
  const x = (v: number) => PAD + ((v - lo) / (hi - lo)) * span
  const clamp = (v: number) => Math.min(hi, Math.max(lo, Math.round(v)))
  const shown = clamp(value)

  const fromPointer = (e: PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const vx = ((e.clientX - box.left) / box.width) * RULER_W
    onChange(clamp(lo + ((vx - PAD) / span) * (hi - lo)))
  }
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    const step = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -5, PageUp: 5 }[e.key]
    if (step) { e.preventDefault(); onChange(clamp(shown + step)) }
    else if (e.key === 'Home') { e.preventDefault(); onChange(lo) }
    else if (e.key === 'End') { e.preventDefault(); onChange(hi) }
  }

  const ticks = []
  for (let v = lo; v <= hi; v++) {
    const major = v % 5 === 0
    ticks.push(<line key={v} className={major ? 'major' : 'minor'} x1={x(v)} x2={x(v)} y1={40} y2={major ? 52 : 47} />)
    if (major) ticks.push(<text key={`t${v}`} x={x(v)} y={62} textAnchor="middle" className={Math.abs(v - shown) < 3 ? 'on' : undefined}>{v}</text>)
  }
  const nx = x(shown)
  const bx = Math.min(RULER_W - 56, Math.max(0, nx - 28))
  return (
    <svg
      className="ruler" viewBox={`0 0 ${RULER_W} 64`} role="slider" tabIndex={0}
      aria-label={measure === 'height' ? 'Height' : 'Inside leg'}
      aria-valuemin={lo} aria-valuemax={hi} aria-valuenow={shown} aria-valuetext={`${shown} cm`}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e) }}
      onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e) }}
      onKeyDown={onKey}
    >
      {ticks}
      <line className="needle" x1={nx} x2={nx} y1={30} y2={54} />
      <rect className="bubble" x={bx} y={8} width={56} height={22} rx={11} />
      <text className="bubble-t" x={bx + 28} y={23} textAnchor="middle">{shown} cm</text>
    </svg>
  )
}
