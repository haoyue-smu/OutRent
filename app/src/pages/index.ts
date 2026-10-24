import type { ComponentType } from 'react'
import Home from './01-home/Home'

// Register a page here when it is built: import Home from './01-home/Home'; then '01-home': Home.
export const pageComponents: Record<string, ComponentType> = {
  '01-home': Home,
}
