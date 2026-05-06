// ==================== AUDIO ENGINE ====================
var audioCtx = null;

async function initMic() {
  try {
    state.audio.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var source = audioCtx.createMediaStreamSource(state.audio.stream);
    state.audio.analyser = audioCtx.createAnalyser();
    state.audio.analyser.fftSize = 8192;
    state.audio.analyser.smoothingTimeConstant = 0.3;
    source.connect(state.audio.analyser);
    state.audio.micActive = true;
    state.audio.animFrameId = requestAnimationFrame(audioLoop);
    return true;
  } catch (e) {
    console.error('Mic error:', e);
    return false;
  }
}

function stopMic() {
  if (state.audio.animFrameId) cancelAnimationFrame(state.audio.animFrameId);
  if (state.audio.stream) state.audio.stream.getTracks().forEach(function(t) { t.stop(); });
  state.audio.micActive = false;
  state.audio.analyser = null;
}

function audioLoop() {
  if (!state.audio.micActive || !state.audio.analyser) return;

  var analyser = state.audio.analyser;
  var bufLen = analyser.fftSize;
  var dataArray = new Float32Array(bufLen);
  var freqArray = new Float32Array(bufLen / 2);

  analyser.getFloatTimeDomainData(dataArray);
  analyser.getFloatFrequencyData(freqArray);

  // RMS Volume
  var sum = 0;
  for (var i = 0; i < bufLen; i++) sum += dataArray[i] * dataArray[i];
  state.audio.volume = Math.sqrt(sum / bufLen);

  // Spectral flatness & centroid
  var geoMean = 0, arithMean = 0, count = 0;
  var centroidSum = 0, centroidWeight = 0;
  var sampleRate = audioCtx.sampleRate;
  var binSize = sampleRate / bufLen;
  for (var i = 0; i < freqArray.length; i++) {
    var freq = i * binSize;
    if (freq < 80 || freq > 2000) continue;
    var db = freqArray[i];
    if (db > -100) {
      var linear = Math.pow(10, db / 20);
      geoMean += Math.log(linear + 0.0001);
      arithMean += linear + 0.0001;
      count++;
      centroidSum += freq * linear;
      centroidWeight += linear;
    }
  }
  if (count > 0) {
    geoMean = Math.exp(geoMean / count);
    arithMean = arithMean / count;
    state.audio.spectralFlatness = arithMean > 0 ? geoMean / arithMean : 0;
  }
  state.audio.spectralCentroid = centroidWeight > 0 ? centroidSum / centroidWeight : 0;

  // Strum detection
  var rmsDelta = Math.abs(state.audio.volume - state.audio.previousRms);
  var now = Date.now();
  var isStrumEvent = rmsDelta > 0.015 && (now - state.audio.lastStrumTime) > state.audio.strumCooldown;
  if (isStrumEvent) {
    state.audio.lastStrumTime = now;
    var normalizedCentroid = (state.audio.spectralCentroid - 80) / (2000 - 80);
    var detectedDirection = null;
    if (normalizedCentroid < 0.35) detectedDirection = 'D';
    else if (normalizedCentroid > 0.55) detectedDirection = 'U';
    handleStrumEvent(detectedDirection);
  }
  state.audio.previousRms = state.audio.volume;

  // Chord detection
  if (state.audio.volume > state.audio.volumeThreshold) {
    state.audio.isPlaying = true;
    state.audio.silenceDuration = 0;

    if (state.audio.transitionStartTime && state.audio.transitionDelay === 0) {
      state.audio.transitionDelay = Date.now() - state.audio.transitionStartTime;
    }

    var chroma = computeChroma(freqArray, bufLen, sampleRate);
    var result = matchChord(chroma);
    state.audio.detectedChord = result.chord;
    state.audio.detectedConfidence = result.confidence;

    if (state.currentChord) {
      state.audio.totalDetected++;
      if (result.chord === state.currentChord && result.confidence > 0.3) {
        state.audio.correctCount++;
      } else if (result.chord && result.confidence > 0.3) {
        state.audio.wrongCount++;
      }
    }

    if (state.audio.transitionStartTime && state.audio.transitionDelay > 0 && !state.audio.toneSampled) {
      state.audio.toneSampled = true;
      if (state.audio.spectralFlatness > 0.15) state.audio.buzzyCount++;
      else if (state.audio.volume < 0.05) state.audio.mutedCount++;
      else state.audio.cleanCount++;
    }

    updateDetectionUI();
  } else {
    state.audio.isPlaying = false;
    state.audio.silenceDuration += 33;
    state.audio.detectedChord = null;
    updateDetectionUI();
  }

  updateVolumeMeter();
  state.audio.animFrameId = requestAnimationFrame(audioLoop);
}

