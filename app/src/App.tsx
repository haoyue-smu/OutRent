import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { pages, routeFor } from './pages'
import { PageFrame } from './shell/PageFrame'
import { pageComponents } from './pages/index'

// The design library reads every page's source, so it loads only when it is opened.
const Gallery = lazy(() => import('./gallery/Gallery'))

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={routeFor(pages[0].id)} replace />} />
      <Route path="/components" element={<Suspense fallback={null}><Gallery /></Suspense>} />
      {pages.map((p) => {
        const Page = pageComponents[p.id]
        return <Route key={p.id} path={routeFor(p.id)} element={<PageFrame meta={p}>{Page ? <Page /> : null}</PageFrame>} />
      })}
    </Routes>
  )
}
