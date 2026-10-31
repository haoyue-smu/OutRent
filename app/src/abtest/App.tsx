import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { still } from '../shell/direction'
import { PARTS, type PartId } from '../pages/11-handover-check/pieces'
import { deviceName, makeQueue, startRow, type Queue, type Variant } from './api'
import { Camera, Entry, HandoverPage, Preference, Questions, ReportForm, ReportSent, Thanks } from './Screens'
import { clearRow, dropNew, readParams, readRow, readSaved, writeRow, writeSaved, type Row, type Saved, type Screen } from './session'
import { decoded, mineOf, preload } from './story'

// The test's own small state and its log. Every time is ms since the Start tap; t0 is on the row.
const SHOW_MS = 1000       // the simulated camera's preview
const FRAME_LIMIT = 120    // the preview counts as on screen after two frames, or this long if the browser holds frames back
const TAP_SLOP = 10        // a pointer that moved further than this was a scroll, not a tap
const SCROLL_EVERY = 250   // at most one scroll event per this many ms
const SCROLL_UP = 24       // a move up smaller than this is a finger settling, not scrolling back

// What was tapped, in words the log can be read in.
function tapTarget(el: Element): string {
  const part = () => el.closest('section.part')?.getAttribute('aria-label')?.split(' ')[0].toLowerCase() ?? ''
  if (el.closest('.reportrow')) return 'link'
  if (el.closest('.back')) return 'back'
  if (el.closest('.shot.taken')) return `photo:${part()}`
  if (el.closest('.shot')) return `take:${part()}`
  if (el.closest('.ph')) return `shop-photo:${part()}`
  const named = el.closest('[data-log]')
  if (named) return named.getAttribute('data-log')!
  return el.tagName.toLowerCase()
}
const FIRST_TAP: Record<string, string> = { link: 'link', save: 'save', back: 'back' }
const inView = (el: Element | null, scroller: Element | null, dock: Element | null) => {
  if (!el || !scroller) return false
  const r = el.getBoundingClientRect(), top = scroller.getBoundingClientRect().top
  const bottom = dock ? dock.getBoundingClientRect().top : scroller.getBoundingClientRect().bottom
  return r.top + r.height / 2 >= top && r.top + r.height / 2 <= bottom
}

export default function App() {
  const [row, setRow] = useState<Row | null>(() => {
    const { forced, again } = readParams()
    const r = readRow()
    // A different ?v= on the same phone is a new forced row; everyone else stays on their row.
    if (again) dropNew()
    if (r && (again || (forced && r.variant !== forced))) { clearRow(); return null }
    return r
  })
  useEffect(() => { void preload() }, [])
  if (row?.done) return <div className="ab-root"><Thanks /></div>
  if (!row) return <div className="ab-root"><Start onRow={setRow} /></div>
  return <div className="ab-root"><Session row={row} /></div>
}

function Start({ onRow }: { onRow: (r: Row) => void }) {
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const start = async () => {
    setBusy(true); setFailed(false)
    const { forced, pilot } = readParams()
    try {
      const r = await startRow({ t0: Date.now(), forced, pilot, viewport_h: innerHeight, viewport_w: innerWidth, dpr: devicePixelRatio, device: deviceName(), user_agent: navigator.userAgent })
      writeRow(r)
      onRow(r)
    } catch { setFailed(true); setBusy(false) }
  }
  return <Entry onStart={start} busy={busy} failed={failed} />
}

