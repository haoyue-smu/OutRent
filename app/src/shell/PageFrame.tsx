import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { gsap } from 'gsap'
import type { PageMeta } from '../pages'
import { still } from './direction'

// Every page renders inside one 393 × 852 frame. A page with no component yet shows its name.
// Arriving pages move like the prototype: a push slides in from the right, Back comes in from the left.
// A page that runs its own arrival (state.how: 'morph' from 04's photo, 'skip' after the time skip) is left alone;
// state.how 'fade' cross-fades instead (07 -> 08 after paying).
export function PageFrame({ meta, children }: { meta: PageMeta; children?: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null)
  const nav = useNavigationType()
  const location = useLocation()
  const how = (location.state as { how?: string } | null)?.how

  useLayoutEffect(() => {
    // The page the app opens on (router key 'default') just appears; StrictMode's second effect run sees the same key.
    const first = location.key === 'default'
    if (first || still() || !stage.current || (how && how !== 'fade')) return
    const el = stage.current
    const tween = how === 'fade'
      ? gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35, clearProps: 'opacity' })
      : nav === 'POP'
      ? gsap.fromTo(el, { x: -60, opacity: 0.6 }, { x: 0, opacity: 1, duration: 0.42, ease: 'power3.out', clearProps: 'transform,opacity' })
      : gsap.fromTo(el, { x: 393 }, { x: 0, duration: 0.5, ease: 'expo.out', clearProps: 'transform' })
    return () => { tween.kill() }
  }, [nav, how, location.key])

  return (
    <div className="frame" data-page={meta.id}>
      <div className="frame-stage" ref={stage}>
        {children ?? (
          <main className="screen frame-empty">
            <p className="t-label">{meta.num}</p>
            <h1 className="t-large">{meta.name}</h1>
            <p className="t-foot">Not built yet.</p>
          </main>
        )}
      </div>
    </div>
  )
}
