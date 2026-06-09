import { useState } from 'react'
import { useMomentosConRecetas } from '../../hooks/useNutriData'
import { MomentoCard } from './MomentoCard'
import { Spinner } from '../ui/Spinner'
import { DIAS, getDiaActual } from '../../lib/utils'

export function DashboardDiario() {
  const [diaSeleccionado, setDiaSeleccionado] = useState(getDiaActual())
  const { data: momentos, loading, error } = useMomentosConRecetas(diaSeleccionado)

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur pt-4 pb-3">
        <h1 className="text-xl font-bold text-white mb-3">NutriDashboard</h1>

        {/* Selector de días */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {DIAS.map((dia, i) => {
            const num = i + 1
            const isActive = diaSeleccionado === num
            const isToday = getDiaActual() === num
            return (
              <button
                key={dia}
                onClick={() => setDiaSeleccionado(num)}
                className={`flex flex-col items-center px-3 py-2 rounded-xl shrink-0 transition-colors text-xs
                  ${isActive
                    ? 'bg-emerald-500 text-white font-semibold'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                <span>{dia.slice(0, 3)}</span>
                {isToday && (
                  <span className={`w-1 h-1 rounded-full mt-0.5 ${isActive ? 'bg-white' : 'bg-emerald-500'}`} />
                )}
              </button>
            )
          })}
        </div>

        <p className="text-sm text-gray-400 mt-2">{DIAS[diaSeleccionado - 1]}</p>
      </div>

      {/* Contenido */}
      {error && (
        <div className="rounded-xl bg-red-900/30 border border-red-800 p-4 text-sm text-red-300">
          Error al cargar datos: {error.message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-3 mt-2">
          {momentos.map(m => <MomentoCard key={m.id} momento={m} />)}
        </div>
      )}
    </div>
  )
}
