// ==================== CHORD DATA ====================
var CHORDS = {
  "C":  { name: "C Major",  frets: [null, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], baseFret: 1 },
  "D":  { name: "D Major",  frets: [null, null, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], baseFret: 1 },
  "E":  { name: "E Major",  frets: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], baseFret: 1 },
  "A":  { name: "A Major",  frets: [null, 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], baseFret: 1 },
  "G":  { name: "G Major",  frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, null, null, null, 3], baseFret: 1 },
  "Am": { name: "A Minor",  frets: [null, 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], baseFret: 1 },
  "Em": { name: "E Minor",  frets: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], baseFret: 1 },
  "Dm": { name: "D Minor",  frets: [null, null, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], baseFret: 1 },
  "F":  { name: "F Major",  frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], baseFret: 1 },
  "Bm": { name: "B Minor",  frets: [null, 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], baseFret: 2 },
  "B":  { name: "B Major",  frets: [null, 2, 4, 4, 4, 2], fingers: [null, 1, 2, 3, 4, 1], baseFret: 2 },
  "Cm": { name: "C Minor",  frets: [null, 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], baseFret: 3 },
  "D7": { name: "D 7th",    frets: [null, null, 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], baseFret: 1 },
  "A7": { name: "A 7th",    frets: [null, 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], baseFret: 1 },
  "E7": { name: "E 7th",    frets: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], baseFret: 1 },
  "Csus2": { name: "C sus2", frets: [null, 3, 0, 0, 1, 3], fingers: [null, 3, null, null, 1, 2], baseFret: 1 },
  "Dsus2": { name: "D sus2", frets: [null, null, 0, 2, 3, 0], fingers: [null, null, null, 2, 3, null], baseFret: 1 },
  "Asus2": { name: "A sus2", frets: [null, 0, 2, 2, 0, 0], fingers: [null, null, 2, 3, null, null], baseFret: 1 },
  "Esus2": { name: "E sus2", frets: [0, 2, 4, 4, 0, 0], fingers: [null, 1, 3, 4, null, null], baseFret: 1 },
  "Csus4": { name: "C sus4", frets: [null, 3, 3, 0, 1, 0], fingers: [null, 3, 4, null, 1, null], baseFret: 1 },
  "Dsus4": { name: "D sus4", frets: [null, null, 0, 2, 3, 3], fingers: [null, null, null, 1, 2, 3], baseFret: 1 },
  "Asus4": { name: "A sus4", frets: [null, 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 3, null], baseFret: 1 },
  "Esus4": { name: "E sus4", frets: [0, 2, 2, 2, 0, 0], fingers: [null, 1, 2, 3, null, null], baseFret: 1 },
  "Cadd9": { name: "C add9", frets: [null, 3, 2, 0, 3, 0], fingers: [null, 2, 1, null, 3, null], baseFret: 1 },
  "Dadd9": { name: "D add9", frets: [null, null, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], baseFret: 1 },
  "Cmaj7": { name: "C maj7", frets: [null, 3, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], baseFret: 1 },
  "Dmaj7": { name: "D maj7", frets: [null, null, 0, 2, 2, 2], fingers: [null, null, null, 1, 2, 3], baseFret: 1 },
  "Amaj7": { name: "A maj7", frets: [null, 0, 2, 1, 2, 0], fingers: [null, null, 2, 1, 3, null], baseFret: 1 },
  "Emaj7": { name: "E maj7", frets: [0, 2, 1, 1, 0, 0], fingers: [null, 2, 1, 3, null, null], baseFret: 1 },
  "E5":  { name: "E 5", frets: [0, 2, 2, null, null, null], fingers: [null, 1, 2, null, null, null], baseFret: 1 },
  "A5":  { name: "A 5", frets: [null, 0, 2, 2, null, null], fingers: [null, null, 1, 2, null, null], baseFret: 1 },
  "D5":  { name: "D 5", frets: [null, null, 0, 2, 3, null], fingers: [null, null, null, 1, 2, null], baseFret: 1 },
  "G5":  { name: "G 5", frets: [3, 5, 5, null, null, null], fingers: [1, 2, 3, null, null, null], baseFret: 3 },
};

var CHORD_ORDER = ["C","D","E","A","G","Am","Em","Dm","F","Bm","B","Cm","D7","A7","E7","Csus2","Dsus2","Asus2","Esus2","Csus4","Dsus4","Asus4","Esus4","Cadd9","Dadd9","Cmaj7","Dmaj7","Amaj7","Emaj7","E5","A5","D5","G5"];
var INTERVALS = [3, 5, 10, 15, 20];

