import { useState } from 'react'
import { useIngredientesReceta } from '../../hooks/useNutriData'
import { AlimentoSelector } from './AlimentoSelector'
import { Badge } from '../ui/Badge'
import { Spinner } from '../ui/Spinner'
import { ChevronDown } from 'lucide-react'

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

function RecetaDetalle({ receta }) {
  const [expanded, setExpanded] = useState(false)
  const { ingredientes, loading } = useIngredientesReceta(expanded ? receta.id : null)
  const [swapped, setSwapped] = useState({})
  const lista = ingredientes.map(i => swapped[i.alimento] ?? i)

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
                key={idx}
                ingrediente={ing}
                onSwap={(updated) => setSwapped(prev => ({ ...prev, [ing.alimento]: updated }))}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export function MomentoCard({ momento }) {
  const [open, setOpen] = useState(false)
  const hora = momento.hora?.slice(0, 5)
  const meta = HORA_LABELS[hora] ?? { emoji: '🕐', label: '' }
  const tieneRecetas = momento.recetas?.length > 0

  return (
    <div className={`rounded-3xl overflow-hidden transition-all ${open ? 'bg-zinc-900' : 'bg-zinc-900/60'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center w-full px-4 py-4 text-left active:bg-zinc-800/50 transition-colors"
      >
        {/* Emoji + hora */}
        <div className="w-11 h-11 rounded-2xl bg-zinc-800 flex items-center justify-center text-xl shrink-0 mr-3">
          {meta.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-zinc-100 text-sm leading-tight">{momento.nombre}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{hora} · {meta.label}</p>
        </div>

        {tieneRecetas && (
          <span className="text-xs text-zinc-400 mr-2 shrink-0">
            {momento.recetas.length} receta{momento.recetas.length > 1 ? 's' : ''}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-zinc-600 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-zinc-800/60 pt-3">
          <PorcionesRow distribucion={momento.distribucion_diaria} />
          {tieneRecetas ? (
            <div className="space-y-2">
              {momento.recetas.map(r => <RecetaDetalle key={r.id} receta={r} />)}
            </div>
          ) : (
            <p className="text-xs text-zinc-600 text-center py-3">Sin recetas para este día.</p>
          )}
        </div>
      )}
    </div>
  )
}
