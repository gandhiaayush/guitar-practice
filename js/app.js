// ==================== APP INIT & NAVIGATION ====================
function initSetup() {
  // Chord grid
  var grid = document.getElementById('chord-grid');
  CHORD_ORDER.forEach(function(key) {
    var chip = document.createElement('div');
    chip.className = 'chord-chip';
    chip.textContent = key;
    chip.dataset.chord = key;
    chip.addEventListener('click', function() { chip.classList.toggle('selected'); updateSelectedChords(); });
    grid.appendChild(chip);
  });

  // Interval picker
  var intervalRow = document.getElementById('interval-row');
  INTERVALS.forEach(function(sec) {
    var opt = document.createElement('div');
    opt.className = 'setting-option' + (sec === 5 ? ' selected' : '');
    opt.textContent = sec + 's';
    opt.dataset.interval = sec;
    opt.addEventListener('click', function() {
      intervalRow.querySelectorAll('.setting-option').forEach(function(o) { o.classList.remove('selected'); });
      opt.classList.add('selected');
      state.interval = sec;
    });
    intervalRow.appendChild(opt);
  });

  // Mode toggle
  var modeToggle = document.getElementById('mode-toggle');
  [
    { key: 'random', name: 'Random', desc: 'Random chord changes' },
    { key: 'progressive', name: 'Progressive', desc: 'Focus on hard transitions' },
  ].forEach(function(m) {
    var btn = document.createElement('div');
    btn.className = 'mode-btn' + (m.key === 'random' ? ' selected' : '');
    btn.dataset.mode = m.key;
    btn.innerHTML = '<span class="mode-btn-name">' + m.name + '</span><span class="mode-btn-desc">' + m.desc + '</span>';
    btn.addEventListener('click', function() {
      modeToggle.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      state.mode = m.key;
    });
    modeToggle.appendChild(btn);
  });

  document.getElementById('start-btn').addEventListener('click', startPractice);
  document.getElementById('pause-btn').addEventListener('click', pausePractice);
  document.getElementById('resume-btn').addEventListener('click', resumePractice);
  document.getElementById('end-btn').addEventListener('click', endSession);
  document.getElementById('back-btn').addEventListener('click', function() { resetSetup(); showScreen('setup'); });
  document.getElementById('got-it-btn').addEventListener('click', function() { recordFeedback(true); });
  document.getElementById('struggled-btn').addEventListener('click', function() { recordFeedback(false); });
  document.getElementById('go-songs-btn').addEventListener('click', function() { showSongPicker(); });
  document.getElementById('back-to-setup').addEventListener('click', function() { showScreen('setup'); });

  // Practice mode toggle
  document.getElementById('practice-timer-btn').addEventListener('click', function() {
    state.practiceMode = 'timer';
    document.getElementById('practice-timer-btn').classList.add('active');
    document.getElementById('practice-listen-btn').classList.remove('active');
    document.getElementById('timer-container').style.display = 'flex';
    document.getElementById('practice-detection-badge').style.display = 'none';
  });
  document.getElementById('practice-listen-btn').addEventListener('click', function() {
    state.practiceMode = 'listen';
    document.getElementById('practice-listen-btn').classList.add('active');
    document.getElementById('practice-timer-btn').classList.remove('active');
    document.getElementById('timer-container').style.display = 'none';
    document.getElementById('practice-detection-badge').style.display = 'flex';
  });
}

function updateSelectedChords() {
  state.selectedChords = [];
  document.querySelectorAll('.chord-chip.selected').forEach(function(chip) { state.selectedChords.push(chip.dataset.chord); });
  document.getElementById('start-btn').disabled = state.selectedChords.length === 0;
}

function resetSetup() {
  state.selectedChords = [];
  document.querySelectorAll('.chord-chip.selected').forEach(function(c) { c.classList.remove('selected'); });
  document.getElementById('start-btn').disabled = true;
}

// ==================== SONG CONTROLS ====================
function initSongControls() {
  var songGrid = document.getElementById('song-grid');
  var keys = Object.keys(SONGS);
  keys.forEach(function(key) {
    var song = SONGS[key];
    var card = document.createElement('div');
    card.className = 'song-card';
    card.dataset.song = key;
    var diffColor = { beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444' }[song.difficulty] || '#6B7280';
    card.innerHTML =
      '<div class="song-card-title">' + song.name + '</div>' +
      '<div class="song-card-artist">' + song.artist + '</div>' +
      '<div class="song-card-meta">' +
        '<span class="song-card-badge" style="background:' + diffColor + '20;color:' + diffColor + '">' + song.difficulty + '</span>' +
        '<span class="song-card-badge">' + song.chords.length + ' chords</span>' +
      '</div>' +
      '<div class="song-card-chords">' + song.chords.join(' → ') + '</div>';
    card.addEventListener('click', function() { startSongPractice(key); });
    songGrid.appendChild(card);
  });

  document.getElementById('song-loop-btn').addEventListener('click', function() {
    if (!state.song) return;
    state.song.looping = !state.song.looping;
    document.getElementById('song-loop-btn').classList.toggle('active', state.song.looping);
  });
  document.getElementById('song-mode-btn').addEventListener('click', function() {
    if (!state.song) return;
    state.song.mode = state.song.mode === 'auto' ? 'manual' : 'auto';
    document.getElementById('song-mode-btn').textContent = state.song.mode === 'auto' ? 'Auto' : 'Manual';
  });
  document.getElementById('back-to-setup').addEventListener('click', function() { showScreen('setup'); });
}

// ==================== NAV HELPERS ====================
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById(name + '-screen').classList.add('active');
  state.screen = name;
}

function showNavHub() {
  showScreen('nav-hub');
}

// ==================== MIC TOGGLE ====================
function initMicToggle() {
  var toggle = document.getElementById('mic-toggle');
  var status = document.getElementById('mic-status');
  toggle.addEventListener('click', function() {
    if (state.audio.micActive) {
      stopMic();
      status.textContent = 'Off';
      status.style.color = '';
    } else {
      initMic().then(function(ok) {
        status.textContent = ok ? 'On' : 'Error';
        status.style.color = ok ? 'var(--success)' : 'var(--danger)';
      });
    }
  });
}

// ==================== CHALLENGE LINK ====================
function handleChallengeLink() {
  var params = new URLSearchParams(window.location.search);
  var challenge = params.get('challenge');
  if (challenge) {
    try {
      var data = JSON.parse(atob(challenge));
      state.selectedChords = data.chords || [];
      state.interval = data.interval || 5;
      state.mode = data.mode || 'random';
      // Auto-start after short delay
      setTimeout(function() { startPractice(); }, 500);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } catch (e) {}
  }
}

// ==================== LOAD CUSTOM SONGS ====================
function loadCustomSongs() {
  try {
    var custom = JSON.parse(localStorage.getItem('gp_custom_songs') || '[]');
    custom.forEach(function(s) { if (!SONGS[s.id]) SONGS[s.id] = s; });
  } catch (e) {}
}

function saveCustomSong(song) {
  var custom = JSON.parse(localStorage.getItem('gp_custom_songs') || '[]');
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
  showScreen('setup'); // Show the first screen
}

document.addEventListener('DOMContentLoaded', init);
