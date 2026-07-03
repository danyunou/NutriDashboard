function ctx() {
  return new (window.AudioContext || window.webkitAudioContext)()
}

export function playMealSound() {
  try {
    const ac = ctx()
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(520, ac.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, ac.currentTime + 0.08)
    gain.gain.setValueAtTime(0.18, ac.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.28)
    osc.start(ac.currentTime)
    osc.stop(ac.currentTime + 0.28)
  } catch {}
}

export function playDayCompleteSound() {
  try {
    const ac = ctx()
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.connect(gain)
      gain.connect(ac.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = ac.currentTime + i * 0.13
      gain.gain.setValueAtTime(0.22, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45)
      osc.start(t)
      osc.stop(t + 0.45)
    })
  } catch {}
}

const MEAL_MSGS = [
  '¡Bien hecho! 💚',
  '¡Así se hace! 🌱',
  '¡Un paso más! 👊',
  '¡Sigue así! ⚡',
  '¡Constancia! 💪',
  '¡Tú puedes! 🔥',
  '¡Excelente! ✨',
]

export function randomMealMsg() {
  return MEAL_MSGS[Math.floor(Math.random() * MEAL_MSGS.length)]
}
