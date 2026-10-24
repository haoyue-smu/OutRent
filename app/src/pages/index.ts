import type { ComponentType } from 'react'
import Home from './01-home/Home'
import CoachKit from './02-coach-kit/CoachKit'
import FitProfile from './03-fit-profile/FitProfile'
import Search from './04-search-results/Search'
import Listing from './05-listing-detail/Listing'
import Delivery from './06-delivery-return/Delivery'
import Fees from './07-fees-liability/Fees'
import Booked from './08-booking-confirmation/Booked'
import Tracking from './10-delivery-tracking/Tracking'
import Handover from './11-handover-check/Handover'
import Summary from './12-rental-summary/Summary'
import Weekly from './13-weekly-ride/Weekly'

// Register a page here when it is built: import Home from './01-home/Home'; then '01-home': Home.
export const pageComponents: Record<string, ComponentType> = {
  '01-home': Home,
  '02-coach-kit': CoachKit,
  '03-fit-profile': FitProfile,
  '04-search-results': Search,
  '05-listing-detail': Listing,
  '06-delivery-return': Delivery,
  '07-fees-liability': Fees,
  '08-booking-confirmation': Booked,
  '10-delivery-tracking': Tracking,
  '11-handover-check': Handover,
  '12-rental-summary': Summary,
  '13-weekly-ride': Weekly,
}
