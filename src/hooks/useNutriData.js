import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useMomentosConRecetas(diaSemana) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!diaSemana) return
    setLoading(true)

    async function fetchData() {
      const { data: momentos, error: err } = await supabase
        .from('momentos_dia')
        .select(`
          id, nombre, hora,
          distribucion_diaria ( verduras, frutas, cereales, leguminosas, proteinas, leche, grasas ),
          recetas ( id, nombre, notas, dia_semana )
        `)
        .order('hora', { ascending: true })

      if (err) { setError(err); setLoading(false); return }

      const filtrados = momentos.map(m => ({
        ...m,
        recetas: m.recetas.filter(r => r.dia_semana === diaSemana),
      }))

      setData(filtrados)
      setLoading(false)
    }

    fetchData()
  }, [diaSemana])

  return { data, loading, error }
}

export function useAlimentosPorGrupo(grupoId) {
  const [alimentos, setAlimentos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!grupoId) return
    setLoading(true)

    supabase
      .from('alimentos')
      .select('id, nombre, porcion_texto, porcion_gramos')
      .eq('grupo_id', grupoId)
      .order('nombre')
      .then(({ data }) => {
        setAlimentos(data ?? [])
        setLoading(false)
      })
  }, [grupoId])

  return { alimentos, loading }
}

export function useIngredientesReceta(recetaId) {
  const [ingredientes, setIngredientes] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!recetaId) return
    setLoading(true)

    supabase
      .from('v_receta_ingredientes')
      .select('*')
      .eq('receta_id', recetaId)
      .then(({ data }) => {
        setIngredientes(data ?? [])
        setLoading(false)
      })
  }, [recetaId])

  return { ingredientes, loading }
}

export function useSubstitutions(dayStr) {
  const [substitutions, setSubstitutions] = useState({})

  useEffect(() => {
    if (!dayStr) return
    setSubstitutions({})
    supabase
      .from('user_substitutions')
      .select(`
        momento_id, original_ingredient_id, substitute_ingredient_id,
        substitute:alimentos!substitute_ingredient_id(id, nombre, porcion_gramos, porcion_texto)
      `)
      .eq('day', dayStr)
      .then(({ data }) => {
        const map = {}
        for (const sub of (data ?? [])) {
          const key = `${sub.momento_id}_${sub.original_ingredient_id}`
          map[key] = { substitute_ingredient_id: sub.substitute_ingredient_id, substitute: sub.substitute }
        }
        setSubstitutions(map)
      })
  }, [dayStr])

  return { substitutions, setSubstitutions }
}

export function useCompletedMeals() {
  const [completedMeals, setCompletedMeals] = useState(new Set())
  const today = new Date().toLocaleDateString('en-CA')

  useEffect(() => {
    supabase
      .from('completed_meals')
      .select('momento_id')
      .eq('date', today)
      .then(({ data }) => {
        setCompletedMeals(new Set((data ?? []).map(r => r.momento_id)))
      })
  }, [])

  async function toggleComplete(momentoId) {
    if (completedMeals.has(momentoId)) {
      await supabase.from('completed_meals').delete().eq('date', today).eq('momento_id', momentoId)
      setCompletedMeals(prev => { const s = new Set(prev); s.delete(momentoId); return s })
    } else {
      await supabase.from('completed_meals').insert({ date: today, momento_id: momentoId })
      setCompletedMeals(prev => new Set([...prev, momentoId]))
    }
  }

  return { completedMeals, toggleComplete }
}
