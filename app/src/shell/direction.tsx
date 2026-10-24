import { useCallback, useRef, useState, type ReactNode } from 'react'
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

export function BackButton({ label, onClick, onPhoto }: { label: string; onClick: () => void; onPhoto?: boolean }) {
  return (
    <button type="button" className={`back${onPhoto ? ' on-photo' : ''}`} aria-label={label} onClick={onClick}>
      <Icon name="arrow-left" />
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
