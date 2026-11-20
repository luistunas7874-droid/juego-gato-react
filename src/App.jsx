import { useState, useEffect } from 'react'
import './App.css'

const TURN_TIME = 10 // segundos por turno

const FONDOS = [
  {
    nombre: 'Playa',
    emoji: '🏖️',
    degradado: 'linear-gradient(to bottom, #4facfe 0%, #00c6fb 55%, #f6d365 55%, #fda085 100%)',
    decor: ['🌴', '🐚', '🦀', '☀️', '🌊'],
  },
  {
    nombre: 'Bosque',
    emoji: '🌲',
    degradado: 'linear-gradient(to bottom, #134e5e, #71b280)',
    decor: ['🌲', '🌳', '🍄', '🦉', '🍃'],
  },
  {
    nombre: 'Montañas',
    emoji: '⛰️',
    degradado: 'linear-gradient(to bottom, #2c3e50, #4ca1af)',
    decor: ['⛰️', '🏔️', '🦅', '☁️', '❄️'],
  },
  {
    nombre: 'Atardecer',
    emoji: '🌅',
    degradado: 'linear-gradient(to bottom, #ff512f, #f09819, #dd2476)',
    decor: ['🌅', '🐦', '☁️', '🌴', '✨'],
  },
  {
    nombre: 'Noche',
    emoji: '🌌',
    degradado: 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)',
    decor: ['🌙', '⭐', '✨', '🦉', '🌠'],
  },
]

function Square({ value, onSquareClick, isWinning }) {
  const clases = `square ${value ? value.toLowerCase() : ''} ${isWinning ? 'winning' : ''}`
  return (
    <button className={clases} onClick={onSquareClick}>
      {value}
    </button>
  )
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ]
  for (const line of lines) {
    const [a, b, c] = line
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line }
    }
  }
  return null
}

export default function App() {
  const [squares, setSquares] = useState(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true)
  const [timeLeft, setTimeLeft] = useState(TURN_TIME)
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })
  const [fondo, setFondo] = useState(FONDOS[0])

  const result = calculateWinner(squares)
  const winner = result ? result.winner : null
  const winningLine = result ? result.line : []
  const isDraw = !winner && squares.every((s) => s !== null)
  const gameOver = Boolean(winner) || isDraw

  // Cambia el degradado de fondo cuando eliges otro tema
  useEffect(() => {
    document.body.style.backgroundImage = fondo.degradado
  }, [fondo])

  // Temporizador: baja 1 segundo cada vez; si llega a 0 pasa el turno
  useEffect(() => {
    if (gameOver) return
    const id = setTimeout(() => {
      if (timeLeft <= 1) {
        setXIsNext((x) => !x)
        setTimeLeft(TURN_TIME)
      } else {
        setTimeLeft(timeLeft - 1)
      }
    }, 1000)
    return () => clearTimeout(id)
  }, [timeLeft, gameOver])

  function handleClick(i) {
    if (squares[i] || gameOver) return
    const nextSquares = squares.slice()
    nextSquares[i] = xIsNext ? 'X' : 'O'
    setSquares(nextSquares)

    const res = calculateWinner(nextSquares)
    if (res) {
      setScores((prev) => ({ ...prev, [res.winner]: prev[res.winner] + 1 }))
    } else if (nextSquares.every((s) => s !== null)) {
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }))
    }

    setXIsNext(!xIsNext)
    setTimeLeft(TURN_TIME)
  }

  function newGame() {
    setSquares(Array(9).fill(null))
    setXIsNext(true)
    setTimeLeft(TURN_TIME)
  }

  function resetScores() {
    setScores({ X: 0, O: 0, draws: 0 })
    newGame()
  }

  let status
  if (winner) {
    status = '🏆 Ganador: ' + winner
  } else if (isDraw) {
    status = '🤝 Empate'
  } else {
    status = 'Turno de: ' + (xIsNext ? 'X' : 'O')
  }

  return (
    <>
      {/* Emojis flotando según el tema elegido */}
      <div className="decor" key={fondo.nombre}>
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="decor-item"
            style={{
              left: `${(i * 37 + 8) % 92}%`,
              top: `${(i * 53 + 5) % 88}%`,
              fontSize: `${28 + (i % 3) * 14}px`,
              animationDelay: `${(i % 5) * 0.6}s`,
              animationDuration: `${5 + (i % 4)}s`,
            }}
          >
            {fondo.decor[i % fondo.decor.length]}
          </span>
        ))}
      </div>

      <div className="game">
        <h1>Juego del Gato</h1>

        <div className="fondos">
          {FONDOS.map((f) => (
            <button
              key={f.nombre}
              className={`fondo-btn ${f.nombre === fondo.nombre ? 'activo' : ''}`}
              onClick={() => setFondo(f)}
              title={f.nombre}
            >
              {f.emoji}
            </button>
          ))}
        </div>

        <div className="scoreboard">
          <div className={`score x ${!gameOver && xIsNext ? 'active' : ''}`}>
            <span className="label">Jugador X</span>
            <span className="points">{scores.X}</span>
          </div>
          <div className="score">
            <span className="label">Empates</span>
            <span className="points">{scores.draws}</span>
          </div>
          <div className={`score o ${!gameOver && !xIsNext ? 'active' : ''}`}>
            <span className="label">Jugador O</span>
            <span className="points">{scores.O}</span>
          </div>
        </div>

        <p className="status">{status}</p>

        {!gameOver && (
          <div>
            <div className="timer-text">⏱ {timeLeft}s</div>
            <div className="timer-bar">
              <div
                className={`timer-fill ${timeLeft <= 3 ? 'danger' : ''}`}
                style={{ width: `${(timeLeft / TURN_TIME) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="board">
          {squares.map((value, i) => (
            <Square
              key={i}
              value={value}
              isWinning={winningLine.includes(i)}
              onSquareClick={() => handleClick(i)}
            />
          ))}
        </div>

        <div className="buttons">
          <button onClick={newGame}>Nueva partida</button>
          <button onClick={resetScores}>Reiniciar marcador</button>
        </div>
      </div>
    </>
  )
}