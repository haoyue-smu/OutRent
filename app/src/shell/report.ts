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
  generalReply: 'Thanks for the report. It’s on our record for this bike now, not yours.',
  outcome: 'On the shop’s record · not chargeable to you',
}

// The approved scratch report has a specific reply; every other submitted report uses the general acknowledgement.
export const isScratchReport = (report: HandoverReport) => report.sent && report.reason === 'Damaged' && report.photos.includes('drive')
export const reportReply = (report: HandoverReport) => isScratchReport(report) ? REPORT.reply : REPORT.generalReply
export const REPORT_SEED: HandoverReport = { reason: 'Damaged', photos: ['drive'], details: '', sent: true }

// Keep the app's existing offset convention for a different delivery slot; the seeded booking stays 7:46/7:47/7:49.
export function reportTimes(s: State) {
  // Derive from whole minutes so an exact 7:49 clock reaches the reply boundary without floating-point drift.
  const deliveredMinute = Math.round(deliverH(s) * 60)
  const sentH = (deliveredMinute + 6) / 60, savedH = (deliveredMinute + 7) / 60, replyH = (deliveredMinute + 9) / 60
  return { sentH, savedH, replyH, sentAt: dateTime(sentH), sentShort: clockOf(sentH), savedAt: dateTime(savedH), replyAt: dateTime(replyH) }
}

export const hasReportReply = (s: State, now = s.now) => s.report.sent && now >= reportTimes(s).replyH
