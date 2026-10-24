import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import lockup from '@design/brand/outrent-lockup.svg?raw'
import { useBack } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import { BackButton, Mono, session, still } from '../../shell/direction'
import { routeFor } from '../../pages'
import aisyah from '@photos/01-home/assets/01-direction-aisyah-avatar.webp'
import post from '@photos/01-home/assets/01-direction-02-coach-post.webp'
import bike from '@photos/01-home/assets/01-direction-cat-bikes.webp'
import helmet from '@photos/02-coach-kit/assets/02-direction-kit-helmet.webp'
import shoes from '@photos/02-coach-kit/assets/02-direction-kit-shoes.webp'
import bottles from '@photos/02-coach-kit/assets/02-direction-kit-bottles.webp'
import sunscreen from '@photos/02-coach-kit/assets/02-direction-kit-sunscreen.webp'
import pedals from '@photos/02-coach-kit/assets/02-direction-kit-clipless-pedals.webp'
import './kit.css'

// 02 Coach's post · the fitter's line. Her photo, her note, her list; OutRent only adds one drawer: the bike you
// need, and that your helmet is already in My gear. The drawer pops up like a notification, tucks away when the
// post is touched, and comes back when Daniel taps the thing he does not have (the hardtail).
// Source: the Creative Director's prototype "OutRent · direction" (#02, variant a: the sheet), approved 25 Oct 02:28.

type Item = { src: string; alt: string; name: string; note?: string; pos?: string }
const KIT: Item[] = [
  { src: helmet, alt: 'A black mountain-bike helmet', name: 'Bike helmet', note: 'Any bike helmet. A road helmet is fine.' },
  { src: shoes, alt: 'Grey running shoes', name: 'Sports shoes', note: 'Your regular running shoes.' },
  { src: bottles, alt: 'Two water bottles', name: '2 water bottles' },
  { src: sunscreen, alt: 'A tube of sunscreen', name: 'Sunscreen' },
]
type Sheet = 'hidden' | 'up' | 'open' | 'down'

