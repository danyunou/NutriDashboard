import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { DIAS, GRUPO_COLORS } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import { Spinner } from '../ui/Spinner'
import { ShoppingCart, Check } from 'lucide-react'

export function ListaCompras() {
  const [diasSeleccionados, setDiasSeleccionados] = useState([getDiaLunes()])
  const [items, setItems] = useState([])
  const [checked, setChecked] = useState({})
  const [loading, setLoading] = useState(false)

  function getDiaLunes() {
    const d = new Date().getDay()
    return d === 0 ? 7 : d
  }

  function toggleDia(num) {
    setDiasSeleccionados(prev =>
      prev.includes(num) ? prev.filter(d => d !== num) : [...prev, num]
    )
  }

  useEffect(() => {
    if (diasSeleccionados.length === 0) { setItems([]); return }
    setLoading(true)

    supabase
      .from('v_receta_ingredientes')
      .select('alimento, grupo, color_hex, porciones, gramos_totales, porcion_texto, receta_id')
      .then(async ({ data }) => {
        if (!data) { setLoading(false); return }

        const { data: recetas } = await supabase
          .from('recetas')
          .select('id, dia_semana')
          .in('dia_semana', diasSeleccionados)

        const recetaIds = new Set(recetas?.map(r => r.id) ?? [])
        const filtrado = data.filter(i => recetaIds.has(i.receta_id))

        // Agrupar por alimento + grupo, sumando gramos
        const mapa = {}
        for (const i of filtrado) {
          const key = `${i.grupo}__${i.alimento}`
          if (!mapa[key]) mapa[key] = { ...i, gramos_totales: 0, porciones: 0 }
          mapa[key].gramos_totales += i.gramos_totales
          mapa[key].porciones += i.porciones
        }

        const sorted = Object.values(mapa).sort((a, b) => a.grupo.localeCompare(b.grupo))
        setItems(sorted)
        setLoading(false)
      })
  }, [diasSeleccionados])

  const grupos = [...new Set(items.map(i => i.grupo))]

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingCart className="w-5 h-5 text-emerald-400" />
          <h1 className="text-xl font-bold text-white">Lista de Compras</h1>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1">
          {DIAS.map((dia, i) => {
            const num = i + 1
            const active = diasSeleccionados.includes(num)
            return (
              <button
                key={dia}
                onClick={() => toggleDia(num)}
                className={`px-3 py-1.5 rounded-xl text-xs shrink-0 transition-colors
                  ${active ? 'bg-emerald-500 text-white font-semibold' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {dia.slice(0, 3)}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500 py-12 text-sm">Selecciona días para generar la lista.</p>
      ) : (
        <div className="space-y-4 mt-2">
          {grupos.map(grupo => (
            <div key={grupo}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{grupo}</h2>
              <div className="space-y-1.5">
                {items.filter(i => i.grupo === grupo).map((item, idx) => {
                  const key = `${item.grupo}_${item.alimento}`
                  const done = !!checked[key]
                  return (
                    <button
                      key={idx}
                      onClick={() => setChecked(p => ({ ...p, [key]: !done }))}
                      className={`flex items-center gap-3 w-full rounded-xl px-3 py-3 border transition-colors text-left
                        ${done ? 'bg-gray-800/30 border-gray-800 opacity-50' : 'bg-gray-900 border-gray-800 hover:bg-gray-800'}`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors
                        ${done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'}`}>
                        {done && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${done ? 'line-through text-gray-500' : 'text-white'}`}>
                          {item.alimento}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {Math.round(item.gramos_totales)}g
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
