import { useRef, useCallback } from 'react'
import * as Tone from 'tone'
import TRACKS from './classicalTracks.js'

// ── Salamander Grand Piano ────────────────────────────────────────────────────
// Real piano recordings loaded once, shared across all hook instances.
// Samples from the Tone.js / Salamander Grand Piano project (CC BY 3.0).
let _sampler  = null
let _reverb   = null
let _ready    = false
let _loading  = false

const SAMPLE_BASE = 'https://tonejs.github.io/audio/salamander/'
const SAMPLE_URLS = {
  A0:'A0.mp3',  C1:'C1.mp3',  'D#1':'Ds1.mp3', 'F#1':'Fs1.mp3',
  A1:'A1.mp3',  C2:'C2.mp3',  'D#2':'Ds2.mp3', 'F#2':'Fs2.mp3',
  A2:'A2.mp3',  C3:'C3.mp3',  'D#3':'Ds3.mp3', 'F#3':'Fs3.mp3',
  A3:'A3.mp3',  C4:'C4.mp3',  'D#4':'Ds4.mp3', 'F#4':'Fs4.mp3',
  A4:'A4.mp3',  C5:'C5.mp3',  'D#5':'Ds5.mp3', 'F#5':'Fs5.mp3',
  A5:'A5.mp3',  C6:'C6.mp3',  'D#6':'Ds6.mp3', 'F#6':'Fs6.mp3',
  A6:'A6.mp3',  C7:'C7.mp3',
}

async function getSampler() {
  if (_ready) return _sampler
  if (_loading) {
    // Wait until loaded
    await new Promise(resolve => {
      const poll = setInterval(() => { if (_ready) { clearInterval(poll); resolve() } }, 100)
    })
    return _sampler
  }
  _loading = true
  await Tone.start()

  // Concert-hall reverb
  _reverb = new Tone.Reverb({ decay: 2.8, wet: 0.30 })
  await _reverb.generate()

  // Soft limiter to prevent clipping
  const limiter = new Tone.Limiter(-3)
  limiter.connect(_reverb)
  _reverb.toDestination()

  await new Promise(resolve => {
    _sampler = new Tone.Sampler({
      urls: SAMPLE_URLS,
      baseUrl: SAMPLE_BASE,
      onload: () => { _ready = true; resolve() },
    }).connect(limiter)
  })

  return _sampler
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAmbientMusic() {
  const timerRef    = useRef(null)
  const started     = useRef(false)
  const stopped     = useRef(false)
  const shuffledRef = useRef(null)
  const idxRef      = useRef(0)

  const playNext = useCallback(async () => {
    if (stopped.current) return
    let sampler
    try {
      sampler = await getSampler()
    } catch { return }
    if (stopped.current || !sampler) return

    const tracks = shuffledRef.current
    const idx    = idxRef.current % tracks.length
    const track  = tracks[idx]
    idxRef.current = idx + 1

    // Schedule all notes of this track
    const now = Tone.now() + 0.15
    let t = 0
    for (const [freq, dur] of track.notes) {
      if (freq > 0) {
        // Slight velocity variation → natural, humanised feel
        const vel = 0.50 + Math.random() * 0.22
        sampler.triggerAttackRelease(freq, Math.max(0.06, dur * 0.90), now + t, vel)
      }
      t += dur
    }

    // When this track ends, play the next one
    timerRef.current = setTimeout(() => { if (!stopped.current) playNext() }, (t + 0.5) * 1000)
  }, [])

  const start = useCallback(() => {
    if (started.current) return
    started.current = true
    stopped.current = false
    shuffledRef.current = [...TRACKS].sort(() => Math.random() - 0.5)
    idxRef.current = 0
    playNext()
  }, [playNext])

  const stop = useCallback(() => {
    stopped.current  = true
    started.current  = false
    clearTimeout(timerRef.current)
    try { _sampler?.releaseAll() } catch (_) {}
  }, [])

  return { start, stop }
}
