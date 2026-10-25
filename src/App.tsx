import { SPEEDS, TICK_MS } from './core/clock'
import { ageYears } from './core/state'
import { content } from './data/content'
import { useGameLoop } from './hooks/useGameLoop'
import { useGameStore } from './stores/gameStore'

const formatHours = (ticks: number) =>
  `${((ticks * TICK_MS) / 3_600_000).toFixed(1)} giờ`

function App() {
  useGameLoop()
  const { game, speed, offlineTicks, error } = useGameStore()
  const { setSpeed, dispatch, spendTichThoi } = useGameStore.getState()
  const day = (game.day % content.calendar.daysPerYear) + 1

  return (
    <main className="setup">
      <h1>Tu Tiên Luân Hồi</h1>
      <p>
        Tuổi {ageYears(game, content)} · ngày {day}
      </p>
      <div>
        {SPEEDS.map((s) => (
          <button
            key={s}
            aria-pressed={s === speed}
            onClick={() => setSpeed(s, performance.now())}
          >
            {s}×
          </button>
        ))}
      </div>
      {game.stop && (
        <p>
          Tạm dừng ({game.stop.reason}){' '}
          <button onClick={() => dispatch({ type: 'resume' })}>Tiếp tục</button>
        </p>
      )}
      {game.tichThoiTicks > 0 && (
        <button onClick={spendTichThoi}>
          Dùng Tích Thời ({formatHours(game.tichThoiTicks)})
        </button>
      )}
      {offlineTicks > 0 && (
        <p>Trong lúc vắng mặt: {offlineTicks} ngày đã trôi qua.</p>
      )}
      {error && <p role="alert">{error}</p>}
    </main>
  )
}

export default App
