import { useTrackerSemanal } from '../../hooks/useNutriData'
import { Spinner } from '../ui/Spinner'

const DIAS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const HORA_EMOJI = {
  '07:00': '🌅',
  '11:00': '☀️',
  '16:00': '🍽️',
  '17:00': '🍎',
  '20:00': '🌙',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export function TrackerSemanal() {
  const { completadosSet, momentos, weekDates, loading } = useTrackerSemanal()
  const todayStr = new Date().toLocaleDateString('en-CA')
  const todayIdx = weekDates.indexOf(todayStr)

  const total = momentos.length * 7
  const completados = completadosSet.size
  const pctSemana = total > 0 ? Math.round((completados / total) * 100) : 0

  const weekRange = weekDates.length === 7
    ? `${formatDate(weekDates[0])} — ${formatDate(weekDates[6])}`
    : ''

  return (
    <div className="max-w-lg mx-auto">
      <div className="sticky top-0 z-10 bg-zinc-950 pt-safe">
        <div className="px-5 pt-5 pb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-1">Seguimiento</p>
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl font-bold text-white">Esta semana</h1>
            {!loading && total > 0 && (
              <span className="text-sm text-zinc-500">{completados}/{total}</span>
            )}
          </div>
          {weekRange && <p className="text-xs text-zinc-600 mt-0.5">{weekRange}</p>}
        </div>
        <div className="h-px bg-zinc-800/50" />
      </div>

      <div className="px-4 pt-5 pb-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Dot grid */}
            <div className="rounded-3xl bg-zinc-900 p-4">
              {/* Day headers */}
              <div className="grid grid-cols-[1.75rem_repeat(7,1fr)] mb-4">
                <span />
                {DIAS_SHORT.map((d, i) => (
                  <span
                    key={i}
                    className={`text-center text-xs font-semibold
                      ${i === todayIdx ? 'text-emerald-400' : 'text-zinc-600'}`}
                  >
                    {d}
                  </span>
                ))}
              </div>

              <div className="space-y-4">
                {momentos.map(m => {
                  const hora = m.hora?.slice(0, 5)
                  const emoji = HORA_EMOJI[hora] ?? '🕐'
                  return (
                    <div key={m.id} className="grid grid-cols-[1.75rem_repeat(7,1fr)] items-center">
                      <span className="text-base leading-none">{emoji}</span>
                      {weekDates.map((date, i) => {
                        const done = completadosSet.has(`${date}_${m.id}`)
                        const isToday = i === todayIdx
                        return (
                          <div key={date} className="flex justify-center">
                            <div className={`w-3 h-3 rounded-full transition-all
                              ${done
                                ? isToday ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-emerald-600'
                                : isToday ? 'bg-zinc-700 ring-1 ring-zinc-600' : 'bg-zinc-800'
                              }`}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Daily progress bars */}
            <div className="grid grid-cols-7 gap-1.5">
              {weekDates.map((date, i) => {
                const count = momentos.filter(m => completadosSet.has(`${date}_${m.id}`)).length
                const pct = momentos.length > 0 ? count / momentos.length : 0
                const isToday = i === todayIdx
                return (
                  <div key={date} className="flex flex-col items-center gap-2">
                    <div className="w-full h-14 bg-zinc-900 rounded-xl overflow-hidden flex items-end">
                      <div
                        className={`w-full rounded-xl transition-all duration-500 ${isToday ? 'bg-emerald-500' : 'bg-emerald-800/70'}`}
                        style={{ height: pct > 0 ? `${Math.max(pct * 100, 8)}%` : '0%' }}
                      />
                    </div>
                    <span className={`text-[10px] font-semibold ${isToday ? 'text-emerald-400' : 'text-zinc-600'}`}>
                      {count > 0 ? `${count}/${momentos.length}` : DIAS_SHORT[i]}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Adherencia */}
            <div className="rounded-2xl bg-zinc-900 px-4 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Adherencia semanal</p>
                <p className="text-sm text-zinc-300">{completados} de {total} comidas</p>
              </div>
              <span className={`text-2xl font-bold ${pctSemana >= 80 ? 'text-emerald-400' : pctSemana >= 50 ? 'text-yellow-400' : 'text-zinc-500'}`}>
                {pctSemana}%
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