var TABS = {
  "C":  "e|---0---|\nB|---1---|\nG|---0---|\nD|---2---|\nA|---3---|\nE|---x---|",
  "D":  "e|---2---|\nB|---3---|\nG|---2---|\nD|---0---|\nA|---x---|\nE|---x---|",
  "E":  "e|---0---|\nB|---0---|\nG|---1---|\nD|---2---|\nA|---2---|\nE|---0---|",
  "A":  "e|---0---|\nB|---2---|\nG|---2---|\nD|---2---|\nA|---0---|\nE|---x---|",
  "G":  "e|---3---|\nB|---0---|\nG|---0---|\nD|---0---|\nA|---2---|\nE|---3---|",
  "Am": "e|---0---|\nB|---1---|\nG|---2---|\nD|---2---|\nA|---0---|\nE|---x---|",
  "Em": "e|---0---|\nB|---0---|\nG|---0---|\nD|---2---|\nA|---2---|\nE|---0---|",
  "Dm": "e|---1---|\nB|---3---|\nG|---2---|\nD|---0---|\nA|---x---|\nE|---x---|",
  "F":  "e|---1---|\nB|---1---|\nG|---2---|\nD|---3---|\nA|---3---|\nE|---1---|",
  "Bm": "e|---2---|\nB|---3---|\nG|---4---|\nD|---4---|\nA|---2---|\nE|---x---|",
  "B":  "e|---2---|\nB|---4---|\nG|---4---|\nD|---4---|\nA|---2---|\nE|---x---|",
  "Cm": "e|---3---|\nB|---4---|\nG|---5---|\nD|---5---|\nA|---3---|\nE|---x---|",
  "D7": "e|---2---|\nB|---1---|\nG|---2---|\nD|---0---|\nA|---x---|\nE|---x---|",
  "A7": "e|---0---|\nB|---2---|\nG|---0---|\nD|---2---|\nA|---0---|\nE|---x---|",
  "E7": "e|---0---|\nB|---0---|\nG|---0---|\nD|---1---|\nA|---2---|\nE|---0---|",
  "Csus2": "e|---3---|\nB|---1---|\nG|---0---|\nD|---0---|\nA|---3---|\nE|---x---|",
  "Dsus2": "e|---0---|\nB|---3---|\nG|---2---|\nD|---0---|\nA|---x---|\nE|---x---|",
  "Asus2": "e|---0---|\nB|---0---|\nG|---2---|\nD|---2---|\nA|---0---|\nE|---x---|",
  "Esus2": "e|---0---|\nB|---0---|\nG|---4---|\nD|---4---|\nA|---2---|\nE|---0---|",
  "Csus4": "e|---0---|\nB|---1---|\nG|---3---|\nD|---0---|\nA|---3---|\nE|---x---|",
  "Dsus4": "e|---3---|\nB|---3---|\nG|---2---|\nD|---0---|\nA|---x---|\nE|---x---|",
  "Asus4": "e|---0---|\nB|---0---|\nG|---2---|\nD|---2---|\nA|---3---|\nE|---x---|",
  "Esus4": "e|---0---|\nB|---0---|\nG|---2---|\nD|---2---|\nA|---2---|\nE|---0---|",
  "Cadd9": "e|---0---|\nB|---3---|\nG|---0---|\nD|---2---|\nA|---3---|\nE|---x---|",
  "Dadd9": "e|---2---|\nB|---3---|\nG|---2---|\nD|---0---|\nA|---x---|\nE|---x---|",
  "Cmaj7": "e|---0---|\nB|---0---|\nG|---0---|\nD|---2---|\nA|---3---|\nE|---x---|",
  "Dmaj7": "e|---2---|\nB|---2---|\nG|---2---|\nD|---0---|\nA|---x---|\nE|---x---|",
  "Amaj7": "e|---0---|\nB|---2---|\nG|---1---|\nD|---2---|\nA|---0---|\nE|---x---|",
  "Emaj7": "e|---0---|\nB|---1---|\nG|---1---|\nD|---1---|\nA|---2---|\nE|---0---|",
  "E5":  "e|---x---|\nB|---x---|\nG|---x---|\nD|---x---|\nA|---2---|\nE|---0---|",
  "A5":  "e|---x---|\nB|---x---|\nG|---x---|\nD|---2---|\nA|---0---|\nE|---x---|",
  "D5":  "e|---x---|\nB|---x---|\nG|---x---|\nD|---0---|\nA|---2---|\nE|---x---|",
  "G5":  "e|---x---|\nB|---x---|\nG|---x---|\nD|---x---|\nA|---5---|\nE|---3---|",
};

var NUMERIC = {
  "C": "x32010", "D": "xx0232", "E": "022100", "A": "x02220", "G": "320003",
  "Am": "x02210", "Em": "022000", "Dm": "xx0231", "F": "112331", "Bm": "x24432",
  "B": "x24442", "Cm": "x35543", "D7": "xx0212", "A7": "x02020", "E7": "020100",
  "Csus2": "x30013", "Dsus2": "xx0230", "Asus2": "x02200", "Esus2": "024400",
  "Csus4": "x33010", "Dsus4": "xx0233", "Asus4": "x02230", "Esus4": "022200",
  "Cadd9": "x30230", "Dadd9": "xx0232", "Cmaj7": "x32000", "Dmaj7": "xx0222",
  "Amaj7": "x02120", "Emaj7": "021100",
  "E5": "022xxx", "A5": "x022xx", "D5": "xx023x", "G5": "355xxx",
};

