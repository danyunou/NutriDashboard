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
