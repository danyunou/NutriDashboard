import { useState } from 'react'
import { useAlimentosPorGrupo } from '../../hooks/useNutriData'
import { Badge } from '../ui/Badge'
import { calcularGramos } from '../../lib/utils'
import { ArrowLeftRight, Check } from 'lucide-react'

export function AlimentoSelector({ ingrediente, onSwap }) {
  const [open, setOpen] = useState(false)
  const { alimentos } = useAlimentosPorGrupo(open ? ingrediente.grupo_id : null)

  function handleSelect(alimento) {
    const gramos = calcularGramos(alimento.porcion_gramos, ingrediente.porciones)
    onSwap({ ...ingrediente, alimento: alimento.nombre, gramos_totales: gramos, porcion_texto: alimento.porcion_texto })
    setOpen(false)
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-3 w-full text-left rounded-2xl px-3.5 py-3 transition-all
          ${open ? 'bg-zinc-700/60 ring-1 ring-zinc-600/50' : 'bg-zinc-800/50 active:bg-zinc-700/50'}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Badge grupo={ingrediente.grupo}>{ingrediente.grupo}</Badge>
          </div>
          <p className="text-sm font-medium text-zinc-100 truncate">{ingrediente.alimento}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{ingrediente.gramos_totales}g</p>
        </div>
        <ArrowLeftRight className={`w-3.5 h-3.5 shrink-0 transition-colors ${open ? 'text-emerald-400' : 'text-zinc-600'}`} />
      </button>

      {open && (
        <div className="mt-1.5 rounded-2xl bg-zinc-800 overflow-hidden shadow-xl shadow-black/30">
          {alimentos.length === 0 ? (
            <p className="px-4 py-3 text-sm text-zinc-500">Cargando equivalentes…</p>
          ) : (
            alimentos.map((a, idx) => {
              const gramos = calcularGramos(a.porcion_gramos, ingrediente.porciones)
              const isActive = a.nombre === ingrediente.alimento
              return (
                <button
                  key={a.id}
                  onClick={() => handleSelect(a)}
                  className={`flex items-center justify-between w-full px-4 py-3 text-left transition-colors active:bg-zinc-700
                    ${idx !== 0 ? 'border-t border-zinc-700/50' : ''}
                    ${isActive ? 'bg-emerald-500/10' : ''}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isActive
                      ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      : <span className="w-3.5 h-3.5 shrink-0" />
                    }
                    <span className={`text-sm font-medium truncate ${isActive ? 'text-emerald-400' : 'text-zinc-200'}`}>
                      {a.nombre}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 shrink-0 ml-2">{gramos}g</span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
