import { GoTo } from './Link'
import { Icon } from './Icon'

// The four tabs. The selected tab shows its filled icon and its label.
const TABS = [
  { page: '01-home', label: 'Home', icon: 'house' },
  { page: '09-trips', label: 'Bookings', icon: 'calendar-blank' },
  { page: '14-my-equipment', label: 'My gear', icon: 'backpack' },
  { page: '03-fit-profile', label: 'Profile', icon: 'user' },
]

export function TabBar({ current }: { current: string }) {
  return (
    <nav className="tabbar glass" aria-label="Tabs">
      {TABS.map((t) => {
        const on = t.page === current
        return (
          <GoTo key={t.page} page={t.page} aria-label={t.label} aria-current={on ? 'page' : undefined}>
            <Icon name={on ? `${t.icon}-fill` : t.icon} />
            <span className="label">{t.label}</span>
          </GoTo>
        )
      })}
    </nav>
  )
}
