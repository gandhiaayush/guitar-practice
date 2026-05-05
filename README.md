# Guitar Practice

A focused, single-file guitar chord-change practice tool. Pick your chords, set a timer interval, and practice transitions on autopilot.

## How to use

Open `index.html` in any browser. No build step, no dependencies, no server needed.

## Features

- **15 chords** — C, D, E, A, G, Am, Em, Dm, F, Bm, B, Cm, D7, A7, E7
- **SVG chord diagrams** — finger positions, muted/open string indicators, barre chord support
- **Two practice modes**:
  - **Random** — random chord changes at a set interval
  - **Progressive** — marks transitions you struggle with and weights them to appear more often
- **Configurable interval** — 3s, 5s, 10s, 15s, or 20s between changes
- **Metronome click** — subtle audio click on each chord change
- **Keyboard shortcuts**:
  - `Space` — pause / resume
  - `G` — mark "Got it" (progressive mode)
  - `S` — mark "Struggled" (progressive mode)
- **Session summary** — total transitions, duration, and your top struggle areas

## How Progressive Mode works

Each time you hit "Struggled" on a transition (e.g. C to D), that pair gets weighted 3x higher in the randomizer. After enough successful reps, the weight drops back down. It learns what's hard for you and drills those changes.
