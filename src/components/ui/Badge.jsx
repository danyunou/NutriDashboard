import { cn, GRUPO_COLORS } from '../../lib/utils'

export function Badge({ grupo, children, className }) {
  const color = GRUPO_COLORS[grupo] ?? 'bg-gray-700 text-gray-300 border-gray-600'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', color, className)}>
      {children}
    </span>
  )
}
