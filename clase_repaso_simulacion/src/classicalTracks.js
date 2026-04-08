// ── 20 iconic classical melodies · [frequencyHz, durationSeconds] ─────────────
// Ordered: upbeat/energetic first → mellow last
// Each track has an `instrument` field: 'piano' | 'strings' | 'brass' | 'flute' | 'organ'
// Tempo ~104 BPM:  Q=0.58, E=0.29, H=1.16, S=0.145, de=0.435

const Q=0.58, E=Q/2, H=Q*2, S=Q/4, de=Q*0.75

// ── Frequencies ───────────────────────────────────────────────────────────────
const C3=130.81,Cs3=138.59,D3=146.83,Ds3=155.56,E3=164.81,F3=174.61,Fs3=185.00
const G3=196.00,Gs3=207.65,A3=220.00,As3=233.08,B3=246.94
const C4=261.63,Cs4=277.18,D4=293.66,Ds4=311.13,E4=329.63,F4=349.23,Fs4=369.99
const G4=392.00,Gs4=415.30,A4=440.00,As4=466.16,B4=493.88
const C5=523.25,Cs5=554.37,D5=587.33,Ds5=622.25,E5=659.25,F5=698.46,Fs5=739.99
const G5=783.99,Gs5=830.61,A5=880.00,As5=932.33,B5=987.77
const C6=1046.50,D6=1174.66
const R=0

