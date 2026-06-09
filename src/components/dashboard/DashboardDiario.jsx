import { useState } from 'react'
import { useMomentosConRecetas } from '../../hooks/useNutriData'
import { MomentoCard } from './MomentoCard'
import { Spinner } from '../ui/Spinner'
import { DIAS, getDiaActual } from '../../lib/utils'

const DIAS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function DashboardDiario() {
  const [diaSeleccionado, setDiaSeleccionado] = useState(getDiaActual())
  const { data: momentos, loading, error } = useMomentosConRecetas(diaSeleccionado)
  const hoy = getDiaActual()

  return (
    <div className="max-w-lg mx-auto">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-xl pt-safe">
        <div className="px-5 pt-5 pb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-1">Tu plan</p>
          <h1 className="text-2xl font-bold text-white">{DIAS[diaSeleccionado - 1]}</h1>
        </div>

        {/* Selector de días */}
        <div className="flex px-4 pb-3 gap-1.5">
          {DIAS_SHORT.map((letra, i) => {
            const num = i + 1
            const isActive = diaSeleccionado === num
            const isToday = hoy === num
            return (
              <button
                key={num}
                onClick={() => setDiaSeleccionado(num)}
                className={`flex-1 flex flex-col items-center justify-center py-2 rounded-2xl transition-all text-xs font-semibold min-h-[52px]
                  ${isActive
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-zinc-900 text-zinc-500 active:bg-zinc-800'
                  }`}
              >
                <span>{letra}</span>
                <span className={`w-1 h-1 rounded-full mt-1 transition-colors
                  ${isToday ? (isActive ? 'bg-white' : 'bg-emerald-500') : 'bg-transparent'}`}
                />
              </button>
            )
          })}
        </div>

        <div className="h-px bg-zinc-800/50" />
      </div>

      {/* Contenido */}
      <div className="px-4 pt-4">
        {error && (
          <div className="rounded-2xl bg-red-950/50 border border-red-900/50 p-4 text-sm text-red-400 mb-4">
            Error al cargar: {error.message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-3 pb-6">
            {momentos.map(m => <MomentoCard key={m.id} momento={m} />)}
          </div>
        )}
      </div>
    </div>
  )
}