var CHORD_NOTES = {
  "C":  [{note:'E',octave:4},{note:'G',octave:4},{note:'C',octave:5}],
  "D":  [{note:'D',octave:4},{note:'F#',octave:4},{note:'A',octave:4}],
  "E":  [{note:'B',octave:3},{note:'E',octave:4},{note:'G#',octave:4}],
  "A":  [{note:'A',octave:3},{note:'E',octave:4},{note:'A',octave:4}],
  "G":  [{note:'B',octave:3},{note:'D',octave:4},{note:'G',octave:4}],
  "Am": [{note:'A',octave:3},{note:'E',octave:4},{note:'A',octave:4}],
  "Em": [{note:'E',octave:3},{note:'B',octave:3},{note:'E',octave:4}],
  "Dm": [{note:'D',octave:4},{note:'F',octave:4},{note:'A',octave:4}],
  "F":  [{note:'F',octave:3},{note:'A',octave:3},{note:'C',octave:4}],
  "Bm": [{note:'B',octave:3},{note:'D',octave:4},{note:'F#',octave:4}],
  "B":  [{note:'B',octave:3},{note:'D#',octave:4},{note:'F#',octave:4}],
  "Cm": [{note:'C',octave:4},{note:'D#',octave:4},{note:'G',octave:4}],
  "D7": [{note:'D',octave:4},{note:'F#',octave:4},{note:'C',octave:5}],
  "A7": [{note:'A',octave:3},{note:'C#',octave:4},{note:'E',octave:4}],
  "E7": [{note:'B',octave:3},{note:'E',octave:4},{note:'G',octave:4}],
  "Csus2": [{note:'D',octave:4},{note:'G',octave:4},{note:'C',octave:5}],
  "Dsus2": [{note:'E',octave:4},{note:'A',octave:4},{note:'D',octave:4}],
  "Asus2": [{note:'B',octave:3},{note:'E',octave:4},{note:'A',octave:4}],
  "Esus2": [{note:'F#',octave:4},{note:'B',octave:3},{note:'E',octave:4}],
  "Csus4": [{note:'F',octave:4},{note:'G',octave:4},{note:'C',octave:5}],
  "Dsus4": [{note:'G',octave:4},{note:'A',octave:4},{note:'D',octave:4}],
  "Asus4": [{note:'D',octave:4},{note:'E',octave:4},{note:'A',octave:4}],
  "Esus4": [{note:'A',octave:3},{note:'E',octave:4},{note:'A',octave:4}],
  "Cadd9": [{note:'D',octave:4},{note:'G',octave:4},{note:'C',octave:5}],
  "Dadd9": [{note:'E',octave:4},{note:'A',octave:4},{note:'D',octave:4}],
  "Cmaj7": [{note:'B',octave:3},{note:'E',octave:4},{note:'C',octave:5}],
  "Dmaj7": [{note:'C#',octave:4},{note:'F#',octave:4},{note:'A',octave:4}],
  "Amaj7": [{note:'G#',octave:3},{note:'E',octave:4},{note:'A',octave:4}],
  "Emaj7": [{note:'D#',octave:3},{note:'G#',octave:3},{note:'B',octave:3}],
  "E5":  [{note:'B',octave:2},{note:'E',octave:3}],
  "A5":  [{note:'E',octave:3},{note:'A',octave:3}],
  "D5":  [{note:'A',octave:3},{note:'D',octave:4}],
  "G5":  [{note:'D',octave:3},{note:'G',octave:3}],
};

var NOTE_TO_STAFF_POS = {
  'C': 3, 'C#': 4, 'D': 5, 'D#': 6, 'E': 7, 'F': 8, 'F#': 9,
  'G': 10, 'G#': 11, 'A': 12, 'A#': 13, 'B': 14,
};
function staffPosition(note, octave) {
  return NOTE_TO_STAFF_POS[note] + (octave - 4) * 12;
}

