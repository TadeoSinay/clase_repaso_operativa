import { useState, useEffect, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import QUESTIONS from './questions.js'
import styles from './App.module.css'

const TIMER_SECONDS = 20
const MAX_SCORE_PER_Q = 2000
const LS_KEY = 'quiz_simulacion_scores'

// ── helpers ───────────────────────────────────────────────────────────────────
function loadScores() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] }
  catch { return [] }
}
function saveScore(name, score) {
  const scores = loadScores()
  scores.push({ name, score, date: new Date().toLocaleDateString('es-AR') })
  scores.sort((a, b) => b.score - a.score)
  localStorage.setItem(LS_KEY, JSON.stringify(scores.slice(0, 10)))
}

const OPTION_COLORS = [styles.optRed, styles.optBlue, styles.optYellow, styles.optGreen]
const OPTION_ICONS  = ['▲', '◆', '●', '♥']
const OPTION_LABELS = ['A', 'B', 'C', 'D']

// ── screens ───────────────────────────────────────────────────────────────────
function LoginScreen({ onJoin }) {
  const [name, setName] = useState('')
  const inputRef = useRef()
  useEffect(() => inputRef.current?.focus(), [])
  const handleSubmit = (e) => {
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
          <button
            className={styles.joinBtn}
            type="submit"
            disabled={!name.trim()}
          >
            Unirme al Quiz →
          </button>
        </form>
        <p className={styles.loginHint}>10 preguntas · 20 seg c/u · Pensamiento crítico</p>
      </div>
    </div>
  )
}

function QuestionScreen({ question, qIndex, total, onAnswer, timeLeft, maxTime }) {
  const [selected, setSelected] = useState(null)
  const progress = timeLeft / maxTime

  const handleSelect = (i) => {
    if (selected !== null) return
    setSelected(i)
    onAnswer(i, timeLeft)
  }

  return (
    <div className={styles.screen}>
      {/* header */}
      <div className={styles.qHeader}>
        <span className={styles.qCounter}>Pregunta {qIndex + 1} / {total}</span>
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

      {/* question */}
      <div className={styles.questionBox}>
        <p className={styles.questionText}>{question.text}</p>
      </div>

      {/* options */}
      <div className={styles.optionsGrid}>
        {question.options.map((opt, i) => (
          <button
            key={i}
            className={`${styles.optBtn} ${OPTION_COLORS[i]} ${selected === i ? styles.optSelected : ''}`}
            onClick={() => handleSelect(i)}
            disabled={selected !== null}
          >
            <span className={styles.optIcon}>{OPTION_ICONS[i]}</span>
            <span className={styles.optLabel}>{OPTION_LABELS[i]})</span>
            <span className={styles.optText}>{opt}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function FeedbackScreen({ question, selectedIndex, pointsEarned, totalScore, onNext, isLast }) {
  const isCorrect = selectedIndex === question.correct
  const timedOut  = selectedIndex === null

  useEffect(() => {
    if (isCorrect) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
    }
  }, [isCorrect])

  return (
    <div className={`${styles.screen} ${isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}>
      <div className={styles.feedbackCard}>
        <div className={styles.feedbackEmoji}>
          {timedOut ? '⏰' : isCorrect ? '✅' : '❌'}
        </div>
        <h2 className={styles.feedbackTitle}>
          {timedOut ? '¡Se acabó el tiempo!' : isCorrect ? '¡Correcto!' : 'Incorrecto'}
        </h2>

        {!isCorrect && (
          <p className={styles.feedbackAnswer}>
            La respuesta correcta era: <strong>{OPTION_LABELS[question.correct]}) {question.options[question.correct]}</strong>
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
          {isLast ? 'Ver resultados →' : 'Siguiente →'}
        </button>
      </div>
    </div>
  )
}

function ResultsScreen({ playerName, totalScore, onRestart }) {
  const scores = loadScores()

  return (
    <div className={styles.screen}>
      <div className={styles.resultsCard}>
        <div className={styles.resultsTrophy}>🏆</div>
        <h2 className={styles.resultsName}>{playerName}</h2>
        <p className={styles.resultsScore}>{totalScore} <span>puntos</span></p>
        <p className={styles.resultsMax}>sobre {QUESTIONS.length * MAX_SCORE_PER_Q} posibles</p>

        <div className={styles.leaderboard}>
          <h3 className={styles.lbTitle}>🥇 Mejores puntajes</h3>
          {scores.length === 0 ? (
            <p className={styles.lbEmpty}>Aún no hay puntajes guardados.</p>
          ) : (
            <table className={styles.lbTable}>
              <thead>
                <tr><th>#</th><th>Jugador</th><th>Puntaje</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr key={i} className={s.name === playerName && s.score === totalScore ? styles.lbHighlight : ''}>
                    <td>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                    <td>{s.name}</td>
                    <td>{s.score}</td>
                    <td>{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <button className={styles.restartBtn} onClick={onRestart}>
          Jugar de nuevo
        </button>
      </div>
    </div>
  )
}

// ── main app ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]           = useState('login')   // login | question | feedback | results
  const [playerName, setPlayerName]   = useState('')
  const [qIndex, setQIndex]           = useState(0)
  const [timeLeft, setTimeLeft]       = useState(TIMER_SECONDS)
  const [selectedIndex, setSelected]  = useState(null)
  const [pointsEarned, setPoints]     = useState(0)
  const [totalScore, setTotalScore]   = useState(0)
  const timerRef = useRef(null)

  const currentQ = QUESTIONS[qIndex]

  // timer tick
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

  const handleAnswer = useCallback((idx, remaining) => {
    clearInterval(timerRef.current)
    const correct = idx === currentQ.correct
    let pts = 0
    if (correct) {
      const speedBonus = Math.round((remaining / TIMER_SECONDS) * 1000)
      pts = 1000 + speedBonus
    }
    setSelected(idx)
    setPoints(pts)
    setTotalScore(prev => prev + pts)
    setScreen('feedback')
  }, [currentQ])

  const handleNext = () => {
    const isLast = qIndex === QUESTIONS.length - 1
    if (isLast) {
      saveScore(playerName, totalScore + pointsEarned)
      setScreen('results')
    } else {
      setQIndex(i => i + 1)
      setSelected(null)
      setScreen('question')
    }
  }

  const handleRestart = () => {
    setScreen('login')
    setPlayerName('')
    setQIndex(0)
    setTotalScore(0)
    setPoints(0)
    setSelected(null)
  }

  const handleJoin = (name) => {
    setPlayerName(name)
    setQIndex(0)
    setTotalScore(0)
    setScreen('question')
  }

  if (screen === 'login')    return <LoginScreen onJoin={handleJoin} />
  if (screen === 'question') return (
    <QuestionScreen
      question={currentQ}
      qIndex={qIndex}
      total={QUESTIONS.length}
      onAnswer={handleAnswer}
      timeLeft={timeLeft}
      maxTime={TIMER_SECONDS}
    />
  )
  if (screen === 'feedback') return (
    <FeedbackScreen
      question={currentQ}
      selectedIndex={selectedIndex}
      pointsEarned={pointsEarned}
      totalScore={totalScore}
      onNext={handleNext}
      isLast={qIndex === QUESTIONS.length - 1}
    />
  )
  if (screen === 'results')  return (
    <ResultsScreen
      playerName={playerName}
      totalScore={totalScore}
      onRestart={handleRestart}
    />
  )
}
