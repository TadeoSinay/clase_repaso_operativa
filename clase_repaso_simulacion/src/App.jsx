import { useState, useEffect, useRef, useCallback } from 'react'
import { ref, set, onValue, update } from 'firebase/database'
import confetti from 'canvas-confetti'
import { db } from './firebase.js'
import QUESTIONS from './questions.js'
import { useAmbientMusic } from './useAmbientMusic.js'
import Background3D from './Background3D.jsx'
import styles from './App.module.css'

// ── constants ─────────────────────────────────────────────────────────────────
const TIMER_SECONDS = 20
const TOTAL_Q       = QUESTIONS.length
const WRONG_PEN     = -500   // points deducted for wrong answer

const ANIMALS = ['🐶','🐱','🦊','🐭','🐰','🐻','🐼','🐨','🐯','🦁',
                 '🐮','🐷','🐸','🐵','🐧','🦆','🦉','🦄','🐝','🦋',
                 '🐬','🦒','🦓','🦘','🦔','🦦','🐙','🦀','🦈','🐲']

const OPT_COLORS = [styles.optRed, styles.optBlue, styles.optYellow, styles.optGreen]
const OPT_ICONS  = ['▲', '◆', '●', '♥']
const OPT_LABELS = ['A', 'B', 'C', 'D']

// ── session & firebase refs ───────────────────────────────────────────────────
function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
const SESSION    = todayKey()
const sessionRef = ref(db, `sessions/${SESSION}`)
const playersRef = ref(db, `sessions/${SESSION}/players`)
const statusRef  = ref(db, `sessions/${SESSION}/status`)
const hostRef    = ref(db, `sessions/${SESSION}/hostId`)
const curQRef    = ref(db, `sessions/${SESSION}/currentQuestion`)

// ── persistent player ID (survives page reloads) ──────────────────────────────
function getPid() {
  const KEY = 'utn_quiz_pid'
  let pid = localStorage.getItem(KEY)
  if (!pid) { pid = Math.random().toString(36).slice(2, 10); localStorage.setItem(KEY, pid) }
  return pid
}
const MY_PID = getPid()

// ── animal assigned to this player ───────────────────────────────────────────
function getMyAnimal() {
  const KEY = `utn_quiz_animal_${SESSION}`
  let a = localStorage.getItem(KEY)
  if (!a) { a = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]; localStorage.setItem(KEY, a) }
  return a
}
const MY_ANIMAL = getMyAnimal()

// ── global session hook ───────────────────────────────────────────────────────
function useSession() {
  const [status,  setStatus]  = useState(null)
  const [players, setPlayers] = useState([])
  const [hostId,  setHostId]  = useState(null)
  const [curQ,    setCurQ]    = useState(0)

  useEffect(() => {
    const u1 = onValue(statusRef,  s => setStatus(s.exists()  ? s.val() : 'waiting'))
    const u2 = onValue(hostRef,    s => setHostId(s.exists()  ? s.val() : null))
    const u3 = onValue(curQRef,    s => setCurQ(s.exists()    ? s.val() : 0))
    const u4 = onValue(playersRef, s => {
      if (!s.exists()) { setPlayers([]); return }
      const list = Object.entries(s.val()).map(([id, p]) => ({ id, ...p }))
      list.sort((a, b) => b.score - a.score)
      setPlayers(list)
    })
    return () => { u1(); u2(); u3(); u4() }
  }, [])

  return { status, players, hostId, curQ }
}

