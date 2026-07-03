import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(b64) {
  const padding = '='.repeat((4 - (b64.length % 4)) % 4)
  const base64 = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

async function saveSubscription(sub, userId) {
  const { endpoint, keys } = sub.toJSON()
  await supabase.from('push_subscriptions').upsert(
    { user_id: userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    { onConflict: 'user_id,endpoint' }
  )
}

export async function subscribeToPush(userId) {
  if (!userId || !VAPID_PUBLIC_KEY) return
  if (!('PushManager' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    const reg = await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    if (existing) {
      await saveSubscription(existing, userId)
      return
    }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
    await saveSubscription(sub, userId)
  } catch {}
}

export function usePushSubscription(userId) {
  useEffect(() => {
    if (!userId) return
    if (Notification.permission === 'granted') {
      subscribeToPush(userId)
    }
  }, [userId])
}
