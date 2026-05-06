# Build practice.js with proper ES5 syntax
practice_js = r"""
// ==================== STATE ====================
var state = {
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
    samples: []
  },

  song: null,
  history: { sessions: 0, totalTransitions: 0, uniqueChords: 0, sessionsLog: [], currentStreak: 0, longestStreak: 0 },
  achievements: {},
  recordings: []
};

// ==================== SVG RENDERING ====================
function renderChordDiagram(chordKey, container) {
  if (!container) return;
  var chord = CHORDS[chordKey];
  if (!chord) { container.innerHTML = ''; return; }

  var w = 120, h = 160, pad = 15;
  var frets = chord.frets.slice(1);
  var fingers = chord.fingers.slice(1);
  var minFret = chord.baseFret || 1;
  var maxFret = minFret + 3;
  var svg = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">';

  // Fret lines
  for (var f = 0; f <= 4; f++) {
    var y = pad + f * (h - pad * 2) / 4;
    svg += '<line x1="20" y1="' + y + '" x2="' + (w - 20) + '" y2="' + y + '" stroke="#E5E0DA" stroke-width="1"/>';
  }

  // String lines
  for (var s = 0; s < 6; s++) {
    var x = 20 + s * (w - 40) / 5;
    svg += '<line x1="' + x + '" y1="' + pad + '" x2="' + x + '" y2="' + (h - pad) + '" stroke="#E5E0DA" stroke-width="1"/>';
  }

  // Nut
  svg += '<line x1="20" y1="' + pad + '" x2="' + (w - 20) + '" y2="' + pad + '" stroke="#5B4E4B" stroke-width="2"/>';

  // Fret numbers
  svg += '<text x="8" y="' + (pad + (h - pad * 2) / 8 + 3) + '" font-size="9" fill="#9B9490" text-anchor="middle">' + minFret + '</text>';
  svg += '<text x="8" y="' + (pad + 3 * (h - pad * 2) / 8 + 3) + '" font-size="9" fill="#9B9490" text-anchor="middle">' + (minFret + 1) + '</text>';

  // Finger positions
  for (var s2 = 0; s2 < 6; s2++) {
    var fret = frets[s2];
    if (fret === null || fret === undefined) {
      var x2 = 20 + s2 * (w - 40) / 5;
      if (fret === null) {
        svg += '<text x="' + x2 + '" y="' + (pad - 4) + '" font-size="12" fill="#9B9490" text-anchor="middle">x</text>';
      } else {
        svg += '<text x="' + x2 + '" y="' + (pad - 4) + '" font-size="9" fill="#5B4E4B" text-anchor="middle">O</text>';
      }
    } else {
      var x3 = 20 + s2 * (w - 40) / 5;
      var fretNum = fret - minFret + 1;
      var y3 = pad + (fretNum - 0.5) * (h - pad * 2) / 4;
      svg += '<circle cx="' + x3 + '" cy="' + y3 + '" r="7" fill="#5B4E4B"/>';
      if (fingers[s2]) {
        svg += '<text x="' + x3 + '" y="' + (y3 + 3) + '" font-size="8" fill="white" text-anchor="middle">' + fingers[s2] + '</text>';
      }
    }
  }

  svg += '</svg>';
  container.innerHTML = svg;
}

function renderNotation(chordKey, container) {
  if (!container) return;
  var tab = TABS[chordKey];
  if (!tab) { container.innerHTML = ''; return; }
  var lines = tab.split('\n');
  var svg = '<svg width="200" height="120" viewBox="0 0 200 120">';
  for (var i = 0; i < lines.length; i++) {
    var y = 15 + i * 18;
    svg += '<text x="5" y="' + y + '" font-family="monospace" font-size="11" fill="#5B4E4B">' + lines[i] + '</text>';
  }
  svg += '</svg>';
  container.innerHTML = svg;
}

function renderStaff(notes) {
  var w = 200, h = 100, pad = 20;
  var svg = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">';
  // Staff lines
  for (var i = 0; i < 5; i++) {
    var y = pad + i * (h - pad * 2) / 4;
    svg += '<line x1="10" y1="' + y + '" x2="' + (w - 10) + '" y2="' + y + '" stroke="#E5E0DA" stroke-width="1"/>';
  }
  // Notes
  notes.forEach(function(note) {
    var pos = staffPosition(note.note, note.octave);
    var x = 40 + notes.indexOf(note) * 30;
    var y = pad + (21 - pos) * (h - pad * 2) / 21;
    // Ellipse for note head
    svg += '<ellipse cx="' + x + '" cy="' + y + '" rx="6" ry="4" fill="#5B4E4B" transform="rotate(-15, ' + x + ', ' + y + ')"/>';
    // Stem
    svg += '<line x1="' + (x + 5) + '" y1="' + y + '" x2="' + (x + 5) + '" y2="' + (y - 30) + '" stroke="#5B4E4B" stroke-width="1.5"/>';
  });
  svg += '</svg>';
  return svg;
}

// ==================== WEIGHTED RANDOM ====================
function weightedRandom(items, weights) {
  var total = weights.reduce(function(a, b) { return a + b; }, 0);
  var r = Math.random() * total;
  for (var i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function pickNextChord() {
  if (state.mode === 'progressive' && state.audio.micActive && state.audio.samples.length > 0) {
    var available = state.selectedChords.filter(function(c) { return c !== state.currentChord; });
    var weights = available.map(function(chord) {
      var chordSamples = state.audio.samples.filter(function(s) { return s.to === chord; });
      if (chordSamples.length === 0) return 1;
      var accuracy = chordSamples.filter(function(s) { return s.correct; }).length / chordSamples.length;
      var avgDelay = chordSamples.reduce(function(a, s) { return a + (s.delay || 0); }, 0) / chordSamples.length;
      var buzzyMuted = chordSamples.filter(function(s) { return s.flatness > 0.15 || s.volume < 0.03; }).length / chordSamples.length;
      return (1 - accuracy) * 3 + (avgDelay / 1000) * 2 + buzzyMuted * 4 + 0.5;
    });
    return weightedRandom(available, weights);
  }
  // Random mode
  var choices = state.selectedChords.filter(function(c) { return c !== state.currentChord; });
  return choices[Math.floor(Math.random() * choices.length)];
}

// ==================== TIMER ====================
function startTimer() {
  state.timeRemaining = state.interval;
  updateTimerDisplay();
  state.tickId = setInterval(function() {
    state.timeRemaining--;
    updateTimerDisplay();
    if (state.timeRemaining <= 0) {
      stopTimer();
      showChord();
    }
  }, 1000);
}

function stopTimer() {
  if (state.tickId) { clearInterval(state.tickId); state.tickId = null; }
}

function updateTimerDisplay() {
  var el = document.getElementById('timer');
  if (el) el.textContent = state.timeRemaining;
}

// ==================== CHORD DISPLAY ====================
function showChord() {
  var nextChord = pickNextChord();
  if (!nextChord) return;

  state.previousChord = state.currentChord;
  state.currentChord = nextChord;
  state.audio.transitionStartTime = Date.now();
  state.audio.isPlaying = false;

  // Update UI
  var nameEl = document.getElementById('chord-name');
  if (nameEl) nameEl.textContent = CHORDS[nextChord].name;

  renderChordDiagram(nextChord, document.getElementById('chord-diagram'));
  renderNotation(nextChord, document.getElementById('tab-notation'));

  var notes = CHORD_NOTES[nextChord];
  if (notes) {
    var staffEl = document.getElementById('staff-notation');
    if (staffEl) staffEl.innerHTML = renderStaff(notes);
  }

  // Reset detection badge
  var badge = document.getElementById('practice-detection-badge');
  if (badge) {
    badge.textContent = 'Listening...';
    badge.className = 'practice-detection-badge';
  }

  // Trigger chord change sound
  if (state.outputCtx) {
    playChord(state.outputCtx, nextChord, 0.4, 1.5);
  }

  // Feedback buttons
  var feedback = document.getElementById('progressive-feedback');
  if (feedback) feedback.style.display = 'flex';

  // Start timer for next chord
  startTimer();
  state.totalTransitions++;
}

// ==================== RECORD TRANSITION ====================
function recordTransition(from, to, delay, correct, flatness, volume) {
  state.audio.samples.push({
    from: from, to: to, delay: delay, correct: correct,
    flatness: flatness, volume: volume,
    timestamp: Date.now()
  });
}

function recordFeedback(gotIt) {
  var feedback = document.getElementById('progressive-feedback');
  if (feedback) feedback.style.display = 'none';

  if (state.audio.transitionStartTime && state.previousChord && state.currentChord) {
    var delay = Date.now() - state.audio.transitionStartTime;
    recordTransition(state.previousChord, state.currentChord, delay, gotIt, state.audio.spectralFlatness, state.audio.volume);
    // Update transitions dict
    var key = state.previousChord + '->' + state.currentChord;
    if (!state.transitions[key]) state.transitions[key] = [];
    state.transitions[key].push({ delay: delay, correct: gotIt });
  }
}

// ==================== PRACTICE CONTROL ====================
function startPractice() {
  if (state.selectedChords.length === 0) return;
  state.isRunning = true;
  state.sessionStart = Date.now();
  state.totalTransitions = 0;
  state.audio.samples = [];
  showScreen('practice');
  showChord();
}

function pausePractice() {
  state.isRunning = false;
  stopTimer();
  showScreen('pause-overlay');
}

function resumePractice() {
  state.isRunning = true;
  showScreen('practice');
  startTimer();
}

function endSession() {
  state.isRunning = false;
  stopTimer();
  if (state.tickId) clearInterval(state.tickId);

  // Update history
  state.history.sessions++;
  state.history.totalTransitions += state.totalTransitions;
  var uniqueChords = {};
  state.audio.samples.forEach(function(s) { uniqueChords[s.from] = true; uniqueChords[s.to] = true; });
  state.history.uniqueChords = Math.max(state.history.uniqueChords, Object.keys(uniqueChords).length);

  // Check achievements
  checkAchievements();

  // Save history
  saveHistory();

  // Show summary
  showSummary();
}

function resetSetup() {
  state.selectedChords = [];
  document.querySelectorAll('.chord-chip.selected').forEach(function(c) { c.classList.remove('selected'); });
  var startBtn = document.getElementById('start-btn');
  if (startBtn) startBtn.disabled = true;
}

// ==================== SUMMARY ====================
function showSummary() {
  showScreen('summary');
  var subs = document.getElementById('summary-subtitle');
  if (subs) subs.textContent = 'You made ' + state.totalTransitions + ' transitions in this session.';

  var totalEl = document.getElementById('summary-total');
  if (totalEl) totalEl.textContent = state.totalTransitions;

  var unique = {};
  state.audio.samples.forEach(function(s) { unique[s.from] = true; unique[s.to] = true; });
  var uniqueEl = document.getElementById('summary-unique');
  if (uniqueEl) uniqueEl.textContent = Object.keys(unique).length;

  var correct = state.audio.samples.filter(function(s) { return s.correct; }).length;
  var pctEl = document.getElementById('summary-pct');
  if (pctEl) pctEl.textContent = state.audio.samples.length > 0 ? Math.round(correct / state.audio.samples.length * 100) + '%' : 'N/A';

  // Render summary chord list
  var listEl = document.getElementById('summary-chord-list');
  if (listEl) {
    var html = '';
    var keys = Object.keys(state.transitions);
    keys.forEach(function(key) {
      var samples = state.transitions[key];
      var avg = samples.reduce(function(a, s) { return a + s.delay; }, 0) / samples.length;
      html += '<div class="summary-chord-row">' +
        '<span class="summary-chord-name">' + key + '</span>' +
        '<span class="summary-chord-stats">' + samples.length + 'x, avg ' + Math.round(avg / 1000 * 10) / 10 + 's</span>' +
      '</div>';
    });
    listEl.innerHTML = html;
  }
}

// ==================== SONG PRACTICE ====================
function startSongPractice(songId) {
  var song = SONGS[songId];
  if (!song) return;
  state.song = {
    id: songId,
    currentIndex: 0,
    looping: false,
    mode: 'auto',
    startTime: Date.now()
  };
  showScreen('song-practice');
  showSongChord();
}

function showSongChord() {
  if (!state.song) return;
  var song = SONGS[state.song.id];
  var chordKey = song.chords[state.song.currentIndex];
  var nameEl = document.getElementById('song-chord-name');
  if (nameEl) nameEl.textContent = CHORDS[chordKey].name;

  renderChordDiagram(chordKey, document.getElementById('song-chord-diagram'));
  renderNotation(chordKey, document.getElementById('song-tab'));

  // Strumming
  renderStrummingDisplay(song.parsedStrumming, 0, song.expectedStrums, false);

  // Progress
  var progEl = document.getElementById('song-progress');
  if (progEl) progEl.textContent = (state.song.currentIndex + 1) + ' / ' + song.chords.length;

  // Auto-advance
  if (state.song.mode === 'auto') {
    setTimeout(function() {
      nextSongChord();
    }, song.beatsPerChord * 600); // ~120 BPM
  }
}

function nextSongChord() {
  if (!state.song) return;
  var song = SONGS[state.song.id];
  state.song.currentIndex++;
  if (state.song.currentIndex >= song.chords.length) {
    if (state.song.looping) {
      state.song.currentIndex = 0;
    } else {
      // Song complete
      showScreen('summary');
      return;
    }
  }
  showSongChord();
}

function showSongPicker() {
  showScreen('song-picker');
}

// ==================== STRUMMING DISPLAY ====================
function renderStrummingDisplay(parsed, currentIndex, expected, showWrong) {
  var container = document.getElementById('strumming-display');
  if (!container) return;
  var html = '';
  parsed.forEach(function(s, i) {
    var cls = (i === currentIndex && expected > 0) ? 'strum-current' : (i < currentIndex ? 'strum-done' : 'strum-upcoming');
    if (s.direction) {
      html += '<div class="strum-dot ' + cls + '">' + s.char + '</div>';
    } else {
      html += '<div class="strum-space"></div>';
    }
  });
  container.innerHTML = html;
}

// ==================== SCALE PRACTICE ====================
function showScale() {
  showScreen('scale');
}

// ==================== PROGRESSION PRACTICE ====================
function showProgression() {
  showScreen('progression');
}

// ==================== EAR TRAINING ====================
function showEarTraining() {
  showScreen('ear');
}
"""

with open('js/practice.js', 'w') as f:
    f.write(practice_js)
print("practice.js written")
