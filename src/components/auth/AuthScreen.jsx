import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess('Revisa tu correo para confirmar tu cuenta.')
    }

    setLoading(false)
  }

  function switchMode() {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-2">NutriDashboard</p>
          <h1 className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {mode === 'login' ? 'Ingresa para ver tu plan' : 'Empieza a seguir tu plan'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full bg-zinc-900 text-zinc-100 placeholder-zinc-600 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500/50 transition-shadow"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="w-full bg-zinc-900 text-zinc-100 placeholder-zinc-600 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500/50 transition-shadow"
          />

          {error && <p className="text-xs text-red-400 px-1">{error}</p>}
          {success && <p className="text-xs text-emerald-400 px-1">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white font-semibold rounded-2xl py-3.5 text-sm transition-all active:bg-emerald-600 disabled:opacity-50 mt-1"
          >
            {loading ? 'Cargando…' : mode === 'login' ? 'Entrar' : 'Registrarse'}
          </button>
        </form>

        <button
          onClick={switchMode}
          className="w-full mt-5 text-sm text-zinc-500 active:text-zinc-300 transition-colors"
        >
          {mode === 'login'
            ? '¿No tienes cuenta? Regístrate'
            : '¿Ya tienes cuenta? Entra'}
        </button>
      </div>
    </div>
  )
}
