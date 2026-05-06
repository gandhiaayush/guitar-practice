// ==================== APP INIT & NAVIGATION ====================
function initSetup() {
  // Chord grid
  const grid = document.getElementById('chord-grid');
  CHORD_ORDER.forEach(key => {
    const chip = document.createElement('div');
    chip.className = 'chord-chip';
    chip.textContent = key;
    chip.dataset.chord = key;
    chip.addEventListener('click', () => { chip.classList.toggle('selected'); updateSelectedChords(); });
    grid.appendChild(chip);
  });

  // Interval picker
  const intervalRow = document.getElementById('interval-row');
  INTERVALS.forEach(sec => {
    const opt = document.createElement('div');
    opt.className = 'setting-option' + (sec === 5 ? ' selected' : '');
    opt.textContent = `${sec}s`;
    opt.dataset.interval = sec;
    opt.addEventListener('click', () => {
      intervalRow.querySelectorAll('.setting-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      state.interval = sec;
    });
    intervalRow.appendChild(opt);
  });

  // Mode toggle
  const modeToggle = document.getElementById('mode-toggle');
  [
    { key: 'random', name: 'Random', desc: 'Random chord changes' },
    { key: 'progressive', name: 'Progressive', desc: 'Focus on hard transitions' },
  ].forEach(m => {
    const btn = document.createElement('div');
    btn.className = 'mode-btn' + (m.key === 'random' ? ' selected' : '');
    btn.dataset.mode = m.key;
    btn.innerHTML = `<span class="mode-btn-name">${m.name}</span><span class="mode-btn-desc">${m.desc}</span>`;
    btn.addEventListener('click', () => {
      modeToggle.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.mode = m.key;
    });
    modeToggle.appendChild(btn);
  });

  document.getElementById('start-btn').addEventListener('click', startPractice);
  document.getElementById('pause-btn').addEventListener('click', pausePractice);
  document.getElementById('resume-btn').addEventListener('click', resumePractice);
  document.getElementById('end-btn').addEventListener('click', endSession);
  document.getElementById('back-btn').addEventListener('click', () => { resetSetup(); showScreen('setup'); });
  document.getElementById('got-it-btn').addEventListener('click', () => recordFeedback(true));
  document.getElementById('struggled-btn').addEventListener('click', () => recordFeedback(false));
  document.getElementById('go-songs-btn').addEventListener('click', () => showSongPicker());
  document.getElementById('back-to-setup').addEventListener('click', () => showScreen('setup'));

  // Practice mode toggle
  document.getElementById('practice-timer-btn').addEventListener('click', () => {
    state.practiceMode = 'timer';
    document.getElementById('practice-timer-btn').classList.add('active');
    document.getElementById('practice-listen-btn').classList.remove('active');
    document.getElementById('timer-container').style.display = 'block';
    document.getElementById('practice-detection-badge').classList.remove('visible');
    if (state.isRunning && state.audio.micActive) startTimer();
  });
  document.getElementById('practice-listen-btn').addEventListener('click', () => {
    state.practiceMode = 'listen';
    document.getElementById('practice-listen-btn').classList.add('active');
    document.getElementById('practice-timer-btn').classList.remove('active');
    document.getElementById('timer-container').style.display = 'none';
    document.getElementById('practice-detection-badge').classList.add('visible');
    if (state.isRunning) {
      if (state.timerId) clearInterval(state.timerId);
      if (state.tickId) clearInterval(state.tickId);
      state.audio.practiceChordLocked = false;
      updatePracticeDetectionBadge('waiting', `Playing: ${CHORDS[state.currentChord].name}`);
    }
  });

  // Mic toggle
  document.getElementById('mic-toggle').addEventListener('click', toggleMic);
  document.getElementById('mic-allow-btn').addEventListener('click', allowMic);
  document.getElementById('mic-skip-btn').addEventListener('click', skipMic);

  document.addEventListener('keydown', handleKeyboard);
}

function updateSelectedChords() {
  const selected = [];
  document.querySelectorAll('.chord-chip.selected').forEach(chip => selected.push(chip.dataset.chord));
  state.selectedChords = selected;
  document.getElementById('start-btn').disabled = selected.length < 2;
}

function toggleMic() {
  if (state.audio.micActive) {
    stopMic(); updateMicStatus();
  } else {
    document.getElementById('mic-overlay').classList.add('active');
  }
}

async function allowMic() {
  const ok = await initMic();
  document.getElementById('mic-error').style.display = ok ? 'none' : 'block';
  if (ok) {
    document.getElementById('mic-overlay').classList.remove('active');
    updateMicStatus();
    startTuner();
  }
}

function skipMic() {
  document.getElementById('mic-overlay').classList.remove('active');
}

function updateMicStatus() {
  const toggle = document.getElementById('mic-toggle');
  const status = document.getElementById('mic-status');
  if (state.audio.micActive) {
    toggle.classList.add('active');
    status.textContent = 'On'; status.style.color = 'var(--success)';
  } else {
    toggle.classList.remove('active');
    status.textContent = 'Off'; status.style.color = 'var(--muted)';
  }
}

// ==================== SCREEN MANAGEMENT ====================
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`${name}-screen`).classList.add('active');
  state.screen = name;
}

