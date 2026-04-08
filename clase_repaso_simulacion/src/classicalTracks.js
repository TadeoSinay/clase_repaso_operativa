// ── 20 Classical melodies encoded as [frequencyHz, durationSeconds] ──────────
// Durations at ~108 BPM: Q=quarter=0.555, E=eighth=0.278, H=half=1.11, S=16th=0.139
const Q=0.55, E=Q/2, H=Q*2, W=Q*4, S=Q/4, de=Q*0.75

// Frequencies
const C4=261.63,Cs4=277.18,D4=293.66,Ds4=311.13,E4=329.63,F4=349.23
const Fs4=369.99,G4=392.00,Gs4=415.30,A4=440.00,As4=466.16,B4=493.88
const C5=523.25,Cs5=554.37,D5=587.33,Ds5=622.25,E5=659.25,F5=698.46
const Fs5=739.99,G5=783.99,Gs5=830.61,A5=880.00,As5=932.33,B5=987.77
const C6=1046.50,D6=1174.66,E6=1318.51
const B3=246.94,A3=220.00,G3=196.00,F3=174.61,E3=164.81,D3=146.83,C3=130.81
const R=0  // rest

const TRACKS = [
  {
    title: 'Für Elise – Beethoven',
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
  {
    title: 'Oda a la Alegría – Beethoven',
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
  {
    title: 'Canon en Re – Pachelbel',
    notes: [
      [Fs5,Q],[E5,Q],[D5,Q],[Cs5,Q],
      [B4,Q],[A4,Q],[B4,Q],[Cs5,Q],
      [D5,Q],[Cs5,Q],[B4,Q],[A4,Q],
      [G4,Q],[Fs4,Q],[G4,Q],[A4,Q],
      [D5,E],[E5,E],[Fs5,E],[G5,E],[Fs5,Q],[E5,Q],
      [D5,Q],[R,E],[Fs4,E],[A4,Q],[D5,Q],
    ]
  },
  {
    title: 'Una Pequeña Música Nocturna – Mozart',
    notes: [
      [G5,E],[G5,S],[G5,S],[Ds5,de],[D5,E],
      [D5,S],[D5,S],[C5,de],[B4,E],
      [C5,E],[G4,E],[C5,E],[E5,E],[G5,de],[R,E],
      [G5,E],[Fs5,E],[F5,E],[E5,E],[Ds5,E],[E5,Q],[R,E],
      [Gs4,E],[C5,E],[Ds5,E],[E5,de],[R,E],
    ]
  },
  {
    title: 'Sonata Claro de Luna – Beethoven',
    notes: [
      [Gs4,Q],[Cs5,Q],[E5,Q],[Gs4,Q],[Cs5,Q],[E5,Q],
      [Fs4,Q],[Cs5,Q],[Ds5,Q],[Fs4,Q],[Cs5,Q],[Ds5,Q],
      [Gs4,Q],[B4,Q],[E5,Q],[Gs4,Q],[B4,Q],[E5,Q],
      [Gs4,Q],[Cs5,Q],[E5,Q],[Cs5,H+Q],
    ]
  },
  {
    title: 'Aleluya – Händel',
    notes: [
      [G4,Q],[G4,Q],[G4,Q],[G4,E],[A4,E],
      [B4,H],[B4,Q],[B4,Q],[B4,Q],[B4,E],[C5,E],
      [D5,H],[D5,Q],[D5,Q],[C5,Q],[B4,Q],
      [A4,Q],[G4,Q],[D5,H+Q],
      [D5,Q],[D5,E],[C5,E],[B4,Q],[A4,Q],
      [G4,H+Q],[R,Q],
    ]
  },
  {
    title: 'Las Cuatro Estaciones (Primavera) – Vivaldi',
    notes: [
      [E5,E],[Fs5,E],[E5,E],[Cs5,E],[E5,Q],[R,E],[E5,E],
      [Fs5,E],[Gs5,E],[A5,Q],[R,E],[A5,E],
      [Gs5,E],[Fs5,E],[E5,Q],[R,E],[Cs5,E],
      [D5,E],[E5,E],[Cs5,Q],[B4,Q],[A4,Q],
    ]
  },
  {
    title: 'Marcha Turca – Mozart',
    notes: [
      [A4,S],[A4,S],[Gs4,S],[A4,S],[R,S],[A4,S],[R,S],[A4,S],
      [E4,E],[E4,S],[F4,S],[E4,S],[D4,S],[C4,E],[C4,S],[D4,S],
      [E4,S],[C4,S],[D4,Q],[R,E],
      [A4,S],[A4,S],[Gs4,S],[A4,S],[R,S],[A4,S],[R,S],[A4,S],
      [E4,E],[E4,S],[F4,S],[E4,S],[D4,S],[C4,E],[D4,S],[E4,S],[C4,H],
    ]
  },
  {
    title: 'Nocturno Op.9 No.2 – Chopin',
    notes: [
      [As4,H],[G4,Q],[F4,E],[G4,E],
      [Ds4,H+Q],[D4,Q],
      [F4,Q],[Ds4,Q],[D4,Q],[C4,Q],
      [As3,H+H],
    ]
  },
  {
    title: 'Gymnopédie No.1 – Satie',
    notes: [
      [D5,Q+E],[B4,E],[A4,Q],
      [D5,Q+E],[B4,E],[A4,Q],
      [G4,H+Q],[A4,Q],
      [B4,Q+E],[Fs4,E],[E4,Q],
      [G4,H+Q],[R,Q],
    ]
  },
  {
    title: 'El Lago de los Cisnes – Tchaikovsky',
    notes: [
      [B4,E],[Cs5,E],[D5,E],[F5,Q+E],[E5,Q+E],[R,E],
      [D5,E],[E5,E],[F5,E],[A5,Q+E],[Gs5,H],
      [G5,E],[Fs5,E],[G5,E],[E5,H+Q],
      [D5,E],[E5,E],[D5,E],[B4,H],[R,Q],
    ]
  },
  {
    title: 'La Campanella – Liszt',
    notes: [
      [Gs5,E],[R,E],[Gs5,E],[R,E],[Gs5,Q],
      [E5,E],[R,S],[E5,S],[Gs5,Q],[R,Q],
      [Cs5,E],[R,E],[Cs5,E],[R,E],[Cs5,Q],
      [Gs4,E],[R,S],[Gs4,S],[Cs5,Q],[R,Q],
      [Gs5,E],[R,S],[Gs5,S],[Fs5,E],[E5,E],[Ds5,E],[E5,H],
    ]
  },
  {
    title: 'La Traviata (Brindis) – Verdi',
    notes: [
      [G4,Q],[C5,Q+E],[C5,E],[C5,Q],
      [E5,Q],[E5,Q+E],[Ds5,E],[E5,Q],
      [G5,Q],[G5,Q+E],[Fs5,E],[G5,Q],
      [E5,H+Q],[R,Q],
      [D5,Q],[D5,Q+E],[Cs5,E],[D5,Q],
      [F5,H+Q],[R,Q],
    ]
  },
  {
    title: 'Guillermo Tell (obertura) – Rossini',
    notes: [
      [E5,E],[E5,E],[Fs5,E],[E5,E],[Cs5,E],[E5,E],
      [A4,Q],[R,E],[A4,E],[B4,E],[A4,E],[Fs4,E],[A4,E],
      [E4,Q],[R,E],[E5,E],[E5,E],[Fs5,E],[E5,E],[Cs5,E],[E5,E],
      [A4,Q],[R,E],[A4,E],[A5,E],[A5,E],[Gs5,E],[A5,E],[B5,Q],
    ]
  },
  {
    title: 'Clair de Lune – Debussy',
    notes: [
      [Cs5,E],[Ds5,E],[Cs5,E],[Gs4,de],[R,E],
      [Cs5,E],[Ds5,E],[Cs5,E],[As4,de],[R,E],
      [B4,Q],[Gs4,Q],[Fs4,H],
      [Cs5,E],[Ds5,E],[Cs5,E],[Gs4,de],[R,E],
      [As4,Q],[Gs4,Q],[Fs4,H],
    ]
  },
  {
    title: 'Ave María – Schubert',
    notes: [
      [C5,Q],[C5,E],[B4,E],[A4,H],
      [G4,Q],[R,E],[G4,E],[G4,Q],[A4,E],[B4,E],[C5,H],
      [C5,Q],[C5,E],[D5,E],[E5,H],
      [D5,Q],[R,E],[D5,E],[E5,Q],[D5,E],[C5,E],[B4,H],
    ]
  },
  {
    title: 'Marcha Nupcial – Mendelssohn',
    notes: [
      [C5,Q],[C5,E],[R,E],[C5,Q],[R,Q],
      [E5,Q],[E5,E],[R,E],[E5,Q],[R,Q],
      [D5,Q],[C5,Q],[D5,H],
      [C5,Q],[B4,Q],[C5,H],
      [G4,Q],[G4,E],[R,E],[G4,Q],[R,Q],
      [E5,Q],[E5,E],[R,E],[E5,Q],[R,Q],
    ]
  },
  {
    title: 'Minueto en Sol – Bach/Petzold',
    notes: [
      [G5,Q],[A5,Q],[B5,Q],[C6,Q],
      [D5,H+Q],[G5,Q],
      [A5,Q],[B5,Q],[G5,H],
      [E5,H],[Fs5,Q],[G5,Q],
      [A5,Q],[Fs5,H],[G5,Q],
      [A5,Q],[B5,Q],[G5,Q],[A5,Q],
      [D5,H+Q],[R,Q],
    ]
  },
  {
    title: 'Vuelo del Moscardón – Rimsky-Korsakov',
    notes: [
      [B4,S],[As4,S],[A4,S],[Gs4,S],[G4,S],[Fs4,S],[F4,S],[E4,S],
      [Ds4,S],[D4,S],[Cs4,S],[C4,S],[B3,S],[As3,S],[A3,S],[Gs3,S],
      [G3,S],[A3,S],[As3,S],[B3,S],[C4,S],[Cs4,S],[D4,S],[Ds4,S],
      [E4,S],[F4,S],[Fs4,S],[G4,S],[Gs4,S],[A4,S],[As4,S],[B4,S],
      [C5,S],[B4,S],[As4,S],[A4,S],[Gs4,S],[G4,S],[Fs4,S],[F4,S],
      [E4,S],[Ds4,S],[D4,S],[Cs4,S],[C4,S],[B3,S],[As3,S],[A3,S],
    ]
  },
  {
    title: 'Sinfonía del Juguete – Haydn',
    notes: [
      [C5,Q],[E5,Q],[G5,Q],[E5,Q],
      [C5,Q],[E5,Q],[G5,H],
      [D5,Q],[F5,Q],[A5,Q],[F5,Q],
      [D5,Q],[F5,Q],[A5,H],
      [E5,Q],[G5,Q],[C6,Q],[G5,Q],
      [E5,Q],[C5,Q],[E5,Q],[G5,Q],
      [C5,H+Q],[R,Q],
    ]
  },
]

export default TRACKS
