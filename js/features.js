// ==================== FEATURE 1: CHORD TRANSITION TRAINER ====================
let transitionTrainer = { active: false, from: null, to: null, timerId: null, countdown: 3, state: 'idle', pairTimes: {} };

function showTransitionTrainer() {
  const container = document.getElementById('transition-container');
  if (!container) return;
  container.innerHTML = `
    <div class="transition-title">Chord Transition Trainer</div>
    <div class="transition-subtitle">Practice switching between two specific chords with timed transitions</div>
    <div class="transition-pair-picker" id="transition-pair-picker"></div>
    <div class="transition-pair-display" id="transition-pair-display" style="display:none">
      <div class="transition-chord-card">
        <div class="chord-label">From</div>
        <div class="chord-name-sm" id="transition-from-name"></div>
        <div id="transition-from-diagram"></div>
      </div>
      <div class="transition-arrow">→</div>
      <div class="transition-chord-card">
        <div class="chord-label">To</div>
        <div class="chord-name-sm" id="transition-to-name"></div>
        <div id="transition-to-diagram"></div>
      </div>
    </div>
    <div class="transition-countdown" id="transition-countdown" style="display:none">
      <div class="transition-timer-display" id="transition-timer">3</div>
      <div class="transition-label" id="transition-status">Get ready...</div>
    </div>
    <div class="transition-go" id="transition-go" style="display:none">
      <div class="transition-go">CHANGE!</div>
    </div>
    <div id="transition-stats" class="transition-stats" style="display:none"></div>
    <button class="start-btn" id="transition-start-btn" style="margin-top:16px">Start</button>
  `;

  // Render pair picker
  const picker = document.getElementById('transition-pair-picker');
  TRANSITION_PAIRS.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.className = 'transition-pair-btn' + (i === 0 ? ' selected' : '');
    btn.textContent = `${p.from} → ${p.to}`;
    btn.dataset.from = p.from;
    btn.dataset.to = p.to;
    btn.addEventListener('click', () => {
      picker.querySelectorAll('.transition-pair-btn').forEach(b => b.classList.remove('selected'));
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
  const timerEl = document.getElementById('transition-timer');
  const statusEl = document.getElementById('transition-status');
  transitionTrainer.timerId = setInterval(() => {
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
      setTimeout(() => {
        if (transitionTrainer.state === 'change') {
          finishTransition(false);
        }
      }, 10000);
    }
  }, 1000);
}

function checkTransitionChange() {
  if (!transitionTrainer.active || transitionTrainer.state !== 'change') return;
  if (state.audio.detectedChord === transitionTrainer.to && state.audio.detectedConfidence > 0.45) {
    const time = Date.now() - transitionTrainer.changeStart;
    finishTransition(true, time);
  }
}

function finishTransition(success, timeMs) {
  transitionTrainer.active = false;
  transitionTrainer.state = 'done';
  if (transitionTrainer.timerId) clearInterval(transitionTrainer.timerId);
  if (transitionTrainer.listenId) clearInterval(transitionTrainer.listenId);

  document.getElementById('transition-go').style.display = 'none';

  const key = `${transitionTrainer.from}→${transitionTrainer.to}`;
  if (!transitionTrainer.pairTimes[key]) transitionTrainer.pairTimes[key] = [];
  if (success) transitionTrainer.pairTimes[key].push(timeMs || 5000);

  // Show stats
  const statsEl = document.getElementById('transition-stats');
  statsEl.style.display = 'block';
  let html = `<div class="transition-speed-row"><span class="transition-speed-label">Last Transition</span><span class="transition-speed-value">${success ? (timeMs/1000).toFixed(1)+'s' : 'Timed out'}</span></div>`;

  const times = transitionTrainer.pairTimes[key] || [];
  if (times.length > 0) {
    const avg = times.reduce((a,b)=>a+b,0) / times.length;
    html += `<div class="transition-speed-row"><span class="transition-speed-label">Best</span><span class="transition-speed-value">${(Math.min(...times)/1000).toFixed(1)}s</span></div>`;
    html += `<div class="transition-speed-row"><span class="transition-speed-label">Average</span><span class="transition-speed-value">${(avg/1000).toFixed(1)}s</span></div>`;
  }
  statsEl.innerHTML = html;

  // Show next button
  const btn = document.createElement('button');
  btn.className = 'start-btn';
  btn.textContent = 'Try Again';
  btn.style.marginTop = '12px';
  btn.addEventListener('click', () => {
    transitionTrainer.state = 'idle';
    document.getElementById('transition-pair-display').style.display = 'none';
    document.getElementById('transition-stats').style.display = 'none';
    document.getElementById('transition-pair-picker').style.display = 'flex';
    document.getElementById('transition-start-btn').style.display = 'block';
    document.getElementById('transition-go').style.display = 'none';
  });
  statsEl.appendChild(btn);
}

// ==================== FEATURE 2: BPM PROGRESSIVE TRAINING ====================
let bpmLadder = { active: false, currentBpm: 60, startBpm: 60, increment: 10, stepCount: 0, maxBpm: 60, stopped: false };

function showBpmLadder() {
  const container = document.getElementById('bpm-container');
  if (!container) return;
  container.innerHTML = `
    <div class="bpm-title">BPM Progressive Training</div>
    <div class="bpm-subtitle">Start slow and climb the tempo ladder. Press "Too Fast!" when you can't keep up.</div>
    <div class="bpm-display" id="bpm-display">60</div>
    <div class="bpm-label">Beats Per Minute</div>
    <div class="bpm-ladder-info" id="bpm-ladder-info">
      <div class="bpm-ladder-row"><span class="bpm-ladder-label">Start BPM</span><span class="bpm-ladder-value" id="bpm-start">60</span></div>
      <div class="bpm-ladder-row"><span class="bpm-ladder-label">Increment</span><span class="bpm-ladder-value" id="bpm-inc">10 BPM</span></div>
      <div class="bpm-ladder-row"><span class="bpm-ladder-label">Steps</span><span class="bpm-ladder-value" id="bpm-steps">0</span></div>
      <div class="bpm-ladder-bar"><div class="bpm-ladder-fill" id="bpm-fill" style="width:0%"></div></div>
    </div>
    <button class="start-btn" id="bpm-start-btn" style="margin-top:16px">Start Ladder</button>
    <button class="bpm-stop-btn" id="bpm-stop-btn" style="display:none; margin-top:8px">Too Fast! Stop Here</button>
    <div class="bpm-best" id="bpm-best"></div>
  `;

  document.getElementById('bpm-start-btn').addEventListener('click', startBpmLadder);
  document.getElementById('bpm-stop-btn').addEventListener('click', stopBpmLadder);

  // Load best
  const best = parseInt(localStorage.getItem('gp_best_bpm') || '60');
  const bestEl = document.getElementById('bpm-best');
  if (best > 60) bestEl.textContent = `Personal Best: ${best} BPM`;
  showScreen('bpm-ladder');
}

function startBpmLadder() {
  if (bpmLadder.active) return;
  bpmLadder = { active: true, currentBpm: 60, startBpm: 60, increment: 10, stepCount: 0, maxBpm: 60, stopped: false };
  metronomeBpm = 60;
  document.getElementById('bpm-start-btn').style.display = 'none';
  document.getElementById('bpm-stop-btn').style.display = 'block';
  document.getElementById('bpm-display').textContent = '60';
  document.getElementById('bpm-start').textContent = '60';
  updateMetronomeUI();
  startMetronome();
  bpmLadder.intervalId = setInterval(() => {
    if (!bpmLadder.active) return;
    bpmLadder.stepCount++;
    bpmLadder.currentBpm += bpmLadder.increment;
    bpmLadder.maxBpm = bpmLadder.currentBpm;
    setMetronomeBpm(bpmLadder.currentBpm);
    document.getElementById('bpm-display').textContent = bpmLadder.currentBpm;
    document.getElementById('bpm-steps').textContent = bpmLadder.stepCount;
    document.getElementById('bpm-fill').style.width = `${(bpmLadder.currentBpm / 200) * 100}%`;
  }, 15000); // Increase every 15 seconds
}

function stopBpmLadder() {
  if (!bpmLadder.active) return;
  bpmLadder.active = false;
  bpmLadder.stopped = true;
  if (bpmLadder.intervalId) clearInterval(bpmLadder.intervalId);
  stopMetronome();
  document.getElementById('bpm-stop-btn').style.display = 'none';
  document.getElementById('bpm-start-btn').textContent = 'Try Again';
  document.getElementById('bpm-start-btn').style.display = 'block';

  const best = parseInt(localStorage.getItem('gp_best_bpm') || '60');
  if (bpmLadder.maxBpm > best) {
    localStorage.setItem('gp_best_bpm', bpmLadder.maxBpm.toString());
    document.getElementById('bpm-best').textContent = `New Personal Best: ${bpmLadder.maxBpm} BPM!`;
  } else {
    document.getElementById('bpm-best').textContent = `Stopped at ${bpmLadder.maxBpm} BPM. Best: ${best} BPM`;
  }

  // Save to history
  const stats = getHistoryStats();
  stats.maxBpm = bpmLadder.maxBpm;
}

// ==================== FEATURE 3: ACHIEVEMENTS ====================
// (loadAchievements, saveAchievements, checkAchievements, showAchievementToast, renderAchievements are in audio.js)

// ==================== FEATURE 4: PRACTICE HISTORY & STREAKS ====================
// (loadHistory, saveHistory, addHistoryEntry, getHistoryStats, renderHeatmap are in audio.js)

function showHistory() {
  const container = document.getElementById('history-container');
  if (!container) return;
  renderHeatmap();
  const stats = getHistoryStats();
  const statsEl = document.getElementById('history-stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="history-stat-row"><span class="history-stat-label">Total Sessions</span><span class="history-stat-value">${stats.sessions}</span></div>
      <div class="history-stat-row"><span class="history-stat-label">Total Transitions</span><span class="history-stat-value">${stats.totalTransitions}</span></div>
      <div class="history-stat-row"><span class="history-stat-label">Current Streak</span><span class="history-stat-value">${stats.currentStreak} days</span></div>
      <div class="history-stat-row"><span class="history-stat-label">Unique Chords</span><span class="history-stat-value">${stats.uniqueChords}</span></div>
      <div class="history-stat-row"><span class="history-stat-label">Longest Session</span><span class="history-stat-value">${Math.floor(stats.longestSession/60)}m ${stats.longestSession%60}s</span></div>
    `;
  }
  renderAchievements();
  showScreen('history');
}

// ==================== FEATURE 5: CHORD LIBRARY BROWSER ====================
let libraryFilter = 'all';
let librarySearch = '';

function showLibrary() {
  const container = document.getElementById('library-container');
  if (!container) return;
  container.innerHTML = `
    <div class="library-title">Chord Library</div>
    <div class="library-subtitle">Browse all chords, hear how they sound, and add to practice</div>
    <input type="text" class="library-search" id="library-search" placeholder="Search chords...">
    <div class="library-filter-row" id="library-filter-row"></div>
    <div class="library-grid" id="library-grid"></div>
    <div class="library-detail" id="library-detail" style="display:none"></div>
  `;

  // Filters
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'major', label: 'Major' },
    { key: 'minor', label: 'Minor' },
    { key: '7th', label: '7th' },
    { key: 'sus', label: 'Sus' },
    { key: 'add9', label: 'Add9' },
    { key: 'maj7', label: 'Maj7' },
    { key: 'power', label: 'Power' },
  ];
  const filterRow = document.getElementById('library-filter-row');
  filters.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'library-filter-btn' + (f.key === 'all' ? ' selected' : '');
    btn.textContent = f.label;
    btn.addEventListener('click', () => {
      filterRow.querySelectorAll('.library-filter-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      libraryFilter = f.key;
      renderLibraryGrid();
    });
    filterRow.appendChild(btn);
  });

  document.getElementById('library-search').addEventListener('input', (e) => {
    librarySearch = e.target.value.toLowerCase();
    renderLibraryGrid();
  });

  renderLibraryGrid();
  showScreen('library');
}

function renderLibraryGrid() {
  const grid = document.getElementById('library-grid');
  if (!grid) return;
  grid.innerHTML = '';
  CHORD_ORDER.forEach(key => {
    const chord = CHORDS[key];
    if (!chord) return;
    // Filter
    if (libraryFilter === 'major' && !key.match(/^[A-G]$/)) return;
    if (libraryFilter === 'minor' && !key.includes('m')) return;
    if (libraryFilter === '7th' && !key.includes('7')) return;
    if (libraryFilter === 'sus' && !key.includes('sus')) return;
    if (libraryFilter === 'add9' && !key.includes('add9')) return;
    if (libraryFilter === 'maj7' && !key.includes('maj7')) return;
    if (libraryFilter === 'power' && !key.includes('5')) return;
    if (librarySearch && !chord.name.toLowerCase().includes(librarySearch) && !key.toLowerCase().includes(librarySearch)) return;

    const card = document.createElement('div');
    card.className = 'library-card' + (state.selectedChords.includes(key) ? ' selected' : '');
    card.innerHTML = `
      <div class="library-card-name">${chord.name}</div>
      <div class="library-card-diagram" id="lib-diag-${key}"></div>
      <div class="library-card-add">${state.selectedChords.includes(key) ? 'In Practice ✓' : 'Tap to preview & add'}</div>
    `;
    card.addEventListener('click', () => showLibraryDetail(key));
    grid.appendChild(card);
    renderChordDiagram(key, document.getElementById(`lib-diag-${key}`));
  });
}

function showLibraryDetail(key) {
  const chord = CHORDS[key];
  const detail = document.getElementById('library-detail');
  if (!detail) return;
  detail.style.display = 'block';
  detail.innerHTML = `
    <div class="library-detail-name">${chord.name}</div>
    <div id="lib-detail-diag"></div>
    <div id="lib-detail-notation"></div>
    <button class="library-play-btn" onclick="playChordArpeggio('${key}')">🔊 Play Arpeggio</button>
    <button class="library-play-btn" onclick="toggleLibraryPractice('${key}')" id="lib-practice-btn">
      ${state.selectedChords.includes(key) ? 'Remove from Practice' : 'Add to Practice'}
    </button>
  `;
  renderChordDiagram(key, document.getElementById('lib-detail-diag'));
  renderNotation(key, document.getElementById('lib-detail-notation'));
}

function toggleLibraryPractice(key) {
  const idx = state.selectedChords.indexOf(key);
  if (idx >= 0) state.selectedChords.splice(idx, 1);
  else state.selectedChords.push(key);
  renderLibraryGrid();
  const btn = document.getElementById('lib-practice-btn');
  if (btn) btn.textContent = state.selectedChords.includes(key) ? 'Remove from Practice' : 'Add to Practice';
}

// ==================== FEATURE 6: GUIDED WARM-UP ROUTINES ====================
let warmupState = { active: false, currentRoutine: null, currentStep: 0, timerId: null, timeLeft: 0 };

function showWarmup() {
  const container = document.getElementById('warmup-container');
  if (!container) return;
  container.innerHTML = `
    <div class="warmup-title">Guided Warm-up Routines</div>
    <div class="warmup-subtitle">Prepare your fingers with structured warm-up exercises</div>
    <div class="warmup-routines" id="warmup-routines"></div>
    <div class="warmup-active" id="warmup-active" style="display:none"></div>
  `;

  const routinesEl = document.getElementById('warmup-routines');
  WARMUP_ROUTINES.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'warmup-card' + (i === 0 ? ' selected' : '');
    card.innerHTML = `
      <div class="warmup-card-name">${r.name}</div>
      <div class="warmup-card-desc">${r.desc}</div>
      <div class="warmup-card-duration">${r.duration}s</div>
    `;
    card.addEventListener('click', () => {
      routinesEl.querySelectorAll('.warmup-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      warmupState.currentRoutine = i;
    });
    routinesEl.appendChild(card);
  });
  warmupState.currentRoutine = 0;

  const startBtn = document.createElement('button');
  startBtn.className = 'start-btn';
  startBtn.textContent = 'Start Warm-up';
  startBtn.style.marginTop = '16px';
  startBtn.addEventListener('click', startWarmup);
  container.appendChild(startBtn);

  showScreen('warmup');
}

function startWarmup() {
  const routine = WARMUP_ROUTINES[warmupState.currentRoutine];
  if (!routine) return;
  warmupState.active = true;
  warmupState.currentStep = 0;
  document.getElementById('warmup-routines').style.display = 'none';
  showWarmupStep();
}

function showWarmupStep() {
  const routine = WARMUP_ROUTINES[warmupState.currentRoutine];
  if (warmupState.currentStep >= routine.steps.length) {
    finishWarmup();
    return;
  }
  const step = routine.steps[warmupState.currentStep];
  const activeEl = document.getElementById('warmup-active');
  activeEl.style.display = 'block';
  warmupState.timeLeft = step.duration;

  let html = `
    <div class="warmup-step-name">Step ${warmupState.currentStep + 1}: ${step.text}</div>
    <div class="warmup-timer" id="warmup-timer">${warmupState.timeLeft}s</div>
    <div class="warmup-timer-label">remaining</div>
  `;

  if (step.type === 'chord' && step.chord) {
    html += `<div id="warmup-step-diag" style="margin:12px 0"></div>`;
  }

  html += `<div class="warmup-progress-text">${warmupState.currentStep + 1} / ${routine.steps.length}</div>`;
  html += `<button class="warmup-btn primary" id="warmup-next-btn">Next Step</button>`;
  activeEl.innerHTML = html;

  if (step.type === 'chord' && step.chord) {
    renderChordDiagram(step.chord, document.getElementById('warmup-step-diag'));
  }

  document.getElementById('warmup-next-btn').addEventListener('click', () => {
    warmupState.currentStep++;
    showWarmupStep();
  });

  if (warmupState.timerId) clearInterval(warmupState.timerId);
  warmupState.timerId = setInterval(() => {
    warmupState.timeLeft--;
    const timerEl = document.getElementById('warmup-timer');
    if (timerEl) timerEl.textContent = warmupState.timeLeft + 's';
    if (warmupState.timeLeft <= 0) {
      clearInterval(warmupState.timerId);
      warmupState.currentStep++;
      showWarmupStep();
    }
  }, 1000);
}

function finishWarmup() {
  warmupState.active = false;
  if (warmupState.timerId) clearInterval(warmupState.timerId);
  const activeEl = document.getElementById('warmup-active');
  activeEl.innerHTML = `
    <div class="warmup-step-name" style="color:var(--success)">✓ Warm-up Complete!</div>
    <div class="warmup-timer-label">Great job. Ready to practice?</div>
    <button class="warmup-btn primary" onclick="showScreen('setup')">Go to Practice</button>
  `;
}

// ==================== FEATURE 7: FRETBOARD MEMORIZATION TRAINER ====================
let fretboardTrainer = { active: false, targetNote: null, targetString: null, score: 0, streak: 0, bestStreak: 0, config: { strings: [0,1,2,3,4,5], frets: 12, notes: 'natural' } };

function showFretboardTrainer() {
  const container = document.getElementById('fretboard-trainer-container');
  if (!container) return;
  container.innerHTML = `
    <div class="fretboard-trainer-title">Fretboard Memorization</div>
    <div class="fretboard-trainer-subtitle">Click the correct fret for the given note</div>
    <div class="fretboard-config">
      <button class="fretboard-config-btn selected" data-strings="all">All Strings</button>
      <button class="fretboard-config-btn" data-strings="first4">First 4 Frets</button>
      <button class="fretboard-config-btn" data-notes="natural">Natural</button>
      <button class="fretboard-config-btn" data-notes="all">All Notes</button>
    </div>
    <div class="fretboard-question" id="fretboard-question">
      <div class="fretboard-question-note">Ready?</div>
      <div class="fretboard-target" id="fretboard-target"></div>
    </div>
    <div class="fretboard-interactive" id="fretboard-interactive"></div>
    <div class="fretboard-result" id="fretboard-result"></div>
    <div class="fretboard-score-display" id="fretboard-score">Score: 0</div>
    <div class="fretboard-streak" id="fretboard-streak">Streak: 0 | Best: 0</div>
    <button class="start-btn" id="fretboard-start-btn" style="margin-top:16px">Start</button>
  `;

  // Config buttons
  container.querySelectorAll('.fretboard-config-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.fretboard-config-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (btn.dataset.strings === 'first4') fretboardTrainer.config.frets = 4;
      else if (btn.dataset.strings === 'all') fretboardTrainer.config.frets = 12;
      if (btn.dataset.notes === 'natural') fretboardTrainer.config.notes = 'natural';
      else if (btn.dataset.notes === 'all') fretboardTrainer.config.notes = 'all';
    });
  });

  document.getElementById('fretboard-start-btn').addEventListener('click', startFretboardTrainer);
  showScreen('fretboard-trainer');
}

function startFretboardTrainer() {
  fretboardTrainer.active = true;
  fretboardTrainer.score = 0;
  fretboardTrainer.streak = 0;
  fretboardTrainer.bestStreak = parseInt(localStorage.getItem('gp_fretboard_best') || '0');
  document.getElementById('fretboard-start-btn').style.display = 'none';
  nextFretboardQuestion();
}

function nextFretboardQuestion() {
  if (!fretboardTrainer.active) return;
  // Pick random string and fret
  const stringIdx = Math.floor(Math.random() * 6);
  const fret = Math.floor(Math.random() * fretboardTrainer.config.frets) + 1;
  const stringName = STRING_NAMES[stringIdx];
  const noteNames = FRETBOARD_NOTES[stringName];
  const note = noteNames[fret % 12];
  // Remove sharp if natural only
  let displayNote = note;
  if (fretboardTrainer.config.notes === 'natural') {
    displayNote = note.replace('#', '');
  }

  fretboardTrainer.targetNote = note;
  fretboardTrainer.targetString = stringIdx;

  document.getElementById('fretboard-question-note').textContent = displayNote;
  document.getElementById('fretboard-target').textContent = `String: ${stringName} (fret ${fret})`;
  document.getElementById('fretboard-result').textContent = '';
  document.getElementById('fretboard-result').className = 'fretboard-result';

  renderFretboardInteractive(stringIdx, fret, displayNote);
}

function renderFretboardInteractive(correctString, correctFret, displayNote) {
  const container = document.getElementById('fretboard-interactive');
  if (!container) return;
  const fretCount = fretboardTrainer.config.frets;
  const stringSpacing = 28, fretSpacing = 40, padding = 30, topPadding = 20;
  const width = (6 - 1) * stringSpacing + padding * 2;
  const height = (fretCount + 1) * fretSpacing + topPadding + padding;

  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Fret wires
  for (let f = 1; f <= fretCount; f++) {
    const y = topPadding + f * fretSpacing;
    svg += `<line x1="${padding}" y1="${y}" x2="${padding + 5 * stringSpacing}" y2="${y}" stroke="#9A9490" stroke-width="1.5"/>`;
  }
  // Nut
  svg += `<line x1="${padding}" y1="${topPadding}" x2="${padding + 5 * stringSpacing}" y2="${topPadding}" stroke="#4A4039" stroke-width="3"/>`;

  // Strings
  for (let s = 0; s < 6; s++) {
    const x = padding + s * stringSpacing;
    svg += `<line x1="${x}" y1="${topPadding}" x2="${x}" y2="${topPadding + fretCount * fretSpacing}" stroke="#4A4039" stroke-width="${s === 0 || s === 5 ? 2 : 1}"/>`;
  }

  // Fret dots (clickable)
  for (let s = 0; s < 6; s++) {
    for (let f = 1; f <= fretCount; f++) {
      const x = padding + s * stringSpacing;
      const y = topPadding + (f - 0.5) * fretSpacing;
      const isCorrect = (s === correctString && f === correctFret);
      svg += `<circle cx="${x}" cy="${y}" r="12" fill="transparent" stroke="none" style="cursor:pointer" data-string="${s}" data-fret="${f}" class="fret-dot"/>`;
    }
  }

  svg += '</svg>';

  container.innerHTML = svg;

  // Add click handlers
  container.querySelectorAll('.fret-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const s = parseInt(dot.dataset.string);
      const f = parseInt(dot.dataset.fret);
      checkFretboardAnswer(s, f);
    });
  });
}

function checkFretboardAnswer(stringIdx, fret) {
  if (!fretboardTrainer.active) return;
  const resultEl = document.getElementById('fretboard-result');
  if (stringIdx === fretboardTrainer.targetString && fret === fretboardTrainer.targetFret) {
    fretboardTrainer.score++;
    fretboardTrainer.streak++;
    if (fretboardTrainer.streak > fretboardTrainer.bestStreak) {
      fretboardTrainer.bestStreak = fretboardTrainer.streak;
      localStorage.setItem('gp_fretboard_best', fretboardTrainer.bestStreak.toString());
    }
    resultEl.textContent = '✓ Correct!';
    resultEl.className = 'fretboard-result correct';
  } else {
    fretboardTrainer.streak = 0;
    const stringName = STRING_NAMES[stringIdx];
    const noteNames = FRETBOARD_NOTES[stringName];
    const note = noteNames[fret % 12];
    resultEl.textContent = `✗ That was ${note} on ${stringName} (fret ${fret})`;
    resultEl.className = 'fretboard-result wrong';
  }
  document.getElementById('fretboard-score').textContent = `Score: ${fretboardTrainer.score}`;
  document.getElementById('fretboard-streak').textContent = `Streak: ${fretboardTrainer.streak} | Best: ${fretboardTrainer.bestStreak}`;
  setTimeout(nextFretboardQuestion, 1000);
}

// ==================== FEATURE 8: CHORD THEORY VISUALIZER ====================
function showChordTheory() {
  const container = document.getElementById('theory-container');
  if (!container) return;
  container.innerHTML = `
    <div class="theory-title">Chord Theory Visualizer</div>
    <div class="theory-panel">
      <div class="theory-section-title">Select a Chord</div>
      <div class="library-filter-row" id="theory-chord-picker"></div>
      <div id="theory-detail"></div>
    </div>
  `;

  const picker = document.getElementById('theory-chord-picker');
  CHORD_ORDER.slice(0, 12).forEach(key => {
    const btn = document.createElement('button');
    btn.className = 'library-filter-btn selected';
    btn.textContent = key;
    btn.addEventListener('click', () => {
      picker.querySelectorAll('.library-filter-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      renderChordTheory(key);
    });
    picker.appendChild(btn);
  });

  renderChordTheory(CHORD_ORDER[0]);
  showScreen('chord-theory');
}

function renderChordTheory(chordKey) {
  const chord = CHORDS[chordKey];
  const theory = CHORD_THEORY[chordKey];
  if (!chord || !theory) return;

  const detail = document.getElementById('theory-detail');
  detail.innerHTML = `
    <div class="theory-section-title" style="margin-top:12px">Intervals</div>
    <div class="theory-interval-grid">
      ${theory.intervals.map((iv, i) => `
        <div class="theory-interval" style="background:${theory.color}20; border:1px solid ${theory.color}40">
          <div class="theory-interval-label">${iv}</div>
          <div class="theory-interval-note" style="color:${theory.color}">${theory.notes[i]}</div>
          <div class="theory-interval-color" style="background:${theory.color}"></div>
        </div>
      `).join('')}
    </div>
    <div class="theory-section-title" style="margin-top:12px">Notes</div>
    <div class="theory-notes-list">
      ${theory.notes.map(n => `<span class="theory-note-tag">${n}</span>`).join('')}
    </div>
    <div class="theory-section-title" style="margin-top:12px">Fretboard</div>
    <div class="theory-fretboard-overlay" id="theory-fretboard"></div>
    <div class="theory-explanation" style="margin-top:12px">
      ${getTheoryExplanation(chordKey)}
    </div>
  `;

  renderTheoryFretboard(chordKey);
}

function getTheoryExplanation(chordKey) {
  const chord = CHORDS[chordKey];
  const name = chord.name;
  if (name.includes('Major') && !name.includes('m')) {
    return `A major chord consists of a Root, a Major 3rd (4 semitones), and a Perfect 5th (7 semitones). Built from the ${name.split(' ')[0]} major scale: 1-3-5.`;
  }
  if (name.includes('m')) {
    return `A minor chord consists of a Root, a minor 3rd (3 semitones), and a Perfect 5th (7 semitones). The lowered 3rd gives it a sadder sound.`;
  }
  if (name.includes('7')) {
    return `A 7th chord adds a minor 7th (10 semitones) to the major triad. It creates a bluesy, unresolved feeling that wants to resolve.`;
  }
  if (name.includes('sus2')) {
    return `A sus2 chord replaces the 3rd with a 2nd (Major 2nd = 2 semitones). Removes the "major/minor" quality — sounds open and ambiguous.`;
  }
  if (name.includes('sus4')) {
    return `A sus4 chord replaces the 3rd with a 4th (Perfect 4th = 5 semitones). Creates tension that typically resolves back to the 3rd.`;
  }
  if (name.includes('add9')) {
    return `An add9 chord adds the 9th (Major 9th = 14 semitones) to the major triad. Adds color without the dissonance of a 7th.`;
  }
  if (name.includes('maj7')) {
    return `A maj7 chord adds a Major 7th (11 semitones) to the major triad. Creates a lush, jazzy sound often used in jazz harmony.`;
  }
  if (name.includes('5')) {
    return `A power chord (5th) contains only the root and 5th. Used heavily in rock/metal — it's neither major nor minor, sounds powerful.`;
  }
  return `${name} — a guitar chord shape to practice and master.`;
}

function renderTheoryFretboard(chordKey) {
  const container = document.getElementById('theory-fretboard');
  if (!container) return;
  const chord = CHORDS[chordKey];
  const theory = CHORD_THEORY[chordKey];
  const fretCount = 5;
  const stringSpacing = 28, fretSpacing = 36, padding = 30, topPadding = 20;
  const width = 5 * stringSpacing + padding * 2;
  const height = (fretCount + 1) * fretSpacing + topPadding + padding;

  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Fret wires
  for (let f = 1; f <= fretCount; f++) {
    const y = topPadding + f * fretSpacing;
    svg += `<line x1="${padding}" y1="${y}" x2="${padding + 5 * stringSpacing}" y2="${y}" stroke="#9A9490" stroke-width="1"/>`;
  }
  svg += `<line x1="${padding}" y1="${topPadding}" x2="${padding + 5 * stringSpacing}" y2="${topPadding}" stroke="#4A4039" stroke-width="3"/>`;

  // Strings
  for (let s = 0; s < 6; s++) {
    const x = padding + s * stringSpacing;
    svg += `<line x1="${x}" y1="${topPadding}" x2="${x}" y2="${topPadding + fretCount * fretSpacing}" stroke="#4A4039" stroke-width="${s === 0 || s === 5 ? 2 : 1}"/>`;
  }

  // Highlight chord notes
  const noteToIdx = (note) => ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].indexOf(note);
  theory.notes.forEach(note => {
    const idx = noteToIdx(note);
    for (let s = 0; s < 6; s++) {
      for (let f = 1; f <= fretCount; f++) {
        const stringName = STRING_NAMES[s];
        const noteNames = FRETBOARD_NOTES[stringName];
        const fretNote = noteNames[f % 12];
        if (fretNote === note || (fretNote === note.replace('#','') && theory.notes.includes(note))) {
          const x = padding + s * stringSpacing;
          const y = topPadding + (f - 0.5) * fretSpacing;
          svg += `<circle cx="${x}" cy="${y}" r="10" fill="${theory.color}" opacity="0.3"/>`;
          svg += `<text x="${x}" y="${y+4}" text-anchor="middle" font-size="10" font-weight="600" fill="${theory.color}">${note.replace('#','♯')}</text>`;
        }
      }
    }
  });

  svg += '</svg>';
  container.innerHTML = svg;
}