// ==================== SONGS DATA ====================
var SONGS = {
  "heavens-door": {
    name: "Knockin' on Heaven's Door",    artist: "Bob Dylan",
    chords: ["G","D","Am","G","D","C"], beatsPerChord: 4,
    strumming: "↓ ↓↑ ↑↓↑", strummingLabel: "Down · Down-Up · Up-Down-Up", difficulty: "beginner",
  },
  "bad-moon": {
    name: "Bad Moon Rising", artist: "CCR",
    chords: ["D","A","G","A","D","A","G","A"], beatsPerChord: 4,
    strumming: "↓ ↓ ↑↓ ↑", strummingLabel: "Down · Down-Up · Down-Up", difficulty: "beginner",
  },
  "three-birds": {
    name: "Three Little Birds", artist: "Bob Marley",
    chords: ["A","D","E","A","D","E","A","D","E"], beatsPerChord: 4,
    strumming: "↓   ↑↓ ↑", strummingLabel: "Down · (skip) · Up-Down-Up", difficulty: "beginner",
  },
  "stand-by-me": {
    name: "Stand By Me", artist: "Ben E. King",
    chords: ["G","Em","C","D","G","Em","C","D"], beatsPerChord: 4,
    strumming: "↓  ↓  ↑↓ ↑", strummingLabel: "Down · Down · (skip) · Up-Down-Up", difficulty: "beginner",
  },
  "let-it-be": {
    name: "Let It Be", artist: "The Beatles",
    chords: ["C","G","Am","F","C","G","Am","F"], beatsPerChord: 4,
    strumming: "↓ ↓ ↑↓ ↑", strummingLabel: "Down · Down-Up · Down-Up", difficulty: "intermediate",
  },
  "house-risin": {
    name: "House of the Rising Sun", artist: "The Animals",
    chords: ["Am","C","D","F","Am","E"], beatsPerChord: 4,
    strumming: "↓   ↓   ↓   ↓", strummingLabel: "Down · (skip) · Down · (skip) · Down · (skip)", difficulty: "intermediate",
  },
  "creep": {
    name: "Creep", artist: "Radiohead",
    chords: ["G","B","C","Cm"], beatsPerChord: 4,
    strumming: "↓   ↓   ↓   ↓", strummingLabel: "Down · (skip) · Down · (skip)", difficulty: "advanced",
  },
};

// ==================== SCALE DATA ====================
var SCALE_TYPES = [
  { key: 'major', name: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11, 12] },
  { key: 'minor', name: 'Minor', intervals: [0, 2, 3, 5, 7, 8, 10, 12] },
  { key: 'pentatonic', name: 'Pentatonic', intervals: [0, 2, 4, 7, 9, 12] },
  { key: 'blues', name: 'Blues', intervals: [0, 3, 5, 6, 7, 10, 12] },
  { key: 'dorian', name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10, 12] },
];
var SCALE_KEYS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

// ==================== PROGRESSION DATA ====================
var PROGRESSIONS = [
  { key: 'I-IV-V', name: 'I-IV-V', formula: 'I-IV-V-I', chords: function(k) { return [k, (k+5)%12, (k+7)%12, k]; } },
  { key: 'I-V-vi-IV', name: 'I-V-vi-IV', formula: 'I-V-vi-IV', chords: function(k) { return [k, (k+7)%12, (k+9)%12, (k+5)%12]; } },
  { key: 'ii-V-I', name: 'ii-V-I', formula: 'ii-V-I', chords: function(k) { return [(k+2)%12, (k+7)%12, k]; } },
  { key: '12-bar', name: '12-Bar Blues', formula: 'I-I-I-I-IV-IV-I-I-V-IV-I-V', chords: function(k) { return [k,k,k,k,(k+5)%12,(k+5)%12,k,k,(k+7)%12,(k+5)%12,k,(k+7)%12]; } },
  { key: 'pachelbel', name: "Pachelbel's Canon", formula: 'I-V-vi-iii-IV-I-IV-V', chords: function(k) { return [k,(k+7)%12,(k+9)%12,(k+4)%12,(k+5)%12,k,(k+5)%12,(k+7)%12]; } },
  { key: 'minor', name: 'Minor Progression', formula: 'i-vi-iv-V', chords: function(k) { return [k,(k+8)%12,(k+3)%12,(k+7)%12]; } },
];

// ==================== STRUMMING DATA ====================
var STRUM_PATTERNS = [
  { key: 'basic', name: 'Basic Down', pattern: '↓       ↓       ↓       ↓', preview: '↓↓↓↓' },
  { key: 'alternating', name: 'Alternating', pattern: '↓   ↑   ↓   ↑   ↓   ↑   ↓   ↑', preview: '↓↑↓↑' },
  { key: 'folk', name: 'Folk', pattern: '↓   ↑↓  ↑   ↓   ↑↓  ↑', preview: '↓↑↓ ↑↓↑' },
  { key: 'rock', name: 'Rock', pattern: '↓↓↓   ↓↓↓   ↓↓↓   ↓↓↓', preview: '↓↓↓' },
  { key: 'island', name: 'Island', pattern: '↓   ↑   ↑↓  ↑   ↓   ↑   ↑↓  ↑', preview: '↓ ↑↑↓↑' },
  { key: 'syncopated', name: 'Syncopated', pattern: '↓     ↑↓  ↓     ↑↓  ↓     ↑↓  ↓     ↑↓', preview: '↓ ↑↓' },
  { key: 'sixteenth', name: '16th Notes', pattern: '↓↓↓↓  ↓↓↓↓  ↓↓↓↓  ↓↓↓↓', preview: '↓↓↓↓' },
  { key: 'flamenco', name: 'Flamenco', pattern: '↓↑  ↓↑  ↓↑  ↓↑', preview: '↓↑↓↑' },
  { key: 'funk', name: 'Funk', pattern: '↓↑  ↓ ↑↓  ↓↑  ↓ ↑↓', preview: '↓↑↓ ↑↓' },
  { key: 'waltz', name: 'Waltz', pattern: '↓   ↓   ↓       ↓   ↓   ↓', preview: '↓↓↓' },
  { key: 'arpeggio', name: 'Arpeggio', pattern: '↓   ↑   ↓   ↑   ↓   ↑   ↓   ↑', preview: '↓↑↓↑' },
  { key: 'punk', name: 'Punk', pattern: '↓↓↓   ↓↓↓   ↓↓↓   ↓↓↓', preview: '↓↓↓' },
];