export default function CoachKit() {
  const navigate = useNavigate()
  const back = useBack(() => navigate(routeFor('01-home')))
  const [sheet, setSheet] = useState<Sheet>('hidden')
  const [ping, setPing] = useState(false)
  const screen = useRef<HTMLElement>(null)
  const need = useRef<HTMLButtonElement>(null)
  const y0 = useRef<number | null>(null)

  // The drawer rises a moment after the post appears.
  useEffect(() => {
    const t = window.setTimeout(() => setSheet('up'), still() ? 0 : 650)
    return () => clearTimeout(t)
  }, [])

  const up = () => setSheet((s) => (s === 'open' ? 'open' : 'up'))
  // Tapping the hardtail centres it in the page's own list (never scrollIntoView) and opens the drawer.
  const showNeed = () => {
    const sc = screen.current, el = need.current
    if (sc && el) {
      const r = el.getBoundingClientRect(), b = sc.getBoundingClientRect()
      sc.scrollTo({ top: sc.scrollTop + (r.top + r.height / 2) - (b.top + b.height / 2), behavior: still() ? 'auto' : 'smooth' })
    }
    setSheet('open')
    setPing(true)
    window.setTimeout(() => setPing(false), 900)
  }
  const onPost = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('.need-bike')) return
    if (sheet === 'up' || sheet === 'open') setSheet('down')
  }
  const onDown = (e: PointerEvent) => { if (!(e.target as HTMLElement).closest('.cta')) y0.current = e.clientY }
  const onUp = (e: PointerEvent) => {
    if (y0.current == null) return
    const d = e.clientY - y0.current
    y0.current = null
    if (d < -20) setSheet('open')
    else if (d > 20) setSheet((s) => (s === 'open' ? 'up' : 'down'))
  }
  const rent = () => navigate(routeFor(session.hasFit ? '04-search-results' : '03-fit-profile'), { state: { from: 'post' } })

  return (
    <>
      <main className="screen d-screen s2-screen" ref={screen}>
        <div className="bar-top">
          <BackButton label="Back to Home" onClick={back} />
          <Mono className="mid">Post</Mono>
          <span />
        </div>
        <article className="cpost" onClick={onPost}>
          <header className="author">
            <span className="av"><Photo src={aisyah} alt="Coach Aisyah" width={40} height={40} className="av-img" /></span>
            <div><b>Coach Aisyah</b><span className="small">Mountain bike coach</span></div>
          </header>
          <div className="cpost-ph"><Photo src={post} alt="Hardtails and helmets lined up at the Chestnut trailhead on a Saturday morning" width={369} height={277} first className="post-img" /></div>
          <div className="cpost-body">
            <h1 className="t-h1">First ride at Chestnut</h1>
            <div className="event">
              <span><Icon name="calendar-blank" />Sat 25 Oct · 8:00–12:30</span>
              <span><Icon name="map-pin" />Chestnut Nature Park</span>
            </div>
            <p className="cap">First time on the trails? Join my beginner ride this Saturday. Here’s what to bring.</p>
            <ul className="kit" aria-label="What to bring">
              <li>
                <button type="button" ref={need} className={`kit-it need-bike${ping ? ' ping' : ''}`} onClick={showNeed} aria-label="Hardtail mountain bike: you need one. Show how to rent it">
                  <span className="th"><Photo src={bike} alt="" width={60} height={60} className="bike-img" /></span>
                  <span className="tx"><b>Hardtail mountain bike</b><span>A mountain bike with suspension at the front only. Get one in your size.</span></span>
                </button>
              </li>
              {KIT.map((k) => (
                <li key={k.name} className="kit-it">
                  <span className="th"><Photo src={k.src} alt={k.alt} width={60} height={60} /></span>
                  <span className="tx"><b>{k.name}</b>{k.note && <span>{k.note}</span>}</span>
                </li>
              ))}
            </ul>
            <div className="kit-skip">
              <Mono>Not needed</Mono>
              <ul className="kit">
                <li className="kit-it is-skip">
                  <span className="th"><Photo src={pedals} alt="A clipless pedal beside a cycling shoe with a cleat" width={60} height={60} /></span>
                  <span className="tx"><b>Clipless pedals</b><span>Pedals that lock onto special shoes. Leave them for later rides.</span></span>
                </li>
              </ul>
            </div>
          </div>
        </article>
      </main>

      <section className={`vsheet is-${sheet}`} aria-label="OutRent, for this ride" onPointerDown={onDown} onPointerUp={onUp}>
        <button type="button" className="grab" aria-label={sheet === 'open' ? 'Show less' : 'Show more'} aria-expanded={sheet === 'open'}
          onClick={() => setSheet((s) => (s === 'down' ? 'up' : s === 'open' ? 'up' : 'open'))}><i /></button>
        <button type="button" className="sh-head" onClick={up} aria-label="OutRent, for this ride">
          <span className="sh-logo" aria-hidden="true" dangerouslySetInnerHTML={{ __html: lockup }} /><Mono>For this ride</Mono>
        </button>
        {sheet !== 'open' && <div className="sh-sum">You need a hardtail mountain bike. Your helmet is already in My gear.</div>}
        {sheet === 'open' && (
          <div className="sh-more">
            <div className="orow"><span className="th"><Photo src={bike} alt="" width={44} height={44} className="bike-img" /></span><span className="tx"><b>Hardtail mountain bike</b><span>Rent one, set to your fit and delivered to Chestnut.</span></span></div>
            <div className="orow"><span className="th is-have"><Icon name="check" /></span><span className="tx"><b>Bike helmet</b><span>Your road helmet is in My gear.</span></span></div>
          </div>
        )}
        <button type="button" className="cta" onClick={rent}>Rent a hardtail for Sat 25 Oct</button>
      </section>
    </>
  )
}
