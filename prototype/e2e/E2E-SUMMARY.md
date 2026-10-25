# OutRent · end-to-end test round 1 (25 Oct 2026, cloud, Chromium, v27)

Scripted Playwright journeys, tapping only from Home; 18 out of scope. Totals: E1 157/164 · E2 53/90 · E3 17/44 · E4 39/51 · E5 42/57 · E6 87/111 · E7 48/55 = 443/572. Scripts E1–E7.js kept in the cloud session for re-runs.


---

# E1 · Daniel, first rental, default choices (Chromium; WebKit not installed, skipped)

Run: 01 → 02 (and back) → 03 → Save → 04 (and back to 02, re-enter) → 05 (photos, back, Edit fit round trip) → 06 (7:40 / 13:30, carpark) → 07 (full terms, tick, PayNow) → 08 → 09 (tabs Home / My gear and back) → 10 (van run, back to 09, re-enter) → 11 (3 photos, 2 marks, save, see all) → 12 → 13 (back, re-enter, start) → 09 after the ride → 13 / Past / Home. Tapping only.
**164 checks, 157 passed, 7 failed.** Every MOCK-DATA value on the default path is right (prices, fit 72/M/25%/+1, IDs, 7:40/13:30, 22 Oct · 9:12, 18 Oct · 16:20, 25 Oct · 7:40, 14:05, S$45, 1 Nov, countdowns 12 h 40 min and 6 days 17 h). No console or page errors. No dead ends, no loops, state survives tabs and re-entry (06, 10 arrival, 11 record, 13 series).

Failures, worst first:
1. (sev 2) 01 Home after booking: still the no-bookings variant, "Wed 22 Oct · Good morning", clock 9:01, no sign of OR-10482, although the story is at Fri 19:00 (MOCK-DATA §1 off-route clock). Shot E1-1.
2. (sev 2) 09 reached by back from 10: shows "Fri 24 Oct · 19:00", clock 19:00 and "12 h 40 min" while it is Sat 7:40 and the bike is at the sign. Shot E1-3.
3. (sev 1) 13 opened from 09: back button labelled "Back to the summary" but goes to Bookings. Shot E1-7.
4. (sev 1, known) 10 courier not named Hafiz (FIXES 15); 12 secondary action still "Book a different bike" (FIXES 1); 11 report a problem and 13 skip/pause/stop only toast (FIXES 11, 12, states not built).

As Daniel: "On the path the demo expects, everything adds up, from S$50 to S$150 back; only Home pretends nothing happened after I paid."

---

# E2 · Daniel makes different choices (Chromium)

Run: 01 → 02 → 03 (drag height to 170, inside leg to 78 → saddle 69, frame M) → 04 → 05 (Edit fit round trip) → 06 (Change → home address for delivery, collection left at the carpark; 8:00 then 7:20; 17:30) → 07 (Visa ·4821, tick) → back to 06 (collection → 14:30) → 07 → pay → 08 → 09 → 10 → 11 → 12 → 13 → 09. Tapping only.
**90 checks, 53 passed, 37 failed.** What works: 03 tapes and derived values, 04, 06 itself (place toggle, slots, clash note, day line, fee), back 07 → 06 keeps every choice, 07 keeps Visa and the tick and the total stays S$50. No console errors.

Confirmed: **every page after 06 ignores 03's fit and 06's choices; all of them are static HTML.** Exactly which values fall back to the default:
- 05: saddle 72 (not 69), "From your height 176 cm and inside leg 81 cm" (also after the Edit fit round trip).
- 07: full terms "your own photos at 25 Oct · 7:40" (not 7:20). 07 does not show times/place otherwise.
- 08: saddle 72; Deliver 25 Oct · 7:40 (not 7:20); Collect 25 Oct · 13:30 (not 14:30); place carpark (not Blk 325C); banner 7:40.
- 09: countdown 12 h 40 min (should be 12 h 20 min); "Arrives at the trailhead"; saddle 72; place carpark.
- 10: ETA 7:40, clock runs to 7:40, "park entrance sign" as destination and arrival; saddle 72.
- 11: clock 7:40; photo, mark and record times 25 Oct · 7:40; button "collected at 13:30"; skip caption "Collected at 13:30".
- 12: 7:40 delivered at the carpark, saddle 72; 13:30 collected; "Checked against the 7:40 photos"; deposit released 14:05, before his 14:30 collection (impossible); weekly offer 7:40 / 13:30 / carpark.
- 13 and 09 weekly: 7:40 / 13:30 / carpark; ruler "RIDE 7:40–13:30"; Past "closed 25 Oct · 14:05".
- Payment: no page after 07 shows the method, so Visa cannot fall back (08 stamp says only "Paid S$50").
- (sev 1) 06 hand-over spot photo stays the carpark sign when delivery is at home.

