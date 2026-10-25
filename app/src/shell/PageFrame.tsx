import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { gsap } from 'gsap'
import type { PageMeta } from '../pages'
import { still } from './direction'
import { useClockText } from './store'

// Every page renders inside one phone. On a computer that is an iPhone 16 frame (393 × 852) centred on a plain
// page, with a drawn status bar; on a phone the app fills the screen and the phone draws its own status bar.
// Arriving pages move like the prototype: a push slides in from the right, Back comes in from the left.
// A page that runs its own arrival (state.how: 'morph' from 04's photo, 'skip' after a time skip) is left alone;
// state.how 'fade' cross-fades instead (07 -> 08 after paying, the tabs); state.how 'back' moves like Back (a page
// whose Back goes to a page further down the history, e.g. 12 -> Bookings).

// Pages whose top is a dark photo or the forest band: the status bar turns white.
const DARK_TOP = new Set(['01-home', '05-listing-detail', '15-equipment-detail', '16-storage-options'])

// A tap right after a page change, or right after a button changed its own label (data-lock-at), is the second
// half of a double tap: it is dropped, so it cannot press the next page's button in the same place.
let lastShow = 0
export function lock(el: HTMLElement | null) { if (el) el.dataset.lockAt = String(performance.now()) }
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const now = performance.now()
    const b = (e.target as HTMLElement).closest<HTMLElement>('button, a, label, [role=tab]')
    if (now - lastShow < 450 || (b?.dataset.lockAt && now - Number(b.dataset.lockAt) < 450)) { e.stopPropagation(); e.preventDefault() }
  }, true)
}

export function PageFrame({ meta, children }: { meta: PageMeta; children?: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null)
  const nav = useNavigationType()
  const location = useLocation()
  const how = (location.state as { how?: string } | null)?.how
  const clock = useClockText()

  useEffect(() => { lastShow = performance.now() }, [location.key])

  useLayoutEffect(() => {
    // The page the app opens on (router key 'default') just appears; StrictMode's second effect run sees the same key.
    const first = location.key === 'default'
    if (first || still() || !stage.current || (how && how !== 'fade' && how !== 'back')) return
    const el = stage.current, w = el.offsetWidth || 393
    const tween = how === 'fade'
      ? gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35, clearProps: 'opacity' })
      : nav === 'POP' || how === 'back'
      ? gsap.fromTo(el, { x: -60, opacity: 0.6 }, { x: 0, opacity: 1, duration: 0.42, ease: 'power3.out', clearProps: 'transform,opacity' })
      : gsap.fromTo(el, { x: w }, { x: 0, duration: 0.5, ease: 'expo.out', clearProps: 'transform' })
    return () => { tween.kill() }
  }, [nav, how, location.key])

  return (
    <div className="frame" data-page={meta.id} data-dark-top={DARK_TOP.has(meta.id) ? '' : undefined}>
      <div className="frame-stage" ref={stage}>
        {children ?? (
          <main className="screen frame-empty">
            <p className="mono">{meta.num}</p>
            <h1 className="t-h1">{meta.name}</h1>
            <p className="small">Not built yet.</p>
          </main>
        )}
      </div>
      <div className="status" aria-hidden="true">
        <span className="num">{clock}</span>
        <span className="r">
          <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor" /><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor" /><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" /></svg>
          <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0L8 11.5Zm-4.2-4.3L2.3 5.7a8 8 0 0 1 11.4 0l-1.5 1.5a5.9 5.9 0 0 0-8.4 0ZM.6 4 0 3.4a11.3 11.3 0 0 1 16 0l-.6.6-.9.9A10 10 0 0 0 1.5 4.9L.6 4Z" fill="currentColor" /></svg>
          <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="18" height="9" rx="2" fill="currentColor" /><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity=".45" /></svg>
        </span>
      </div>
    </div>
  )
}
