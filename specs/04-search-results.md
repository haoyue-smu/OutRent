# 04 Search Results

**Designer:** Amanda  ·  **Where:** Home search, or Coach's Kit → "Find a bike"

## Purpose
Daniel picks a bike that fits him and is free on Saturday. Every result shows the all-in price, not just the day rate.

## Links
- Comes from: 02-coach-kit · 01-home
- Goes to: 05-listing-detail · 03-fit-profile (edit fit)

Link with `data-goes-to="<page-id>"`.

## Must show
- Filters already applied, visible and removable: hardtail · frame M · Sat 25 Oct · delivers to Chestnut
- Results from shops and private owners, clearly labelled which is which
- Top result: Trek Marlin 7, size M, Timah Cycles (shop), Bukit Timah, S$38 / day, all-in S$53*
- 2–3 more results (e.g. a private owner's Giant Talon, a shop's Merida Big.Nine) with their own all-in totals*
- A "Fits you" chip where the frame matches his fit
- Way to edit his fit (→ 03)

## Shared transition (required)
The photo on the Trek Marlin 7 card must have `style="view-transition-name: listing-photo"`, and the page needs `<style>@view-transition { navigation: auto; }</style>`. 05 Listing Detail uses the same name, so tapping the card grows its photo into the next page. Only that one card gets the name.

## States
- Loading
- No results for these filters (say which filter to relax)

## Iter1 problem this page fixes
HE #1 (total excluded charges), HE #8. Make the fix obvious: a tester should notice it without being told.

## Room for your design
Everything above must be on the page. How it is ordered, grouped and interacted with is yours. A second version is optional; if you build one, it must differ in structure, information order or interaction pattern.