// ==================== CHORD CHROMA TEMPLATES ====================
var CHORD_CHROMA = {};
(function() {
  var NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  function semitone(n) { return NOTES.indexOf(n); }
  function major(root) { var r = new Array(12).fill(0); [0,4,7].forEach(function(i) { r[(root+i)%12]=1; }); return r; }
  function minor(root) { var r = new Array(12).fill(0); [0,3,7].forEach(function(i) { r[(root+i)%12]=1; }); return r; }
  function dom7(root) { var r = new Array(12).fill(0); [0,4,7,10].forEach(function(i) { r[(root+i)%12]=1; }); return r; }
  function sus2(root) { var r = new Array(12).fill(0); [0,2,7].forEach(function(i) { r[(root+i)%12]=1; }); return r; }
  function sus4(root) { var r = new Array(12).fill(0); [0,5,7].forEach(function(i) { r[(root+i)%12]=1; }); return r; }
  function add9(root) { var r = new Array(12).fill(0); [0,4,7,14].forEach(function(i) { r[(root+i)%12]=1; }); return r; }
  function maj7(root) { var r = new Array(12).fill(0); [0,4,7,11].forEach(function(i) { r[(root+i)%12]=1; }); return r; }
  function p5(root) { var r = new Array(12).fill(0); [0,7].forEach(function(i) { r[(root+i)%12]=1; }); return r; }

  CHORD_CHROMA['C']  = major(semitone('C'));
  CHORD_CHROMA['D']  = major(semitone('D'));
  CHORD_CHROMA['E']  = major(semitone('E'));
  CHORD_CHROMA['A']  = major(semitone('A'));
  CHORD_CHROMA['G']  = major(semitone('G'));
  CHORD_CHROMA['Am'] = minor(semitone('A'));
  CHORD_CHROMA['Em'] = minor(semitone('E'));
  CHORD_CHROMA['Dm'] = minor(semitone('D'));
  CHORD_CHROMA['F']  = major(semitone('F'));
  CHORD_CHROMA['Bm'] = minor(semitone('B'));
  CHORD_CHROMA['B']  = major(semitone('B'));
  CHORD_CHROMA['Cm'] = minor(semitone('C#'));
  CHORD_CHROMA['D7'] = dom7(semitone('D'));
  CHORD_CHROMA['A7'] = dom7(semitone('A'));
  CHORD_CHROMA['E7'] = dom7(semitone('E'));
  CHORD_CHROMA['Csus2'] = sus2(semitone('C'));
  CHORD_CHROMA['Dsus2'] = sus2(semitone('D'));
  CHORD_CHROMA['Asus2'] = sus2(semitone('A'));
  CHORD_CHROMA['Esus2'] = sus2(semitone('E'));
  CHORD_CHROMA['Csus4'] = sus4(semitone('C'));
  CHORD_CHROMA['Dsus4'] = sus4(semitone('D'));
  CHORD_CHROMA['Asus4'] = sus4(semitone('A'));
  CHORD_CHROMA['Esus4'] = sus4(semitone('E'));
  CHORD_CHROMA['Cadd9'] = add9(semitone('C'));
  CHORD_CHROMA['Dadd9'] = add9(semitone('D'));
  CHORD_CHROMA['Cmaj7'] = maj7(semitone('C'));
  CHORD_CHROMA['Dmaj7'] = maj7(semitone('D'));
  CHORD_CHROMA['Amaj7'] = maj7(semitone('A'));
  CHORD_CHROMA['Emaj7'] = maj7(semitone('E'));
  CHORD_CHROMA['E5']  = p5(semitone('E'));
  CHORD_CHROMA['A5']  = p5(semitone('A'));
  CHORD_CHROMA['D5']  = p5(semitone('D'));
  CHORD_CHROMA['G5']  = p5(semitone('G'));
})();

// ==================== NEW FEATURE DATA ====================