// ==================== FEATURE 9: SESSION RECORDING & PLAYBACK ====================
// (startRecording, stopRecording, saveRecordings, loadRecordings, deleteRecording, updateRecordingsList, playRecording, updateRecordingStatus are in audio.js)

function showRecording() {
  const container = document.getElementById('recording-container');
  if (!container) return;
  container.innerHTML = `
    <div class="recording-title">Session Recording</div>
    <div class="recording-subtitle">Record your practice sessions and review them with waveform visualization</div>
    <div class="recording-status idle" id="recording-status">Ready to record</div>
    <div class="record-btn" id="record-btn">
      <span style="font-size:24px">⏺</span>
    </div>
    <div class="waveform-container" id="waveform-container" style="display:none">
      <canvas class="waveform-canvas" id="waveform-canvas"></canvas>
    </div>
    <div class="recordings-list" id="recordings-list"></div>
  `;

  document.getElementById('record-btn').addEventListener('click', () => {
    if (!mediaRecorder || mediaRecorder.state !== 'recording') {
      startRecording();
      document.getElementById('record-btn').classList.add('recording');
    } else {
      stopRecording();
      document.getElementById('record-btn').classList.remove('recording');
    }
  });

  updateRecordingsList();
  showScreen('recording');
}

// ==================== FEATURE 10: EXPORT & SHARE SUMMARY ====================
function showShareSummary() {
  const container = document.getElementById('share-container');
  if (!container) return;

  const accuracy = state.audio.totalDetected > 0
    ? Math.round((state.audio.correctCount / state.audio.totalDetected) * 100) : null;
  const duration = state.sessionStart ? Math.round((Date.now() - state.sessionStart) / 1000) : 0;
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  container.innerHTML = `
    <div class="share-title">Export & Share</div>
    <div class="share-subtitle">Share your progress with friends or save for reference</div>
    <div class="share-preview">
      <div class="share-preview-title">My Guitar Practice Session</div>
      <div class="share-preview-stats">
        <div class="share-preview-stat"><div class="share-preview-stat-value">${state.totalTransitions || 0}</div><div class="share-preview-stat-label">Transitions</div></div>
        <div class="share-preview-stat"><div class="share-preview-stat-value">${minutes}:${seconds.toString().padStart(2,'0')}</div><div class="share-preview-stat-label">Duration</div></div>
        <div class="share-preview-stat"><div class="share-preview-stat-value">${accuracy !== null ? accuracy + '%' : 'N/A'}</div><div class="share-preview-stat-label">Accuracy</div></div>
        <div class="share-preview-stat"><div class="share-preview-stat-value">${state.audio.buzzyCount}</div><div class="share-preview-stat-label">Buzzing</div></div>
      </div>
    </div>
    <div class="share-text" id="share-text"></div>
    <div class="share-actions">
      <button class="share-btn primary" id="share-copy-btn">Copy Summary</button>
      <button class="share-btn" id="share-tweet-btn">Share on Twitter</button>
      <button class="share-btn" id="share-image-btn">Save as Image</button>
    </div>
    <div class="challenge-link" id="challenge-link"></div>
  `;

  const shareText = `🎸 Just finished a guitar practice session!\n` +
    `📊 ${state.totalTransitions || 0} transitions in ${minutes}:${seconds.toString().padStart(2,'0')}\n` +
    `🎯 ${accuracy !== null ? accuracy + '% accuracy' : 'Keep practicing!'}\n` +
    `🔗 https://gandhiaayush.github.io/guitar-practice/`;

  document.getElementById('share-text').textContent = shareText;

  document.getElementById('share-copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(shareText).then(() => {
      document.getElementById('share-copy-btn').textContent = 'Copied!';
      setTimeout(() => document.getElementById('share-copy-btn').textContent = 'Copy Summary', 2000);
    });
  });

  document.getElementById('share-tweet-btn').addEventListener('click', () => {
    const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(tweet, '_blank');
  });

  // Challenge link
  if (state.selectedChords.length >= 2) {
    const challenge = `${window.location.origin}${window.location.pathname}#challenge=${state.selectedChords.join(',')}`;
    document.getElementById('challenge-link').textContent = `Challenge a friend: ${challenge}`;
  }

  showScreen('share');
}

