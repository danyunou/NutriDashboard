import { useState } from 'react'
import { useAlimentosPorGrupo } from '../../hooks/useNutriData'
import { Badge } from '../ui/Badge'
import { calcularGramos } from '../../lib/utils'
import { ChevronDown } from 'lucide-react'

export function AlimentoSelector({ ingrediente, onSwap }) {
  const [open, setOpen] = useState(false)
  const { alimentos } = useAlimentosPorGrupo(open ? ingrediente.grupo_id : null)

  function handleSelect(alimento) {
    const gramos = calcularGramos(alimento.porcion_gramos, ingrediente.porciones)
    onSwap({ ...ingrediente, alimento: alimento.nombre, gramos_totales: gramos, porcion_texto: alimento.porcion_texto })
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left rounded-xl p-3 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge grupo={ingrediente.grupo}>{ingrediente.grupo}</Badge>
            <span className="text-xs text-gray-400">{ingrediente.porciones} porc.</span>
          </div>
          <p className="text-sm font-medium text-white truncate">{ingrediente.alimento}</p>
          <p className="text-xs text-gray-400">{ingrediente.gramos_totales}g · {ingrediente.porcion_texto}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl bg-gray-900 border border-gray-700 shadow-xl max-h-60 overflow-y-auto">
          {alimentos.length === 0 ? (
            <p className="p-3 text-sm text-gray-500">Cargando equivalentes…</p>
          ) : (
            alimentos.map(a => {
              const gramos = calcularGramos(a.porcion_gramos, ingrediente.porciones)
              const isActive = a.nombre === ingrediente.alimento
              return (
                <button
                  key={a.id}
                  onClick={() => handleSelect(a)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 text-left text-sm hover:bg-gray-800 transition-colors
                    ${isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-200'}`}
                >
                  <span className="font-medium">{a.nombre}</span>
                  <span className="text-gray-400 text-xs">{gramos}g</span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