// Achievement definitions
var ACHIEVEMENTS = [
  { id:'first_session', name:'First Session', desc:'Complete your first practice session', icon:'🎸', condition: function(h) { return h.sessions >= 1; } },
  { id:'ten_transitions', name:'Getting Started', desc:'Complete 10 chord transitions', icon:'🔟', condition: function(h) { return h.totalTransitions >= 10; } },
  { id:'fifty_transitions', name:'On Fire', desc:'Complete 50 chord transitions', icon:'🔥', condition: function(h) { return h.totalTransitions >= 50; } },
  { id:'hundred_transitions', name:'Century Club', desc:'Complete 100 chord transitions', icon:'💯', condition: function(h) { return h.totalTransitions >= 100; } },
  { id:'five_chords', name:'Chord Explorer', desc:'Practice with 5 different chords', icon:'🗺️', condition: function(h) { return h.uniqueChords >= 5; } },
  { id:'all_chords', name:'Chord Master', desc:'Practice with all 32 chords', icon:'🏆', condition: function(h) { return h.uniqueChords >= 32; } },
  { id:'streak_3', name:'3-Day Streak', desc:'Practice 3 days in a row', icon:'⚡', condition: function(h) { return h.currentStreak >= 3; } },
  { id:'streak_7', name:'Week Warrior', desc:'Practice 7 days in a row', icon:'📅', condition: function(h) { return h.currentStreak >= 7; } },
  { id:'streak_30', name:'Monthly Master', desc:'Practice 30 days in a row', icon:'🌟', condition: function(h) { return h.currentStreak >= 30; } },
  { id:'early_bird', name:'Early Bird', desc:'Practice before 8am', icon:'🐦', condition: function(h) { return h.earlyBird; } },
  { id:'night_owl', name:'Night Owl', desc:'Practice after 10pm', icon:'🦉', condition: function(h) { return h.nightOwl; } },
  { id:'perfect_score', name:'Perfect Pitch', desc:'Get 100% accuracy in a session', icon:'🎯', condition: function(h) { return h.perfectAccuracy; } },
  { id:'speed_demon', name:'Speed Demon', desc:'Reach 140 BPM in BPM ladder', icon:'💨', condition: function(h) { return h.maxBpm >= 140; } },
  { id:'marathon', name:'Marathon', desc:'Practice for 30 minutes straight', icon:'🏃', condition: function(h) { return h.longestSession >= 1800; } },
  { id:'record_holder', name:'Record Holder', desc:'Record 5 sessions', icon:'🎙️', condition: function(h) { return h.recordings >= 5; } },
];

// Warm-up routines
var WARMUP_ROUTINES = [
  {
    name: 'Quick Warm-up', desc: '3 minutes of essential finger exercises', duration: 180,
    steps: [
      { type: 'exercise', text: 'Gentle finger stretches - touch each finger to thumb', duration: 30 },
      { type: 'chord', chord: 'C', text: 'C Major - form and release 4 times', duration: 30 },
      { type: 'chord', chord: 'G', text: 'G Major - form and release 4 times', duration: 30 },
      { type: 'chord', chord: 'D', text: 'D Major - form and release 4 times', duration: 30 },
      { type: 'exercise', text: 'Spider walk: 1-2-3-4 on each string', duration: 30 },
      { type: 'chord', chord: 'Am', text: 'Am - transition to C 4 times', duration: 30 },
    ]
  },
  {
    name: 'Finger Stretcher', desc: '5 minutes to loosen tight fingers', duration: 300,
    steps: [
      { type: 'exercise', text: 'Wrist rolls - 10 circles each direction', duration: 30 },
      { type: 'exercise', text: 'Spider walk up and down all strings', duration: 60 },
      { type: 'chord', chord: 'F', text: 'F Major - hold for 10 seconds', duration: 30 },
      { type: 'chord', chord: 'Bm', text: 'Bm - form slowly, hold 10 seconds', duration: 30 },
      { type: 'exercise', text: 'Finger independence: lift each finger individually', duration: 60 },
      { type: 'chord', chord: 'C', text: 'C to G transitions - 8 times slow', duration: 60 },
      { type: 'exercise', text: 'Shake out hands, take a deep breath', duration: 30 },
    ]
  },
  {
    name: 'Barre Prep', desc: 'Prepare for barre chords', duration: 240,
    steps: [
      { type: 'exercise', text: 'Index finger flat on table - lift others', duration: 30 },
      { type: 'chord', chord: 'F', text: 'F Major - focus on barre pressure', duration: 60 },
      { type: 'chord', chord: 'Bm', text: 'Bm - full shape, check each string', duration: 60 },
      { type: 'exercise', text: 'Wrist strengthening: push against wall', duration: 30 },
      { type: 'chord', chord: 'F', text: 'F to C transition 6 times', duration: 60 },
    ]
  },
  {
    name: 'Speed Builder', desc: 'Build transition speed', duration: 180,
    steps: [
      { type: 'chord', chord: 'C', text: 'C Major - quick form 5x', duration: 20 },
      { type: 'chord', chord: 'G', text: 'G Major - quick form 5x', duration: 20 },
      { type: 'chord', chord: 'D', text: 'D Major - quick form 5x', duration: 20 },
      { type: 'exercise', text: 'C→G→D→C at 3s each', duration: 60 },
      { type: 'exercise', text: 'C→Am→F→G at 3s each', duration: 60 },
    ]
  },
];

