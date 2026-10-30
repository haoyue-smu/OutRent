import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBack } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import { BackButton, Mono, Sheet, haptic, useSheet } from '../../shell/direction'
import { PLACES, getState, hm, set, setClock, useStore, type Place } from '../../shell/store'
import { routeFor } from '../../pages'
import { useDragScroll } from '../../shell/dragScroll'
import spot from '@photos/06-delivery-return/assets/06-direction-handover-spot.webp'
import './delivery.css'

// 06 Delivery and collection · the fitter's line (v60). Where you meet (the hand-over spot as a photo, a white
// "Meet here" pin on the sign), then one row of time chips per leg that scrolls sideways and opens on the suggested
// time, with the ride between them, and the bill that starts with the two chosen times.
// Real state: both places (chosen separately) and any time go into the booking and on to every later page.

type Kind = 'd' | 'c'
const steps = (from: number, to: number, by: number) => { const out: string[] = []; for (let m = from * 60; m <= to * 60; m += by) out.push(`${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`); return out }
// delivery 7:00–12:00 every 20 min (7:00 is before the first courier run), collection 12:30–20:00 every 30 min
const TIMES: Record<Kind, string[]> = { d: steps(7, 12, 20), c: steps(12.5, 20, 30) }
const SUGGESTED: Record<Kind, string> = { d: '7:40', c: '13:30' }
const FIRST_RUN = '7:00'

export default function Delivery() {
  const navigate = useNavigate()
  const back = useBack(() => navigate(routeFor('05-listing-detail')))
  const book = useStore((s) => s.book)
  const where = useSheet()
  const [draft, setDraft] = useState<{ d: Place; c: Place }>(book.place)
  const rows = useRef<Record<Kind, HTMLDivElement | null>>({ d: null, c: null })
  const both = book.d && book.c
  useDragScroll(() => [rows.current.d, rows.current.c])

  useEffect(() => { setClock(getState().paid ? '19:00' : '9:07') }, [])

  const choose = (k: Kind, t: string) => {
    set((s) => ({ ...s, book: { ...s.book, [k]: t } }))
    haptic()
  }

  // Each row opens on the chosen time, or on the suggested one, in the middle.
  useLayoutEffect(() => {
    (['d', 'c'] as Kind[]).forEach((k) => {
      const row = rows.current[k], c = row?.querySelector<HTMLElement>(`[data-t="${getState().book[k] ?? SUGGESTED[k]}"]`)
      if (row && c) row.scrollLeft = c.offsetLeft - row.clientWidth / 2 + c.offsetWidth / 2
    })
  }, [])

  const same = book.place.d === book.place.c
  const late = book.d && hm(book.d) > 8
  const cta = both ? 'See the fees' : book.d ? 'Pick a collection time' : 'Pick a delivery time'

  const leg = (k: Kind) => (
    <div className="leg6">
      <div className="lh"><Mono>{k === 'd' ? 'Delivery' : 'Collection'}</Mono><span className="dt6">Sat 25 Oct</span></div>
      <div className="chips6 row6" ref={(el) => { rows.current[k] = el }} role="group" aria-label={k === 'd' ? 'Delivery times' : 'Collection times'}>
        {TIMES[k].map((t) => (k === 'd' && t === FIRST_RUN
          ? <button key={t} type="button" className="c6" data-t={t} disabled aria-label={`${t}, before the first courier run`}>{t}</button>
          : <button key={t} type="button" className="c6" data-t={t} aria-pressed={book[k] === t} aria-label={`${k === 'd' ? 'Deliver' : 'Collect'} at ${t}`} onClick={() => choose(k, t)}>{t}</button>))}
      </div>
      {k === 'd' && late && <p className="note6">Arrives after your ride starts at 8:00.</p>}
    </div>
  )

  return (
    <>
      <main className="screen d-screen s6-screen">
        <div className="bar-top">
          <BackButton label="Back to the listing" onClick={back} />
          <Mono className="mid">Sat 25 Oct</Mono>
          <span />
        </div>
        <div className="pad">
          <h1 className="t-h1">Delivery and collection</h1>
          <figure className="meet6">
            <div className="ph">
              {book.place.d === 0 ? <>
                <Photo src={spot} alt="The Chestnut trailhead carpark on a Saturday morning, the low wooden park entrance sign at its edge" width={353} height={221} first />
                <span className="spot6" aria-hidden="true" />
                <span className="tag6" aria-hidden="true"><Icon name="map-pin-fill" />Meet here</span>
              </> : (
                <span className="todo" role="img" aria-label="Photo to come: Blk 325C Sengkang East Way"><span className="mono">Image to come</span><span className="w">Blk 325C Sengkang East Way, your home address</span></span>
              )}
            </div>
            <figcaption>
              <span className="tx">
                <b>{PLACES[book.place.d][0]}</b>
                <span>{same
                  ? (book.place.d === 0 ? 'By the park entrance sign' : 'Your home address')
                  : `Delivered here. Collected from ${book.place.c === 0 ? 'the Chestnut trailhead carpark, by the park entrance sign' : 'your home address, Blk 325C'}.`}</span>
              </span>
              <button className="link" type="button" onClick={() => { setDraft(book.place); where.show() }}>Change</button>
            </figcaption>
          </figure>
          {leg('d')}
          <div className="ride6n"><i /><span>Your ride with Coach Aisyah · <b>8:00–12:30</b></span><i /></div>
          {leg('c')}
          <dl className="bill6">
            <div className="when"><dt>Delivery</dt><dd className={book.d ? undefined : 'wait'}>{book.d ? `25 Oct · ${book.d}` : 'Pick a time'}</dd></div>
            <div className="when"><dt>Collection</dt><dd className={book.c ? undefined : 'wait'}>{book.c ? `25 Oct · ${book.c}` : 'Pick a time'}</dd></div>
            <div><dt>Trek Marlin 7, 1 day</dt><dd>S$38</dd></div>
            <div><dt>Delivery and collection</dt><dd>S$12</dd></div>
            <div className="tot"><dt>All-in for Sat 25 Oct</dt><dd>S$50</dd></div>
          </dl>
        </div>
      </main>
      <div className="dock"><button type="button" className="cta" style={{ width: '100%' }} disabled={!both} onClick={() => navigate(routeFor('07-fees-liability'))}>{cta}</button></div>

      <Sheet sheet={where} label="Where to meet" title="Where to meet" closeLabel="Close, keep the places as they are">
        {(['d', 'c'] as Kind[]).map((k) => (
          <div key={k} className="where6">
            <Mono>{k === 'd' ? 'Delivery' : 'Collection'}</Mono>
            {PLACES.map((p, i) => (
              <button key={p[0]} type="button" className="opt" aria-pressed={draft[k] === i} onClick={() => { setDraft((x) => ({ ...x, [k]: i as Place })); haptic() }}>
                <span className="rad" /><b>{i === 0 ? 'Chestnut trailhead carpark' : 'Your home address'}</b><span /><span className="s">{i === 0 ? 'By the park entrance sign' : PLACES[1][0]}</span>
              </button>
            ))}
          </div>
        ))}
        <button type="button" className="cta" style={{ width: '100%', marginTop: 16 }} onClick={() => { set((s) => ({ ...s, book: { ...s.book, place: draft } })); haptic(); where.hide() }}>Use these places</button>
      </Sheet>
    </>
  )
}
