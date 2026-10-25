import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { routeFor } from '../pages'
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
export const SKIP_MARKS: [number, string][] = [[24, 'THU'], [48, 'FRI'], [72, 'SAT'], [79 + 40 / 60, '7:40'], [80, '8:00'], [84.5, '12:30'], [85.5, '13:30']]
const SKIP_DAYS = ['WED 22 OCT', 'THU 23 OCT', 'FRI 24 OCT', 'SAT 25 OCT', 'SUN 26 OCT', 'MON 27 OCT', 'TUE 28 OCT', 'WED 29 OCT']
const skipFmt = (t: number) => [SKIP_DAYS[Math.min(7, Math.floor(t / 24))], `${Math.floor(t % 24)}:${String(Math.floor((t * 60) % 60)).padStart(2, '0')}`]
export function TimeSkip({ from, to, caption, onDone, marks = SKIP_MARKS }: { from: number; to: number; caption: string; onDone: () => void; marks?: [number, string][] }) {
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
    <div className="skip" ref={root} aria-live="polite" onClickCapture={(e) => { e.stopPropagation(); e.preventDefault() }}>
      <span className="day-l" ref={day}>{d0}</span>
      <span className="clock num" ref={clock}>{c0}</span>
      <div className="run" aria-hidden="true">
        <span className="base" /><span className="fill" ref={fill} />
        {marks.filter(([t]) => t > from && t < to).map(([t, l]) => (
          <span key={l}><i style={{ left: `${x(t)}%` }} /><em style={{ left: `${x(t)}%` }}>{l}</em></span>
        ))}
      </div>
      <p className="small">{caption}</p>
    </div>
  )
}


// The prototype's own line icons (24 px grid, drawn with a stroke), for the pieces Phosphor has no match for.
const IC: Record<string, string> = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  wrench: '<path d="M14.5 5.5a4 4 0 0 0 4.9 4.9L20 11l-9 9-3-3 9-9 .6-.6a4 4 0 0 0-3.1-1.9Z"/>',
  coins: '<ellipse cx="9" cy="8" rx="5" ry="2.5"/><path d="M4 8v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V8"/><path d="M10 15.5c.6 1.2 2.6 2 5 2 2.8 0 5-1.1 5-2.5v-4c0-1.3-1.9-2.3-4.4-2.5"/>',
  auto: '<path d="M20 11a8 8 0 0 0-14.9-3M4 4.5V8h3.5M4 13a8 8 0 0 0 14.9 3M20 19.5V16h-3.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  rain: '<path d="M7 15a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.6 1.4A3.4 3.4 0 0 1 17 15Z"/><path d="M8.5 18l-1 2.5M12.5 18l-1 2.5M16.5 18l-1 2.5"/>',
  bike: '<circle cx="5.5" cy="16" r="3.5"/><circle cx="18.5" cy="16" r="3.5"/><path d="M5.5 16 9 9h6l3.5 7M9 9l3 7M15 9l-3 7M8 6h3"/>',
}
export const IC_PATHS = IC
export function LineIcon({ name, className }: { name: string; className?: string }) {
  return <svg className={['ic', className ?? ''].filter(Boolean).join(' ')} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: IC[name] ?? '' }} />
}
export function Chev() {
  return <svg className="chev" viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M181.7 133.7l-80 80a8 8 0 0 1-11.4-11.4L164.7 128 90.3 53.7a8 8 0 0 1 11.4-11.4l80 80a8 8 0 0 1 0 11.4Z" /></svg>
}

// The tab bar of the root pages (01 Home, 09 Bookings, 14 My gear). Switching tabs cross-fades and starts a new
// history from that tab; Profile is not built yet and says so.
const TABS = [
  { page: '01-home', label: 'Home', icon: 'house-fill' },
  { page: '09-trips', label: 'Bookings', icon: 'calendar-blank' },
  { page: '14-my-equipment', label: 'My gear', icon: 'backpack' },
  { page: '', label: 'Profile', icon: 'user' },
]
export function TabBar({ current, onToast }: { current: string; onToast: (t: string) => void }) {
  const navigate = useNavigate()
  return (
    <nav className="tabbar" aria-label="Tabs">
      {TABS.map((t) => (
        <button key={t.label} type="button" aria-current={t.page === current ? 'page' : undefined}
          onClick={() => {
            if (!t.page) { onToast('Profile is not in this demo yet.'); return }
            if (t.page !== current) navigate(routeFor(t.page), { replace: true, state: { how: 'fade', tab: true } })
          }}>
          <Icon name={t.icon} />{t.label}
        </button>
      ))}
    </nav>
  )
}

// A sheet over the page with its scrim: Escape and the scrim close it, focus moves in and comes back.
export function useSheet() {
  const [open, setOpen] = useState(false)
  const back = useRef<HTMLElement | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const show = useCallback(() => { back.current = document.activeElement as HTMLElement; setOpen(true) }, [])
  const hide = useCallback(() => setOpen(false), [])
  const was = useRef(false)
  useEffect(() => {
    if (!open) { if (was.current) back.current?.focus?.({ preventScroll: true }); was.current = false; return }
    was.current = true
    const t = window.setTimeout(() => ref.current?.querySelector<HTMLElement>('button, input, [tabindex]')?.focus({ preventScroll: true }), 60)
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    addEventListener('keydown', k)
    return () => { clearTimeout(t); removeEventListener('keydown', k) }
  }, [open])
  return { open, show, hide, ref }
}
export function Sheet({ sheet, label, title, closeLabel, children, className }: {
  sheet: ReturnType<typeof useSheet>; label: string; title: ReactNode; closeLabel: string; children: ReactNode; className?: string
}) {
  return (
    <>
      <div className={`scrim${sheet.open ? ' on' : ''}`} onClick={sheet.hide} />
      <div ref={sheet.ref} className={`sheetx${sheet.open ? ' on' : ''}${className ? ' ' + className : ''}`} role="dialog" aria-modal="true" aria-label={label} aria-hidden={!sheet.open}>
        <span className="grab07" aria-hidden="true" />
        <div className="sx-h"><h2 className="t-h2">{title}</h2><button className="xbtn" type="button" aria-label={closeLabel} onClick={sheet.hide}><LineIcon name="x" /></button></div>
        {children}
      </div>
    </>
  )
}
