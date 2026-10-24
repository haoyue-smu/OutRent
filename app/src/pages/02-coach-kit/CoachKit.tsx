import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GoTo, useBack } from '../../shell/Link'
import { routeFor } from '../../pages'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import coachAisyah from '@photos/01-home/assets/01-home-coach-aisyah.webp'
import bike from '@photos/01-home/assets/01-home-bike.webp'
import './kit.css'

// Which frame of the board to show. Change this one value, or open the page with ?state=<frame>.
//   'with-fit'           E2-5 · kit with fit profile
//   'with-fit-scrolled'  E2-5 · kit with fit profile · scrolled (opens scrolled to "Already yours")
//   'without-fit'        E2-5 · kit without fit profile
type Frame = 'with-fit' | 'with-fit-scrolled' | 'without-fit'
const FRAMES: Frame[] = ['with-fit', 'with-fit-scrolled', 'without-fit']
const FRAME = 'with-fit' as Frame

// ---------- mock data (MOCK-DATA v1.2: Daniel, 176 cm, frame M) ----------
const SEED_FIT = { height: 176, frame: 'M', saddle: 72 }
const RIDE = { date: '25\u00a0Oct', when: '25\u00a0Oct · 8:00–12:30 · Chestnut Nature Park' }
const ALSO = [
  { icon: 'sneaker', name: 'Regular sports shoes', note: 'Wear', skip: false },
  { icon: 'drop', name: '2 water bottles · sunscreen', note: 'Bring', skip: false },
  { icon: 'x', name: 'Clipless pedals', note: 'Not needed on a first ride', skip: true },
]

// A new ?state starts the page fresh, so each frame opens as drawn.
export default function CoachKitPage() {
  const state = useSearchParams()[0].get('state') as Frame | null
  const frame = state && FRAMES.includes(state) ? state : FRAME
  return <CoachKit key={frame} frame={frame} />
}

function CoachKit({ frame }: { frame: Frame }) {
  const FIT = frame === 'without-fit' ? null : SEED_FIT
  const navigate = useNavigate()
  const back = useBack(() => navigate(routeFor('01-home')))
  const screen = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const owned = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)

  // The bar names the page once the big title has scrolled under it.
  const onScroll = () => {
    const el = screen.current, h = heading.current
    if (el && h) setScrolled(el.scrollTop > h.offsetTop + h.offsetHeight - 98)
  }
  useEffect(() => {
    // After the font loads, so the text above has its final height.
    if (frame === 'with-fit-scrolled') document.fonts.ready.then(() => owned.current?.scrollIntoView({ block: 'start' }))
    onScroll()
  }, [frame])

  return (
    <main className="screen is-white" ref={screen} onScroll={onScroll}>
      <div className="topbar kit-bar">
        <button type="button" className="icon-btn" aria-label="Back" onClick={back}><Icon name="arrow-left" /></button>
        <span className="name">{scrolled ? "Coach’s kit" : ''}</span>
        <span />
      </div>
      <div className="kit-page">
        <div className="kit-head">
          <div className="kit-coach">
            <Photo src={coachAisyah} alt="Coach Aisyah, portrait" width={56} height={56} />
            <div className="kit-stack">
              <span className="t-callout kit-strong">Coach Aisyah</span>
              <span className="t-foot">Kit list for her Saturday ride</span>
            </div>
          </div>
          <div className="kit-title">
            <h1 className="t-large" ref={heading}>First ride at Chestnut</h1>
            <span className="t-callout">{RIDE.when}</span>
          </div>
        </div>

        <div className="card">
          <div className="kit-rent">
            <Photo src={bike} alt="A mountain bike with front suspension, side view" className="kit-bike" width={321} height={200} />
            <div className="kit-stack is-gap">
              <span className="t-label">Rent</span>
              <span className="t-title">Mountain bike, front suspension</span>
            </div>
            {FIT ? (
              <>
                <div className="kit-size">
                  <div className="p-hero">
                    <span className="k">Your frame size</span>
                    <span className="t-display">{FIT.frame}</span>
                    <span className="sub">Saddle height {FIT.saddle}&nbsp;cm</span>
                  </div>
                  <GoTo page="03-fit-profile" state="fit-filled" className="t-foot kit-fit"><Icon name="ruler" small />From your fit · {FIT.height}&nbsp;cm<Icon name="caret-right" small /></GoTo>
                </div>
                <GoTo page="04-search-results" className="btn is-block">Find bikes for {RIDE.date}</GoTo>
              </>
            ) : (
              <>
                <div className="kit-stack is-gap">
                  <span className="t-callout">Sized to the rider</span>
                  <span className="t-foot">Your frame size appears once your height is in</span>
                </div>
                <div className="kit-actions">
                  <GoTo page="03-fit-profile" state="fit-empty" className="btn is-block">Add your height</GoTo>
                  <GoTo page="04-search-results" className="btn is-text">Find bikes without a size</GoTo>
                </div>
              </>
            )}
          </div>
        </div>

        <section className="kit-section" ref={owned}>
          <h2 className="t-title">Already yours</h2>
          <div className="card kit-list is-owned">
            <div className="kit-item">
              <Icon name="check-circle" className="is-owned" />
              <div className="kit-stack is-gap">
                <span className="t-callout kit-strong">Road helmet</span>
                <span className="t-foot">In My gear · last used 22&nbsp;Oct</span>
              </div>
            </div>
            <div className="t-foot kit-checked"><Icon name="backpack" small />Checked against My gear</div>
          </div>
        </section>

        <section className="kit-section">
          <h2 className="t-title">Also for Saturday</h2>
          <div className="card kit-list">
            {ALSO.map((a, i) => (
              <div key={a.name}>
                {i > 0 && <hr className="divider" />}
                <div className="kit-item">
                  <Icon name={a.icon} className={a.skip ? 'is-skip' : undefined} />
                  <div className="kit-stack is-gap">
                    <span className={`t-callout kit-strong${a.skip ? ' is-struck' : ''}`}>{a.name}</span>
                    <span className="t-foot">{a.note}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="card is-filled">
          <div className="kit-quote">
            <span className="t-label">From the coach</span>
            <p className="t-body">“Chestnut’s easy loop is fine on any hardtail that fits you. Spend money on fit, not on the bike.”</p>
            <span className="t-foot">Coach Aisyah</span>
          </div>
        </div>
      </div>
    </main>
  )
}
