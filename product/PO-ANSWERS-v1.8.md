# PO window · answers to inbox task of 25 Oct 12:00

25 Oct 2026. REQUIREMENTS.md at **v1.8**, MOCK-DATA.md at **v1.7**, branch `product-requirements`. No existing value changed; rules and derived values added.

## 1 · Deposit on PayNow (07, 08; persona review)

**(a).** The S$50 is paid by PayNow (the default); the S$150 deposit is held on Visa ···4821, not charged, released after the return check. A PayNow transfer cannot hold money, so a deposit is never held on PayNow. Rule in MOCK-DATA §2; §4 Deposit row and payment lines updated.

- 07: "Pay now · S$50 · PayNow" and "Deposit · S$150 · held on Visa ···4821, not charged · released after the return check".
- 08: "Paid · S$50 · PayNow" and "Deposit · S$150 · held on Visa ···4821 · released after the return check".

Consequence for **VS-3 (E4-9)**, which the question did not raise but (a) forces: a declined card can take neither the charge nor the hold, so when Daniel switches to PayNow the deposit is paid and **refunded** after the return check (option (c) as the fallback). 08 in VS-3 shows "Paid · S$200 · PayNow", lines "Rental S$50" and "Deposit S$150 · refunded after the return check", and every later page of that booking says "refunded". E4-9 AC2 and VS-3 updated. Design: the VS-3 confirmation gains these lines; raise E4-9 if more is needed.

## 2 · FIXES 19 · 17 Hub pickup date

**Seeded more slots.** Home collection: Sat 25 – Fri 31 Oct, one 17:00–19:00 slot each day, Tue 28 chosen; pooled runs Tue 28 Oct and Fri 31 Oct. Both ways no longer resolve to one date; Tue 28 is Daniel's choice, not the only option. MOCK-DATA §9.

## 3 · FIXES 20 · weekly offer before the first ride

**Confirmed.** The weekly ride can be set up from the upcoming booking in trips as well as from the closed rental (E5-8); either way the series starts the Saturday after the booked ride, Sat 1 Nov. "First ride in 7 days 12 h" from Fri 24 Oct 19:00 is right (7 d 12 h 40 min, truncated). E6-1 AC1 and FD-RECURRING updated. The route entry stays 12 → 13 (E5-8, Must); the 09 offer is on an off-route page and inherits Should. Copy bound: before the ride the offer may not say he liked it.

## 4 · FIXES 21 · 09 derived values

**All three confirmed:** "Arrives in 12 h 40 min" (§1, already exists); "Next ride, Sat 1 Nov, in 6 days 17 h" from 25 Oct 14:07 (6 d 17 h 33 min, truncated; 14:07 adopted as the setup time in FD-RECURRING); first charge S$45 at the Thu 20:00 skip deadline before 1 Nov. One format fix: the house form is **"30 Oct · 20:00"**, without the weekday (MOCK-DATA rules, date-with-time).

## 5 · FIXES 22 · 15 at the Hub "1 day ago"

**Confirmed.** Relative day labels count calendar days from the current "now": 28 Oct seen from 29 Oct · 10:00 is "1 day ago", as 22 Oct seen from 24 Oct is "2 days ago" (§1). Rule now written in §1; "yesterday" for "1 day ago" is copy.

## Not done

- FIXES 18 dropped with page 18 (Haoyue, 25 Oct 10:26); Rack S and the storage-map values stay in MOCK-DATA, unused.
- Open questions 6 and 12 untouched. Merge into main: Build does it.
