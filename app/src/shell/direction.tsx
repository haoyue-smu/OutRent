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

// The time skip: the clock runs from booking (Wed 22 Oct 9:12) to the deposit release (Sat 25 Oct 14:05),
// hours counted from Wed 0:00, the days marked on a line and Saturday 7:40 in forest. Then onDone opens 12.
const SKIP_T0 = 9 + 12 / 60, SKIP_T1 = 72 + 14 + 5 / 60
const skipX = (t: number) => ((t - SKIP_T0) / (SKIP_T1 - SKIP_T0)) * 100
const SKIP_DAYS = ['WED 22 OCT', 'THU 23 OCT', 'FRI 24 OCT', 'SAT 25 OCT']
const skipFmt = (t: number) => [SKIP_DAYS[Math.min(3, Math.floor(t / 24))], `${Math.floor(t % 24)}:${String(Math.floor((t * 60) % 60)).padStart(2, '0')}`]
export function TimeSkip({ onDone }: { onDone: () => void }) {
  const done = useRef(onDone)
  const root = useRef<HTMLDivElement>(null)
  const day = useRef<HTMLSpanElement>(null)
  const clock = useRef<HTMLSpanElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    if (still()) { done.current(); return }
    const o = { t: SKIP_T0 }
    const tl = gsap.timeline({ onComplete: () => done.current() })
      .fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      .to(o, {
        t: SKIP_T1, duration: 2.4, ease: 'power2.inOut', onUpdate: () => {
          const [d, c] = skipFmt(o.t)
          if (day.current) day.current.textContent = d
          if (clock.current) clock.current.textContent = c
          if (fill.current) fill.current.style.width = skipX(o.t) + '%'
        },
      })
    return () => { tl.kill() }
  }, [])
  return (
    <div className="skip" ref={root} aria-live="polite">
      <span className="day-l" ref={day}>WED 22 OCT</span>
      <span className="clock num" ref={clock}>9:12</span>
      <div className="run" aria-hidden="true">
        <span className="base" /><span className="fill" ref={fill} />
        {([[24, 'THU'], [48, 'FRI'], [72, 'SAT']] as const).map(([t, l]) => (
          <span key={l}><i style={{ left: `${skipX(t)}%` }} /><em style={{ left: `${skipX(t)}%` }}>{l}</em></span>
        ))}
        <i className="is-ride" style={{ left: `${skipX(79 + 40 / 60)}%` }} />
      </div>
      <p className="small">Delivery, hand-over and the ride happen here. Pages 10 and 11 come in the next batch.</p>
    </div>
  )
}