// Common transition pairs
var TRANSITION_PAIRS = [
  { from: 'C', to: 'G' }, { from: 'C', to: 'Am' }, { from: 'C', to: 'F' },
  { from: 'G', to: 'C' }, { from: 'G', to: 'D' }, { from: 'G', to: 'Em' },
  { from: 'D', to: 'G' }, { from: 'D', to: 'A' }, { from: 'D', to: 'Dm' },
  { from: 'A', to: 'D' }, { from: 'A', to: 'E' }, { from: 'A', to: 'Am' },
  { from: 'E', to: 'A' }, { from: 'E', to: 'E7' }, { from: 'E', to: 'Am' },
  { from: 'Am', to: 'C' }, { from: 'Am', to: 'E' }, { from: 'Am', to: 'G' },
  { from: 'Em', to: 'G' }, { from: 'Em', to: 'Am' }, { from: 'Em', to: 'D' },
  { from: 'F', to: 'C' }, { from: 'F', to: 'G' }, { from: 'F', to: 'Am' },
  { from: 'Dm', to: 'G' }, { from: 'Dm', to: 'A' }, { from: 'Dm', to: 'D' },
];

// Chord theory data
var CHORD_THEORY = {
  'C':  { intervals: ['P1','M3','P5'], notes: ['C','E','G'], color: '#C8823B' },
  'D':  { intervals: ['P1','M3','P5'], notes: ['D','F#','A'], color: '#C8823B' },
  'E':  { intervals: ['P1','M3','P5'], notes: ['E','G#','B'], color: '#C8823B' },
  'A':  { intervals: ['P1','M3','P5'], notes: ['A','C#','E'], color: '#C8823B' },
  'G':  { intervals: ['P1','M3','P5'], notes: ['G','B','D'], color: '#C8823B' },
  'Am': { intervals: ['P1','m3','P5'], notes: ['A','C','E'], color: '#4A7C59' },
  'Em': { intervals: ['P1','m3','P5'], notes: ['E','G','B'], color: '#4A7C59' },
  'Dm': { intervals: ['P1','m3','P5'], notes: ['D','F','A'], color: '#4A7C59' },
  'F':  { intervals: ['P1','M3','P5'], notes: ['F','A','C'], color: '#C8823B' },
  'Bm': { intervals: ['P1','m3','P5'], notes: ['B','D','F#'], color: '#4A7C59' },
  'B':  { intervals: ['P1','M3','P5'], notes: ['B','D#','F#'], color: '#C8823B' },
  'Cm': { intervals: ['P1','m3','P5'], notes: ['C','D#','G'], color: '#4A7C59' },
  'D7': { intervals: ['P1','M3','P5','m7'], notes: ['D','F#','A','C'], color: '#9B59B6' },
  'A7': { intervals: ['P1','M3','P5','m7'], notes: ['A','C#','E','G'], color: '#9B59B6' },
  'E7': { intervals: ['P1','M3','P5','m7'], notes: ['E','G#','B','D'], color: '#9B59B6' },
  'Csus2': { intervals: ['P1','M2','P5'], notes: ['C','D','G'], color: '#2980B9' },
  'Dsus2': { intervals: ['P1','M2','P5'], notes: ['D','E','A'], color: '#2980B9' },
  'Asus2': { intervals: ['P1','M2','P5'], notes: ['A','B','E'], color: '#2980B9' },
  'Esus2': { intervals: ['P1','M2','P5'], notes: ['E','F#','B'], color: '#2980B9' },
  'Csus4': { intervals: ['P1','P4','P5'], notes: ['C','F','G'], color: '#E67E22' },
  'Dsus4': { intervals: ['P1','P4','P5'], notes: ['D','G','A'], color: '#E67E22' },
  'Asus4': { intervals: ['P1','P4','P5'], notes: ['A','D','E'], color: '#E67E22' },
  'Esus4': { intervals: ['P1','P4','P5'], notes: ['E','A','B'], color: '#E67E22' },
  'Cadd9': { intervals: ['P1','M3','P5','M9'], notes: ['C','E','G','D'], color: '#8E44AD' },
  'Dadd9': { intervals: ['P1','M3','P5','M9'], notes: ['D','F#','A','E'], color: '#8E44AD' },
  'Cmaj7': { intervals: ['P1','M3','P5','M7'], notes: ['C','E','G','B'], color: '#16A085' },
  'Dmaj7': { intervals: ['P1','M3','P5','M7'], notes: ['D','F#','A','C#'], color: '#16A085' },
  'Amaj7': { intervals: ['P1','M3','P5','M7'], notes: ['A','C#','E','G#'], color: '#16A085' },
  'Emaj7': { intervals: ['P1','M3','P5','M7'], notes: ['E','G#','B','D#'], color: '#16A085' },
  'E5':  { intervals: ['P1','P5'], notes: ['E','B'], color: '#7F8C8D' },
  'A5':  { intervals: ['P1','P5'], notes: ['A','E'], color: '#7F8C8D' },
  'D5':  { intervals: ['P1','P5'], notes: ['D','A'], color: '#7F8C8D' },
  'G5':  { intervals: ['P1','P5'], notes: ['G','D'], color: '#7F8C8D' },
};

