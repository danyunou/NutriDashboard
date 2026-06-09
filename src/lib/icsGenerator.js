const MEALS = [
  { hora: '07:00', nombre: 'Colación 1', emoji: '🌅', durationMin: 30 },
  { hora: '11:00', nombre: 'Desayuno',   emoji: '☀️', durationMin: 45 },
  { hora: '16:00', nombre: 'Comida',     emoji: '🍽️', durationMin: 60 },
  { hora: '17:00', nombre: 'Colación 2', emoji: '🍎', durationMin: 20 },
  { hora: '20:00', nombre: 'Cena',       emoji: '🌙', durationMin: 30 },
]

function nextMonday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0=Sun, 1=Mon...
  const diff = day === 1 ? 0 : day === 0 ? 1 : 8 - day
  d.setDate(d.getDate() + diff)
  return d
}

function icsTime(base, hora, offsetMin = 0) {
  const [h, m] = hora.split(':').map(Number)
  const totalMin = h * 60 + m + offsetMin
  const hh = String(Math.floor(totalMin / 60)).padStart(2, '0')
  const mm = String(totalMin % 60).padStart(2, '0')
  const ymd = base.toISOString().slice(0, 10).replace(/-/g, '')
  return `${ymd}T${hh}${mm}00`
}

function stamp() {
  return new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'
}

function generateICS() {
  const base = nextMonday()
  const dtstamp = stamp()
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NutriDashboard//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const meal of MEALS) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:nutri-${meal.hora.replace(':', '')}@nutridashboard`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${icsTime(base, meal.hora)}`,
      `DTEND:${icsTime(base, meal.hora, meal.durationMin)}`,
      'RRULE:FREQ=DAILY',
      `SUMMARY:${meal.emoji} ${meal.nombre} — NutriDashboard`,
      `DESCRIPTION:Es hora de tu ${meal.nombre}.`,
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadNutriICS() {
  const blob = new Blob([generateICS()], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'nutridashboard-plan.ics'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