Fix (one change covers almost all): the state already exists (`fit`, `book.d`, `book.c`, `book.place`); render 05, 07 terms, 08, 09, 10, 11, 12, 13 and the skip captions from it on enter. A 7:20 slot or home delivery needs stage times / a home route from the PO for 10.

As Daniel: "I asked for 7:20 at my flat and 14:30 pick-up, paid, and every page after that told me 7:40 at the carpark; I'd have been waiting at the wrong place."

---

# E3 · Beginner from Home, without the coach's post

Steps run: 44 (every Home control, all four tabs, the fit profile at 155/60, 195/95, 155/95, 195/60, then pay and read 08, 09, 10 for a 155/60 rider). Passed 17, failed 27. No console errors. WebKit is not installed (only Chromium), so it was skipped.

Failures, most serious first:
1. **sev 3 · The fit profile reaches no later page.** 03 works correctly (155 → S, 195 → L, saddle = 0.883 × leg: 53 / 84 cm, bike label matches). But 04 (query "Hardtail M", three M bikes with a green fit tick), 05 (72 cm / M / "From your height 176 cm and inside leg 81 cm"), the 08 job tag, 09 proof row and 10 fit row all stay at the seeded 176/81 values. A 155 cm rider is told an M bike is "Set to your fit". This breaks E1-4.
2. **sev 3 · Home has no way into renting except the coach post.** The docket What/To/When/Search and all four category tiles only show a toast. That breaks E2-1 (Must) and MOCK §12 ("the Home tiles lead to real data"). For Paddleboards and Camping this is known, FIXES 3.
3. **sev 3 · Bookings before booking.** Bookings at Wed 22 Oct 9:01, before anything is paid, shows OR-10482 "S$50 paid" with a Track delivery button, dated Fri 24 Oct 19:00.
4. sev 2 · The bell and the Profile tab only show toasts. A beginner cannot reach the fit profile from Profile (MOCK §3).
5. sev 2 · No plausibility check: 155 cm with a 95 cm leg gives saddle 84 cm on frame S, and 195 cm with a 60 cm leg gives 53 cm on frame L. 195 cm is above the size chart (to 188) but is shown as a plain L.
6. sev 1 · Inside leg cannot be left empty, although it is optional (no height-only state). 03 opens pre-filled with Daniel's numbers, not an empty first entry.

As the persona: "I tapped everything on Home and only the coach's post went anywhere. When I finally entered my 155 cm, the app agreed I'm an S, then sold me an M 'set to my fit'."

done E3 17/44, 27 failures

---

# E4 · Careful renter, back and forth on 04–08

Steps run: 51. I tapped Back on 04, 05, 06 and 07 and went forward each time. I opened and closed the full terms twice (plus once with Escape), ticked and unticked the terms, changed the payment method 5 times, walked 07 → Home with five Backs, paid, closed 08, booked a second time with other choices, then used browser Back. Passed 39, failed 12. No console errors.

What holds: totals stay S$38 + S$12 + S$0 = S$50 with the S$150 deposit on 05, 07 and 08 on every pass. Times and place on 06 are kept across Back, forward and Home, with no duplicated marks. Pay is enabled only when the terms are ticked; a forced tap while it is disabled does nothing. The pay label follows the method. The full terms cover the pay button. The Back history walks 07 → 06 → 05 → 04 → 02 → 01 with no repeats.

Failures, most serious first:
1. **sev 3 · Choices on 06 are not carried.** A second booking with 7:20 / 14:30 / home address still shows Deliver 7:40, Collect 13:30 and the Chestnut carpark on the 08 tag and on 09. The 08 tag is fixed text.
2. **sev 2 · A new checkout starts already ticked.** After a booking is paid, the next visit to 07 comes back with the terms ticked and Visa chosen, so Pay is enabled at once. The second booking also gets the same ID, OR-10482.
3. sev 2 · 08 and 09 never say which method paid (Visa ·4821). 07 does not repeat the chosen times before Pay. Home does not show the upcoming rental after paying. Browser/system Back leaves the prototype (about:blank).
4. sev 1 · "Change" for place and for payment toggles silently instead of listing the options. Escape does not close the full terms.

