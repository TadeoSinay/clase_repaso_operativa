import { useRef, useCallback } from 'react'

// ── Für Elise – Beethoven (tema principal, A section) ─────────────────────────
// [frequencyHz, durationSeconds]
const Q = 0.44          // quarter note
const E = Q / 2         // eighth note
const H = Q * 2         // half note

// Frecuencias de notas
const NOTE = {
  C4:261.63, E4:329.63, A4:440.00, B4:493.88,
  C5:523.25, D5:587.33, E5:659.25,
  Ds5:622.25, Gs4:415.30, _:0
}

const { C4,E4,A4,B4,C5,D5,E5,Ds5,Gs4,_ } = NOTE

// Tema A de Für Elise (se repite dos veces antes del puente)
const THEME_A = [
  [E5,E],[Ds5,E],[E5,E],[Ds5,E],[E5,E],[B4,E],[D5,E],[C5,E],
  [A4,Q],[_,E],[C4,E],[E4,E],[A4,E],
  [B4,Q],[_,E],[E4,E],[Gs4,E],[B4,E],
  [C5,Q],[_,E],[E4,E],[E5,E],[Ds5,E],
  [E5,E],[Ds5,E],[E5,E],[B4,E],[D5,E],[C5,E],
  [A4,Q],[_,E],[C4,E],[E4,E],[A4,E],
  [B4,Q],[_,E],[E4,E],[C5,E],[B4,E],
  [A4,H],[_,Q],
]

export function useAmbientMusic() {
  const ctxRef    = useRef(null)
  const timerRef  = useRef(null)
  const started   = useRef(false)

  /** Toca una nota con envelope tipo piano */
  const playNote = (ac, master, freq, startTime, dur) => {
    if (freq === 0) return   // silencio

    const osc  = ac.createOscillator()
    const gain = ac.createGain()

    // Tono piano-like: triangle suave + leve saturación
    osc.type = 'triangle'
    osc.frequency.value = freq

    // Envelope ADSR simplificado
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(0.22, startTime + 0.008)   // attack
    gain.gain.exponentialRampToValueAtTime(0.12, startTime + dur * 0.4)  // decay
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur * 0.95) // release

    osc.connect(gain)
    gain.connect(master)
    osc.start(startTime)
    osc.stop(startTime + dur + 0.05)

    // Armónico suave para enriquecer el timbre (octava arriba, muy baja)
    if (freq < 600) {
      const osc2  = ac.createOscillator()
      const gain2 = ac.createGain()
      osc2.type = 'sine'
      osc2.frequency.value = freq * 2
      gain2.gain.setValueAtTime(0, startTime)
      gain2.gain.linearRampToValueAtTime(0.06, startTime + 0.01)
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + dur * 0.8)
      osc2.connect(gain2)
      gain2.connect(master)
      osc2.start(startTime)
      osc2.stop(startTime + dur + 0.05)
    }
  }

  /** Programa una pasada de THEME_A desde `startTime` y devuelve la duración total */
  const scheduleTheme = useCallback((ac, master, startTime) => {
    let t = startTime
    for (const [freq, dur] of THEME_A) {
      playNote(ac, master, freq, t, dur)
      t += dur
    }
    return t - startTime   // duración total de la pasada
  }, [])

  const start = useCallback(() => {
    if (started.current) return
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return

      const ac = new AC()
      ctxRef.current = ac

      // Master gain con reverb mínimo simulado (dry signal + tiny delay)
      const master = ac.createGain()
      master.gain.value = 0.85
      master.connect(ac.destination)

      // Toca el tema y lo repite cada N segundos
      const dur = scheduleTheme(ac, master, ac.currentTime + 0.1)
      timerRef.current = setInterval(() => {
        scheduleTheme(ac, master, ac.currentTime + 0.05)
      }, dur * 1000 - 100)

      started.current = true
    } catch (_) {
      // AudioContext no disponible — sin música, sin error
    }
  }, [scheduleTheme])

  const stop = useCallback(() => {
    clearInterval(timerRef.current)
    try { ctxRef.current?.close() } catch (_) {}
    started.current = false
  }, [])

  return { start, stop }
}
