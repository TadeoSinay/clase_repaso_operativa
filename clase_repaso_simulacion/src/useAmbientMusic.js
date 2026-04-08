import { useRef, useCallback } from 'react'
import TRACKS from './classicalTracks.js'

export function useAmbientMusic() {
  const ctxRef      = useRef(null)
  const masterRef   = useRef(null)
  const timerRef    = useRef(null)
  const started     = useRef(false)
  const shuffledRef = useRef(null)
  const idxRef      = useRef(0)

  /** Plays a single note with piano-like envelope */
  const playNote = (ac, master, freq, startTime, dur) => {
    if (freq === 0) return

    const osc  = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(0.20, startTime + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.11, startTime + dur * 0.4)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur * 0.95)
    osc.connect(gain)
    gain.connect(master)
    osc.start(startTime)
    osc.stop(startTime + dur + 0.05)

    // Soft harmonic for richer timbre
    if (freq < 600) {
      const osc2  = ac.createOscillator()
      const gain2 = ac.createGain()
      osc2.type = 'sine'
      osc2.frequency.value = freq * 2
      gain2.gain.setValueAtTime(0, startTime)
      gain2.gain.linearRampToValueAtTime(0.055, startTime + 0.01)
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + dur * 0.8)
      osc2.connect(gain2)
      gain2.connect(master)
      osc2.start(startTime)
      osc2.stop(startTime + dur + 0.05)
    }
  }

  /** Schedules all notes of a track and returns total duration in seconds */
  const scheduleTrack = (ac, master, startTime, notes) => {
    let t = startTime
    for (const [freq, dur] of notes) {
      playNote(ac, master, freq, t, dur)
      t += dur
    }
    return t - startTime
  }

  /** Plays the next track in the shuffled list, then schedules the one after */
  const playNext = useCallback(() => {
    const ac     = ctxRef.current
    const master = masterRef.current
    if (!ac || !master) return

    const tracks = shuffledRef.current
    const idx    = idxRef.current % tracks.length
    const track  = tracks[idx]
    idxRef.current = idx + 1

    const startTime = ac.currentTime + 0.15
    const dur       = scheduleTrack(ac, master, startTime, track.notes)

    // Schedule next track when this one ends (+ small gap)
    timerRef.current = setTimeout(playNext, (dur + 0.3) * 1000)
  }, [])

  const start = useCallback(() => {
    if (started.current) return
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return

      const ac = new AC()
      ctxRef.current = ac

      // Shuffle track order
      shuffledRef.current = [...TRACKS].sort(() => Math.random() - 0.5)
      idxRef.current = 0

      const master = ac.createGain()
      master.gain.value = 0.80
      master.connect(ac.destination)
      masterRef.current = master

      playNext()
      started.current = true
    } catch (_) {
      // AudioContext unavailable — silent failure
    }
  }, [playNext])

  const stop = useCallback(() => {
    clearTimeout(timerRef.current)
    try { ctxRef.current?.close() } catch (_) {}
    ctxRef.current  = null
    masterRef.current = null
    started.current = false
  }, [])

  return { start, stop }
}
