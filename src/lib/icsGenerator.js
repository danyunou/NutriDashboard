const MEALS = [
  { hora: '07:00', nombre: 'Colación 1', emoji: '🌅', durationMin: 30 },
  { hora: '11:00', nombre: 'Desayuno',   emoji: '☀️', durationMin: 45 },
  { hora: '16:00', nombre: 'Comida',     emoji: '🍽️', durationMin: 60 },
  { hora: '17:00', nombre: 'Colación 2', emoji: '🍎', durationMin: 20 },
  { hora: '20:00', nombre: 'Cena',       emoji: '🌙', durationMin: 30 },
]

const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']

// Returns the date of the next (or current) occurrence of dayIndex (0=Mon … 6=Sun)
function nextWeekday(dayIndex) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const jsDay = d.getDay() // 0=Sun, 1=Mon …
  const monBased = jsDay === 0 ? 6 : jsDay - 1
  let diff = dayIndex - monBased
  if (diff < 0) diff += 7
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
  const dtstamp = stamp()
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NutriDashboard//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const base = nextWeekday(dayIdx)
    const byday = WEEKDAYS[dayIdx]
    for (const meal of MEALS) {
      lines.push(
        'BEGIN:VEVENT',
        `UID:nutri-${byday}-${meal.hora.replace(':', '')}@nutridashboard`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${icsTime(base, meal.hora)}`,
        `DTEND:${icsTime(base, meal.hora, meal.durationMin)}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${byday}`,
        `SUMMARY:${meal.emoji} ${meal.nombre} — NutriDashboard`,
        `DESCRIPTION:Es hora de tu ${meal.nombre}.`,
        'END:VEVENT',
      )
    }
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
