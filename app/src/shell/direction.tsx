import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { Icon } from './Icon'

// The fitter's line: the shared pieces 03, 05 and 12 reuse (styles in design/direction.css).

// Motion is feedback, a measurement being taken; with reduced motion everything lands at once.
export const still = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

// Small uppercase measured label.
export function Mono({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return <span id={id} className={['mono', className ?? ''].filter(Boolean).join(' ')}>{children}</span>
}

// The measured grid: labelled values between an ink rule and a hairline.
export type Measured = { k: string; v: ReactNode; unit?: string; id?: string; tone?: 'forest' }
export function MeasuredGrid({ items, className, id }: { items: Measured[]; className?: string; id?: string }) {
  return (
    <dl className={['mgrid', className ?? ''].filter(Boolean).join(' ')} id={id} style={items.length !== 4 ? { ['--n' as string]: items.length } : undefined}>
      {items.map((m) => (
        <div key={m.k}>
          <dt className="mono">{m.k}</dt>
          <dd id={m.id} className={m.tone === 'forest' ? 'is-forest' : undefined}>{m.v}{m.unit && <small>{m.unit}</small>}</dd>
        </div>
      ))}
    </dl>
  )
}

// The measured line: a thin line with two ticks and the value in the middle.
export function Measure({ children, onSheet }: { children: ReactNode; onSheet?: boolean }) {
  return <div className={`measure${onSheet ? ' on-sheet' : ''}`}><b>{children}</b></div>
}

export function Hairline({ ink }: { ink?: boolean }) {
  return <hr className={`rule${ink ? ' is-ink' : ''}`} />
}

export function BackButton({ label, onClick, onPhoto, icon = 'arrow-left' }: { label: string; onClick: () => void; onPhoto?: boolean; icon?: string }) {
  return (
    <button type="button" className={`back${onPhoto ? ' on-photo' : ''}`} aria-label={label} onClick={onClick}>
      <Icon name={icon} />
    </button>
  )
}

// One short message above the dock; a status region, so it is read out.
export function useToast() {
  const [text, setText] = useState('')
  const [on, setOn] = useState(false)
  const timer = useRef(0)
  const show = useCallback((t: string) => {
    setText(t); setOn(true)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOn(false), 2200)
  }, [])
  const node = <div className={`toast${on ? ' on' : ''}`} role="status">{text}</div>
  return [node, show] as const
}

// A light tick on a value change, where the phone allows it.
export function haptic() {
  try { if (navigator.vibrate && navigator.userActivation?.hasBeenActive) navigator.vibrate(4) } catch { /* not supported */ }
}

// The time skip: the clock runs on to the next thing that happens, hours counted from Wed 22 Oct 0:00,
// with the days and Saturday's times marked on a line; then onDone opens the next page.
// 08 -> 10 (Wed 9:12 -> Sat 7:22) and 11 -> 12 (Sat 7:40 -> 14:05).
const SKIP_MARKS: [number, string][] = [[24, 'THU'], [48, 'FRI'], [72, 'SAT'], [79 + 40 / 60, '7:40'], [80, '8:00'], [84.5, '12:30'], [85.5, '13:30']]
const SKIP_DAYS = ['WED 22 OCT', 'THU 23 OCT', 'FRI 24 OCT', 'SAT 25 OCT']
const skipFmt = (t: number) => [SKIP_DAYS[Math.min(3, Math.floor(t / 24))], `${Math.floor(t % 24)}:${String(Math.floor((t * 60) % 60)).padStart(2, '0')}`]
export function TimeSkip({ from, to, caption, onDone }: { from: number; to: number; caption: string; onDone: () => void }) {
  const done = useRef(onDone)
  const root = useRef<HTMLDivElement>(null)
  const day = useRef<HTMLSpanElement>(null)
  const clock = useRef<HTMLSpanElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  const x = (t: number) => ((t - from) / (to - from)) * 100
  const [d0, c0] = skipFmt(from)
  useLayoutEffect(() => {
    if (still()) { done.current(); return }
    const o = { t: from }
    const tl = gsap.timeline({ onComplete: () => done.current() })
      .fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      .to(o, {
        t: to, duration: 2.2, ease: 'power2.inOut', onUpdate: () => {
          const [d, c] = skipFmt(o.t)
          if (day.current) day.current.textContent = d
          if (clock.current) clock.current.textContent = c
          if (fill.current) fill.current.style.width = ((o.t - from) / (to - from)) * 100 + '%'
        },
      })
    return () => { tl.kill() }
  }, [from, to])
  return (
    <div className="skip" ref={root} aria-live="polite">
      <span className="day-l" ref={day}>{d0}</span>
      <span className="clock num" ref={clock}>{c0}</span>
      <div className="run" aria-hidden="true">
        <span className="base" /><span className="fill" ref={fill} />
        {SKIP_MARKS.filter(([t]) => t > from && t < to).map(([t, l]) => (
          <span key={l}><i style={{ left: `${x(t)}%` }} /><em style={{ left: `${x(t)}%` }}>{l}</em></span>
        ))}
      </div>
      <p className="small">{caption}</p>
    </div>
  )
}
