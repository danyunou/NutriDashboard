import { useEffect } from 'react'

export function Toast({ message, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 2800)
    return () => clearTimeout(t)
  }, [])

  if (!message) return null

  return (
    <div
      className="fixed left-0 right-0 z-[9997] flex justify-center pointer-events-none"
      style={{ top: 'calc(var(--safe-top) + 0.75rem)' }}
    >
      <div className="animate-slide-down bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/30">
        {message}
      </div>
    </div>
  )
}
