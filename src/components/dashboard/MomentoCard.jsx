import { useState } from 'react'
import { useIngredientesReceta, useRecetasPorMomento } from '../../hooks/useNutriData'
import { AlimentoSelector } from './AlimentoSelector'
import { Badge } from '../ui/Badge'
import { Spinner } from '../ui/Spinner'
import { calcularGramos } from '../../lib/utils'
import { ChevronDown, Check, ArrowLeftRight } from 'lucide-react'

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

function RecetaPanel({ momentoId, defaultReceta, dayStr, substitutions, onSwap }) {
  const storageKey = `nutri-receta-${dayStr}-${momentoId}`

  const [selectedReceta, setSelectedReceta] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey))
      if (saved?.id) return saved
    } catch {}
    return defaultReceta
  })

  const [swapOpen, setSwapOpen] = useState(false)
  const { recetas: allRecetas, loading } = useRecetasPorMomento(swapOpen ? momentoId : null)

  function handleSelect(receta) {
    setSelectedReceta(receta)
    localStorage.setItem(storageKey, JSON.stringify({ id: receta.id, nombre: receta.nombre, notas: receta.notas }))
    setSwapOpen(false)
  }

  if (!selectedReceta) return null

  return (
    <div className="space-y-2">
      <button
        onClick={() => setSwapOpen(!swapOpen)}
        className={`flex items-center gap-3 w-full text-left rounded-2xl px-3.5 py-3 transition-all
          ${swapOpen ? 'bg-zinc-700/60 ring-1 ring-zinc-600/50' : 'bg-zinc-800/50 active:bg-zinc-700/50'}`}
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-500 mb-0.5">Receta de hoy</p>
          <p className="text-sm font-medium text-zinc-100 truncate">{selectedReceta.nombre}</p>
        </div>
        <ArrowLeftRight className={`w-3.5 h-3.5 shrink-0 transition-colors ${swapOpen ? 'text-emerald-400' : 'text-zinc-600'}`} />
      </button>

      {swapOpen && (
        <div className="rounded-2xl bg-zinc-800 overflow-hidden shadow-xl shadow-black/30">
          {loading || allRecetas.length === 0 ? (
            <p className="px-4 py-3 text-sm text-zinc-500">Cargando recetas…</p>
          ) : (
            allRecetas.map((r, idx) => {
              const isActive = r.id === selectedReceta.id
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r)}
                  className={`flex items-center w-full px-4 py-3 text-left transition-colors active:bg-zinc-700
                    ${idx !== 0 ? 'border-t border-zinc-700/50' : ''}
                    ${isActive ? 'bg-emerald-500/10' : ''}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isActive
                      ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      : <span className="w-3.5 h-3.5 shrink-0" />
                    }
                    <span className={`text-sm font-medium truncate ${isActive ? 'text-emerald-400' : 'text-zinc-200'}`}>
                      {r.nombre}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}

      <RecetaDetalle
        receta={selectedReceta}
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

        <button
          onClick={() => onToggleComplete(momento.id)}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mx-2 transition-all
            ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-700 active:border-zinc-500'}`}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </button>

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
            <RecetaPanel
              momentoId={momento.id}
              defaultReceta={momento.recetas[0]}
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
