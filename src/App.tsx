import type { FormEvent } from 'react'
import { SPEEDS, TICK_MS } from './core/clock'
import { ageYears } from './systems/lifespan'
import { content } from './data/content'
import { useGameLoop } from './hooks/useGameLoop'
import { useGameStore } from './stores/gameStore'

const formatHours = (ticks: number) =>
  `${((ticks * TICK_MS) / 3_600_000).toFixed(1)} giờ`

/** Chọn tên và giới tính trước khi thời gian chạy (D32). Engine kiểm tra lại; lỗi hiện qua `error`. */
function IdentityForm() {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    useGameStore.getState().dispatch(
      {
        type: 'setIdentity',
        name: String(data.get('name') ?? ''),
        gender: String(data.get('gender') ?? ''),
      },
      performance.now(),
    )
  }
  return (
    <form onSubmit={onSubmit}>
      <label>
        Tên{' '}
        <input
          name="name"
          required
          maxLength={content.identity.nameMaxLength}
          autoComplete="off"
        />
      </label>
      <fieldset>
        <legend>Giới tính</legend>
        {content.identity.genders.map((g, i) => (
          <label key={g.id}>
            <input
              type="radio"
              name="gender"
              value={g.id}
              defaultChecked={i === 0}
            />{' '}
            {g.name}
          </label>
        ))}
      </fieldset>
      <button type="submit">Bắt đầu</button>
    </form>
  )
}

function App() {
  useGameLoop()
  const { game, speed, offlineTicks, error, saveError, saveBlocked } =
    useGameStore()
  const { setSpeed, dispatch, spendTichThoi } = useGameStore.getState()
  const day = (game.day % content.calendar.daysPerYear) + 1
  const identity = game.character.identity
  const reason = game.stop?.reason

  return (
    <main className="setup">
      <h1>Tu Tiên Luân Hồi</h1>
      {identity ? <p>{identity.name}</p> : <IdentityForm />}
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
      {game.stop && reason !== 'chooseIdentity' && (
        <p>
          Tạm dừng ({reason}){' '}
          {reason !== 'death' && (
            <button
              onClick={() => dispatch({ type: 'resume' }, performance.now())}
            >
              Tiếp tục
            </button>
          )}
        </p>
      )}
      {game.tichThoiTicks > 0 &&
        reason !== 'death' &&
        reason !== 'chooseIdentity' && (
          <button onClick={() => spendTichThoi(performance.now())}>
            Dùng Tích Thời ({formatHours(game.tichThoiTicks)})
          </button>
        )}
      {offlineTicks > 0 && (
        <p>Trong lúc vắng mặt: {offlineTicks} ngày đã trôi qua.</p>
      )}
      {saveBlocked && <p role="alert">Không lưu được: {saveBlocked}</p>}
      {saveError && <p role="alert">Lưu thất bại: {saveError}</p>}
      {error && <p role="alert">{error}</p>}
    </main>
  )
}

export default App
