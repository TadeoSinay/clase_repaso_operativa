import { useRef, useCallback } from 'react'

export function useAmbientMusic() {
  const ctxRef   = useRef(null)
  const timerRef = useRef(null)
  const started  = useRef(false)

  const scheduleLoop = useCallback((ac, master) => {
    // C – Am – F – G (classical I–vi–IV–V)
    const CHORDS = [
      [130.81, 164.81, 196.00, 261.63],   // C major
      [110.00, 130.81, 164.81, 220.00],   // A minor
      [87.31,  110.00, 130.81, 174.61],   // F major
      [98.00,  123.47, 146.83, 196.00],   // G major
    ]
    const MELODY = [523.25, 493.88, 440.00, 392.00]   // C5 B4 A4 G4
    const DUR = 5   // seconds per chord

    const now = ac.currentTime

    CHORDS.forEach((freqs, ci) => {
      const t = now + ci * DUR

      // Pad chord
      freqs.forEach(freq => {
        const osc = ac.createOscillator()
        const g   = ac.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.05, t + 0.6)
        g.gain.setValueAtTime(0.05, t + DUR - 0.6)
        g.gain.linearRampToValueAtTime(0, t + DUR)
        osc.connect(g); g.connect(master)
        osc.start(t); osc.stop(t + DUR + 0.1)
      })

      // Gentle melody note
      const mel = ac.createOscillator()
      const mg  = ac.createGain()
      mel.type = 'sine'
      mel.frequency.value = MELODY[ci]
      mg.gain.setValueAtTime(0, t + 0.5)
      mg.gain.linearRampToValueAtTime(0.035, t + 1.0)
      mg.gain.linearRampToValueAtTime(0, t + DUR - 0.5)
      mel.connect(mg); mg.connect(master)
      mel.start(t + 0.5); mel.stop(t + DUR + 0.1)
    })

    return CHORDS.length * DUR   // total loop duration in seconds
  }, [])

  const start = useCallback(() => {
    if (started.current) return
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      const ac = new AC()
      ctxRef.current = ac

      const master = ac.createGain()
      master.gain.value = 1
      master.connect(ac.destination)

      const loopDur = scheduleLoop(ac, master)
      timerRef.current = setInterval(() => scheduleLoop(ac, master), loopDur * 1000 - 200)
      started.current = true
    } catch (e) {
      // AudioContext not available — silent fallback
    }
  }, [scheduleLoop])

  const stop = useCallback(() => {
    clearInterval(timerRef.current)
    try { ctxRef.current?.close() } catch (_) {}
    started.current = false
  }, [])

  return { start, stop }
}
