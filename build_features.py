features_js = r"""
// ==================== FEATURE 1: CHORD TRANSITION TRAINER ====================
var transitionTrainer = { active: false, from: null, to: null, timerId: null, countdown: 3, state: 'idle', pairTimes: {} };

function showTransitionTrainer() {
  var container = document.getElementById('transition-container');
  if (!container) return;
  container.innerHTML =
    '<div class="transition-title">Chord Transition Trainer</div>' +
    '<div class="transition-subtitle">Practice switching between two specific chords with timed transitions</div>' +
    '<div class="transition-pair-picker" id="transition-pair-picker"></div>' +
    '<div class="transition-pair-display" id="transition-pair-display" style="display:none">' +
      '<div class="transition-chord-card">' +
        '<div class="chord-label">From</div>' +
        '<div class="chord-name-sm" id="transition-from-name"></div>' +
        '<div id="transition-from-diagram"></div>' +
      '</div>' +
      '<div class="transition-arrow">→</div>' +
      '<div class="transition-chord-card">' +
        '<div class="chord-label">To</div>' +
        '<div class="chord-name-sm" id="transition-to-name"></div>' +
        '<div id="transition-to-diagram"></div>' +
      '</div>' +
    '</div>' +
    '<div class="transition-countdown" id="transition-countdown" style="display:none">' +
      '<div class="transition-timer-display" id="transition-timer">3</div>' +
      '<div class="transition-label" id="transition-status">Get ready...</div>' +
    '</div>' +
    '<div class="transition-go" id="transition-go" style="display:none">' +
      '<div class="transition-go">CHANGE!</div>' +
    '</div>' +
    '<div id="transition-stats" class="transition-stats" style="display:none"></div>' +
    '<button class="start-btn" id="transition-start-btn" style="margin-top:16px">Start</button>';

  // Render pair picker
  var picker = document.getElementById('transition-pair-picker');
  TRANSITION_PAIRS.forEach(function(p, i) {
    var btn = document.createElement('button');
    btn.className = 'transition-pair-btn' + (i === 0 ? ' selected' : '');
    btn.textContent = p.from + ' → ' + p.to;
    btn.dataset.from = p.from;
    btn.dataset.to = p.to;
    btn.addEventListener('click', function() {
      picker.querySelectorAll('.transition-pair-btn').forEach(function(b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      transitionTrainer.from = p.from;
      transitionTrainer.to = p.to;
    });
    picker.appendChild(btn);
  });

  transitionTrainer.from = TRANSITION_PAIRS[0].from;
  transitionTrainer.to = TRANSITION_PAIRS[0].to;

  document.getElementById('transition-start-btn').addEventListener('click', startTransitionTrainer);
  showScreen('transition-trainer');
}

function startTransitionTrainer() {
  if (transitionTrainer.active) return;
  transitionTrainer.active = true;
  transitionTrainer.state = 'countdown';
  transitionTrainer.countdown = 3;

  document.getElementById('transition-pair-picker').style.display = 'none';
  document.getElementById('transition-pair-display').style.display = 'flex';
  document.getElementById('transition-countdown').style.display = 'block';
  document.getElementById('transition-start-btn').style.display = 'none';

  // Show chord pair
  document.getElementById('transition-from-name').textContent = CHORDS[transitionTrainer.from].name;
  document.getElementById('transition-to-name').textContent = CHORDS[transitionTrainer.to].name;
  renderChordDiagram(transitionTrainer.from, document.getElementById('transition-from-diagram'));
  renderChordDiagram(transitionTrainer.to, document.getElementById('transition-to-diagram'));

  // Countdown
  var timerEl = document.getElementById('transition-timer');
  var statusEl = document.getElementById('transition-status');
  transitionTrainer.timerId = setInterval(function() {
    transitionTrainer.countdown--;
    timerEl.textContent = transitionTrainer.countdown;
    if (transitionTrainer.countdown <= 0) {
      clearInterval(transitionTrainer.timerId);
      document.getElementById('transition-countdown').style.display = 'none';
      document.getElementById('transition-go').style.display = 'block';
      transitionTrainer.state = 'change';
      transitionTrainer.changeStart = Date.now();
      // Listen for chord change
      if (state.audio.micActive) {
        transitionTrainer.listenId = setInterval(checkTransitionChange, 200);
      }
      setTimeout(function() {
        if (transitionTrainer.state === 'change') {
          finishTransition(false);
        }
      }, 10000);
    }
  }, 1000);
}

function checkTransitionChange() {
  if (!state.audio.detectedChord) return;
  if (state.audio.detectedChord === transitionTrainer.to && state.audio.detectedConfidence > 0.6) {
    var timeMs = Date.now() - transitionTrainer.changeStart;
    finishTransition(true, timeMs);
  }
}

function finishTransition(success, timeMs) {
  clearInterval(transitionTrainer.timerId);
  clearInterval(transitionTrainer.listenId);
  transitionTrainer.active = false;
  transitionTrainer.state = 'done';

  document.getElementById('transition-go').style.display = 'none';
  document.getElementById('transition-stats').style.display = 'block';

  var key = transitionTrainer.from + '→' + transitionTrainer.to;
  if (!transitionTrainer.pairTimes[key]) transitionTrainer.pairTimes[key] = [];
  transitionTrainer.pairTimes[key].push({ time: timeMs, success: success });

  var statsEl = document.getElementById('transition-stats');
  var html = '<div class="transition-speed-row"><span class="transition-speed-label">Last Transition</span><span class="transition-speed-value">' +
    (success ? (timeMs / 1000).toFixed(1) + 's' : 'Timed out') + '</span></div>';
  statsEl.innerHTML = html;

  // Re-enable start button
  document.getElementById('transition-pair-picker').style.display = 'flex';
  document.getElementById('transition-pair-display').style.display = 'none';
  document.getElementById('transition-start-btn').style.display = 'block';
}

// ==================== FEATURE 2: BPM LADDER ====================
var bpmState = { running: false, currentBpm: 80, targetBpm: 120, direction: 'up', startTime: null, bestBpm: 80 };

function showBpmLadder() {
  var container = document.getElementById('bpm-container');
  if (!container) return;
  container.innerHTML =
    '<div class="bpm-title">BPM Ladder</div>' +
    '<div class="bpm-subtitle">Increase BPM as high as you can while staying accurate</div>' +
    '<div class="bpm-display" id="bpm-display">80</div>' +
    '<div class="bpm-label">BPM</div>' +
    '<div class="bpm-ladder-info">' +
      '<div class="bpm-ladder-row"><span class="bpm-ladder-label">Current</span><span class="bpm-ladder-value" id="bpm-current">80</span></div>' +
      '<div class="bpm-ladder-row"><span class="bpm-ladder-label">Target</span><span class="bpm-ladder-value" id="bpm-target">120</span></div>' +
      '<div class="bpm-ladder-row"><span class="bpm-ladder-label">Best</span><span class="bpm-ladder-value" id="bpm-best">80</span></div>' +
      '<div class="bpm-ladder-bar"><div class="bpm-ladder-fill" id="bpm-bar" style="width:0%"></div></div>' +
    '</div>' +
    '<button class="bpm-stop-btn" id="bpm-stop-btn">Stop & Save</button>' +
    '<div class="bpm-best" id="bpm-msg"></div>';
  document.getElementById('bpm-stop-btn').addEventListener('click', stopBpmLadder);
  showScreen('bpm-ladder');
}

function startBpmLadder() {
  bpmState.running = true;
  bpmState.startTime = Date.now();
  document.getElementById('bpm-display').textContent = bpmState.currentBpm;
  // Start metronome at current BPM
  if (typeof startMetronome === 'function') startMetronome(bpmState.currentBpm);
}

function stopBpmLadder() {
  bpmState.running = false;
  if (typeof stopMetronome === 'function') stopMetronome();
  // Save best
  if (bpmState.currentBpm > bpmState.bestBpm) {
    bpmState.bestBpm = bpmState.currentBpm;
    var msg = document.getElementById('bpm-msg');
    if (msg) msg.textContent = 'New best: ' + bpmState.bestBpm + ' BPM!';
  }
}

// ==================== FEATURE 3: ACHIEVEMENTS ====================
function showAchievements() {
  var container = document.getElementById('achievements-container');
  if (!container) return;
  var unlocked = [];
  var locked = [];
  ACHIEVEMENTS.forEach(function(a) {
    if (state.achievements[a.id]) unlocked.push(a);
    else locked.push(a);
  });

  var html = '<div class="achievements-title">Achievements</div>' +
    '<div class="achievements-subtitle">Track your progress milestones</div>' +
    '<div class="achievements-grid">';

  unlocked.forEach(function(a) {
    html += '<div class="achievement-card unlocked">' +
      '<span class="achievement-icon">' + a.icon + '</span>' +
      '<div class="achievement-name">' + a.name + '</div>' +
      '<div class="achievement-desc">' + a.desc + '</div>' +
    '</div>';
  });

  locked.forEach(function(a) {
    html += '<div class="achievement-card locked">' +
      '<span class="achievement-icon">🔒</span>' +
      '<div class="achievement-name">' + a.name + '</div>' +
      '<div class="achievement-desc">' + a.desc + '</div>' +
    '</div>';
  });

  html += '</div>';
  container.innerHTML = html;
  showScreen('achievements');
}

function checkAchievements() {
  ACHIEVEMENTS.forEach(function(a) {
    if (state.achievements[a.id]) return;
    if (a.condition(state.history)) {
      state.achievements[a.id] = Date.now();
      showAchievementToast(a);
    }
  });
  saveAchievements();
}

function showAchievementToast(ach) {
  var toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.textContent = ach.icon + ' Achievement Unlocked: ' + ach.name;
  document.body.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 3000);
}

// ==================== FEATURE 4: PRACTICE HISTORY ====================
function showHistory() {
  var container = document.getElementById('history-container');
  if (!container) return;

  var today = new Date().toISOString().split('T')[0];
  var streak = state.history.currentStreak || 0;
  var total = state.history.totalTransitions || 0;
  var sessions = state.history.sessions || 0;
  var unique = state.history.uniqueChords || 0;

  container.innerHTML =
    '<div class="history-title">Practice History</div>' +
    '<div class="history-subtitle">Track your progress over time</div>' +
    '<div class="streak-display">' +
      '<div class="streak-card"><div class="streak-value">' + streak + '</div><div class="streak-label">Day Streak</div></div>' +
      '<div class="streak-card"><div class="streak-value">' + sessions + '</div><div class="streak-label">Sessions</div></div>' +
    '</div>' +
    '<div class="history-stats">' +
      '<div class="history-stat-row"><span class="history-stat-label">Total Transitions</span><span class="history-stat-value">' + total + '</span></div>' +
      '<div class="history-stat-row"><span class="history-stat-label">Unique Chords</span><span class="history-stat-value">' + unique + '</span></div>' +
      '<div class="history-stat-row"><span class="history-stat-label">Sessions</span><span class="history-stat-value">' + sessions + '</span></div>' +
    '</div>' +
    '<div class="heatmap-container" id="heatmap-container"></div>';
  renderHeatmap();
  showScreen('history');
}

function renderHeatmap() {
  var container = document.getElementById('heatmap-container');
  if (!container) return;
  var html = '<div class="heatmap-grid">';
  // Show last 52 weeks (simplified - just show placeholder)
  for (var i = 0; i < 52; i++) {
    var level = Math.floor(Math.random() * 5); // placeholder
    html += '<div class="heatmap-cell l' + level + '"></div>';
  }
  html += '</div>';
  html += '<div class="heatmap-month-labels"><span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span></div>';
  container.innerHTML = html;
}

// ==================== FEATURE 5: CHORD LIBRARY ====================
function showLibrary() {
  var container = document.getElementById('library-container');
  if (!container) return;

  container.innerHTML =
    '<div class="library-title">Chord Library</div>' +
    '<div class="library-subtitle">Browse and learn chord shapes</div>' +
    '<input class="library-search" id="library-search" placeholder="Search chords...">' +
    '<div class="library-filter-row" id="library-filter">' +
      '<button class="library-filter-btn selected" data-filter="all">All</button>' +
      '<button class="library-filter-btn" data-filter="major">Major</button>' +
      '<button class="library-filter-btn" data-filter="minor">Minor</button>' +
      '<button class="library-filter-btn" data-filter="7">7th</button>' +
    '</div>' +
    '<div class="library-grid" id="library-grid"></div>' +
    '<div class="library-detail" id="library-detail" style="display:none"></div>';

  renderLibraryGrid('all');

  document.getElementById('library-search').addEventListener('input', function() {
    renderLibraryGrid('all', this.value);
  });

  document.querySelectorAll('.library-filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.library-filter-btn').forEach(function(b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      renderLibraryGrid(btn.dataset.filter);
    });
  });

  showScreen('library');
}

function renderLibraryGrid(filter, search) {
  var grid = document.getElementById('library-grid');
  if (!grid) return;
  grid.innerHTML = '';
  CHORD_ORDER.forEach(function(key) {
    if (search && key.toLowerCase().indexOf(search.toLowerCase()) === -1) return;
    if (filter === 'major' && key.indexOf('m') !== -1 && key.indexOf('maj') === -1) return;
    if (filter === 'minor' && key.indexOf('m') === -1) return;
    if (filter === '7' && key.indexOf('7') === -1) return;

    var chord = CHORDS[key];
    var card = document.createElement('div');
    card.className = 'library-card';
    card.innerHTML =
      '<div class="library-card-name">' + key + '</div>' +
      '<div class="library-card-diagram" id="lib-diag-' + key + '"></div>' +
      '<div class="library-card-add">View details</div>';
    card.addEventListener('click', function() { showLibraryDetail(key); });
    grid.appendChild(card);
    renderChordDiagram(key, document.getElementById('lib-diag-' + key));
  });
}

function showLibraryDetail(key) {
  var detail = document.getElementById('library-detail');
  if (!detail) return;
  var chord = CHORDS[key];
  detail.style.display = 'block';
  detail.innerHTML =
    '<div class="library-detail-name">' + key + ' - ' + chord.name + '</div>' +
    '<div id="lib-detail-diag"></div>' +
    '<div style="font-size:13px;color:var(--muted);margin:8px 0">Frets: ' + chord.frets.slice(1).join(', ') + '</div>' +
    '<button class="library-play-btn" onclick="playChord(state.outputCtx, \'' + key + '\', 0.5, 2)">Play Chord</button>';
  renderChordDiagram(key, document.getElementById('lib-detail-diag'));
}

// ==================== FEATURE 6: WARM-UP ROUTINES ====================
var warmupState = { running: false, currentRoutine: null, currentStep: 0, timerId: null };

function showWarmup() {
  var container = document.getElementById('warmup-container');
  if (!container) return;

  container.innerHTML =
    '<div class="warmup-title">Warm-up Routines</div>' +
    '<div class="warmup-subtitle">Get your fingers ready before practicing</div>' +
    '<div class="warmup-routines" id="warmup-routines"></div>' +
    '<div class="warmup-active" id="warmup-active" style="display:none"></div>' +
    '<div style="margin-top:12px">' +
      '<button class="warmup-btn" id="warmup-start-btn" style="display:none">Start Routine</button>' +
      '<button class="warmup-btn primary" id="warmup-next-btn" style="display:none">Next Step</button>' +
      '<button class="warmup-btn" id="warmup-stop-btn" style="display:none">Stop</button>' +
    '</div>';

  var routinesDiv = document.getElementById('warmup-routines');
  WARMUP_ROUTINES.forEach(function(r, i) {
    var card = document.createElement('div');
    card.className = 'warmup-card';
    card.innerHTML =
      '<div class="warmup-card-name">' + r.name + '</div>' +
      '<div class="warmup-card-desc">' + r.desc + '</div>' +
      '<div class="warmup-card-duration">' + (r.duration / 60) + ' min</div>';
    card.addEventListener('click', function() { selectWarmup(i); });
    routinesDiv.appendChild(card);
  });

  showScreen('warmup');
}

function selectWarmup(index) {
  warmupState.currentRoutine = WARMUP_ROUTINES[index];
  warmupState.currentStep = 0;
  document.querySelectorAll('.warmup-card').forEach(function(c, i) {
    c.classList.toggle('selected', i === index);
  });
  document.getElementById('warmup-start-btn').style.display = 'block';
}

function startWarmup() {
  warmupState.running = true;
  document.getElementById('warmup-routines').style.display = 'none';
  document.getElementById('warmup-start-btn').style.display = 'none';
  document.getElementById('warmup-stop-btn').style.display = 'block';
  document.getElementById('warmup-next-btn').style.display = 'block';
  showWarmupStep();
}

function showWarmupStep() {
  var active = document.getElementById('warmup-active');
  if (!active) return;
  active.style.display = 'block';
  var step = warmupState.currentRoutine.steps[warmupState.currentStep];
  var chordHtml = '';
  if (step.chord) {
    chordHtml = '<div id="warmup-chord-diagram"></div>';
  }
  active.innerHTML =
    '<div class="warmup-step-name">' + (step.chord ? step.chord + ' - ' : '') + step.text + '</div>' +
    '<div class="warmup-step-desc">Step ' + (warmupState.currentStep + 1) + ' of ' + warmupState.currentRoutine.steps.length + '</div>' +
    chordHtml +
    '<div class="warmup-timer" id="warmup-timer">0:00</div>' +
    '<div class="warmup-timer-label">Time remaining: ' + (step.duration || 30) + 's</div>' +
    '<div class="warmup-progress-text">' + Math.round((warmupState.currentStep / warmupState.currentRoutine.steps.length) * 100) + '% complete</div>';

  if (step.chord) {
    renderChordDiagram(step.chord, document.getElementById('warmup-chord-diagram'));
  }

  document.getElementById('warmup-next-btn').onclick = nextWarmupStep;
}

function nextWarmupStep() {
  warmupState.currentStep++;
  if (warmupState.currentStep >= warmupState.currentRoutine.steps.length) {
    // Done
    warmupState.running = false;
    document.getElementById('warmup-active').innerHTML = '<div style="font-size:20px;color:var(--success)">✓ Routine Complete!</div>';
    document.getElementById('warmup-next-btn').style.display = 'none';
    return;
  }
  showWarmupStep();
}

// ==================== FEATURE 7: FRETBOARD TRAINER ====================
var fretboardState = { targetNote: null, targetString: null, score: 0, total: 0, streak: 0 };

function showFretboardTrainer() {
  var container = document.getElementById('fretboard-trainer-container');
  if (!container) return;

  container.innerHTML =
    '<div class="fretboard-trainer-title">Fretboard Trainer</div>' +
    '<div class="fretboard-trainer-subtitle">Learn note positions on the fretboard</div>' +
    '<div class="fretboard-question">Find: <span class="fretboard-question-note" id="fretboard-note">A</span></div>' +
    '<div class="fretboard-target" id="fretboard-target">on string: <span id="fretboard-string">E2</span></div>' +
    '<div class="fretboard-interactive" id="fretboard-interactive"></div>' +
    '<div class="fretboard-score-display">Score: <span id="fretboard-score">0</span> / <span id="fretboard-total">0</span></div>' +
    '<div class="fretboard-streak" id="fretboard-streak">Streak: 0</div>' +
    '<div class="fretboard-config">' +
      '<button class="fretboard-config-btn selected" data-strings="all">All Strings</button>' +
      '<button class="fretboard-config-btn" data-strings="E2,A2,D3">Low</button>' +
      '<button class="fretboard-config-btn" data-strings="G3,B3,E4">High</button>' +
    '</div>' +
    '<div class="fretboard-result" id="fretboard-result"></div>';

  renderFretboardInteractive();
  generateFretboardQuestion();

  showScreen('fretboard-trainer');
}

function renderFretboardInteractive() {
  var container = document.getElementById('fretboard-interactive');
  if (!container) return;
  var w = 480, h = 200, pad = 20;
  var svg = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">';

  // Strings
  STRING_NAMES.forEach(function(name, si) {
    var y = pad + si * (h - pad * 2) / 5;
    svg += '<line x1="' + pad + '" y1="' + y + '" x2="' + (w - pad) + '" y2="' + y + '" stroke="#E5E0DA" stroke-width="1"/>';
    svg += '<text x="' + (pad - 5) + '" y="' + (y + 4) + '" font-size="10" fill="#9B9490" text-anchor="end">' + name + '</text>';
    // Frets
    for (var f = 0; f <= FRET_COUNT; f++) {
      var x = pad + (w - pad * 2) * f / FRET_COUNT;
      if (f > 0) {
        svg += '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + (h - pad * 2) / 5 * 0.3) + '" stroke="#E5E0DA" stroke-width="1"/>';
      }
      // Clickable areas
      if (f < FRET_COUNT) {
        var nextX = pad + (w - pad * 2) * (f + 1) / FRET_COUNT;
        svg += '<rect x="' + x + '" y="' + (y - (h - pad * 2) / 5 * 0.15) + '" width="' + (nextX - x) + '" height="' + (h - pad * 2) / 5 * 0.3 + '" fill="transparent" data-string="' + name + '" data-fret="' + f + '" onclick="checkFretboardAnswer(\'' + name + '\',' + f + ')" style="cursor:pointer"/>';
      }
    }
  });

  svg += '</svg>';
  container.innerHTML = svg;
}

function generateFretboardQuestion() {
  var stringIdx = Math.floor(Math.random() * STRING_NAMES.length);
  var fret = Math.floor(Math.random() * (FRET_COUNT + 1));
  fretboardState.targetString = STRING_NAMES[stringIdx];
  fretboardState.targetNote = FRETBOARD_NOTES[fretboardState.targetString][fret];

  document.getElementById('fretboard-note').textContent = fretboardState.targetNote;
  document.getElementById('fretboard-string').textContent = fretboardState.targetString;
  document.getElementById('fretboard-result').textContent = '';
  document.getElementById('fretboard-result').className = 'fretboard-result';
}

function checkFretboardAnswer(string, fret) {
  var note = FRETBOARD_NOTES[string][fret];
  fretboardState.total++;
  document.getElementById('fretboard-total').textContent = fretboardState.total;

  if (note === fretboardState.targetNote && string === fretboardState.targetString) {
    fretboardState.score++;
    fretboardState.streak++;
    document.getElementById('fretboard-score').textContent = fretboardState.score;
    document.getElementById('fretboard-streak').textContent = 'Streak: ' + fretboardState.streak;
    var result = document.getElementById('fretboard-result');
    result.textContent = 'Correct! ✓';
    result.className = 'fretboard-result correct';
    setTimeout(generateFretboardQuestion, 1000);
  } else {
    fretboardState.streak = 0;
    document.getElementById('fretboard-streak').textContent = 'Streak: 0';
    var result = document.getElementById('fretboard-result');
    result.textContent = 'Wrong. That\'s ' + note + '. Try again!';
    result.className = 'fretboard-result wrong';
  }
}

// ==================== FEATURE 8: CHORD THEORY ====================
function showChordTheory() {
  var container = document.getElementById('theory-container');
  if (!container) return;

  var firstChord = CHORD_ORDER[0];
  container.innerHTML =
    '<div class="theory-title">Chord Theory</div>' +
    '<div class="theory-panel">' +
      '<div class="theory-section-title">Select a chord</div>' +
      '<div class="theory-interval-grid" id="theory-chord-picker"></div>' +
      '<div id="theory-detail"></div>' +
    '</div>';

  var picker = document.getElementById('theory-chord-picker');
  CHORD_ORDER.slice(0, 12).forEach(function(key) {
    var btn = document.createElement('button');
    btn.className = 'transition-pair-btn';
    btn.textContent = key;
    btn.addEventListener('click', function() { renderChordTheory(key); });
    picker.appendChild(btn);
  });

  renderChordTheory(firstChord);
  showScreen('chord-theory');
}

function renderChordTheory(chordKey) {
  var detail = document.getElementById('theory-detail');
  if (!detail) return;
  var theory = CHORD_THEORY[chordKey];
  if (!theory) return;

  var notesHtml = '';
  theory.notes.forEach(function(note) {
    notesHtml += '<span class="theory-note-tag">' + note + '</span>';
  });

  var intervalsHtml = '';
  theory.intervals.forEach(function(interval, i) {
    var color = ['#C8823B', '#E67E22', '#2980B9', '#9B59B6'][i] || '#7F8C8D';
    intervalsHtml += '<div class="theory-interval" style="background:' + color + '20">' +
      '<div class="theory-interval-label" style="color:' + color + '">' + interval + '</div>' +
      '<div class="theory-interval-note" style="color:' + color + '">' + theory.notes[i] + '</div>' +
      '<div class="theory-interval-color" style="background:' + color + '"></div>' +
    '</div>';
  });

  detail.innerHTML =
    '<div class="theory-section-title" style="margin-top:16px">Intervals</div>' +
    '<div class="theory-interval-grid">' + intervalsHtml + '</div>' +
    '<div class="theory-section-title">Notes</div>' +
    '<div class="theory-notes-list">' + notesHtml + '</div>' +
    '<div class="theory-section-title">Explanation</div>' +
    '<div class="theory-explanation">' + getTheoryExplanation(chordKey) + '</div>' +
    '<div id="theory-fretboard"></div>';

  renderTheoryFretboard(chordKey);
}

function getTheoryExplanation(chordKey) {
  var theory = CHORD_THEORY[chordKey];
  if (!theory) return '';
  return chordKey + ' is a ' + (theory.intervals[1] === 'M3' ? 'major' : 'minor') +
    ' chord consisting of notes ' + theory.notes.join(', ') +
    '. The intervals are ' + theory.intervals.join(', ') + '.';
}

function renderTheoryFretboard(chordKey) {
  var container = document.getElementById('theory-fretboard');
  if (!container) return;
  var chord = CHORDS[chordKey];
  if (!chord) return;

  var w = 400, h = 120, pad = 20;
  var svg = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">';

  // Simplified fretboard showing the chord notes
  STRING_NAMES.forEach(function(name, si) {
    var y = pad + si * (h - pad * 2) / 5;
    svg += '<line x1="' + pad + '" y1="' + y + '" x2="' + (w - pad) + '" y2="' + y + '" stroke="#E5E0DA" stroke-width="1"/>';
  });

  // Mark the chord notes
  chord.frets.slice(1).forEach(function(fret, i) {
    if (fret === null) return;
    var x = pad + fret * (w - pad * 2) / 12;
    var y = pad + i * (h - pad * 2) / 5;
    svg += '<circle cx="' + x + '" cy="' + y + '" r="6" fill="#5B4E4B"/>';
  });

  svg += '</svg>';
  container.innerHTML = svg;
}

// ==================== FEATURE 9: RECORDING STUDIO ====================
var recordings = [];

function showRecording() {
  var container = document.getElementById('recording-container');
  if (!container) return;

  container.innerHTML =
    '<div class="recording-title">Recording Studio</div>' +
    '<div class="recording-subtitle">Record and playback your practice sessions</div>' +
    '<div class="recording-status idle" id="recording-status">Ready to record</div>' +
    '<div class="record-btn" id="record-btn">●</div>' +
    '<div class="waveform-container" id="waveform-container" style="display:none">' +
      '<canvas class="waveform-canvas" id="waveform-canvas" width="500" height="80"></canvas>' +
    '</div>' +
    '<div class="recordings-list" id="recordings-list"></div>';

  var recordBtn = document.getElementById('record-btn');
  recordBtn.addEventListener('click', toggleRecording);

  renderRecordingsList();
  showScreen('recording');
}

var mediaRecorder = null;
var recordedChunks = [];

function toggleRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    stopRecording();
  } else {
    startRecording();
  }
}

function startRecording() {
  if (!state.audio.stream) {
    alert('Please enable microphone first!');
    return;
  }

  recordedChunks = [];
  mediaRecorder = new MediaRecorder(state.audio.stream);
  mediaRecorder.ondataavailable = function(e) {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };
  mediaRecorder.onstop = saveRecording;
  mediaRecorder.start();

  var status = document.getElementById('recording-status');
  status.textContent = 'Recording...';
  status.className = 'recording-status recording';
  document.getElementById('record-btn').classList.add('recording');
}

function stopRecording() {
  if (mediaRecorder) mediaRecorder.stop();
  var status = document.getElementById('recording-status');
  status.textContent = 'Processing...';
  status.className = 'recording-status ready';
  document.getElementById('record-btn').classList.remove('recording');
}

function saveRecording() {
  var blob = new Blob(recordedChunks, { type: 'audio/webm' });
  var url = URL.createObjectURL(blob);
  var recording = {
    id: Date.now(),
    url: url,
    date: new Date().toLocaleString(),
    name: 'Recording ' + (recordings.length + 1)
  };
  recordings.push(recording);
  saveRecordings();
  renderRecordingsList();
}

function renderRecordingsList() {
  var list = document.getElementById('recordings-list');
  if (!list) return;
  var html = '';
  recordings.forEach(function(r) {
    html += '<div class="recording-item">' +
      '<div><div class="recording-item-name">' + r.name + '</div>' +
      '<div class="recording-item-date">' + r.date + '</div></div>' +
      '<button class="recording-play-btn" onclick="playRecording(' + r.id + ')">Play</button>' +
    '</div>';
  });
  list.innerHTML = html || '<div style="text-align:center;color:var(--muted);padding:20px;">No recordings yet</div>';
}

function playRecording(id) {
  var rec = recordings.find(function(r) { return r.id === id; });
  if (rec) {
    var audio = new Audio(rec.url);
    audio.play();
  }
}

// ==================== FEATURE 10: SHARE PROGRESS ====================
function showShareSummary() {
  var container = document.getElementById('share-container');
  if (!container) return;

  var total = state.history.totalTransitions || 0;
  var sessions = state.history.sessions || 0;
  var streak = state.history.currentStreak || 0;
  var unique = state.history.uniqueChords || 0;
  var unlocked = Object.keys(state.achievements || {}).length;

  var shareText = '🎸 Guitar Practice Update 🎸\n' +
    'Sessions: ' + sessions + '\n' +
    'Total Transitions: ' + total + '\n' +
    'Day Streak: ' + streak + '\n' +
    'Unique Chords: ' + unique + '\n' +
    'Achievements: ' + unlocked + '\n' +
    '#GuitarPractice';

  var challengeLink = 'https://gandhiaayush.github.io/guitar-practice/?challenge=' +
    btoa(JSON.stringify({ chords: state.selectedChords, interval: state.interval, mode: state.mode }));

  container.innerHTML =
    '<div class="share-title">Share Progress</div>' +
    '<div class="share-subtitle">Show off your progress to friends!</div>' +
    '<div class="share-preview">' +
      '<div class="share-preview-title">My Guitar Practice Stats</div>' +
      '<div class="share-preview-stats">' +
        '<div class="share-preview-stat"><div class="share-preview-stat-value">' + sessions + '</div><div class="share-preview-stat-label">Sessions</div></div>' +
        '<div class="share-preview-stat"><div class="share-preview-stat-value">' + total + '</div><div class="share-preview-stat-label">Transitions</div></div>' +
        '<div class="share-preview-stat"><div class="share-preview-stat-value">' + streak + '</div><div class="share-preview-stat-label">Day Streak</div></div>' +
        '<div class="share-preview-stat"><div class="share-preview-stat-value">' + unlocked + '</div><div class="share-preview-stat-label">Achievements</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="share-text" id="share-text">' + shareText + '</div>' +
    '<div class="share-actions">' +
      '<button class="share-btn primary" onclick="copyShareText()">Copy Text</button>' +
      '<button class="share-btn" onclick="shareNative()">Share...</button>' +
    '</div>' +
    '<div style="margin-top:12px;font-size:12px;color:var(--muted)">Challenge a friend:</div>' +
    '<div class="challenge-link" id="challenge-link">' + challengeLink + '</div>';

  showScreen('share');
}

function copyShareText() {
  var text = document.getElementById('share-text').textContent;
  navigator.clipboard.writeText(text).then(function() {
    alert('Copied to clipboard!');
  });
}

function shareNative() {
  var text = document.getElementById('share-text').textContent;
  if (navigator.share) {
    navigator.share({ title: 'My Guitar Practice Stats', text: text });
  } else {
    copyShareText();
  }
}

// ==================== FEATURE 11: AUTO-TUNER ====================
var autoTunerState = { selectedString: 'E2', scanning: false, tuning: false };

function showAutoTuner() {
  var container = document.getElementById('auto-tuner-container');
  if (!container) return;

  container.innerHTML =
    '<div class="auto-tuner-title">Auto-Tuner</div>' +
    '<div class="auto-tuner-subtitle">Tune your guitar with microphone detection</div>' +
    '<div class="auto-tuner-gauge" id="auto-tuner-gauge">' +
      '<svg width="300" height="150" viewBox="0 0 300 150">' +
        '<rect x="50" y="50" width="200" height="80" rx="40" fill="#E5E0DA"/>' +
        '<rect id="tuner-fill" x="50" y="90" width="200" height="40" rx="20" fill="#5B4E4B"/>' +
        '<text x="150" y="85" text-anchor="middle" font-size="24" font-weight="bold" fill="white" id="tuner-cents-display">0 cents</text>' +
      '</svg>' +
    '</div>' +
    '<div class="auto-tuner-string-display" id="tuner-string-display">E2</div>' +
    '<div class="auto-tuner-cents" id="tuner-cents">0 cents</div>' +
    '<div class="auto-tuner-direction" id="tuner-direction">Play the string</div>' +
    '<div class="auto-tuner-strings">' +
      '<button class="auto-tuner-string-btn selected" data-string="E2" onclick="selectAutoTunerString(\'E2\')"><div>E2</div><div class="auto-tuner-string-label">6th</div></button>' +
      '<button class="auto-tuner-string-btn" data-string="A2" onclick="selectAutoTunerString(\'A2\')"><div>A2</div><div class="auto-tuner-string-label">5th</div></button>' +
      '<button class="auto-tuner-string-btn" data-string="D3" onclick="selectAutoTunerString(\'D3\')"><div>D3</div><div class="auto-tuner-string-label">4th</div></button>' +
      '<button class="auto-tuner-string-btn" data-string="G3" onclick="selectAutoTunerString(\'G3\')"><div>G3</div><div class="auto-tuner-string-label">3rd</div></button>' +
      '<button class="auto-tuner-string-btn" data-string="B3" onclick="selectAutoTunerString(\'B3\')"><div>B3</div><div class="auto-tuner-string-label">2nd</div></button>' +
      '<button class="auto-tuner-string-btn" data-string="E4" onclick="selectAutoTunerString(\'E4\')"><div>E4</div><div class="auto-tuner-string-label">1st</div></button>' +
    '</div>' +
    '<div class="auto-tuner-status" id="tuner-status">Ready</div>' +
    '<button class="auto-tuner-play-ref" onclick="playTone(TUNING[\'E2\'])">Play Reference</button>';

  showScreen('auto-tuner');
}

function selectAutoTunerString(string) {
  autoTunerState.selectedString = string;
  document.querySelectorAll('.auto-tuner-string-btn').forEach(function(btn) {
    btn.classList.toggle('selected', btn.dataset.string === string);
  });
  document.getElementById('tuner-string-display').textContent = string;
}

function playTone(freq) {
  if (!state.outputCtx) state.outputCtx = new (window.AudioContext || window.webkitAudioContext)();
  var osc = state.outputCtx.createOscillator();
  var gain = state.outputCtx.createGain();
  osc.frequency.value = freq;
  gain.gain.value = 0.3;
  osc.connect(gain);
  gain.connect(state.outputCtx.destination);
  osc.start();
  setTimeout(function() { osc.stop(); }, 1000);
}

// ==================== FEATURE 12: METRONOME WITH TAP TEMPO ====================
var metronomeState = { running: false, bpm: 120, intervalId: null, beats: 0, timeSign: 4, tapTimes: [], lastTap: 0 };

function showMetronome() {
  var container = document.getElementById('metronome-container');
  if (!container) return;

  container.innerHTML =
    '<div class="metronome-title">Metronome</div>' +
    '<div class="metronome-subtitle">Keep time with adjustable BPM and tap tempo</div>' +
    '<div class="metronome-bpm-display" id="metronome-bpm" onclick="editBpm()">' + metronomeState.bpm + '</div>' +
    '<div class="metronome-bpm-label">BPM</div>' +
    '<div class="metronome-controls">' +
      '<button class="metronome-btn" onclick="changeBpm(-1)">−</button>' +
      '<button class="metronome-btn" onclick="changeBpm(-10)">−10</button>' +
      '<button class="metronome-btn" onclick="changeBpm(10)">+10</button>' +
      '<button class="metronome-btn" onclick="changeBpm(1)">+</button>' +
    '</div>' +
    '<button class="metronome-tap-btn" id="tap-btn" onclick="tapTempo()">Tap Tempo</button>' +
    '<div class="metronome-beat-display" id="beat-display">' +
      '<div class="metronome-beat-dot accent-beat" id="beat-0"></div>' +
      '<div class="metronome-beat-dot" id="beat-1"></div>' +
      '<div class="metronome-beat-dot" id="beat-2"></div>' +
      '<div class="metronome-beat-dot" id="beat-3"></div>' +
    '</div>' +
    '<button class="metronome-play-btn" id="metronome-play-btn" onclick="toggleMetronome()">Start</button>' +
    '<div class="metronome-tempo-label" id="tempo-label">Moderato</div>';

  updateTempoLabel();
  showScreen('metronome');
}

function toggleMetronome() {
  if (metronomeState.running) {
    stopMetronome();
  } else {
    startMetronome(metronomeState.bpm);
  }
}

function startMetronome(bpm) {
  metronomeState.running = true;
  metronomeState.bpm = bpm || metronomeState.bpm;
  metronomeState.beats = 0;

  document.getElementById('metronome-play-btn').textContent = 'Stop';
  document.getElementById('metronome-play-btn').classList.add('playing');

  var interval = 60000 / metronomeState.bpm;
  metronomeState.intervalId = setInterval(function() {
    playMetronomeClick(metronomeState.beats === 0);
    updateBeatDisplay();
    metronomeState.beats = (metronomeState.beats + 1) % metronomeState.timeSign;
  }, interval);
}

function stopMetronome() {
  metronomeState.running = false;
  if (metronomeState.intervalId) clearInterval(metronomeState.intervalId);
  document.getElementById('metronome-play-btn').textContent = 'Start';
  document.getElementById('metronome-play-btn').classList.remove('playing');
  document.querySelectorAll('.metronome-beat-dot').forEach(function(d) { d.classList.remove('active'); });
}

function playMetronomeClick(accent) {
  if (!state.outputCtx) state.outputCtx = new (window.AudioContext || window.webkitAudioContext)();
  var osc = state.outputCtx.createOscillator();
  var gain = state.outputCtx.createGain();
  osc.frequency.value = accent ? 1000 : 800;
  gain.gain.value = 0.3;
  gain.gain.exponentialRampToValueAtTime(0.01, state.outputCtx.currentTime + 0.05);
  osc.connect(gain);
  gain.connect(state.outputCtx.destination);
  osc.start();
  osc.stop(state.outputCtx.currentTime + 0.05);
}

function updateBeatDisplay() {
  document.querySelectorAll('.metronome-beat-dot').forEach(function(d, i) {
    d.classList.toggle('active', i === metronomeState.beats);
  });
}

function changeBpm(amount) {
  metronomeState.bpm = Math.max(40, Math.min(240, metronomeState.bpm + amount));
  document.getElementById('metronome-bpm').textContent = metronomeState.bpm;
  updateTempoLabel();
  if (metronomeState.running) {
    stopMetronome();
    startMetronome(metronomeState.bpm);
  }
}

function editBpm() {
  var newBpm = prompt('Enter BPM (40-240):', metronomeState.bpm);
  if (newBpm && !isNaN(newBpm)) {
    metronomeState.bpm = Math.max(40, Math.min(240, parseInt(newBpm)));
    document.getElementById('metronome-bpm').textContent = metronomeState.bpm;
    updateTempoLabel();
    if (metronomeState.running) {
      stopMetronome();
      startMetronome(metronomeState.bpm);
    }
  }
}

function tapTempo() {
  var now = Date.now();
  if (metronomeState.lastTap && (now - metronomeState.lastTap) < 2000) {
    metronomeState.tapTimes.push(now - metronomeState.lastTap);
    if (metronomeState.tapTimes.length > 5) metronomeState.tapTimes.shift();
    var avg = metronomeState.tapTimes.reduce(function(a, b) { return a + b; }, 0) / metronomeState.tapTimes.length;
    metronomeState.bpm = Math.round(60000 / avg);
    document.getElementById('metronome-bpm').textContent = metronomeState.bpm;
    updateTempoLabel();
    // Visual feedback
    var btn = document.getElementById('tap-btn');
    btn.classList.add('tapped');
    setTimeout(function() { btn.classList.remove('tapped'); }, 100);
  }
  metronomeState.lastTap = now;
}

function updateTempoLabel() {
  var bpm = metronomeState.bpm;
  var label = 'Largo';
  if (bpm > 60) label = 'Andante';
  if (bpm > 90) label = 'Moderato';
  if (bpm > 120) label = 'Allegro';
  if (bpm > 160) label = 'Presto';
  var el = document.getElementById('tempo-label');
  if (el) el.textContent = label;
}
""";

with open('js/features.js', 'w') as f:
    f.write(features_js)
print("features.js written")
