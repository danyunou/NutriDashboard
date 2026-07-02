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

export function useAlimentosPorGrupo(grupoNombre) {
  const [alimentos, setAlimentos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!grupoNombre) return
    setLoading(true)

    supabase
      .from('grupos_alimentos')
      .select('id')
      .eq('nombre', grupoNombre)
      .single()
      .then(({ data: grupo }) => {
        if (!grupo) { setLoading(false); return }
        supabase
          .from('alimentos')
          .select('id, nombre, porcion_texto, porcion_gramos')
          .eq('grupo_id', grupo.id)
          .order('nombre')
          .then(({ data }) => {
            setAlimentos(data ?? [])
            setLoading(false)
          })
      })
  }, [grupoNombre])

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

export function useTrackerSemanal() {
  const [completadosSet, setCompletadosSet] = useState(new Set())
  const [momentos, setMomentos] = useState([])
  const [weekDates, setWeekDates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date()
    const jsDay = today.getDay()
    const monOffset = jsDay === 0 ? -6 : 1 - jsDay
    const mon = new Date(today)
    mon.setDate(today.getDate() + monOffset)
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon)
      d.setDate(mon.getDate() + i)
      return d.toLocaleDateString('en-CA')
    })
    setWeekDates(dates)

    Promise.all([
      supabase.from('completed_meals').select('date, momento_id').in('date', dates),
      supabase.from('momentos_dia').select('id, nombre, hora').order('hora'),
    ]).then(([{ data: completados }, { data: moms }]) => {
      setCompletadosSet(new Set((completados ?? []).map(c => `${c.date}_${c.momento_id}`)))
      setMomentos(moms ?? [])
      setLoading(false)
    })
  }, [])

  return { completadosSet, momentos, weekDates, loading }
}

export function useRecetasPorMomento(momentoId) {
  const [recetas, setRecetas] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!momentoId) return
    setLoading(true)
    supabase
      .from('recetas')
      .select('id, nombre, notas, dia_semana')
      .eq('momento_id', momentoId)
      .order('dia_semana')
      .then(({ data }) => {
        setRecetas(data ?? [])
        setLoading(false)
      })
  }, [momentoId])

  return { recetas, loading }
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
