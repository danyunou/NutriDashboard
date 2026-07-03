// Supabase Edge Function — send-meals-push
// Triggered by a cron every minute.
// Checks if it's 10 minutes before a meal and sends Web Push to all subscribed users.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push'

const MEALS = [
  { hora: '07:00', nombre: 'Colación 1', emoji: '🌅' },
  { hora: '11:00', nombre: 'Desayuno',   emoji: '☀️' },
  { hora: '16:00', nombre: 'Comida',     emoji: '🍽️' },
  { hora: '17:00', nombre: 'Colación 2', emoji: '🍎' },
  { hora: '20:00', nombre: 'Cena',       emoji: '🌙' },
]

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT     = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:danmndz@proton.me'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

function toHora12(hora: string) {
  const [h, m] = hora.split(':').map(Number)
  const period = h >= 12 ? 'pm' : 'am'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`
}

Deno.serve(async (_req) => {
  // Mexico City is permanently UTC-6 (DST abolished 2023)
  const nowUTC = new Date()
  const mxMs = nowUTC.getTime() - 6 * 60 * 60 * 1000
  const mx = new Date(mxMs)
  const hh = String(mx.getUTCHours()).padStart(2, '0')
  const mm = String(mx.getUTCMinutes()).padStart(2, '0')
  const nowMinutes = mx.getUTCHours() * 60 + mx.getUTCMinutes()

  // Find meals that fire within this minute (10 min warning)
  const mealsNow = MEALS.filter(meal => {
    const [mh, mmm] = meal.hora.split(':').map(Number)
    return mh * 60 + mmm - 10 === nowMinutes
  })

  if (mealsNow.length === 0) {
    return new Response(`${hh}:${mm} MX — no meals now`, { status: 200 })
  }

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')

  if (error) return new Response('DB error: ' + error.message, { status: 500 })

  let sent = 0
  for (const meal of mealsNow) {
    const payload = JSON.stringify({
      title: `NutriDashboard — ${meal.emoji} ${meal.nombre}`,
      body: `En 10 minutos son las ${toHora12(meal.hora)}`,
      tag: `nutri-${meal.hora}`,
      hora: meal.hora,
    })
    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
        sent++
      } catch (_e) {
        // Subscription may be expired — ignore
      }
    }
  }

  return new Response(`Sent ${sent} push(es) at ${hh}:${mm} MX`, { status: 200 })
})