// ── UTN logo SVG ──────────────────────────────────────────────────────────────
function UTNLogo() {
  const spokes = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <div className={styles.logoUTN}>
      <svg viewBox="0 0 44 44" className={styles.logoSvg} aria-label="UTN logo">
        <circle cx="22" cy="22" r="20.5" stroke="#c8102e" strokeWidth="1.8" fill="none"/>
        <circle cx="22" cy="22" r="13"   stroke="#c8102e" strokeWidth="1"   fill="none"/>
        <circle cx="22" cy="22" r="2.8"  fill="#c8102e"/>
        {spokes.map(deg => {
          const rad = deg * Math.PI / 180
          const cos = Math.cos(rad)
          const sin = Math.sin(rad)
          // Spoke: inner ring → outer ring
          const x1 = 22 + cos * 5.5,  y1 = 22 + sin * 5.5
          const x2 = 22 + cos * 12.5, y2 = 22 + sin * 12.5
          // Crossbar at outer end (perpendicular, "T" shape)
          const cx1 = x2 - sin * 2.8, cy1 = y2 + cos * 2.8
          const cx2 = x2 + sin * 2.8, cy2 = y2 - cos * 2.8
          return (
            <g key={deg}>
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#c8102e" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1={cx1} y1={cy1} x2={cx2} y2={cy2}
                stroke="#c8102e" strokeWidth="1.5" strokeLinecap="round"/>
            </g>
          )
        })}
      </svg>
      <div className={styles.logoText}>
        <span className={styles.logoUTNText}>UTN<span className={styles.logoBA}>.BA</span></span>
        <span className={styles.logoRegional}>FACULTAD REGIONAL</span>
        <span className={styles.logoBA2}>BUENOS AIRES</span>
      </div>
    </div>
  )
}