As the persona: "Going back and forth never lost my numbers, which is reassuring. But when I changed my times the confirmation still showed the old ones, and the next checkout was already ticked for me."

done E4 39/51, 12 failures

---

# E5 · Daniel as a weekly regular: 42/57 passed, 15 failed (Chromium; WebKit not installed at /opt/pw-browsers, skipped)

Steps run (taps only): Home → 02 → 03 → 04 → 05 → 06 (7:40 / 13:30, carpark) → 07 (PayNow) → 08 → 09 → 10 → 11 (3 photos, 2 marks) → 12 → back / forward → 13 Start every Saturday → skip / pause / stop → back to 12 → 13 → 09 → Past → 12 → back → 09 → open the weekly ride → back → tabs → Home → Weekly promo → Bookings → the coach post again. No console or page errors.
Passes: every value carried through. The fee, the S$50 total, PayNow, OR-10482 and the 25 Oct · 14:05 close are right. 13 and 09 show S$45, From 1 Nov, 7:40 / 13:30, Chestnut trailhead carpark by the park entrance sign, "Next ride, Sat 1 Nov, in 6 days 17 h" and "THU 30 OCT · 20:00 · S$45". Past is right, and the offer row is gone once the series is set up. Tab state survives, and 13 reopened from 09 shows the set-up heading and controls.

Failures, ranked:
1. (2) Back on 12 (after the ride) lands on the 11 hand-over at clock 7:40, not Bookings (E5-12d).
2. (2) 12 still shows "Ride again every Saturday / Set up every Saturday" after the series is set up, both after back from 13 and when opened from Past (E5-13e, E5-15a).
3. (2) Home ignores everything: Wed 22 Oct, "Good morning", clock 9:01 after Sat 14:07, no weekly ride, and the promo toasts "Weekly rides are set up after a first rental." (E5-18b/c/e). (1) The finished 25 Oct ride is still promoted under "This weekend" (E5-18d).
4. (2) Known, FIXES 12: Skip / Pause / Stop only show a toast. Nothing breaks, and the screen, heading and button stay intact.
5. (2) 13 reopened from Bookings still says "Nothing is charged today", the set-up offer wording (E5-16b). (2) 09's ruler says "S$45 CHARGED" for 30 Oct while "now" is 25 Oct (E5-14e).
6. (1) 13 reopened from 09: the dock reads "See it in Bookings" and the back label "Back to the summary", but both lead to 09 (E5-16c/d). (1) Known, FIXES 1: 12's "Book a different bike" is a toast.

As Daniel: booking and setting up the weekly ride felt solid, and the numbers never changed on me. But after that the app forgot: Home still thinks it's Wednesday morning and invites me to set up something I already have.

---

# E6 · Daniel as owner of the Giant Escape 3: 87/111 passed, 24 failed (Chromium; pass A = door pickup + next-day return, pass B = Rack S drop + pooled return)

Steps run (taps only): Home → My gear tab → the other 3 items → Add an item (close half-filled, reopen, save, add again, tap the pump) → Home and back → Giant (at home) → 16 (rent-out terms: X / scrim / Close; back / forward) → 17 (switch rack↔door, back / forward, book) → back to 15 and 14 before the pickup day → 17 → time skip → 15 at the Hub → rent-out sheet (tick, untick, X, scrim, reopen, opt in) → Bring it back (switch, close, reopen, schedule) → My gear → Giant again → (A) Home storage card → 16 → 17 again → Bookings. No console or page errors.
Passes: every MOCK value on 15 / 16 / 17 is right: S$18 / month, S$10 door 17:00–19:00, S$5 Rack S 7:00–10:00 with "drop by 7:00", Tue 28 Oct, the return Free / S$8 shown before sending, 70% / S$8.40 / S$12, the intake 28 Oct · 19:45 · OutRent Hub with 3 photos and "good, chain worn", "1 day ago", Wed 29 Oct, 10:00, "Available to rent · S$0", and the return Fri 31 Oct free / 30 Oct · 17:00–19:00 S$8. The tick and the button stay in sync, and so do the sheets. The pump add flow and its draft also work.

