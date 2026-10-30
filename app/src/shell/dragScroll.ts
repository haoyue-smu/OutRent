import { useEffect } from 'react'
import { gsap } from 'gsap'
import { still } from './direction'

// Every row that scrolls sideways uses this. With a mouse, press and drag scrolls the row; on release it settles on
// the nearest snap point, or runs on a little if it has none. A drag of more than 6 px is not a tap. Touch and
// trackpad never reach it: they keep the browser's own scrolling and snapping.
const TAP = 6
const THROW_MS = 200      // how far a flick carries, as this many ms at the speed it left the mouse
const REST_MS = 80        // held still this long before letting go: no flick
const SETTLE_S = 0.32

// On a computer the phone frame is scaled to fit the window: the mouse moves in screen pixels, the row in its own.
const scaleOf = (el: HTMLElement) => el.getBoundingClientRect().width / el.offsetWidth || 1

function snapPoints(el: HTMLElement) {
  const box = el.getBoundingClientRect(), max = el.scrollWidth - el.clientWidth, k = scaleOf(el)
  const out: number[] = []
  for (const c of Array.from(el.children)) {
    const align = getComputedStyle(c).scrollSnapAlign
    if (!align || align === 'none') continue
    const r = c.getBoundingClientRect(), left = (r.left - box.left) / k + el.scrollLeft
    const at = align.includes('center') ? left + r.width / k / 2 - el.clientWidth / 2 : left
    out.push(Math.min(max, Math.max(0, at)))
  }
  return out
}

export function dragScroll(el: HTMLElement) {
  let id: number | null = null, x0 = 0, left0 = 0, lastX = 0, lastT = 0, speed = 0, k = 1
  let dragged = false, swallow = false
  let tween: gsap.core.Tween | null = null
  el.classList.add('drag-x')
  el.querySelectorAll('img').forEach((i) => { i.draggable = false })

  const rest = () => { tween = null; el.classList.remove('is-dragging') }
  const settle = () => {
    const from = el.scrollLeft, half = el.clientWidth / 2
    const aim = from + Math.max(-half, Math.min(half, speed * THROW_MS))
    const pts = snapPoints(el)
    const to = pts.length ? pts.reduce((a, b) => (Math.abs(b - aim) < Math.abs(a - aim) ? b : a)) : Math.max(0, Math.min(el.scrollWidth - el.clientWidth, aim))
    if (still() || Math.abs(to - from) < 1) { el.scrollLeft = to; rest(); return }
    tween = gsap.to(el, { scrollLeft: to, duration: SETTLE_S, ease: 'power3.out', onComplete: rest })
  }

  const down = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    id = e.pointerId; x0 = lastX = e.clientX; left0 = el.scrollLeft; lastT = e.timeStamp; speed = 0; k = scaleOf(el)
    // Caught while settling: the row is already moving, so this press holds it rather than taps it.
    dragged = !!tween
    tween?.kill(); tween = null
    if (dragged) el.setPointerCapture(id)
  }
  const move = (e: PointerEvent) => {
    if (e.pointerId !== id) return
    if (!dragged) {
      if (Math.abs(e.clientX - x0) <= TAP) return
      dragged = true; x0 = e.clientX; left0 = el.scrollLeft
      el.setPointerCapture(id)
      el.classList.add('is-dragging')
    }
    el.scrollLeft = left0 - (e.clientX - x0) / k
    const dt = e.timeStamp - lastT
    if (dt > 0) speed = 0.7 * ((lastX - e.clientX) / k / dt) + 0.3 * speed
    lastX = e.clientX; lastT = e.timeStamp
  }
  const up = (e: PointerEvent) => {
    if (e.pointerId !== id) return
    id = null
    if (!dragged) return
    if (e.timeStamp - lastT > REST_MS) speed = 0
    // The click comes straight after this, on the same turn; one that does not come must not eat a later one.
    swallow = true
    window.setTimeout(() => { swallow = false }, 0)
    settle()
  }
  const click = (e: MouseEvent) => {
    if (!swallow) return
    swallow = false
    e.preventDefault(); e.stopPropagation()
  }
  const noImageDrag = (e: DragEvent) => e.preventDefault()

  el.addEventListener('pointerdown', down)
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)
  el.addEventListener('click', click, true)
  el.addEventListener('dragstart', noImageDrag)
  return () => {
    tween?.kill()
    el.removeEventListener('pointerdown', down)
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerup', up)
    el.removeEventListener('pointercancel', up)
    el.removeEventListener('click', click, true)
    el.removeEventListener('dragstart', noImageDrag)
    el.classList.remove('drag-x', 'is-dragging')
  }
}

// The rows a page has, read once it is on screen.
export function useDragScroll(rows: () => (HTMLElement | null)[]) {
  useEffect(() => {
    const off = rows().filter((r): r is HTMLElement => !!r).map(dragScroll)
    return () => off.forEach((f) => f())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
