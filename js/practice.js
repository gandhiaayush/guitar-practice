// ==================== STATE ====================
let state = {
  screen: 'setup',
  selectedChords: [],
  currentChord: null,
  previousChord: null,
  interval: 5,
  mode: 'random',
  practiceMode: 'timer',
  isRunning: false,
  timeRemaining: 5,
  transitions: {},
  sessionStart: null,
  totalTransitions: 0,
  timerId: null,
  tickId: null,
  outputCtx: null,

  audio: {
    stream: null,
    analyser: null,
    micActive: false,
    volume: 0,
    spectralFlatness: 0,
    spectralCentroid: 0,
    detectedChord: null,
    detectedConfidence: 0,
    isPlaying: false,
    transitionStartTime: null,
    transitionDelay: 0,
    samples: [],
    silenceDuration: 0,
    animFrameId: null,
    volumeThreshold: 0.02,
    correctCount: 0,
    wrongCount: 0,
    totalDetected: 0,
    cleanCount: 0,
    buzzyCount: 0,
    mutedCount: 0,
    toneSampled: false,
    previousRms: 0,
    lastStrumTime: 0,
    strumCooldown: 250,
    practiceChordLocked: false,
    lastCritiqueHint: 0,
  },

  song: {
    currentSong: null,
    currentChordIndex: 0,
    tempo: 'medium',
    songMode: 'listen',
    songLoop: false,
    beatCount: 0,
    beatIntervalId: null,
    detectionTimeoutId: null,
    songTransitions: {},
    songCorrect: 0,
    songTotal: 0,
    strumIndex: 0,
    strumsCorrect: 0,
    strumsTotal: 0,
    directionFallback: false,
    fallbackTimer: null,
    fallbackTimeout: 5000,
  },
};

// ==================== SVG CHORD DIAGRAM ====================
function renderChordDiagram(chordKey, container) {
  const chord = CHORDS[chordKey];
  if (!chord) return;

  const stringSpacing = 28, fretSpacing = 40, numStrings = 6, padding = 30, topPadding = 36;
  const width = (numStrings - 1) * stringSpacing + padding * 2;

  const actualFrets = Math.max(5, ...chord.frets.filter(f => f !== null && f > 0).map(f => f - chord.baseFret + 1));
  const actualHeight = actualFrets * fretSpacing + topPadding + padding;

  let svg = `<svg width="${width}" height="${actualHeight}" viewBox="0 0 ${width} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">`;

  if (chord.baseFret > 1) {
    svg += `<text x="${padding - 14}" y="${topPadding + fretSpacing / 2 + 5}" font-family="Geist Mono, monospace" font-size="12" fill="#6B6560" text-anchor="middle">${chord.baseFret}</text>`;
  }

  if (chord.baseFret === 1) {
    svg += `<rect x="${padding}" y="${topPadding - 3}" width="${(numStrings - 1) * stringSpacing}" height="6" fill="#4A4039" rx="1"/>`;
  }

  for (let f = 1; f <= actualFrets; f++) {
    const y = topPadding + f * fretSpacing;
    svg += `<line x1="${padding}" y1="${y}" x2="${padding + (numStrings - 1) * stringSpacing}" y2="${y}" stroke="#9A9490" stroke-width="1.5"/>`;
  }

  for (let s = 0; s < numStrings; s++) {
    const x = padding + s * stringSpacing;
    svg += `<line x1="${x}" y1="${topPadding}" x2="${x}" y2="${topPadding + actualFrets * fretSpacing}" stroke="#4A4039" stroke-width="2"/>`;
  }

  for (let s = 0; s < numStrings; s++) {
    const x = padding + s * stringSpacing;
    const fret = chord.frets[s];
    const finger = chord.fingers[s];

    if (fret === null) {
      svg += `<text x="${x}" y="${topPadding - 10}" font-family="Instrument Sans, sans-serif" font-size="16" font-weight="500" fill="#6B6560" text-anchor="middle">X</text>`;
    } else if (fret === 0) {
      svg += `<circle cx="${x}" cy="${topPadding - 14}" r="6" fill="none" stroke="#6B6560" stroke-width="1.5"/>`;
    } else {
      const renderFret = fret - chord.baseFret + 1;
      const y = topPadding + (renderFret - 0.5) * fretSpacing;
      svg += `<circle cx="${x}" cy="${y}" r="10" fill="#C8823B" stroke="#FFFFFF" stroke-width="2"/>`;
      if (finger) {
        svg += `<text x="${x}" y="${y + 4}" font-family="Geist Mono, monospace" font-size="10" font-weight="600" fill="#FFFFFF" text-anchor="middle">${finger}</text>`;
      }
    }
  }

  const barreGroups = {};
  for (let s = 0; s < numStrings; s++) {
    if (chord.frets[s] !== null && chord.frets[s] > 0) {
      const rf = chord.frets[s] - chord.baseFret + 1;
      if (!barreGroups[rf]) barreGroups[rf] = [];
      barreGroups[rf].push(s);
    }
  }
  for (const [fret, strings] of Object.entries(barreGroups)) {
    if (strings.length >= 3) {
      const x1 = padding + Math.min(...strings) * stringSpacing;
      const x2 = padding + Math.max(...strings) * stringSpacing;
      const y = topPadding + (parseInt(fret) - 0.5) * fretSpacing;
      svg += `<rect x="${x1}" y="${y - 10}" width="${x2 - x1}" height="20" rx="10" fill="#C8823B" opacity="0.3"/>`;
    }
  }

  svg += '</svg>';
  container.innerHTML = svg;
}

