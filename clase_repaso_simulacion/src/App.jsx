import { useState, useEffect, useRef, useCallback } from 'react'
import { ref, set, onValue, update } from 'firebase/database'
import confetti from 'canvas-confetti'
import { db } from './firebase.js'
import QUESTIONS from './questions.js'
import styles from './App.module.css'

const TIMER_SECONDS = 20
const TOTAL_Q = QUESTIONS.length

function makePlayerId() {
  return Math.random().toString(36).slice(2, 10)
}
function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const SESSION      = todayKey()
const sessionRef   = ref(db, `sessions/${SESSION}`)
const playersRef   = ref(db, `sessions/${SESSION}/players`)
const statusRef    = ref(db, `sessions/${SESSION}/status`)
const hostRef      = ref(db, `sessions/${SESSION}/hostId`)
const curQRef      = ref(db, `sessions/${SESSION}/currentQuestion`)   // ← host controla esto

const OPT_COLORS = [styles.optRed, styles.optBlue, styles.optYellow, styles.optGreen]
const OPT_ICONS  = ['▲', '◆', '●', '♥']
const OPT_LABELS = ['A', 'B', 'C', 'D']

// ── Hook global ───────────────────────────────────────────────────────────────
function useSession() {
  const [status,          setStatus]          = useState(null)
  const [players,         setPlayers]         = useState([])
  const [hostId,          setHostId]          = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)   // controlado por host

  useEffect(() => {
    const u1 = onValue(statusRef,  s => setStatus(s.exists()          ? s.val() : 'waiting'))
    const u2 = onValue(hostRef,    s => setHostId(s.exists()          ? s.val() : null))
    const u3 = onValue(curQRef,    s => setCurrentQuestion(s.exists() ? s.val() : 0))
    const u4 = onValue(playersRef, s => {
      if (!s.exists()) { setPlayers([]); return }
      const list = Object.entries(s.val()).map(([id, p]) => ({ id, ...p }))
      list.sort((a, b) => b.score - a.score)
      setPlayers(list)
    })
    return () => { u1(); u2(); u3(); u4() }
  }, [])

  return { status, players, hostId, currentQuestion }
}