// ── ranking table ─────────────────────────────────────────────────────────────
function RankingTable({ players, title, deltas = {} }) {
  return (
    <div className={styles.lbFull}>
      {title && <h3 className={styles.lbTitle}>{title}</h3>}
      <table className={styles.lbTable}>
        <thead><tr><th>#</th><th>Jugador</th><th>Puntaje</th><th>Progreso</th></tr></thead>
        <tbody>
          {players.map((p, i) => {
            const delta = deltas[p.id]
            return (
              <tr
                key={p.id}
                className={`${p.id === MY_PID ? styles.lbMe : ''} ${styles.lbRow}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <td className={styles.lbRank}>
                  {i===0?'🥇':i===1?'🥈':i===2?'🥉':<span>{i+1}</span>}
                </td>
                <td>
                  <span className={styles.lbEmoji}>{p.emoji}</span>
                  <span className={styles.lbName}>{p.name}{p.id===MY_PID?' (vos)':''}</span>
                  {delta > 0 && <span className={styles.rankUp}> ↑{delta}</span>}
                  {delta < 0 && <span className={styles.rankDown}> ↓{Math.abs(delta)}</span>}
                </td>
                <td className={styles.lbScore}>{p.score.toLocaleString()}</td>
                <td className={styles.lbProg}>
                  {p.done ? '✅' : `${p.question??0}/${TOTAL_Q}`}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 · LOGIN
// ══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onJoin }) {
  const [name, setName] = useState('')
  const inputRef = useRef()
  useEffect(() => inputRef.current?.focus(), [])

  const handleSubmit = e => {
    e.preventDefault()
    const t = name.trim()
    if (t) onJoin(t)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.loginCard}>
        <UTNLogo />
        <div className={styles.loginDivider}/>
        <h1 className={styles.logoTitle}>Quiz · Probabilidad y Estadística</h1>
        <p className={styles.logoSub}>Investigación Operativa · 4º año Ing. Industrial</p>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <input
            ref={inputRef}
            className={styles.nameInput}
            type="text"
            placeholder="Tu nombre o alias"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={30}
          />
          <button className={styles.joinBtn} type="submit" disabled={!name.trim()}>
            Unirme al quiz →
          </button>
        </form>
        <p className={styles.loginHint}>10 preguntas · 20 seg c/u · Sesión {SESSION}</p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 · WAITING ROOM
// ══════════════════════════════════════════════════════════════════════════════
function WaitingRoom({ onStart }) {
  const { players, hostId, status } = useSession()
  const isHost = hostId === MY_PID

  // All players (host included) advance when Firebase status → 'playing'
  useEffect(() => {
    if (status === 'playing') onStart()
  }, [status]) // eslint-disable-line

  const handleStart = async () => {
    await set(curQRef,   0)
    await set(statusRef, 'playing')
  }
  const handleReset = async () => {
    await set(sessionRef, { status:'waiting', players:{}, hostId, currentQuestion:0 })
  }

  return (
    <div className={styles.screen}>
      <div className={styles.waitingCard}>
        <UTNLogo />
        <h2 className={styles.waitingTitle}>Sala de espera</h2>
        <p className={styles.waitingSub}>
          {isHost ? 'Cuando estén todos, presioná Iniciar.' : 'Esperando que el profe inicie el quiz…'}
        </p>

        <p className={styles.playerCount}>
          {players.length} jugador{players.length!==1?'es':''} conectado{players.length!==1?'s':''}
        </p>

        <div className={styles.animalGrid}>
          {players.map((p, i) => (
            <div key={p.id} className={`${styles.animalSlot} ${styles.animalIn}`} style={{animationDelay:`${i*40}ms`}}>
              <span className={styles.animalEmoji}>{p.emoji}</span>
              <span className={styles.animalName}>{p.name}</span>
            </div>
          ))}
          {Array.from({length: Math.max(0, 8 - players.length)}).map((_, i) => (
            <div key={`empty-${i}`} className={styles.animalSlotEmpty}/>
          ))}
        </div>

        {isHost ? (
          <div className={styles.hostControls}>
            <p className={styles.hostBadge}>👑 Vos sos el profe — controlás el quiz</p>
            <button className={styles.startBtn} onClick={handleStart} disabled={players.length===0}>
              ▶ Iniciar quiz ({players.length} jugadores)
            </button>
            <button className={styles.resetBtn} onClick={handleReset}>🗑 Limpiar sesión</button>
          </div>
        ) : (
          <div className={styles.waitingDots}><span/><span/><span/></div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 · QUESTION
// ══════════════════════════════════════════════════════════════════════════════
function QuestionScreen({ question, qIndex, onAnswer, timeLeft, onForceAdvance }) {
  const [selected, setSelected] = useState(null)
  const { curQ } = useSession()
  const progress = timeLeft / TIMER_SECONDS
  const danger   = timeLeft <= 5

  useEffect(() => {
    if (curQ > qIndex) onForceAdvance()
  }, [curQ]) // eslint-disable-line

  const handleSelect = i => {
    if (selected !== null) return
    setSelected(i)
    onAnswer(i, timeLeft)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.progressBar}>
        <div
          className={`${styles.progressFill} ${danger ? styles.progressDanger : ''}`}
          style={{width:`${progress*100}%`, transition:'width 0.95s linear'}}
        />
      </div>

      <div className={styles.qHeader}>
        <span className={styles.qCounter}>Pregunta {qIndex+1} <span className={styles.qTotal}>/ {TOTAL_Q}</span></span>
        <span className={`${styles.timerBadge} ${danger ? styles.timerDanger : ''}`}>{timeLeft}</span>
      </div>

      <div className={styles.questionBox}>
        <p className={styles.questionText}>{question.text}</p>
      </div>

      <div className={styles.optionsGrid}>
        {question.options.map((opt, i) => (
          <button
            key={i}
            className={`${styles.optBtn} ${OPT_COLORS[i]} ${selected===i ? styles.optSelected : ''} ${selected!==null && i!==selected ? styles.optDimmed : ''}`}
            onClick={() => handleSelect(i)}
            disabled={selected !== null}
          >
            <span className={styles.optShape}>{OPT_ICONS[i]}</span>
            <span className={styles.optLabel}>{OPT_LABELS[i]})</span>
            <span className={styles.optText}>{opt}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 · FEEDBACK
// ══════════════════════════════════════════════════════════════════════════════
function FeedbackScreen({ question, selectedIndex, pointsEarned, totalScore, onShowRanking, forced }) {
  const isCorrect = !forced && selectedIndex === question.correct
  const timedOut  = selectedIndex === null || forced
  const { curQ } = useSession()

  useEffect(() => {
    if (curQ > question._idx) onShowRanking()
  }, [curQ]) // eslint-disable-line

  useEffect(() => {
    if (isCorrect) confetti({ particleCount: 100, spread: 80, origin:{y:0.6} })
  }, [isCorrect])

  const ptsSign  = pointsEarned > 0 ? '+' : ''
  const ptsClass = pointsEarned < 0 ? styles.pointsNeg : styles.pointsEarned

  return (
    <div className={`${styles.screen} ${styles.screenFeedback} ${isCorrect ? styles.bgCorrect : styles.bgWrong}`}>
      <div className={styles.feedbackCard}>
        <div className={styles.feedbackEmoji}>{timedOut?'⏰':isCorrect?'✅':'❌'}</div>
        <h2 className={styles.feedbackTitle}>
          {forced ? '¡El profe avanzó!' : timedOut ? '¡Tiempo!' : isCorrect ? '¡Correcto!' : 'Incorrecto'}
        </h2>
        {!isCorrect && !forced && (
          <p className={styles.feedbackAnswer}>
            Correcta: <strong>{OPT_LABELS[question.correct]}) {question.options[question.correct]}</strong>
          </p>
        )}
        <div className={styles.explanationBox}>
          <span className={styles.explanationIcon}>💡</span>
          <p>{question.explanation}</p>
        </div>
        <div className={styles.pointsRow}>
          <span className={ptsClass}>{ptsSign}{pointsEarned} pts</span>
          <span className={styles.totalScore}>Total: {totalScore.toLocaleString()} pts</span>
        </div>
        <button className={styles.nextBtn} onClick={onShowRanking}>
          Ver ranking →
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 · INTER-QUESTION RANKING
// ══════════════════════════════════════════════════════════════════════════════
function InterRanking({ qIndex, onNext }) {
  const { players, hostId, curQ, status } = useSession()
  const isHost   = hostId === MY_PID
  const isLast   = qIndex === TOTAL_Q - 1
  const answered = players.filter(p => (p.question ?? 0) > qIndex).length

  // Capture initial rank snapshot when this component mounts
  const initRanksRef = useRef(null)
  useEffect(() => {
    if (initRanksRef.current === null && players.length > 0) {
      initRanksRef.current = Object.fromEntries(players.map((p, i) => [p.id, i + 1]))
    }
  }, [players])

  // Calculate rank movements vs snapshot
  const rankDeltas = {}
  if (initRanksRef.current) {
    players.forEach((p, i) => {
      const prev = initRanksRef.current[p.id]
      if (prev != null) rankDeltas[p.id] = prev - (i + 1)  // positive = moved up
    })
  }

  useEffect(() => {
    if (!isHost && curQ > qIndex) onNext()
  }, [curQ]) // eslint-disable-line

  useEffect(() => {
    if (status === 'finished') onNext()
  }, [status]) // eslint-disable-line

  const handleNext = async () => {
    if (isLast) {
      await set(statusRef, 'finished')
    } else {
      await set(curQRef, qIndex + 1)
      onNext()
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.rankingCard}>
        <div className={styles.rankingHeader}>
          <h2 className={styles.rankingTitle}>📊 Ranking · Pregunta {qIndex+1}</h2>
          <p className={styles.rankingAnswered}>{answered}/{players.length} respondieron</p>
        </div>

        <RankingTable players={players} deltas={rankDeltas} />

        {isHost ? (
          <div className={styles.hostControls} style={{marginTop:'1.5rem'}}>
            <p className={styles.hostBadge}>👑 Al avanzar, TODOS pasan a la siguiente pregunta</p>
            <button className={styles.startBtn} onClick={handleNext}>
              {isLast ? '🏁 Mostrar resultados finales' : `▶ Siguiente pregunta (${qIndex+2}/${TOTAL_Q})`}
            </button>
          </div>
        ) : (
          <div style={{textAlign:'center',marginTop:'1.5rem'}}>
            <p className={styles.waitingSub}>Esperando al profe…</p>
            <div className={styles.waitingDots}><span/><span/><span/></div>
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 6 · FINAL RESULTS
// ══════════════════════════════════════════════════════════════════════════════
function ResultsScreen({ playerName, totalScore, onRestart }) {
  const { players, hostId } = useSession()
  const isHost = hostId === MY_PID

  useEffect(() => { confetti({ particleCount:200, spread:120, origin:{y:0.4} }) }, [])

  const handleRestart = async () => {
    await set(sessionRef, { status:'waiting', players:{}, hostId:MY_PID, currentQuestion:0 })
    onRestart()
  }

  const myRank = players.findIndex(p => p.id === MY_PID) + 1

  return (
    <div className={styles.screen}>
      <div className={styles.resultsCard}>
        <div className={styles.resultsTrophy}>{myRank===1?'🥇':myRank===2?'🥈':myRank===3?'🥉':'🏆'}</div>
        <h2 className={styles.resultsName}>{MY_ANIMAL} {playerName}</h2>
        <p className={styles.resultsScore}>{totalScore.toLocaleString()} <span>pts</span></p>
        {myRank > 0 && <p className={styles.resultsRank}>Puesto #{myRank} de {players.length}</p>}
        <RankingTable players={players} title="Ranking final" />
        {isHost && (
          <button className={styles.restartBtn} onClick={handleRestart}>🔄 Nueva sesión</button>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen,     setScreen]     = useState('login')
  const [playerName, setPlayerName] = useState('')
  const [qIndex,     setQIndex]     = useState(0)
  const [timeLeft,   setTimeLeft]   = useState(TIMER_SECONDS)
  const [selIdx,     setSelIdx]     = useState(null)
  const [points,     setPoints]     = useState(0)
  const [total,      setTotal]      = useState(0)
  const [forced,     setForced]     = useState(false)
  const timerRef = useRef(null)
  const music    = useAmbientMusic()

  const { status, curQ } = useSession()
  const currentQ = { ...QUESTIONS[qIndex], _idx: qIndex }

  // Global finished → results
  useEffect(() => {
    if (status === 'finished' && screen !== 'login' && screen !== 'results') {
      setScreen('results')
    }
  }, [status, screen])

  // Timer for questions
  useEffect(() => {
    if (screen !== 'question') return
    setTimeLeft(TIMER_SECONDS)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleAnswer(null, 0); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [screen, qIndex]) // eslint-disable-line

  const handleAnswer = useCallback((idx, remaining) => {
    clearInterval(timerRef.current)
    const correct = idx !== null && idx === currentQ.correct
    let pts
    if (idx === null) {
      pts = 0                                                          // timeout → no change
    } else if (correct) {
      pts = 1000 + Math.round((remaining / TIMER_SECONDS) * 1000)    // correct → speed bonus
    } else {
      pts = WRONG_PEN                                                  // wrong → penalty
    }
    const newTotal = Math.max(0, total + pts)
    setSelIdx(idx)
    setPoints(pts)
    setTotal(newTotal)
    setForced(false)
    update(ref(db, `sessions/${SESSION}/players/${MY_PID}`), {
      score: newTotal, question: qIndex + 1, done: qIndex === TOTAL_Q - 1
    })
    setScreen('feedback')
  }, [currentQ, total, qIndex])

  const handleForceAdvance = useCallback(() => {
    clearInterval(timerRef.current)
    update(ref(db, `sessions/${SESSION}/players/${MY_PID}`), {
      score: total, question: qIndex + 1, done: qIndex === TOTAL_Q - 1
    })
    setSelIdx(null)
    setPoints(0)
    setForced(true)
    setScreen('feedback')
  }, [total, qIndex])

  const handleShowRanking = () => setScreen('ranking')

  const handleNext = useCallback(() => {
    if (qIndex === TOTAL_Q - 1) {
      setScreen('results')
    } else {
      setQIndex(i => i + 1)
      setSelIdx(null)
      setForced(false)
      setScreen('question')
    }
  }, [qIndex])

  const handleJoin = async (name) => {
    music.start()
    setPlayerName(name)
    const snap = await new Promise(resolve => onValue(hostRef, resolve, { onlyOnce: true }))
    if (!snap.exists()) {
      await set(hostRef, MY_PID)
      await set(statusRef, 'waiting')
      await set(curQRef, 0)
    }
    await set(ref(db, `sessions/${SESSION}/players/${MY_PID}`), {
      name, emoji: MY_ANIMAL, score: 0, question: 0, done: false
    })
    setScreen('waiting')
  }

  const handleRestart = () => {
    setScreen('login'); setPlayerName(''); setQIndex(0)
    setTotal(0); setPoints(0); setSelIdx(null); setForced(false)
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Background3D />

      {screen === 'login' && <LoginScreen onJoin={handleJoin} />}

      {screen === 'waiting' && <WaitingRoom onStart={() => setScreen('question')} />}

      {screen === 'question' && (
        <QuestionScreen
          question={currentQ}
          qIndex={qIndex}
          onAnswer={handleAnswer}
          timeLeft={timeLeft}
          onForceAdvance={handleForceAdvance}
        />
      )}

      {screen === 'feedback' && (
        <FeedbackScreen
          question={currentQ}
          selectedIndex={selIdx}
          pointsEarned={points}
          totalScore={total}
          onShowRanking={handleShowRanking}
          forced={forced}
        />
      )}

      {screen === 'ranking' && <InterRanking qIndex={qIndex} onNext={handleNext} />}

      {screen === 'results' && (
        <ResultsScreen
          playerName={playerName}
          totalScore={total}
          onRestart={handleRestart}
        />
      )}
    </>
  )
}