function computeChroma(freqArray, bufLen, sampleRate) {
  var chroma = new Float32Array(12);
  var binSize = sampleRate / bufLen;
  for (var i = 0; i < freqArray.length; i++) {
    var freq = i * binSize;
    if (freq < 80 || freq > 1500) continue;
    var semitone = 12 * Math.log2(freq / 440) + 69;
    var pc = ((Math.round(semitone) % 12) + 12) % 12;
    var magnitude = Math.pow(10, freqArray[i] / 20);
    var centsOff = Math.abs(semitone - Math.round(semitone)) * 100;
    var weight = Math.max(0, 1 - centsOff / 50);
    var harmonicWeight = freq < 500 ? 1.0 : freq < 800 ? 0.7 : 0.4;
    chroma[pc] += magnitude * weight * harmonicWeight;
  }
  var max = 0;
  for (var j = 0; j < 12; j++) if (chroma[j] > max) max = chroma[j];
  if (max > 0) for (var k = 0; k < 12; k++) chroma[k] /= max;
  return chroma;
}

function matchChord(chroma) {
  var bestChord = null, bestScore = 0;
  var entries = Object.entries(CHORD_CHROMA);
  for (var i = 0; i < entries.length; i++) {
    var key = entries[i][0], template = entries[i][1];
    var score = cosineSimilarity(chroma, template);
    if (score > bestScore) { bestScore = score; bestChord = key; }
  }
  return { chord: bestScore > 0.25 ? bestChord : null, confidence: bestScore };
}

function cosineSimilarity(a, b) {
  var dot = 0, na = 0, nb = 0;
  for (var i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function updateDetectionUI() {
  var el = document.getElementById('detected-chord');
  if (!el || !state.audio.micActive) return;
  var detected = state.audio.detectedChord;
  var expected = state.currentChord;
  if (!detected) el.innerHTML = '<span class="none">Listening...</span>';
  else if (detected === expected) el.innerHTML = '<span class="match">' + CHORDS[detected].name + ' &#x2714;</span>';
  else el.innerHTML = '<span class="miss">' + (CHORDS[detected]?CHORDS[detected].name:detected) + ' &#x2718; -- expected ' + CHORDS[expected].name + '</span>';
}

function updateVolumeMeter() {
  var fill = document.getElementById('volume-fill');
  var songFill = document.getElementById('song-volume-fill');
  if (fill) fill.style.width = Math.min(100, state.audio.volume * 400) + '%';
  if (songFill) songFill.style.width = Math.min(100, state.audio.volume * 400) + '%';
}

function updateTransitionTimer() {
  var el = document.getElementById('transition-timer');
  if (!el) return;
  if (state.audio.transitionStartTime && state.audio.isPlaying && state.audio.transitionDelay > 0) {
    el.textContent = (state.audio.transitionDelay / 1000).toFixed(1) + 's';
  } else if (state.audio.transitionStartTime) {
    var elapsed = ((Date.now() - state.audio.transitionStartTime) / 1000).toFixed(1);
    el.textContent = elapsed + 's';
  } else {
    el.textContent = '';
  }
}

function playClick() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = 800; gain.gain.value = 0.1;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.stop(audioCtx.currentTime + 0.05);
  } catch (e) {}
}