const TRACKS = [

  // ══ 1 · ENERGETIC ══════════════════════════════════════════════════════════
  {
    title: '5ª Sinfonía – Beethoven',
    instrument: 'brass',
    notes: [
      [R,E],[G4,E],[G4,E],[G4,E],[Ds4,H+E],
      [R,E],[F4,E],[F4,E],[F4,E],[D4,H+E],
      [R,E],[G4,E],[G4,E],[G4,E],[Ds4,Q],
      [D4,E],[D4,E],[D4,E],[B3,H+E],
      [R,E],[G3,E],[G3,E],[G4,H+E],
      [R,E],[F4,E],[F4,E],[F4,E],[D4,H+Q],
    ]
  },

  // ══ 2 ══════════════════════════════════════════════════════════════════════
  {
    title: 'Guillermo Tell – Rossini',
    instrument: 'brass',
    notes: [
      // Galloping finale
      [E5,E],[E5,E],[Fs5,E],[E5,E],[Cs5,E],[E5,E],
      [A4,Q],[R,E],[A4,E],[B4,E],[A4,E],[Fs4,E],[A4,E],
      [E4,Q],[R,E],[E5,E],[E5,E],[Fs5,E],[E5,E],[Cs5,E],[E5,E],
      [A4,Q],[R,E],[A4,E],[A5,E],[A5,E],[Gs5,E],[A5,E],[B5,Q],
      [A5,Q],[R,E],[E5,E],[E5,E],[Fs5,E],[E5,E],[Cs5,E],[E5,E],
      [A4,H],[R,Q],
    ]
  },

  // ══ 3 ══════════════════════════════════════════════════════════════════════
  {
    title: 'Aleluya – Händel',
    instrument: 'organ',
    notes: [
      [G4,Q],[G4,Q],[G4,Q],[G4,E],[A4,E],
      [B4,H],[B4,Q],[B4,Q],[B4,Q],[B4,E],[C5,E],
      [D5,H],[D5,Q],[D5,Q],[C5,Q],[B4,Q],
      [A4,Q],[G4,Q],[D5,H],
      [D5,Q],[D5,E],[C5,E],[B4,Q],[A4,Q],
      [G4,H],[R,Q],[G4,Q],
      [G4,Q],[A4,Q],[B4,Q],[C5,Q],
      [D5,H+Q],[R,Q],
    ]
  },

  // ══ 4 ══════════════════════════════════════════════════════════════════════
  {
    title: 'Oda a la Alegría – Beethoven',
    instrument: 'strings',
    notes: [
      [E4,Q],[E4,Q],[F4,Q],[G4,Q],
      [G4,Q],[F4,Q],[E4,Q],[D4,Q],
      [C4,Q],[C4,Q],[D4,Q],[E4,Q],
      [E4,de],[D4,E],[D4,H],
      [E4,Q],[E4,Q],[F4,Q],[G4,Q],
      [G4,Q],[F4,Q],[E4,Q],[D4,Q],
      [C4,Q],[C4,Q],[D4,Q],[E4,Q],
      [D4,de],[C4,E],[C4,H],
    ]
  },

  // ══ 5 ══════════════════════════════════════════════════════════════════════
  {
    title: 'Vuelo del Moscardón – Rimsky-Korsakov',
    instrument: 'flute',
    notes: [
      [B4,S],[As4,S],[A4,S],[Gs4,S],[G4,S],[Fs4,S],[F4,S],[E4,S],
      [Ds4,S],[D4,S],[Cs4,S],[C4,S],[B3,S],[As3,S],[A3,S],[Gs3,S],
      [G3,S],[A3,S],[As3,S],[B3,S],[C4,S],[Cs4,S],[D4,S],[Ds4,S],
      [E4,S],[F4,S],[Fs4,S],[G4,S],[Gs4,S],[A4,S],[As4,S],[B4,S],
      [C5,S],[B4,S],[As4,S],[A4,S],[Gs4,S],[G4,S],[Fs4,S],[F4,S],
      [E4,S],[Ds4,S],[D4,S],[Cs4,S],[C4,S],[B3,S],[As3,S],[A3,S],
      [B3,S],[As3,S],[B3,S],[Cs4,S],[D4,S],[Cs4,S],[D4,S],[Ds4,S],
      [E4,S],[Ds4,S],[E4,S],[F4,S],[Fs4,S],[G4,S],[A4,S],[B4,S],
    ]
  },

  // ══ 6 ══════════════════════════════════════════════════════════════════════
  {
    title: 'Las Cuatro Estaciones (Primavera) – Vivaldi',
    instrument: 'strings',
    notes: [
      [E5,E],[Fs5,E],[E5,E],[Cs5,E],[E5,Q],[R,E],[E5,E],
      [Fs5,E],[Gs5,E],[A5,Q],[R,E],[A5,E],
      [Gs5,E],[Fs5,E],[E5,Q],[Cs5,Q],[A4,Q],
      [A4,E],[B4,E],[Cs5,E],[E5,E],[Fs5,Q],[E5,Q],
      [E5,E],[Fs5,E],[E5,E],[Cs5,E],[E5,Q],[R,E],[E5,E],
      [A5,Q],[Gs5,Q],[Fs5,Q],[E5,H],
    ]
  },

  // ══ 7 ══════════════════════════════════════════════════════════════════════
  {
    title: 'Marcha Turca – Mozart',
    instrument: 'piano',
    notes: [
      [A4,S],[A4,S],[Gs4,S],[A4,S],[R,S],[A4,S],[R,S],[A4,S],
      [E4,E],[E4,S],[F4,S],[E4,S],[D4,S],[C4,E],[C4,S],[D4,S],
      [E4,S],[C4,S],[D4,Q],[R,E],
      [A4,S],[A4,S],[Gs4,S],[A4,S],[R,S],[A4,S],[R,S],[A4,S],
      [E4,E],[E4,S],[F4,S],[E4,S],[D4,S],[C4,E],[D4,S],[E4,S],[C4,Q],
      [A4,E],[A4,S],[G4,S],[A4,Q],[E5,E],[E5,S],[D5,S],[E5,Q],
      [A5,E],[Gs5,E],[A5,E],[E5,E],[A4,H],
    ]
  },

  // ══ 8 ══════════════════════════════════════════════════════════════════════
  {
    title: 'La Campanella – Liszt',
    instrument: 'piano',
    notes: [
      // Iconic bell-like opening
      [Gs5,E],[R,S],[Gs5,S],[R,E],[Gs5,E],[R,S],[Gs5,S],[R,E],
      [E5,Q],[Gs5,E],[R,S],[Gs5,S],[R,E],
      [Fs5,E],[R,S],[Fs5,S],[R,E],[Fs5,E],[R,S],[Fs5,S],[R,E],
      [Cs5,Q],[Fs5,E],[R,S],[Fs5,S],[R,E],
      // Descending run
      [Gs5,S],[Fs5,S],[E5,S],[Ds5,S],[Cs5,S],[B4,S],[A4,S],[Gs4,S],
      [Fs4,S],[E4,S],[Ds4,S],[Cs4,S],[B3,S],[A3,S],[Gs3,S],[Fs3,S],
      [E4,H],[R,Q],
    ]
  },

  // ══ 9 ══════════════════════════════════════════════════════════════════════
  {
    title: 'El Danubio Azul – Strauss',
    instrument: 'strings',
    notes: [
      [A4,E],[A4,E],
      [D5,Q],[A4,Q],[D5,Q],
      [C5,Q],[G4,Q],[C5,Q],
      [B4,Q],[G4,Q],[B4,Q],
      [A4,H+Q],
      [D5,Q],[A4,Q],[D5,Q],
      [Cs5,Q],[A4,Q],[Cs5,Q],
      [D5,Q],[A4,Q],[D5,Q],
      [E5,H+Q],
      [Fs5,Q],[D5,Q],[Fs5,Q],
      [E5,Q],[Cs5,Q],[E5,Q],
      [D5,H+Q],[R,Q],
    ]
  },

  // ══ 10 ═════════════════════════════════════════════════════════════════════
  {
    title: 'La Traviata (Libiamo) – Verdi',
    instrument: 'strings',
    notes: [
      [G4,Q],[C5,Q+E],[C5,E],[C5,Q],
      [E5,Q],[E5,Q+E],[Ds5,E],[E5,Q],
      [G5,Q],[G5,Q+E],[Fs5,E],[G5,Q],
      [E5,H+Q],[R,E],
      [D5,E],[D5,Q+E],[Cs5,E],[D5,Q],
      [F5,H+Q],[R,E],
      [E5,Q],[F5,Q],[E5,Q],[D5,Q],
      [C5,H],[R,Q],
    ]
  },

  // ══ 11 ═════════════════════════════════════════════════════════════════════
  {
    title: 'Marcha Nupcial – Mendelssohn',
    instrument: 'organ',
    notes: [
      [C5,Q],[C5,E],[R,E],[C5,Q],[R,Q],
      [E5,Q],[E5,E],[R,E],[E5,Q],[R,Q],
      [D5,Q],[C5,Q],[D5,H],
      [C5,Q],[B4,Q],[C5,H],
      [G4,Q],[G4,E],[R,E],[G4,Q],[R,Q],
      [B4,Q],[B4,E],[R,E],[B4,Q],[R,Q],
      [C5,Q],[B4,Q],[C5,H],[R,Q],
    ]
  },

  // ══ 12 ═════════════════════════════════════════════════════════════════════
  {
    title: 'Für Elise – Beethoven',
    instrument: 'piano',
    notes: [
      [E5,E],[Ds5,E],[E5,E],[Ds5,E],[E5,E],[B4,E],[D5,E],[C5,E],
      [A4,Q],[R,E],[C4,E],[E4,E],[A4,E],
      [B4,Q],[R,E],[E4,E],[Gs4,E],[B4,E],
      [C5,Q],[R,E],[E4,E],[E5,E],[Ds5,E],
      [E5,E],[Ds5,E],[E5,E],[B4,E],[D5,E],[C5,E],
      [A4,Q],[R,E],[C4,E],[E4,E],[A4,E],
      [B4,Q],[R,E],[E4,E],[C5,E],[B4,E],
      [A4,H],[R,Q],
    ]
  },

  // ══ 13 ═════════════════════════════════════════════════════════════════════
  {
    title: 'Canon en Re – Pachelbel',
    instrument: 'strings',
    notes: [
      [Fs5,Q],[E5,Q],[D5,Q],[Cs5,Q],
      [B4,Q],[A4,Q],[B4,Q],[Cs5,Q],
      [D5,Q],[Cs5,Q],[B4,Q],[A4,Q],
      [G4,Q],[Fs4,Q],[G4,Q],[A4,Q],
      [D5,E],[Cs5,E],[D5,E],[E5,E],[Fs5,Q],[E5,Q],
      [D5,Q],[R,E],[Fs4,E],[A4,Q],[D5,Q],
      [Fs5,Q],[E5,Q],[D5,Q],[Cs5,Q],
      [B4,H],[R,Q],
    ]
  },

  // ══ 14 ═════════════════════════════════════════════════════════════════════
  {
    title: 'Una Pequeña Música Nocturna – Mozart',
    instrument: 'strings',
    notes: [
      // Fanfare opening
      [G5,E],[G5,S],[G5,S],[D5,de],[D5,E],
      [D5,S],[D5,S],[G5,de],[R,E],
      [G5,E],[Fs5,E],[F5,E],[E5,E],[Ds5,E],[E5,E],[R,E],
      // Second phrase
      [C5,E],[C5,E],[C5,E],[C5,E],[B4,de],[R,E],
      [G4,E],[A4,E],[B4,E],[C5,Q],[D5,Q],
      [G5,H],[R,Q],
    ]
  },

  // ══ 15 ═════════════════════════════════════════════════════════════════════
  {
    title: 'Ave María – Schubert',
    instrument: 'strings',
    notes: [
      [C5,Q],[C5,E],[B4,E],[A4,H],
      [G4,Q],[R,E],[G4,E],[G4,Q],[A4,E],[B4,E],[C5,H],
      [C5,Q],[C5,E],[D5,E],[E5,H],
      [D5,Q],[R,E],[D5,E],[E5,Q],[D5,E],[C5,E],[B4,H],
      [A4,Q],[R,E],[A4,E],[B4,Q],[A4,E],[G4,E],[F4,H],
      [E4,H],[R,Q],
    ]
  },

  // ══ 16 ═════════════════════════════════════════════════════════════════════
  {
    title: 'El Lago de los Cisnes – Tchaikovsky',
    instrument: 'strings',
    notes: [
      [B4,E],[Cs5,E],[D5,E],[F5,Q+E],[E5,Q+E],[R,E],
      [D5,E],[E5,E],[F5,E],[A5,Q+E],[Gs5,H],
      [G5,E],[Fs5,E],[G5,E],[E5,H+Q],
      [D5,E],[E5,E],[D5,E],[B4,H],[R,Q],
      [A4,E],[B4,E],[A4,E],[F4,H+Q],
      [E4,H],[R,Q],
    ]
  },

  // ══ 17 ═════════════════════════════════════════════════════════════════════
  {
    title: 'Nocturno Op.9 No.2 – Chopin',
    instrument: 'piano',
    notes: [
      [As4,H],[G4,Q],[F4,E],[G4,E],
      [Ds4,H+Q],[D4,Q],
      [F4,Q],[Ds4,Q],[D4,Q],[C4,Q],
      [As3,H+H],
      [As4,H],[C5,Q],[D5,E],[C5,E],
      [As4,H+Q],[R,Q],
    ]
  },

  // ══ 18 ═════════════════════════════════════════════════════════════════════
  {
    title: 'Gymnopédie No.1 – Satie',
    instrument: 'piano',
    notes: [
      [D5,Q+E],[B4,E],[A4,Q],[R,Q],
      [D5,Q+E],[B4,E],[A4,Q],[R,Q],
      [G4,H+Q],[A4,Q],
      [B4,Q+E],[Fs4,E],[E4,Q],[R,Q],
      [G4,H+Q],[R,Q],
      [A4,Q+E],[Fs4,E],[E4,Q],[R,Q],
      [D4,H+Q],[R,Q],
    ]
  },

  // ══ 19 ═════════════════════════════════════════════════════════════════════
  {
    title: 'Sonata Claro de Luna – Beethoven',
    instrument: 'piano',
    notes: [
      [Gs4,Q],[Cs5,Q],[E5,Q],
      [Gs4,Q],[Cs5,Q],[E5,Q],
      [Fs4,Q],[Cs5,Q],[Ds5,Q],
      [Fs4,Q],[Cs5,Q],[Ds5,Q],
      [Gs4,Q],[B4,Q],[E5,Q],
      [Gs4,Q],[B4,Q],[E5,Q],
      [Gs4,Q],[Cs5,Q],[E5,Q],
      [Cs5,H+Q],[R,Q],
    ]
  },

  // ══ 20 ═════════════════════════════════════════════════════════════════════
  {
    title: 'Clair de Lune – Debussy',
    instrument: 'piano',
    notes: [
      [Cs5,E],[Ds5,E],[Cs5,E],[Gs4,de],[R,E],
      [Cs5,E],[Ds5,E],[Cs5,E],[As4,de],[R,E],
      [B4,Q],[Gs4,Q],[Fs4,H],
      [Cs5,E],[Ds5,E],[Cs5,E],[Gs4,de],[R,E],
      [As4,Q],[Gs4,Q],[Fs4,H],
      [Ds5,E],[E5,E],[Ds5,E],[B4,de],[R,E],
      [Cs5,H],[Gs4,H],
    ]
  },

]

export default TRACKS
