import type { ComponentType } from 'react'
import Home from './01-home/Home'
import CoachKit from './02-coach-kit/CoachKit'
import FitProfile from './03-fit-profile/FitProfile'
import Search from './04-search-results/Search'
import Listing from './05-listing-detail/Listing'
import Delivery from './06-delivery-return/Delivery'
import Summary from './12-rental-summary/Summary'

// Register a page here when it is built: import Home from './01-home/Home'; then '01-home': Home.
export const pageComponents: Record<string, ComponentType> = {
  '01-home': Home,
  '02-coach-kit': CoachKit,
  '03-fit-profile': FitProfile,
  '04-search-results': Search,
  '05-listing-detail': Listing,
  '06-delivery-return': Delivery,
  '12-rental-summary': Summary,
}