Failures, ranked:
1. (3) Confirmed: after the Hub intake, My gear still shows the Giant "Not used since 24 May · 5 months ago · corridor · blocks the corridor" with the corridor photo, while 15 says "At the OutRent Hub since 28 Oct · 1 day ago" (E6A/B-14b). The 14 header stays "Fri 24 Oct" (2) and the clock stays 19:00 against 10:00 on 15 (1).
2. (3) After the pickup is booked (before the skip), 15 still reads "At home" with "Store it at the Hub", and 14 has no sign of the pickup (2) (E6A/B-10, 10b).
3. (2) Coming back via Home's storage card, 16 still offers "Send the Giant Escape 3". 17 shows the old booking, and "See it at the Hub" replays the Fri→Wed time skip (E6A-16b/c). Home itself stays Wed 22 Oct, 9:01, "Make room at home" (E6A-16).
4. (2) Bookings on "Wed 29 Oct" still shows "Fri 24 Oct · 19:00, Tomorrow, OR-10482". (1) No storage pickup or return is listed in Bookings (E6A-17, 17b).
5. (2) Known, FIXES 17: Canyon, helmet and bike box only toast. (1) The added pump only toasts too. (1) A second "Add an item" toasts "already in My gear" instead of adding (E6A-05b).
6. (1) Neither pickup way (door S$10 / Rack S S$5) carries to 15 at the Hub, so the two passes end identical (11e). After a return is scheduled, the rent-out row still says "Available to rent" (13e).

As Daniel: storing the Giant felt clear and honest on its own pages. But My gear kept telling me the bike was still blocking my corridor after the Hub had checked it in, so I couldn't trust the list.

---

# E7 · Chaos

Steps run: 55, each part from a fresh page.
- **A · Tabs mid-flow:** leaving the booking at 06, the tracking ride and the storage flow at 17.
- **B · Double-taps:** a real finger double-tap with a 90 ms gap on 17 primary buttons, each followed by one Back.
- **C · Taps during skips:** taps during the four time skips and the van ride.
- **D · Reloads:** at 07, and after the weekly set-up.
- **E · Reduced motion:** the whole route 01 → 13 → 09 → 14 → 17 → Hub with prefers-reduced-motion.

Passed 48, failed 7. No console errors. WebKit is not installed, so it was skipped.

What holds:
- Flow pages have no tab bar and always offer Back or Close (E0-2).
- Leaving through Home or tabs and coming back keeps the 06 times and the 17 choice.
- Skip overlays swallow taps and always clear.
- The disabled "Waiting for the bike" button ignores taps.
- Pay and the plain push buttons survive a double-tap with no duplicated history.
- Reduced motion reaches every page; the stamp shows and 10 arrives at once.

Reload always returns to Home and loses everything: fit, 06 times, the tick, Visa, the closed rental, the weekly series and Past. That is acceptable for a prototype. After a reload Bookings again shows the not-yet-delivered OR-10482.

Failures, most serious first:
1. **sev 3 · Bookings shows OR-10482 as paid** while the booking is still open on 06 and unpaid.
2. **sev 2 · Two rides at once on 10.** Back out of tracking 1.5 s into the ride and Track again: the old ride's finish fires during the new one. The page says "At the park entrance sign" with "in 15 min", the clock reads 7:25, and "Start the hand-over check" is already enabled.
3. **sev 2 · A double-tap's second tap lands on the next page's button in the same spot**, so a whole page is skipped:
   - 02 "Rent" → 03 "Save fit": the fit is saved unseen.
   - 15 "Store it" → 16 "Send": the storage price page is skipped.
4. **sev 2 · A double-tap on a button that changes its own label fires its second action at once**, skipping the "done" moment:
   - 11 "Save the hand-over record" jumps to 12.
   - 13 "Start every Saturday" jumps to 09 before the ring is tied.
   - 17 "Book door pickup" jumps to Wed 29 Oct.

As the persona: "Tapping around never broke it badly and I always got back. But twice a double-tap skipped a whole page, and the van said it had arrived while it was still 15 minutes away."

done E7 48/55, 7 failures
