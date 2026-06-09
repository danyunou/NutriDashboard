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
    },
  },
  plugins: [],
}