// ── Ranking component (reutilizado) ───────────────────────────────────────────
function RankingTable({ currentPid, players, title }) {
  if (!players.length) return null
  return (
    <div className={styles.lbFull}>
      {title && <h3 className={styles.lbTitle}>{title}</h3>}
      <table className={styles.lbTable}>
        <thead><tr><th>#</th><th>Jugador</th><th>Puntaje</th><th>Pregunta</th></tr></thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={p.id} className={p.id === currentPid ? styles.lbMe : ''}>
              <td>{i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td>
              <td>{p.name}{p.id === currentPid ? ' (vos)' : ''}</td>
              <td><strong>{p.score}</strong></td>
              <td style={{fontSize:'0.8rem', color:'rgba(240,244,255,0.5)'}}>
                {p.done ? '✅ Terminó' : `${p.question ?? 0}/${TOTAL_Q}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA 1: LOGIN
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
        <div className={styles.logoBlock}>
          <span className={styles.logoIcon}>🧠</span>
          <h1 className={styles.logoTitle}>Quiz Probabilidad</h1>
          <p className={styles.logoSub}>Investigación Operativa · UTN FRBA</p>
        </div>
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
            Unirme →
          </button>
        </form>
        <p className={styles.loginHint}>10 preguntas · 20 seg c/u · Sesión {SESSION}</p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA 2: SALA DE ESPERA
// ══════════════════════════════════════════════════════════════════════════════
function WaitingRoom({ pid, onStart }) {
  const { players, hostId, status } = useSession()
  const isHost = hostId === pid

  // Todos (host y alumnos) transicionan cuando Firebase cambia a 'playing'
  useEffect(() => {
    if (status === 'playing') onStart()
  }, [status])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = async () => {
    await set(curQRef,   0)
    await set(statusRef, 'playing')
    // NO llamar onStart() acá — lo maneja el useEffect de arriba para todos
  }
  const handleReset = async () => {
    await set(sessionRef, { status: 'waiting', players: {}, hostId, currentQuestion: 0 })
  }

  return (
    <div className={styles.screen}>
      <div className={styles.waitingCard}>
        <div className={styles.waitingHeader}>
          <span className={styles.waitingIcon}>⏳</span>
          <h2 className={styles.waitingTitle}>Sala de espera</h2>
          <p className={styles.waitingSub}>
            {isHost ? 'Cuando estén todos, presioná Iniciar.' : 'Esperando que el profe inicie el quiz…'}
          </p>
        </div>
        <div className={styles.playerList}>
          <p className={styles.playerCount}>{players.length} jugador{players.length!==1?'es':''} conectado{players.length!==1?'s':''}</p>
          <div className={styles.playerChips}>
            {players.map(p => <span key={p.id} className={styles.playerChip}>{p.name}</span>)}
          </div>
        </div>
        {isHost && (
          <div className={styles.hostControls}>
            <p className={styles.hostBadge}>👑 Vos sos el profe — controlás el quiz</p>
            <button className={styles.startBtn} onClick={handleStart} disabled={players.length === 0}>
              ▶ Iniciar quiz ({players.length} jugadores)
            </button>
            <button className={styles.resetBtn} onClick={handleReset}>🗑 Limpiar sesión</button>
          </div>
        )}
        {!isHost && <div className={styles.waitingDots}><span /><span /><span /></div>}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA 3: PREGUNTA
// ══════════════════════════════════════════════════════════════════════════════
function QuestionScreen({ question, qIndex, onAnswer, timeLeft }) {
  const [selected, setSelected] = useState(null)
  const progress = timeLeft / TIMER_SECONDS

  const handleSelect = i => {
    if (selected !== null) return
    setSelected(i)
    onAnswer(i, timeLeft)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.qHeader}>
        <span className={styles.qCounter}>Pregunta {qIndex + 1} / {TOTAL_Q}</span>
        <div className={styles.timerWrap}>
          <div className={`${styles.timerBar} ${timeLeft<=5?styles.timerDanger:''}`} style={{width:`${progress*100}%`}} />
          <span className={`${styles.timerNum} ${timeLeft<=5?styles.timerDanger:''}`}>{timeLeft}</span>
        </div>
      </div>
      <div className={styles.questionBox}>
        <p className={styles.questionText}>{question.text}</p>
      </div>
      <div className={styles.optionsGrid}>
        {question.options.map((opt, i) => (
          <button
            key={i}
            className={`${styles.optBtn} ${OPT_COLORS[i]} ${selected===i?styles.optSelected:''}`}
            onClick={() => handleSelect(i)}
            disabled={selected !== null}
          >
            <span className={styles.optIcon}>{OPT_ICONS[i]}</span>
            <span className={styles.optLabel}>{OPT_LABELS[i]})</span>
            <span className={styles.optText}>{opt}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA 4: FEEDBACK (respuesta + explicación)
// ══════════════════════════════════════════════════════════════════════════════
function FeedbackScreen({ question, selectedIndex, pointsEarned, totalScore, onShowRanking }) {
  const isCorrect = selectedIndex === question.correct
  const timedOut  = selectedIndex === null

  useEffect(() => {
    if (isCorrect) confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
  }, [isCorrect])

  return (
    <div className={`${styles.screen} ${styles.screenFeedback} ${isCorrect?styles.feedbackCorrect:styles.feedbackWrong}`}>
      <div className={styles.feedbackCard}>
        <div className={styles.feedbackEmoji}>{timedOut?'⏰':isCorrect?'✅':'❌'}</div>
        <h2 className={styles.feedbackTitle}>
          {timedOut ? '¡Tiempo!' : isCorrect ? '¡Correcto!' : 'Incorrecto'}
        </h2>
        {!isCorrect && (
          <p className={styles.feedbackAnswer}>
            Correcta: <strong>{OPT_LABELS[question.correct]}) {question.options[question.correct]}</strong>
          </p>
        )}
        <div className={styles.explanationBox}>
          <span className={styles.explanationIcon}>💡</span>
          <p>{question.explanation}</p>
        </div>
        <div className={styles.pointsRow}>
          <span className={styles.pointsEarned}>+{pointsEarned} pts</span>
          <span className={styles.totalScore}>Total: {totalScore} pts</span>
        </div>
        <button className={styles.nextBtn} onClick={onShowRanking}>
          Ver ranking →
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA 5: RANKING ENTRE PREGUNTAS (host avanza, alumnos esperan)
// ══════════════════════════════════════════════════════════════════════════════
function InterRanking({ pid, qIndex, totalScore, onNext }) {
  const { players, hostId, currentQuestion } = useSession()
  const isHost   = hostId === pid
  const isLast   = qIndex === TOTAL_Q - 1
  const answered = players.filter(p => (p.question ?? 0) > qIndex).length

  // Alumnos: cuando el host avanza currentQuestion, se van solos
  useEffect(() => {
    if (!isHost && currentQuestion > qIndex) {
      onNext()
    }
  }, [currentQuestion, isHost, qIndex, onNext])

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
          <h2 className={styles.rankingTitle}>
            📊 Ranking — Después de pregunta {qIndex + 1}
          </h2>
          <p className={styles.rankingAnswered}>
            {answered} / {players.length} respondieron
          </p>
        </div>

        <RankingTable currentPid={pid} players={players} />

        {isHost ? (
          <div className={styles.hostControls} style={{marginTop:'1.5rem'}}>
            <p className={styles.hostBadge}>👑 Cuando estés listo, avanzá</p>
            <button className={styles.startBtn} onClick={handleNext}>
              {isLast ? '🏁 Mostrar resultados finales' : `▶ Siguiente pregunta (${qIndex+2}/${TOTAL_Q})`}
            </button>
          </div>
        ) : (
          <div style={{marginTop:'1.5rem', textAlign:'center'}}>
            <p className={styles.waitingSub}>Esperando al profe para continuar…</p>
            <div className={styles.waitingDots} style={{marginTop:'0.75rem', justifyContent:'center'}}>
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA 6: RESULTADOS FINALES
// ══════════════════════════════════════════════════════════════════════════════
function ResultsScreen({ playerName, totalScore, pid, onRestart }) {
  const { players, hostId } = useSession()
  const isHost = hostId === pid

  const handleRestart = async () => {
    await set(sessionRef, { status: 'waiting', players: {}, hostId: pid, currentQuestion: 0 })
    onRestart()
  }

  return (
    <div className={styles.screen}>
      <div className={styles.resultsCard}>
        <div className={styles.resultsTrophy}>🏆</div>
        <h2 className={styles.resultsName}>{playerName}</h2>
        <p className={styles.resultsScore}>{totalScore} <span>pts</span></p>
        <p className={styles.resultsMax}>Sesión {SESSION}</p>
        <RankingTable currentPid={pid} players={players} title="Ranking final" />
        {isHost && (
          <button className={styles.restartBtn} onClick={handleRestart}>🔄 Nueva sesión</button>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [localScreen, setLocalScreen] = useState('login')
  const [playerName,  setPlayerName]  = useState('')
  const [pid]                         = useState(makePlayerId)
  const [qIndex,      setQIndex]      = useState(0)
  const [timeLeft,    setTimeLeft]    = useState(TIMER_SECONDS)
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [pointsEarned,setPoints]      = useState(0)
  const [totalScore,  setTotalScore]  = useState(0)
  const timerRef = useRef(null)

  const { status } = useSession()
  const currentQ = QUESTIONS[qIndex]

  // Forzar resultados si el profe termina el quiz mientras el alumno sigue jugando
  useEffect(() => {
    if (status === 'finished' && localScreen !== 'login' && localScreen !== 'results') {
      setLocalScreen('results')
    }
  }, [status, localScreen])

  // Timer
  useEffect(() => {
    if (localScreen !== 'quiz') return
    setTimeLeft(TIMER_SECONDS)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleAnswer(null, 0); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localScreen, qIndex])

  const handleAnswer = useCallback((idx, remaining) => {
    clearInterval(timerRef.current)
    const correct = idx === currentQ.correct
    let pts = 0
    if (correct) pts = 1000 + Math.round((remaining / TIMER_SECONDS) * 1000)
    const newTotal = totalScore + pts
    setSelectedIdx(idx)
    setPoints(pts)
    setTotalScore(newTotal)
    update(ref(db, `sessions/${SESSION}/players/${pid}`), {
      score: newTotal, question: qIndex + 1, done: qIndex === TOTAL_Q - 1
    })
    setLocalScreen('feedback')
  }, [currentQ, totalScore, pid, qIndex])

  // Ir al ranking después del feedback
  const handleShowRanking = () => setLocalScreen('ranking')

  // Host (o alumno via useEffect en InterRanking) avanza a la siguiente pregunta
  const handleNext = useCallback(() => {
    if (qIndex === TOTAL_Q - 1) {
      setLocalScreen('results')
    } else {
      setQIndex(i => i + 1)
      setSelectedIdx(null)
      setLocalScreen('quiz')
    }
  }, [qIndex])

  const handleJoin = async (name) => {
    setPlayerName(name)
    const snap = await new Promise(resolve => onValue(hostRef, resolve, { onlyOnce: true }))
    if (!snap.exists()) {
      await set(hostRef,   pid)
      await set(statusRef, 'waiting')
      await set(curQRef,   0)
    }
    await set(ref(db, `sessions/${SESSION}/players/${pid}`), {
      name, score: 0, question: 0, done: false
    })
    setLocalScreen('waiting')
  }

  const handleRestart = () => {
    setLocalScreen('login'); setPlayerName(''); setQIndex(0)
    setTotalScore(0); setPoints(0); setSelectedIdx(null)
  }

  // ── render ────────────────────────────────────────────────────────────────
  if (localScreen === 'login')
    return <LoginScreen onJoin={handleJoin} />

  if (localScreen === 'waiting')
    return <WaitingRoom pid={pid} onStart={() => setLocalScreen('quiz')} />

  if (localScreen === 'quiz')
    return <QuestionScreen question={currentQ} qIndex={qIndex} onAnswer={handleAnswer} timeLeft={timeLeft} />

  if (localScreen === 'feedback')
    return (
      <FeedbackScreen
        question={currentQ}
        selectedIndex={selectedIdx}
        pointsEarned={pointsEarned}
        totalScore={totalScore}
        onShowRanking={handleShowRanking}
      />
    )

  if (localScreen === 'ranking')
    return (
      <InterRanking
        pid={pid}
        qIndex={qIndex}
        totalScore={totalScore}
        onNext={handleNext}
      />
    )

  if (localScreen === 'results')
    return (
      <ResultsScreen
        playerName={playerName}
        totalScore={totalScore}
        pid={pid}
        onRestart={handleRestart}
      />
    )
}