function playTone(freq, duration) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.15;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function playChordArpeggio(chordKey) {
  var chord = CHORDS[chordKey];
  if (!chord) return;
  var notes = CHORD_NOTES[chordKey];
  if (!notes) return;
  var noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  for (var i = 0; i < notes.length; i++) {
    (function(idx) {
      setTimeout(function() {
        var n = notes[idx];
        var noteIdx = noteNames.indexOf(n.note);
        var freq = 440 * Math.pow(2, (noteIdx - 9) / 12) * Math.pow(2, n.octave - 4);
        playTone(freq, 0.4);
      }, idx * 200);
    })(i);
  }
}

// ==================== TUNER ====================
var tunerActive = false;
var tunerAnimId = null;
var tunerAutoMode = false;
var tunerTargetString = null;

function startTuner() {
  tunerActive = true;
  if (state.audio.micActive) {
    tunerAnimId = requestAnimationFrame(tunerLoop);
  }
}

function stopTuner() {
  tunerActive = false;
  if (tunerAnimId) cancelAnimationFrame(tunerAnimId);
  tunerAutoMode = false;
  tunerTargetString = null;
}

function tunerLoop() {
  if (!tunerActive || !state.audio.analyser) return;
  var analyser = state.audio.analyser;
  var freqArray = new Float32Array(analyser.fftSize / 2);
  analyser.getFloatFrequencyData(freqArray);
  var binSize = audioCtx.sampleRate / analyser.fftSize;

  var maxDb = -Infinity, peakIdx = 0;
  for (var i = 0; i < freqArray.length; i++) {
    var freq = i * binSize;
    if (freq < 70 || freq > 400) continue;
    if (freqArray[i] > maxDb) { maxDb = freqArray[i]; peakIdx = i; }
  }

  if (maxDb > -80) {
    var freq = peakIdx * binSize;
    var noteNum = 12 * Math.log2(freq / 440) + 69;
    var nearestNote = Math.round(noteNum);
    var noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    var noteName = noteNames[((nearestNote % 12) + 12) % 12];
    var octave = Math.floor((nearestNote - 12) / 12) + 4;
    var cents = Math.round((noteNum - nearestNote) * 100);

    var noteEl = document.getElementById('tuner-note-display');
    var centsEl = document.getElementById('tuner-cents');
    if (noteEl) {
      noteEl.textContent = noteName + octave;
      noteEl.className = 'tuner-note-display' + (Math.abs(cents) < 10 ? ' in-tune' : (cents > 0 ? ' sharp' : ' flat'));
    }
    if (centsEl) centsEl.textContent = (cents > 0 ? '+' : '') + cents + ' cents';

    var gaugeEl = document.getElementById('tuner-gauge-svg');
    if (gaugeEl) {
      var norm = Math.max(-50, Math.min(50, cents)) / 50;
      var x = 140 + norm * 120;
      gaugeEl.querySelector('#tuner-needle').setAttribute('x1', x);
      gaugeEl.querySelector('#tuner-needle').setAttribute('x2', x);
    }

    if (tunerAutoMode && tunerTargetString) {
      var targetFreq = TUNING[tunerTargetString];
      var targetNoteNum = 12 * Math.log2(targetFreq / 440) + 69;
      var targetCents = Math.round((noteNum - targetNoteNum) * 100);
      updateAutoTunerStatus(Math.abs(targetCents) < 10, targetCents);
    }
  }
  tunerAnimId = requestAnimationFrame(tunerLoop);
}

