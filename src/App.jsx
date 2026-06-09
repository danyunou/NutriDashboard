import { useState } from 'react'
import { DashboardDiario } from './components/dashboard/DashboardDiario'
import { ListaCompras } from './components/shopping/ListaCompras'
import { LayoutDashboard, ShoppingCart } from 'lucide-react'

const TABS = [
  { id: 'dashboard', label: 'Plan',    icon: LayoutDashboard, component: DashboardDiario },
  { id: 'compras',   label: 'Compras', icon: ShoppingCart,    component: ListaCompras },
]

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const ActiveView = TABS.find(t => t.id === tab).component

  return (
    <div className="min-h-svh flex flex-col">
      <main className="flex-1 overflow-y-auto pb-20">
        <ActiveView />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex bg-gray-900/95 backdrop-blur border-t border-gray-800">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors
              ${tab === id ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
