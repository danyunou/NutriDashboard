import { useState, useEffect } from 'react'
import { DashboardDiario } from './components/dashboard/DashboardDiario'
import { ListaCompras } from './components/shopping/ListaCompras'
import { TrackerSemanal } from './components/tracker/TrackerSemanal'
import { AuthScreen } from './components/auth/AuthScreen'
import { CalendarDays, ShoppingBasket, BarChart2, MoreHorizontal, Bell, Download, LogOut } from 'lucide-react'
import { useDietNotifications } from './hooks/useDietNotifications'
import { triggerTestNotification } from './hooks/useDietNotifications'
import { useAuth, AuthContext } from './hooks/useAuth'
import { supabase } from './lib/supabaseClient'
import { Spinner } from './components/ui/Spinner'
import { downloadNutriICS } from './lib/icsGenerator'

const TABS = [
  { id: 'dashboard', label: 'Mi Plan',  icon: CalendarDays,  component: DashboardDiario },
  { id: 'tracker',   label: 'Semana',   icon: BarChart2,      component: TrackerSemanal },
  { id: 'compras',   label: 'Compras',  icon: ShoppingBasket, component: ListaCompras },
]

function BottomSheet({ open, onClose, children }) {
  return (
    <div className={`fixed inset-0 z-[100] ${open ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`absolute bottom-0 inset-x-0 bg-zinc-900 rounded-t-[28px] border-t border-zinc-800/40 shadow-2xl transition-transform duration-300 ease-out will-change-transform ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ paddingBottom: 'var(--safe-bottom)' }}
      >
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mt-3 mb-5" />
        {children}
      </div>
    </div>
  )
}

function AppShell() {
  const [tab, setTab] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifStatus, setNotifStatus] = useState(null)
  const ActiveView = TABS.find(t => t.id === tab).component

  useDietNotifications()

  useEffect(() => {
    function handler() { setTab('dashboard') }
    window.addEventListener('nutri-navigate', handler)
    return () => window.removeEventListener('nutri-navigate', handler)
  }, [])

  async function handleTestNotif() {
    const result = await triggerTestNotification()
    setNotifStatus(result.ok ? 'ok' : 'denied')
    setTimeout(() => setNotifStatus(null), 3000)
  }

  return (
    <div className="min-h-svh flex flex-col bg-zinc-950">
      <main className="flex-1 overflow-y-auto pb-nav">
        <ActiveView />
      </main>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 bg-zinc-900 border-t border-zinc-800/60"
        style={{ paddingBottom: 'var(--safe-bottom)' }}
      >
        <div className="flex">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = tab === id
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-all"
              >
                <Icon
                  className={`w-[22px] h-[22px] transition-all ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span className={`text-[10px] font-semibold tracking-wide leading-none transition-colors ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {label}
                </span>
              </button>
            )
          })}

          {/* Más / hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-all"
          >
            <MoreHorizontal className="w-[22px] h-[22px] text-zinc-500" strokeWidth={1.8} />
            <span className="text-[10px] font-semibold tracking-wide leading-none text-zinc-500">Más</span>
          </button>
        </div>
      </nav>

      {/* Bottom sheet menu */}
      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)}>
        <div className="px-4 pb-6 space-y-2">
          {/* Test notification */}
          <button
            onClick={handleTestNotif}
            className={`flex items-center gap-3.5 w-full px-4 py-4 rounded-2xl transition-colors active:scale-[0.98]
              ${notifStatus === 'ok'     ? 'bg-emerald-500/15 text-emerald-400' :
                notifStatus === 'denied' ? 'bg-red-500/15 text-red-400'         :
                'bg-zinc-800 text-zinc-200 active:bg-zinc-700'}`}
          >
            <Bell className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium leading-snug">Probar notificación</p>
              {notifStatus === 'ok'     && <p className="text-xs text-emerald-500 mt-0.5">¡Enviada!</p>}
              {notifStatus === 'denied' && <p className="text-xs text-red-400 mt-0.5">Permiso denegado</p>}
            </div>
          </button>

          {/* Download calendar */}
          <button
            onClick={() => { downloadNutriICS(); setMenuOpen(false) }}
            className="flex items-center gap-3.5 w-full px-4 py-4 rounded-2xl bg-zinc-800 text-zinc-200 active:bg-zinc-700 transition-colors active:scale-[0.98]"
          >
            <Download className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Exportar calendario (.ics)</span>
          </button>

          <div className="h-px bg-zinc-800 mx-1" />

          {/* Logout */}
          <button
            onClick={() => { supabase.auth.signOut(); setMenuOpen(false) }}
            className="flex items-center gap-3.5 w-full px-4 py-4 rounded-2xl bg-zinc-800 text-red-400 active:bg-zinc-700 transition-colors active:scale-[0.98]"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-zinc-950">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={user}>
      {user ? <AppShell /> : <AuthScreen />}
    </AuthContext.Provider>
  )
}