function updateAutoTunerStatus(inTune, cents) {
  var statusEl = document.getElementById('auto-tuner-status');
  if (!statusEl) return;
  if (inTune) {
    statusEl.textContent = '\u2713 In Tune!';
    statusEl.className = 'auto-tuner-status tuned';
    if (tunerAutoMode && tunerTargetString) {
      var idx = STRING_NAMES.indexOf(tunerTargetString);
      if (idx >= 0 && idx < STRING_NAMES.length - 1) {
        setTimeout(function() { selectAutoTunerString(STRING_NAMES[idx + 1]); }, 1000);
      } else if (idx === STRING_NAMES.length - 1) {
        tunerAutoMode = false;
        statusEl.textContent = '\u2713 All strings tuned!';
      }
    }
  } else {
    var direction = cents > 0 ? 'flat (loosen)' : 'sharp (tighten)';
    statusEl.textContent = Math.abs(cents) + ' cents ' + direction;
    statusEl.className = 'auto-tuner-status scanning';
  }
}

function selectAutoTunerString(str) {
  tunerTargetString = str;
  var btns = document.querySelectorAll('.auto-tuner-string-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.toggle('selected', btns[i].dataset.string === str);
  }
  playTone(TUNING[str], 0.8);
  var displayEl = document.getElementById('auto-tuner-string-display');
  if (displayEl) displayEl.textContent = str;
}

// ==================== METRONOME ====================
var metronomeBpm = 90;
var metronomePlaying = false;
var metronomeIntervalId = null;
var metronomeBeat = 0;
var metronomeTapTimes = [];

function startMetronome() {
  if (metronomePlaying) return;
  metronomePlaying = true;
  metronomeBeat = 0;
  var msPerBeat = 60000 / metronomeBpm;
  metronomeIntervalId = setInterval(function() {
    playClick();
    metronomeBeat = (metronomeBeat + 1) % 4;
    updateMetronomeBeats();
  }, msPerBeat);
  updateMetronomeUI();
}

function stopMetronome() {
  metronomePlaying = false;
  if (metronomeIntervalId) clearInterval(metronomeIntervalId);
  metronomeBeat = 0;
  updateMetronomeBeats();
  updateMetronomeUI();
}

function setMetronomeBpm(bpm) {
  metronomeBpm = Math.max(30, Math.min(300, bpm));
  if (metronomePlaying) { stopMetronome(); startMetronome(); }
  updateMetronomeUI();
}

function tapTempo() {
  var now = Date.now();
  metronomeTapTimes.push(now);
  if (metronomeTapTimes.length > 6) metronomeTapTimes.shift();
  if (metronomeTapTimes.length >= 2) {
    var intervals = [];
    for (var i = 1; i < metronomeTapTimes.length; i++) {
      intervals.push(metronomeTapTimes[i] - metronomeTapTimes[i-1]);
    }
    var avgMs = intervals.reduce(function(a,b) { return a + b; }, 0) / intervals.length;
    var bpm = Math.round(60000 / avgMs);
    setMetronomeBpm(Math.max(30, Math.min(300, bpm)));
  }
  var btn = document.getElementById('metronome-tap-btn');
  if (btn) { btn.classList.add('tapped'); setTimeout(function() { btn.classList.remove('tapped'); }, 100); }
}

function updateMetronomeBeats() {
  var dots = document.querySelectorAll('.metronome-beat-dot');
  for (var i = 0; i < dots.length; i++) {
    dots[i].classList.toggle('active', metronomePlaying && i === metronomeBeat);
    dots[i].classList.toggle('accent-beat', i === 0);
  }
}

function updateMetronomeUI() {
  var display = document.getElementById('metronome-bpm-display');
  if (display) display.textContent = metronomeBpm;
  var playBtn = document.getElementById('metronome-play-btn');
  if (playBtn) {
    playBtn.textContent = metronomePlaying ? 'Stop' : 'Play';
    playBtn.classList.toggle('playing', metronomePlaying);
  }
}

// ==================== SESSION RECORDING ====================
var mediaRecorder = null;
var recordedChunks = [];
var recordings = [];

