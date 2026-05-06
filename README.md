# Guitar Practice

A focused guitar practice tool with chord diagrams, microphone-based chord detection, real-time feedback, and guided song practice.

## How to use

Open `index.html` in any browser. No build step, no dependencies, no server needed.

## Features

- **15 chords** — C, D, E, A, G, Am, Em, Dm, F, Bm, B, Cm, D7, A7, E7
- **SVG chord diagrams** — finger positions, muted/open string indicators, barre chord support
- **Full notation display** — tablature, numeric shorthand (e.g. `x32010`), and SVG staff notation with ledger lines
- **Two practice modes**:
  - **Random** — random chord changes at a set interval
  - **Progressive** — marks transitions you struggle with and weights them to appear more often
- **Practice modes (toggle during session)**:
  - **Timer** — chord changes every N seconds (metronome-driven)
  - **Listen** — chord stays until the mic detects you playing it correctly, then auto-advances
- **Configurable interval** — 3s, 5s, 10s, 15s, or 20s between changes
- **Microphone listening** (optional toggle):
  - Real-time chord detection via chroma features + cosine similarity
  - Volume meter and spectral analysis (flatness for tone quality)
  - Colored detection badge: orange "Listening...", green "D Major ✓", red "A Major ✗"
  - Transition timing tracker
  - Real-time critique hints during practice (buzzing, muting, slow transitions)
- **Session summary** — transitions, duration, accuracy %, chord accuracy bars, tone quality breakdown, focus areas with specific tips
- **Metronome click** — subtle audio click on each chord change
- **Keyboard shortcuts**:
  - `Space` — pause / resume
  - `G` — mark "Got it" (progressive mode)
  - `S` — mark "Struggled" (progressive mode)

## Song Practice

Pick from 7 songs with guided, mic-listened practice, organized by difficulty:

### Beginner
- **Knockin' on Heaven's Door** (Bob Dylan) — G, D, Am, C
- **Bad Moon Rising** (CCR) — D, A, G
- **Three Little Birds** (Bob Marley) — A, D, E
- **Stand By Me** (Ben E. King) — G, Em, C, D

### Intermediate
- **Let It Be** (The Beatles) — C, G, Am, F
- **House of the Rising Sun** (The Animals) — Am, C, D, F, E

### Advanced
- **Creep** (Radiohead) — G, B, C, Cm

Each song features:

- **Strumming-aware advancement** — detects individual strums and tracks progress through the pattern
- **Direction detection** — distinguishes downstrokes from upstrokes using spectral centroid analysis
- **Smart fallback** — switches to simple strum counting if direction detection gets unreliable
- **Highlighted strumming display** — current strum highlighted, completed ones turn green, wrong ones shake red
- **Chord progress bar** — visual tracker showing completed, current, and upcoming chords
- **Loop mode** — repeat the progression continuously
- **Two song modes**:
  - **Listen** — wait for you to play each chord + strumming pattern correctly
  - **Auto-Advance** — metronome-driven progression at fixed beat intervals

## How Progressive Mode works

Progressive mode uses **two signals** to learn what's hard for you:

**Explicit feedback** (manual):
- Hit "Struggled" on a transition and it gets weighted 3x higher in the randomizer
- After enough successful "Got It" reps, the weight drops back down

**Implicit audio learning** (automatic, when mic is on):
- **Wrong chord detected** → auto-marks as a struggle
- **Slow transitions** (>3s to start playing) → adds struggle points
- **No sound at all** → adds struggle points
- **Detection accuracy** (% of times you played the right chord) → factors into chord weighting
- **Transition speed** (average delay) → slower = higher weight
- **Tone quality** (buzzy/muted strums) → poor tone = higher weight

So even if you never press "Struggled", the app learns from how you actually play and adapts the randomizer to drill your weak spots. A 🧎 "Audio Learning Active" badge appears when this mode is on.

## How Chord Detection works

The app captures audio from your microphone and performs FFT analysis at 8192-point resolution. It extracts chroma features (pitch class energy distribution) and matches them against pre-computed chord templates using cosine similarity. A confidence threshold of 0.45 ensures only clear matches are accepted.

## How Strum Detection works

- **Strum events**: detected as RMS energy spikes (transient attacks) with 250ms cooldown between detections
- **Direction detection**: spectral centroid analysis — downstrokes produce lower centroid values (bass-heavy, strings hit low-to-high), upstrokes produce higher centroid values (treble-heavy, strings hit high-to-low)
- **Fallback**: after 5 seconds or 3 consecutive wrong directions, switches to simple event counting
