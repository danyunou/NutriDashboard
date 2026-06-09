import { useState } from 'react'
import { useIngredientesReceta } from '../../hooks/useNutriData'
import { AlimentoSelector } from './AlimentoSelector'
import { Badge } from '../ui/Badge'
import { Spinner } from '../ui/Spinner'
import { ChevronDown, Clock, Utensils } from 'lucide-react'

const GRUPO_LABELS = {
  verduras: 'Verduras', frutas: 'Frutas', cereales: 'Cereales',
  leguminosas: 'Leguminosas', proteinas: 'Proteínas', leche: 'Leche', grasas: 'Grasas',
}

function PorcionesBar({ distribucion }) {
  const grupos = Object.entries(GRUPO_LABELS).filter(([k]) => (distribucion?.[0]?.[k] ?? 0) > 0)
  if (grupos.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
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

  const lista = ingredientes.map(i => swapped[i.alimento_id ? i.alimento : i.alimento] ?? i)

  return (
    <div className="rounded-xl bg-gray-800/40 border border-gray-700/40 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-emerald-400" />
          <span className="font-medium text-sm text-white">{receta.nombre}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {receta.notas && (
            <p className="text-xs text-gray-400 italic">{receta.notas}</p>
          )}
          {loading ? (
            <div className="flex justify-center py-3"><Spinner size="sm" /></div>
          ) : lista.length === 0 ? (
            <p className="text-xs text-gray-500">Sin ingredientes registrados aún.</p>
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
  const tieneRecetas = momento.recetas?.length > 0

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono font-medium">{hora}</span>
          </div>
          <span className="font-semibold text-white">{momento.nombre}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
          <PorcionesBar distribucion={momento.distribucion_diaria} />

          {tieneRecetas ? (
            momento.recetas.map(r => <RecetaDetalle key={r.id} receta={r} />)
          ) : (
            <p className="text-xs text-gray-500 text-center py-2">Sin recetas asignadas para este día.</p>
          )}
        </div>
      )}
    </div>
  )
}
