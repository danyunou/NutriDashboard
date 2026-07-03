import { useEffect, useRef } from 'react'

const MEALS = [
  { hora: '07:00', nombre: 'Colación 1', emoji: '🌅' },
  { hora: '11:00', nombre: 'Desayuno',   emoji: '☀️' },
  { hora: '16:00', nombre: 'Comida',     emoji: '🍽️' },
  { hora: '17:00', nombre: 'Colación 2', emoji: '🍎' },
  { hora: '20:00', nombre: 'Cena',       emoji: '🌙' },
]

function subtractMinutes(hora, mins) {
  const [h, m] = hora.split(':').map(Number)
  const total = h * 60 + m - mins
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function toHora12(hora) {
  const [h, m] = hora.split(':').map(Number)
  const period = h >= 12 ? 'pm' : 'am'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`
}

async function requestPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

// Uses service worker notification when available (required for iOS PWA 16.4+)
// Falls back to Notification API for desktop/Android browser
async function showNotification(title, body, tag) {
  const opts = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag,
    renotify: false,
    silent: false,
  }

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, opts)
      return
    } catch {}
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    const n = new Notification(title, opts)
    n.onclick = () => {
      window.focus()
      n.close()
    }
  }
}

export function useDietNotifications() {
  const firedRef = useRef(new Set())

  useEffect(() => {
    requestPermission()

    function tick() {
      if (!('Notification' in window)) return
      if (Notification.permission !== 'granted') return

      const now = new Date()
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const dateStr = now.toLocaleDateString('en-CA')

      for (const meal of MEALS) {
        const triggerAt = subtractMinutes(meal.hora, 10)
        if (hhmm !== triggerAt) continue

        const key = `${dateStr}_${meal.hora}`
        if (firedRef.current.has(key)) continue
        firedRef.current.add(key)

        showNotification(
          'NutriDashboard',
          `${meal.emoji} Dany, casi es hora de tu ${meal.nombre} (${toHora12(meal.hora)})`,
          key,
        )
      }
    }

    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])
}
