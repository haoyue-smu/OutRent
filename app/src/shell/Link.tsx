import { Link as RouterLink } from 'react-router-dom'
import type { ComponentProps } from 'react'
import { routeFor } from '../pages'

// Links between pages go by page id, the same way the plain-HTML pages used data-goes-to.
// state opens one of the page's frames (?state=…), for example the notification centre on 01.
export function GoTo({ page, state, ...rest }: { page: string; state?: string } & Omit<ComponentProps<typeof RouterLink>, 'to' | 'state'>) {
  return <RouterLink to={routeFor(page) + (state ? `?state=${state}` : '')} {...rest} />
}
