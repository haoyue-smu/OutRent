import type { ReactNode } from 'react'
import type { PageMeta } from '../pages'

// Every page renders inside one 393 × 852 frame. A page with no component yet shows its name.
export function PageFrame({ meta, children }: { meta: PageMeta; children?: ReactNode }) {
  return (
    <div className="frame" data-page={meta.id}>
      {children ?? (
        <main className="screen frame-empty">
          <p className="t-label">{meta.num}</p>
          <h1 className="t-large">{meta.name}</h1>
          <p className="t-foot">Not built yet.</p>
        </main>
      )}
    </div>
  )
}
