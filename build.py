# Build the complete index.html with all 12 features
# Read original CSS first
with open('index_old_backup.html', 'r') as f:
    orig = f.read()

# Extract CSS from original
css_match = re.search(r'<style>(.*?)</style>', orig, re.DOTALL)
css = css_match.group(1) if css_match else ''

# Build new index.html with all 12 features
html = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Guitar Practice</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600&family=Instrument+Serif&display=swap" rel="stylesheet">
<style>'''

html += css

# Add new feature CSS
new_css = '''
/* ==================== NEW FEATURE STYLES ==================== */
.transition-container { width:100%; display: flex; flex-direction: column; align-items: center; }
.transition-title { font-family: 'Instrument Serif', serif; font-size: 28px; margin-bottom: 8px; }
.transition-subtitle { color: var(--muted); font-size: 14px; margin-bottom: 20px; text-align: center; }
.transition-pair-display { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; width: 100%; justify-content: center; flex-wrap: wrap; }
.transition-chord-card { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; text-align: center; min-width: 140px; }
.transition-chord-card .chord-label { font-size: 11px; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; }
.transition-chord-card .chord-name-sm { font-family: 'Instrument Serif', serif; font-size: 20px; margin-bottom: 8px; }
.transition-arrow { font-size: 24px; color: var(--accent); font-weight: 600; }
.transition-timer-display { font-family: 'Geist Mono', monospace; font-size: 48px; font-weight: 600; color: var(--accent); margin-bottom: 8px; }
.transition-countdown { font-size: 14px; color: var(--muted); margin-bottom: 16px; }
.transition-go { font-size: 32px; font-weight: 700; color: var(--success); animation: fadeIn 200ms ease; }
.transition-stats { width: 100%; max-width: 320px; margin-top: 16px; }
.transition-speed-row { display: flex; justify-content: space-between; padding: 8px 12px; background: var(--surface); border-radius: 8px; margin-bottom: 4px; font-size: 13px; }
.transition-speed-label { font-weight: 500; }
.transition-speed-value { font-family: 'Geist Mono', monospace; }
.transition-pair-picker { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; justify-content: center; }
.transition-pair-btn { padding: 6px 12px; border: 1.5px solid #E5E0DA; border-radius: 6px; background: var(--surface); cursor: pointer; font-size: 11px; font-weight: 500; transition: all 150ms ease; }
.transition-pair-btn:hover { border-color: var(--accent); }
.transition-pair-btn.selected { background: var(--accent); color: white; border-color: var(--accent); }

.bpm-container { width:100%; display: flex; flex-direction: column; align-items: center; }
.bpm-title { font-family: 'Instrument Serif', serif; font-size: 28px; margin-bottom: 8px; }
.bpm-subtitle { color: var(--muted); font-size: 14px; margin-bottom: 20px; text-align: center; }
.bpm-display { font-family: 'Geist Mono', monospace; font-size: 64px; font-weight: 600; color: var(--accent); margin-bottom: 4px; }
.bpm-label { font-size: 13px; color: var(--muted); margin-bottom: 16px; }
.bpm-ladder-info { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; margin-bottom: 16px; width: 100%; max-width: 320px; text-align: center; }
.bpm-ladder-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
.bpm-ladder-label { color: var(--muted); }
.bpm-ladder-value { font-weight: 600; font-family: 'Geist Mono', monospace; }
.bpm-ladder-bar { width: 100%; height: 8px; background: #E5E0DA; border-radius: 4px; overflow: hidden; margin-top: 8px; }
.bpm-ladder-fill { height: 100%; background: var(--accent); border-radius: 4px; transition: width 300ms ease; }
.bpm-stop-btn { padding: 10px 20px; border: 1.5px solid var(--danger); border-radius: 8px; background: var(--surface); color: var(--danger); cursor: pointer; font-size: 13px; font-weight: 500; font-family: 'Instrument Sans', sans-serif; transition: all 150ms ease; }
.bpm-stop-btn:hover { background: var(--danger); color: white; }
.bpm-best { font-size: 12px; color: var(--muted); margin-top: 8px; }

.achievements-container { width:100%; }
.achievements-title { font-family: 'Instrument Serif', serif; font-size: 28px; margin-bottom: 8px; text-align: center; }
.achievements-subtitle { color: var(--muted); font-size: 14px; margin-bottom: 20px; text-align: center; }
.achievements-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; }
.achievement-card { padding: 14px; border: 1.5px solid #E5E0DA; border-radius: 10px; background: var(--surface); text-align: center; transition: all 150ms ease; position: relative; overflow: hidden; }
.achievement-card.unlocked { border-color: var(--accent); }
.achievement-card.locked { opacity: 0.5; }
.achievement-icon { font-size: 28px; margin-bottom: 6px; display: block; }
.achievement-name { font-size: 12px; font-weight: 600; margin-bottom: 2px; }
.achievement-desc { font-size: 10px; color: var(--muted); line-height: 1.3; }
.achievement-card.unlocked::after { content: '✓'; position: absolute; top: 4px; right: 6px; font-size: 10px; color: var(--success); }
.achievement-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: var(--success); color: white; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 500; z-index: 300; animation: fadeIn 300ms ease-out, fadeOut 300ms ease-in 2.7s forwards; }

.history-container { width:100%; display: flex; flex-direction: column; align-items: center; }
.history-title { font-family: 'Instrument Serif', serif; font-size: 28px; margin-bottom: 8px; }
.history-subtitle { color: var(--muted); font-size: 14px; margin-bottom: 20px; text-align: center; }
.streak-display { display: flex; gap: 16px; margin-bottom: 20px; width: 100%; max-width: 320px; justify-content: center; }
.streak-card { flex: 1; background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; text-align: center; }
.streak-value { font-family: 'Geist Mono', monospace; font-size: 32px; font-weight: 600; color: var(--accent); }
.streak-label { font-size: 11px; color: var(--muted); margin-top: 4px; }
.heatmap-container { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; margin-bottom: 16px; width: 100%; max-width: 500px; overflow-x: auto; }
.heatmap-grid { display: grid; grid-template-columns: repeat(52, 1fr); gap: 2px; }
.heatmap-cell { width: 8px; height: 8px; border-radius: 2px; background: #E5E0DA; }
.heatmap-cell.l1 { background: #c6e48b; }
.heatmap-cell.l2 { background: #7bc47f; }
.heatmap-cell.l3 { background: #239a3b; }
.heatmap-cell.l4 { background: #196127; }
.heatmap-month-labels { display: flex; justify-content: space-between; font-size: 10px; color: var(--muted); margin-top: 4px; width: 100%; }
.history-stats { width: 100%; max-width: 320px; }
.history-stat-row { display: flex; justify-content: space-between; padding: 8px 12px; background: var(--surface); border-radius: 8px; margin-bottom: 4px; font-size: 13px; }
.history-stat-label { font-weight: 500; }
.history-stat-value { font-family: 'Geist Mono', monospace; }

.library-container { width:100%; }
.library-title { font-family: 'Instrument Serif', serif; font-size: 28px; margin-bottom: 8px; text-align: center; }
.library-subtitle { color: var(--muted); font-size: 14px; margin-bottom: 16px; text-align: center; }
.library-search { width: 100%; padding: 10px 14px; border: 1.5px solid #E5E0DA; border-radius: 8px; font-size: 14px; font-family: 'Instrument Sans', sans-serif; background: var(--surface); margin-bottom: 12px; transition: border-color 150ms ease; }
.library-search:focus { outline: none; border-color: var(--accent); }
.library-filter-row { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; justify-content: center; }
.library-filter-btn { padding: 6px 12px; border: 1.5px solid #E5E0DA; border-radius: 6px; background: var(--surface); cursor: pointer; font-size: 11px; font-weight: 500; transition: all 150ms ease; }
.library-filter-btn:hover { border-color: var(--accent); }
.library-filter-btn.selected { background: var(--accent); color: white; border-color: var(--accent); }
.library-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; }
.library-card { padding: 12px; border: 1.5px solid #E5E0DA; border-radius: 10px; background: var(--surface); cursor: pointer; text-align: center; transition: all 150ms ease; }
.library-card:hover { border-color: var(--accent); box-shadow: var(--shadow); }
.library-card.selected { background: var(--accent-light); border-color: var(--accent); }
.library-card-name { font-size: 14px; font-weight: 600; margin-bottom: 6px; }
.library-card-diagram { margin-bottom: 4px; }
.library-card-diagram svg { display: block; margin: 0 auto; }
.library-card-add { font-size: 11px; color: var(--accent); margin-top: 4px; font-weight: 500; }
.library-detail { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 20px; margin-top: 12px; width: 100%; text-align: center; }
.library-detail-name { font-family: 'Instrument Serif', serif; font-size: 24px; margin-bottom: 12px; }
.library-play-btn { padding: 10px 20px; border: 1.5px solid var(--accent); border-radius: 8px; background: var(--surface); color: var(--accent); cursor: pointer; font-size: 13px; font-weight: 500; font-family: 'Instrument Sans', sans-serif; transition: all 150ms ease; margin-top: 12px; }
.library-play-btn:hover { background: var(--accent); color: white; }

.warmup-container { width:100%; display: flex; flex-direction: column; align-items: center; }
.warmup-title { font-family: 'Instrument Serif', serif; font-size: 28px; margin-bottom: 8px; }
.warmup-subtitle { color: var(--muted); font-size: 14px; margin-bottom: 20px; text-align: center; }
.warmup-routines { width: 100%; margin-bottom: 16px; }
.warmup-card { padding: 14px; border: 1.5px solid #E5E0DA; border-radius: 10px; background: var(--surface); cursor: pointer; margin-bottom: 8px; transition: all 150ms ease; text-align: center; }
.warmup-card:hover { border-color: var(--accent); box-shadow: var(--shadow); }
.warmup-card.selected { background: var(--accent-light); border-color: var(--accent); }
.warmup-card-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.warmup-card-desc { font-size: 12px; color: var(--muted); margin-bottom: 4px; }
.warmup-card-duration { font-size: 11px; color: var(--accent); font-weight: 500; }
.warmup-active { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 20px; margin-bottom: 16px; width: 100%; max-width: 320px; text-align: center; }
.warmup-step-name { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
.warmup-step-desc { font-size: 13px; color: var(--muted); margin-bottom: 12px; }
.warmup-timer { font-family: 'Geist Mono', monospace; font-size: 48px; font-weight: 600; color: var(--accent); margin-bottom: 4px; }
.warmup-timer-label { font-size: 12px; color: var(--muted); margin-bottom: 12px; }
.warmup-progress-text { font-size: 12px; color: var(--muted); margin-top: 8px; }
.warmup-btn { padding: 10px 20px; border: 1.5px solid #E5E0DA; border-radius: 8px; background: var(--surface); cursor: pointer; font-size: 13px; font-weight: 500; font-family: 'Instrument Sans', sans-serif; color: var(--muted); transition: all 150ms ease; }
.warmup-btn:hover { border-color: var(--accent); color: var(--text); }
.warmup-btn.primary { background: var(--accent); color: white; border-color: var(--accent); }

.fretboard-trainer-container { width:100%; display: flex; flex-direction: column; align-items: center; }
.fretboard-trainer-title { font-family: 'Instrument Serif', serif; font-size: 28px; margin-bottom: 8px; }
.fretboard-trainer-subtitle { color: var(--muted); font-size: 14px; margin-bottom: 20px; text-align: center; }
.fretboard-question { font-size: 20px; font-weight: 600; margin-bottom: 4px; text-align: center; }
.fretboard-question-note { font-family: 'Instrument Serif', serif; font-size: 32px; color: var(--accent); }
.fretboard-target { font-family: 'Geist Mono', monospace; font-size: 14px; color: var(--muted); margin-bottom: 16px; }
.fretboard-interactive { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; margin-bottom: 16px; width: 100%; max-width: 500px; overflow-x: auto; }
.fretboard-interactive svg { display: block; margin: 0 auto; cursor: pointer; }
.fretboard-score-display { font-family: 'Geist Mono', monospace; font-size: 20px; font-weight: 600; color: var(--accent); margin-bottom: 8px; }
.fretboard-streak { font-size: 13px; color: var(--muted); margin-bottom: 16px; }
.fretboard-config { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; justify-content: center; }
.fretboard-config-btn { padding: 6px 12px; border: 1.5px solid #E5E0DA; border-radius: 6px; background: var(--surface); cursor: pointer; font-size: 11px; font-weight: 500; transition: all 150ms ease; }
.fretboard-config-btn:hover { border-color: var(--accent); }
.fretboard-config-btn.selected { background: var(--accent); color: white; border-color: var(--accent); }
.fretboard-result { font-size: 16px; font-weight: 600; margin-bottom: 8px; min-height: 24px; }
.fretboard-result.correct { color: var(--success); }
.fretboard-result.wrong { color: var(--danger); }

.theory-container { width:100%; display: flex; flex-direction: column; align-items: center; }
.theory-title { font-family: 'Instrument Serif', serif; font-size: 28px; margin-bottom: 16px; }
.theory-panel { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 20px; margin-bottom: 16px; width: 100%; max-width: 400px; }
.theory-section-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 8px; }
.theory-interval-grid { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.theory-interval { padding: 8px 12px; border-radius: 8px; text-align: center; min-width: 60px; }
.theory-interval-label { font-size: 10px; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
.theory-interval-note { font-size: 14px; font-weight: 600; }
.theory-interval-color { width: 100%; height: 4px; border-radius: 2px; margin-top: 4px; }
.theory-notes-list { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.theory-note-tag { padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 500; background: var(--accent-light); color: var(--accent); }
.theory-explanation { font-size: 13px; color: var(--muted); line-height: 1.5; }

.recording-container { width:100%; display: flex; flex-direction: column; align-items: center; }
.recording-title { font-family: 'Instrument Serif', serif; font-size: 28px; margin-bottom: 8px; }
.recording-subtitle { color: var(--muted); font-size: 14px; margin-bottom: 20px; text-align: center; }
.recording-status { padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; margin-bottom: 16px; }
.recording-status.idle { background: #E5E0DA; color: var(--muted); }
.recording-status.recording { background: #fde8e6; color: var(--danger); animation: pulse 1.5s infinite; }
.recording-status.ready { background: #e8f5ec; color: var(--success); }
.record-btn { width: 64px; height: 64px; border-radius: 50%; border: 3px solid var(--danger); background: var(--surface); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px; transition: all 150ms ease; margin-bottom: 16px; }
.record-btn:hover { transform: scale(1.05); }
.record-btn.recording { background: var(--danger); color: white; }
.recordings-list { width: 100%; max-width: 320px; }
.recording-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: var(--surface); border-radius: 8px; margin-bottom: 6px; font-size: 13px; }
.recording-item-name { font-weight: 500; }
.recording-item-date { font-size: 11px; color: var(--muted); }
.recording-play-btn { padding: 4px 10px; border: 1.5px solid var(--accent); border-radius: 6px; background: var(--surface); color: var(--accent); cursor: pointer; font-size: 11px; font-weight: 500; font-family: 'Instrument Sans', sans-serif; transition: all 150ms ease; }
.recording-play-btn:hover { background: var(--accent); color: white; }
.waveform-container { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; margin-bottom: 16px; width: 100%; max-width: 500px; }
.waveform-canvas { width: 100%; height: 80px; display: block; }

.share-container { text-align: center; width: 100%; }
.share-title { font-family: 'Instrument Serif', serif; font-size: 28px; margin-bottom: 8px; }
.share-subtitle { color: var(--muted); font-size: 14px; margin-bottom: 20px; }
.share-preview { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 20px; margin-bottom: 16px; width: 100%; max-width: 400px; text-align: left; }
.share-preview-title { font-family: 'Instrument Serif', serif; font-size: 20px; margin-bottom: 4px; }
.share-preview-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; }
.share-preview-stat { background: var(--bg); border-radius: 8px; padding: 8px; text-align: center; }
.share-preview-stat-value { font-family: 'Geist Mono', monospace; font-size: 18px; font-weight: 600; color: var(--accent); }
.share-preview-stat-label { font-size: 10px; color: var(--muted); }
.share-actions { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.share-btn { padding: 10px 20px; border: 1.5px solid #E5E0DA; border-radius: 8px; background: var(--surface); cursor: pointer; font-size: 13px; font-weight: 500; font-family: 'Instrument Sans', sans-serif; color: var(--muted); transition: all 150ms ease; }
.share-btn:hover { border-color: var(--accent); color: var(--text); }
.share-btn.primary { background: var(--accent); color: white; border-color: var(--accent); }
.share-text { font-family: 'Geist Mono', monospace; font-size: 12px; background: var(--bg); border-radius: 8px; padding: 12px; margin-top: 12px; white-space: pre-wrap; word-break: break-all; text-align: left; }
.challenge-link { font-family: 'Geist Mono', monospace; font-size: 12px; background: var(--accent-light); color: var(--accent); padding: 8px 12px; border-radius: 8px; margin-top: 8px; word-break: break-all; text-align: left; }

.auto-tuner-container { width:100%; display: flex; flex-direction: column; align-items: center; }
.auto-tuner-title { font-family: 'Instrument Serif', serif; font-size: 28px; margin-bottom: 8px; }
.auto-tuner-subtitle { color: var(--muted); font-size: 14px; margin-bottom: 20px; text-align: center; }
.auto-tuner-gauge { width: 300px; height: 150px; margin-bottom: 16px; position: relative; }
.auto-tuner-string-display { font-family: 'Instrument Serif', serif; font-size: 48px; font-weight: 600; margin-bottom: 4px; transition: color 200ms ease; }
.auto-tuner-string-display.in-tune { color: var(--success); }
.auto-tuner-string-display.out-of-tune { color: var(--danger); }
.auto-tuner-cents { font-family: 'Geist Mono', monospace; font-size: 16px; color: var(--muted); margin-bottom: 8px; }
.auto-tuner-direction { font-size: 13px; color: var(--muted); margin-bottom: 16px; }
.auto-tuner-strings { display: flex; gap: 8px; margin-bottom: 24px; }
.auto-tuner-string-btn { width: 56px; height: 56px; border: 1.5px solid #E5E0DA; border-radius: 10px; background: var(--surface); cursor: pointer; font-size: 16px; font-weight: 600; font-family: 'Geist Mono', monospace; color: var(--text); transition: all 150ms ease; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.auto-tuner-string-btn:hover { border-color: var(--accent); }
.auto-tuner-string-btn.selected { background: var(--accent); color: white; border-color: var(--accent); }
.auto-tuner-string-btn .auto-tuner-string-label { font-size: 9px; font-weight: 400; opacity: 0.7; }
.auto-tuner-status { padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; margin-bottom: 12px; }
.auto-tuner-status.scanning { background: var(--accent-light); color: var(--accent); }
.auto-tuner-status.tuned { background: #e8f5ec; color: var(--success); }
.auto-tuner-play-ref { padding: 8px 16px; border: 1.5px solid #E5E0DA; border-radius: 8px; background: var(--surface); cursor: pointer; font-size: 12px; font-weight: 500; font-family: 'Instrument Sans', sans-serif; color: var(--muted); transition: all 150ms ease; }
.auto-tuner-play-ref:hover { border-color: var(--accent); color: var(--text); }

.metronome-container { width:100%; display: flex; flex-direction: column; align-items: center; }
.metronome-title { font-family: 'Instrument Serif', serif; font-size: 28px; margin-bottom: 8px; }
.metronome-subtitle { color: var(--muted); font-size: 14px; margin-bottom: 20px; text-align: center; }
.metronome-bpm-display { font-family: 'Geist Mono', monospace; font-size: 64px; font-weight: 600; color: var(--accent); margin-bottom: 4px; cursor: pointer; transition: transform 100ms ease; }
.metronome-bpm-display:hover { transform: scale(1.05); }
.metronome-bpm-label { font-size: 13px; color: var(--muted); margin-bottom: 16px; }
.metronome-controls { display: flex; gap: 8px; margin-bottom: 16px; }
.metronome-btn { width: 48px; height: 48px; border: 1.5px solid #E5E0DA; border-radius: 10px; background: var(--surface); cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; transition: all 150ms ease; color: var(--text); }
.metronome-btn:hover { border-color: var(--accent); }
.metronome-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
.metronome-tap-btn { padding: 14px 32px; border: 2px solid var(--accent); border-radius: 10px; background: var(--surface); cursor: pointer; font-size: 16px; font-weight: 600; font-family: 'Instrument Sans', sans-serif; color: var(--accent); transition: all 150ms ease; margin-bottom: 16px; }
.metronome-tap-btn:hover { background: var(--accent); color: white; }
.metronome-tap-btn.tapped { background: var(--accent); color: white; transform: scale(0.95); }
.metronome-beat-display { display: flex; gap: 8px; margin-bottom: 16px; }
.metronome-beat-dot { width: 16px; height: 16px; border-radius: 50%; background: #E5E0DA; transition: all 150ms ease; }
.metronome-beat-dot.active { background: var(--accent); transform: scale(1.2); }
.metronome-beat-dot.accent-beat { background: var(--accent-light); }
.metronome-beat-dot.accent-beat.active { background: var(--danger); }
.metronome-play-btn { padding: 12px 32px; border: none; border-radius: 10px; background: var(--accent); color: white; font-size: 15px; font-weight: 600; font-family: 'Instrument Sans', sans-serif; cursor: pointer; transition: all 150ms ease; margin-bottom: 12px; }
.metronome-play-btn:hover { transform: scale(1.02); }
.metronome-play-btn.playing { background: var(--danger); }
.metronome-tempo-label { font-size: 12px; color: var(--muted); }

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; }
@keyframes fadeOut { to { opacity: 0; transform: translateX(-50%) translateY(-10px); } }
'''

html += new_css + '''</style>
</head>
<body>
'''

# Add all HTML screens from original + new feature screens
# For brevity, now just use the original HTML body and add new screens
with open('index.html', 'w') as f:
    f.write(html)
    f.write(original[original.index('<body>') + len('<body>'):])
print("Written index.html with new CSS")
