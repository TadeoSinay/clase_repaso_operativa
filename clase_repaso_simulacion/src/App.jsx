import { useState, useEffect, useRef, useCallback } from 'react'
import { ref, set, onValue, serverTimestamp } from 'firebase/database'
import confetti from 'canvas-confetti'
import { db } from './firebase.js'
import QUESTIONS from './questions.js'
import styles from './App.module.css'

const TIMER_SECONDS = 20
const TOTAL_Q = QUESTIONS.length

// ── Genera un ID único por jugador en esta sesión ─────────────────────────────
function makePlayerId() {
  return Math.random().toString(36).slice(2, 10)
}

// ── Clave de sesión = fecha del día (una sesión por clase) ────────────────────
function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const SESSION = todayKey()

// ── Helpers Firebase ──────────────────────────────────────────────────────────
function playerRef(pid) {
  return ref(db, `sessions/${SESSION}/players/${pid}`)
}

// ── Colores / íconos de opciones ──────────────────────────────────────────────
const OPT_COLORS  = [styles.optRed, styles.optBlue, styles.optYellow, styles.optGreen]
const OPT_ICONS   = ['▲', '◆', '●', '♥']
const OPT_LABELS  = ['A', 'B', 'C', 'D']

// ══════════════════════════════════════════════════════════════════════════════
//  LEADERBOARD EN TIEMPO REAL
// ══════════════════════════════════════════════════════════════════════════════
function LiveLeaderboard({ currentPid, compact = false }) {
  const [players, setPlayers] = useState([])

  useEffect(() => {
    const r = ref(db, `sessions/${SESSION}/players`)
    const unsub = onValue(r, snap => {
      if (!snap.exists()) { setPlayers([]); return }
      const list = Object.entries(snap.val()).map(([id, p]) => ({ id, ...p }))
      list.sort((a, b) => b.score - a.score)
      setPlayers(list)
    })
    return () => unsub()
  }, [])

  if (players.length === 0) return null

  return (
    <div className={compact ? styles.lbCompact : styles.lbFull}>
      {!compact && <h3 className={styles.lbTitle}>🏆 Ranking en vivo</h3>}
      <table className={styles.lbTable}>
        {!compact && (
          <thead>
            <tr><th>#</th><th>Jugador</th><th>Puntaje</th><th>Progreso</th></tr>
          </thead>
        )}
        <tbody>
          {players.map((p, i) => (
            <tr
              key={p.id}
              className={`${p.id === currentPid ? styles.lbMe : ''} ${p.done ? styles.lbDone : ''}`}
            >
              <td>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
              <td>{p.name}{p.id === currentPid ? ' (vos)' : ''}</td>
              <td><strong>{p.score}</strong></td>
              <td>
                {p.done
                  ? '✅ Terminó'
                  : `${p.question ?? 0}/${TOTAL_Q}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  PANTALLA: LOGIN
// ══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onJoin }) {
  const [name, setName] = useState('')
  const inputRef = useRef()
  useEffect(() => inputRef.current?.focus(), [])

  const handleSubmit = e => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed) onJoin(trimmed)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.loginCard}>
        <div className={styles.logoBlock}>
          <span className={styles.logoIcon}>🧠</span>
          <h1 className={styles.logoTitle}>Quiz Simulación</h1>
          <p className={styles.logoSub}>Investigación Operativa · UTN FRBA</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <input
            ref={inputRef}
            className={styles.nameInput}
            type="text"
            placeholder="Ingresá tu nombre o alias"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={30}
          />
          <button className={styles.joinBtn} type="submit" disabled={!name.trim()}>
            Unirme al Quiz →
          </button>
        </form>
        <p className={styles.loginHint}>10 preguntas · 20 seg c/u · Pensamiento crítico</p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  PANTALLA: PREGUNTA
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
//  PANTALLA: FEEDBACK
// ══════════════════════════════════════════════════════════════════════════════
function FeedbackScreen({ question, selectedIndex, pointsEarned, totalScore, onNext, isLast, pid }) {
  const isCorrect = selectedIndex === question.correct
  const timedOut  = selectedIndex === null

  useEffect(() => {
    if (isCorrect) confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
  }, [isCorrect])

  return (
    <div className={`${styles.screen} ${styles.screenFeedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}>
      <div className={styles.feedbackCard}>
        <div className={styles.feedbackEmoji}>
          {timedOut ? '⏰' : isCorrect ? '✅' : '❌'}
        </div>
        <h2 className={styles.feedbackTitle}>
          {timedOut ? '¡Se acabó el tiempo!' : isCorrect ? '¡Correcto!' : 'Incorrecto'}
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

        {/* ranking compacto mientras el alumno lee el feedback */}
        <LiveLeaderboard currentPid={pid} compact />

        <button className={styles.nextBtn} onClick={onNext}>
          {isLast ? 'Ver resultados finales →' : 'Siguiente →'}
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  PANTALLA: RESULTADOS FINALES
// ══════════════════════════════════════════════════════════════════════════════
function ResultsScreen({ playerName, totalScore, pid, onRestart }) {
  return (
    <div className={styles.screen}>
      <div className={styles.resultsCard}>
        <div className={styles.resultsTrophy}>🏆</div>
        <h2 className={styles.resultsName}>{playerName}</h2>
        <p className={styles.resultsScore}>{totalScore} <span>pts</span></p>
        <p className={styles.resultsMax}>sobre {TOTAL_Q * 2000} posibles · sesión {SESSION}</p>

        <LiveLeaderboard currentPid={pid} compact={false} />

        <button className={styles.restartBtn} onClick={onRestart}>
          Jugar de nuevo
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  APP PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen]         = useState('login')
  const [playerName, setPlayerName] = useState('')
  const [pid]                       = useState(makePlayerId)
  const [qIndex, setQIndex]         = useState(0)
  const [timeLeft, setTimeLeft]     = useState(TIMER_SECONDS)
  const [selectedIndex, setSelected]= useState(null)
  const [pointsEarned, setPoints]   = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const timerRef = useRef(null)

  const currentQ = QUESTIONS[qIndex]

  // ── timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'question') return
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
  }, [screen, qIndex])

  // ── responder ─────────────────────────────────────────────────
  const handleAnswer = useCallback((idx, remaining) => {
    clearInterval(timerRef.current)
    const correct = idx === currentQ.correct
    let pts = 0
    if (correct) {
      const speedBonus = Math.round((remaining / TIMER_SECONDS) * 1000)
      pts = 1000 + speedBonus
    }
    const newTotal = totalScore + pts
    setSelected(idx)
    setPoints(pts)
    setTotalScore(newTotal)

    // actualizar Firebase en tiempo real
    set(playerRef(pid), {
      name: playerName,
      score: newTotal,
      question: qIndex + 1,
      done: false,
      updatedAt: serverTimestamp()
    })

    setScreen('feedback')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ, totalScore, pid, playerName, qIndex])

  // ── siguiente pregunta ────────────────────────────────────────
  const handleNext = () => {
    const isLast = qIndex === TOTAL_Q - 1
    if (isLast) {
      // marcar como terminado en Firebase
      set(playerRef(pid), {
        name: playerName,
        score: totalScore,
        question: TOTAL_Q,
        done: true,
        updatedAt: serverTimestamp()
      })
      setScreen('results')
    } else {
      setQIndex(i => i + 1)
      setSelected(null)
      setScreen('question')
    }
  }

  // ── join ──────────────────────────────────────────────────────
  const handleJoin = name => {
    setPlayerName(name)
    setQIndex(0)
    setTotalScore(0)

    // registrar en Firebase
    set(playerRef(pid), {
      name,
      score: 0,
      question: 0,
      done: false,
      updatedAt: serverTimestamp()
    })

    setScreen('question')
  }

  // ── restart ───────────────────────────────────────────────────
  const handleRestart = () => {
    setScreen('login')
    setPlayerName('')
    setQIndex(0)
    setTotalScore(0)
    setPoints(0)
    setSelected(null)
  }

  if (screen === 'login')    return <LoginScreen onJoin={handleJoin} />
  if (screen === 'question') return (
    <QuestionScreen
      question={currentQ}
      qIndex={qIndex}
      onAnswer={handleAnswer}
      timeLeft={timeLeft}
    />
  )
  if (screen === 'feedback') return (
    <FeedbackScreen
      question={currentQ}
      selectedIndex={selectedIndex}
      pointsEarned={pointsEarned}
      totalScore={totalScore}
      onNext={handleNext}
      isLast={qIndex === TOTAL_Q - 1}
      pid={pid}
    />
  )
  if (screen === 'results') return (
    <ResultsScreen
      playerName={playerName}
      totalScore={totalScore}
      pid={pid}
      onRestart={handleRestart}
    />
  )
}