// ==================== FEATURE 11: AUTO-TUNER ====================
// (startTuner, stopTuner, tunerLoop, updateAutoTunerStatus, selectAutoTunerString are in audio.js)

function showAutoTuner() {
  const container = document.getElementById('auto-tuner-container');
  if (!container) return;
  container.innerHTML = `
    <div class="auto-tuner-title">Auto-Tuner</div>
    <div class="auto-tuner-subtitle">Automatically detects which string you're tuning and guides you to pitch</div>
    <div class="auto-tuner-gauge" id="auto-tuner-gauge">
      <svg width="300" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" id="auto-tuner-gauge-svg">
        <path d="M 30 140 Q 150 -20 270 140" fill="none" stroke="#E5E0DA" stroke-width="8" stroke-linecap="round"/>
        <line id="auto-tuner-needle" x1="150" y1="140" x2="150" y2="40" stroke="#C8823B" stroke-width="3" stroke-linecap="round"/>
        <circle cx="150" cy="140" r="6" fill="#C8823B"/>
        <text x="30" y="130" font-size="12" fill="#6B6560">♭50</text>
        <text x="270" y="130" font-size="12" fill="#6B6560">+50</text>
        <text x="150" y="130" font-size="12" fill="#C8823B" text-anchor="middle">0</text>
      </svg>
    </div>
    <div class="auto-tuner-string-display" id="auto-tuner-string-display">--</div>
    <div class="auto-tuner-cents" id="auto-tuner-cents">Play a string...</div>
    <div class="auto-tuner-direction" id="auto-tuner-direction"></div>
    <div class="auto-tuner-strings">
      ${STRING_NAMES.map(s => `
        <div class="auto-tuner-string-btn" data-string="${s}" onclick="selectAutoTunerString('${s}')">
          <span>${s}</span>
          <span class="auto-tuner-string-label">${TUNING[s]}Hz</span>
        </div>
      `).join('')}
    </div>
    <div class="auto-tuner-status scanning" id="auto-tuner-status">Select a string to begin</div>
    <button class="auto-tuner-play-ref" onclick="startAutoTuneMode()">Start Auto-Tune Mode</button>
  `;

  if (state.audio.micActive) {
    startTuner();
    tunerAutoMode = true;
    selectAutoTunerString(STRING_NAMES[0]);
  } else {
    container.innerHTML += `<div style="color:var(--muted);font-size:13px;margin-top:8px">Enable microphone first from the setup screen</div>`;
  }

  showScreen('auto-tuner');
}

