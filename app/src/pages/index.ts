import type { ComponentType } from 'react'
import Home from './01-home/Home'
import CoachKit from './02-coach-kit/CoachKit'
import FitProfile from './03-fit-profile/FitProfile'

// Register a page here when it is built: import Home from './01-home/Home'; then '01-home': Home.
export const pageComponents: Record<string, ComponentType> = {
  '01-home': Home,
  '02-coach-kit': CoachKit,
  '03-fit-profile': FitProfile,
}
