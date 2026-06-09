import { cn, GRUPO_COLORS } from '../../lib/utils'

export function Badge({ grupo, children, className }) {
  const color = GRUPO_COLORS[grupo] ?? 'bg-zinc-700/50 text-zinc-300 border-zinc-600/50'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border', color, className)}>
      {children}
    </span>
  )
}
