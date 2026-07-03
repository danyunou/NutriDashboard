import { useEffect, useState } from 'react'

const COLORS = ['#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#f97316','#06b6d4','#ec4899']

const DAY_MSGS = [
  { emoji: '🎉', text: '¡Día completo!',      sub: 'Adherencia perfecta hoy' },
  { emoji: '💪', text: '¡Eres imparable!',    sub: 'Todas las comidas del día' },
  { emoji: '🌟', text: '¡100% hoy!',          sub: 'Así se construyen resultados' },
  { emoji: '🏆', text: '¡Lo lograste!',       sub: 'Constancia = cambios reales' },
  { emoji: '🔥', text: '¡En racha!',           sub: 'Sigue así mañana también' },
]

function Particle({ color, x, size, dur, delay, shape }) {
  return (
    <div
      className="fixed top-0 pointer-events-none animate-confetti-fall"
      style={{
        left: `${x}%`,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: shape === 'circle' ? '50%' : shape === 'square' ? '2px' : '1px',
        '--fall-dur': `${dur}s`,
        animationDelay: `${delay}s`,
        zIndex: 9999,
      }}
    />
  )
}

export function Celebration({ onDone }) {
  const [msg] = useState(() => DAY_MSGS[Math.floor(Math.random() * DAY_MSGS.length)])
  const [particles] = useState(() =>
    Array.from({ length: 70 }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      x: Math.random() * 100,
      size: `${5 + Math.random() * 8}px`,
      dur: 1.6 + Math.random() * 1.6,
      delay: Math.random() * 0.9,
      shape: ['circle', 'square', 'square'][Math.floor(Math.random() * 3)],
    }))
  )

  useEffect(() => {
    const t = setTimeout(onDone, 4200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none flex items-center justify-center">
      {particles.map(p => <Particle key={p.id} {...p} />)}
      <div className="animate-bounce-in pointer-events-auto bg-zinc-900/96 rounded-3xl px-8 py-7 text-center shadow-2xl border border-zinc-700/40 mx-6">
        <p className="text-5xl mb-3">{msg.emoji}</p>
        <p className="text-xl font-bold text-white mb-1">{msg.text}</p>
        <p className="text-sm text-zinc-400">{msg.sub}</p>
      </div>
    </div>
  )
}
