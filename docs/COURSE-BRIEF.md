# IS211 course brief for OutRent Iter2 (excerpt for the review)

From the project doc team/COURSE-BRIEF.md (21 Oct), built from the 22 lecture decks and the Week 10 class. Citations [L19 s26] = lecture 19, slide 26; "n" = speaker notes.

## 1. What the prototype is graded on (Class W10)

- Prototype / UI: 40 points, called "very important". "Detail and polish, consistent look". A design system: limited palette (about two main colours, the rest accents), composition, a component library.
- The easy scenario must not be too short; it shows enough screens.
- The course wants exception / error states covered.

## 2. What the prof values

1. **Data over opinion.** "Test, don't assume!" [L17 s16].
2. **Compare alternatives** [L05 s38].
3. **Design for people.** Personas from research; satisfy the primary persona completely first [L03 s12, s15].
4. **Every element has a purpose.** "Every time you use superfluous animations, a unicorn dies" [L07 s25n]. "Use more animations" and "use more colours" are wrong quiz answers [L07 s1n, s6n].
5. **Plain, scannable copy.** Start with the conclusion. Use half the words. Headings that are meaningful, not clever. No promotional tone [L10 s4–5].
6. **Test on real devices** [L09 s19n].
7. **AI helps but does not replace.** AI heuristic review is "only 50–75% accurate" [L12 s27]. Avoid "AI slop": content with no meaning, effort or human insight [L22 s16n].

## 6. Persona tests

- Tasks are realistic goals, not interface steps [L15 s12]. Do not break tasks into steps [L15 s12, s23].
- Define success criteria up front [L15 s11].
- Our simulated personas count as **inspection** (expert review / cognitive walkthrough), not user testing [L12 s26n; L13 s7].

Each persona run produces:
1. A goal-level task and its pass condition.
2. For every step, the 4 cognitive walkthrough questions [L12 s9]: Will they want to do this? Will they see the control? Will they recognise it as the right one? Will they understand the feedback?
3. Findings tagged with a Nielsen heuristic and the course **severity 0–4** [L12 s24]: 4 catastrophic (fix before release), 3 major, 2 minor, 1 cosmetic.
4. Critical incidents: smooth or bumpy moments [L15 s28n].
5. A tally in "N of M personas…" form [L14 s13].

Reviewers: 3–5 independent reviewers per page, then merge into one list [L12 s23, s25].

## 7. UI: what the course checks

- **Hierarchy and copy:** one clear focal point [L11 s3]; most important item first and largest [L11 s60n]; scannable copy, one idea per paragraph [L10 s4]; labels that tell you what you'll get (information scent) [L10 s13].
- **Memory:** recognition over recall; keep needed information visible [L07 s21]; chunk prices, codes and steps [L07 s5].
- **Touch:** bigger, closer targets (Fitts' Law); primary actions within thumb reach; bottom navigation [L08 s16–21; L09 s4n, s11].
- **Feedback:** immediate feedback, confirm actions, show status; state changes obvious; support interruption [L09 s6–7]. **Motion only as feedback**; decorative motion goes against L07 s25n and L09 s7n.
- **Colour:** one dominant colour plus accents; about 6 hues or fewer; text contrast at least 4.5:1; never colour alone [L11 s25–40].
- **Money:** fees that appear unexpectedly at checkout break the mental model [L06 s12]; show total, deposit and fees before the pay step.
- **Errors:** plain language with a way out; grey out options that can't be chosen; clear undo or exit [L12 s15–21].
