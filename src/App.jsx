import { useState, useEffect } from 'react'
import { DashboardDiario } from './components/dashboard/DashboardDiario'
import { ListaCompras } from './components/shopping/ListaCompras'
import { TrackerSemanal } from './components/tracker/TrackerSemanal'
import { AuthScreen } from './components/auth/AuthScreen'
import { CalendarDays, ShoppingBasket, BarChart2, LogOut } from 'lucide-react'
import { useDietNotifications } from './hooks/useDietNotifications'
import { useAuth, AuthContext } from './hooks/useAuth'
import { supabase } from './lib/supabaseClient'
import { Spinner } from './components/ui/Spinner'

const TABS = [
  { id: 'dashboard', label: 'Mi Plan',  icon: CalendarDays,  component: DashboardDiario },
  { id: 'tracker',   label: 'Semana',   icon: BarChart2,      component: TrackerSemanal },
  { id: 'compras',   label: 'Compras',  icon: ShoppingBasket, component: ListaCompras },
]

function AppShell() {
  const [tab, setTab] = useState('dashboard')
  const ActiveView = TABS.find(t => t.id === tab).component

  useDietNotifications()

  useEffect(() => {
    function handler() { setTab('dashboard') }
    window.addEventListener('nutri-navigate', handler)
    return () => window.removeEventListener('nutri-navigate', handler)
  }, [])

  return (
    <div className="min-h-svh flex flex-col bg-zinc-950">
      <main className="flex-1 overflow-y-auto pb-nav">
        <ActiveView />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex"
        style={{ paddingBottom: 'var(--safe-bottom)' }}
      >
        <div className="flex w-full bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800/50">
          <div className="flex flex-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-all"
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${tab === id ? 'text-emerald-400' : 'text-zinc-500'}`}
                  strokeWidth={tab === id ? 2.5 : 1.8}
                />
                <span className={`text-[10px] font-medium tracking-wide transition-colors ${tab === id ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-3 text-zinc-600 active:text-zinc-400 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>
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
