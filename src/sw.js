import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

// Precache all assets injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Cache Supabase API with network-first
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co'),
  new NetworkFirst({ cacheName: 'supabase-api', networkTimeoutSeconds: 4 })
)

// Receive push from server → show notification
self.addEventListener('push', (event) => {
  if (!event.data) return
  let data
  try { data = event.data.json() } catch { return }
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'NutriDashboard', {
      body: data.body ?? '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag ?? 'nutri-meal',
      renotify: false,
      data: { hora: data.hora },
    })
  )
})

// Notification tap → focus or open app
self.addEventListener('notificationclick', (event) => {
  const hora = event.notification.data?.hora
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ('focus' in w) {
          w.postMessage({ type: 'NUTRI_NAVIGATE', hora })
          return w.focus()
        }
      }
      return clients.openWindow('/')
    })
  )
})
