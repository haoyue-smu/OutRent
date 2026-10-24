// Haoyue's photos (WebP copies in work/haoyue/<page>/assets/, imported as @photos/…). The only place the app renders <img>.
// width and height are the size the photo is shown at, so the page does not shift while it loads; CSS still sets the size.
export function Photo({ src, alt, className, width, height, first }: {
  src: string; alt: string; className?: string; width: number; height: number; first?: boolean
}) {
  return (
    <img
      className={['photo', className ?? ''].filter(Boolean).join(' ')}
      src={src} alt={alt} width={width} height={height} decoding="async"
      fetchPriority={first ? 'high' : undefined}
    />
  )
}