function Session({ row }: { row: Row }) {
  const [s, setS] = useState<Saved>(() => readSaved(row.token))
  const [camera, setCamera] = useState<PartId | null>(null)
  const state = useRef(s); state.current = s
  const cameraRef = useRef(camera); cameraRef.current = camera
  const queue = useRef<Queue>(null as unknown as Queue)
  if (!queue.current) queue.current = makeQueue(row.token)
  const scroller = useRef<HTMLElement>(null)
  const link = useRef<HTMLButtonElement>(null)
  const handoverTop = useRef(0)
  const lastDrop = useRef<PartId | null>(null)
  const scrollAt = useRef(0)
  const peakY = useRef(0)
  const resumed = useRef(s.n > 0)
  const away = useRef(false)
  const taking = useRef(false)
  const down = useRef<{ x: number; y: number } | null>(null)

  const now = useCallback(() => Date.now() - row.t0, [row.t0])
  const patch = useCallback((p: Partial<Saved>) => {
    const next = { ...state.current, ...p }
    state.current = next
    setS(next)
    writeSaved(row.token, next)
  }, [row.token])
  const logEvent = useCallback((type: string, target?: string, data?: unknown) => {
    const n = state.current.n + 1
    patch({ n })
    queue.current.push({ events: [{ n, t: now(), type, screen: cameraRef.current ? 'camera' : state.current.screen, target, data }] })
  }, [now, patch])
  const setFields = useCallback((set: Record<string, unknown>) => queue.current.push({ set }), [])
  const go = (screen: Screen) => { if (screen !== 'handover') handoverTop.current = scroller.current?.scrollTop ?? handoverTop.current; patch({ screen }) }

  // The Start tap is t = 0; then every screen change, and the reload that resumes one.
  useEffect(() => { if (!resumed.current) queue.current.push({ events: [{ n: 0, t: 0, type: 'tap', screen: 'entry', target: 'start' }] }) }, [])
  useEffect(() => { logEvent('screen', s.screen) }, [s.screen, logEvent])

  // Away time. Reloading counts as coming back, so the rule on sessions that leave and return can be applied.
  useEffect(() => {
    const shown = (why?: string) => { away.current = false; queue.current.push({ hidden: [{ t: now(), state: 'shown' }] }); logEvent('show', why) }
    const leave = () => {
      if (!away.current) { away.current = true; queue.current.push({ hidden: [{ t: now(), state: 'hidden' }] }); logEvent('hide') }
      queue.current.beacon()
    }
    const vis = () => { if (document.visibilityState === 'hidden') leave(); else shown() }
    document.addEventListener('visibilitychange', vis)
    addEventListener('pagehide', leave)
    if (resumed.current) shown('reload')
    return () => { document.removeEventListener('visibilitychange', vis); removeEventListener('pagehide', leave) }
  }, [now, logEvent])

  // Hand-over open: page_open, and whether the link can be seen without scrolling.
  useLayoutEffect(() => {
    if (s.screen !== 'handover') return
    if (scroller.current) scroller.current.scrollTop = handoverTop.current
    setFields({ page_open: now() })
    const el = link.current, root = scroller.current, dock = document.querySelector('.ab-root .dock')
    if (!el || !root || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => {
      setFields({ link_visible_on_load: e.intersectionRatio >= 0.5 })
      io.disconnect()
    }, { root, threshold: [0, 0.5, 1], rootMargin: `0px 0px -${dock?.getBoundingClientRect().height ?? 0}px 0px` })
    io.observe(el)
    return () => io.disconnect()
  }, [s.screen, now, setFields])

  // The simulated camera: the preview shows for 1.0 s from the moment it is on screen, then the photo drops into its slot.
  const take = async (id: PartId) => {
    if (taking.current || cameraRef.current || state.current.shots.includes(id)) return
    taking.current = true
    await decoded(mineOf(id))
    cameraRef.current = id
    taking.current = false
    setCamera(id)
  }
  useEffect(() => {
    if (!camera) return
    const part = camera
    let timer = 0, shown = false
    const onScreen = () => {
      if (shown) return
      shown = true
      const t = now()
      logEvent('photo', `preview:${part}`)
      if (part === 'drive' && state.current.damageAt === null) { patch({ damageAt: t }); setFields({ t_damage_visible: t }) }
      timer = window.setTimeout(() => {
        const shots = [...state.current.shots, part]
        lastDrop.current = part
        patch({ shots })
        const dropped = now()
        queue.current.push({ photo_taken: [{ part, t: dropped }] })
        logEvent('photo', `taken:${part}`, { count: shots.length })
        peakY.current = scroller.current?.scrollTop ?? 0
        setCamera(null)
      }, SHOW_MS)
    }
    // Frames stop while the page is hidden, and some browsers hold them back; the preview must still end.
    const frame = requestAnimationFrame(() => requestAnimationFrame(onScreen))
    const limit = window.setTimeout(onScreen, FRAME_LIMIT)
    return () => { cancelAnimationFrame(frame); clearTimeout(limit); clearTimeout(timer) }
  }, [camera, now, logEvent, patch, setFields])

  // The photo lands: the live page's short flash, nothing with reduced motion. The drivetrain's landing is also when the
  // link is measured against the screen.
  useLayoutEffect(() => {
    const part = lastDrop.current
    if (camera || !part) return
    lastDrop.current = null
    const name = PARTS.find((p) => p.id === part)!.name
    const flash = scroller.current?.querySelector(`section.part[aria-label="${name}"] .flash`)
    if (flash && !still()) gsap.fromTo(flash, { opacity: 0.95 }, { opacity: 0, duration: 0.5, ease: 'power2.out' })
    if (part === 'drive') setFields({ link_in_view_at_damage: inView(link.current, scroller.current, document.querySelector('.ab-root .dock')) })
  }, [camera, setFields])

  // Taps anywhere, including on things that do nothing. A disabled button lets its tap through to its dock (see the CSS).
  const onPointerDown = (e: React.PointerEvent) => { down.current = { x: e.clientX, y: e.clientY } }
  const onPointerUp = (e: React.PointerEvent) => {
    const d = down.current
    down.current = null
    if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > TAP_SLOP) return
    const target = tapTarget(e.target as Element)
    logEvent('tap', target)
    const c = state.current
    if (c.screen === 'handover' && c.shots.length === 3 && !c.firstTapDone && !cameraRef.current) {
      patch({ firstTapDone: true })
      setFields({ first_tap_after_photos: FIRST_TAP[target] ?? (target.startsWith('photo:') || target.startsWith('shop-photo:') ? 'a photo' : 'other') })
    }
  }

  // Scrolling on any screen goes in the events; on the hand-over it also goes in scroll_depth.
  const onScroll = (e: React.UIEvent) => {
    const el = e.target as HTMLElement
    if (!el.classList?.contains('ab-screen')) return
    const y = Math.round(el.scrollTop), t = now(), c = state.current
    if (c.screen === 'handover' && c.shots.length === 3) {
      peakY.current = Math.max(peakY.current, y)
      if (peakY.current - y >= SCROLL_UP) setFields({ scroll_up_after_photos: true })
    }
    if (t - scrollAt.current < SCROLL_EVERY) return
    scrollAt.current = t
    logEvent('scroll', undefined, { y })
    if (c.screen !== 'handover') return
    const max = Math.max(c.scrolledMax, y)
    if (max !== c.scrolledMax) patch({ scrolledMax: max })
    queue.current.push({ scroll_depth: [{ t, y, max }] })
  }

  const tapLink = () => {
    const c = state.current, t = now()
    if (c.damageAt !== null) { if (!c.reportTapped) { patch({ reportTapped: true }); setFields({ t_report_tap: t }) } }
    else { const taps = c.taps + 1; patch({ taps }); setFields({ report_taps_before_damage: taps }) }
    if (c.sent) return // one report only; the tap is in the log
    setFields({ report_opened: t })
    go('report')
  }
  const save = () => {
    const t = now()
    setFields({ record_saved: t, t_end: t, order: state.current.sent ? 'report then save' : 'save only' })
    patch({ left: state.current.left ?? (Math.random() < 0.5 ? 'a' : 'b') })
    go('questions')
  }
  const send = () => {
    const c = state.current
    setFields({ report_sent: now(), report_reason: c.reason, report_photos: c.photos, report_details_len: c.details.length, order: 'report only' })
    patch({ sent: true })
    go('sent')
  }
  const toggle = (id: PartId) => {
    const photos = state.current.photos.includes(id) ? state.current.photos.filter((x) => x !== id) : [...state.current.photos, id]
    patch({ photos })
    logEvent('form', 'report_photos', { photos })
  }
  const done = () => {
    const c = state.current
    setFields({ t_questions_done: now(), noticed: c.noticed, seq: c.seq, seq_why: c.seqWhy, open_text: c.openText })
    setFields({ preference_left: (c.left ?? 'a').toUpperCase() })
    go('preference')
  }
  const finish = () => {
    const c = state.current
    setFields({ t_finish: now(), preference: c.pick?.toUpperCase(), preference_why: c.why })
    patch({ screen: 'thanks' })
    writeRow({ ...row, done: true })
    queue.current.beacon()
  }

  return (
    <div className="ab-session" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { down.current = null }} onScrollCapture={onScroll}>
      {s.screen === 'handover' && (
        <HandoverPage variant={row.variant} shots={s.shots} sent={s.sent} linkRef={link} scrollRef={scroller}
          onTake={(id) => { void take(id) }} onLink={tapLink} onSave={save} />
      )}
      {s.screen === 'report' && (
        <ReportForm shots={s.shots} reason={s.reason} photos={s.photos} details={s.details}
          onBack={() => { go('handover') }}
          onReason={(reason) => { patch({ reason }); logEvent('form', 'report_reason', { reason }) }}
          onTogglePhoto={toggle}
          onDetails={(details) => { patch({ details }); logEvent('form', 'report_details', { len: details.length }) }}
          onSend={send} />
      )}
      {s.screen === 'sent' && <ReportSent reason={s.reason} count={s.photos.length} onBack={() => go('handover')} />}
      {s.screen === 'questions' && (
        <Questions noticed={s.noticed} seq={s.seq} seqWhy={s.seqWhy} openText={s.openText}
          onNoticed={(noticed) => { patch({ noticed }); setFields({ noticed }); logEvent('form', 'noticed', { noticed }) }}
          onSeq={(seq) => { patch({ seq }); setFields({ seq }); logEvent('form', 'seq', { seq }) }}
          onSeqWhy={(seqWhy) => { patch({ seqWhy }); setFields({ seq_why: seqWhy }); logEvent('form', 'seq_why', { len: seqWhy.length }) }}
          onOpenText={(openText) => { patch({ openText }); setFields({ open_text: openText }); logEvent('form', 'open_text', { len: openText.length }) }}
          onDone={done} />
      )}
      {s.screen === 'preference' && (
        <Preference left={s.left ?? 'a'} pick={s.pick} why={s.why}
          onPick={(pick: Variant) => { patch({ pick }); setFields({ preference: pick.toUpperCase() }); logEvent('form', 'preference', { pick: pick.toUpperCase() }) }}
          onWhy={(why) => { patch({ why }); setFields({ preference_why: why }); logEvent('form', 'preference_why', { len: why.length }) }}
          onFinish={finish} />
      )}
      {s.screen === 'thanks' && <Thanks />}
      {camera && <Camera part={camera} />}
    </div>
  )
}

