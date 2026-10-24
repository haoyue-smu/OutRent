import { Link as RouterLink, useNavigate } from 'react-router-dom'
import type { ComponentProps } from 'react'
import { routeFor } from '../pages'

// Links between pages go by page id, the same way the plain-HTML pages used data-goes-to.
// state opens one of the page's frames (?state=…), for example the notification centre on 01.
export function GoTo({ page, state, ...rest }: { page: string; state?: string } & Omit<ComponentProps<typeof RouterLink>, 'to' | 'state'>) {
  return <RouterLink to={routeFor(page) + (state ? `?state=${state}` : '')} {...rest} />
}

// Back returns to the page Daniel came from. Opened directly (no earlier page in the app), it calls fallback.
export function useBack(fallback: () => void) {
  const navigate = useNavigate()
  return () => ((window.history.state?.idx ?? 0) > 0 ? navigate(-1) : fallback())
}
