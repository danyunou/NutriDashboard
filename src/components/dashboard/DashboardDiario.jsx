import { useState, useEffect } from 'react'
import { useMomentosConRecetas, useSubstitutions, useCompletedMeals } from '../../hooks/useNutriData'
import { MomentoCard } from './MomentoCard'
import { Spinner } from '../ui/Spinner'
import { DIAS, getDiaActual } from '../../lib/utils'
import { supabase } from '../../lib/supabaseClient'
import { downloadNutriICS } from '../../lib/icsGenerator'
import { useUser } from '../../hooks/useAuth'
import { Download } from 'lucide-react'

const DIAS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function DashboardDiario() {
  const [diaSeleccionado, setDiaSeleccionado] = useState(getDiaActual())
  const [highlightedHora, setHighlightedHora] = useState(null)
  const { data: momentos, loading, error } = useMomentosConRecetas(diaSeleccionado)
  const hoy = getDiaActual()
  const dayStr = DIAS[diaSeleccionado - 1]

  const user = useUser()
  const { substitutions, setSubstitutions } = useSubstitutions(dayStr)
  const { completedMeals, toggleComplete } = useCompletedMeals()

  // Listen for notification click → switch to today + highlight the meal
  useEffect(() => {
    function handler(e) {
      setDiaSeleccionado(getDiaActual())
      setHighlightedHora(e.detail.hora)
    }
    window.addEventListener('nutri-navigate', handler)
    return () => window.removeEventListener('nutri-navigate', handler)
  }, [])

  // Scroll to highlighted card once momentos are loaded
  useEffect(() => {
    if (!highlightedHora || loading) return
    const id = `momento-h${highlightedHora.replace(':', '')}`
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const timer = setTimeout(() => setHighlightedHora(null), 6000)
    return () => clearTimeout(timer)
  }, [highlightedHora, loading])

  async function handleSwap(momentoId, originalIngredientId, substituteId, substituteData) {
    const key = `${momentoId}_${originalIngredientId}`
    setSubstitutions(prev => ({
      ...prev,
      [key]: { substitute_ingredient_id: substituteId, substitute: substituteData },
    }))
    await supabase.from('user_substitutions').upsert(
      { user_id: user?.id, day: dayStr, momento_id: momentoId, original_ingredient_id: originalIngredientId, substitute_ingredient_id: substituteId },
      { onConflict: 'user_id,day,momento_id,original_ingredient_id' }
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-xl pt-safe">
        <div className="px-5 pt-5 pb-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-1">Tu plan</p>
            <h1 className="text-2xl font-bold text-white">{DIAS[diaSeleccionado - 1]}</h1>
          </div>
          <button
            onClick={downloadNutriICS}
            className="mt-1 p-2.5 rounded-xl bg-zinc-900 active:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Exportar horario a calendario (.ics)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

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
            {momentos.map(m => {
              const mHora = m.hora?.slice(0, 5)
              return (
                <div key={m.id} id={`momento-h${mHora?.replace(':', '')}`}>
                  <MomentoCard
                    momento={m}
                    dayStr={dayStr}
                    substitutions={substitutions}
                    onSwap={handleSwap}
                    isCompleted={completedMeals.has(m.id)}
                    onToggleComplete={toggleComplete}
                    highlighted={mHora === highlightedHora}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
