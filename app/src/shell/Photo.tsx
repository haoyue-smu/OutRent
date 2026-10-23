// Haoyue's photos (WebP copies in work/haoyue/<page>/assets/, imported as @photos/…). The only place the app renders <img>.
export function Photo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <img className={['photo', className ?? ''].filter(Boolean).join(' ')} src={src} alt={alt} decoding="async" />
}
