import iconsUrl from '@design/icons.svg?url'

// Phosphor icons from design/icons.svg, by symbol name without the i- prefix ("bell", "house-fill").
export function Icon({ name, small, className }: { name: string; small?: boolean; className?: string }) {
  const cls = ['icon', small ? 'is-sm' : '', className ?? ''].filter(Boolean).join(' ')
  return (
    <svg className={cls} viewBox="0 0 256 256" aria-hidden="true">
      <use href={`${iconsUrl}#i-${name}`} />
    </svg>
  )
}
