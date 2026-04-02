import { useState, useEffect, useRef, useCallback } from 'react'
import { ref, set, onValue, update, serverTimestamp } from 'firebase/database'
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
const SESSION = todayKey()
const sessionRef = ref(db, `sessions/${SESSION}`)
const playersRef = ref(db, `sessions/${SESSION}/players`)
const statusRef  = ref(db, `sessions/${SESSION}/status`)

const OPT_COLORS = [styles.optRed, styles.optBlue, styles.optYellow, styles.optGreen]
const OPT_ICONS  = ['▲', '◆', '●', '♥']
const OPT_LABELS = ['A', 'B', 'C', 'D']

// ── Hook: estado global de la sesión ──────────────────────────────────────────
function useSession() {
  const [status, setStatus]   = useState(null)   // 'waiting' | 'playing' | 'finished'
  const [players, setPlayers] = useState([])

  useEffect(() => {
    const unsubStatus = onValue(statusRef, snap => {
      setStatus(snap.exists() ? snap.val() : 'waiting')
    })
    const unsubPlayers = onValue(playersRef, snap => {
      if (!snap.exists()) { setPlayers([]); return }
      const list = Object.entries(snap.val()).map(([id, p]) => ({ id, ...p }))
      list.sort((a, b) => b.score - a.score)
      setPlayers(list)
    })
    return () => { unsubStatus(); unsubPlayers() }
  }, [])

  return { status, players }
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
function Leaderboard({ currentPid, compact = false }) {
  const { players } = useSession()
  if (!players.length) return null
  return (
    <div className={compact ? styles.lbCompact : styles.lbFull}>
      {!compact && <h3 className={styles.lbTitle}>🏆 Ranking final</h3>}
      <table className={styles.lbTable}>
        {!compact && (
          <thead><tr><th>#</th><th>Jugador</th><th>Puntaje</th><th>Estado</th></tr></thead>
        )}
        <tbody>
          {players.map((p, i) => (
            <tr key={p.id} className={p.id === currentPid ? styles.lbMe : ''}>
              <td>{i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td>
              <td>{p.name}{p.id === currentPid ? ' (vos)' : ''}</td>
              <td><strong>{p.score}</strong></td>
              <td>{p.done ? '✅' : `${p.question ?? 0}/${TOTAL_Q}`}</td>
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
  const [name, setName]     = useState('')
  const [isHost, setIsHost] = useState(false)
  const inputRef = useRef()
  useEffect(() => inputRef.current?.focus(), [])

  const handleSubmit = e => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed) onJoin(trimmed, isHost)
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
          <label className={styles.hostToggle}>
            <input
              type="checkbox"
              checked={isHost}
              onChange={e => setIsHost(e.target.checked)}
            />
            <span>Soy el profe (control del quiz)</span>
          </label>
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
function WaitingRoom({ isHost, onStart }) {
  const { players } = useSession()

  const handleStart = async () => {
    await set(statusRef, 'playing')
    onStart()
  }

  const handleReset = async () => {
    await set(sessionRef, { status: 'waiting', players: {} })
  }

  return (
    <div className={styles.screen}>
      <div className={styles.waitingCard}>
        <div className={styles.waitingHeader}>
          <span className={styles.waitingIcon}>⏳</span>
          <h2 className={styles.waitingTitle}>Sala de espera</h2>
          <p className={styles.waitingSub}>
            {isHost
              ? 'Cuando estén todos, presioná Iniciar.'
              : 'Esperando que el profe inicie el quiz…'}
          </p>
        </div>

        <div className={styles.playerList}>
          <p className={styles.playerCount}>{players.length} jugador{players.length !== 1 ? 'es' : ''} conectado{players.length !== 1 ? 's' : ''}</p>
          <div className={styles.playerChips}>
            {players.map(p => (
              <span key={p.id} className={styles.playerChip}>{p.name}</span>
            ))}
          </div>
        </div>

        {isHost && (
          <div className={styles.hostControls}>
            <button className={styles.startBtn} onClick={handleStart} disabled={players.length === 0}>
              ▶ Iniciar quiz ({players.length} jugadores)
            </button>
            <button className={styles.resetBtn} onClick={handleReset}>
              🗑 Limpiar sesión
            </button>
          </div>
        )}

        {!isHost && (
          <div className={styles.waitingDots}>
            <span /><span /><span />
          </div>
        )}
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
          <div
            className={`${styles.timerBar} ${timeLeft <= 5 ? styles.timerDanger : ''}`}
            style={{ width: `${progress * 100}%` }}
          />
          <span className={`${styles.timerNum} ${timeLeft <= 5 ? styles.timerDanger : ''}`}>
            {timeLeft}
          </span>
        </div>
      </div>

      <div className={styles.questionBox}>
        <p className={styles.questionText}>{question.text}</p>
      </div>

      <div className={styles.optionsGrid}>
        {question.options.map((opt, i) => (
          <button
            key={i}
            className={`${styles.optBtn} ${OPT_COLORS[i]} ${selected === i ? styles.optSelected : ''}`}
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
// PANTALLA 4: FEEDBACK
// ══════════════════════════════════════════════════════════════════════════════
function FeedbackScreen({ question, selectedIndex, pointsEarned, totalScore, onNext, isLast }) {
  const isCorrect = selectedIndex === question.correct
  const timedOut  = selectedIndex === null

  useEffect(() => {
    if (isCorrect) confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
  }, [isCorrect])

  return (
    <div className={`${styles.screen} ${styles.screenFeedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}>
      <div className={styles.feedbackCard}>
        <div className={styles.feedbackEmoji}>{timedOut ? '⏰' : isCorrect ? '✅' : '❌'}</div>
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
        <button className={styles.nextBtn} onClick={onNext}>
          {isLast ? 'Finalizar →' : 'Siguiente →'}
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA 5: ESPERAR FIN (alumno terminó, espera al profe)
// ══════════════════════════════════════════════════════════════════════════════
function WaitingEnd({ playerName, totalScore, pid, isHost }) {
  const { players } = useSession()
  const done = players.filter(p => p.done).length

  const handleFinish = async () => {
    await set(statusRef, 'finished')
  }

  return (
    <div className={styles.screen}>
      <div className={styles.waitingCard}>
        <span className={styles.waitingIcon}>🎯</span>
        <h2 className={styles.waitingTitle}>¡Terminaste!</h2>
        <p className={styles.waitingSub}>{playerName} · {totalScore} pts</p>
        <p className={styles.playerCount}>{done} / {players.length} jugadores terminaron</p>

        <div className={styles.playerChips} style={{marginTop:'0.5rem'}}>
          {players.map(p => (
            <span key={p.id} className={`${styles.playerChip} ${p.done ? styles.chipDone : styles.chipPending}`}>
              {p.done ? '✅' : '⏳'} {p.name}
            </span>
          ))}
        </div>

        {isHost && (
          <button className={styles.startBtn} style={{marginTop:'1.5rem'}} onClick={handleFinish}>
            🏁 Mostrar resultados a todos
          </button>
        )}
        {!isHost && (
          <div className={styles.waitingDots} style={{marginTop:'1.5rem'}}>
            <span /><span /><span />
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA 6: RESULTADOS FINALES
// ══════════════════════════════════════════════════════════════════════════════
function ResultsScreen({ playerName, totalScore, pid, isHost, onRestart }) {
  const handleRestart = async () => {
    await set(sessionRef, { status: 'waiting', players: {} })
    onRestart()
  }

  return (
    <div className={styles.screen}>
      <div className={styles.resultsCard}>
        <div className={styles.resultsTrophy}>🏆</div>
        <h2 className={styles.resultsName}>{playerName}</h2>
        <p className={styles.resultsScore}>{totalScore} <span>pts</span></p>
        <Leaderboard currentPid={pid} compact={false} />
        {isHost && (
          <button className={styles.restartBtn} onClick={handleRestart}>
            🔄 Nueva sesión
          </button>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [localScreen, setLocalScreen] = useState('login')  // login | waiting | quiz | feedback | waitingEnd
  const [playerName, setPlayerName]   = useState('')
  const [isHost, setIsHost]           = useState(false)
  const [pid]                         = useState(makePlayerId)
  const [qIndex, setQIndex]           = useState(0)
  const [timeLeft, setTimeLeft]       = useState(TIMER_SECONDS)
  const [selectedIndex, setSelected]  = useState(null)
  const [pointsEarned, setPoints]     = useState(0)
  const [totalScore, setTotalScore]   = useState(0)
  const timerRef = useRef(null)

  const { status } = useSession()
  const currentQ = QUESTIONS[qIndex]

  // Reaccionar a cambios globales del estado de la sesión
  useEffect(() => {
    if (localScreen === 'login') return
    if (status === 'playing' && localScreen === 'waiting') {
      setLocalScreen('quiz')
    }
    if (status === 'finished' && (localScreen === 'quiz' || localScreen === 'feedback' || localScreen === 'waitingEnd')) {
      setLocalScreen('results')
    }
  }, [status, localScreen])

  // Timer de pregunta
  useEffect(() => {
    if (localScreen !== 'quiz') return
    setTimeLeft(TIMER_SECONDS)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleAnswer(null, 0)
          return 0
        }
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
    setSelected(idx)
    setPoints(pts)
    setTotalScore(newTotal)

    update(ref(db, `sessions/${SESSION}/players/${pid}`), {
      score: newTotal,
      question: qIndex + 1,
      done: false,
    })
    setLocalScreen('feedback')
  }, [currentQ, totalScore, pid, qIndex])

  const handleNext = () => {
    const isLast = qIndex === TOTAL_Q - 1
    if (isLast) {
      update(ref(db, `sessions/${SESSION}/players/${pid}`), { done: true })
      setLocalScreen('waitingEnd')
    } else {
      setQIndex(i => i + 1)
      setSelected(null)
      setLocalScreen('quiz')
    }
  }

  const handleJoin = (name, host) => {
    setPlayerName(name)
    setIsHost(host)
    set(ref(db, `sessions/${SESSION}/players/${pid}`), {
      name, score: 0, question: 0, done: false
    })
    if (!host && status === null) {
      set(statusRef, 'waiting')
    }
    setLocalScreen('waiting')
  }

  const handleRestart = () => {
    setLocalScreen('login')
    setPlayerName('')
    setIsHost(false)
    setQIndex(0)
    setTotalScore(0)
    setPoints(0)
    setSelected(null)
  }

  // ── render ──────────────────────────────────────────────────────
  if (localScreen === 'login')
    return <LoginScreen onJoin={handleJoin} />

  if (localScreen === 'waiting')
    return <WaitingRoom isHost={isHost} onStart={() => setLocalScreen('quiz')} />

  if (localScreen === 'quiz')
    return <QuestionScreen question={currentQ} qIndex={qIndex} onAnswer={handleAnswer} timeLeft={timeLeft} />

  if (localScreen === 'feedback')
    return (
      <FeedbackScreen
        question={currentQ}
        selectedIndex={selectedIndex}
        pointsEarned={pointsEarned}
        totalScore={totalScore}
        onNext={handleNext}
        isLast={qIndex === TOTAL_Q - 1}
      />
    )

  if (localScreen === 'waitingEnd')
    return <WaitingEnd playerName={playerName} totalScore={totalScore} pid={pid} isHost={isHost} />

  if (localScreen === 'results')
    return (
      <ResultsScreen
        playerName={playerName}
        totalScore={totalScore}
        pid={pid}
        isHost={isHost}
        onRestart={handleRestart}
      />
    )
}
