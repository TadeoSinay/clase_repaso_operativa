import { useRef, useCallback } from 'react'
import * as Tone from 'tone'
import TRACKS from './classicalTracks.js'

// ── Audio engine — created once on first user gesture ─────────────────────────
let _engine = null

const PIANO_URLS = {
  A0:'A0.mp3',  C1:'C1.mp3',  'D#1':'Ds1.mp3', 'F#1':'Fs1.mp3',
  A1:'A1.mp3',  C2:'C2.mp3',  'D#2':'Ds2.mp3', 'F#2':'Fs2.mp3',
  A2:'A2.mp3',  C3:'C3.mp3',  'D#3':'Ds3.mp3', 'F#3':'Fs3.mp3',
  A3:'A3.mp3',  C4:'C4.mp3',  'D#4':'Ds4.mp3', 'F#4':'Fs4.mp3',
  A4:'A4.mp3',  C5:'C5.mp3',  'D#5':'Ds5.mp3', 'F#5':'Fs5.mp3',
  A5:'A5.mp3',  C6:'C6.mp3',  'D#6':'Ds6.mp3', 'F#6':'Fs6.mp3',
  A6:'A6.mp3',  C7:'C7.mp3',
}

async function buildEngine() {
  if (_engine?.ready) return _engine
  if (_engine?.loading) {
    await new Promise(r => {
      const t = setInterval(() => { if (_engine?.ready) { clearInterval(t); r() } }, 80)
    })
    return _engine
  }

  _engine = { loading: true, ready: false }
  await Tone.start()

  // Shared hall reverb + limiter
  const reverb  = new Tone.Reverb({ decay: 2.6, wet: 0.30 })
  await reverb.generate()
  const limiter = new Tone.Limiter(-2).toDestination()
  reverb.connect(limiter)

  // ── Instrument definitions ──────────────────────────────────────────────────

  // Real grand piano (Salamander samples)
  const piano = await new Promise(resolve => {
    const s = new Tone.Sampler({
      urls: PIANO_URLS,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      onload: () => resolve(s),
    }).connect(reverb)
  })

  // Orchestral strings — warm triangle wave, slow attack
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.15, decay: 0.5, sustain: 0.80, release: 1.8 },
    volume: -9,
  }).connect(reverb)

  // Brass section — sawtooth, punchy attack
  const brass = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth', partialCount: 4 },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.70, release: 0.6 },
    volume: -11,
  }).connect(reverb)

  // Flute — pure sine, soft and breathy
  const flute = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.10, decay: 0.10, sustain: 0.90, release: 0.8 },
    volume: -6,
  }).connect(reverb)

  // Pipe organ — square wave, instant attack, full sustain
  const organ = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square', partialCount: 2 },
    envelope: { attack: 0.02, decay: 0.05, sustain: 0.95, release: 0.4 },
    volume: -13,
  }).connect(reverb)

  _engine = {
    ready: true,
    inst: { piano, strings, brass, flute, organ },
  }
  return _engine
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAmbientMusic() {
  const timerRef = useRef(null)
  const started  = useRef(false)
  const stopped  = useRef(false)
  const idxRef   = useRef(0)

  const playNext = useCallback(async () => {
    if (stopped.current) return
    let eng
    try { eng = await buildEngine() } catch { return }
    if (stopped.current) return

    // First pass: play in defined order (upbeat → mellow).
    // After cycling through all tracks: shuffle for variety.
    const raw = idxRef.current
    if (raw > 0 && raw % TRACKS.length === 0) {
      // Reshuffle for subsequent cycles
      TRACKS.sort(() => Math.random() - 0.5)
    }
    const track = TRACKS[raw % TRACKS.length]
    idxRef.current = raw + 1

    const synth = eng.inst[track.instrument] ?? eng.inst.piano
    const now   = Tone.now() + 0.15
    let t = 0

    for (const [freq, dur] of track.notes) {
      if (freq > 0) {
        const vel = 0.46 + Math.random() * 0.26   // humanised velocity
        synth.triggerAttackRelease(freq, Math.max(0.05, dur * 0.88), now + t, vel)
      }
      t += dur
    }

    timerRef.current = setTimeout(
      () => { if (!stopped.current) playNext() },
      (t + 0.5) * 1000
    )
  }, [])

  const start = useCallback(() => {
    if (started.current) return
    started.current = true
    stopped.current = false
    idxRef.current  = 0
    playNext()
  }, [playNext])

  const stop = useCallback(() => {
    stopped.current = true
    started.current = false
    clearTimeout(timerRef.current)
    try { _engine?.inst?.piano?.releaseAll() } catch (_) {}
  }, [])

  return { start, stop }
}
