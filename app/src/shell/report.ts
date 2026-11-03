import { clockOf, dateTime, type HandoverReport, type State } from './store'
import { deliverH } from './rental'

// PO-ANSWERS-v1.11: the cosmetic scratch belongs to the shop's record. No repair is needed.
export const REPORT = {
  reference: 'R-10482-1',
  sentAt: '25 Oct · 7:46',
  sentShort: '7:46',
  savedAt: '25 Oct · 7:47',
  replyAt: '25 Oct · 7:49',
  reply: 'Thanks for the photo. The scratch is on our record for this bike now, not yours. Enjoy the ride.',
  outcome: 'On the shop’s record · not chargeable to you',
}

// Other form choices remain submitted; this is the only supplier response in the approved mock data.
export const isScratchReport = (report: HandoverReport) => report.sent && report.reason === 'Damaged' && report.photos.includes('drive')
export const REPORT_SEED: HandoverReport = { reason: 'Damaged', photos: ['drive'], details: '', sent: true }

// Keep the app's existing offset convention for a different delivery slot; the seeded booking stays 7:46/7:47/7:49.
export function reportTimes(s: State) {
  const sentH = deliverH(s) + 6 / 60, savedH = deliverH(s) + 7 / 60, replyH = deliverH(s) + 9 / 60
  return { sentH, savedH, replyH, sentAt: dateTime(sentH), sentShort: clockOf(sentH), savedAt: dateTime(savedH), replyAt: dateTime(replyH) }
}
