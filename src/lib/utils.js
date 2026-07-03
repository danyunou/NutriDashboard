import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export const GRUPO_COLORS = {
  Verduras:    'bg-green-500/20 text-green-400 border-green-500/30',
  Frutas:      'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Cereales:    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Leguminosas: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  Proteínas:   'bg-red-500/20 text-red-400 border-red-500/30',
  Leche:       'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Grasas:      'bg-amber-700/20 text-amber-400 border-amber-700/30',
}

export function calcularGramos(porcionGramos, porciones) {
  return Math.round(porcionGramos * porciones * 10) / 10
}

export function getDiaActual() {
  const jsDay = new Date().getDay()  // 0=Dom, 1=Lun…
  return jsDay === 0 ? 7 : jsDay     // 1=Lun … 7=Dom
}

// Returns the YYYY-MM-DD date of the given diaSemana (1=Lun…7=Dom) within the current week
export function getDateForDia(diaSemana) {
  const today = new Date()
  const jsDay = today.getDay()
  const todayMonBased = jsDay === 0 ? 6 : jsDay - 1
  const targetMonBased = diaSemana - 1
  const d = new Date(today)
  d.setDate(today.getDate() + (targetMonBased - todayMonBased))
  return d.toLocaleDateString('en-CA')
}