// ==================== NOTATION RENDERER ====================
function renderNotation(chordKey, container) {
  const tab = TABS[chordKey] || '';
  const numeric = NUMERIC[chordKey] || '';
  const notes = CHORD_NOTES[chordKey] || [];

  let html = `<div class="tab-notation">${escHtml(tab)}</div>`;
  html += `<div class="numeric-notation">${escHtml(numeric)}</div>`;
  html += `<div class="staff-notation">${renderStaff(notes)}</div>`;
  container.innerHTML = html;
}

function renderStaff(notes) {
  const staffLines = 5;
  const lineSpacing = 14;
  const staffHeight = (staffLines - 1) * lineSpacing;
  const width = 140;
  const startX = 28;
  const staffY = 20;
  const bottomLineY = staffY + staffHeight;

  let svg = `<svg width="${width}" height="${staffHeight + 50}" viewBox="0 0 ${width} ${staffHeight + 50}" xmlns="http://www.w3.org/2000/svg">`;

  for (let i = 0; i < staffLines; i++) {
    const y = staffY + i * lineSpacing;
    svg += `<line x1="${startX}" y1="${y}" x2="${width - 10}" y2="${y}" stroke="#4A4039" stroke-width="1"/>`;
  }

  svg += `<text x="${startX - 2}" y="${staffY + staffHeight - 4}" font-family="serif" font-size="28" fill="#4A4039">𝄞</text>`;

  const centerX = startX + 55;
  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    const pos = staffPosition(note.note, note.octave);
    const noteY = bottomLineY - (pos - 7) * (lineSpacing / 2);
    const noteX = centerX + i * 22;

    if (pos < 7) {
      for (let lp = 6; lp >= pos; lp -= 2) {
        const ly = bottomLineY - (lp - 7) * (lineSpacing / 2);
        svg += `<line x1="${noteX - 6}" y1="${ly}" x2="${noteX + 6}" y2="${ly}" stroke="#4A4039" stroke-width="1"/>`;
      }
    }
    if (pos > 19) {
      for (let lp = 20; lp <= pos; lp += 2) {
        const ly = bottomLineY - (lp - 7) * (lineSpacing / 2);
        svg += `<line x1="${noteX - 6}" y1="${ly}" x2="${noteX + 6}" y2="${ly}" stroke="#4A4039" stroke-width="1"/>`;
      }
    }

    svg += `<ellipse cx="${noteX}" cy="${noteY}" rx="5" ry="3.5" fill="#4A4039" transform="rotate(-15, ${noteX}, ${noteY})"/>`;
  }

  svg += '</svg>';
  return svg;
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ==================== WEIGHTED RANDOM ====================
function weightedRandom(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function pickNextChord() {
  const available = state.selectedChords.filter(c => c !== state.currentChord);
  if (available.length === 0) return state.selectedChords[0];
  if (state.mode === 'progressive') {
    const weights = available.map(chord => {
      const key = `${state.previousChord}→${chord}`;
      const data = state.transitions[key] || { count: 0, struggles: 0 };

      let audioDifficulty = 0;
      if (state.audio.micActive) {
        const chordSamples = state.audio.samples.filter(s => s.to === chord);
        if (chordSamples.length >= 2) {
          const accuracy = chordSamples.filter(s => s.correct).length / chordSamples.length;
          audioDifficulty += (1 - accuracy) * 3;
          const avgDelay = chordSamples.reduce((a, s) => a + (s.delay || 0), 0) / chordSamples.length;
          if (avgDelay > 2000) audioDifficulty += Math.min(2, (avgDelay - 2000) / 1000);
          const buzzyMuted = chordSamples.filter(s => s.flatness > 0.15 || s.volume < 0.03).length / chordSamples.length;
          audioDifficulty += buzzyMuted * 1.5;
        }
      }

      const manualWeight = data.count === 0 ? 0 : (data.struggles / data.count) * 2;
      const weight = 1 + manualWeight + audioDifficulty;
      return Math.max(1, weight);
    });
    return weightedRandom(available, weights);
  }
  return available[Math.floor(Math.random() * available.length)];
}

function learnFromAudio() {
  if (!state.audio.micActive || !state.previousChord || !state.currentChord) return;

  const key = `${state.previousChord}→${state.currentChord}`;
  if (!state.transitions[key]) state.transitions[key] = { count: 0, struggles: 0 };
  state.transitions[key].count++;

  let struggleScore = 0;
  if (state.audio.detectedChord && state.audio.detectedChord !== state.currentChord && state.audio.detectedConfidence > 0.3) struggleScore++;
  if (state.audio.transitionDelay > 3000) struggleScore++;
  if (state.audio.transitionDelay > 5000) struggleScore++;
  if (!state.audio.isPlaying && state.audio.silenceDuration > state.interval * 800) struggleScore++;

  if (struggleScore >= 2) state.transitions[key].struggles++;
}

// ==================== CRITIQUE ENGINE ====================
function generateCritiques() {
  const samples = state.audio.samples;
  const critiques = [];
  const suggestions = [];

  if (samples.length === 0) return { critiques, suggestions };

  const avgDelay = samples.reduce((a, s) => a + (s.delay || 0), 0) / samples.length;
  const maxDelay = Math.max(...samples.map(s => s.delay || 0));
  const buzzyRatio = state.audio.buzzyCount / Math.max(1, state.audio.buzzyCount + state.audio.cleanCount);
  const mutedRatio = state.audio.mutedCount / Math.max(1, state.audio.mutedCount + state.audio.cleanCount);
  const accuracy = state.audio.totalDetected > 0 ? state.audio.correctCount / state.audio.totalDetected : 0;

  const transitionData = {};
  for (const s of samples) {
    const key = `${s.from}→${s.to}`;
    if (!transitionData[key]) transitionData[key] = { delays: [], correct: 0, total: 0 };
    transitionData[key].delays.push(s.delay || 0);
    transitionData[key].total++;
    if (s.correct) transitionData[key].correct++;
  }

  if (avgDelay > 2000) {
    critiques.push({ label: 'Slow transitions', detail: `${(avgDelay/1000).toFixed(1)}s average delay` });
    suggestions.push('Prepare the next chord shape in the air before the change comes. Keep fingers close to the fretboard between changes.');
  }

  if (accuracy < 0.6) {
    critiques.push({ label: 'Chord accuracy', detail: `${Math.round(accuracy*100)}% correct` });
    suggestions.push('Slow down the interval. Practice each chord shape individually until you can form it without looking.');
  }

  if (buzzyRatio > 0.2) {
    critiques.push({ label: 'String buzzing', detail: `${Math.round(buzzyRatio*100)}% of strums` });
    suggestions.push('Press your fingers closer to the metal fret wire, not in the middle of the fret space. Increase fretting pressure.');
  }

  if (mutedRatio > 0.15) {
    critiques.push({ label: 'Muted strings', detail: `${Math.round(mutedRatio*100)}% of strums` });
    suggestions.push('Arch your fretting fingers more so they do not touch adjacent strings. Check each string rings clearly.');
  }

  const slowest = Object.entries(transitionData)
    .map(([key, data]) => ({ key, avgDelay: data.delays.reduce((a,b) => a+b,0) / data.delays.length }))
    .sort((a, b) => b.avgDelay - a.avgDelay)
    .slice(0, 3);

  const tips = {
    'C→D': 'Lift all fingers together and place D shape — only the index finger moves significantly.',
    'C→Am': 'Keep your index and middle fingers in place, just lift your ring finger.',
    'D→A': 'Slide your whole shape down one string set. Keep the triangular finger shape.',
    'D→G': 'Lift fingers together. Place ring finger on low E first as anchor.',
    'G→D': 'Lift ring finger off low E, lift middle finger off A — remaining fingers form D.',
    'G→C': 'Lift middle finger from A string 3rd fret, place ring finger back on A string 3rd fret.',
    'G→Em': 'Lift middle finger from low E and place on A string 2nd fret. Rest stays.',
    'A→D': 'Lift fingers, shift up two strings. Keep the triangular finger pattern.',
    'A→E': 'Add index finger to A string 2nd fret, add pinky to B string. Ring finger stays.',
    'E→A': 'Lift index from G string, shift middle/ring fingers down one string.',
    'Am→C': 'Move ring finger from B string to A string 3rd fret. Other fingers stay.',
    'Em→Am': 'Shift middle and ring fingers down one string set. Index finger is new.',
    'D→Am': 'Keep D string open finger, move others. Only 2 fingers need to move.',
    'A→D7': 'Lift middle finger from G string. Only one finger moves.',
    'E→E7': 'Lift middle finger from A string. Easy one-finger change.',
  };

  for (const s of slowest) {
    if (s.avgDelay > 1000) {
      const tip = tips[s.key] || 'Practice this transition slowly, 5 reps at a time.';
      suggestions.push(`${s.key.replace(/→/g, ' → ')}: ${(s.avgDelay/1000).toFixed(1)}s avg — ${tip}`);
    }
  }

  if (suggestions.length === 0) {
    suggestions.push('Great session! Try adding one more chord to your practice set.');
  }

  return { critiques, suggestions };
}

// ==================== REALTIME CRITIQUE ====================
function showRealtimeCritique() {
  const el = document.getElementById('critique-hint');
  if (!el || !state.audio.micActive) return;
  const now = Date.now();
  if (now - state.audio.lastCritiqueHint < 4000) return;

  let hint = null;
  if (state.audio.buzzyCount > 2 && (state.audio.buzzyCount / Math.max(1, state.audio.buzzyCount + state.audio.cleanCount)) > 0.2) {
    hint = 'Press fingers closer to the fret wire to reduce buzzing.';
  } else if (state.audio.mutedCount > 1 && (state.audio.mutedCount / Math.max(1, state.audio.mutedCount + state.audio.cleanCount)) > 0.15) {
    hint = 'Arch your fingers more to avoid muting adjacent strings.';
  } else if (state.audio.transitionDelay > 3000) {
    hint = 'Prepare the next chord shape in the air before the change.';
  } else if (state.audio.wrongCount > state.audio.correctCount) {
    hint = 'Slow down. Practice the chord shape until you can form it without looking.';
  } else if (state.audio.silenceDuration > 5000) {
    hint = 'Keep strumming! Even quiet practice counts.';
  }

  if (hint) {
    el.textContent = hint;
    el.classList.add('visible');
    state.audio.lastCritiqueHint = now;
  }
}

// ==================== STRUM DETECTION ENGINE ====================
function handleStrumEvent(detectedDirection) {
  if (state.screen !== 'song-practice') return;
  if (state.song.songMode !== 'listen') return;

  const song = SONGS[state.song.currentSong];
  if (!song) return;
  const parsed = song.parsedStrumming;
  const expected = song.expectedStrums;

  if (state.song.strumIndex === 0 && !state.song.fallbackTimer && !state.song.directionFallback) {
    state.song.fallbackTimer = setTimeout(() => {
      state.song.directionFallback = true;
      state.song.fallbackTimer = null;
    }, state.song.fallbackTimeout);
  }

  if (state.song.directionFallback) {
    state.song.strumIndex++;
    state.song.strumsTotal++;
    renderStrummingDisplay(parsed, state.song.strumIndex, expected);
    updateSongDetectionStatus('waiting', `Strumming... ${state.song.strumIndex}/${expected}`);
    if (state.song.strumIndex >= expected) onStrumPatternComplete();
    return;
  }

  if (!detectedDirection) return;

  let nextExpectedDir = null;
  let nextIdx = state.song.strumIndex;
  while (nextIdx < parsed.length) {
    if (parsed[nextIdx].direction !== null) { nextExpectedDir = parsed[nextIdx].direction; break; }
    nextIdx++;
  }

  if (!nextExpectedDir) { onStrumPatternComplete(); return; }

  if (detectedDirection === nextExpectedDir) {
    state.song.strumIndex = nextIdx + 1;
    state.song.strumsCorrect++;
    state.song.strumsTotal++;
    renderStrummingDisplay(parsed, state.song.strumIndex, expected);
    updateSongDetectionStatus('correct', `${detectedDirection === 'D' ? 'Down' : 'Up'}stroke ✓`);
    pulseBeat();

    let remaining = 0;
    for (let i = state.song.strumIndex; i < parsed.length; i++) { if (parsed[i].direction !== null) remaining++; }
    if (remaining === 0) { onStrumPatternComplete(); }
    else { updateSongDetectionStatus('waiting', `${state.song.strumsTotal}/${expected} strums`); }
  } else {
    state.song.strumsTotal++;
    renderStrummingDisplay(parsed, state.song.strumIndex, expected, true);
    updateSongDetectionStatus('wrong', `Expected ${nextExpectedDir === 'D' ? '↓' : '↑'} — try again`);

    if (state.song.strumsTotal - state.song.strumsCorrect >= 3) {
      state.song.directionFallback = true;
      if (state.song.fallbackTimer) { clearTimeout(state.song.fallbackTimer); state.song.fallbackTimer = null; }
      renderStrummingDisplay(parsed, state.song.strumIndex, expected);
      updateSongDetectionStatus('waiting', `Counting strums... ${state.song.strumIndex}/${expected}`);
    }
  }
}

function onStrumPatternComplete() {
  if (state.song.fallbackTimer) { clearTimeout(state.song.fallbackTimer); state.song.fallbackTimer = null; }
  if (state.audio.detectedChord === state.currentChord && state.audio.detectedConfidence > 0.3) {
    updateSongDetectionStatus('correct', `${CHORDS[state.currentChord].name} ✓ — nice!`);
    setTimeout(() => advanceSongChord(), 800);
  } else {
    state.song.songTotal++;
    setTimeout(() => advanceSongChord(), 1000);
  }
}

function renderStrummingDisplay(parsed, currentIndex, expected, showWrong) {
  const strumEl = document.getElementById('strumming-display');
  if (!strumEl) return;

  let html = '<div class="strumming-label">Strumming Pattern</div><div class="strumming-pattern">';

  const song = SONGS[state.song.currentSong];
  if (!song) return;

  let strumCount = 0;
  let passedCurrent = false;
  let groupStart = true;

  for (let i = 0; i < parsed.length; i++) {
    const s = parsed[i];
    if (s.direction === null) {
      if (!groupStart) { html += '</span>'; groupStart = true; }
      html += '  ';
      continue;
    }

    if (groupStart) { html += '<span class="strum-group">'; groupStart = false; }

    let cls = 'strum-arrow';
    if (strumCount < currentIndex) cls += ' completed';
    else if (strumCount === currentIndex && showWrong) cls += ' wrong';
    else if (strumCount === currentIndex) cls += ' active';

    html += `<span class="${cls}">${escHtml(s.char)}</span>`;
    strumCount++;
  }
  if (!groupStart) html += '</span>';

  html += '</div>';
  html += `<div class="strumming-hint">${escHtml(song.strummingLabel)}</div>`;
  html += `<div class="strum-counter">${Math.min(currentIndex, expected)}/${expected} strums</div>`;

  strumEl.innerHTML = html;
}

// ==================== SONG MODE ====================
function showSongPicker() {
  const list = document.getElementById('song-list');
  list.innerHTML = '';
  for (const [key, song] of Object.entries(SONGS)) {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.innerHTML = `
      <div class="song-card-name">${song.name}</div>
      <div class="song-card-meta">
        <span class="song-card-artist">${song.artist}</span>
        <span class="song-card-difficulty ${song.difficulty}">${song.difficulty}</span>
      </div>
      <div class="song-card-chords">${song.chords.join(' → ')}</div>
    `;
    card.addEventListener('click', () => startSong(key));
    list.appendChild(card);
  }
  showScreen('song-picker');
}

function startSong(songKey) {
  const song = SONGS[songKey];
  state.song.currentSong = songKey;
  state.song.currentChordIndex = 0;
  state.song.beatCount = 0;
  state.song.songTransitions = {};
  state.song.songCorrect = 0;
  state.song.songTotal = 0;
  resetAudioState();

  state.song.strumIndex = 0;
  state.song.strumsCorrect = 0;
  state.song.strumsTotal = 0;
  state.song.directionFallback = false;
  if (state.song.fallbackTimer) { clearTimeout(state.song.fallbackTimer); state.song.fallbackTimer = null; }

  state.isRunning = true;
  state.sessionStart = Date.now();

  document.getElementById('song-practice-name').textContent = song.name;
  document.getElementById('song-practice-artist').textContent = song.artist;
  document.getElementById('song-audio-feedback').style.display = state.audio.micActive ? 'block' : 'none';

  updateSongProgressBar();
  showSongChord();
  updateSongDetectionStatus('waiting', 'Get ready...');

  const modeBtn = document.getElementById('song-mode-btn');
  modeBtn.textContent = state.song.songMode === 'listen' ? 'Auto-Advance' : 'Listen Mode';
  modeBtn.classList.toggle('active', state.song.songMode === 'auto');

  const loopBtn = document.getElementById('song-loop-btn');
  loopBtn.classList.toggle('active', state.song.songLoop);

  showScreen('song-practice');

  if (state.song.songMode === 'auto') startSongBeatTimer();

  document.getElementById('song-pause-btn').addEventListener('click', pausePractice);
}

function showSongChord() {
  const song = SONGS[state.song.currentSong];
  const chordKey = song.chords[state.song.currentChordIndex];
  state.currentChord = chordKey;

  if (state.audio.micActive) {
    state.audio.transitionStartTime = Date.now();
    state.audio.transitionDelay = 0;
    state.audio.detectedChord = null;
    state.audio.toneSampled = false;
  }

  state.song.strumIndex = 0;
  state.song.strumsCorrect = 0;
  state.song.strumsTotal = 0;
  state.song.directionFallback = false;
  if (state.song.fallbackTimer) { clearTimeout(state.song.fallbackTimer); state.song.fallbackTimer = null; }

  document.getElementById('song-chord-name').textContent = CHORDS[chordKey].name;
  renderChordDiagram(chordKey, document.getElementById('song-chord-diagram'));
  renderNotation(chordKey, document.getElementById('song-notation-display'));

  renderStrummingDisplay(song.parsedStrumming, 0, song.expectedStrums);

  updateSongProgressBar();

  if (state.song.songMode === 'listen') {
    updateSongDetectionStatus('waiting', `Playing: ${CHORDS[chordKey].name}`);
  }
}

function updateSongProgressBar() {
  const song = SONGS[state.song.currentSong];
  const bar = document.getElementById('song-progress-bar');
  bar.innerHTML = '';
  song.chords.forEach((chord, i) => {
    if (i > 0) {
      const arrow = document.createElement('span');
      arrow.className = 'song-chord-arrow';
      arrow.textContent = '→';
      bar.appendChild(arrow);
    }
    const step = document.createElement('span');
    step.className = 'song-chord-step';
    if (i < state.song.currentChordIndex) step.classList.add('completed');
    if (i === state.song.currentChordIndex) step.classList.add('active');
    step.textContent = chord;
    bar.appendChild(step);
  });
}

function advanceSongChord() {
  const song = SONGS[state.song.currentSong];
  state.song.currentChordIndex++;
  state.song.songTotal++;

  if (state.song.currentChordIndex >= song.chords.length) {
    if (state.song.songLoop) {
      state.song.currentChordIndex = 0;
      showSongChord();
      return;
    }
    endSongSession();
    return;
  }

  const prev = song.chords[state.song.currentChordIndex - 1];
  const curr = song.chords[state.song.currentChordIndex];
  const key = `${prev}→${curr}`;
  if (!state.song.songTransitions[key]) state.song.songTransitions[key] = { count: 0, struggles: 0 };
  state.song.songTransitions[key].count++;

  showSongChord();
}

function startSongBeatTimer() {
  if (state.song.beatIntervalId) clearInterval(state.song.beatIntervalId);
  const bpm = { slow: 60, medium: 90, fast: 120 }[state.song.tempo] || 90;
  const beatMs = (60000 / bpm) * SONGS[state.song.currentSong].beatsPerChord;

  state.song.beatIntervalId = setInterval(() => {
    if (!state.isRunning || state.screen !== 'song-practice') return;
    pulseBeat();
    advanceSongChord();
  }, beatMs);
}

function pulseBeat() {
  const indicator = document.getElementById('beat-indicator');
  indicator.classList.add('pulse');
  setTimeout(() => indicator.classList.remove('pulse'), 150);
}

function updateSongDetectionStatus(type, text) {
  const el = document.getElementById('detection-status');
  el.className = `detection-status ${type}`;
  el.textContent = text;
}

function endSongSession() {
  state.isRunning = false;
  if (state.song.beatIntervalId) clearInterval(state.song.beatIntervalId);
  showSummary();
}

// ==================== PRACTICE ENGINE ====================
function startPractice() {
  if (state.selectedChords.length < 2) return;
  state.isRunning = true;
  state.sessionStart = Date.now();
  state.totalTransitions = 0;
  state.currentChord = state.selectedChords[Math.floor(Math.random() * state.selectedChords.length)];
  state.previousChord = null;
  resetAudioState();
  showScreen('practice');
  showCurrentChord();
  document.getElementById('practice-mode-toggle').style.display = state.audio.micActive ? 'flex' : 'none';
  document.getElementById('feedback-row').style.display = state.mode === 'progressive' ? 'flex' : 'none';
  document.getElementById('audio-feedback').style.display = state.audio.micActive ? 'block' : 'none';
  document.getElementById('audio-learning-badge').classList.toggle('visible', state.mode === 'progressive' && state.audio.micActive);

  if (state.practiceMode === 'timer') {
    document.getElementById('timer-container').style.display = 'block';
    document.getElementById('practice-detection-badge').classList.remove('visible');
    startTimer();
  } else {
    document.getElementById('timer-container').style.display = 'none';
    document.getElementById('practice-detection-badge').classList.add('visible');
    state.audio.practiceChordLocked = false;
    updatePracticeDetectionBadge('waiting', `Playing: ${CHORDS[state.currentChord].name}`);
  }
}

function showCurrentChord() {
  const chordName = document.getElementById('chord-name');
  const diagram = document.getElementById('chord-diagram');
  const notation = document.getElementById('notation-display');

  chordName.style.opacity = 0;
  diagram.style.opacity = 0;

  setTimeout(() => {
    chordName.textContent = CHORDS[state.currentChord].name;
    renderChordDiagram(state.currentChord, diagram);
    renderNotation(state.currentChord, notation);
    chordName.style.opacity = 1;
    diagram.style.opacity = 1;
  }, 150);

  if (state.audio.micActive) {
    state.audio.transitionStartTime = Date.now();
    state.audio.transitionDelay = 0;
    state.audio.detectedChord = null;
    state.audio.toneSampled = false;
  }
}

function startTimer() {
  state.timeRemaining = state.interval;
  updateTimerDisplay();
  if (state.timerId) clearInterval(state.timerId);
  if (state.tickId) clearInterval(state.tickId);

  state.tickId = setInterval(() => {
    state.timeRemaining--;
    updateTimerDisplay();
    if (state.audio.micActive) updateTransitionTimer();
  }, 1000);

  state.timerId = setInterval(() => {
    if (state.mode === 'progressive') learnFromAudio();

    if (state.audio.micActive && state.previousChord) {
      state.audio.samples.push({
        from: state.previousChord, to: state.currentChord,
        delay: state.audio.transitionDelay || 0,
        correct: state.audio.detectedChord === state.currentChord && state.audio.detectedConfidence > 0.3,
        volume: state.audio.volume, flatness: state.audio.spectralFlatness,
      });
    }

    playClick();
    state.previousChord = state.currentChord;
    state.currentChord = pickNextChord();
    state.totalTransitions++;
    showCurrentChord();
    state.timeRemaining = state.interval;
    updateTimerDisplay();
  }, state.interval * 1000);
}

function updateTimerDisplay() {
  const circumference = 2 * Math.PI * 36;
  const progress = document.getElementById('timer-progress');
  const text = document.getElementById('timer-text');
  const fraction = state.timeRemaining / state.interval;
  progress.style.strokeDashoffset = circumference * (1 - fraction);
  text.textContent = state.timeRemaining;
}

function pausePractice() {
  state.isRunning = false;
  if (state.timerId) clearInterval(state.timerId);
  if (state.tickId) clearInterval(state.tickId);
  if (state.song.fallbackTimer) clearTimeout(state.song.fallbackTimer);
  document.getElementById('pause-overlay').classList.add('active');
}

function resumePractice() {
  state.isRunning = true;
  document.getElementById('pause-overlay').classList.remove('active');
  if (state.practiceMode === 'timer') {
    startTimer();
  } else if (state.practiceMode === 'listen') {
    state.audio.practiceChordLocked = false;
    updatePracticeDetectionBadge('waiting', `Playing: ${CHORDS[state.currentChord].name}`);
  }
  if (state.screen === 'song-practice' && state.song.songMode === 'auto') startSongBeatTimer();
}

function endSession() {
  state.isRunning = false;
  if (state.timerId) clearInterval(state.timerId);
  if (state.tickId) clearInterval(state.tickId);
  if (state.song.beatIntervalId) clearInterval(state.song.beatIntervalId);
  if (state.song.fallbackTimer) clearTimeout(state.song.fallbackTimer);
  document.getElementById('pause-overlay').classList.remove('active');
  showSummary();
}

function recordFeedback(gotIt) {
  if (state.previousChord && state.currentChord) {
    const key = `${state.previousChord}→${state.currentChord}`;
    if (!state.transitions[key]) state.transitions[key] = { count: 0, struggles: 0 };
    state.transitions[key].count++;
    if (!gotIt) state.transitions[key].struggles++;

    if (state.audio.micActive) {
      state.audio.samples.push({
        from: state.previousChord, to: state.currentChord,
        delay: state.audio.transitionDelay || 0,
        correct: gotIt, volume: state.audio.volume, flatness: state.audio.spectralFlatness,
      });
    }
  }
}

// ==================== PRACTICE LISTEN MODE ====================
function advancePracticeChord() {
  if (state.mode === 'progressive') learnFromAudio();

  if (state.audio.micActive && state.previousChord) {
    state.audio.samples.push({
      from: state.previousChord, to: state.currentChord,
      delay: state.audio.transitionDelay || 0,
      correct: state.audio.detectedChord === state.currentChord,
      volume: state.audio.volume, flatness: state.audio.spectralFlatness,
    });
  }

  playClick();
  state.previousChord = state.currentChord;
  state.currentChord = pickNextChord();
  state.totalTransitions++;
  showCurrentChord();
  state.audio.practiceChordLocked = false;
  updatePracticeDetectionBadge('waiting', `Playing: ${CHORDS[state.currentChord].name}`);
}

function updatePracticeDetectionBadge(type, text) {
  const badge = document.getElementById('practice-detection-badge');
  if (!badge) return;
  badge.className = `practice-detection-badge visible ${type}`;
  badge.textContent = text;
}

// ==================== SUMMARY ====================
function showSummary() {
  const song = SONGS[state.song.currentSong];
  const duration = Math.round((Date.now() - state.sessionStart) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  document.getElementById('summary-subtitle').textContent = song
    ? `${song.name} — ${song.artist}` : 'Free Practice';

  const allTransitions = { ...state.transitions, ...state.song.songTransitions };

  const accuracy = state.audio.totalDetected > 0
    ? Math.round((state.audio.correctCount / state.audio.totalDetected) * 100) : null;

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card"><div class="stat-value">${state.totalTransitions || state.song.songTotal}</div><div class="stat-label">Transitions</div></div>
    <div class="stat-card"><div class="stat-value">${minutes}:${seconds.toString().padStart(2,'0')}</div><div class="stat-label">Duration</div></div>
    <div class="stat-card"><div class="stat-value">${accuracy !== null ? accuracy + '%' : 'N/A'}</div><div class="stat-label">Accuracy</div></div>
    <div class="stat-card"><div class="stat-value">${state.audio.totalDetected > 0 ? Math.round(state.audio.buzzyCount / Math.max(1, state.audio.buzzyCount + state.audio.cleanCount) * 100) + '%' : 'N/A'}</div><div class="stat-label">Buzzing</div></div>
  `;

  // Accuracy per chord
  const chordAccuracy = {};
  for (const s of state.audio.samples) {
    if (!chordAccuracy[s.to]) chordAccuracy[s.to] = { correct: 0, total: 0 };
    chordAccuracy[s.to].total++;
    if (s.correct) chordAccuracy[s.to].correct++;
  }

  let accHtml = '';
  for (const [chord, data] of Object.entries(chordAccuracy)) {
    const pct = Math.round((data.correct / data.total) * 100);
    const cls = pct >= 80 ? 'good' : pct >= 50 ? 'ok' : 'bad';
    accHtml += `
      <div class="accuracy-bar-row">
        <span class="accuracy-name">${CHORDS[chord]?.name || chord}</span>
        <div class="accuracy-bar"><div class="accuracy-bar-fill ${cls}" style="width:${pct}%"></div></div>
        <span class="accuracy-pct">${pct}%</span>
      </div>`;
  }
  document.getElementById('accuracy-section').innerHTML = accHtml
    ? `<span class="section-label">Chord Accuracy</span>${accHtml}` : '';

  // Tone quality
  const totalStrums = Math.max(1, state.audio.cleanCount + state.audio.buzzyCount + state.audio.mutedCount);
  document.getElementById('tone-section').innerHTML = `
    <span class="section-label">Tone Quality</span>
    <div class="tone-row"><span class="tone-label">Clean</span><span class="tone-value">${state.audio.cleanCount}/${totalStrums}</span></div>
    <div class="tone-row"><span class="tone-label">Buzzing</span><span class="tone-value">${state.audio.buzzyCount}/${totalStrums}${state.audio.buzzyCount > totalStrums * 0.2 ? ' — Press closer to the fret wire' : ''}</span></div>
    <div class="tone-row"><span class="tone-label">Muted</span><span class="tone-value">${state.audio.mutedCount}/${totalStrums}${state.audio.mutedCount > totalStrums * 0.15 ? ' — Arch your fingers more' : ''}</span></div>
  `;

  // Struggles
  const struggles = Object.entries(allTransitions)
    .filter(([, v]) => v.struggles > 0)
    .sort((a, b) => (b[1].struggles / b[1].count) - (a[1].struggles / a[1].count))
    .slice(0, 5);

  let struggleHtml = '';
  if (struggles.length > 0) {
    struggleHtml = '<span class="section-label">Focus Areas</span>';
    struggles.forEach(([pair, data]) => {
      const rate = Math.round((data.struggles / data.count) * 100);
      struggleHtml += `<div class="struggle-item"><span class="struggle-pair">${pair}</span><span class="struggle-rate">${rate}% struggled</span></div>`;
    });
  }
  document.getElementById('struggles-list').innerHTML = struggleHtml;

  // Suggestions
  const { suggestions } = generateCritiques();
  let sugHtml = '';
  if (suggestions.length > 0) {
    sugHtml = '<span class="section-label">Suggestions</span>';
    suggestions.forEach(s => { sugHtml += `<div class="suggestion-item">${escHtml(s)}</div>`; });
  }
  document.getElementById('suggestions-list').innerHTML = sugHtml;

  // Save to history
  const historyEntry = {
    sessions: (practiceHistory.length || 0) + 1,
    totalTransitions: (practiceHistory.reduce((a, h) => a + (h.totalTransitions || 0), 0)) + (state.totalTransitions || 0),
    uniqueChords: new Set([...practiceHistory.flatMap(h => h.chords || []), ...state.selectedChords]).size,
    chords: state.selectedChords,
    duration,
    transitions: state.totalTransitions || 0,
    maxBpm: 0,
  };
  addHistoryEntry(historyEntry);

  // Check achievements
  const stats = getHistoryStats();
  checkAchievements(stats);

  showScreen('summary');
}

function resetSetup() {
  state.isRunning = false;
  state.currentChord = null;
  state.previousChord = null;
  state.transitions = {};
  state.totalTransitions = 0;
  if (state.timerId) clearInterval(state.timerId);
  if (state.tickId) clearInterval(state.tickId);
  resetAudioState();
}

function resetAudioState() {
  state.audio.correctCount = 0;
  state.audio.wrongCount = 0;
  state.audio.totalDetected = 0;
  state.audio.cleanCount = 0;
  state.audio.buzzyCount = 0;
  state.audio.mutedCount = 0;
  state.audio.samples = [];
  state.audio.transitionDelay = 0;
  state.audio.transitionStartTime = null;
  state.audio.toneSampled = false;
  state.audio.previousRms = 0;
  state.audio.lastStrumTime = 0;
  state.audio.practiceChordLocked = false;
  state.audio.lastCritiqueHint = 0;
}