function startRecording() {
  if (!state.audio.stream) return;
  recordedChunks = [];
  try {
    mediaRecorder = new MediaRecorder(state.audio.stream, { mimeType: 'audio/webm' });
  } catch (e) {
    try { mediaRecorder = new MediaRecorder(state.audio.stream); } catch (e2) { return; }
  }
  mediaRecorder.ondataavailable = function(e) { if (e.data.size > 0) recordedChunks.push(e.data); };
  mediaRecorder.onstop = function() {
    var blob = new Blob(recordedChunks, { type: 'audio/webm' });
    var recording = {
      id: Date.now(),
      blob: blob,
      url: URL.createObjectURL(blob),
      date: new Date().toLocaleString(),
      duration: state.sessionStart ? Math.round((Date.now() - state.sessionStart) / 1000) : 0,
      chords: state.selectedChords.slice(0)
    };
    recordings.push(recording);
    saveRecordings();
    updateRecordingsList();
    updateRecordingStatus('ready', 'Recording saved!');
  };
  mediaRecorder.start();
  updateRecordingStatus('recording', 'Recording...');
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
}

function saveRecordings() {
  var data = recordings.map(function(r) {
    return { id: r.id, date: r.date, duration: r.duration, chords: r.chords };
  });
  localStorage.setItem('gp_recordings', JSON.stringify(data));
}

function loadRecordings() {
  try {
    var saved = JSON.parse(localStorage.getItem('gp_recordings') || '[]');
    recordings = saved.map(function(r) { return r; });
  } catch (e) { recordings = []; }
}

function deleteRecording(id) {
  recordings = recordings.filter(function(r) { return r.id !== id; });
  saveRecordings();
  updateRecordingsList();
}

function updateRecordingsList() {
  var list = document.getElementById('recordings-list');
  if (!list) return;
  list.innerHTML = '';
  var sorted = recordings.slice().reverse();
  for (var i = 0; i < sorted.length; i++) {
    var r = sorted[i];
    var item = document.createElement('div');
    item.className = 'recording-item';
    item.innerHTML =
      '<div><div class="recording-item-name">Session ' + new Date(r.id).toLocaleDateString() + '</div>' +
      '<div class="recording-item-date">' + r.duration + 's · ' + r.chords.join(', ') + '</div></div>' +
      '<button class="recording-play-btn" onclick="playRecording(' + r.id + ')">Play</button>' +
      '<button class="delete-song-btn" onclick="deleteRecording(' + r.id + ')">×</button>';
    list.appendChild(item);
  }
}

function playRecording(id) {
  var rec = null;
  for (var i = 0; i < recordings.length; i++) { if (recordings[i].id === id) { rec = recordings[i]; break; } }
  if (!rec || !rec.blob) return;
  var audio = new Audio(rec.url || URL.createObjectURL(rec.blob));
  audio.play();
}

function updateRecordingStatus(status, text) {
  var el = document.getElementById('recording-status');
  if (!el) return;
  el.textContent = text;
  el.className = 'recording-status ' + status;
}

// ==================== PRACTICE HISTORY ====================
var practiceHistory = [];

function loadHistory() {
  try {
    practiceHistory = JSON.parse(localStorage.getItem('gp_history') || '[]');
  } catch (e) { practiceHistory = []; }
}

function saveHistory() {
  localStorage.setItem('gp_history', JSON.stringify(practiceHistory));
}

function addHistoryEntry(entry) {
  var today = new Date().toISOString().split('T')[0];
  var uniqueChords = new Set();
  var totalTransitions = 0;
  var longestSession = 0;
  practiceHistory.forEach(function(h) {
    (h.chords||[]).forEach(function(c) { uniqueChords.add(c); });
    totalTransitions += (h.transitions || 0);
    if ((h.duration || 0) > longestSession) longestSession = h.duration;
  });

  entry.date = today;
  practiceHistory.push(entry);
  if (practiceHistory.length > 365) practiceHistory = practiceHistory.slice(-365);
  saveHistory();
}

