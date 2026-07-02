import { useState } from 'react'
import { useIngredientesReceta } from '../../hooks/useNutriData'
import { AlimentoSelector } from './AlimentoSelector'
import { Badge } from '../ui/Badge'
import { Spinner } from '../ui/Spinner'
import { calcularGramos } from '../../lib/utils'
import { ChevronDown, Check } from 'lucide-react'

const HORA_LABELS = {
  '07:00': { emoji: '🌅', label: 'Mañana' },
  '11:00': { emoji: '☀️', label: 'Media mañana' },
  '16:00': { emoji: '🍽️', label: 'Tarde' },
  '17:00': { emoji: '🍎', label: 'Colación' },
  '20:00': { emoji: '🌙', label: 'Noche' },
}

const GRUPO_LABELS = {
  verduras: 'Verduras', frutas: 'Frutas', cereales: 'Cereales',
  leguminosas: 'Leguminosas', proteinas: 'Proteínas', leche: 'Leche', grasas: 'Grasas',
}

function PorcionesRow({ distribucion }) {
  const grupos = Object.entries(GRUPO_LABELS).filter(([k]) => (distribucion?.[0]?.[k] ?? 0) > 0)
  if (grupos.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5 pt-1 pb-3">
      {grupos.map(([k, label]) => (
        <Badge key={k} grupo={label}>
          {distribucion[0][k]} {label}
        </Badge>
      ))}
    </div>
  )
}

function RecetaDetalle({ receta, momentoId, substitutions, onSwap }) {
  const [expanded, setExpanded] = useState(false)
  const { ingredientes, loading } = useIngredientesReceta(expanded ? receta.id : null)

  const lista = ingredientes.map(ing => {
    const key = `${momentoId}_${ing.alimento_id}`
    const sub = substitutions[key]
    if (!sub) return ing
    return {
      ...ing,
      alimento: sub.substitute.nombre,
      gramos_totales: calcularGramos(sub.substitute.porcion_gramos, ing.porciones),
      porcion_texto: sub.substitute.porcion_texto,
    }
  })

  return (
    <div className="rounded-2xl bg-zinc-800/40 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-3.5 text-left active:bg-zinc-700/30 transition-colors"
      >
        <span className="font-medium text-sm text-zinc-100 leading-snug pr-2">{receta.nombre}</span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-zinc-700/40 pt-3">
          {receta.notas && (
            <p className="text-xs text-zinc-500 mb-3 leading-relaxed">{receta.notas}</p>
          )}
          {loading ? (
            <div className="flex justify-center py-4"><Spinner size="sm" /></div>
          ) : lista.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-2">Sin ingredientes registrados.</p>
          ) : (
            lista.map((ing, idx) => (
              <AlimentoSelector
                key={ing.alimento_id ?? idx}
                ingrediente={ing}
                onSwap={(updated) => onSwap(
                  ing.alimento_id,
                  updated._substituteId,
                  { id: updated._substituteId, nombre: updated.alimento, porcion_gramos: updated._substitutePorcionGramos, porcion_texto: updated.porcion_texto }
                )}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function RecetaSelector({ recetas, momentoId, dayStr, substitutions, onSwap }) {
  const storageKey = `nutri-receta-${dayStr}-${momentoId}`
  const [selectedIdx, setSelectedIdx] = useState(() => {
    const saved = parseInt(localStorage.getItem(storageKey), 10)
    return isNaN(saved) || saved >= recetas.length ? 0 : saved
  })

  function select(idx) {
    setSelectedIdx(idx)
    localStorage.setItem(storageKey, idx)
  }

  return (
    <div className="space-y-3">
      {recetas.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          {recetas.map((r, i) => (
            <button
              key={r.id}
              onClick={() => select(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${i === selectedIdx
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-400 active:bg-zinc-700'
                }`}
            >
              {r.nombre}
            </button>
          ))}
        </div>
      )}
      <RecetaDetalle
        receta={recetas[selectedIdx]}
        momentoId={momentoId}
        substitutions={substitutions}
        onSwap={onSwap}
      />
    </div>
  )
}

export function MomentoCard({ momento, dayStr, substitutions, onSwap, isCompleted, onToggleComplete, highlighted }) {
  const [manualOpen, setManualOpen] = useState(false)
  const open = manualOpen || !!highlighted
  const hora = momento.hora?.slice(0, 5)
  const meta = HORA_LABELS[hora] ?? { emoji: '🕐', label: '' }
  const tieneRecetas = momento.recetas?.length > 0

  return (
    <div className={`rounded-3xl overflow-hidden transition-all ${open ? 'bg-zinc-900' : 'bg-zinc-900/60'} ${isCompleted ? 'opacity-50' : ''} ${highlighted ? 'ring-1 ring-emerald-500/50' : ''}`}>
      <div className="flex items-center w-full">
        {/* Expand area */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setManualOpen(!manualOpen)}
          onKeyDown={e => e.key === 'Enter' && setManualOpen(!manualOpen)}
          className="flex items-center flex-1 min-w-0 px-4 py-4 cursor-pointer select-none"
        >
          <div className="w-11 h-11 rounded-2xl bg-zinc-800 flex items-center justify-center text-xl shrink-0 mr-3">
            {meta.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-zinc-100 text-sm leading-tight">{momento.nombre}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{hora} · {meta.label}</p>
          </div>
          {tieneRecetas && (
            <span className="text-xs text-zinc-400 shrink-0">
              {momento.recetas.length} receta{momento.recetas.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Completion button */}
        <button
          onClick={() => onToggleComplete(momento.id)}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mx-2 transition-all
            ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-700 active:border-zinc-500'}`}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </button>

        {/* Chevron toggle */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setManualOpen(!manualOpen)}
          onKeyDown={e => e.key === 'Enter' && setManualOpen(!manualOpen)}
          className="pr-4 py-4 cursor-pointer select-none"
        >
          <ChevronDown
            className={`w-4 h-4 text-zinc-600 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-zinc-800/60 pt-3">
          <PorcionesRow distribucion={momento.distribucion_diaria} />
          {tieneRecetas ? (
            <RecetaSelector
              recetas={momento.recetas}
              momentoId={momento.id}
              dayStr={dayStr}
              substitutions={substitutions}
              onSwap={(origId, subId, subData) => onSwap(momento.id, origId, subId, subData)}
            />
          ) : (
            <p className="text-xs text-zinc-600 text-center py-3">Sin recetas para este día.</p>
          )}
        </div>
      )}
    </div>
  )
}