function startAutoTuneMode() {
  tunerAutoMode = true;
  selectAutoTunerString(STRING_NAMES[0]);
  const statusEl = document.getElementById('auto-tuner-status');
  if (statusEl) {
    statusEl.textContent = 'Auto-tuning all strings...';
    statusEl.className = 'auto-tuner-status scanning';
  }
}

// ==================== FEATURE 12: METRONOME WITH TAP TEMPO ====================
// (startMetronome, stopMetronome, setMetronomeBpm, tapTempo, updateMetronomeBeats, updateMetronomeUI are in audio.js)

function showMetronome() {
  const container = document.getElementById('metronome-container');
  if (!container) return;
  container.innerHTML = `
    <div class="metronome-title">Metronome</div>
    <div class="metronome-subtitle">Practice with a tunable metronome. Tap to set your own tempo.</div>
    <div class="metronome-bpm-display" id="metronome-bpm-display">${metronomeBpm}</div>
    <div class="metronome-bpm-label">BPM (Beats Per Minute)</div>
    <div class="metronome-controls">
      <div class="metronome-btn" onclick="setMetronomeBpm(${metronomeBpm - 10})">−</div>
      <div class="metronome-btn" onclick="setMetronomeBpm(${metronomeBpm - 1})">−1</div>
      <div class="metronome-btn" onclick="setMetronomeBpm(${metronomeBpm + 1})">+1</div>
      <div class="metronome-btn" onclick="setMetronomeBpm(${metronomeBpm + 10})">+</div>
    </div>
    <div class="metronome-tap-btn" id="metronome-tap-btn" onclick="tapTempo()">
      Tap Tempo
    </div>
    <div class="metronome-beat-display" id="metronome-beat-display">
      <div class="metronome-beat-dot accent-beat"></div>
      <div class="metronome-beat-dot"></div>
      <div class="metronome-beat-dot"></div>
      <div class="metronome-beat-dot"></div>
    </div>
    <div class="metronome-tempo-label" id="metronome-tempo-label"></div>
    <button class="metronome-play-btn" id="metronome-play-btn" onclick="toggleMetronome()">Play</button>
  `;
  updateMetronomeUI();
  showScreen('metronome');
}

function toggleMetronome() {
  if (metronomePlaying) stopMetronome();
  else startMetronome();
}