// ==================== NAVIGATION HUB ====================
function showNavHub() {
  showScreen('nav-hub');
}

// ==================== SONG CONTROLS ====================
function initSongControls() {
  document.getElementById('song-loop-btn').addEventListener('click', function() {
    state.song.songLoop = !state.song.songLoop;
    this.classList.toggle('active', state.song.songLoop);
  });

  document.getElementById('song-mode-btn').addEventListener('click', function() {
    if (state.song.songMode === 'listen') {
      state.song.songMode = 'auto';
      this.textContent = 'Listen Mode';
      this.classList.add('active');
      if (state.song.fallbackTimer) { clearTimeout(state.song.fallbackTimer); state.song.fallbackTimer = null; }
      if (state.song.currentSong) startSongBeatTimer();
    } else {
      state.song.songMode = 'listen';
      this.textContent = 'Auto-Advance'; this.classList.remove('active');
      if (state.song.beatIntervalId) clearInterval(state.song.beatIntervalId);
      state.song.strumIndex = 0; state.song.strumsCorrect = 0; state.song.strumsTotal = 0;
      state.song.directionFallback = false;
      if (state.song.fallbackTimer) { clearTimeout(state.song.fallbackTimer); state.song.fallbackTimer = null; }
      const song = SONGS[state.song.currentSong];
      if (song) renderStrummingDisplay(song.parsedStrumming, 0, song.expectedStrums);
    }
  });

  document.getElementById('song-pause-btn').addEventListener('click', pausePractice);
}

// ==================== UNIFIED DETECTION LOOP ====================
function startUnifiedLoop() {
  setInterval(() => {
    if (!state.audio.micActive) return;

    if (state.screen === 'practice' && state.practiceMode === 'listen' && state.isRunning) {
      if (state.audio.practiceChordLocked) return;
      if (state.audio.detectedChord === state.currentChord && state.audio.detectedConfidence > 0.45) {
        state.audio.practiceChordLocked = true;
        updatePracticeDetectionBadge('correct', `${CHORDS[state.currentChord].name} ✓`);
        setTimeout(() => advancePracticeChord(), 1000);
      } else if (state.audio.detectedChord && state.audio.isPlaying && state.audio.detectedConfidence > 0.4) {
        updatePracticeDetectionBadge('wrong', `${CHORDS[state.audio.detectedChord]?.name || '?'} ✗ — expected ${CHORDS[state.currentChord]?.name}`);
      }
      showRealtimeCritique();
    }
  }, 250);
}

// ==================== KEYBOARD SHORTCUTS ====================
function handleKeyboard(e) {
  if (state.screen === 'practice' && state.isRunning) {
    if (e.code === 'Space') { e.preventDefault(); pausePractice(); }
    else if (e.key === 'g' || e.key === 'G') recordFeedback(true);
    else if (e.key === 's' || e.key === 'S') recordFeedback(false);
  } else if (state.screen === 'practice' && !state.isRunning) {
    if (e.code === 'Space') { e.preventDefault(); resumePractice(); }
  } else if (state.screen === 'summary' && (e.code === 'Enter' || e.code === 'Space')) {
    e.preventDefault(); resetSetup(); showScreen('setup');
  }
}

// ==================== CHALLENGE LINK HANDLING ====================
function handleChallengeLink() {
  const hash = window.location.hash;
  if (hash.startsWith('#challenge=')) {
    const chords = hash.replace('#challenge=', '').split(',');
    const valid = chords.filter(c => CHORDS[c.trim()]);
    if (valid.length >= 2) {
      state.selectedChords = valid;
      // Update UI
      document.querySelectorAll('.chord-chip').forEach(chip => {
        chip.classList.toggle('selected', valid.includes(chip.dataset.chord));
      });
      updateSelectedChords();
      showScreen('setup');
    }
  }
}

// ==================== LOAD CUSTOM SONGS ====================
function loadCustomSongs() {
  try {
    const custom = JSON.parse(localStorage.getItem('gp_custom_songs') || '[]');
    custom.forEach(s => { if (!SONGS[s.id]) SONGS[s.id] = s; });
  } catch (e) {}
}

function saveCustomSong(song) {
  const custom = JSON.parse(localStorage.getItem('gp_custom_songs') || '[]');
  custom.push(song);
  localStorage.setItem('gp_custom_songs', JSON.stringify(custom));
  SONGS[song.id] = song;
}

// ==================== INIT ====================
function init() {
  buildChordTemplates(); // from data.js
  loadHistory();
  loadAchievements();
  loadRecordings();
  loadCustomSongs();
  initSetup();
  initSongControls();
  handleChallengeLink();
  startUnifiedLoop();
}

document.addEventListener('DOMContentLoaded', init);