function getHistoryStats() {
  var today = new Date().toISOString().split('T')[0];
  var uniqueChords = new Set();
  var totalTransitions = 0;
  var longestSession = 0;
  var now = new Date();
  var earlyBird = now.getHours() < 8;
  var nightOwl = now.getHours() >= 22;

  practiceHistory.forEach(function(h) {
    (h.chords||[]).forEach(function(c) { uniqueChords.add(c); });
    totalTransitions += (h.transitions || 0);
    if ((h.duration || 0) > longestSession) longestSession = h.duration;
  });

  return {
    sessions: practiceHistory.length,
    totalTransitions: totalTransitions,
    uniqueChords: uniqueChords.size,
    currentStreak: 0,
    longestSession: longestSession,
    earlyBird: earlyBird,
    nightOwl: nightOwl,
    maxBpm: Math.max.apply(null, practiceHistory.map(function(h) { return h.maxBpm || 0; }).concat([0])),
    recordings: recordings.length,
    perfectAccuracy: false
  };
}

function renderHeatmap() {
  var container = document.getElementById('heatmap-container');
  if (!container) return;
  var grid = document.createElement('div');
  grid.className = 'heatmap-grid';
  var today = new Date();
  for (var i = 51; i >= 0; i--) {
    var d = new Date(today);
    d.setDate(d.getDate() - i * 7);
    for (var j = 0; j < 7; j++) {
      var cellDate = new Date(d);
      cellDate.setDate(cellDate.getDate() + j);
      var ds = cellDate.toISOString().split('T')[0];
      var hasEntry = false;
      for (var k = 0; k < practiceHistory.length; k++) {
        if (practiceHistory[k].date === ds) { hasEntry = true; break; }
      }
      var cell = document.createElement('div');
      cell.className = 'heatmap-cell' + (hasEntry ? ' l3' : '');
      grid.appendChild(cell);
    }
  }
  container.innerHTML = '';
  container.appendChild(grid);
}

// ==================== ACHIEVEMENTS ====================
var unlockedAchievements = [];

function loadAchievements() {
  try {
    unlockedAchievements = JSON.parse(localStorage.getItem('gp_achievements') || '[]');
  } catch (e) { unlockedAchievements = []; }
}

function saveAchievements() {
  localStorage.setItem('gp_achievements', JSON.stringify(unlockedAchievements));
}

function checkAchievements(stats) {
  var newUnlocked = [];
  for (var i = 0; i < ACHIEVEMENTS.length; i++) {
    var a = ACHIEVEMENTS[i];
    if (unlockedAchievements.indexOf(a.id) === -1 && a.condition(stats)) {
      unlockedAchievements.push(a.id);
      newUnlocked.push(a);
    }
  }
  saveAchievements();
  for (var j = 0; j < newUnlocked.length; j++) {
    showAchievementToast(newUnlocked[j]);
  }
}

function showAchievementToast(ach) {
  var toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.textContent = ach.icon + ' Achievement Unlocked: ' + ach.name + '!';
  document.body.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 3000);
}

function renderAchievements() {
  var grid = document.getElementById('achievements-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (var i = 0; i < ACHIEVEMENTS.length; i++) {
    var a = ACHIEVEMENTS[i];
    var card = document.createElement('div');
    card.className = 'achievement-card ' + (unlockedAchievements.indexOf(a.id) >= 0 ? 'unlocked' : 'locked');
    card.innerHTML =
      '<span class="achievement-icon">' + (unlockedAchievements.indexOf(a.id) >= 0 ? a.icon : '🔒') + '</span>' +
      '<div class="achievement-name">' + a.name + '</div>' +
      '<div class="achievement-desc">' + a.desc + '</div>';
    grid.appendChild(card);
  }
}
