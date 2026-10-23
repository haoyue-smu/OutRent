import { Link as RouterLink } from 'react-router-dom'
import type { ComponentProps } from 'react'
import { routeFor } from '../pages'

// Links between pages go by page id, the same way the plain-HTML pages used data-goes-to.
export function GoTo({ page, ...rest }: { page: string } & Omit<ComponentProps<typeof RouterLink>, 'to'>) {
  return <RouterLink to={routeFor(page)} {...rest} />
}
