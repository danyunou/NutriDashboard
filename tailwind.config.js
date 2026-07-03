/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        verduras:    '#22c55e',
        frutas:      '#f97316',
        cereales:    '#eab308',
        leguminosas: '#8b5cf6',
        proteinas:   '#ef4444',
        leche:       '#3b82f6',
        grasas:      '#a16207',
      },
      keyframes: {
        checkPop: {
          '0%':   { transform: 'scale(1)' },
          '35%':  { transform: 'scale(1.4)' },
          '65%':  { transform: 'scale(0.85)' },
          '100%': { transform: 'scale(1)' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0.4)', opacity: '0' },
          '55%':  { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-110%)', opacity: '0' },
          '12%':  { transform: 'translateY(0)',     opacity: '1' },
          '78%':  { transform: 'translateY(0)',     opacity: '1' },
          '100%': { transform: 'translateY(-110%)', opacity: '0' },
        },
        confettiFall: {
          '0%':   { transform: 'translateY(-10px) rotate(0deg)',    opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(600deg)',  opacity: '0' },
        },
      },
      animation: {
        'check-pop':      'checkPop 0.4s cubic-bezier(0.36,0.07,0.19,0.97)',
        'bounce-in':      'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        'slide-down':     'slideDown 2.8s ease-in-out forwards',
        'confetti-fall':  'confettiFall var(--fall-dur,2s) ease-in forwards',
      },
    },
  },
  plugins: [],
}

