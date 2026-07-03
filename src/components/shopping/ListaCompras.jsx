import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { DIAS, calcularGramos } from '../../lib/utils'
import { useUser } from '../../hooks/useAuth'
import { Spinner } from '../ui/Spinner'
import { Check } from 'lucide-react'

const DIAS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const GRUPO_EMOJI = {
  Verduras: '🥦', Frutas: '🍎', Cereales: '🌾',
  Leguminosas: '🫘', Proteínas: '🥩', Leche: '🥛', Grasas: '🫒',
}

export function ListaCompras() {
  const user = useUser()
  const checkedKey = `nutri-compras-checked-${user?.id ?? 'anon'}`
  const hoy = new Date().getDay()
  const [diasSeleccionados, setDiasSeleccionados] = useState([hoy === 0 ? 7 : hoy])
  const [items, setItems] = useState([])
  const [checked, setChecked] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    try { setChecked(JSON.parse(localStorage.getItem(checkedKey) ?? '{}')) } catch {}
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    localStorage.setItem(checkedKey, JSON.stringify(checked))
  }, [checked, user?.id])

  function toggleDia(num) {
    setDiasSeleccionados(prev =>
      prev.includes(num) ? prev.filter(d => d !== num) : [...prev, num]
    )
  }

  useEffect(() => {
    if (diasSeleccionados.length === 0) { setItems([]); return }
    setLoading(true)

    async function loadItems() {
      const dayStrings = diasSeleccionados.map(d => DIAS[d - 1])

      const [
        { data: allIngredients },
        { data: recetas },
        { data: subs },
      ] = await Promise.all([
        supabase.from('v_receta_ingredientes').select('alimento, alimento_id, grupo, porciones, gramos_totales, receta_id'),
        supabase.from('recetas').select('id, dia_semana, momento_id').in('dia_semana', diasSeleccionados),
        supabase
          .from('user_substitutions')
          .select('day, momento_id, original_ingredient_id, substitute:alimentos!substitute_ingredient_id(nombre, porcion_gramos)')
          .in('day', dayStrings),
      ])

      if (!allIngredients || !recetas) { setLoading(false); return }

      // Group recipes by dia_semana + momento_id, then pick the selected one per group
      const recetasByKey = {}
      for (const r of recetas ?? []) {
        const key = `${r.dia_semana}_${r.momento_id}`
        if (!recetasByKey[key]) recetasByKey[key] = []
        recetasByKey[key].push(r)
      }

      const selectedIds = new Set()
      const recetaMap = {}
      for (const [key, group] of Object.entries(recetasByKey)) {
        const [diaSemana, momentoId] = key.split('_')
        const diaNum = parseInt(diaSemana)
        const dayStr = DIAS[diaNum - 1]
        let pickedId = group[0]?.id
        try {
          const saved = JSON.parse(localStorage.getItem(`nutri-receta-${user?.id ?? 'anon'}-${dayStr}-${momentoId}`))
          if (saved?.id) pickedId = saved.id
        } catch {}
        if (!pickedId) continue
        selectedIds.add(pickedId)
        if (!recetaMap[pickedId]) {
          recetaMap[pickedId] = { dia_semana: diaNum, momento_id: parseInt(momentoId) }
        }
      }

      const subsMap = Object.fromEntries(
        (subs ?? []).map(s => [`${s.day}_${s.momento_id}_${s.original_ingredient_id}`, s])
      )

      const filtrado = allIngredients.filter(i => selectedIds.has(i.receta_id))

      const mapa = {}
      for (const i of filtrado) {
        const receta = recetaMap[i.receta_id]
        const dayStr = DIAS[(receta?.dia_semana ?? 1) - 1]
        const subKey = `${dayStr}_${receta?.momento_id}_${i.alimento_id}`
        const sub = subsMap[subKey]

        const nombre = sub ? sub.substitute.nombre : i.alimento
        const gramos = sub
          ? calcularGramos(sub.substitute.porcion_gramos, i.porciones)
          : i.gramos_totales

        const key = `${i.grupo}__${nombre}`
        if (!mapa[key]) mapa[key] = { alimento: nombre, grupo: i.grupo, gramos_totales: 0 }
        mapa[key].gramos_totales += gramos
      }

      setItems(Object.values(mapa).sort((a, b) => a.grupo.localeCompare(b.grupo)))
      setLoading(false)
    }

    loadItems()
  }, [diasSeleccionados])

  const grupos = [...new Set(items.map(i => i.grupo))]
  const totalItems = items.length
  const checkedCount = Object.values(checked).filter(Boolean).length

  return (
    <div className="max-w-lg mx-auto">
      <div className="sticky top-0 z-10 bg-zinc-950 pt-safe">
        <div className="px-5 pt-5 pb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-1">Lista de compras</p>
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl font-bold text-white">Supermercado</h1>
            <div className="flex items-center gap-3">
              {totalItems > 0 && (
                <span className="text-sm text-zinc-500">
                  {checkedCount}/{totalItems}
                </span>
              )}
              {checkedCount > 0 && (
                <button
                  onClick={() => setChecked({})}
                  className="text-xs text-zinc-600 active:text-zinc-400 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex px-4 pb-3 gap-1.5">
          {DIAS_SHORT.map((letra, i) => {
            const num = i + 1
            const active = diasSeleccionados.includes(num)
            return (
              <button
                key={num}
                onClick={() => toggleDia(num)}
                className={`flex-1 py-2 rounded-2xl text-xs font-semibold transition-all min-h-[40px]
                  ${active
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-zinc-900 text-zinc-500 active:bg-zinc-800'
                  }`}
              >
                {letra}
              </button>
            )
          })}
        </div>

        <div className="h-px bg-zinc-800/50" />
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <span className="text-4xl">🛒</span>
            <p className="text-sm text-zinc-500">Selecciona días para generar la lista</p>
          </div>
        ) : (
          <div className="space-y-5 pb-6">
            {grupos.map(grupo => (
              <div key={grupo}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-base">{GRUPO_EMOJI[grupo] ?? '🥗'}</span>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{grupo}</h2>
                </div>
                <div className="rounded-3xl bg-zinc-900 overflow-hidden">
                  {items.filter(i => i.grupo === grupo).map((item, idx, arr) => {
                    const key = `${item.grupo}_${item.alimento}`
                    const done = !!checked[key]
                    return (
                      <button
                        key={key}
                        onClick={() => setChecked(p => ({ ...p, [key]: !done }))}
                        className={`flex items-center gap-3 w-full px-4 py-3.5 text-left active:bg-zinc-800 transition-colors
                          ${idx !== arr.length - 1 ? 'border-b border-zinc-800/60' : ''}
                          ${done ? 'opacity-40' : ''}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all
                          ${done ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'}`}>
                          {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <span className={`flex-1 text-sm font-medium ${done ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                          {item.alimento}
                        </span>
                        <span className="text-xs text-zinc-500 shrink-0">
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
    </div>
  )
}