// Fretboard note names
var FRETBOARD_NOTES = {
  'E2': ['E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E'],
  'A2': ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A'],
  'D3': ['D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D'],
  'G3': ['G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G'],
  'B3': ['B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],
  'E4': ['E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E'],
};
var STRING_NAMES = ['E2','A2','D3','G3','B3','E4'];
var FRET_COUNT = 12;

// Tuning reference frequencies
var TUNING = {
  'E2': 82.41, 'A2': 110.00, 'D3': 146.83, 'G3': 196.00, 'B3': 246.94, 'E4': 329.63
};

// Parse strumming pattern
function parseStrumming(pattern) {
  var result = [];
  for (var i = 0; i < pattern.length; i++) {
    var ch = pattern[i];
    if (ch === '↓' || ch === '↓') result.push({ direction: 'D', char: '↓' });
    else if (ch === '↑' || ch === '↑') result.push({ direction: 'U', char: '↑' });
    else result.push({ direction: null, char: ch });
  }
  return result;
}

// Add parsed strumming to songs
var songKeys = Object.keys(SONGS);
for (var si = 0; si < songKeys.length; si++) {
  var key = songKeys[si];
  SONGS[key].parsedStrumming = parseStrumming(SONGS[key].strumming);
  SONGS[key].expectedStrums = SONGS[key].parsedStrumming.filter(function(s) { return s.direction !== null; }).length;
}

// ==================== CHORD SVG TEMPLATES ====================
var CHORD_SVG_TEMPLATES = {};
function buildChordTemplates() {
  CHORD_ORDER.forEach(function(key) {
    var chord = CHORDS[key];
    if (!chord) return;
    var w = 50, h = 70, pad = 8;
    var frets = chord.frets.slice(1);
    var fingers = chord.fingers.slice(1);
    var minFret = chord.baseFret || 1;
    var maxFret = minFret + 3;
    var svg = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">';
    // Fret lines
    for (var f = 0; f <= 4; f++) {
      var y = pad + f * (h - pad * 2) / 4;
      svg += '<line x1="10" y1="' + y + '" x2="' + (w - 10) + '" y2="' + y + '" stroke="#E5E0DA" stroke-width="1"/>';
    }
    // String lines
    for (var s = 0; s < 6; s++) {
      var x = 10 + s * (w - 20) / 5;
      svg += '<line x1="' + x + '" y1="' + pad + '" x2="' + x + '" y2="' + (h - pad) + '" stroke="#E5E0DA" stroke-width="1"/>';
    }
    // Nut
    svg += '<line x1="10" y1="' + pad + '" x2="' + (w - 10) + '" y2="' + pad + '" stroke="#5B4E4B" stroke-width="2"/>';
    // Fret numbers
    svg += '<text x="2" y="' + (pad + (h - pad * 2) / 8) + '" font-size="6" fill="#9B9490" text-anchor="middle">' + minFret + '</text>';
    svg += '<text x="2" y="' + (pad + 3 * (h - pad * 2) / 8) + '" font-size="6" fill="#9B9490" text-anchor="middle">' + (minFret + 1) + '</text>';
    // Finger positions
    for (var s2 = 0; s2 < 6; s2++) {
      var fret = frets[s2];
      if (fret === null || fret === undefined) {
        // Muted or open
        var x2 = 10 + s2 * (w - 20) / 5;
        if (fret === null) {
          svg += '<text x="' + x2 + '" y="' + (pad - 2) + '" font-size="8" fill="#9B9490" text-anchor="middle">x</text>';
        } else {
          svg += '<text x="' + x2 + '" y="' + (pad - 2) + '" font-size="6" fill="#5B4E4B" text-anchor="middle">O</text>';
        }
      } else {
        var x3 = 10 + s2 * (w - 20) / 5;
        var fretNum = fret - minFret + 1;
        var y3 = pad + (fretNum - 0.5) * (h - pad * 2) / 4;
        svg += '<circle cx="' + x3 + '" cy="' + y3 + '" r="4" fill="#5B4E4B"/>';
      }
    }
    svg += '</svg>';
    CHORD_SVG_TEMPLATES[key] = svg;
  });
  console.log('Chord templates built:', Object.keys(CHORD_SVG_TEMPLATES).length);
}
